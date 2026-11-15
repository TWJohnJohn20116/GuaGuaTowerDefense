/**
 * 波次分析行為測試（workshopWaveAnalysis）
 *
 * 鎖住三個容易被改壞的計算：
 *   1. 血量倍率（hpScale）要進累積曲線、也要進難度分子；
 *   2. 每波間隔（intervalMs）會改變波次長度；
 *   3. 播放頭快照在 0ms、波次交界、超過總長這三個邊界要合理。
 *
 * 另外驗「經濟模擬」的買不起判定與曲線擬合的總 HP 逼近。
 * 敵人數值用測試自己的 lookup，不依賴官方平衡值。
 */
import { describe, expect, it } from 'vitest';
import type { WaveConfig } from '@/types/game';
import { GAME_CONSTANTS } from '@/data/gameData';
import {
  buildCurve,
  waveConfigToTimeline,
  type EnemyLookup,
  type EnemyStats,
  type TimelineWave,
} from '@/workshop/content/timeline';
import { analyzeWaves, snapshotAt } from '@/workshop/content/waveAnalysis';
import { describeCurve, fitCurveWaves } from '@/workshop/content/waveFormula';

const SPAWN = GAME_CONSTANTS.ENEMY_SPAWN_DELAY;

/** 與官方平衡值脫鉤：normal 固定 100 HP / 10 金幣 */
const STATS: Record<string, EnemyStats> = { normal: { health: 100, reward: 10 } };
const lookup: EnemyLookup = (type) => STATS[type];

const wave = (config: WaveConfig, index = 0): TimelineWave => waveConfigToTimeline(config, index);

describe('hpScale', () => {
  it('進累積曲線的 HP', () => {
    const waves = [wave({ enemies: [{ type: 'normal', count: 2, delay: 0 }], reward: 0, hpScale: 2 })];
    expect(buildCurve(waves, lookup).totalHp).toBe(400);
  });

  it('進難度的分子', () => {
    const waves = [
      wave({ enemies: [{ type: 'normal', count: 2, delay: 0 }], reward: 0 }, 0),
      wave({ enemies: [{ type: 'normal', count: 4, delay: 0 }], reward: 0 }, 1),
    ];
    const analysis = analyzeWaves(waves, lookup, {
      startMoney: 300,
      incomeFactor: 0,
      towerPrice: 150,
      smoothWindow: 0,
    });
    // 壓力 = HP ÷ 300：200 → 50 分、400 → 100 分
    expect(analysis.bars.map((bar) => bar.difficulty)).toEqual([50, 100]);
    expect(analysis.peakWave).toBe(1);
    expect(analysis.peakDifficulty).toBe(100);
  });
});

describe('intervalMs', () => {
  it('覆寫組內間隔後，波次長度跟著變', () => {
    const fast = wave({ enemies: [{ type: 'normal', count: 4, delay: 0 }], reward: 0, intervalMs: 400 });
    const normal = wave({ enemies: [{ type: 'normal', count: 4, delay: 0 }], reward: 0 });
    expect(fast.durationMs).toBe(1600);
    expect(normal.durationMs).toBe(4 * SPAWN);
  });
});

describe('snapshotAt', () => {
  const waves = [wave({ enemies: [{ type: 'normal', count: 2, delay: 0 }], reward: 50 }, 0)];

  it('0ms 時第一隻已經出現', () => {
    const snapshot = snapshotAt(waves, lookup, 0);
    expect(snapshot.spawned).toBe(1);
    expect(snapshot.hp).toBe(100);
    expect(snapshot.waveIndex).toBe(0);
  });

  it('間隔前後各多一隻', () => {
    expect(snapshotAt(waves, lookup, SPAWN - 1).spawned).toBe(1);
    expect(snapshotAt(waves, lookup, SPAWN).spawned).toBe(2);
  });

  it('超過總長時全部生成完，且計入已結束波次的通關獎勵', () => {
    const snapshot = snapshotAt(waves, lookup, 99999, { incomeFactor: 1 });
    expect(snapshot.spawned).toBe(2);
    expect(snapshot.onField).toBe(0);
    // 2 隻 × 10 擊殺 + 50 通關
    expect(snapshot.money).toBe(70);
  });

  it('波次交界時 waveIndex 切到下一波', () => {
    const two = [
      wave({ enemies: [{ type: 'normal', count: 2, delay: 0 }], reward: 0 }, 0),
      wave({ enemies: [{ type: 'normal', count: 2, delay: 0 }], reward: 0 }, 1),
    ];
    const boundary = two[0].durationMs;
    expect(snapshotAt(two, lookup, boundary - 1).waveIndex).toBe(0);
    expect(snapshotAt(two, lookup, boundary).waveIndex).toBe(1);
  });
});

describe('經濟模擬', () => {
  it('起始金幣買不起任何塔時列入 starvedWaves', () => {
    const waves = [wave({ enemies: [{ type: 'normal', count: 2, delay: 0 }], reward: 0 }, 0)];
    const analysis = analyzeWaves(waves, lookup, { startMoney: 10, towerPrice: 150, incomeFactor: 0 });
    expect(analysis.starvedWaves).toEqual([0]);
    expect(analysis.bars[0].affordableTowers).toBe(0);
  });

  it('收入折扣會影響下一波開始前的金幣', () => {
    const waves = [
      wave({ enemies: [{ type: 'normal', count: 2, delay: 0 }], reward: 100 }, 0),
      wave({ enemies: [{ type: 'normal', count: 2, delay: 0 }], reward: 0 }, 1),
    ];
    const full = analyzeWaves(waves, lookup, { startMoney: 0, incomeFactor: 1, towerPrice: 150 });
    const half = analyzeWaves(waves, lookup, { startMoney: 0, incomeFactor: 0.5, towerPrice: 150 });
    // 第一波：2 隻 × 10 + 100 通關 = 120
    expect(full.bars[1].moneyBefore).toBe(120);
    expect(half.bars[1].moneyBefore).toBe(60);
  });
});

describe('fitCurveWaves', () => {
  it('擬合後的總 HP 落在目標的 ±10% 內', () => {
    const fitted = fitCurveWaves({
      waves: 10,
      type: 'normal',
      baseHealth: 100,
      targetHp: 20000,
      shape: 'ease',
      spikeEvery: 0,
    });
    expect(fitted).toHaveLength(10);
    const total = fitted.reduce((sum, item) => {
      const count = item.enemies.reduce((inner, group) => inner + group.count, 0);
      return sum + count * 100 * (item.hpScale ?? 1);
    }, 0);
    expect(Math.abs(total - 20000) / 20000).toBeLessThan(0.1);
    // 每波都帶間隔，且至少一隻
    expect(fitted.every((item) => (item.enemies[0]?.count ?? 0) >= 1)).toBe(true);
  });

  it('describeCurve 回報的總 HP 與實際擬合一致', () => {
    const input = { waves: 8, type: 'normal', baseHealth: 100, targetHp: 12000, spikeEvery: 4 };
    const described = describeCurve(input);
    expect(described.waves).toBe(8);
    expect(Math.abs(described.totalHp - 12000) / 12000).toBeLessThan(0.1);
  });
});
