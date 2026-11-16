import type { AutoBattleCandidate, AutoBattleContext, AutoBattleWeights, ScoreFactor } from '@/types/autobattle';
import type { TowerType } from '@/types/game';
import { TOWER_DATA, ENEMY_DATA } from '@/data/gameData';
import { getTowerUpgradeCost, canAutoUpgradeTower } from '@/data/towerUpgradeCost';
import { getTowerBuildCost } from '@/data/towerCost';
import { findSynergyRecipe } from '@/data/towerSynergyData';
import { computeFusionCost, getFusionRecipe } from '@/data/fusionRecipes';
import { effectiveDps } from '@/data/autobattle/towerDps';
import { getPreset } from '@/data/autobattle/presets';
import { counterAffinity } from '@/data/enemyCounters';
import { hasEnemyAbility } from '@/data/gameData/enemyAbilities';
import { collectPathPoints, coveragePointsOf, maxCoverageOfMap, gridSizeOf } from '@/data/autobattle/mapInfo';
import { DECISION_LIMITS } from '@/data/autobattle/scoreWeights';
import { applyPresetBoost, clamp01, finalizeCandidate, makeFactor, resolveWeights, scaleBetween, sumFactors } from './scoring';
import type { PathConfig } from '@/types/game';

/**
 * 塔的「綜合價值」：DPS + 經濟塔的產金能力（每 1 金/秒 折算成 15 DPS 的份量）。
 * 只用 DPS 估價會讓經濟塔永遠排最後，前期錯過複利。
 */
export const valueOf = (type: TowerType, level: number): number => {
  const data = TOWER_DATA[type];
  const dps = dpsOf(type, level);
  const income = data?.moneyGeneration ? (data.moneyPerSecond ?? 0) * 15 : 0;
  return dps + income;
};

/** 塔的 DPS 估值（含暴擊／連鎖／濺射；決策層專用，不當作實際傷害） */
export const dpsOf = (type: TowerType, level: number): number => effectiveDps(type, level);

/** 塔的建造成本（含難度倍率） */
export const buildCostOf = (type: TowerType, costMult: number): number => {
  const data = TOWER_DATA[type];
  return data ? getTowerBuildCost(data.cost, costMult) : Number.POSITIVE_INFINITY;
};

const cellKey = (col: number, row: number): string => `${col},${row}`;

/**
 * 塔位壓力 0..1：場上塔越多，新增塔位的邊際價值越低。
 * 用於給「不佔新塔位」的動作（升級、融合）加分，避免防線卡在塔位上限。
 */
const slotPressure = (ctx: AutoBattleContext): number => clamp01((ctx.towers.length - 10) / 24);


/** 塔位最小間距（格）：與實際放置的圓形佔位接近，太保守會浪費可用格 */
const MIN_TOWER_GAP = 1.3;

const occupied = (ctx: AutoBattleContext, col: number, row: number): boolean =>
  ctx.towers.some((t) => Math.hypot(t.col - col, t.row - row) < MIN_TOWER_GAP);

const inAllowedZone = (ctx: AutoBattleContext, col: number, row: number): boolean => {
  if (ctx.config.mode !== 'zones') return true;
  if (ctx.config.allowedTiles.length === 0) return true;
  return ctx.config.allowedTiles.includes(cellKey(col, row));
};

const isLocked = (ctx: AutoBattleContext, key: string): boolean => ctx.config.lockedTargets.includes(key);

/** 敵人威脅權重：進度越深、血量比例越高越危險 */
const enemyWeight = (e: AutoBattleContext['enemies'][number]): number => {
  const data = ENEMY_DATA[e.type];
  const danger = hasEnemyAbility(data, 'miniboss') ? 1.5 : hasEnemyAbility(data, 'flying') ? 1.25 : 1;
  const hp = e.maxHealth > 0 ? e.health / e.maxHealth : 0;
  return (0.35 + e.progress) * hp * danger;
};

/**
 * 對甲契合度 0..1：射程內有裝甲敵人時，這個塔型打不打得到傷害。
 * 毒／火無視裝甲；單發傷害越高，被固定減傷吃掉的比例越小。
 */
