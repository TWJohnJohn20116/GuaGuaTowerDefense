// 遊戲迴圈：投射物更新（追蹤、命中、穿透、連鎖、Splash、風塔擊退）
import type { Projectile, Enemy, StatusEffect } from '@/types/game';
import { PATHS } from '@/data/gameData';
import { applyDamageToEnemy, getEnemyData, isEnemyPhased } from '../gameStoreUtils';
import { computeWindKnockback } from '../gameStoreWindHelper';
import { useTutorialStore, INTERACTIVE_TUTORIAL_STEPS } from '../tutorialStore';
import { useStatsStore } from '../statsStore';
import { buildSpatialHash, forEachInHashRadius, findInHashRadius } from '@/utils/spatialHash';
import type { SpatialHash } from '@/utils/spatialHash';
import type { GetState, SetState } from './shared';
import { loopFlags } from './shared';
import { applyFrostSilenceToJammer } from '@/data/jammerAura';
import { applyBallistaRoot, applyCannonStun, applyFrostbite, applyLaserExposed, applyLightningWeakness, applyMachineSilence, applyShotgunBleed, applySniperMark, applyWindFear, getAntiAirMult, getBleedHuntMult, getExecuteMult, getFearHuntMult, getFocusFireMult, getFreezeHuntMult, getLaserHuntMult, getPinnedMult, getSilenceHuntMult, getStunCrushMult, getToxinHuntMult, getTowerHitDamageOpts, getWeaknessHuntMult } from '@/data/combatStatus';

// 單顆投射物在本幀更新時的共享上下文（每幀建立一次，傳給各處理函式）
// addDamage / checkKill 為外層閉包，確保 someEnemyTookDamage 與統計 Map 仍由 createUpdateProjectiles 持有
interface ProjStepCtx {
  get: GetState;
  now: number;
  deltaTime: number;
  updatedEnemies: Enemy[];
  enemyIdxById: Map<string, number>;
  enemyHash: SpatialHash;
  addDamage: (towerId: string, damage: number) => void;
  checkKill: (towerId: string, oldHealth: number, newHealth: number) => void;
}

// 追蹤型投射物的本幀運動參數
interface ProjMotion {
  currentAngle: number;
  moveSpeed: number;
  baseHitRadius: number;
  hitRadiusSq: number;
  hasFlownEnough: boolean;
}

// 套用減速 / 中毒效果（同型效果已存在則不重複疊加）
function applySlowAndPoison(
  effects: StatusEffect[],
  projEffects: Projectile['effects'],
  now: number,
): void {
  if (projEffects?.slow) {
    const existingSlow = effects.find((e) => e.type === 'slow');
    if (!existingSlow) {
      effects.push({
        type: 'slow',
        value: projEffects.slow.amount,
        duration: projEffects.slow.duration,
        startTime: now,
      });
    }
  }
  if (projEffects?.poison) {
    const existingPoison = effects.find((e) => e.type === 'poison');
    if (!existingPoison) {
      effects.push({
        type: 'poison',
        value: projEffects.poison.damage,
        duration: projEffects.poison.duration,
        startTime: now,
      });
    }
  }
}

function applyHitStatusEffects(
  effects: StatusEffect[],
  proj: Projectile,
  enemyType: string,
  now: number,
): void {
  applySlowAndPoison(effects, proj.effects, now);
  applyFrostSilenceToJammer(effects, proj.towerType, getEnemyData(enemyType).ability, now);
  applySniperMark(effects, proj.towerType, now);
  applyLaserExposed(effects, proj.towerType, now);
  applyLightningWeakness(effects, proj.towerType, now);
  applyShotgunBleed(effects, proj.towerType, now);
  applyBallistaRoot(effects, proj.towerType, now);
  applyCannonStun(effects, proj.towerType, now);
  applyMachineSilence(effects, proj.towerType, now);
  applyWindFear(effects, proj.towerType, now);
  applyFrostbite(effects, proj.towerType, now);
}

