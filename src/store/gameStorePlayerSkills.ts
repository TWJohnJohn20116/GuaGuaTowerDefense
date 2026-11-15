// 玩家主動技能系統：10 個可釋放技能（雷霆風暴 / 時間凍結 / 金幣雨 / 狂戰激勵 / 隕石風暴 / 閃電鏈 / 聖光治療 / 聖盾結界 / 傳送陷阱）
import type { GameStore, PlayerSkillState, PlayerSkillAnimation } from './gameStoreTypes';
import type { PlayerSkillId } from '@/data/playerSkillData';
import {
  PLAYER_SKILLS,
  PLAYER_SKILL_BY_ID,
  CASH_RAIN_AMOUNT,
  LIGHTNING_DAMAGE,
  METEOR_DAMAGE,
  METEOR_BURN_DPS,
  METEOR_BURN_DURATION,
  CHAIN_LIGHTNING_DAMAGE,
  CHAIN_LIGHTNING_MAX_JUMPS,
  CHAIN_LIGHTNING_FALLOFF,
  CHAIN_LIGHTNING_STUN_DURATION,
  CHAIN_LIGHTNING_JUMP_RANGE,
  HOLY_HEAL_AMOUNT,
  HOLY_HEAL_PURGE_BUFFS,
  AEGIS_SLOW_VALUE,
  AEGIS_SLOW_DURATION,
  WARP_TRAP_MAX_TARGETS,
  WARP_TRAP_DISTANCE,
  WARP_TRAP_BOSS_DIST_MULT,
  WARP_TRAP_STUN_DURATION,
  EMP_PULSE_DAMAGE,
} from '@/data/playerSkillData';
import { GAME_CONSTANTS, PATHS } from '@/data/gameData';
import { getEnemyData, isEnemyPhased } from './gameStoreUtils';
import { useShopStore } from './shopStore';
import { playSkill } from '@/services/audioService';
import { applyEmpPulse } from '@/utils/empPulse';
import {
  warpBackOnWaypoints,
  warpBackOnSegments,
  getApproachKey,
  isAdvancedPath,
} from './playerSkillWarp';

type GetState = () => GameStore;
type SetState = (
  partial: Partial<GameStore> | ((state: GameStore) => Partial<GameStore>),
) => void;

const generateId = () => Math.random().toString(36).substring(2, 9);

// 預設技能狀態（全部技能初始 = 0）
export const createInitialPlayerSkillStates = (): Record<PlayerSkillId, PlayerSkillState> =>
  PLAYER_SKILLS.reduce(
    (acc, s) => ({ ...acc, [s.id]: { lastUsedTime: 0, activeUntil: 0 } }),
    {} as Record<PlayerSkillId, PlayerSkillState>,
  );

