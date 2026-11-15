/**
 * 平衡模擬的純函式：聚合、勝率、存活曲線整形
 *
 * 這一支不准 import store／React／引擎——它只吃 SimRunResult[]，回傳摘要。
 * 之所以要抽出來：模擬本身很慢（要好幾百毫秒），但統計是最容易被寫錯的地方，
 * 抽成純函式才能在 CI 用幾個小陣列把邊界（0 局、全滅、只跑一半）全部釘住。
 */
import type { BalanceSummary, SimRunResult, SurvivalPoint } from './types';

/** 平均；空陣列回 0（不要回 NaN 讓 UI 顯示 "NaN 波"） */
export function average(values: readonly number[]): number {
  if (values.length === 0) return 0;
  let sum = 0;
  for (const v of values) sum += v;
  return sum / values.length;
}

/** 四捨五入到指定小數位（預設 1 位），避免浮點尾數直接印到 UI */
export function roundTo(value: number, digits = 1): number {
  if (!Number.isFinite(value)) return 0;
  const k = 10 ** digits;
  const rounded = Math.round(value * k) / k;
  // Math.round(-0.4) = -0：負零在 UI 上無害，但 toBe(0)／toStrictEqual 會把它當成不同值，
  // 與其讓每個呼叫端各自處理，不如在唯一的出口統一歸一。
  return rounded === 0 ? 0 : rounded;
}

/** 0..1 的比例轉百分比字串（62.5%） */
export function formatRate(rate: number, digits = 1): string {
  const pct = roundTo(Math.max(0, Math.min(1, rate)) * 100, digits);
  return pct + '%';
}

/**
 * 逐波存活曲線
 *
 * 每個波次只統計「真的走到那一波」的局（samples），
 * 所以第 8 波的樣本數只會有 8 波以上的局——這是曲線後段變平的原因，必須讓 UI 看得到。
 */
export function buildSurvivalCurve(runs: readonly SimRunResult[]): SurvivalPoint[] {
  let maxWaves = 0;
  for (const run of runs) {
    if (run.waveHealth.length > maxWaves) maxWaves = run.waveHealth.length;
  }
  const points: SurvivalPoint[] = [];
  for (let wave = 1; wave <= maxWaves; wave++) {
    const healths: number[] = [];
    const ratios: number[] = [];
    for (const run of runs) {
      const health = run.waveHealth[wave - 1];
      if (health === undefined) continue;
      healths.push(health);
      // 比例夾在 0..1：血量理論上不會是負的，但關卡資料壞掉時不要讓曲線畫到圖外
      const ratio = run.maxHealth > 0 ? health / run.maxHealth : 0;
      ratios.push(Math.max(0, Math.min(1, ratio)));
    }
    if (healths.length === 0) continue;
    points.push({
      wave,
      avgHealth: roundTo(average(healths)),
      avgRatio: roundTo(average(ratios), 3),
      samples: healths.length,
    });
  }
  return points;
}

/**
 * 聚合整輪模擬
 *
 * 勝率的分母刻意排除 timedOut 的局：被截斷的局既不是贏也不是輸，
 * 把它算成輸會讓「跑不完」看起來像「太難」。
 */
export function summarizeRuns(runs: readonly SimRunResult[]): BalanceSummary {
  const decided = runs.filter((r) => !r.timedOut);
  const wins = decided.filter((r) => r.victory).length;
  return {
    runs: runs.length,
    wins,
    timeouts: runs.length - decided.length,
    winRate: decided.length === 0 ? 0 : wins / decided.length,
    avgSurvivedWaves: roundTo(average(runs.map((r) => r.survivedWaves))),
    avgRemainingHealth: roundTo(average(runs.map((r) => Math.max(0, r.remainingHealth)))),
    avgElapsedMs: Math.max(0, Math.round(average(runs.map((r) => r.elapsedMs)))),
    curve: buildSurvivalCurve(runs),
  };
}

/** 空摘要：尚未模擬時給 UI 一個安全的值，不要讓元件自己 if (null) 散落各處 */
export function emptySummary(): BalanceSummary {
  return {
    runs: 0,
    wins: 0,
    timeouts: 0,
    winRate: 0,
    avgSurvivedWaves: 0,
    avgRemainingHealth: 0,
    avgElapsedMs: 0,
    curve: [],
  };
}
