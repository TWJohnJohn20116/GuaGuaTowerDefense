// 遊戲迴圈：敵人移動、狀態效果、Saboteur 破壞塔、特殊能力（治療/狂暴/傳送/飛行/護盾再生）
import { PATHS, ENEMY_DATA } from '@/data/gameData';
import type { StatusEffect, Enemy, GridPosition } from '@/types/game';
import { getEnemyData, isEnemyPhased } from '../gameStoreUtils';
import { clearTowerIds } from '@/store/gridTower';
import type { GetState, SetState } from './shared';
import { loopFlags } from './shared';
import { getSegmentMap, getWaypointSegLengths } from './pathHelpers';
import { collectEscortAuras, getEscortArmorAdd } from '@/data/escortAura';
import { isAbilitySuppressed } from '@/data/jammerAura';
import { hasEnemyAbility } from '@/data/gameData/enemyAbilities';
import { getIncomingHealMult, getShieldRegenMult, getFreezeShatterDamage } from '@/data/combatStatus';

const BASE_SPEED_MULTIPLIER = 0.0006;

/**
 * 單次掃描效果陣列，一次性算出所有衍生屬性
 * 取代每幀對 effects 多達 10 次的 find() 調用
 */
interface EffectsState {
  /** 過濾後仍生效的效果（過期被剃除） */
  updatedEffects: StatusEffect[];
  /** 是否與原 effects 完全相同（用以保留 reference） */
  unchanged: boolean;
  /** 是否被定身：freeze / root / stun / petrify 任一存在 */
  isStopped: boolean;
  /** 減速乘數（slow 效果，0~1，預設 1 不減速） */
  slowMult: number;
  /** 速度疊乘：haste / berserk / fear / confuse 等綜合 */
  speedMult: number;
  /** 每秒傷害總和（poison + burn） */
  dotPerSecond: number;
  /** 流血每秒傷害（依速度乘） */
  bleedPerSecond: number;
  /** 回復值（受 curse 影響為 25%） */
  regenValue: number;
}

/** 從 effects 一次性解析所有狀態 */
const analyzeEffects = (effects: StatusEffect[], now: number): EffectsState => {
  const len = effects.length;
  let validCount = 0;
  // 先掃描一次計算有效個數，若全部有效則保留原陣列 reference
  for (let i = 0; i < len; i++) {
    if (now - effects[i].startTime < effects[i].duration) validCount++;
  }
  const unchanged = validCount === len;
  const updatedEffects = unchanged ? effects : effects.filter((e) => now - e.startTime < e.duration);

  let isStopped = false;
  let slowMult = 1;
  let speedMult = 1;
  let dotPerSecond = 0;
  let bleedPerSecond = 0;
  let regenValue = 0;
  let curseActive = false;
  let confuseActive = false;

  // 先找 curse / confuse 以正確套用倍率
  for (let i = 0; i < updatedEffects.length; i++) {
    const t = updatedEffects[i].type;
    if (t === 'curse') curseActive = true;
    else if (t === 'confuse') confuseActive = true;
  }

  for (let i = 0; i < updatedEffects.length; i++) {
    const ef = updatedEffects[i];
    const v = ef.value || 0;
    const stacks = ef.stacks || 1;
    switch (ef.type) {
      // 多個減速來源取最強（slowMult 越小越慢），避免弱減速覆蓋強減速
      case 'slow': slowMult = Math.min(slowMult, v || 0.5); break;
      case 'freeze':
      case 'root':
      case 'stun':
      case 'petrify': isStopped = true; break;
      case 'poison': dotPerSecond += v * stacks; break;
      case 'burn': dotPerSecond += v * stacks; break;
      case 'bleed': bleedPerSecond += v * stacks; break;
      case 'regen': regenValue += v * (curseActive ? 0.25 : 1); break;
      case 'haste': speedMult *= 1 + v; break;
      // 狂暴：倍率取自效果 value（狂戰士為 berserkSpeedBoost），無值時退回 1.5
      case 'berserk': speedMult *= v > 1 ? v : 1.5; break;
      // 恐懼：減速 50%（不可為負值，負速度會讓路徑進度倒退引發邊界錯誤）
      case 'fear': speedMult *= 0.5; break;
      default: break;
    }
  }
  // 混亂：以平滑正弦波動產生 0.5~1.5 倍的時快時慢（避免每幀獨立隨機造成抖動）
  if (confuseActive) speedMult *= 1 + 0.5 * Math.sin(now * 0.008);

  return {
    updatedEffects,
    unchanged,
    isStopped,
    slowMult,
    speedMult,
    dotPerSecond,
    bleedPerSecond,
    regenValue,
  };
};