function dealTowerHit(
  enemy: { type: string; health: number; maxHealth?: number; shield?: number; spawnTime?: number; armorBonus?: number; escortArmor?: number; effects: StatusEffect[] },
  amount: number,
  proj: Projectile,
  now: number,
) {
  const maxHp = enemy.maxHealth ?? 0;
  const healthRatio = maxHp > 0 ? enemy.health / maxHp : 1;
  return applyDamageToEnemy(
    enemy,
    amount * getFocusFireMult(enemy.effects, now, proj.towerType) * getExecuteMult(proj.towerType, healthRatio) * getAntiAirMult(proj.towerType, enemy.type) * getPinnedMult(proj.towerType, enemy.effects, now) * getBleedHuntMult(proj.towerType, enemy.effects, now) * getStunCrushMult(proj.towerType, enemy.effects, now) * getToxinHuntMult(proj.towerType, enemy.effects, now) * getSilenceHuntMult(proj.towerType, enemy.effects, now) * getFearHuntMult(proj.towerType, enemy.effects, now) * getWeaknessHuntMult(proj.towerType, enemy.effects, now) * getLaserHuntMult(proj.towerType, enemy.effects, now) * getFreezeHuntMult(proj.towerType, enemy.effects, now),
    now,
    getTowerHitDamageOpts(proj.towerType),
  );
}

// 更新軌跡點（保留最近 3 點並逐步衰減透明度以節省效能）
function updateTrail(proj: Projectile): void {
  if (!proj.trailPoints) proj.trailPoints = [];
  const newTrailPoints = [{ x: proj.x, y: proj.y, alpha: 1 }];
  for (let i = 0; i < Math.min(proj.trailPoints.length, 3); i++) {
    const p = proj.trailPoints[i];
    const newAlpha = p.alpha * 0.7;
    if (newAlpha > 0.1) newTrailPoints.push({ x: p.x, y: p.y, alpha: newAlpha });
  }
  proj.trailPoints = newTrailPoints;
}

// 追蹤型投射物的曲線移動（含曲線偏移）
function moveProjectileWithCurve(proj: Projectile, currentAngle: number, moveSpeed: number): void {
  const curveAmount = proj.curveOffset || 0;
  const curveFactor = Math.sin((proj.lifetime || 0) * 0.01) * curveAmount;
  const perpAngle = currentAngle + Math.PI / 2;
  proj.x += Math.cos(currentAngle) * moveSpeed + Math.cos(perpAngle) * curveFactor * moveSpeed;
  proj.y += Math.sin(currentAngle) * moveSpeed + Math.sin(perpAngle) * curveFactor * moveSpeed;
}

// 無目標（目標已死）：非瞬間投射物續飛一小段，出界或逾時則移除
function handleNoTarget(proj: Projectile, ctx: ProjStepCtx): boolean {
  if (proj.isInstant) return false;
  const moveSpeed = proj.speed * ctx.deltaTime;
  const angle = proj.rotation || 0;
  proj.x += Math.cos(angle) * moveSpeed;
  proj.y += Math.sin(angle) * moveSpeed;
  if (proj.x < -5 || proj.x > 25 || proj.y < -5 || proj.y > 25 || (proj.lifetime || 0) >= 500) {
    return false;
  }
  return true;
}

