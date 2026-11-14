// 遊戲迴圈：塔攻擊邏輯（金錢產生、自動升級、瞄準、發射）
import type { Enemy, Projectile, Tower, TowerType } from '@/types/game';
import { GAME_CONSTANTS, ENEMY_DATA } from '@/data/gameData';
import { SKILL_DATA, getSkillFireTargets } from '@/data/skillData';
import { getTowerData, generateProjectileId, isEnemyStealthed, isEnemyPhased, applyDamageToEnemy } from '../gameStoreUtils';
import { getProtocolWaveMods } from '@/data/tacticalProtocolData';
import { getSynergyModsForTower, toTowerRef } from '@/data/towerSynergyData';
import { useTalentStore } from '../talentStore';
import { useStatsStore } from '../statsStore';
import { useTutorialStore, INTERACTIVE_TUTORIAL_STEPS } from '../tutorialStore';
import { buildSpatialHash, forEachInHashRadius, anyInHashRadius, findInHashRadius, type SpatialHash } from '@/utils/spatialHash';
import type { GetState, SetState } from './shared';
import { loopFlags } from './shared';
import { playTowerFire } from '@/services/audioService';
import { applyPulseExposed, applyWindFear, getAntiAirMult, getBurnHuntMult, getExecuteMult, getExposedHuntMult, getFearHuntMult, getToxinHuntMult } from '@/data/combatStatus';
import { collectJammerAurasCached, getTowerJamFireRateMult } from '@/data/jammerAura';
import { pickTowerTarget } from '@/data/towerTargeting';
import { getTowerStatBonus } from '@/data/towerCombatStats';
import { getTowerUpgradeCost } from '@/data/towerUpgradeCost';

