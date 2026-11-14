/**
 * 鉗形地圖、鐵壁方陣波次組、鉗口鐵壁突變挑戰、每日 win_wave_set
 */

import { describe, it, expect } from 'vitest';
import { ENEMY_DATA, PATHS } from '@/data/gameData';
import { GAME_CONSTANTS } from '@/data/gameData/waveData';
import { ALL_ACHIEVEMENTS, getInitialStatistics } from '@/data/achievementData';
import { checkCondition } from '@/store/achievementStoreCheck';
import { OFFICIAL_WAVE_SETS, findPlayableWaveSet } from '@/utils/waveSets';
import type { PathConfig } from '@/types/game';

const MAP_ID = 'pincer';
const WAVE_SET_ID = 'official_iron_phalanx';

const ARMORED_TYPES = new Set(['armored', 'heavy', 'tank', 'shield']);

function collectPoints(path: PathConfig) {
  const points = [...path.waypoints];
  for (const seg of path.segments ?? []) {
    points.push(...seg.waypoints);
  }
  return points;
}

describe('pincer map', () => {
  it('registers a full-height pincer that pinches into a center killbox', () => {
    const path = PATHS[MAP_ID];
    expect(path).toBeDefined();
    expect(path.name).toBe('鉗形');
    expect(path.description.length).toBeGreaterThan(0);

    for (const point of collectPoints(path)) {
      expect(point.col).toBeGreaterThanOrEqual(0);
      expect(point.col).toBeLessThan(GAME_CONSTANTS.GRID_COLS);
      expect(point.row).toBeGreaterThanOrEqual(0);
      expect(point.row).toBeLessThan(GAME_CONSTANTS.GRID_ROWS);
    }

    const segments = path.segments ?? [];
    expect(segments.length).toBeGreaterThanOrEqual(4);
    const byId = new Map(segments.map((seg) => [seg.id, seg]));
    expect(byId.has(path.startSegmentId ?? '')).toBe(true);
    for (const seg of segments) {
      const last = seg.waypoints[seg.waypoints.length - 1];
      for (const nextId of seg.next) {
        const next = byId.get(nextId);
        expect(next, `${MAP_ID} -> ${nextId}`).toBeDefined();
        expect(next!.waypoints[0]).toEqual(last);
      }
    }
    expect(segments.some((seg) => seg.next.length === 0)).toBe(true);

    const rows = collectPoints(path).map((p) => p.row);
    expect(Math.min(...rows)).toBe(0);
    expect(Math.max(...rows)).toBe(GAME_CONSTANTS.GRID_ROWS - 1);
  });
});

describe('iron phalanx wave set', () => {
  it('registers an official armored-heavy set', () => {
    const set = OFFICIAL_WAVE_SETS.find((item) => item.id === WAVE_SET_ID);
    expect(set).toBeDefined();
    expect(set!.name).toBe('鐵壁方陣');
    expect(set!.waves.length).toBeGreaterThanOrEqual(8);
    const armoredWaves = set!.waves.filter((wave) =>
      wave.enemies.some((g) => ARMORED_TYPES.has(g.type)),
    );
    expect(armoredWaves.length).toBeGreaterThanOrEqual(6);
    for (const wave of set!.waves) {
      expect(wave.reward).toBeGreaterThan(0);
      for (const group of wave.enemies) {
        expect(ENEMY_DATA[group.type], group.type).toBeDefined();
        expect(group.count).toBeGreaterThan(0);
      }
    }
    expect(findPlayableWaveSet(WAVE_SET_ID)?.name).toBe('鐵壁方陣');
    const last = set!.waves.at(-1)!;
    expect(last.enemies.some((g) => g.type === 'boss' || ARMORED_TYPES.has(g.type))).toBe(true);
  });
});

describe('iron pincer achievements', () => {

  it('unlocks pincer map and iron-phalanx wave achievements', () => {
    const mapAch = ALL_ACHIEVEMENTS.find((a) => a.id === 'map_pincer');
    expect(mapAch).toBeDefined();
    expect(mapAch!.conditions[0].mapId).toBe(MAP_ID);
    expect(checkCondition(
      mapAch!,
      { ...getInitialStatistics(), mapsCompleted: { [MAP_ID]: 1 } },
      {},
    ).met).toBe(true);

    const waveAch = ALL_ACHIEVEMENTS.find((a) => a.id === 'wave_iron_phalanx');
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

