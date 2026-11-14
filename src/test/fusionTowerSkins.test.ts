/**
 * 融合塔皮膚必須存在，且每座塔都有預設外觀
 */

import { describe, it, expect } from 'vitest';
import { ALL_SKINS, SKINS_BY_TOWER, getDefaultSkinId } from '@/data/skinData';
import type { TowerType } from '@/types/game';

const FUSION_TOWERS: TowerType[] = ['storm', 'plague', 'demolisher', 'tempest'];

describe('fusion tower skins', () => {
  it('gives each fusion tower at least 6 skins including a default', () => {
    for (const type of FUSION_TOWERS) {
      const skins = SKINS_BY_TOWER[type];
      expect(skins.length, type).toBeGreaterThanOrEqual(6);
      const defaultSkin = skins.find((skin) => skin.id === getDefaultSkinId(type));
      expect(defaultSkin, `${type} default`).toBeDefined();
      expect(defaultSkin?.unlockCondition.type).toBe('default');
      expect(defaultSkin?.towerType).toBe(type);
    }
  });

  it('includes fusion skins in ALL_SKINS', () => {
    for (const type of FUSION_TOWERS) {
      expect(ALL_SKINS.some((skin) => skin.towerType === type)).toBe(true);
    }
  });

  it('uses unique ids', () => {
    const ids = ALL_SKINS.filter((skin) => FUSION_TOWERS.includes(skin.towerType as TowerType)).map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
