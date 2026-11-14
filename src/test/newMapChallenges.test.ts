/**
 * 新地圖的突變挑戰、專屬成就，以及 complete_map 條件必須能推進
 */

import { describe, it, expect } from 'vitest';
import { MUTATOR_CHALLENGES } from '@/data/mutatorChallengeData';
import { PATHS } from '@/data/gameData';
import { ALL_ACHIEVEMENTS, getInitialStatistics } from '@/data/achievementData';
import { checkCondition } from '@/store/achievementStoreCheck';

const NEW_MUTATOR_IDS = [
  'mc_hourglass_neck',
  'mc_switchback_line',
  'mc_hourglass_late',
] as const;

const MAP_ACHIEVEMENT_IDS = ['map_hourglass', 'map_switchback'] as const;

describe('new map mutators', () => {
  it('registers three challenges on hourglass or switchback', () => {
    const ids = MUTATOR_CHALLENGES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    const expectedMaps: Record<(typeof NEW_MUTATOR_IDS)[number], string> = {
      mc_hourglass_neck: 'hourglass',
      mc_switchback_line: 'switchback',
      mc_hourglass_late: 'hourglass',
    };
    for (const id of NEW_MUTATOR_IDS) {
      const challenge = MUTATOR_CHALLENGES.find((c) => c.id === id);
      expect(challenge, id).toBeDefined();
      expect(challenge!.mapId).toBe(expectedMaps[id]);
      expect(PATHS[challenge!.mapId], `${id} map`).toBeDefined();
      expect(challenge!.tags.length).toBeGreaterThan(0);
      expect(challenge!.rules).toBeDefined();
    }
  });
});

describe('new map achievements', () => {
  it('unlocks after completing the named map', () => {
    for (const id of MAP_ACHIEVEMENT_IDS) {
      const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === id);
      expect(achievement, id).toBeDefined();
      const mapId = achievement!.conditions[0].mapId;
      expect(mapId).toBeTruthy();
      const { met, progress } = checkCondition(
        achievement!,
        { ...getInitialStatistics(), mapsCompleted: { [mapId!]: 1 } },
        {},
      );
      expect(progress[0]).toBe(1);
      expect(met).toBe(true);
    }
  });
});

describe('complete_map condition', () => {
  it('counts total map completions when mapId is omitted', () => {
    const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === 'prog_first_blood');
    expect(achievement).toBeDefined();
    const { met, progress } = checkCondition(
      achievement!,
      { ...getInitialStatistics(), mapsCompleted: { zigzag: 1 } },
      {},
    );
    expect(progress[0]).toBe(1);
    expect(met).toBe(true);
  });

  it('counts unique maps for complete_unique_maps', () => {
    const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === 'map_complete_5');
    expect(achievement).toBeDefined();
    const { met, progress } = checkCondition(
      achievement!,
      {
        ...getInitialStatistics(),
        mapsCompleted: {
          zigzag: 2,
          snake: 1,
          hourglass: 1,
          switchback: 3,
          ring: 1,
        },
      },
      {},
    );
    expect(progress[0]).toBe(5);
    expect(met).toBe(true);
  });
});