const armorFitOf = (type: TowerType, enemies: AutoBattleContext['enemies']): number => {
  if (enemies.length === 0) return 0.5;
  const data = TOWER_DATA[type];
  const perShot = data.damage > 0 ? data.damage : (data.damagePerSecond ?? 0);
  let weightSum = 0;
  let fitSum = 0;
  for (const e of enemies) {
    const armor = ENEMY_DATA[e.type]?.armorValue ?? 0;
    if (armor <= 0) continue;
    const w = enemyWeight(e);
    const fit = data.poisonEffect || data.flameEffect
      ? 1
      : Math.max(0.2, Math.min(1, (perShot - armor) / Math.max(1, perShot)));
    fitSum += fit * w;
    weightSum += w;
  }
  // 沒有裝甲敵人時給中性值，避免因子把「沒裝甲」誤判成優勢
  return weightSum > 0 ? fitSum / weightSum : 0.5;
};

const mixTypeMatch = (counter: number, armorFit: number): number => 0.6 * counter + 0.4 * armorFit;

const enemiesNear = (ctx: AutoBattleContext, col: number, row: number, range: number): AutoBattleContext['enemies'] =>
  ctx.enemies.filter((e) => Math.hypot(e.x - col, e.y - row) <= range + 0.5);

const synergyScore = (ctx: AutoBattleContext, type: TowerType, col: number, row: number): number => {
  let score = 0;
  for (const t of ctx.towers) {
    if (Math.hypot(t.col - col, t.row - row) > 2.6) continue;
    if (findSynergyRecipe(type, t.type)) score += 0.4;
  }
  return Math.min(score, 1);
};

export interface CandidateBuildInput {
  ctx: AutoBattleContext;
  pathConfig: PathConfig | undefined;
  costMult: number;
}