// 瞬間命中的連鎖閃電（由 target 向鄰近敵人擴散）
function applyInstantChain(proj: Projectile, target: Enemy, ctx: ProjStepCtx): void {
  const { updatedEnemies, enemyHash } = ctx;
  const chain = proj.effects!.chain!;
  const chainedEnemies = [target.id];
  let currentTarget = target;
  let currentDamage = proj.damage;
  const CHAIN_RADIUS = 2.5;
  const CHAIN_RADIUS_SQ = 6.25;

  for (let i = 0; i < chain.count; i++) {
    const nextIdx = findInHashRadius(
      enemyHash,
      currentTarget.x,
      currentTarget.y,
      CHAIN_RADIUS,
      (eIdx) => {
        const e = updatedEnemies[eIdx];
        if (chainedEnemies.includes(e.id) || e.health <= 0) return false;
        // 相位中的敵人不導電（免疫且不可作為連鎖節點）
        if (isEnemyPhased(e, ctx.now)) return false;
        const dx = e.x - currentTarget.x;
        const dy = e.y - currentTarget.y;
        return dx * dx + dy * dy <= CHAIN_RADIUS_SQ;
      },
    );
    if (nextIdx !== -1) {
      const nextTarget = updatedEnemies[nextIdx];
      currentDamage *= chain.damageReduction;
      chainedEnemies.push(nextTarget.id);
      const out = dealTowerHit(nextTarget, currentDamage, proj, ctx.now);
      ctx.addDamage(proj.towerId, out.dealt);
      ctx.checkKill(proj.towerId, nextTarget.health, out.health);
      const chainedEffects = [...nextTarget.effects];
      applyHitStatusEffects(chainedEffects, proj, nextTarget.type, ctx.now);
      updatedEnemies[nextIdx] = { ...nextTarget, health: out.health, shield: out.shield, effects: chainedEffects };
      currentTarget = nextTarget;
    } else {
      break;
    }
  }
}

// 瞬間命中類型（雷射、閃電）：立即造成傷害但保留短暫視覺效果
function handleInstantHit(
  proj: Projectile,
  target: Enemy,
  targetIdx: number | undefined,
  ctx: ProjStepCtx,
): boolean {
  const { now, get } = ctx;

  // 首次處理即結算傷害（用旗標而非時間窗口，低幀率下不會漏結算）
  if (!proj.instantDamageApplied) {
    proj.instantDamageApplied = true;
    const out = dealTowerHit(target, proj.damage, proj, now);

    if (out.immune) {
      get().addStatusText(target.x, target.y, '免疫', '#93c5fd');
    } else {
      const oldHealth = target.health;
      const newEffects = [...target.effects];

      ctx.addDamage(proj.towerId, out.dealt);
      ctx.checkKill(proj.towerId, oldHealth, out.health);

      const { addDamageText, addImpactParticles } = get();
      const fullyAbsorbed = out.health === oldHealth && out.shield < (target.shield ?? 0);
      addDamageText(target.x, target.y, out.dealt, proj.isCrit, fullyAbsorbed ? '#60a5fa' : proj.color);
      addImpactParticles(target.x, target.y, proj.color, proj.isCrit ? 8 : 4);

      applyHitStatusEffects(newEffects, proj, target.originType ?? target.type, now);

      // 連鎖閃電（使用 spatial hash 加速）
      if (proj.effects?.chain) {
        applyInstantChain(proj, target, ctx);
      }

      if (targetIdx !== undefined) {
        ctx.updatedEnemies[targetIdx] = { ...ctx.updatedEnemies[targetIdx], health: out.health, shield: out.shield, effects: newEffects };
      }
    }
  }

  // 傷害結算後保留 200ms 視覺效果
  const elapsed = now - (proj.createdAt || now);
  return elapsed <= 200;
}