/** 平滑轉向：把塔的 rotation 朝目標推近（無目標則維持原值） */
const aimRotation = (tower: Tower, target: Enemy | null, deltaTime: number): number => {
  if (!target) return tower.rotation;
  const dx = target.x - tower.gridPos.col;
  const dy = target.y - tower.gridPos.row;
  const targetRotation = Math.atan2(dy, dx);

  let rotationDiff = targetRotation - tower.rotation;
  while (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2;
  while (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2;
  return tower.rotation + rotationDiff * Math.min(1, deltaTime * 0.03);
};

/**
 * 冷卻期的瞄準目標解析（只為了轉向，不為了開火）
 *
 * 1. 舊目標還在場上、活著、看得見、仍在射程內 → O(1) 直接沿用
 * 2. 否則在空間哈希裡 early-exit 找第一個可用目標（不做優先級比較）
 *
 * 會走到這裡代表這一幀根本開不了火，所以「打誰」不重要，
 * 只要槍口有東西可指就好——這正是省下每幀 24 萬次回調的關鍵。
 */
const resolveAimTarget = (
  previous: Enemy | null,
  enemies: Enemy[],
  idxById: Map<string, number>,
  hash: SpatialHash,
  tcol: number,
  trow: number,
  range: number,
  rangeSq: number,
  now: number,
  revealStealth: boolean | undefined,
): Enemy | null => {
  if (previous) {
    const idx = idxById.get(previous.id);
    if (idx !== undefined) {
      const enemy = enemies[idx];
      if (
        enemy.health > 0 &&
        !isEnemyPhased(enemy, now) &&
        (!isEnemyStealthed(enemy, now) || revealStealth)
      ) {
        const dx = enemy.x - tcol;
        const dy = enemy.y - trow;
        if (dx * dx + dy * dy <= rangeSq) return enemy;
      }
    }
  }

  const found = findInHashRadius(hash, tcol, trow, range, (i) => {
    const enemy = enemies[i];
    if (enemy.health <= 0) return false;
    if (isEnemyPhased(enemy, now)) return false;
    if (isEnemyStealthed(enemy, now) && !revealStealth) return false;
    const dx = enemy.x - tcol;
    const dy = enemy.y - trow;
    return dx * dx + dy * dy <= rangeSq;
  });

  return found >= 0 ? enemies[found] : null;
};

export const createUpdateTowers =
  (get: GetState, set: SetState) =>
  (deltaTime: number) => {
    const { towers, enemies, projectiles, autoUpgradeEnabled, money, playerSkillStates } = get();
    const now = Date.now();
    const talentMods = useTalentStore.getState().getModifiers();
    const talentDamageMult = talentMods.towerDamageMult;
    const talentAttackSpeedMult = talentMods.towerAttackSpeedMult;
    const talentRangeMult = talentMods.towerRangeMult;

    // 主動技能「狂戰激勵」：所有塔攻速 2x
    const inspireActive = playerSkillStates.battleInspire.activeUntil > now;
    const inspireSpeedMult = inspireActive ? 2 : 1;
    const protocolMods = getProtocolWaveMods(get().activeProtocol);
    const synergyRefs = towers.map(toTowerRef);

    // 錢塔產生金幣邏輯
    let moneyGained = 0;
    const moneyTowerUpdates: Record<string, number> = {};

    // 突變挑戰：停用被動收入時，money 塔不再產金
    if (!get().mutatorRules?.interestDisabled) {
      towers.forEach(tower => {
        const towerData = getTowerData(tower.type);
        if (towerData?.moneyGeneration && towerData.moneyPerSecond) {
          // deltaTime 單位為毫秒；每級增加 20%
          const synergyMods = getSynergyModsForTower(toTowerRef(tower), synergyRefs);
          const baseIncome = towerData.moneyPerSecond * (1 + (tower.level - 1) * 0.2) * synergyMods.incomeMult * protocolMods.incomeMult;
          const income = baseIncome * (deltaTime / 1000);
          moneyGained += income;
          moneyTowerUpdates[tower.id] = income;
        }
      });
    }

    if (moneyGained > 0) {
      const currentMoney = get().money;
      const newMoney = currentMoney + moneyGained;
      set({
        money: Math.floor(newMoney * 100) / 100, // 保留兩位小數
        towers: towers.map(t =>
          moneyTowerUpdates[t.id] !== undefined
            ? { ...t, moneyGenerated: (t.moneyGenerated || 0) + moneyTowerUpdates[t.id] }
            : t
        )
      });
    }

    // 自動升級邏輯
    if (autoUpgradeEnabled) {
      const maxLevel = GAME_CONSTANTS.MAX_TOWER_LEVEL;
      for (const tower of towers) {
        if (tower.level >= 2 && tower.level < maxLevel && tower.upgradePath) {
          const towerData = getTowerData(tower.type);
          if (towerData) {
            const upgradeCost = getTowerUpgradeCost(towerData.cost, tower.level);
            if (money >= upgradeCost) {
              get().upgradeTower(tower, tower.upgradePath);
              break; // 每幀只升級一座塔
            }
          }
        }
      }
    }

    let updatedEnemies = [...enemies];
    let newProjectiles = [...projectiles];
    let hasNewProjectilesThisFrame = false;

    // Spatial Hash：把所有敵人按格子分桶，後續 tower / pulse 查詢免遍歷全 enemies
    const enemyHash = buildSpatialHash(updatedEnemies);
    const jammerAuras = collectJammerAurasCached(updatedEnemies, ENEMY_DATA, now);

    // 預建 id -> index 表，供火焰塔等 O(1) 定位目標（map 過程僅替換索引不 splice，索引保持有效）
    const enemyIdxById = new Map<string, number>();
    for (let i = 0; i < updatedEnemies.length; i++) {
      enemyIdxById.set(updatedEnemies[i].id, i);
    }

    // 檢查是否有敵人進入任何塔射程（用於教學降速等）
    if (enemies.length > 0) {
      for (let ti = 0; ti < towers.length; ti++) {
        const tower = towers[ti];
        const towerData = getTowerData(tower.type);
        if (!towerData) continue;
        const synergyMods = getSynergyModsForTower(toTowerRef(tower), synergyRefs);
        const range = towerData.range * getTowerStatBonus(tower).rangeMultiplier * talentRangeMult * protocolMods.rangeMult * synergyMods.rangeMult;
        const rangeSq = range * range;
        const tcol = tower.gridPos.col;
        const trow = tower.gridPos.row;

        const found = anyInHashRadius(enemyHash, tcol, trow, range, (ei) => {
          const enemy = updatedEnemies[ei];
          const dx = tcol - enemy.x;
          const dy = trow - enemy.y;
          return dx * dx + dy * dy <= rangeSq;
        });
        if (found) {
          loopFlags.enemyInRange = true;
          break;
        }
      }
    }

    const updatedTowers = towers.map(tower => {
      const towerData = getTowerData(tower.type);
      if (!towerData) return tower;

      const synergyMods = getSynergyModsForTower(toTowerRef(tower), synergyRefs);
      const statBonus = getTowerStatBonus(tower);
      let fireRate = (towerData.fireRate || 1) * statBonus.fireRateMultiplier * talentAttackSpeedMult * inspireSpeedMult * protocolMods.fireRateMult * synergyMods.fireRateMult;
      fireRate *= getTowerJamFireRateMult(tower.gridPos.col, tower.gridPos.row, jammerAuras);
      let skillDamageMultiplier = 1;
      let skillChainMultiplier = 1;

      if (tower.skill && tower.skill.isActive) {
        const skillData = SKILL_DATA[tower.skill.skillId];
        if (skillData) {
          if (skillData.id === 'overcharge') {
            fireRate *= skillData.effectMultiplier || 3;
          } else if (skillData.id === 'precision' || skillData.id === 'sniper_focus') {
            skillDamageMultiplier = skillData.effectMultiplier || 3;
          } else if (skillData.id === 'chain_surge') {
            skillChainMultiplier = skillData.effectMultiplier || 2;
          }
        }
      }

      const cooldown = 1000 / fireRate;

      const range = towerData.range * statBonus.rangeMultiplier * talentRangeMult * protocolMods.rangeMult * synergyMods.rangeMult;
      const rangeSq = range * range;
      const tcol = tower.gridPos.col;
      const trow = tower.gridPos.row;

      // 火焰塔是「每幀持續輸出」，不受 cooldown 限制，必須走完整流程（見下方 flameEffect 分支）
      const isContinuousBeam = Boolean(towerData.flameEffect && towerData.damagePerSecond);

      // ── 冷卻中快路徑 ──────────────────────────────────────────────
      // 這一幀開不了火，就不需要「依優先級挑出最佳目標」，只要維持槍口朝向。
      // 舊做法不分冷卻與否都掃一次射程內全部敵人、塞進陣列再逐一比較；
      // 壓測場景（4,530 敵人 × 101 塔、CELL_SIZE=2）等於每幀約 24 萬次無用回調，
      // 而其中約 94% 的幀本來就開不了火。
      if (!isContinuousBeam && now - tower.lastFireTime < cooldown) {
        const aim = resolveAimTarget(
          tower.target, updatedEnemies, enemyIdxById, enemyHash,
          tcol, trow, range, rangeSq, now, protocolMods.revealStealth,
        );
        return { ...tower, rotation: aimRotation(tower, aim, deltaTime), target: aim };
      }

      const enemiesInRange: Enemy[] = [];
      forEachInHashRadius(enemyHash, tcol, trow, range, (i) => {
        const enemy = updatedEnemies[i];
        if (enemy.health <= 0) return;
        // 隱身敵人無法被鎖定為主目標（濺射波及與既有 DoT 不受影響）
        if (isEnemyStealthed(enemy, now) && !protocolMods.revealStealth) return;
        // 相位中的幽靈無法鎖定（且免疫所有傷害，鎖定只會浪費彈藥）
        if (isEnemyPhased(enemy, now)) return;
        const dx = enemy.x - tcol;
        const dy = enemy.y - trow;
        if (dx * dx + dy * dy <= rangeSq) {
          enemiesInRange.push(enemy);
        }
      });

      // 根據優先級找最佳目標（標記永遠優先；威脅鎖定干擾／治療等）
      const target = pickTowerTarget(
        enemiesInRange,
        tower.targetPriority,
        tcol,
        trow,
        ENEMY_DATA,
        now,
      );

      // 平滑旋轉瞄準目標
      const newRotation = aimRotation(tower, target, deltaTime);

      // 脈衝塔：定時爆發，對範圍內所有敵人造成傷害（不發射子彈）
      if (towerData.pulseEffect) {
        // 用本塔範圍內是否有敵人判定，避免其它塔有目標時本塔空放（浪費冷卻＋全屏震動）
        // 隱身敵人不可鎖定（不在 enemiesInRange）但脈衝 AOE 仍可命中 → 單獨檢查範圍內任何存活敵人
        let hasPulseTarget = enemiesInRange.length > 0;
        if (!hasPulseTarget) {
          forEachInHashRadius(enemyHash, tcol, trow, range, (i) => {
            if (hasPulseTarget) return;
            const e = updatedEnemies[i];
            if (e.health <= 0) return;
            // 相位中的幽靈免疫 AOE，不能作為脈衝觸發目標（隱身可以）
            if (isEnemyPhased(e, now)) return;
            const dx = e.x - tcol;
            const dy = e.y - trow;
            if (dx * dx + dy * dy <= rangeSq) hasPulseTarget = true;
          });
        }
        if (now - tower.lastFireTime < cooldown || !hasPulseTarget) {
          return { ...tower, rotation: newRotation, target: target || null };
        }

        const rawDamage = towerData.damage || 0;
        const baseDamage = rawDamage * statBonus.damageMultiplier * talentDamageMult * skillDamageMultiplier * synergyMods.damageMult * protocolMods.damageMult;
        const totalCritChance = Math.min(1, (towerData.critChance || 0) + talentMods.criticalChance + protocolMods.critChanceAdd);
        const isCrit = totalCritChance > 0 && Math.random() < totalCritChance;
        const critMult = (towerData.critMultiplier || 2.0) + (talentMods.criticalDamage - 1);
        const finalDamage = isCrit ? baseDamage * critMult : baseDamage;

        let totalPulseDamage = 0;
        let killsInThisPulse = 0;
        const rangeSqPulse = range * range;
        const pcol = tower.gridPos.col;
        const prow = tower.gridPos.row;

        const { addDamageText, addImpactParticles } = get();
        forEachInHashRadius(enemyHash, pcol, prow, range, (i) => {
          const e = updatedEnemies[i];
          if (e.health <= 0) return;
          // 相位中的幽靈免疫脈衝 AOE
          if (isEnemyPhased(e, now)) return;

          const dx = e.x - pcol;
          const dy = e.y - prow;
          const distSq = dx * dx + dy * dy;
          if (distSq <= rangeSqPulse) {
            const bossMult = (e.type === 'boss' || e.type === 'miniboss') ? talentMods.bossDamageMult : 1;
            const out = applyDamageToEnemy(e, finalDamage * bossMult * getExposedHuntMult(tower.type, e.effects, now) * getAntiAirMult(tower.type, e.type) * getFearHuntMult(tower.type, e.effects, now), now);
            const oldHealth = e.health;
            totalPulseDamage += out.dealt;
            if (oldHealth > 0 && out.health <= 0) killsInThisPulse++;

            addDamageText(e.x, e.y, out.dealt, isCrit, towerData.color);
            addImpactParticles(e.x, e.y, towerData.color, isCrit ? 12 : 6);

            const pulseEffects = [...e.effects];
            applyPulseExposed(pulseEffects, tower.type, now);
            applyWindFear(pulseEffects, tower.type, now);
            updatedEnemies[i] = { ...e, health: out.health, shield: out.shield, effects: pulseEffects };
          }
        });

        get().addShake(1.5);
        playTowerFire(tower.type); // 脈衝爆發：每次觸發播放一次（自帶節流）

        // 上報統計系統（與投射物塔保持一致，否則統計頁與成就會漏算脈衝塔）
        if (totalPulseDamage > 0) {
          const statsStore = useStatsStore.getState();
          statsStore.trackTowerDamage(tower.id, totalPulseDamage);
          for (let k = 0; k < killsInThisPulse; k++) {
            statsStore.trackTowerKill(tower.id);
          }
        }

        return {
          ...tower,
          rotation: newRotation,
          target,
          lastFireTime: now,
          lastAttackTime: now,
          totalDamage: tower.totalDamage + totalPulseDamage,
          kills: tower.kills + killsInThisPulse,
        };
      }

      // 火焰塔：持續噴射傷害（不發射子彈）+ 施加燃燒效果
      if (towerData.flameEffect && towerData.damagePerSecond && target) {
        const dps = towerData.damagePerSecond * statBonus.damageMultiplier * talentDamageMult * synergyMods.damageMult * protocolMods.damageMult;
        const flameDamage = dps * (deltaTime / 1000);
        const burnDps = dps * 0.3;
        const burnDuration = 3000;

        // 透過預建索引表 O(1) 定位 target 索引
        const tgtIdx = enemyIdxById.get(target.id) ?? -1;
        let killedThisFrame = false;
        if (tgtIdx >= 0) {
          const e = updatedEnemies[tgtIdx];
          if (e.health > 0) {
            // 火焰為持續灼燒，不吃裝甲減傷（圖鑑：火焰剋裝甲）；護盾照常吸收、相位免疫
            const maxHp = e.maxHealth ?? 0;
            const healthRatio = maxHp > 0 ? e.health / maxHp : 1;
            const out = applyDamageToEnemy(
              e,
              flameDamage * getBurnHuntMult(tower.type, e.effects, now) * getExecuteMult(tower.type, healthRatio) * getToxinHuntMult(tower.type, e.effects, now),
              now,
              { ignoreArmor: true },
            );
            if (!out.immune) {
              const newEffects = [...e.effects];
              const existingBurn = newEffects.findIndex((ef) => ef.type === 'burn');
              if (existingBurn >= 0) {
                newEffects[existingBurn] = {
                  ...newEffects[existingBurn],
                  startTime: now,
                  duration: burnDuration,
                  value: burnDps,
                };
              } else {
                newEffects.push({
                  type: 'burn',
                  value: burnDps,
                  duration: burnDuration,
                  startTime: now,
                  stacks: 1,
                });
              }
              updatedEnemies[tgtIdx] = { ...e, health: out.health, shield: out.shield, effects: newEffects };
              killedThisFrame = out.health <= 0;

              // 上報統計系統（與投射物塔保持一致，否則統計頁與成就會漏算火焰塔）
              const statsStore = useStatsStore.getState();
              statsStore.trackTowerDamage(tower.id, out.dealt);
              if (killedThisFrame) statsStore.trackTowerKill(tower.id);
            }
          }
        }

        return {
          ...tower,
          rotation: newRotation,
          target,
          lastAttackTime: now,
          totalDamage: tower.totalDamage + flameDamage,
          kills: killedThisFrame ? tower.kills + 1 : tower.kills,
        };
      }

      const fireTargets = getSkillFireTargets(tower.skill, enemiesInRange, target);

      // 檢查是否可以開火
      if (now - tower.lastFireTime < cooldown || fireTargets.length === 0) {
        return { ...tower, rotation: newRotation, target: target || null };
      }

      // 計算傷害（含等級加成）
      const rawDamage = towerData.damage || towerData.damagePerSecond || 0;
      const baseDamage = rawDamage * statBonus.damageMultiplier * talentDamageMult * skillDamageMultiplier * synergyMods.damageMult * protocolMods.damageMult;

      // 暴擊（塔暴擊 + 天賦暴擊累加）
      const totalCritChance = Math.min(1, (towerData.critChance || 0) + talentMods.criticalChance + protocolMods.critChanceAdd);
      const critMult = (towerData.critMultiplier || 2.0) + (talentMods.criticalDamage - 1);

      const isInstant = towerData.instantHit || false;
      const muzzleOffset = 0.5;

      const getProjectileParams = (type: TowerType) => {
        switch (type) {
          case 'sniper':
            return { homingStrength: 0.95, curveOffset: 0, hitEffect: 'normal' as const, speed: 0.007 };
          case 'ballista':
            // 弩矢：近乎直線飛行（低追蹤），靠穿透命中沿途敵人
            return { homingStrength: 0.12, curveOffset: 0, hitEffect: 'normal' as const, speed: 0.006 };
          case 'cannon':
            return { homingStrength: 0.3, curveOffset: 0.5, hitEffect: 'explosive' as const, speed: 0.0025 };
          case 'machine':
            return { homingStrength: 0.6, curveOffset: 0, hitEffect: 'normal' as const, speed: 0.005 };
          case 'shotgun':
            return { homingStrength: 0.2, curveOffset: 0, hitEffect: 'normal' as const, speed: 0.004 };
          case 'frost':
            return { homingStrength: 0.7, curveOffset: 0.2, hitEffect: 'ice' as const, speed: 0.003 };
          case 'poison':
            return { homingStrength: 0.75, curveOffset: 0.3, hitEffect: 'poison' as const, speed: 0.0025 };
          case 'flame':
            return { homingStrength: 0.5, curveOffset: 0.8, hitEffect: 'fire' as const, speed: 0.003 };
          case 'lightning':
            return { homingStrength: 1, curveOffset: 0, hitEffect: 'electric' as const, speed: 0.007 };
          case 'wind':
            return { homingStrength: 0.6, curveOffset: 0.5, hitEffect: 'wind' as any, speed: 0.005 };
          default:
            return { homingStrength: 0.8, curveOffset: 0, hitEffect: 'normal' as const, speed: 0.003 };
        }
      };

      const projParams = getProjectileParams(tower.type);

      // 多重發射（機槍塔雙管、散彈塔扇形）
      let bulletCount = 1;
      let spreadAngle = 0;

      if (tower.type === 'machine') {
        bulletCount = 2;
      } else if (tower.type === 'shotgun') {
        bulletCount = 5 + Math.floor((tower.level - 1) / 2); // 隨等級增加子彈數
        spreadAngle = Math.PI / 4; // 45 度扇形
      }

      const barrelGap = 0.08;

      // 一次性建立特效物件，避免每發都重新分配
      const baseEffects = {
        slow: towerData.slowEffect ? { amount: (towerData.slowAmount || 0.5) * statBonus.slowAmountMultiplier, duration: towerData.slowDuration || 2000 } : undefined,
        poison: towerData.poisonEffect ? { damage: (towerData.poisonDamage || 5) * statBonus.poisonDamageMultiplier, duration: towerData.poisonDuration || 3000 } : undefined,
        splash: towerData.splash ? { radius: (towerData.splashRadius || 1.5) * statBonus.splashRadiusMultiplier } : undefined,
        chain: towerData.lightningEffect ? { count: ((towerData.chainCount || 3) + statBonus.chainCountBonus) * skillChainMultiplier, damageReduction: towerData.chainDamageReduction || 0.7 } : undefined,
        wind: towerData.windEffect ? { knockbackDistance: (towerData.windKnockbackDistance || 2.5) * (1 + (tower.level - 1) * 0.4) } : undefined,
      };

      for (const fireTarget of fireTargets) {
        const isCrit = totalCritChance > 0 && Math.random() < totalCritChance;
        const bossBonus = fireTarget.type === 'boss' || fireTarget.type === 'miniboss' ? talentMods.bossDamageMult : 1;
        const finalDamage = (isCrit ? baseDamage * critMult : baseDamage) * bossBonus;
        let bulletDamage = finalDamage;
        if (tower.type === 'machine') bulletDamage = finalDamage / 2;
        else if (tower.type === 'shotgun') bulletDamage = finalDamage / 3;

        const aimRotation = Math.atan2(fireTarget.y - tower.gridPos.row, fireTarget.x - tower.gridPos.col);
        const muzzleX = tower.gridPos.col + Math.cos(aimRotation) * muzzleOffset;
        const muzzleY = tower.gridPos.row + Math.sin(aimRotation) * muzzleOffset;

        for (let bi = 0; bi < bulletCount; bi++) {
          let bx = muzzleX;
          let by = muzzleY;
          let bulletRotation = aimRotation;
          let bulletSpeed = towerData.projectileSpeed || projParams.speed;

          if (tower.type === 'machine' && bulletCount > 1) {
            // 雙管偏移：垂直砲管方向
            const perpAngle = aimRotation + Math.PI / 2;
            const offsetDir = bi === 0 ? -1 : 1;
            bx = muzzleX + Math.cos(perpAngle) * barrelGap * offsetDir;
            by = muzzleY + Math.sin(perpAngle) * barrelGap * offsetDir;
          } else if (tower.type === 'shotgun' && bulletCount > 1) {
            // 散彈塔：扇形角度偏移
            const startAngle = aimRotation - spreadAngle / 2;
            const angleStep = spreadAngle / (bulletCount - 1);
            bulletRotation = startAngle + angleStep * bi;

            // 隨機化速度增加真實感（每發獨立隨機，不污染共享的 projParams）
            bulletSpeed *= 0.8 + Math.random() * 0.4;
          }

          const projectile: Projectile = {
            id: generateProjectileId(),
            x: bx,
            y: by,
            targetId: fireTarget.id,
            targetX: fireTarget.x,
            targetY: fireTarget.y,
            damage: bulletDamage,
            speed: bulletSpeed,
            size: towerData.projectileSize || 5,
            color: towerData.projectileColor,
            towerId: tower.id,
            towerType: tower.type,
            isInstant,
            isCrit,
            createdAt: now,
            rotation: bulletRotation,
            prevX: bx,
            prevY: by,
            trailPoints: [],
            homingStrength: tower.type === 'shotgun' ? 0.05 : projParams.homingStrength, // 散彈槍幾乎不追蹤
            curveOffset: projParams.curveOffset,
            lifetime: 0,
            // 散彈槍子彈很快消失；弩矢飛得久以貫穿整條直線
            maxLifetime: tower.type === 'shotgun' ? 600 : tower.type === 'ballista' ? 1500 : 3000,
            piercing: tower.type === 'shotgun' || tower.type === 'ballista', // 散彈與弩矢具備穿透能力
            hitEnemyIds: (tower.type === 'shotgun' || tower.type === 'ballista') ? [] : undefined,
            hitEffect: projParams.hitEffect,
            effects: baseEffects
          };
          newProjectiles.push(projectile);
          hasNewProjectilesThisFrame = true;
        }
      }

      if (hasNewProjectilesThisFrame) {
        loopFlags.hasNewProjectilesThisFrame = true;
        playTowerFire(tower.type); // 每次開火播放一次（依塔種對應射擊音，自帶節流）
      }

      return {
        ...tower,
        rotation: newRotation,
        target,
        lastFireTime: now,
        lastAttackTime: now,
        skill: tower.skill?.activeUntil === -1 && tower.skill.isActive ? { ...tower.skill, isActive: false } : tower.skill,
      };
    });

    if (loopFlags.hasNewProjectilesThisFrame || loopFlags.enemyInRange) {
      // 教學模式自動降速（同步呼叫，避免 dynamic import 的 microtask 開銷）
      const tutorialState = useTutorialStore.getState();
      if (tutorialState.isActive) {
        const currentStep = INTERACTIVE_TUTORIAL_STEPS[tutorialState.currentStepIndex];
        if (currentStep?.action === 'wait_wave_end' && get().gameSpeed > 1) {
          set({ gameSpeed: 1 });
        }
      }
    }

    set({ towers: updatedTowers, enemies: updatedEnemies, projectiles: newProjectiles });
  };
