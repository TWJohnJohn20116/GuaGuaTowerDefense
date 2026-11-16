import type { AutoBattleCandidate, AutoBattleContext, AutoBattleWeights, ScoreFactor } from '@/types/autobattle';
import type { TowerType } from '@/types/game';
import { TOWER_DATA, ENEMY_DATA } from '@/data/gameData';
import { getTowerUpgradeCost, canAutoUpgradeTower } from '@/data/towerUpgradeCost';
import { getTowerBuildCost } from '@/data/towerCost';
import { findSynergyRecipe } from '@/data/towerSynergyData';
import { computeFusionCost, getFusionRecipe } from '@/data/fusionRecipes';
import { counterAffinity } from '@/data/enemyCounters';
import { hasEnemyAbility } from '@/data/gameData/enemyAbilities';
import { collectPathPoints, coveragePointsOf, maxCoverageOfMap, gridSizeOf } from '@/data/autobattle/mapInfo';
import { DECISION_LIMITS } from '@/data/autobattle/scoreWeights';
import { applyPresetBoost, clamp01, finalizeCandidate, makeFactor, resolveWeights, scaleBetween, sumFactors } from './scoring';
import type { PathConfig } from '@/types/game';

/** 塔的有效 DPS 估算（與舊引擎同公式；升級每級 +25%） */
export const dpsOf = (type: TowerType, level: number): number => {
  const data = TOWER_DATA[type];
  if (!data) return 0;
  const base = data.damagePerSecond ?? data.damage * (data.fireRate ?? 1);
  return base * (1 + (level - 1) * 0.25);
};

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

const occupied = (ctx: AutoBattleContext, col: number, row: number): boolean =>
  ctx.towers.some((t) => Math.hypot(t.col - col, t.row - row) < 1.6);

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
      ...towerTypes.map((t) => dpsOf(t, 1) / Math.max(1, buildCostOf(t, costMult))),
    );

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
    const spotLimit = Math.min(12, spots.length);
    for (let i = 0; i < spotLimit; i++) {
      const spot = spots[i];
      // 依「覆蓋 × 對位 × ROI」挑前三種塔，避免 12 格 × 22 種的組合爆炸
      const ranked = [...towerTypes]
        .map((type) => {
          const range = TOWER_DATA[type].range;
          const cover = coveragePointsOf(points, spot.col, spot.row, range) / maxCoverage;
          const near = enemiesNear(ctx, spot.col, spot.row, range);
          const typeMatch = counterAffinity(
            near.map((e) => ({ type: e.type, weight: enemyWeight(e) })),
            type,
          );
          const roi = (dpsOf(type, 1) / Math.max(1, buildCostOf(type, costMult))) / bestRoi;
          return { type, score: cover * 0.5 + typeMatch * 0.3 + roi * 0.2 };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      for (const pick of ranked) {
        const type = pick.type;
        const data = TOWER_DATA[type];
        const cost = buildCostOf(type, costMult);
        const range = data.range;
        const near = enemiesNear(ctx, spot.col, spot.row, range);
        const weights = adjustWeightsForSurplus(resolveWeights('place', ctx.config), ctx);
        const factors = [
          makeFactor('coverage', spot.coverage, coveragePointsOf(points, spot.col, spot.row, range) / maxCoverage, weights.coverage ?? 0, `${spot.coverage}/${maxCoverage}`),
          makeFactor('threatFit', sumEnemyWeight(near), scaleBetween(sumEnemyWeight(near), 0, 6), weights.threatFit ?? 0),
          makeFactor('typeMatch', counterAffinity(near.map((e) => ({ type: e.type, weight: enemyWeight(e) })), type), counterAffinity(near.map((e) => ({ type: e.type, weight: enemyWeight(e) })), type), weights.typeMatch ?? 0),
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
      makeFactor('typeMatch', counterAffinity(near.map((e) => ({ type: e.type, weight: enemyWeight(e) })), tower.type), counterAffinity(near.map((e) => ({ type: e.type, weight: enemyWeight(e) })), tower.type), weights.typeMatch ?? 0),
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
      const cover = points.length > 0
        ? coveragePointsOf(points, tower.col, tower.row, TOWER_DATA[tower.type]?.range ?? 3) / Math.max(1, points.length)
        : 0;
      const safety = 1 - cover;
      const refund = Math.floor(buildCostOf(tower.type, costMult) * 0.6);
      const factors = [
        makeFactor('safety', safety, safety, weights.safety ?? 0, `覆蓋 ${(cover * 100).toFixed(0)}%`),
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