// 穿透投射物：檢測路徑上碰到的所有未擊中過的敵人（使用 spatial hash），命中後續飛
function handlePiercing(proj: Projectile, ctx: ProjStepCtx, motion: ProjMotion): boolean {
  const { updatedEnemies, enemyHash, now, get } = ctx;
  const { currentAngle, moveSpeed, baseHitRadius, hitRadiusSq, hasFlownEnough } = motion;

  if (!proj.hitEnemyIds) proj.hitEnemyIds = [];

  // 搜索半徑取 baseHitRadius 或 移動掃過距離（取較大值）
  const piercingSearchRadius = Math.max(baseHitRadius, moveSpeed * 1.5);

  forEachInHashRadius(enemyHash, proj.x, proj.y, piercingSearchRadius, (ei) => {
    const e = updatedEnemies[ei];
    if (e.health <= 0 || proj.hitEnemyIds!.includes(e.id)) return;

    const eDistSq = (e.x - proj.x) ** 2 + (e.y - proj.y) ** 2;

    if (eDistSq < hitRadiusSq || (hasFlownEnough && eDistSq < moveSpeed * moveSpeed * 2.25)) {
      const out = dealTowerHit(e, proj.damage, proj, now);
      // 相位中：子彈直接穿過（不標記已命中，相位結束後仍可被打中）
      if (out.immune) return;

      proj.hitEnemyIds!.push(e.id);

      const oldHealth = e.health;
      const newEffects = [...e.effects];

      ctx.addDamage(proj.towerId, out.dealt);
      ctx.checkKill(proj.towerId, oldHealth, out.health);

      const { addDamageText, addImpactParticles, addShake } = get();
      const fullyAbsorbed = out.health === oldHealth && out.shield < (e.shield ?? 0);
      addDamageText(e.x, e.y, out.dealt, proj.isCrit, fullyAbsorbed ? '#60a5fa' : proj.color);
      addImpactParticles(e.x, e.y, proj.color, proj.isCrit ? 12 : 8);

      if (proj.towerType === 'shotgun') addShake(0.3);

      applyHitStatusEffects(newEffects, proj, e.type, now);

      updatedEnemies[ei] = { ...updatedEnemies[ei], health: out.health, shield: out.shield, effects: newEffects };
    }
  });

  // 穿透子彈繼續飛行
  moveProjectileWithCurve(proj, currentAngle, moveSpeed);
  return true;
}

// 範圍傷害（splash）與近距連鎖（chain）：對 target 周圍的非 target 敵人造成額外傷害
function applySplashAndChain(proj: Projectile, target: Enemy, ctx: ProjStepCtx): void {
  const { updatedEnemies, enemyHash, get } = ctx;
  const hasSplash = !!proj.effects?.splash;
  const hasChain = !!proj.effects?.chain;
  if (!hasSplash && !hasChain) return;

  const splashRadius = hasSplash ? proj.effects!.splash!.radius : 0;
  const splashRadiusSq = splashRadius * splashRadius;
  const CHAIN_RADIUS = 2.5;
  const CHAIN_RADIUS_SQ = 6.25;
  const searchRadius = Math.max(splashRadius, hasChain ? CHAIN_RADIUS : 0);

  forEachInHashRadius(enemyHash, target.x, target.y, searchRadius, (i) => {
    const e = updatedEnemies[i];
    if (e.health <= 0 || e.id === target.id) return;
    // 相位中的敵人不受 AOE / 近距連鎖影響
    if (isEnemyPhased(e, ctx.now)) return;

    const distSqToTarget = (e.x - target.x) ** 2 + (e.y - target.y) ** 2;
    let curHealth = e.health;
    let curShield = e.shield ?? 0;
    const rolling = {
      type: e.type,
      health: curHealth,
      maxHealth: e.maxHealth,
      shield: curShield,
      spawnTime: e.spawnTime,
      armorBonus: e.armorBonus,
      escortArmor: e.escortArmor,
      effects: e.effects,
    };

    if (hasSplash && distSqToTarget <= splashRadiusSq) {
      const distToTarget = Math.sqrt(distSqToTarget);
      const splashDamage = proj.damage * (1 - distToTarget / proj.effects!.splash!.radius) * 0.6;
      const out = dealTowerHit(rolling, splashDamage, proj, ctx.now);
      ctx.addDamage(proj.towerId, out.dealt);
      ctx.checkKill(proj.towerId, curHealth, out.health);
      get().addDamageText(e.x, e.y, out.dealt, false, proj.color);
      curHealth = out.health;
      curShield = out.shield;
      rolling.health = curHealth;
      rolling.shield = curShield;
    }

    if (hasChain && distSqToTarget <= CHAIN_RADIUS_SQ) {
      const chainDamage = proj.damage * proj.effects!.chain!.damageReduction;
      const out = dealTowerHit(rolling, chainDamage, proj, ctx.now);
      ctx.addDamage(proj.towerId, out.dealt);
      ctx.checkKill(proj.towerId, curHealth, out.health);
      curHealth = out.health;
      curShield = out.shield;
    }

    if (curHealth !== e.health || curShield !== (e.shield ?? 0)) {
      const splashEffects = [...e.effects];
      applyHitStatusEffects(splashEffects, proj, e.type, ctx.now);
      updatedEnemies[i] = { ...e, health: curHealth, shield: curShield, effects: splashEffects };
    }
  });
}

