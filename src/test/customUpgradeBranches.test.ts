import { describe, expect, it } from 'vitest';
import { getTowerStatBonus } from '@/data/towerCombatStats';
import { getUpgradeBonus } from '@/data/upgradeBranches';
import type { CustomTowerData, TowerType } from '@/types/game';

// 執行期的自訂塔 id 不在 TowerType 內；用明確的佔位值代表「官方分支表查不到」
const CUSTOM_TYPE = 'workshop_custom_tower' as TowerType;

const CUSTOM_BRANCHES: NonNullable<CustomTowerData['upgradeBranches']> = {
  levels: [
    { damage: 1, range: 1, fireRate: 1 },
    { damage: 1.2, range: 1.1, fireRate: 1 },
    { damage: 1.4, range: 1.2, fireRate: 1.1 },
    { damage: 1.6, range: 1.3, fireRate: 1.2 },
    { damage: 1.8, range: 1.4, fireRate: 1.3 },
  ],
  branchA: { damage: 1.5, range: 1, fireRate: 1 },
  branchB: { damage: 1, range: 1, fireRate: 2 },
};

describe('custom tower upgrade branches', () => {
  it('matches the official behaviour when no custom branches are given', () => {
    for (const level of [1, 2, 3, 4, 5]) {
      expect(getTowerStatBonus({ type: 'basic', level, upgradePath: null, customBranches: undefined }))
        .toEqual(getTowerStatBonus({ type: 'basic', level, upgradePath: null }));
    }
    expect(getTowerStatBonus({ type: 'basic', level: 3, upgradePath: 'A', customBranches: null }))
      .toEqual(getUpgradeBonus('basic', 'A', 3));
    expect(getTowerStatBonus({ type: 'sniper', level: 2, upgradePath: 'B' }))
      .toEqual(getUpgradeBonus('sniper', 'B', 2));
  });

  it('applies the level multiplier on top of the generic per-level steps', () => {
    const level3 = getTowerStatBonus({ type: CUSTOM_TYPE, level: 3, upgradePath: null, customBranches: CUSTOM_BRANCHES });
    expect(level3.damageMultiplier).toBeCloseTo(1.6 * 1.4, 10);
    expect(level3.rangeMultiplier).toBeCloseTo(1.3 * 1.2, 10);
    expect(level3.fireRateMultiplier).toBeCloseTo(1.1, 10);
  });

  it('multiplies the chosen route on top of the level multiplier', () => {
    const routeA = getTowerStatBonus({ type: CUSTOM_TYPE, level: 4, upgradePath: 'A', customBranches: CUSTOM_BRANCHES });
    const routeB = getTowerStatBonus({ type: CUSTOM_TYPE, level: 4, upgradePath: 'B', customBranches: CUSTOM_BRANCHES });
    expect(routeA.damageMultiplier).toBeCloseTo(1.9 * 1.6 * 1.5, 10);
    expect(routeA.fireRateMultiplier).toBeCloseTo(1.2, 10);
    expect(routeB.damageMultiplier).toBeCloseTo(1.9 * 1.6, 10);
    expect(routeB.fireRateMultiplier).toBeCloseTo(1.2 * 2, 10);
  });

  it('keeps the other multipliers untouched', () => {
    const bonus = getTowerStatBonus({ type: CUSTOM_TYPE, level: 5, upgradePath: 'A', customBranches: CUSTOM_BRANCHES });
    expect(bonus.splashRadiusMultiplier).toBe(1);
    expect(bonus.slowAmountMultiplier).toBe(1);
    expect(bonus.poisonDamageMultiplier).toBe(1);
    expect(bonus.chainCountBonus).toBe(0);
  });

  it('falls back to no bonus for a type missing from the official table', () => {
    expect(getUpgradeBonus(CUSTOM_TYPE, 'A', 3)).toEqual({
      damageMultiplier: 1,
      rangeMultiplier: 1,
      fireRateMultiplier: 1,
      splashRadiusMultiplier: 1,
      slowAmountMultiplier: 1,
      poisonDamageMultiplier: 1,
      chainCountBonus: 0,
    });
  });

  it('leaves levels beyond the configured rows at the generic steps', () => {
    const level6 = getTowerStatBonus({ type: CUSTOM_TYPE, level: 6, upgradePath: null, customBranches: CUSTOM_BRANCHES });
    expect(level6.damageMultiplier).toBeCloseTo(1 + 5 * 0.3, 10);
  });
});
