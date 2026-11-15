import { describe, expect, it } from 'vitest';
import {
  average,
  buildSurvivalCurve,
  emptySummary,
  formatRate,
  roundTo,
  summarizeRuns,
} from '@/workshop/playtest/stats';
import type { SimRunResult } from '@/workshop/playtest/types';

/** 造一筆模擬結果：只覆寫測試在意的欄位，其餘給安全的預設值 */
const makeRun = (patch: Partial<SimRunResult>): SimRunResult => ({
  victory: false,
  survivedWaves: 0,
  remainingHealth: 0,
  maxHealth: 100,
  waveHealth: [],
  elapsedMs: 0,
  timedOut: false,
  ...patch,
});

describe('average / roundTo', () => {
  it('returns 0 instead of NaN for an empty list', () => {
    expect(average([])).toBe(0);
    expect(roundTo(average([]))).toBe(0);
  });

  it('rounds to the requested digits', () => {
    expect(roundTo(0.12345, 3)).toBe(0.123);
    expect(roundTo(62.449, 1)).toBe(62.4);
    expect(roundTo(62.45, 1)).toBe(62.5);
  });

  it('treats non-finite input as 0 so the UI never prints NaN', () => {
    expect(roundTo(Number.NaN)).toBe(0);
    expect(roundTo(Number.POSITIVE_INFINITY)).toBe(0);
  });

  it('normalises negative zero so strict comparisons stay stable', () => {
    expect(roundTo(-0.04, 1)).toBe(0);
    expect(Object.is(roundTo(-0.04, 1), 0)).toBe(true);
  });
});

describe('formatRate', () => {
  it('formats a 0..1 ratio as a percentage', () => {
    expect(formatRate(0.625)).toBe('62.5%');
    expect(formatRate(0)).toBe('0%');
    expect(formatRate(1)).toBe('100%');
  });

  it('clamps out-of-range ratios instead of showing 120%', () => {
    expect(formatRate(1.2)).toBe('100%');
    expect(formatRate(-0.3)).toBe('0%');
  });

  it('honours the digits argument', () => {
    expect(formatRate(1 / 3, 2)).toBe('33.33%');
    expect(formatRate(1 / 3)).toBe('33.3%');
  });
});

describe('summarizeRuns', () => {
  it('returns a zeroed summary when nothing was simulated', () => {
    const summary = summarizeRuns([]);
    expect(summary.runs).toBe(0);
    expect(summary.wins).toBe(0);
    expect(summary.winRate).toBe(0);
    expect(summary.avgSurvivedWaves).toBe(0);
    expect(summary.avgRemainingHealth).toBe(0);
    expect(summary.curve).toEqual([]);
    expect(summary).toEqual(emptySummary());
  });

  it('keeps truncated runs out of the win-rate denominator', () => {
    const summary = summarizeRuns([
      makeRun({ victory: true, survivedWaves: 15, remainingHealth: 40 }),
      makeRun({ victory: false, survivedWaves: 6, remainingHealth: 0 }),
      makeRun({ victory: true, survivedWaves: 9, timedOut: true }),
    ]);
    expect(summary.runs).toBe(3);
    expect(summary.timeouts).toBe(1);
    expect(summary.wins).toBe(1);
    expect(summary.winRate).toBe(0.5);
  });

  it('averages survived waves over every run, including truncated ones', () => {
    const summary = summarizeRuns([
      makeRun({ survivedWaves: 15 }),
      makeRun({ survivedWaves: 6 }),
      makeRun({ survivedWaves: 9, timedOut: true }),
    ]);
    expect(summary.avgSurvivedWaves).toBe(10);
  });

  it('never reports negative remaining health', () => {
    const summary = summarizeRuns([
      makeRun({ remainingHealth: -20 }),
      makeRun({ remainingHealth: 10 }),
    ]);
    expect(summary.avgRemainingHealth).toBe(5);
  });

  it('wins every decided run when all runs are victories', () => {
    const summary = summarizeRuns([
      makeRun({ victory: true }),
      makeRun({ victory: true }),
      makeRun({ victory: true }),
    ]);
    expect(summary.winRate).toBe(1);
    expect(summary.timeouts).toBe(0);
  });

  it('wires the survival curve into the summary instead of dropping it', () => {
    const summary = summarizeRuns([
      makeRun({ waveHealth: [100, 40], survivedWaves: 2 }),
      makeRun({ waveHealth: [60], survivedWaves: 1 }),
    ]);
    expect(summary.curve).toHaveLength(2);
    expect(summary.curve[0].samples).toBe(2);
    expect(summary.curve[1].samples).toBe(1);
  });

  it('never reports negative elapsed time', () => {
    const summary = summarizeRuns([makeRun({ elapsedMs: -150 }), makeRun({ elapsedMs: 150 })]);
    expect(summary.avgElapsedMs).toBe(0);
  });

  it('reports 0 win rate when every run was truncated', () => {
    const summary = summarizeRuns([makeRun({ victory: true, timedOut: true })]);
    expect(summary.winRate).toBe(0);
    expect(summary.timeouts).toBe(1);
  });
});

describe('buildSurvivalCurve', () => {
  it('counts only the runs that actually reached each wave', () => {
    const curve = buildSurvivalCurve([
      makeRun({ waveHealth: [100, 80, 60] }),
      makeRun({ waveHealth: [90] }),
    ]);
    expect(curve).toHaveLength(3);
    expect(curve[0]).toEqual({ wave: 1, avgHealth: 95, avgRatio: 0.95, samples: 2 });
    expect(curve[1]).toEqual({ wave: 2, avgHealth: 80, avgRatio: 0.8, samples: 1 });
    expect(curve[2]).toEqual({ wave: 3, avgHealth: 60, avgRatio: 0.6, samples: 1 });
  });

  it('is empty when no run recorded any wave', () => {
    expect(buildSurvivalCurve([])).toEqual([]);
    expect(buildSurvivalCurve([makeRun({ waveHealth: [] })])).toEqual([]);
  });

  it('clamps a corrupted negative health into the 0..1 band', () => {
    const curve = buildSurvivalCurve([makeRun({ maxHealth: 100, waveHealth: [-40] })]);
    expect(curve[0].avgRatio).toBe(0);
    expect(curve[0].avgHealth).toBe(-40);
  });

  it('scales the ratio by each run own max health', () => {
    const curve = buildSurvivalCurve([
      makeRun({ maxHealth: 20, waveHealth: [10] }),
      makeRun({ maxHealth: 200, waveHealth: [100] }),
    ]);
    expect(curve[0].avgRatio).toBe(0.5);
    expect(curve[0].avgHealth).toBe(55);
  });

  it('does not divide by zero when max health is missing', () => {
    const curve = buildSurvivalCurve([makeRun({ maxHealth: 0, waveHealth: [3] })]);
    expect(curve[0].avgRatio).toBe(0);
    expect(Number.isFinite(curve[0].avgRatio)).toBe(true);
  });
});
