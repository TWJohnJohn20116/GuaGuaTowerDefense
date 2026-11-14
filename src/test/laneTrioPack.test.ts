/**
 * 直線／長廊／蛇形三包：普通潮汐、裝甲縱隊、快速突襲
 */

import { describe, it, expect } from 'vitest';
import { ENEMY_DATA, PATHS } from '@/data/gameData';
import { MUTATOR_CHALLENGES } from '@/data/mutatorChallengeData';
import { DAILY_CHALLENGE_TEMPLATES } from '@/data/dailyChallengeData';
import { ALL_ACHIEVEMENTS, getInitialStatistics } from '@/data/achievementData';
import { checkCondition } from '@/store/achievementStoreCheck';
import { OFFICIAL_WAVE_SETS, findPlayableWaveSet } from '@/utils/waveSets';
import { resolveMutatorStartConfig } from '@/utils/mutatorStart';
import { evaluateDailyCondition, type GameOutcomeForChallenge } from '@/store/dailyChallengeStore';

function blankOutcome(overrides: Partial<GameOutcomeForChallenge> = {}): GameOutcomeForChallenge {
  return {
    won: false,
    noDamage: false,
    fullHp: false,
    playTimeSeconds: 0,
    moneySpent: 0,
    moneyEarned: 0,
    enemiesKilled: 0,
    enemiesKilledByType: {},
    bossesKilled: 0,
    towersPlaced: 0,
    towersPlacedByType: {},
    towersReachedMaxLevel: 0,
    perfectWaves: 0,
    endless: false,
    endlessWave: 0,
    difficulty: 'normal',
    towersFused: 0,
    ...overrides,
  };
}

const PACKS = [
  {
    waveSetId: 'official_normal_tide',
    waveName: '普通潮汐',
    enemy: 'normal' as const,
    mutatorId: 'mc_normal_straight',
    mapId: 'straight',
    mapName: '直線',
    mapAchId: 'map_straight',
    waveAchId: 'wave_normal_tide',
    dailyId: 'dc_normal_tide',
  },
  {
    waveSetId: 'official_armor_column',
    waveName: '裝甲縱隊',
    enemy: 'armored' as const,
    mutatorId: 'mc_armor_corridor',
    mapId: 'corridor',
    mapName: '長廊',
    mapAchId: 'map_corridor',
    waveAchId: 'wave_armor_column',
    dailyId: 'dc_armor_column',
  },
  {
    waveSetId: 'official_fast_raid',
    waveName: '快速突襲',
    enemy: 'fast' as const,
    mutatorId: 'mc_fast_snake',
    mapId: 'snake',
    mapName: '蛇形',
    mapAchId: 'map_snake',
    waveAchId: 'wave_fast_raid',
    dailyId: 'dc_fast_raid',
  },
] as const;

describe('lane trio wave packs', () => {
  it('registers three unique official wave sets', () => {
    const ids = OFFICIAL_WAVE_SETS.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const pack of PACKS) {
      const set = OFFICIAL_WAVE_SETS.find((item) => item.id === pack.waveSetId);
      expect(set, pack.waveSetId).toBeDefined();
      expect(set!.name).toBe(pack.waveName);
      expect(set!.waves.length).toBeGreaterThanOrEqual(8);
      const themed = set!.waves.filter((wave) => wave.enemies.some((g) => g.type === pack.enemy));
      expect(themed.length, pack.waveSetId).toBeGreaterThanOrEqual(6);
      for (const wave of set!.waves) {
        expect(wave.reward).toBeGreaterThan(0);
        for (const group of wave.enemies) {
          expect(ENEMY_DATA[group.type], group.type).toBeDefined();
          expect(group.count).toBeGreaterThan(0);
        }
      }
      expect(findPlayableWaveSet(pack.waveSetId)?.name).toBe(pack.waveName);
      const last = set!.waves.at(-1)!;
      expect(last.enemies.some((g) => g.type === 'boss' || g.type === pack.enemy)).toBe(true);
    }
  });

  it('locks each set onto its map with unique mutators', () => {
    const ids = MUTATOR_CHALLENGES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const pack of PACKS) {
      const challenge = MUTATOR_CHALLENGES.find((c) => c.id === pack.mutatorId);
      expect(challenge, pack.mutatorId).toBeDefined();
      expect(challenge!.mapId).toBe(pack.mapId);
      expect(challenge!.customWaveSetId).toBe(pack.waveSetId);
      expect(PATHS[pack.mapId]).toBeDefined();
      expect(PATHS[pack.mapId].name).toBe(pack.mapName);
      const start = resolveMutatorStartConfig(challenge!);
      expect(start.customWaveSetId).toBe(pack.waveSetId);
      expect(start.maxWaves).toBe(findPlayableWaveSet(pack.waveSetId)!.waves.length);
    }
  });

  it('unlocks map and wave-set achievements', () => {
    for (const pack of PACKS) {
      const mapAch = ALL_ACHIEVEMENTS.find((a) => a.id === pack.mapAchId);
      expect(mapAch, pack.mapAchId).toBeDefined();
      expect(mapAch!.conditions[0].mapId).toBe(pack.mapId);
      expect(checkCondition(
        mapAch!,
        { ...getInitialStatistics(), mapsCompleted: { [pack.mapId]: 1 } },
        {},
      ).met).toBe(true);

      const waveAch = ALL_ACHIEVEMENTS.find((a) => a.id === pack.waveAchId);
      expect(waveAch, pack.waveAchId).toBeDefined();
      expect(waveAch!.conditions[0].type).toBe('complete_wave_set');
      expect(waveAch!.conditions[0].waveSetId).toBe(pack.waveSetId);
      expect(checkCondition(
        waveAch!,
        { ...getInitialStatistics(), waveSetsCompleted: { [pack.waveSetId]: 1 } },
        {},
      ).met).toBe(true);
    }
  });

  it('adds daily templates that only count the matching wave set', () => {
    const ids = DAILY_CHALLENGE_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const pack of PACKS) {
      const template = DAILY_CHALLENGE_TEMPLATES.find((t) => t.id === pack.dailyId);
      expect(template, pack.dailyId).toBeDefined();
      expect(template!.conditions.some((c) => c.type === 'win_wave_set' && c.waveSetId === pack.waveSetId)).toBe(true);

      const cond = { type: 'win_wave_set' as const, target: 1, waveSetId: pack.waveSetId, label: pack.waveName };
      expect(evaluateDailyCondition(cond, blankOutcome({ won: true, customWaveSetId: pack.waveSetId }))).toBe(1);
      expect(evaluateDailyCondition(cond, blankOutcome({ won: true, customWaveSetId: 'official_speedy_rush' }))).toBe(0);
    }
  });
});
