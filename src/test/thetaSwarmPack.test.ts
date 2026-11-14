/**
 * 日字廊地圖、蟲群圍城波次組，以及對應突變挑戰與成就
 */

import { describe, it, expect } from 'vitest';
import { ENEMY_DATA, PATHS } from '@/data/gameData';
import { GAME_CONSTANTS } from '@/data/gameData/waveData';
import { MUTATOR_CHALLENGES } from '@/data/mutatorChallengeData';
import { ALL_ACHIEVEMENTS, getInitialStatistics } from '@/data/achievementData';
import { checkCondition } from '@/store/achievementStoreCheck';
import { OFFICIAL_WAVE_SETS, findPlayableWaveSet } from '@/utils/waveSets';
import { resolveMutatorStartConfig } from '@/utils/mutatorStart';
import type { PathConfig } from '@/types/game';

const MAP_ID = 'theta';
const WAVE_SET_ID = 'official_swarm_siege';
const MUTATOR_ID = 'mc_swarm_theta';

function collectPoints(path: PathConfig) {
  const points = [...path.waypoints];
  for (const seg of path.segments ?? []) {
    points.push(...seg.waypoints);
  }
  return points;
}

describe('theta map', () => {
  it('registers a three-way merge map inside the grid', () => {
    const path = PATHS[MAP_ID];
    expect(path).toBeDefined();
    expect(path.name).toBe('日字廊');
    expect(path.description.length).toBeGreaterThan(0);

    for (const point of collectPoints(path)) {
      expect(point.col).toBeGreaterThanOrEqual(0);
      expect(point.col).toBeLessThan(GAME_CONSTANTS.GRID_COLS);
      expect(point.row).toBeGreaterThanOrEqual(0);
      expect(point.row).toBeLessThan(GAME_CONSTANTS.GRID_ROWS);
    }

    const segments = path.segments ?? [];
    expect(segments.some((seg) => seg.next.length >= 3), 'three-way fork').toBe(true);
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
  });
});

describe('swarm siege wave set', () => {
  it('is an official set full of swarm enemies', () => {
    const set = OFFICIAL_WAVE_SETS.find((item) => item.id === WAVE_SET_ID);
    expect(set).toBeDefined();
    expect(set!.name).toBe('蟲群圍城');
    expect(set!.waves.length).toBeGreaterThanOrEqual(8);
    const swarmWaves = set!.waves.filter((wave) => wave.enemies.some((g) => g.type === 'swarm'));
    expect(swarmWaves.length).toBeGreaterThanOrEqual(6);
    for (const wave of set!.waves) {
      expect(wave.reward).toBeGreaterThan(0);
      for (const group of wave.enemies) {
        expect(ENEMY_DATA[group.type], group.type).toBeDefined();
        expect(group.count).toBeGreaterThan(0);
      }
    }
    expect(findPlayableWaveSet(WAVE_SET_ID)?.name).toBe('蟲群圍城');
    const last = set!.waves.at(-1)!;
    expect(last.enemies.some((g) => g.type === 'boss' || g.type === 'spawner')).toBe(true);
  });
});

describe('theta swarm mutator and achievements', () => {
  it('starts the swarm set on the theta map', () => {
    const ids = MUTATOR_CHALLENGES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    const challenge = MUTATOR_CHALLENGES.find((c) => c.id === MUTATOR_ID);
    expect(challenge).toBeDefined();
    expect(challenge!.mapId).toBe(MAP_ID);
    expect(challenge!.customWaveSetId).toBe(WAVE_SET_ID);
    expect(PATHS[challenge!.mapId]).toBeDefined();
    const start = resolveMutatorStartConfig(challenge!);
    expect(start.customWaveSetId).toBe(WAVE_SET_ID);
    expect(start.maxWaves).toBe(findPlayableWaveSet(WAVE_SET_ID)!.waves.length);
  });

  it('unlocks map and wave-set achievements', () => {
    const mapAch = ALL_ACHIEVEMENTS.find((a) => a.id === 'map_theta');
    expect(mapAch).toBeDefined();
    expect(mapAch!.conditions[0].mapId).toBe(MAP_ID);
    const mapResult = checkCondition(
      mapAch!,
      { ...getInitialStatistics(), mapsCompleted: { [MAP_ID]: 1 } },
      {},
    );
    expect(mapResult.met).toBe(true);

    const waveAch = ALL_ACHIEVEMENTS.find((a) => a.id === 'wave_swarm_siege');
    expect(waveAch).toBeDefined();
    expect(waveAch!.conditions[0].type).toBe('complete_wave_set');
    expect(waveAch!.conditions[0].waveSetId).toBe(WAVE_SET_ID);
    const waveResult = checkCondition(
      waveAch!,
      { ...getInitialStatistics(), waveSetsCompleted: { [WAVE_SET_ID]: 1 } },
      {},
    );
    expect(waveResult.met).toBe(true);
  });
});
