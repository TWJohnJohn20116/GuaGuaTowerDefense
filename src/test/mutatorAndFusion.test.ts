/**
 * 突變挑戰資料完整性，以及融合成就可被現有統計推進
 */

import { describe, it, expect } from 'vitest';
import { MUTATOR_CHALLENGES } from '@/data/mutatorChallengeData';
import { PATHS } from '@/data/gameData';
import { ALL_ACHIEVEMENTS, getInitialStatistics } from '@/data/achievementData';
import { checkCondition, computeCustomCurrent } from '@/store/achievementStoreCheck';

const NEW_MUTATOR_IDS = [
  'mc_fusion_doctrine',
  'mc_night_raid',
  'mc_pierce_line',
  'mc_endless_rift',
];

describe('mutator challenges', () => {
  it('includes the four new challenges with unique ids and real maps', () => {
    const ids = MUTATOR_CHALLENGES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of NEW_MUTATOR_IDS) {
      const challenge = MUTATOR_CHALLENGES.find((c) => c.id === id);
      expect(challenge, id).toBeDefined();
      expect(PATHS[challenge!.mapId], `${id} map`).toBeDefined();
      expect(challenge!.tags.length).toBeGreaterThan(0);
    }
  });
});

describe('fusion achievements', () => {
  it('tracks fuse_all_four from towers placed by type', () => {
    const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === 'fuse_all_four');
    expect(achievement).toBeDefined();
    const stats = {
      ...getInitialStatistics(),
      towersPlacedByType: { storm: 1, plague: 2, demolisher: 1, tempest: 1 },
    };
    expect(computeCustomCurrent(achievement!, stats, {})).toBe(4);
  });

  it('tracks fuse_10 with towers_fused condition', () => {
    const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === 'fuse_10');
    expect(achievement).toBeDefined();
    const { met, progress } = checkCondition(
      achievement!,
      { ...getInitialStatistics(), totalTowerFusions: 10 },
      {},
    );
    expect(progress[0]).toBe(10);
    expect(met).toBe(true);
  });
});
