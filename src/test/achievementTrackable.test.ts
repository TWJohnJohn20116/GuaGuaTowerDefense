/**
 * 成就目錄：拿掉已不存在的工廠系統，集大成只計算追得到的成就
 */

import { describe, it, expect } from 'vitest';
import { ALL_ACHIEVEMENTS, getInitialStatistics } from '@/data/achievementData';
import {
  computeCustomCurrent,
  getCatalogAchievements,
  isAchievementTrackable,
} from '@/store/achievementStoreCheck';

describe('factory achievements', () => {
  it('are removed from the live catalog', () => {
    expect(ALL_ACHIEVEMENTS.filter((a) => a.id.startsWith('factory_'))).toEqual([]);
    expect(getCatalogAchievements().some((a) => a.id.startsWith('factory_'))).toBe(false);
  });
});

describe('tactical protocol achievements', () => {
  it('are trackable in the live catalog', () => {
    const ids = ['protocol_first', 'protocol_ten', 'protocol_fifty', 'protocol_variety'];
    for (const id of ids) {
      const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === id);
      expect(achievement).toBeDefined();
      expect(isAchievementTrackable(achievement!)).toBe(true);
    }
  });
});

describe('adjacency synergy achievements', () => {
  it('are trackable in the live catalog', () => {
    const ids = ['synergy_first', 'synergy_three', 'synergy_catalog'];
    for (const id of ids) {
      const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === id);
      expect(achievement).toBeDefined();
      expect(isAchievementTrackable(achievement!)).toBe(true);
    }
  });
});

describe('getCatalogAchievements', () => {
  it('only includes achievements that can actually progress', () => {
    const catalog = getCatalogAchievements();
    expect(catalog.length).toBeGreaterThan(0);
    expect(catalog.every(isAchievementTrackable)).toBe(true);
  });
});

describe('completionist custom progress', () => {
  it('does not require untrackable custom achievements', () => {
    const catalog = getCatalogAchievements();
    const playerAchievements = Object.fromEntries(
      catalog.map((a) => [a.id, { id: a.id, status: 'completed' as const, progress: [], unlockedAt: 0, claimedAt: 0 }]),
    );
    const completionist = ALL_ACHIEVEMENTS.find((a) => a.id === 'completionist');
    expect(completionist).toBeDefined();
    const current = computeCustomCurrent(
      completionist!,
      getInitialStatistics(),
      playerAchievements,
    );
    expect(current).toBe(1);
  });
});