// 直接命中：對目標造成傷害並套用效果、風塔擊退，再處理 splash / chain（不保留子彈）
function handleDirectHit(proj: Projectile, target: Enemy, ctx: ProjStepCtx): void {
  const { updatedEnemies, enemyIdxById, now, get } = ctx;
  const out = dealTowerHit(target, proj.damage, proj, now);

  // 相位免疫：子彈擊中幽影直接消散，不造成傷害也不套用效果
  if (out.immune) {
    get().addStatusText(target.x, target.y, '免疫', '#93c5fd');
    return;
  }

  const oldHealth = target.health;
  const newEffects = [...target.effects];

  // 追蹤傷害和擊殺
  ctx.addDamage(proj.towerId, out.dealt);
  ctx.checkKill(proj.towerId, oldHealth, out.health);

  // 特效：傷害文字與命中粒子（傷害全被護盾吸收時顯示藍色）
  const { addDamageText, addImpactParticles, addShake } = get();
  const fullyAbsorbed = out.health === oldHealth && out.shield < (target.shield ?? 0);
  addDamageText(target.x, target.y, out.dealt, proj.isCrit, fullyAbsorbed ? '#60a5fa' : proj.color);
  addImpactParticles(target.x, target.y, proj.color, proj.isCrit ? 12 : 8);

  // 震動效果：特定塔類型命中時觸發
  if (proj.towerType === 'cannon') addShake(1.5);
  if (proj.towerType === 'sniper') addShake(proj.isCrit ? 2.5 : 0.8);
  if (proj.towerType === 'shotgun') addShake(0.3); // 多發子彈同時命中會疊加

  applyHitStatusEffects(newEffects, proj, target.originType ?? target.type, now);

  // 風塔擊退效果：將敵人吹離路徑（飛行敵人不受擊退——其直線飛行不依賴路徑）
  let windDisplacedData: ReturnType<typeof computeWindKnockback> | null = null;
  const targetFlying = getEnemyData(target.originType ?? target.type).ability === 'flying';
  if (proj.effects?.wind && !target.isDisplaced && !targetFlying) {
    const knockDist = proj.effects.wind.knockbackDistance;
    const windPath = PATHS[get().selectedPath];
    windDisplacedData = computeWindKnockback(target, windPath, knockDist);
  }

  // 處理 target 本身（health/effects/wind 擊退）
  const targetIdxForUpdate = enemyIdxById.get(target.id);
  if (targetIdxForUpdate !== undefined) {
    const eTarget = updatedEnemies[targetIdxForUpdate];
    const base = { ...eTarget, health: out.health, shield: out.shield, effects: newEffects };
    if (windDisplacedData) {
      updatedEnemies[targetIdxForUpdate] = {
        ...base,
        x: windDisplacedData.x,
        y: windDisplacedData.y,
        isDisplaced: true,
        displacedTargetX: windDisplacedData.targetX,
        displacedTargetY: windDisplacedData.targetY,
        pathIndex: windDisplacedData.returnIdx,
        segmentWaypointIndex: windDisplacedData.returnWpIdx ?? eTarget.segmentWaypointIndex,
      };
    } else {
      updatedEnemies[targetIdxForUpdate] = base;
    }
  }

  // 然後處理 splash + chain（用 spatial hash 只查範圍內的非 target 敵人）
  applySplashAndChain(proj, target, ctx);
}

