/**
 * 精英先鋒波次組、之字先鋒突變挑戰、每日 win_wave_set
 */

import { describe, it, expect } from 'vitest';
import { ENEMY_DATA } from '@/data/gameData';
import { ALL_ACHIEVEMENTS, getInitialStatistics } from '@/data/achievementData';
import { checkCondition } from '@/store/achievementStoreCheck';
import { OFFICIAL_WAVE_SETS, findPlayableWaveSet } from '@/utils/waveSets';

const WAVE_SET_ID = 'official_elite_vanguard';
const MAP_ID = 'zigzag';

describe('elite vanguard wave set', () => {
  it('registers an official elite-heavy set', () => {
    const set = OFFICIAL_WAVE_SETS.find((item) => item.id === WAVE_SET_ID);
    expect(set).toBeDefined();
    expect(set!.name).toBe('精英先鋒');
    expect(set!.waves.length).toBeGreaterThanOrEqual(8);
    const eliteWaves = set!.waves.filter((wave) => wave.enemies.some((g) => g.type === 'elite'));
    expect(eliteWaves.length).toBeGreaterThanOrEqual(6);
    for (const wave of set!.waves) {
      expect(wave.reward).toBeGreaterThan(0);
      for (const group of wave.enemies) {
        expect(ENEMY_DATA[group.type], group.type).toBeDefined();
        expect(group.count).toBeGreaterThan(0);
      }
    }
    expect(findPlayableWaveSet(WAVE_SET_ID)?.name).toBe('精英先鋒');
    const last = set!.waves.at(-1)!;
    expect(last.enemies.some((g) => g.type === 'boss' || g.type === 'elite')).toBe(true);
  });
});

describe('elite zigzag achievements', () => {

  it('unlocks zigzag map and elite-vanguard wave achievements', () => {
    const mapAch = ALL_ACHIEVEMENTS.find((a) => a.id === 'map_zigzag');
    expect(mapAch).toBeDefined();
    expect(mapAch!.conditions[0].mapId).toBe(MAP_ID);
    expect(checkCondition(
      mapAch!,
      { ...getInitialStatistics(), mapsCompleted: { [MAP_ID]: 1 } },
      {},
    ).met).toBe(true);

    const waveAch = ALL_ACHIEVEMENTS.find((a) => a.id === 'wave_elite_vanguard');
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

