/**
 * 盤繞／閘門／谷地：空閃縱隊、狂暴鐵壁、巢穴干擾
 */

import { describe, it, expect } from 'vitest';
import { ENEMY_DATA, PATHS } from '@/data/gameData';
import { ALL_ACHIEVEMENTS, getInitialStatistics } from '@/data/achievementData';
import { checkCondition } from '@/store/achievementStoreCheck';
import { OFFICIAL_WAVE_SETS, findPlayableWaveSet } from '@/utils/waveSets';
import { PATHS_BY_DIFFICULTY } from '@/data/gameData/pathData';

const PACKS = [
  {
    waveSetId: 'official_air_blink',
    waveName: '空閃縱隊',
    enemy: 'flyer' as const,
    mapId: 'coil',
    mapName: '盤繞',
    mapAchId: 'map_coil',
    waveAchId: 'wave_air_blink',
  },
  {
    waveSetId: 'official_rage_wall',
    waveName: '狂暴鐵壁',
    enemy: 'berserker' as const,
    mapId: 'gate',
    mapName: '閘門',
    mapAchId: 'map_gate',
    waveAchId: 'wave_rage_wall',
  },
  {
    waveSetId: 'official_nest_jam',
    waveName: '巢穴干擾',
    enemy: 'spawner' as const,
    mapId: 'valley',
    mapName: '谷地',
    mapAchId: 'map_valley',
    waveAchId: 'wave_nest_jam',
  },
] as const;

describe('hard map trio packs', () => {
  it('registers three playable hard maps with valid forks', () => {
    for (const pack of PACKS) {
      const path = PATHS[pack.mapId];
      expect(path, pack.mapId).toBeDefined();
      expect(path.name).toBe(pack.mapName);
      expect(path.difficulty).toBe('困難');
      expect(PATHS_BY_DIFFICULTY.hard[pack.mapId]).toBeDefined();
      expect(path.startSegmentId).toBeTruthy();
      expect(path.segments?.length).toBeGreaterThanOrEqual(3);
      const ids = new Set(path.segments!.map((s) => s.id));
      expect(ids.has(path.startSegmentId!)).toBe(true);
      for (const segment of path.segments!) {
        expect(segment.waypoints.length).toBeGreaterThanOrEqual(2);
        for (const point of segment.waypoints) {
          expect(point.col).toBeGreaterThanOrEqual(0);
          expect(point.col).toBeLessThanOrEqual(14);
          expect(point.row).toBeGreaterThanOrEqual(0);
          expect(point.row).toBeLessThanOrEqual(10);
        }
        for (const nextId of segment.next) {
          expect(ids.has(nextId), `${pack.mapId} -> ${nextId}`).toBe(true);
        }
      }
    }
  });

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