export const createPlayerSkillActions = (get: GetState, set: SetState) => ({
  // 檢查技能是否冷卻完成
  isPlayerSkillReady: (skillId: PlayerSkillId): boolean => {
    const { playerSkillStates } = get();
    const state = playerSkillStates[skillId];
    const skill = PLAYER_SKILL_BY_ID[skillId];
    if (!state || !skill) return false;
    if (state.lastUsedTime === 0) return true;
    return Date.now() - state.lastUsedTime >= skill.cooldown;
  },

  // 檢查技能是否在持續期內生效中
  isPlayerSkillActive: (skillId: PlayerSkillId): boolean => {
    const { playerSkillStates } = get();
    const state = playerSkillStates[skillId];
    if (!state) return false;
    return state.activeUntil > Date.now();
  },

  // 取得剩餘冷卻 ms
  getPlayerSkillCooldownRemaining: (skillId: PlayerSkillId): number => {
    const { playerSkillStates } = get();
    const state = playerSkillStates[skillId];
    const skill = PLAYER_SKILL_BY_ID[skillId];
    if (!state || !skill) return 0;
    if (state.lastUsedTime === 0) return 0;
    const elapsed = Date.now() - state.lastUsedTime;
    if (elapsed >= skill.cooldown) return 0;
    return skill.cooldown - elapsed;
  },

  // 釋放技能
  activatePlayerSkill: (skillId: PlayerSkillId): boolean => {
    const state = get();
    const { playerSkillStates, isPlaying, isPaused, isGameOver, isVictory } = state;
    if (!isPlaying || isPaused || isGameOver || isVictory) return false;

    // 檢查商店中是否已購買解鎖
    if (!useShopStore.getState().isPlayerSkillUnlocked(skillId)) return false;

    const skill = PLAYER_SKILL_BY_ID[skillId];
    if (!skill) return false;

    const skState = playerSkillStates[skillId];
    if (skState.lastUsedTime !== 0 && Date.now() - skState.lastUsedTime < skill.cooldown) {
      return false;
    }

    // 追蹤成就：主動技能使用次數（skills_used 成就依賴此統計）
    import('./achievementStore').then((m) => m.useAchievementStore.getState().onSkillUsed());

    playSkill(); // 技能釋放音

    const now = Date.now();
    const activeUntil = skill.duration ? now + skill.duration : 0;

    const newStates: Record<PlayerSkillId, PlayerSkillState> = {
      ...playerSkillStates,
      [skillId]: { lastUsedTime: now, activeUntil },
    };

    const newAnim: PlayerSkillAnimation = {
      id: generateId(),
      skillId,
      startTime: now,
      duration: skill.duration && skill.duration > 0 ? skill.duration : 1500,
    };

    // 計算各技能立即生效的影響
    if (skill.effectKey === 'lightning') {
      // 雷霆風暴：對所有敵人造成傷害並眩暈 1 秒
      const stunDuration = 1000;
      const updatedEnemies = state.enemies.map((e) => {
        if (e.health <= 0) return e;
        // 相位中的幽靈完全免疫傷害
        if (isEnemyPhased(e, now)) return e;
        const newHp = Math.max(0, e.health - LIGHTNING_DAMAGE);
        const newEffects = [...e.effects];
        const stunIdx = newEffects.findIndex((ef) => ef.type === 'stun');
        if (stunIdx >= 0) {
          newEffects[stunIdx] = {
            ...newEffects[stunIdx],
            startTime: now,
            duration: stunDuration,
          };
        } else {
          newEffects.push({
            type: 'stun',
            duration: stunDuration,
            startTime: now,
            value: 1,
          });
        }
        return { ...e, health: newHp, effects: newEffects };
      });
      set({
        enemies: updatedEnemies,
        playerSkillStates: newStates,
        playerSkillAnimations: [...state.playerSkillAnimations, newAnim],
      });
      // 飄字 + 震動
      state.addShake(3);
    } else if (skill.effectKey === 'freeze') {
      // 時間凍結：所有敵人加上 freeze 狀態 5 秒
      const freezeDuration = skill.duration || 5000;
      const updatedEnemies = state.enemies.map((e) => {
        if (e.health <= 0) return e;
        const newEffects = [...e.effects];
        const idx = newEffects.findIndex((ef) => ef.type === 'freeze');
        if (idx >= 0) {
          newEffects[idx] = { ...newEffects[idx], startTime: now, duration: freezeDuration };
        } else {
          newEffects.push({ type: 'freeze', duration: freezeDuration, startTime: now, value: 1 });
        }
        return { ...e, effects: newEffects };
      });
      set({
        enemies: updatedEnemies,
        playerSkillStates: newStates,
        playerSkillAnimations: [...state.playerSkillAnimations, newAnim],
      });
    } else if (skill.effectKey === 'cash') {
      // 金幣雨：立即獲得金幣
      set({
        money: state.money + CASH_RAIN_AMOUNT,
        playerSkillStates: newStates,
        playerSkillAnimations: [...state.playerSkillAnimations, newAnim],
      });
      // 浮動金錢文字（畫面中央位置）
      get().addMoneyText(7, 4, CASH_RAIN_AMOUNT, true);
    } else if (skill.effectKey === 'inspire') {
      // 狂戰激勵：所有塔攻擊速度提升 2x（在 updateTowers 讀取狀態套用）
      set({
        playerSkillStates: newStates,
        playerSkillAnimations: [...state.playerSkillAnimations, newAnim],
      });
    } else if (skill.effectKey === 'meteor') {
      // 隕石風暴：對所有敵人造成立即傷害並施加灼燒 DoT
      const updatedEnemies = state.enemies.map((e) => {
        if (e.health <= 0) return e;
        // 相位中的幽靈完全免疫傷害
        if (isEnemyPhased(e, now)) return e;
        const newHp = Math.max(0, e.health - METEOR_DAMAGE);
        const newEffects = [...e.effects];
        const burnIdx = newEffects.findIndex((ef) => ef.type === 'burn');
        if (burnIdx >= 0) {
          newEffects[burnIdx] = {
            ...newEffects[burnIdx],
            startTime: now,
            duration: METEOR_BURN_DURATION,
            value: METEOR_BURN_DPS,
          };
        } else {
          newEffects.push({
            type: 'burn',
            duration: METEOR_BURN_DURATION,
            startTime: now,
            value: METEOR_BURN_DPS,
            stacks: 1,
          });
        }
        return { ...e, health: newHp, effects: newEffects };
      });
      set({
        enemies: updatedEnemies,
        playerSkillStates: newStates,
        playerSkillAnimations: [...state.playerSkillAnimations, newAnim],
      });
      state.addShake(5);
    } else if (skill.effectKey === 'chain') {
      // 閃電鏈：鎖定血量最高的敵人，閃電依序彈跳至最近的存活敵人，傷害逐跳遞減
      // 相位中的幽靈不導電（免疫且不可作為彈跳節點）
      const alive = state.enemies.filter((e) => e.health > 0 && !isEnemyPhased(e, now));
      if (alive.length === 0) {
        set({
          playerSkillStates: newStates,
          playerSkillAnimations: [...state.playerSkillAnimations, newAnim],
        });
      } else {
        // 起點 = 血量最高者（通常為首領 / 精英）
        let start = alive[0];
        for (const e of alive) {
          if (e.health > start.health) start = e;
        }

        // 貪心串接最近鄰居，形成彈跳鏈
        const chainOrder: typeof alive = [start];
        const visited = new Set<string>([start.id]);
        let current = start;
        for (let jump = 1; jump < CHAIN_LIGHTNING_MAX_JUMPS; jump++) {
          let next: typeof start | null = null;
          let nextDist = Infinity;
          for (const e of alive) {
            if (visited.has(e.id)) continue;
            const dx = e.x - current.x;
            const dy = e.y - current.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d <= CHAIN_LIGHTNING_JUMP_RANGE && d < nextDist) {
              nextDist = d;
              next = e;
            }
          }
          if (!next) break;
          visited.add(next.id);
          chainOrder.push(next);
          current = next;
        }

        // 逐跳遞減傷害
        const damageById = new Map<string, number>();
        chainOrder.forEach((e, idx) => {
          damageById.set(e.id, Math.round(CHAIN_LIGHTNING_DAMAGE * Math.pow(CHAIN_LIGHTNING_FALLOFF, idx)));
        });

        const updatedEnemies = state.enemies.map((e) => {
          const dmg = damageById.get(e.id);
          if (dmg == null || e.health <= 0) return e;
          const newHp = Math.max(0, e.health - dmg);
          const newEffects = [...e.effects];
          const stunIdx = newEffects.findIndex((ef) => ef.type === 'stun');
          if (stunIdx >= 0) {
            newEffects[stunIdx] = { ...newEffects[stunIdx], startTime: now, duration: CHAIN_LIGHTNING_STUN_DURATION };
          } else {
            newEffects.push({ type: 'stun', duration: CHAIN_LIGHTNING_STUN_DURATION, startTime: now, value: 1 });
          }
          return { ...e, health: newHp, effects: newEffects };
        });

        set({
          enemies: updatedEnemies,
          playerSkillStates: newStates,
          playerSkillAnimations: [
            ...state.playerSkillAnimations,
            { ...newAnim, chainPath: chainOrder.map((e) => ({ x: e.x, y: e.y })) },
          ],
        });
        state.addShake(4);
      }
    } else if (skill.effectKey === 'heal') {
      // 聖光治療：恢復基地生命（封頂於初始滿血值）並淨化全場敵人的增益狀態
      const maxHp = state.difficultyModifiers.startingHealth || GAME_CONSTANTS.INITIAL_HEALTH;
      const healedHp = Math.min(maxHp, state.health + HOLY_HEAL_AMOUNT);
      const actualHeal = healedHp - state.health;
      const purge = new Set<string>(HOLY_HEAL_PURGE_BUFFS);
      const updatedEnemies = state.enemies.map((e) => {
        if (e.health <= 0) return e;
        if (!e.effects.some((ef) => purge.has(ef.type))) return e;
        return { ...e, effects: e.effects.filter((ef) => !purge.has(ef.type)) };
      });
      set({
        health: healedHp,
        enemies: updatedEnemies,
        playerSkillStates: newStates,
        playerSkillAnimations: [...state.playerSkillAnimations, newAnim],
      });
      // 綠色治療飄字（畫面中央）
      if (actualHeal > 0) state.addDamageText(7, 4, actualHeal, false, '#34d399');
    } else if (skill.effectKey === 'aegis') {
      // 聖盾結界：免疫效果由 takeDamage 讀取 activeUntil 套用；展開瞬間衝擊波減速全場敵人
      const updatedEnemies = state.enemies.map((e) => {
        if (e.health <= 0) return e;
        const newEffects = [...e.effects];
        const slowIdx = newEffects.findIndex((ef) => ef.type === 'slow');
        if (slowIdx >= 0) {
          newEffects[slowIdx] = {
            ...newEffects[slowIdx],
            startTime: now,
            duration: AEGIS_SLOW_DURATION,
            value: Math.min(newEffects[slowIdx].value ?? AEGIS_SLOW_VALUE, AEGIS_SLOW_VALUE),
          };
        } else {
          newEffects.push({
            type: 'slow',
            duration: AEGIS_SLOW_DURATION,
            startTime: now,
            value: AEGIS_SLOW_VALUE,
          });
        }
        return { ...e, effects: newEffects };
      });
      set({
        enemies: updatedEnemies,
        playerSkillStates: newStates,
        playerSkillAnimations: [...state.playerSkillAnimations, newAnim],
      });
      state.addShake(2);
    } else if (skill.effectKey === 'warp') {
      // 傳送陷阱：把最逼近基地的敵人沿路徑回溯傳送並暈眩（首領類距離減半）
      const path = PATHS[state.selectedPath];
      const advanced = path ? isAdvancedPath(path) : false;

      // 排除：已死亡、被風塔吹離路徑者（座標不在路徑上）、
      // 相位中的幽靈（免疫玩家技能）、飛行敵人（直線飛行不走路徑，回溯無意義）
      const candidates = state.enemies.filter(
        (e) =>
          e.health > 0 &&
          !e.isDisplaced &&
          !isEnemyPhased(e, now) &&
          getEnemyData(e.originType ?? e.type).ability !== 'flying',
      );
      if (candidates.length === 0 || !path) {
        set({
          playerSkillStates: newStates,
          playerSkillAnimations: [...state.playerSkillAnimations, newAnim],
        });
      } else {
        // 依逼近基地程度由高到低取前 N 隻
        const targets = [...candidates]
          .sort((a, b) => getApproachKey(b, path) - getApproachKey(a, path))
          .slice(0, WARP_TRAP_MAX_TARGETS);
        const targetIds = new Set(targets.map((e) => e.id));

        const warpJumps: NonNullable<PlayerSkillAnimation['warpJumps']> = [];
        const updatedEnemies = state.enemies.map((e) => {
          if (!targetIds.has(e.id)) return e;
          const isBossLike = e.type === 'boss' || e.type === 'miniboss';
          const dist = WARP_TRAP_DISTANCE * (isBossLike ? WARP_TRAP_BOSS_DIST_MULT : 1);
          const result = advanced
            ? warpBackOnSegments(e, path, dist)
            : warpBackOnWaypoints(e, path, dist);
          if (!result) return e;

          warpJumps.push({ fromX: e.x, fromY: e.y, toX: result.x, toY: result.y });

          // 傳送落地暈眩（覆寫既有 stun 計時）
          const newEffects = [...e.effects];
          const stunIdx = newEffects.findIndex((ef) => ef.type === 'stun');
          if (stunIdx >= 0) {
            newEffects[stunIdx] = { ...newEffects[stunIdx], startTime: now, duration: WARP_TRAP_STUN_DURATION };
          } else {
            newEffects.push({ type: 'stun', duration: WARP_TRAP_STUN_DURATION, startTime: now, value: 1 });
          }

          return {
            ...e,
            x: result.x,
            y: result.y,
            pathIndex: result.pathIndex,
            progress: result.progress,
            ...(advanced
              ? {
                  currentSegmentId: result.currentSegmentId ?? e.currentSegmentId,
                  segmentWaypointIndex: result.segmentWaypointIndex ?? e.segmentWaypointIndex,
                }
              : {}),
            effects: newEffects,
          };
        });

        set({
          enemies: updatedEnemies,
          playerSkillStates: newStates,
          playerSkillAnimations: [...state.playerSkillAnimations, { ...newAnim, warpJumps }],
        });
        state.addShake(3);
      }
    } else if (skill.effectKey === 'emp') {
      const pulsed = applyEmpPulse(
        state.enemies,
        EMP_PULSE_DAMAGE,
        (e) => isEnemyPhased(e, now),
      );
      set({
        enemies: pulsed.enemies,
        playerSkillStates: newStates,
        playerSkillAnimations: [...state.playerSkillAnimations, newAnim],
      });
      state.addShake(3);
    }

    return true;
  },

  // 每幀更新：清理過期動畫；同步 isActive 不需處理（透過 activeUntil 比較時間判斷）
  updatePlayerSkills: () => {
    const { playerSkillAnimations } = get();
    const now = Date.now();
    const filtered = playerSkillAnimations.filter((a) => now - a.startTime < a.duration);
    if (filtered.length !== playerSkillAnimations.length) {
      set({ playerSkillAnimations: filtered });
    }
  },
});
