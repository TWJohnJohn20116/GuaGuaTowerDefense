/**
 * 新地圖的專屬成就，以及 complete_map 條件必須能推進
 */
import { describe, it, expect } from 'vitest';
import { ALL_ACHIEVEMENTS, getInitialStatistics } from '@/data/achievementData';
import { checkCondition } from '@/store/achievementStoreCheck';

const MAP_ACHIEVEMENT_IDS = ['map_hourglass', 'map_switchback'] as const;

describe('new map achievements', () => {
  it('每張新地圖都有專屬成就', () => {
    for (const id of MAP_ACHIEVEMENT_IDS) {
      expect(ALL_ACHIEVEMENTS.find((a) => a.id === id), id).toBeDefined();
    }
  });

  it('complete_map 條件會隨該地圖通關次數推進', () => {
    const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === MAP_ACHIEVEMENT_IDS[0]);
    expect(achievement, MAP_ACHIEVEMENT_IDS[0]).toBeDefined();

    const before = checkCondition(achievement!, getInitialStatistics(), {});
    const withClear = {
      ...getInitialStatistics(),
      mapsCompleted: { ...getInitialStatistics().mapsCompleted, hourglass: 99 },
    };
    const after = checkCondition(achievement!, withClear, {});

    expect(after.progress[0]).toBeGreaterThan(before.progress[0]);
  });
});