/** 產生全部候選（已依動作種類分組，未排序） */
export const buildCandidates = ({ ctx, pathConfig, costMult }: CandidateBuildInput): AutoBattleCandidate[] => {
  const points = collectPathPoints(pathConfig);
  const { cols, rows } = gridSizeOf(pathConfig);
  const out: AutoBattleCandidate[] = [];
  const affordable = (type: TowerType): boolean => buildCostOf(type, costMult) <= ctx.money;


  // ---- 放塔 ----
  const towerTypes = (Object.keys(TOWER_DATA) as TowerType[]).filter(affordable);
  if (towerTypes.length > 0 && points.length > 0) {
    const maxRange = Math.max(...towerTypes.map((t) => TOWER_DATA[t]?.range ?? 0));
    const maxCoverage = Math.max(1, maxCoverageOfMap(points, cols, rows, maxRange));
    const bestRoi = Math.max(
      0.0001,
      ...towerTypes.map((t) => valueOf(t, 1) / Math.max(1, buildCostOf(t, costMult))),
    );
    const maxDps = Math.max(1, ...towerTypes.map((t) => valueOf(t, 1)));

    const spots: { col: number; row: number; coverage: number }[] = [];
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        if (occupied(ctx, col, row)) continue;
        if (!inAllowedZone(ctx, col, row)) continue;
        if (isLocked(ctx, cellKey(col, row))) continue;
        const coverage = coveragePointsOf(points, col, row, maxRange);
        if (coverage <= 0) continue;
        spots.push({ col, row, coverage });
      }
    }
    spots.sort((a, b) => b.coverage - a.coverage);
    // 先決定「蓋哪三種塔」，再讓每種塔用『自己的射程』去找最佳點位；
    // 先前先用最長射程挑點、再塞短射程塔，會挑到對短射程根本沒覆蓋的位置。
    const spotPool = spots.slice(0, 40);
    const typeRank = [...towerTypes]
      .map((type) => {
        const value = valueOf(type, 1);
        const roi = value / Math.max(1, buildCostOf(type, costMult)) / bestRoi;
        const perSlot = value / maxDps;
        return { type, score: roi * 0.45 + perSlot * (0.55 + 0.45 * slotPressure(ctx)) };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const picks: { type: TowerType; col: number; row: number; coverage: number }[] = [];
    for (const entry of typeRank) {
      const range = TOWER_DATA[entry.type].range;
      const best = spotPool
        .map((s) => ({ col: s.col, row: s.row, coverage: coveragePointsOf(points, s.col, s.row, range) }))
        .filter((s) => s.coverage > 0)
        .sort((x, y) => y.coverage - x.coverage)
        .slice(0, 4);
      for (const s of best) picks.push({ type: entry.type, col: s.col, row: s.row, coverage: s.coverage });
    }

    for (const pick of picks) {
        const type = pick.type;
        const data = TOWER_DATA[type];
        const cost = buildCostOf(type, costMult);
        const range = data.range;
        const spot = { col: pick.col, row: pick.row, coverage: pick.coverage };
        const near = enemiesNear(ctx, spot.col, spot.row, range);
        const weights = adjustWeightsForSurplus(resolveWeights('place', ctx.config), ctx);
        const factors = [
          makeFactor('coverage', spot.coverage, coveragePointsOf(points, spot.col, spot.row, range) / maxCoverage, weights.coverage ?? 0, `${spot.coverage}/${maxCoverage}`),
          makeFactor('threatFit', sumEnemyWeight(near), scaleBetween(sumEnemyWeight(near), 0, 6), weights.threatFit ?? 0),
          makeFactor(
            'typeMatch',
            mixTypeMatch(counterAffinity(near.map((e) => ({ type: e.type, weight: enemyWeight(e) })), type), armorFitOf(type, near)),
            mixTypeMatch(counterAffinity(near.map((e) => ({ type: e.type, weight: enemyWeight(e) })), type), armorFitOf(type, near)),
            weights.typeMatch ?? 0,
          ),
          makeFactor('economyROI', dpsOf(type, 1) / Math.max(1, cost), (dpsOf(type, 1) / Math.max(1, cost)) / bestRoi, weights.economyROI ?? 0),
          makeFactor('tempo', tempoRaw(ctx), tempoRaw(ctx), weights.tempo ?? 0),
          makeFactor('reserve', ctx.money - cost, scaleBetween(ctx.money - cost, 0, Math.max(1, ctx.lookahead.moneyReserve)), weights.reserve ?? 0),
          makeFactor('synergy', synergyScore(ctx, type, spot.col, spot.row), synergyScore(ctx, type, spot.col, spot.row), weights.synergy ?? 0),
        ];
        out.push(finalizeCandidate({
          id: `place:${type}:${cellKey(spot.col, spot.row)}`,
          kind: 'place',
          labelKey: 'content.autoBattle.action.place',
          labelParams: { tower: type, col: spot.col, row: spot.row },
          towerType: type,
          col: spot.col,
          row: spot.row,
          cost,
          factors: applyPresetBoost(factors as ScoreFactor[], ctx.config.presetId),
          softBonus: 0,
          penalties: 0,
          total: 0,
          vetoedBy: [],
        }));
    }
  }

  // ---- 升級 ----
  for (const tower of ctx.towers) {
    const data = TOWER_DATA[tower.type];
    if (!data || !canAutoUpgradeTower(tower)) continue;
    const cost = getTowerUpgradeCost(data.cost, tower.level);
    if (cost > ctx.money) continue;
    if (isLocked(ctx, tower.id)) continue;
    const before = dpsOf(tower.type, tower.level);
    const after = dpsOf(tower.type, tower.level + 1);
    const gain = before > 0 ? (after - before) / before : 0;
    const near = enemiesNear(ctx, tower.col, tower.row, data.range);
    const weights = adjustWeightsForSurplus(resolveWeights('upgrade', ctx.config), ctx);
    const factors = [
      makeFactor('marginal', gain, scaleBetween(gain, 0, 0.6), weights.marginal ?? 0, `Lv${tower.level}→${tower.level + 1}`),
      makeFactor('economyROI', (after - before) / Math.max(1, cost), scaleBetween((after - before) / Math.max(1, cost), 0, 2), weights.economyROI ?? 0),
      makeFactor(
        'typeMatch',
        mixTypeMatch(counterAffinity(near.map((e) => ({ type: e.type, weight: enemyWeight(e) })), tower.type), armorFitOf(tower.type, near)),
        mixTypeMatch(counterAffinity(near.map((e) => ({ type: e.type, weight: enemyWeight(e) })), tower.type), armorFitOf(tower.type, near)),
        weights.typeMatch ?? 0,
      ),
      makeFactor('threatFit', sumEnemyWeight(near), scaleBetween(sumEnemyWeight(near), 0, 6), weights.threatFit ?? 0),
      makeFactor('reserve', ctx.money - cost, scaleBetween(ctx.money - cost, 0, Math.max(1, ctx.lookahead.moneyReserve)), weights.reserve ?? 0),
    ];
    out.push(finalizeCandidate({
      id: `upgrade:${tower.id}`,
      kind: 'upgrade',
      labelKey: 'content.autoBattle.action.upgrade',
      labelParams: { tower: tower.type, level: tower.level + 1 },
      towerType: tower.type,
      towerId: tower.id,
      col: tower.col,
      row: tower.row,
      cost,
      factors,
      softBonus: 0.24 * slotPressure(ctx),
      penalties: 0,
      total: 0,
      vetoedBy: [],
    }));
  }

  // ---- 賣塔 ----
  if (ctx.towers.length >= 4) {
    for (const tower of ctx.towers) {
      if (isLocked(ctx, tower.id)) continue;
      const weights = resolveWeights('sell', ctx.config);
      const near = enemiesNear(ctx, tower.col, tower.row, TOWER_DATA[tower.type]?.range ?? 3);
      const range = TOWER_DATA[tower.type]?.range ?? 3;
      const coveredPoints = points.filter((p) => Math.hypot(p.col - tower.col, p.row - tower.row) <= range);
      // 這座塔「獨佔」的路徑點：拿掉它之後沒有任何其他塔還打得到
      const uniquePoints = coveredPoints.filter((p) => !ctx.towers.some((other) => {
        if (other.id === tower.id) return false;
        const otherRange = TOWER_DATA[other.type]?.range ?? 3;
        return Math.hypot(p.col - other.col, p.row - other.row) <= otherRange;
      }));
      const uniqueRatio = coveredPoints.length > 0 ? uniquePoints.length / coveredPoints.length : 1;
      // 獨佔覆蓋越高＝越不能賣；完全被其他塔重複涵蓋才視為安全
      const safety = clamp01(1 - uniqueRatio);
      const refund = Math.floor(buildCostOf(tower.type, costMult) * 0.6);
      // 賣塔只能是「換更好的塔」的手段，不是提款機：
      // 沒有買得起、而且明顯更強的替代塔時，就不要賣。
      const currentDps = dpsOf(tower.type, tower.level);
      const betterReplacement = (Object.keys(TOWER_DATA) as TowerType[]).some((type) => {
        if (type === tower.type) return false;
        if (buildCostOf(type, costMult) > ctx.money + refund) return false;
        return dpsOf(type, 1) > currentDps * 1.2;
      });
      if (!betterReplacement) continue;
      // 只有「塔位真的吃緊」且「這座塔的覆蓋大多被其他塔重複」時才值得換；
      // 否則會出現賣了又建、建了又賣的來回震盪。
      if (slotPressure(ctx) < 0.85) continue;
      if (uniqueRatio > 0.4) continue;
      // 賣塔不能當提款機：手上現金已經低於保留金時，先想辦法賺錢或升級，不是拆防線
      if (ctx.money < ctx.lookahead.moneyReserve) continue;
      // 只有剛蓋好的塔可能被換掉：已經投資過等級的塔，換掉等於把升級費丟掉
      if (tower.level > 1) continue;
      if (uniqueRatio > 0.2) continue;
      if (!getPreset(ctx.config.presetId).allowSell) continue;
      if (uniqueRatio > 0.15 && ctx.money < ctx.lookahead.moneyReserve * 2) continue;
      const factors = [
        makeFactor('safety', safety, safety, weights.safety ?? 0, `重複覆蓋 ${((1 - uniqueRatio) * 100).toFixed(0)}%`),
        makeFactor('economyROI', refund, scaleBetween(refund, 0, 300), weights.economyROI ?? 0),
        makeFactor('tempo', 1 - tempoRaw(ctx), 1 - tempoRaw(ctx), weights.tempo ?? 0),
        makeFactor('reserve', ctx.money + refund, scaleBetween(ctx.money + refund, 0, Math.max(1, ctx.lookahead.moneyReserve)), weights.reserve ?? 0),
      ];
      const penalty = sumEnemyWeight(near) > 2 ? 0.2 : 0;
      out.push(finalizeCandidate({
        id: `sell:${tower.id}`,
        kind: 'sell',
        labelKey: 'content.autoBattle.action.sell',
        labelParams: { tower: tower.type },
        towerType: tower.type,
        towerId: tower.id,
        col: tower.col,
        row: tower.row,
        cost: -refund,
        factors,
        softBonus: 0,
        penalties: 0,
        total: 0,
        vetoedBy: [],
      }, penalty));
    }
  }

  // ---- 融合（兩塔合一：少佔一個塔位、DPS 上限更高）----
  const fusionLimit = 4;
  let fusionCount = 0;
  for (let i = 0; i < ctx.towers.length && fusionCount < fusionLimit; i++) {
    for (let j = i + 1; j < ctx.towers.length && fusionCount < fusionLimit; j++) {
      const a = ctx.towers[i];
      const b = ctx.towers[j];
      const recipe = getFusionRecipe(a.type, b.type);
      if (!recipe) continue;
      if (isLocked(ctx, a.id) || isLocked(ctx, b.id)) continue;
      const cost = computeFusionCost(TOWER_DATA[a.type].cost, TOWER_DATA[b.type].cost, costMult);
      if (cost > ctx.money) continue;
      const result = recipe.result;
      const range = TOWER_DATA[result]?.range ?? 3;
      const near = enemiesNear(ctx, a.col, a.row, range);
      const before = dpsOf(a.type, a.level) + dpsOf(b.type, b.level);
      const after = dpsOf(result, 1);
      const freshPair = a.level <= 2 && b.level <= 2;
      // 兩座都已經養高時，融合等於把投資清零：只有 DPS 真的換得回來才合
      if (!freshPair && after < before * 1.05) continue;
      const gain = before > 0 ? (after - before) / before : 0;
      const weights = resolveWeights('fusion', ctx.config);
      const factors: ScoreFactor[] = [
        makeFactor('synergy', 1, 1, weights.synergy ?? 0, `${a.type}+${b.type}→${result}`),
        makeFactor('economyROI', gain, scaleBetween(gain, -0.2, 0.8), weights.economyROI ?? 0),
        makeFactor(
          'typeMatch',
          counterAffinity(near.map((e) => ({ type: e.type, weight: enemyWeight(e) })), result),
          counterAffinity(near.map((e) => ({ type: e.type, weight: enemyWeight(e) })), result),
          weights.typeMatch ?? 0,
        ),
        makeFactor('reserve', ctx.money - cost, scaleBetween(ctx.money - cost, 0, Math.max(1, ctx.lookahead.moneyReserve)), weights.reserve ?? 0),
      ];
      out.push(finalizeCandidate({
        id: `fusion:${a.id}+${b.id}`,
        kind: 'fusion',
        labelKey: 'content.autoBattle.action.fusion',
        labelParams: { tower: result, a: a.type, b: b.type },
        towerType: result,
        towerId: a.id,
        targetTowerId: b.id,
        resultType: result,
        col: a.col,
        row: a.row,
        cost,
        factors: applyPresetBoost(factors, ctx.config.presetId),
        softBonus: 0.45 * slotPressure(ctx),
        penalties: 0,
        total: 0,
        vetoedBy: [],
      }));
      fusionCount++;
    }
  }

  // ---- 技能 ----
  for (const tower of ctx.towers) {
    if (!tower.skillReady) continue;
    const range = TOWER_DATA[tower.type]?.range ?? 3;
    const near = enemiesNear(ctx, tower.col, tower.row, range);
    if (near.length === 0) continue;
    const weights = resolveWeights('skill', ctx.config);
    const boss = near.some((e) => e.type === 'boss' || e.type === 'miniboss');
    const timing = Math.min(1, near.length / 6) * (boss ? 1.2 : 1);
    const factors = [
      makeFactor('timing', timing, Math.min(1, timing), weights.timing ?? 0, `${near.length} 敵${boss ? ' +首領' : ''}`),
      makeFactor('threatFit', sumEnemyWeight(near), scaleBetween(sumEnemyWeight(near), 0, 6), weights.threatFit ?? 0),
      makeFactor('typeMatch', counterAffinity(near.map((e) => ({ type: e.type, weight: enemyWeight(e) })), tower.type), counterAffinity(near.map((e) => ({ type: e.type, weight: enemyWeight(e) })), tower.type), weights.typeMatch ?? 0),
    ];
    out.push(finalizeCandidate({
      id: `skill:${tower.id}`,
      kind: 'skill',
      labelKey: 'content.autoBattle.action.skill',
      labelParams: { tower: tower.type },
      towerType: tower.type,
      towerId: tower.id,
      col: tower.col,
      row: tower.row,
      cost: 0,
      factors,
      softBonus: 0,
      penalties: 0,
      total: 0,
      vetoedBy: [],
    }));
  }

  // ---- 略波 ----
  if (ctx.waveActive && ctx.allEnemiesSpawned && ctx.enemies.length > 0 && ctx.towers.length >= 3) {
    let totalDps = 0;
    for (const tower of ctx.towers) totalDps += dpsOf(tower.type, tower.level);
    const remainingHp = ctx.enemies.reduce((sum, e) => sum + e.health, 0);
    const ttk = totalDps > 0 ? remainingHp / totalDps : Number.POSITIVE_INFINITY;
    const maxProgress = ctx.enemies.reduce((m, e) => Math.max(m, e.progress), 0);
    const healthRatio = ctx.maxHealth > 0 ? ctx.health / ctx.maxHealth : 1;
    const weights = resolveWeights('skip', ctx.config);
    const safety = (1 - Math.min(1, ttk / 10)) * (1 - maxProgress) * healthRatio;
    const factors = [
      makeFactor('skipSafety', safety, safety, weights.skipSafety ?? 0, `清除 ${ttk.toFixed(1)}s`),
      makeFactor('tempo', tempoRaw(ctx), tempoRaw(ctx), weights.tempo ?? 0),
    ];
    out.push(finalizeCandidate({
      id: 'skip',
      kind: 'skip',
      labelKey: 'content.autoBattle.action.skip',
      labelParams: { wave: ctx.wave },
      cost: 0,
      factors,
      softBonus: 0,
      penalties: 0,
      total: 0,
      vetoedBy: [],
    }));
  }

  // 上限：先粗篩（總分）避免評分爆炸
  out.sort((a, b) => sumFactors(b.factors) - sumFactors(a.factors));
  return out.slice(0, DECISION_LIMITS.maxCandidates);
};

