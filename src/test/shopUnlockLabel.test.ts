import { describe, it, expect } from 'vitest';
import { getShopUnlockActionLabel } from '@/components/scenes/shop/shopData';

describe('shop unlock action label', () => {
  const shop = { unlockTower: '解鎖防禦塔', unlockSkill: '解鎖主動技能' };

  it('does not tell players they are unlocking a tower when buying a skill', () => {
    expect(getShopUnlockActionLabel('skill', shop)).toBe('解鎖主動技能');
    expect(getShopUnlockActionLabel('tower', shop)).toBe('解鎖防禦塔');
  });
});
