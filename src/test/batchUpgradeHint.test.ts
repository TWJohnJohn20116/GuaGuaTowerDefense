import { describe, expect, it } from 'vitest';
import { resolveBatchUpgradeHint } from '@/data/batchUpgradeHint';

describe('multi-select batch upgrade hint', () => {
  it('explains empty upgrade sets and short funds', () => {
    expect(resolveBatchUpgradeHint({
      upgradableCount: 0,
      totalCost: 0,
      money: 500,
    })).toBe('none');
    expect(resolveBatchUpgradeHint({
      upgradableCount: 2,
      totalCost: 400,
      money: 120,
    })).toBe('short');
    expect(resolveBatchUpgradeHint({
      upgradableCount: 2,
      totalCost: 400,
      money: 400,
    })).toBe('ready');
  });
});
