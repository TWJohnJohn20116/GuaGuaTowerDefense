import { describe, expect, it } from 'vitest';
import { shouldShowTowerHealthBar } from '@/data/towerHealthBarVisibility';

describe('tower health bar visibility', () => {
  it('only shows when the setting is on and the tower is damaged', () => {
    expect(shouldShowTowerHealthBar(80, 100, true)).toBe(true);
    expect(shouldShowTowerHealthBar(100, 100, true)).toBe(false);
    expect(shouldShowTowerHealthBar(80, 100, false)).toBe(false);
    expect(shouldShowTowerHealthBar(0, 100, true)).toBe(true);
  });
});
