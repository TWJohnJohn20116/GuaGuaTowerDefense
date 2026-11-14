/**
 * 直線／長廊／蛇形三包：普通潮汐、裝甲縱隊、快速突襲
 */

import { describe, it, expect } from 'vitest';
import { ENEMY_DATA } from '@/data/gameData';
import { ALL_ACHIEVEMENTS, getInitialStatistics } from '@/data/achievementData';
import { checkCondition } from '@/store/achievementStoreCheck';
import { OFFICIAL_WAVE_SETS, findPlayableWaveSet } from '@/utils/waveSets';

const PACKS = [
  {
    waveSetId: 'official_normal_tide',
    waveName: '普通潮汐',
    enemy: 'normal' as const,
    mapId: 'straight',
    mapName: '直線',
    mapAchId: 'map_straight',
    waveAchId: 'wave_normal_tide',
  },
  {
    waveSetId: 'official_armor_column',
    waveName: '裝甲縱隊',
    enemy: 'armored' as const,
    mapId: 'corridor',
    mapName: '長廊',
    mapAchId: 'map_corridor',
    waveAchId: 'wave_armor_column',
  },
  {
    waveSetId: 'official_fast_raid',
    waveName: '快速突襲',
    enemy: 'fast' as const,
    mapId: 'snake',
    mapName: '蛇形',
    mapAchId: 'map_snake',
    waveAchId: 'wave_fast_raid',
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

});
