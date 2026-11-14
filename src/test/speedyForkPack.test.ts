/**
 * 極速衝鋒波次組、分叉極速突變挑戰、每日 win_wave_set
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

const WAVE_SET_ID = 'official_speedy_rush';
const MUTATOR_ID = 'mc_speedy_fork';
const MAP_ID = 'y_fork';

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

describe('speedy rush wave set', () => {
  it('registers an official speedy-heavy set', () => {
    const set = OFFICIAL_WAVE_SETS.find((item) => item.id === WAVE_SET_ID);
    expect(set).toBeDefined();
    expect(set!.name).toBe('極速衝鋒');
    expect(set!.waves.length).toBeGreaterThanOrEqual(8);
    const speedyWaves = set!.waves.filter((wave) => wave.enemies.some((g) => g.type === 'speedy'));
    expect(speedyWaves.length).toBeGreaterThanOrEqual(6);
    for (const wave of set!.waves) {
      expect(wave.reward).toBeGreaterThan(0);
      for (const group of wave.enemies) {
        expect(ENEMY_DATA[group.type], group.type).toBeDefined();
        expect(group.count).toBeGreaterThan(0);
      }
    }
    expect(findPlayableWaveSet(WAVE_SET_ID)?.name).toBe('極速衝鋒');
    const last = set!.waves.at(-1)!;
    expect(last.enemies.some((g) => g.type === 'boss' || g.type === 'speedy')).toBe(true);
  });
});

describe('speedy fork mutator and achievements', () => {
  it('locks the speedy set onto y-fork', () => {
    const ids = MUTATOR_CHALLENGES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    const challenge = MUTATOR_CHALLENGES.find((c) => c.id === MUTATOR_ID);
    expect(challenge).toBeDefined();
    expect(challenge!.mapId).toBe(MAP_ID);
    expect(challenge!.customWaveSetId).toBe(WAVE_SET_ID);
    expect(PATHS[MAP_ID]).toBeDefined();
    expect(PATHS[MAP_ID].name).toBe('Y型分叉');
    const start = resolveMutatorStartConfig(challenge!);
    expect(start.customWaveSetId).toBe(WAVE_SET_ID);
    expect(start.maxWaves).toBe(findPlayableWaveSet(WAVE_SET_ID)!.waves.length);
  });

  it('unlocks y-fork map and speedy-rush wave achievements', () => {
    const mapAch = ALL_ACHIEVEMENTS.find((a) => a.id === 'map_y_fork');
    expect(mapAch).toBeDefined();
    expect(mapAch!.conditions[0].mapId).toBe(MAP_ID);
    expect(checkCondition(
      mapAch!,
      { ...getInitialStatistics(), mapsCompleted: { [MAP_ID]: 1 } },
      {},
    ).met).toBe(true);

    const waveAch = ALL_ACHIEVEMENTS.find((a) => a.id === 'wave_speedy_rush');
    expect(waveAch).toBeDefined();
    expect(waveAch!.conditions[0].type).toBe('complete_wave_set');
    expect(waveAch!.conditions[0].waveSetId).toBe(WAVE_SET_ID);
    expect(checkCondition(
      waveAch!,
      { ...getInitialStatistics(), waveSetsCompleted: { [WAVE_SET_ID]: 1 } },
      {},
    ).met).toBe(true);
  });
});

describe('daily speedy rush', () => {
  it('adds a speedy-rush daily template', () => {
    const ids = DAILY_CHALLENGE_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    const template = DAILY_CHALLENGE_TEMPLATES.find((t) => t.id === 'dc_speedy_rush');
    expect(template).toBeDefined();
    expect(template!.conditions.some((c) => c.type === 'win_wave_set' && c.waveSetId === WAVE_SET_ID)).toBe(true);
  });

  it('counts a win only when the matching wave set was used', () => {
    const cond = { type: 'win_wave_set' as const, target: 1, waveSetId: WAVE_SET_ID, label: '極速衝鋒通關' };
    expect(evaluateDailyCondition(cond, blankOutcome({ won: true, customWaveSetId: WAVE_SET_ID }))).toBe(1);
    expect(evaluateDailyCondition(cond, blankOutcome({ won: true, customWaveSetId: 'official_spawner_nest' }))).toBe(0);
  });
});