// 處理單顆投射物的本幀更新；回傳 true 表示保留（續存），false 表示移除
function stepProjectile(proj: Projectile, ctx: ProjStepCtx): boolean {
  const { updatedEnemies, enemyIdxById, deltaTime } = ctx;
  const targetIdx = enemyIdxById.get(proj.targetId);
  const target = targetIdx !== undefined ? updatedEnemies[targetIdx] : undefined;

  proj.lifetime = (proj.lifetime || 0) + deltaTime;
  const maxLife = proj.maxLifetime || 5000;

  // 超過最大生存時間
  if (proj.lifetime > maxLife) return false;

  // 保存上一幀位置（用於軌跡渲染）
  proj.prevX = proj.x;
  proj.prevY = proj.y;
  updateTrail(proj);

  if (!target) return handleNoTarget(proj, ctx);

  // 直接追蹤目標位置
  proj.targetX = target.x;
  proj.targetY = target.y;

  // 瞬間命中類型（雷射、閃電）
  if (proj.isInstant) return handleInstantHit(proj, target, targetIdx, ctx);

  // 計算到目標的向量（使用實際目標位置）並平滑旋轉（追蹤效果）
  const dx = target.x - proj.x;
  const dy = target.y - proj.y;
  const targetAngle = Math.atan2(dy, dx);
  let currentAngle = proj.rotation || targetAngle;
  const angleDiff = targetAngle - currentAngle;
  const normalizedDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
  const turnSpeed = (proj.homingStrength || 0.8) * 0.15;
  currentAngle += normalizedDiff * turnSpeed;
  proj.rotation = currentAngle;

  // 這一幀的移動距離與命中半徑
  const moveSpeed = proj.speed * deltaTime;
  const baseHitRadius = 0.35 + (proj.size || 5) * 0.015;
  const hitRadiusSq = baseHitRadius * baseHitRadius;
  const hasFlownEnough = proj.lifetime > 50; // 至少飛行 50ms
  const motion: ProjMotion = { currentAngle, moveSpeed, baseHitRadius, hitRadiusSq, hasFlownEnough };

  // 穿透子彈：檢測路徑上碰到的所有敵人
  if (proj.piercing) return handlePiercing(proj, ctx, motion);

  const distSq = (target.x - proj.x) ** 2 + (target.y - proj.y) ** 2;
  const willPassThrough = hasFlownEnough && distSq < moveSpeed * moveSpeed * 2.25;
  const willHit = distSq < hitRadiusSq || willPassThrough;

  if (willHit) {
    handleDirectHit(proj, target, ctx);
    return false; // 移除子彈
  }

  // 曲線路徑（如果設定了曲線偏移）後續飛行，保留子彈
  moveProjectileWithCurve(proj, currentAngle, moveSpeed);
  return true;
}

