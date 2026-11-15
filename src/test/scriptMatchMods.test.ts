/**
 * 難度調整指令的夾限規則
 *
 * 這裡驗的是「反覆觸發不會失控」：onTick 每 500ms 呼叫一次 ×1.5，
 * 30 秒後總量必須停在 10，而不是 1.5^60。
 */
import { describe, expect, it } from 'vitest';
import {
  applyDifficultyCommand,
  clampDifficulty,
  SCRIPT_DIFFICULTY_MAX,
  SCRIPT_DIFFICULTY_MIN,
} from '@/data/scriptMatchMods';

const base = { enemyHealthMult: 1, enemySpeedMult: 1, enemyRewardMult: 1 };

describe('clampDifficulty', () => {
  it('夾在 0.1~10', () => {
    expect(clampDifficulty(100)).toBe(SCRIPT_DIFFICULTY_MAX);
    expect(clampDifficulty(0.0001)).toBe(SCRIPT_DIFFICULTY_MIN);
    expect(clampDifficulty(1.5)).toBeCloseTo(1.5);
  });

  it('非有限數回退', () => {
    expect(clampDifficulty(Number.NaN)).toBe(1);
    expect(clampDifficulty(Number.POSITIVE_INFINITY)).toBe(1);
  });
});

describe('applyDifficultyCommand', () => {
  it('單次套用會相乘', () => {
    const next = applyDifficultyCommand(base, { healthMult: 2, speedMult: 0.5 });
    expect(next.enemyHealthMult).toBeCloseTo(2);
    expect(next.enemySpeedMult).toBeCloseTo(0.5);
    expect(next.enemyRewardMult).toBeCloseTo(1);
  });

  it('反覆套用會飽和在上限（不會指數爆炸）', () => {
    let mods = { ...base };
    for (let i = 0; i < 60; i += 1) mods = applyDifficultyCommand(mods, { healthMult: 1.5 });
    expect(mods.enemyHealthMult).toBeCloseTo(SCRIPT_DIFFICULTY_MAX);
  });

  it('反覆削弱也會停在下限', () => {
    let mods = { ...base };
    for (let i = 0; i < 60; i += 1) mods = applyDifficultyCommand(mods, { speedMult: 0.5 });
    expect(mods.enemySpeedMult).toBeCloseTo(SCRIPT_DIFFICULTY_MIN);
  });

  it('保留其他欄位', () => {
    const withExtra = { ...base, startingMoney: 500 };
    const next = applyDifficultyCommand(withExtra, { healthMult: 1.2 });
    expect((next as typeof withExtra).startingMoney).toBe(500);
  });
});