/** 狂戰士狂暴效果持續時間：血量低於閾值期間每幀刷新，被治療回閾值以上後自動消退 */
const BERSERK_REFRESH_MS = 600;

/**
 * 沿 waypoints 從 (pathIndex, progress) 前進 dist 格，回傳新的路徑狀態與座標。
 * 不會越過最後一個 waypoint（最多停在終點前 5% 段長處），供法師傳送使用。
 */
const advanceAlongWaypoints = (
  waypoints: GridPosition[],
  segLengths: number[],
  pathIndex: number,
  progress: number,
  dist: number,
): { pathIndex: number; progress: number; x: number; y: number } => {
  let idx = pathIndex;
  let prog = progress;
  let remaining = dist;

  while (remaining > 0 && idx < waypoints.length - 1) {
    const segLen = segLengths[idx];
    const restOfSeg = (1 - prog) * segLen;
    if (remaining < restOfSeg) {
      prog += remaining / segLen;
      remaining = 0;
    } else {
      remaining -= restOfSeg;
      idx++;
      prog = 0;
    }
  }

  // 不可直接傳進終點：最後一段最多停在 95%
  if (idx >= waypoints.length - 1) {
    idx = waypoints.length - 2;
    prog = 0.95;
  } else if (idx === waypoints.length - 2 && prog > 0.95) {
    prog = 0.95;
  }

  const cur = waypoints[idx];
  const nxt = waypoints[idx + 1];
  return {
    pathIndex: idx,
    progress: prog,
    x: cur.col + (nxt.col - cur.col) * prog,
    y: cur.row + (nxt.row - cur.row) * prog,
  };
};

