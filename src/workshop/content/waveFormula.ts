/**
 * 波次公式化生成
 *
 * 為什麼需要：手排 20 波以上時，作者通常只是「每波多幾隻、每 5 波來一隻王」，
 * 這種節奏用公式表達比逐波拉時間軸快得多。
 *
 * 注意資料模型的邊界：WaveConfig 只有 enemies(type/count/delay) 與 reward，
 * 沒有「血量倍率」欄位——敵人血量屬於 EnemyData。所以公式能控制的是
 * 「數量成長、型別升級、Boss 插入、獎勵成長」，不是直接把血量乘上去。
 */
import type { WaveConfig } from '@/types/game';

/** 一個波次階梯：從第 fromWave 波開始改用這個敵人型別與基礎數量 */
export interface WaveTier {
  type: string;
  fromWave: number;
  count: number;
}

export interface WaveFormula {
  /** 總波數（1~200） */
  waves: number;
  /** 型別階梯；依 fromWave 由小到大 */
  tiers: WaveTier[];
  /** 每波在該階梯基礎數量上再加幾隻 */
  countGrowth: number;
  /** 每幾波插一隻 Boss（0＝不插） */
  bossEvery: number;
  bossType: string;
  bossCount: number;
  /** 同一波內敵人的生成間隔（毫秒） */
  intervalMs: number;
  rewardBase: number;
  rewardGrowth: number;
}

export const DEFAULT_WAVE_FORMULA: WaveFormula = {
  waves: 15,
  tiers: [{ type: 'grunt', fromWave: 1, count: 6 }],
  countGrowth: 2,
  bossEvery: 5,
  bossType: 'boss',
  bossCount: 1,
  intervalMs: 600,
  rewardBase: 20,
  rewardGrowth: 5,
};

const clampInt = (value: unknown, min: number, max: number, fallback: number): number => {
  const parsed = typeof value === "number" && Number.isFinite(value) ? Math.round(value) : fallback;
  return Math.min(max, Math.max(min, parsed));
};

/** 把外部輸入收斂成合法公式（UI 直接餵使用者輸入也不會產生壞波次） */
export function normalizeFormula(input: Partial<WaveFormula>): WaveFormula {
  const waves = clampInt(input.waves, 1, 200, DEFAULT_WAVE_FORMULA.waves);
  const rawTiers = Array.isArray(input.tiers) ? input.tiers : DEFAULT_WAVE_FORMULA.tiers;
  const tiers: WaveTier[] = rawTiers
    .filter((tier) => tier && typeof tier.type === "string" && tier.type.trim().length > 0)
    .map((tier) => ({
      type: tier.type.trim(),
      fromWave: clampInt(tier.fromWave, 1, waves, 1),
      count: clampInt(tier.count, 1, 99, 1),
    }))
    .sort((a, b) => a.fromWave - b.fromWave);
  return {
    waves,
    tiers: tiers.length > 0 ? tiers : DEFAULT_WAVE_FORMULA.tiers,
    countGrowth: clampInt(input.countGrowth, 0, 50, DEFAULT_WAVE_FORMULA.countGrowth),
    bossEvery: clampInt(input.bossEvery, 0, 50, DEFAULT_WAVE_FORMULA.bossEvery),
    bossType:
      typeof input.bossType === "string" && input.bossType.trim().length > 0
        ? input.bossType.trim()
        : DEFAULT_WAVE_FORMULA.bossType,
    bossCount: clampInt(input.bossCount, 1, 20, DEFAULT_WAVE_FORMULA.bossCount),
    intervalMs: clampInt(input.intervalMs, 50, 5000, DEFAULT_WAVE_FORMULA.intervalMs),
    rewardBase: clampInt(input.rewardBase, 0, 9999, DEFAULT_WAVE_FORMULA.rewardBase),
    rewardGrowth: clampInt(input.rewardGrowth, 0, 999, DEFAULT_WAVE_FORMULA.rewardGrowth),
  };
}

/** 產生波次；純函式，同一份公式永遠得到同一份結果 */
export function generateWaves(input: Partial<WaveFormula>): WaveConfig[] {
  const formula = normalizeFormula(input);
  const waves: WaveConfig[] = [];
  for (let wave = 1; wave <= formula.waves; wave += 1) {
    let tier = formula.tiers[0];
    for (const candidate of formula.tiers) {
      if (candidate.fromWave <= wave) tier = candidate;
    }
    const count = Math.max(1, tier.count + formula.countGrowth * (wave - tier.fromWave));
    const enemies = [{ type: tier.type, count, delay: formula.intervalMs }];
    if (formula.bossEvery > 0 && wave % formula.bossEvery === 0) {
      enemies.push({ type: formula.bossType, count: formula.bossCount, delay: formula.intervalMs });
    }
    waves.push({
      enemies,
      reward: Math.max(0, formula.rewardBase + formula.rewardGrowth * (wave - 1)),
    });
  }
  return waves;
}

/* ---------------------------------------------------------------- 曲線擬合 */

/**
 * 曲線擬合：作者給「總 HP」與「形狀」，系統反推每波數量與血量倍率。
 *
 * 為什麼要反推而不是直接給曲線：`WaveConfig` 沒有全域 HP 欄位，血量只能靠
 * `hpScale`（乘在敵人基礎血量上）與數量逼近。所以擬合結果一定是「數量 × 倍率」
 * 兩根旋鈕一起去貼目標曲線，貼不到的地方由倍率吸收。
 */
