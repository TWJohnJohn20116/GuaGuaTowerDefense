import { describe, expect, it } from 'vitest';
import { canBatchUpgradeTower, getTowerUpgradeCost } from '@/data/towerUpgradeCost';

describe('tower upgrade cost', () => {
  it('matches the single-tower upgrade formula', () => {
    expect(getTowerUpgradeCost(100, 1)).toBe(75);
    expect(getTowerUpgradeCost(100, 2)).toBe(150);
    expect(getTowerUpgradeCost(100, 3)).toBe(225);
    expect(getTowerUpgradeCost(150, 1)).toBe(112);
  });

  it('does not treat first-level towers as batch-upgradable', () => {
    expect(canBatchUpgradeTower({ level: 1, upgradePath: null })).toBe(false);
    expect(canBatchUpgradeTower({ level: 1, upgradePath: 'A' })).toBe(false);
  });

  it('allows batch upgrade only after a path is chosen and before max level', () => {
    expect(canBatchUpgradeTower({ level: 2, upgradePath: 'A' })).toBe(true);
    expect(canBatchUpgradeTower({ level: 2, upgradePath: null })).toBe(false);
    expect(canBatchUpgradeTower({ level: 5, upgradePath: 'B' })).toBe(false);
    expect(canBatchUpgradeTower({ level: 4, upgradePath: 'B' }, 5)).toBe(true);
  });
});
