import { describe, expect, it } from 'vitest';
import { getTowerStatBonus } from '@/data/towerCombatStats';
import { getUpgradeBonus } from '@/data/upgradeBranches';

describe('tower combat stat bonus', () => {
  it('keeps level 1 at base multipliers', () => {
    const bonus = getTowerStatBonus({ type: 'basic', level: 1, upgradePath: null });
    expect(bonus.damageMultiplier).toBe(1);
    expect(bonus.rangeMultiplier).toBe(1);
    expect(bonus.fireRateMultiplier).toBe(1);
  });

  it('uses combat 0.3 / 0.15 steps when no path is chosen', () => {
    const bonus = getTowerStatBonus({ type: 'basic', level: 3, upgradePath: null });
    expect(bonus.damageMultiplier).toBe(1.6);
    expect(bonus.rangeMultiplier).toBe(1.3);
    expect(bonus.rangeMultiplier).not.toBe(1.2);
  });

  it('applies the chosen upgrade path instead of the generic steps', () => {
    const speed = getTowerStatBonus({ type: 'basic', level: 2, upgradePath: 'A' });
    const heavy = getTowerStatBonus({ type: 'basic', level: 2, upgradePath: 'B' });
    expect(speed.fireRateMultiplier).toBe(1.3);
    expect(speed.damageMultiplier).toBe(1);
    expect(heavy.damageMultiplier).toBe(1.4);
    expect(heavy.fireRateMultiplier).toBe(1);
    expect(speed).toEqual(getUpgradeBonus('basic', 'A', 2));
  });
});
