import { describe, expect, it } from 'vitest';
import { getTowerLockTitle } from '@/data/towerLockTitle';

describe('tower lock title', () => {
  it('shows lock when the tower is unlocked', () => {
    expect(getTowerLockTitle(false, '鎖定', '解除鎖定')).toBe('鎖定');
  });

  it('shows unlock when the tower is locked', () => {
    expect(getTowerLockTitle(true, '鎖定', '解除鎖定')).toBe('解除鎖定');
  });
});