export type CurveShape = 'linear' | 'ease' | 'spike';

export interface CurveFormula {
  /** 總波數（1–200） */
  waves: number;
  /** 這一輪只用一種敵人型別，數值由 baseHealth 決定 */
  type: string;
  /** 敵人基礎血量（由 UI 從 ENEMY_DATA 或專案資產帶進來） */
  baseHealth: number;
  /** 全場目標總 HP */
  targetHp: number;
  shape: CurveShape;
  /** spike 形狀：每幾波一個尖峰 */
  spikeEvery: number;
  /** 尖峰倍率 */
  spikeScale: number;
  intervalMs: number;
  rewardBase: number;
  rewardGrowth: number;
}

export const DEFAULT_CURVE_FORMULA: CurveFormula = {
  waves: 15,
  type: 'grunt',
  baseHealth: 100,
  targetHp: 20000,
  shape: 'ease',
  spikeEvery: 5,
  spikeScale: 2.2,
  intervalMs: 600,
  rewardBase: 20,
  rewardGrowth: 5,
};

function normalizeCurveFormula(input: Partial<CurveFormula>): CurveFormula {
  const waves = clampInt(input.waves, 1, 200, DEFAULT_CURVE_FORMULA.waves);
  const shape: CurveShape =
    input.shape === 'linear' || input.shape === 'ease' || input.shape === 'spike'
      ? input.shape
      : DEFAULT_CURVE_FORMULA.shape;
  return {
    waves,
    type:
      typeof input.type === 'string' && input.type.trim().length > 0
        ? input.type.trim()
        : DEFAULT_CURVE_FORMULA.type,
    baseHealth: clampInt(input.baseHealth, 1, 1000000, DEFAULT_CURVE_FORMULA.baseHealth),
    targetHp: clampInt(input.targetHp, 100, 100000000, DEFAULT_CURVE_FORMULA.targetHp),
    shape,
    spikeEvery: clampInt(input.spikeEvery, 0, 50, DEFAULT_CURVE_FORMULA.spikeEvery),
    spikeScale: clampInt(input.spikeScale, 1, 10, DEFAULT_CURVE_FORMULA.spikeScale),
    intervalMs: clampInt(input.intervalMs, 50, 5000, DEFAULT_CURVE_FORMULA.intervalMs),
    rewardBase: clampInt(input.rewardBase, 0, 9999, DEFAULT_CURVE_FORMULA.rewardBase),
    rewardGrowth: clampInt(input.rewardGrowth, 0, 999, DEFAULT_CURVE_FORMULA.rewardGrowth),
  };
}

/** 第 index 波（0 起算）的形狀權重 */
function curveWeight(index: number, formula: CurveFormula): number {
  const ratio = formula.waves <= 1 ? 1 : index / (formula.waves - 1);
  const base = formula.shape === 'linear' ? 0.4 + ratio : formula.shape === 'ease' ? 0.2 + ratio * ratio * 1.8 : 1;
  const isSpike = formula.spikeEvery > 0 && (index + 1) % formula.spikeEvery === 0;
  return isSpike ? base * formula.spikeScale : base;
}

export function fitCurveWaves(input: Partial<CurveFormula>): WaveConfig[] {
  const formula = normalizeCurveFormula(input);
  const weights: number[] = [];
  for (let index = 0; index < formula.waves; index += 1) weights.push(curveWeight(index, formula));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0) || 1;

  const waves: WaveConfig[] = [];
  for (let index = 0; index < formula.waves; index += 1) {
    const target = (formula.targetHp * weights[index]) / totalWeight;
    const count = Math.max(1, Math.round(target / formula.baseHealth));
    const hpScale = Math.min(20, Math.max(0.05, Math.round((target / (count * formula.baseHealth)) * 100) / 100));
    waves.push({
      enemies: [{ type: formula.type, count, delay: formula.intervalMs }],
      reward: Math.max(0, formula.rewardBase + formula.rewardGrowth * index),
      hpScale,
      intervalMs: formula.intervalMs,
    });
  }
  return waves;
}

/** 曲線擬合摘要（顯示「共 N 波、總 HP 約 X」） */
export function describeCurve(input: Partial<CurveFormula>): { waves: number; totalHp: number } {
  const formula = normalizeCurveFormula(input);
  const waves = fitCurveWaves(formula);
  const totalHp = waves.reduce((sum, wave) => {
    const groups = wave.enemies.reduce((inner, group) => inner + group.count, 0);
    return sum + groups * formula.baseHealth * (wave.hpScale ?? 1);
  }, 0);
  return { waves: formula.waves, totalHp: Math.round(totalHp) };
}

/** 公式摘要（給 UI 顯示「共 N 波、每波 +X、每 Y 波出王」） */
export function describeFormula(input: Partial<WaveFormula>): string {
  const formula = normalizeFormula(input);
  const boss = formula.bossEvery > 0 ? `每 ${formula.bossEvery} 波出 ${formula.bossCount} 隻 ${formula.bossType}` : "不出王";
  return `${formula.waves} 波 · 每波 +${formula.countGrowth} 隻 · ${boss} · 間隔 ${formula.intervalMs}ms`;
}
