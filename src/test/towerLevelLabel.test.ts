import { describe, expect, it } from 'vitest';
import { formatTowerLevelBadge, towerMaxLevelText } from '@/data/towerLevelLabel';
import { zhTW } from '@/i18n/locales/zh-TW';

describe('tower max-level HUD copy', () => {
  it('uses the translated max label instead of English MAX', () => {
    expect(formatTowerLevelBadge({
      currentLevel: 5,
      maxLevel: 5,
      maxLabel: zhTW.towers.maxLevel,
    })).toBe('已滿級');
    expect(formatTowerLevelBadge({
      currentLevel: 3,
      maxLevel: 5,
      maxLabel: zhTW.towers.maxLevel,
    })).toBe('Lv3');
    expect(towerMaxLevelText('')).toBe('已滿級');
    expect(towerMaxLevelText(zhTW.towers.maxLevel)).not.toMatch(/MAX/i);
  });
});