export const createUpdateEnemies =
  (get: GetState, set: SetState) =>
  (deltaTime: number, _tileSize: number) => {
    loopFlags.hasNewProjectilesThisFrame = false;
    loopFlags.enemyInRange = false;

    const { enemies, selectedPath, towers, grid } = get();
    const path = PATHS[selectedPath];
    const isAdvanced = path.category === 'advanced' && path.segments && path.segments.length > 0;
    const segmentMap = isAdvanced ? getSegmentMap(path) : null;

    // 整幀單一時間戳，避免每敵人多次 Date.now() 呼叫
    const now = Date.now();
    const deltaSec = deltaTime / 1000;

    // 記錄 Saboteur 造成的傷害
    const towerDamageFromEnemies: Record<string, number> = {};

    // 進階地圖終點路段（飛行敵人直線飛行的目標）
    const endSegment = isAdvanced ? (path.segments!.find(s => s.next.length === 0) ?? null) : null;

    // 治療光環：預先收集場上存活的治療敵人（healRadius 單位為 px，50px = 1 格）
    const healerAuras: { id: string; x: number; y: number; radiusSq: number; amount: number }[] = [];
    for (const e of enemies) {
      if (e.health <= 0) continue;
      const d = getEnemyData(e.originType ?? e.type);
      if (hasEnemyAbility(d, 'healing') && d.healAmount && d.healRadius && !isAbilitySuppressed(e, now)) {
        const r = d.healRadius / 50;
        healerAuras.push({ id: e.id, x: e.x, y: e.y, radiusSq: r * r, amount: d.healAmount });
      }
    }

    const updatedEnemies = enemies.map(enemy => {
      // 整幀單次解析所有狀態效果（取代多次 find() / filter()）
      const fx = analyzeEffects(enemy.effects, now);
      let updatedEffects = fx.updatedEffects;
      const data = getEnemyData(enemy.originType ?? enemy.type);
      const phased = isEnemyPhased(enemy, now);
      const shatter = phased ? 0 : getFreezeShatterDamage(enemy.effects, now);
      if (shatter > 0) {
        const { addDamageText, addImpactParticles } = get();
        addDamageText(enemy.x, enemy.y, shatter, false, '#7dd3fc');
        addImpactParticles(enemy.x, enemy.y, '#7dd3fc', 8);
      }

      // ===== 狂戰士狂暴：血量低於閾值期間持續刷新狂暴效果（速度倍增 + 視覺紅圈） =====
      let berserkExtraMult = 1;
      if (
        data?.berserkThreshold && enemy.health > 0 &&
        enemy.health / enemy.maxHealth <= data.berserkThreshold
      ) {
        const boost = data.berserkSpeedBoost ?? 2;
        const idx = updatedEffects.findIndex(e => e.type === 'berserk');
        if (idx >= 0) {
          // 刷新持續時間；速度倍率已由 analyzeEffects 計入
          updatedEffects = updatedEffects.map((e, i) =>
            i === idx ? { ...e, startTime: now, duration: BERSERK_REFRESH_MS } : e
          );
        } else {
          // 進入狂暴的第一幀：補上效果並直接套用倍率（效果下一幀才會被 analyzeEffects 讀到）
          updatedEffects = [...updatedEffects, { type: 'berserk' as const, value: boost, duration: BERSERK_REFRESH_MS, startTime: now }];
          berserkExtraMult = boost;
        }
      }

      // ===== 被風塔吹離路徑的敵人：走回路徑 =====
      if (enemy.isDisplaced && enemy.displacedTargetX != null && enemy.displacedTargetY != null) {
        const returnSpeed = enemy.speed * 0.7 * BASE_SPEED_MULTIPLIER * deltaTime * 4;
        const dx = enemy.displacedTargetX - enemy.x;
        const dy = enemy.displacedTargetY - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // 被位移期間不會移動（速度為 0），只計算 DOT 傷害（相位免疫期間不掉血）
        const newHealth = phased ? enemy.health : enemy.health - fx.dotPerSecond * deltaSec - shatter;

        if (dist < 0.2) {
          const segmentRestore = (isAdvanced && enemy.returnSegmentId) ? {
            currentSegmentId: enemy.returnSegmentId,
            segmentWaypointIndex: enemy.returnWaypointIndex ?? 0,
          } : {};
          return {
            ...enemy,
            x: enemy.displacedTargetX,
            y: enemy.displacedTargetY,
            isDisplaced: false,
            displacedTargetX: undefined,
            displacedTargetY: undefined,
            pathIndex: enemy.returnPathIndex ?? enemy.pathIndex,
            progress: 0,
            returnPathIndex: undefined,
            returnSegmentId: undefined,
            returnWaypointIndex: undefined,
            ...segmentRestore,
            health: newHealth,
            effects: updatedEffects,
          };
        }
        const step = Math.min(returnSpeed, dist);
        const moveX = (dx / dist) * step;
        const moveY = (dy / dist) * step;
        return {
          ...enemy,
          x: enemy.x + moveX,
          y: enemy.y + moveY,
          health: newHealth,
          effects: updatedEffects,
        };
      }

      // ===== 計算速度（兩種地圖共用） =====
      let speed = enemy.speed * fx.slowMult;
      if (fx.isStopped) speed = 0;
      const effectSpeed = speed * fx.speedMult * berserkExtraMult;

      // ===== 計算 DOT / 流血 / 再生（相位免疫期間不受任何持續傷害） =====
      let newHealth = enemy.health;
      if (!phased) {
        if (fx.dotPerSecond > 0) newHealth -= fx.dotPerSecond * deltaSec;
        if (fx.bleedPerSecond > 0 && effectSpeed > 0) {
          newHealth -= fx.bleedPerSecond * effectSpeed * deltaSec;
        }
        if (shatter > 0) newHealth -= shatter;
      }
      if (fx.regenValue > 0) {
        newHealth = Math.min(enemy.maxHealth, newHealth + fx.regenValue * deltaSec);
      }

      // ===== 法師傳送：每隔 teleportCooldown 沿路徑向前跳 teleportDistance 格 =====
      if (
        hasEnemyAbility(data, 'teleport') && !enemy.isDisplaced && !fx.isStopped && enemy.health > 0
      ) {
        const tpCd = data.teleportCooldown ?? 8000;
        const lastTp = enemy.lastTeleportTime ?? enemy.spawnTime ?? now;
        if (now - lastTp >= tpCd) {
          const tpDist = data.teleportDistance ?? 2;
          let moved: { pathIndex: number; progress: number; x: number; y: number } | null = null;
          let segPatch: Partial<Enemy> = {};

          if (isAdvanced && enemy.currentSegmentId) {
            // 進階地圖：在當前路段內向前跳（最遠至路段末端）
            const seg = segmentMap!.get(enemy.currentSegmentId);
            if (seg && seg.waypoints.length >= 2) {
              const segLens: number[] = [];
              for (let i = 0; i < seg.waypoints.length - 1; i++) {
                const dx = seg.waypoints[i + 1].col - seg.waypoints[i].col;
                const dy = seg.waypoints[i + 1].row - seg.waypoints[i].row;
                segLens.push(Math.sqrt(dx * dx + dy * dy));
              }
              moved = advanceAlongWaypoints(seg.waypoints, segLens, enemy.segmentWaypointIndex ?? 0, enemy.progress, tpDist);
              segPatch = { segmentWaypointIndex: moved.pathIndex };
            }
          } else if (!isAdvanced && enemy.pathIndex < path.waypoints.length - 1) {
            moved = advanceAlongWaypoints(path.waypoints, getWaypointSegLengths(path), enemy.pathIndex, enemy.progress, tpDist);
          }

          if (moved) {
            const { addImpactParticles } = get();
            addImpactParticles(enemy.x, enemy.y, '#c864ff', 8);
            addImpactParticles(moved.x, moved.y, '#c864ff', 10);
            return {
              ...enemy,
              x: moved.x,
              y: moved.y,
              pathIndex: moved.pathIndex,
              progress: moved.progress,
              ...segPatch,
              lastTeleportTime: now,
              health: newHealth,
              effects: updatedEffects,
            };
          }
        }
      }

      // ===== 飛行敵人：無視路徑直線飛向終點 =====
      if (hasEnemyAbility(data, 'flying')) {
        let endCol = enemy.x;
        let endRow = enemy.y;
        let leakPatch: Partial<Enemy> = {};
        if (isAdvanced) {
          if (endSegment) {
            const lastWp = endSegment.waypoints[endSegment.waypoints.length - 1];
            endCol = lastWp.col;
            endRow = lastWp.row;
            leakPatch = { currentSegmentId: endSegment.id, segmentWaypointIndex: endSegment.waypoints.length - 1 };
          }
        } else {
          const lastWp = path.waypoints[path.waypoints.length - 1];
          endCol = lastWp.col;
          endRow = lastWp.row;
          leakPatch = { pathIndex: path.waypoints.length - 1, progress: 0 };
        }
        const fdx = endCol - enemy.x;
        const fdy = endRow - enemy.y;
        const fdist = Math.sqrt(fdx * fdx + fdy * fdy);
        const step = effectSpeed * deltaTime * BASE_SPEED_MULTIPLIER;
        if (fdist <= Math.max(step, 0.05)) {
          // 抵達終點：標記到達狀態，漏怪結算由主迴圈處理
          return { ...enemy, x: endCol, y: endRow, ...leakPatch, health: newHealth, effects: updatedEffects };
        }
        return {
          ...enemy,
          x: enemy.x + (fdx / fdist) * step,
          y: enemy.y + (fdy / fdist) * step,
          health: newHealth,
          effects: updatedEffects,
        };
      }

      // ===== Saboteur 破壞塔邏輯 =====
      if (enemy.type === 'saboteur' && towers.length > 0) {
        let nearestTower = null;
        let minDistSq = Infinity;
        for (const t of towers) {
          const dx = t.gridPos.col - enemy.x;
          const dy = t.gridPos.row - enemy.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < minDistSq) {
            minDistSq = distSq;
            nearestTower = t;
          }
        }
        const minDist = Math.sqrt(minDistSq);

        if (nearestTower) {
          if (minDist > 0.8) {
            const moveSpeed = effectSpeed * deltaTime * 0.0006 * 2;
            const step = Math.min(moveSpeed, minDist - 0.8);
            const dx = nearestTower.gridPos.col - enemy.x;
            const dy = nearestTower.gridPos.row - enemy.y;
            const moveX = (dx / minDist) * step;
            const moveY = (dy / minDist) * step;
            return {
              ...enemy,
              x: enemy.x + moveX,
              y: enemy.y + moveY,
              health: newHealth,
              effects: updatedEffects,
              isDisplaced: true,
            };
          } else {
            // 距離足夠，進行破壞（DPS 20）
            const damage = 20 * (deltaTime / 1000);
            towerDamageFromEnemies[nearestTower.id] = (towerDamageFromEnemies[nearestTower.id] || 0) + damage;
            return {
              ...enemy,
              health: newHealth,
              effects: updatedEffects,
              isDisplaced: true,
            };
          }
        }
      }

      // ===== 進階地圖：路段式移動 =====
      if (isAdvanced && enemy.currentSegmentId != null) {
        const segMap = segmentMap!;
        let segId = enemy.currentSegmentId;
        let seg = segMap.get(segId);
        if (!seg) return { ...enemy, health: newHealth, effects: updatedEffects };

        let wpIdx = enemy.segmentWaypointIndex ?? 0;
        const segWps = seg.waypoints;

        if (wpIdx >= segWps.length - 1 && seg.next.length === 0) {
          return { ...enemy, health: newHealth, effects: updatedEffects };
        }

        if (wpIdx >= segWps.length - 1) {
          const nextId = seg.next.length === 1
            ? seg.next[0]
            : seg.next[Math.floor(Math.random() * seg.next.length)];
          const nextSeg = segMap.get(nextId);
          if (!nextSeg) return { ...enemy, health: newHealth, effects: updatedEffects };
          segId = nextId;
          seg = nextSeg;
          wpIdx = 0;
        }

        const curWp = segWps[wpIdx];
        const nxtWp = segWps[wpIdx + 1];
        if (!nxtWp) {
          return { ...enemy, x: curWp.col, y: curWp.row, health: newHealth, effects: updatedEffects,
            currentSegmentId: segId, segmentWaypointIndex: wpIdx };
        }

        const dx = nxtWp.col - curWp.col;
        const dy = nxtWp.row - curWp.row;
        const segLen = Math.sqrt(dx * dx + dy * dy);
        const moveAmt = (effectSpeed * deltaTime * BASE_SPEED_MULTIPLIER) / Math.max(segLen, 0.01);
        let prog = enemy.progress + moveAmt;
        let newWpIdx = wpIdx;
        let newSegId = segId;
        let curSeg = seg;

        while (prog >= 1) {
          prog -= 1;
          newWpIdx++;

          if (newWpIdx >= curSeg.waypoints.length - 1) {
            if (curSeg.next.length === 0) {
              prog = 0;
              break;
            }
            const chosenId = curSeg.next.length === 1
              ? curSeg.next[0]
              : curSeg.next[Math.floor(Math.random() * curSeg.next.length)];
            const chosenSeg = segMap.get(chosenId);
            if (!chosenSeg) { prog = 0; break; }
            newSegId = chosenId;
            curSeg = chosenSeg;
            newWpIdx = 0;
          }

          if (newWpIdx < curSeg.waypoints.length - 1) {
            const nDx = curSeg.waypoints[newWpIdx + 1].col - curSeg.waypoints[newWpIdx].col;
            const nDy = curSeg.waypoints[newWpIdx + 1].row - curSeg.waypoints[newWpIdx].row;
            const nLen = Math.sqrt(nDx * nDx + nDy * nDy);
            prog = prog * segLen / Math.max(nLen, 0.01);
          }
        }

        let newX: number, newY: number;
        const cWps = curSeg.waypoints;
        if (newWpIdx < cWps.length - 1) {
          const cW = cWps[newWpIdx];
          const nW = cWps[newWpIdx + 1];
          newX = cW.col + (nW.col - cW.col) * prog;
          newY = cW.row + (nW.row - cW.row) * prog;
        } else {
          const lastW = cWps[cWps.length - 1];
          newX = lastW.col;
          newY = lastW.row;
        }

        let newIsDisplaced = enemy.isDisplaced;
        if (enemy.isDisplaced && enemy.displacedTargetX == null) {
          const dx = newX - enemy.x;
          const dy = newY - enemy.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0.1) {
            const moveSpeed = effectSpeed * deltaTime * 0.0006 * 4;
            const step = Math.min(moveSpeed, dist);
            newX = enemy.x + (dx / dist) * step;
            newY = enemy.y + (dy / dist) * step;
          } else {
            newIsDisplaced = false;
          }
        }

        return {
          ...enemy, x: newX, y: newY, progress: prog,
          pathIndex: newWpIdx,
          currentSegmentId: newSegId, segmentWaypointIndex: newWpIdx,
          health: newHealth, effects: updatedEffects,
          isDisplaced: newIsDisplaced,
        };
      }

      // ===== 普通地圖：原有 waypoints 移動 =====
      const waypoints = path.waypoints;
      const segLengths = getWaypointSegLengths(path);
      if (enemy.pathIndex >= waypoints.length - 1) {
        return { ...enemy, health: newHealth, effects: updatedEffects };
      }

      const segmentLength = segLengths[enemy.pathIndex];

      const moveAmount = (effectSpeed * deltaTime * BASE_SPEED_MULTIPLIER) / segmentLength;
      let newProgress = enemy.progress + moveAmount;
      let newPathIndex = enemy.pathIndex;

      while (newProgress >= 1 && newPathIndex < waypoints.length - 1) {
        newProgress -= 1;
        newPathIndex++;
        if (newPathIndex < waypoints.length - 1) {
          newProgress = newProgress * segmentLength / segLengths[newPathIndex];
        }
      }

      let newX: number, newY: number;
      if (newPathIndex < waypoints.length - 1) {
        const currWp = waypoints[newPathIndex];
        const nextWp = waypoints[newPathIndex + 1];
        newX = currWp.col + (nextWp.col - currWp.col) * newProgress;
        newY = currWp.row + (nextWp.row - currWp.row) * newProgress;
      } else {
        const lastWp = waypoints[waypoints.length - 1];
        newX = lastWp.col;
        newY = lastWp.row;
      }

      let newIsDisplaced = enemy.isDisplaced;
      if (enemy.isDisplaced && enemy.displacedTargetX == null) {
        const dx = newX - enemy.x;
        const dy = newY - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0.1) {
          const moveSpeed = effectSpeed * deltaTime * 0.0006 * 4;
          const step = Math.min(moveSpeed, dist);
          newX = enemy.x + (dx / dist) * step;
          newY = enemy.y + (dy / dist) * step;
        } else {
          newIsDisplaced = false;
        }
      }

      return {
        ...enemy, x: newX, y: newY,
        progress: newProgress, pathIndex: newPathIndex,
        health: newHealth, effects: updatedEffects,
        isDisplaced: newIsDisplaced,
      };
    });

    // ===== 後置輕量處理（map 各分支均回傳新物件，可安全原地寫入） =====
    const escortAuras = collectEscortAuras(updatedEnemies, ENEMY_DATA, now);
    for (let i = 0; i < updatedEnemies.length; i++) {
      const e = updatedEnemies[i];
      if (e.health <= 0) continue;

      e.escortArmor = getEscortArmorAdd(e.x, e.y, escortAuras);

      // 治療光環：healer 周圍的其他敵人持續回血
      if (healerAuras.length > 0) {
        let heal = 0;
        for (const h of healerAuras) {
          if (h.id === e.id) continue;
          const dx = e.x - h.x;
          const dy = e.y - h.y;
          if (dx * dx + dy * dy <= h.radiusSq) heal += h.amount;
        }
        if (heal > 0) {
          const received = heal * deltaSec * getIncomingHealMult(e.effects, now);
          if (received > 0) e.health = Math.min(e.maxHealth, e.health + received);
        }
      }

      // 護盾再生（燃燒中完全停止）
      if (e.maxShield && (e.shield ?? 0) < e.maxShield) {
        const regen = (getEnemyData(e.originType ?? e.type).shieldRegen ?? 0) * getShieldRegenMult(e.effects, now);
        if (regen > 0) e.shield = Math.min(e.maxShield, (e.shield ?? 0) + regen * deltaSec);
      }
    }

    let finalTowers = towers;
    let finalGrid = grid;

    if (Object.keys(towerDamageFromEnemies).length > 0) {
      finalTowers = towers.map(t => {
        const damage = towerDamageFromEnemies[t.id] || 0;
        return damage > 0 ? { ...t, health: t.health - damage } : t;
      }).filter(t => t.health > 0);

      // 如果有塔被摧毀，更新 Grid 和選擇狀態
      let finalSelected = get().selectedTower;
      if (finalSelected && !finalTowers.find(t => t.id === finalSelected!.id)) {
        finalSelected = null;
      }

      if (finalTowers.length < towers.length) {
        get().addShake(2.5); // 塔被破壞時震動
        const deadIds = new Set(
          towers.filter(t => !finalTowers.some(ft => ft.id === t.id)).map(t => t.id),
        );
        finalGrid = clearTowerIds(grid, deadIds);
        set({ enemies: updatedEnemies, towers: finalTowers, grid: finalGrid, selectedTower: finalSelected });
      } else {
        // 沒有塔被摧毀，僅更新塔和選擇狀態，避免重新渲染 grid
        if (finalSelected) {
          finalSelected = finalTowers.find(t => t.id === finalSelected!.id) || null;
        }
        set({ enemies: updatedEnemies, towers: finalTowers, selectedTower: finalSelected });
      }
    } else {
      set({ enemies: updatedEnemies });
    }
  };
