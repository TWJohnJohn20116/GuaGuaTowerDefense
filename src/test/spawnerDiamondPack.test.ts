/**
 * 分裂巢穴波次組、菱形裂殖突變挑戰、每日 win_wave_set
 */

import { describe, it, expect } from 'vitest';
import { ENEMY_DATA } from '@/data/gameData';
import { ALL_ACHIEVEMENTS, getInitialStatistics } from '@/data/achievementData';
import { checkCondition } from '@/store/achievementStoreCheck';
import { OFFICIAL_WAVE_SETS, findPlayableWaveSet } from '@/utils/waveSets';

const WAVE_SET_ID = 'official_spawner_nest';
const MAP_ID = 'diamond';

describe('spawner nest wave set', () => {
  it('registers an official spawner-heavy set', () => {
    const set = OFFICIAL_WAVE_SETS.find((item) => item.id === WAVE_SET_ID);
    expect(set).toBeDefined();
    expect(set!.name).toBe('分裂巢穴');
    expect(set!.waves.length).toBeGreaterThanOrEqual(8);
    const spawnerWaves = set!.waves.filter((wave) => wave.enemies.some((g) => g.type === 'spawner'));
    expect(spawnerWaves.length).toBeGreaterThanOrEqual(6);
    for (const wave of set!.waves) {
      expect(wave.reward).toBeGreaterThan(0);
      for (const group of wave.enemies) {
        expect(ENEMY_DATA[group.type], group.type).toBeDefined();
        expect(group.count).toBeGreaterThan(0);
      }
    }
    expect(findPlayableWaveSet(WAVE_SET_ID)?.name).toBe('分裂巢穴');
    const last = set!.waves.at(-1)!;
    expect(last.enemies.some((g) => g.type === 'boss' || g.type === 'spawner')).toBe(true);
  });
});

describe('spawner diamond achievements', () => {

  it('unlocks diamond map and spawner-nest wave achievements', () => {
    const mapAch = ALL_ACHIEVEMENTS.find((a) => a.id === 'map_diamond');
    expect(mapAch).toBeDefined();
    expect(mapAch!.conditions[0].mapId).toBe(MAP_ID);
    expect(checkCondition(
      mapAch!,
      { ...getInitialStatistics(), mapsCompleted: { [MAP_ID]: 1 } },
      {},
    ).met).toBe(true);

    const waveAch = ALL_ACHIEVEMENTS.find((a) => a.id === 'wave_spawner_nest');
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

