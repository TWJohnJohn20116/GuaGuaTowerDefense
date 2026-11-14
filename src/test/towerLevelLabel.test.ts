import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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

  it('wires the helper into the tower panel and upgrade burst', () => {
    const panel = readFileSync(
      resolve(__dirname, '../components/game/FloatingTowerPanel.tsx'),
      'utf8',
    );
    const fx = readFileSync(
      resolve(__dirname, '../components/scenes/game-scene/GameCanvasUpgradeFx.ts'),
      'utf8',
    );
    const canvas = readFileSync(
      resolve(__dirname, '../components/scenes/game-scene/GameCanvas.tsx'),
      'utf8',
    );
    expect(panel).toMatch(/formatTowerLevelBadge/);
    expect(panel).not.toMatch(/'MAX'/);
    expect(fx).toMatch(/towerMaxLevelText/);
    expect(fx).not.toMatch(/fillText\('MAX'/);
    expect(canvas).toMatch(/t\.towers\.maxLevel/);
  });
});