/** 一批敵人的加權威脅總和 */
export const sumEnemyWeight = (list: AutoBattleContext['enemies']): number =>
  list.reduce((sum, e) => sum + enemyWeight(e), 0);

/** 花錢節奏 0..1：波中且敵人逼近 → 高；金錢遠超保留需求 → 更高；剛開波金錢不足 → 低 */
export const tempoRaw = (ctx: AutoBattleContext): number => {
  const pressure = ctx.lookahead.pressure;
  const healthRatio = ctx.maxHealth > 0 ? ctx.health / ctx.maxHealth : 1;
  const base = ctx.waveActive ? 0.7 : 0.45;
  const richness = clamp01(ctx.money / Math.max(1, ctx.lookahead.moneyReserve) - 1);
  return Math.min(1, base + pressure * 0.5 + (1 - healthRatio) * 0.3 + richness * 0.25);
};

/**
 * 金錢溢出修正：持有金 ≥ 兩倍保留金時，代表「該花沒花」。
 * 此時壓低 reserve 權重、放大 tempo 權重，讓評分願意把錢變成塔與等級。
 */
export const adjustWeightsForSurplus = (
  weights: AutoBattleWeights,
  ctx: AutoBattleContext,
): AutoBattleWeights => {
  const reserve = Math.max(1, ctx.lookahead.moneyReserve);
  const ratio = ctx.money / reserve;
  if (ratio < 1.5) return weights;
  const overflow = Math.min(1, (ratio - 1.5) / 1.5);
  return {
    ...weights,
    reserve: (weights.reserve ?? 0) * (1 - overflow),
    tempo: Math.min(1, (weights.tempo ?? 0) * (1 + overflow * 2)),
  };
};
