/**
 * 波次分析（柱狀、難度評分、經濟模擬）
 *
 * 三個刻意寫死的判定，改動前先讀這裡：
 *   1. 金幣在「該波開始前」的可用量 = 起始金幣 + 前面所有波的通關獎勵與擊殺獎勵
 *      × 收入折扣。收入折扣預設 0.8（作者不可能把每一塊錢都留著不花）。
 *   2. 難度 = 該波總 HP ÷ 該波開始前的可用金幣，再對全場最大值正規化成 0–100。
 *      它是「相對壓力」不是絕對強度：換地圖或換起始金幣，分數會跟著變。
 *   3. 停用的波次不計入難度峰值，但仍在 bars 裡（UI 會畫成灰的）。
 *
 * 純函式，沒有 React、store、i18n。
 */
import {
  summarizeWave,
  validateTimeline,
  waveHpScale,
  waveIntervalMs,
  type EnemyLookup,
  type TimelineWave,
} from '@/workshop/content/timeline';
import { buildTrack } from '@/workshop/content/waveModel';

/** 分析參數：全部可在面板調整，預設值就是官方 15 波的體感 */
export interface AnalysisParams {
  /** 起始金幣 */
  startMoney: number;
  /** 平均塔價（估「買得起幾座」用） */
  towerPrice: number;
  /** 收入折扣：1＝每塊錢都留著，0.8＝只算八成可用 */
  incomeFactor: number;
  /** 難度平滑視窗（0＝不平滑，3＝三波移動平均） */
  smoothWindow: number;
}

export const DEFAULT_ANALYSIS_PARAMS: AnalysisParams = {
  startMoney: 300,
  towerPrice: 150,
  incomeFactor: 0.8,
  smoothWindow: 0,
};

const clampNumber = (value: unknown, min: number, max: number, fallback: number): number => {
  const parsed = typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  return Math.min(max, Math.max(min, parsed));
};

function normalizeAnalysisParams(input: Partial<AnalysisParams>): AnalysisParams {
  return {
    startMoney: clampNumber(input.startMoney, 0, 999999, DEFAULT_ANALYSIS_PARAMS.startMoney),
    towerPrice: clampNumber(input.towerPrice, 1, 99999, DEFAULT_ANALYSIS_PARAMS.towerPrice),
    incomeFactor: clampNumber(input.incomeFactor, 0, 1, DEFAULT_ANALYSIS_PARAMS.incomeFactor),
    smoothWindow: clampNumber(input.smoothWindow, 0, 9, DEFAULT_ANALYSIS_PARAMS.smoothWindow),
  };
}

/** 單波的摘要（左欄清單列用） */
export interface WaveSummaryRow {
  waveIndex: number;
  /** 作者自訂名稱；空字串代表用「第 N 波」 */
  name: string;
  chapter: string;
  enabled: boolean;
  enemyCount: number;
  totalHp: number;
  /** 擊殺獎勵總額（不含通關獎勵） */
  killReward: number;
  /** 通關獎勵 */
  waveReward: number;
  durationMs: number;
  hpScale: number;
  /** 血量特別高的組（>= 500 HP 視為 Boss 級） */
  bossLike: boolean;
  issueCount: number;
}

function buildWaveSummaries(
  waves: readonly TimelineWave[],
  lookup: EnemyLookup,
): WaveSummaryRow[] {
  const issues = validateTimeline(waves, lookup);
  return waves.map((wave, waveIndex) => {
    const summary = summarizeWave(wave, lookup);
    const flat = wave.rows.flatMap((row) => row.blocks);
    return {
      waveIndex,
      name: wave.name ?? '',
      chapter: wave.chapter ?? '',
      enabled: wave.enabled !== false,
      enemyCount: summary.enemyCount,
      totalHp: summary.totalHp,
      killReward: summary.totalReward,
      waveReward: wave.reward,
      durationMs: summary.durationMs,
      hpScale: waveHpScale(wave),
      bossLike: flat.some((block) => (lookup(block.type)?.health ?? 0) >= 500),
      issueCount: issues.filter((issue) => issue.waveIndex === waveIndex).length,
    };
  });
}

/** 單波的難度分析結果（柱狀圖與評分面板用） */
export interface WaveBar extends WaveSummaryRow {
  /** 該波開始前的可用金幣 */
  moneyBefore: number;
  /** 該波結束後的可用金幣 */
  moneyAfter: number;
  /** 該波開始前買得起幾座平均價的塔 */
  affordableTowers: number;
  /** 每秒要處理的 HP（壓力密度） */
  hpPerSecond: number;
  /** 0–100 的相對難度（全場最大值＝100） */
  difficulty: number;
}

export interface WaveAnalysis {
  bars: WaveBar[];
  totalHp: number;
  totalKillReward: number;
  totalWaveReward: number;
  totalDurationMs: number;
  /** 難度最高的一波（-1＝沒有可分析的波） */
  peakWave: number;
  peakDifficulty: number;
  averageDifficulty: number;
  /** 開始前買不起任何一座塔的波次 */
  starvedWaves: number[];
  params: AnalysisParams;
}

