import { describe, expect, it } from 'vitest';
import { shouldShowTowerRangeRing } from '@/data/towerRangeVisibility';

describe('tower range visibility', () => {
  it('hides range rings when the setting is off, even if the tower has range', () => {
    expect(shouldShowTowerRangeRing(false, 3)).toBe(false);
    expect(shouldShowTowerRangeRing(true, 3)).toBe(true);
    expect(shouldShowTowerRangeRing(true, 0)).toBe(false);
  });
});
