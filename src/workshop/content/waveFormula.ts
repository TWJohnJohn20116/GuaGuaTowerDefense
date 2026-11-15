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

/** 公式摘要（給 UI 顯示「共 N 波、每波 +X、每 Y 波出王」） */
export function describeFormula(input: Partial<WaveFormula>): string {
  const formula = normalizeFormula(input);
  const boss = formula.bossEvery > 0 ? `每 ${formula.bossEvery} 波出 ${formula.bossCount} 隻 ${formula.bossType}` : "不出王";
  return `${formula.waves} 波 · 每波 +${formula.countGrowth} 隻 · ${boss} · 間隔 ${formula.intervalMs}ms`;
}