export const createUpdateProjectiles =
  (get: GetState, set: SetState) =>
  (deltaTime: number) => {
    const { projectiles, enemies, towers } = get();
    const now = Date.now();
    const updatedEnemies = [...enemies];

    // 性能優化：預建 id -> index 表，取代 updatedEnemies.find(e => e.id === ...)
    // 由於本函式只會 mutate 索引位置而不會 splice，索引在整個過程中保持有效。
    const enemyIdxById = new Map<string, number>();
    for (let i = 0; i < updatedEnemies.length; i++) {
      enemyIdxById.set(updatedEnemies[i].id, i);
    }

    // Spatial Hash：用於 chain、piercing、splash 等範圍查詢加速
    // 注意：風塔擊退會改變 enemy.x/y，hash 中位置會略過時，但屬於低頻邊緣情況
    const enemyHash = buildSpatialHash(updatedEnemies);

    // 追蹤塔傷害和擊殺統計
    const towerDamageMap = new Map<string, number>();
    const towerKillsMap = new Map<string, number>();

    // 用於記錄本幀是否有任何敵人受到任何傷害（包含直接命中、範圍、連鎖等）
    let someEnemyTookDamage = false;

    const addDamage = (towerId: string, damage: number) => {
      if (damage > 0) someEnemyTookDamage = true;
      towerDamageMap.set(towerId, (towerDamageMap.get(towerId) || 0) + damage);
    };

    const addKill = (towerId: string) => {
      towerKillsMap.set(towerId, (towerKillsMap.get(towerId) || 0) + 1);
    };

    const checkKill = (towerId: string, oldHealth: number, newHealth: number) => {
      if (oldHealth > 0 && newHealth <= 0) {
        addKill(towerId);
      }
    };

    const ctx: ProjStepCtx = {
      get,
      now,
      deltaTime,
      updatedEnemies,
      enemyIdxById,
      enemyHash,
      addDamage,
      checkKill,
    };

    const updatedProjectiles: Projectile[] = [];
    for (let pi = 0; pi < projectiles.length; pi++) {
      const proj = projectiles[pi];
      if (stepProjectile(proj, ctx)) {
        updatedProjectiles.push(proj);
      }
    }

    // 更新塔統計：本幀無任何傷害/擊殺時，towers 維持原陣列引用
    const towersChanged = towerDamageMap.size > 0 || towerKillsMap.size > 0;
    const updatedTowers = !towersChanged
      ? towers
      : towers.map(tower => {
          const damageDealt = towerDamageMap.get(tower.id) || 0;
          const killsGained = towerKillsMap.get(tower.id) || 0;
          if (damageDealt > 0 || killsGained > 0) {
            return {
              ...tower,
              totalDamage: tower.totalDamage + damageDealt,
              kills: tower.kills + killsGained,
            };
          }
          return tower;
        });

    // 教學模式：只要有敵人受到傷害就降速為 1 倍（同步呼叫）
    if (someEnemyTookDamage || loopFlags.hasNewProjectilesThisFrame || loopFlags.enemyInRange) {
      const state = get();
      if (state.gameSpeed > 1) {
        const tutorialState = useTutorialStore.getState();
        const stepObj = INTERACTIVE_TUTORIAL_STEPS[tutorialState.currentStepIndex];
        if (tutorialState.isActive && stepObj && stepObj.action === 'wait_wave_end') {
          state.setGameSpeed(1);
        }
      }
    }

    // 統計追蹤（同步呼叫，一次取得 store 即可）
    const statsStore = useStatsStore.getState();
    towerDamageMap.forEach((damage, towerId) => {
      if (damage > 0) {
        statsStore.trackTowerDamage(towerId, damage);
      }
    });
    towerKillsMap.forEach((kills, towerId) => {
      if (kills > 0) {
        for (let i = 0; i < kills; i++) {
          statsStore.trackTowerKill(towerId);
        }
      }
    });

    // 不再每幀同步更新 grid 中的 tower 狀態，以節省效能
    // （僅當升級、放置、出售時才更新 grid）

    // 更新選中的塔（如果其狀態有改變）
    const { selectedTower } = get();
    let updatedSelectedTower = selectedTower;
    if (selectedTower && (towerDamageMap.has(selectedTower.id) || towerKillsMap.has(selectedTower.id))) {
      const updatedSelected = updatedTowers.find(t => t.id === selectedTower.id);
      if (updatedSelected) {
        updatedSelectedTower = updatedSelected;
      }
    }

    // enemies 僅在本幀確有敵人受傷時才寫回新陣列；無命中時沿用原引用以省去重複 re-render。
    // 不變量：所有 updatedEnemies 的修改都先經過 addDamage(正值)，故 someEnemyTookDamage 等價於敵人陣列已變動。
    set({
      projectiles: updatedProjectiles,
      enemies: someEnemyTookDamage ? updatedEnemies : enemies,
      towers: updatedTowers,
      selectedTower: updatedSelectedTower,
    });
  };
