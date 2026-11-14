/**
 * 官方波次組必須能從突變挑戰直接開打，並有可追蹤的通關成就
 */

import { describe, it, expect } from 'vitest';
import { MUTATOR_CHALLENGES } from '@/data/mutatorChallengeData';
import { PATHS } from '@/data/gameData';
import { ALL_ACHIEVEMENTS, getInitialStatistics } from '@/data/achievementData';
import { checkCondition } from '@/store/achievementStoreCheck';
import { findPlayableWaveSet } from '@/utils/waveSets';
import { resolveMutatorStartConfig } from '@/utils/mutatorStart';

const WAVE_MUTATORS = [
  { id: 'mc_shield_assault_wave', waveSetId: 'official_shield_assault', mapId: 'hourglass' },
  { id: 'mc_ghost_tide_wave', waveSetId: 'official_ghost_tide', mapId: 'switchback' },
] as const;

const WAVE_ACHIEVEMENTS = [
  { id: 'wave_shield_assault', waveSetId: 'official_shield_assault' },
  { id: 'wave_ghost_tide', waveSetId: 'official_ghost_tide' },
] as const;

describe('official wave set mutators', () => {
  it('locks each challenge to a built-in wave set on a real map', () => {
    const ids = MUTATOR_CHALLENGES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const spec of WAVE_MUTATORS) {
      const challenge = MUTATOR_CHALLENGES.find((c) => c.id === spec.id);
      expect(challenge, spec.id).toBeDefined();
      expect(challenge!.customWaveSetId).toBe(spec.waveSetId);
      expect(PATHS[challenge!.mapId], spec.id).toBeDefined();
      expect(challenge!.mapId).toBe(spec.mapId);
      expect(challenge!.tags.length).toBeGreaterThan(0);

      const waveSet = findPlayableWaveSet(spec.waveSetId);
      expect(waveSet, spec.waveSetId).toBeDefined();

      const start = resolveMutatorStartConfig(challenge!);
      expect(start.customWaveSetId).toBe(spec.waveSetId);
      expect(start.maxWaves).toBe(waveSet!.waves.length);
      expect(start.pathName).toBe(spec.mapId);
      expect(start.mutator.id).toBe(spec.id);
    }
  });
});

describe('official wave set achievements', () => {
  it('unlocks after completing the named wave set', () => {
    for (const spec of WAVE_ACHIEVEMENTS) {
      const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === spec.id);
      expect(achievement, spec.id).toBeDefined();
      expect(achievement!.conditions[0].type).toBe('complete_wave_set');
      expect(achievement!.conditions[0].waveSetId).toBe(spec.waveSetId);

      const { met, progress } = checkCondition(
        achievement!,
        { ...getInitialStatistics(), waveSetsCompleted: { [spec.waveSetId]: 1 } },
        {},
      );
      expect(progress[0]).toBe(1);
      expect(met).toBe(true);
    }
  });
});
