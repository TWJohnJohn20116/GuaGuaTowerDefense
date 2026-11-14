/**
 * 螺旋地圖成就、爆破縱隊波次組，以及對應突變挑戰與每日
 */

import { describe, it, expect } from 'vitest';
import { ENEMY_DATA } from '@/data/gameData';
import { ALL_ACHIEVEMENTS, getInitialStatistics } from '@/data/achievementData';
import { checkCondition } from '@/store/achievementStoreCheck';
import { OFFICIAL_WAVE_SETS, findPlayableWaveSet } from '@/utils/waveSets';

const MAP_ID = 'spiral';
const WAVE_SET_ID = 'official_bomber_column';

describe('bomber column wave set', () => {
  it('registers an official bomber-heavy set', () => {
    const set = OFFICIAL_WAVE_SETS.find((item) => item.id === WAVE_SET_ID);
    expect(set).toBeDefined();
    expect(set!.name).toBe('爆破縱隊');
    expect(set!.waves.length).toBeGreaterThanOrEqual(8);
    const bomberWaves = set!.waves.filter((wave) => wave.enemies.some((g) => g.type === 'bomber'));
    expect(bomberWaves.length).toBeGreaterThanOrEqual(6);
    for (const wave of set!.waves) {
      expect(wave.reward).toBeGreaterThan(0);
      for (const group of wave.enemies) {
        expect(ENEMY_DATA[group.type], group.type).toBeDefined();
        expect(group.count).toBeGreaterThan(0);
      }
    }
    expect(findPlayableWaveSet(WAVE_SET_ID)?.name).toBe('爆破縱隊');
    const last = set!.waves.at(-1)!;
    expect(last.enemies.some((g) => g.type === 'boss' || g.type === 'bomber')).toBe(true);
  });
});

describe('bomber spiral achievements', () => {

  it('unlocks spiral map and bomber-column wave achievements', () => {
    const mapAch = ALL_ACHIEVEMENTS.find((a) => a.id === 'map_spiral');
    expect(mapAch).toBeDefined();
    expect(mapAch!.name).toBe('盤旋守將');
    expect(mapAch!.conditions[0].mapId).toBe(MAP_ID);
    expect(checkCondition(
      mapAch!,
      { ...getInitialStatistics(), mapsCompleted: { [MAP_ID]: 1 } },
      {},
    ).met).toBe(true);

    const helixAch = ALL_ACHIEVEMENTS.find((a) => a.id === 'map_double_helix');
    expect(helixAch!.name).not.toBe(mapAch!.name);

    const waveAch = ALL_ACHIEVEMENTS.find((a) => a.id === 'wave_bomber_column');
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