export function analyzeWaves(
  waves: readonly TimelineWave[],
  lookup: EnemyLookup,
  input: Partial<AnalysisParams> = {},
): WaveAnalysis {
  const params = normalizeAnalysisParams(input);
  const summaries = buildWaveSummaries(waves, lookup);

  let money = params.startMoney;
  const raw: WaveBar[] = summaries.map((row) => {
    const moneyBefore = money;
    const income = (row.killReward + row.waveReward) * params.incomeFactor;
    const moneyAfter = moneyBefore + income;
    const seconds = Math.max(0.001, row.durationMs / 1000);
    const bar: WaveBar = {
      ...row,
      moneyBefore,
      moneyAfter,
      affordableTowers: Math.floor(moneyBefore / params.towerPrice),
      hpPerSecond: row.totalHp / seconds,
      difficulty: 0,
    };
    money = moneyAfter;
    return bar;
  });

  // 壓力＝該波 HP ÷ 可用金幣；除以最大壓力正規化成 0–100
  const pressures = raw.map((bar) => (bar.enabled ? bar.totalHp / Math.max(1, bar.moneyBefore) : 0));
  const maxPressure = pressures.reduce((max, value) => Math.max(max, value), 0);

  const smoothed =
    params.smoothWindow > 1
      ? pressures.map((_, index) => {
          const half = Math.floor(params.smoothWindow / 2);
          let sum = 0;
          let count = 0;
          for (let offset = -half; offset <= half; offset += 1) {
            const value = pressures[index + offset];
            if (value === undefined) continue;
            sum += value;
            count += 1;
          }
          return count > 0 ? sum / count : 0;
        })
      : pressures;

  const bars: WaveBar[] = raw.map((bar, index) => ({
    ...bar,
    difficulty: maxPressure > 0 ? Math.round((smoothed[index] / maxPressure) * 100) : 0,
  }));

  let peakWave = -1;
  let peakDifficulty = 0;
  bars.forEach((bar) => {
    if (bar.enabled && bar.difficulty > peakDifficulty) {
      peakDifficulty = bar.difficulty;
      peakWave = bar.waveIndex;
    }
  });

  const enabledBars = bars.filter((bar) => bar.enabled);
  const averageDifficulty =
    enabledBars.length > 0
      ? Math.round(enabledBars.reduce((sum, bar) => sum + bar.difficulty, 0) / enabledBars.length)
      : 0;

  return {
    bars,
    totalHp: bars.reduce((sum, bar) => sum + bar.totalHp, 0),
    totalKillReward: bars.reduce((sum, bar) => sum + bar.killReward, 0),
    totalWaveReward: bars.reduce((sum, bar) => sum + bar.waveReward, 0),
    totalDurationMs: bars.reduce((sum, bar) => sum + bar.durationMs, 0),
    peakWave,
    peakDifficulty,
    averageDifficulty,
    starvedWaves: bars.filter((bar) => bar.enabled && bar.affordableTowers < 1).map((bar) => bar.waveIndex),
    params,
  };
}

/** 播放頭在某一刻的戰場快照（估算，不是真的模擬） */
export interface PlayheadSnapshot {
  atMs: number;
  /** 此刻所在的波次（-1＝還在第一波之前） */
  waveIndex: number;
  /** 已生成的敵人總數 */
  spawned: number;
  /** 估算還在場上的敵人數（生成後 20 秒內視為仍在場） */
  onField: number;
  /** 累積 HP（已生成敵人的血量總和） */
  hp: number;
  /** 累積金幣（擊殺獎勵 + 已結束波次的通關獎勵） */
  money: number;
}

/** 「生成後 20 秒仍在場」是估算值：真實存活時間取決於塔的輸出，編輯器不模擬戰鬥 */
const ENEMY_ON_FIELD_MS = 20000;

export function snapshotAt(
  waves: readonly TimelineWave[],
  lookup: EnemyLookup,
  atMs: number,
  input: Partial<AnalysisParams> = {},
): PlayheadSnapshot {
  const params = normalizeAnalysisParams(input);
  const track = buildTrack(waves);
  const time = Math.max(0, atMs);

  let spawned = 0;
  let onField = 0;
  let hp = 0;
  let money = 0;

  for (const segment of track.segments) {
    if (time < segment.absoluteStartMs) continue;
    const wave = waves[segment.waveIndex];
    if (!wave) continue;
    const interval = waveIntervalMs(wave);
    const scale = waveHpScale(wave);
    const stats = lookup(segment.type);
    const elapsed = time - segment.absoluteStartMs;
    const count = Math.min(segment.count, Math.floor(elapsed / interval) + 1);
    if (count <= 0) continue;
    spawned += count;
    hp += (stats?.health ?? 0) * scale * count;
    money += (stats?.reward ?? 0) * count;
    // 場上估算：生成時刻落在 [time - 20s, time] 的敵人
    const firstAlive = Math.max(0, Math.ceil((elapsed - ENEMY_ON_FIELD_MS) / interval));
    if (count > firstAlive) onField += count - firstAlive;
  }

  // 通關獎勵：波次結束時刻已過的波才發
  waves.forEach((wave, index) => {
    const start = track.waveStarts[index] ?? 0;
    if (start + wave.durationMs <= time) money += wave.reward * params.incomeFactor;
  });

  let waveIndex = -1;
  track.waveStarts.forEach((start, index) => {
    if (time >= start) waveIndex = index;
  });

  return { atMs: time, waveIndex, spawned, onField, hp: Math.round(hp), money: Math.round(money) };
}
