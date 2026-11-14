/**
 * 風車地圖：四葉分流，接到蟲群圍城突變與專屬成就
 */

import { describe, it, expect } from 'vitest';
import { PATHS } from '@/data/gameData';
import { GAME_CONSTANTS } from '@/data/gameData/waveData';
import { ALL_ACHIEVEMENTS, getInitialStatistics } from '@/data/achievementData';
import { checkCondition } from '@/store/achievementStoreCheck';
import type { PathConfig } from '@/types/game';

const MAP_ID = 'pinwheel';

function collectPoints(path: PathConfig) {
  const points = [...path.waypoints];
  for (const seg of path.segments ?? []) {
    points.push(...seg.waypoints);
  }
  return points;
}

describe('pinwheel map', () => {
  it('registers a four-leaf split inside the grid', () => {
    const path = PATHS[MAP_ID];
    expect(path).toBeDefined();
    expect(path.name).toBe('風車');
    expect(path.description.length).toBeGreaterThan(0);

    for (const point of collectPoints(path)) {
      expect(point.col).toBeGreaterThanOrEqual(0);
      expect(point.col).toBeLessThan(GAME_CONSTANTS.GRID_COLS);
      expect(point.row).toBeGreaterThanOrEqual(0);
      expect(point.row).toBeLessThan(GAME_CONSTANTS.GRID_ROWS);
    }

    const segments = path.segments ?? [];
    expect(segments.length).toBeGreaterThanOrEqual(6);
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
    const start = byId.get(path.startSegmentId ?? '');
    expect(start!.next.length).toBe(4);
    expect(segments.some((seg) => seg.next.length === 0)).toBe(true);
  });
});

describe('pinwheel swarm achievement', () => {

  it('unlocks the pinwheel map achievement', () => {
    const mapAch = ALL_ACHIEVEMENTS.find((a) => a.id === 'map_pinwheel');
    expect(mapAch).toBeDefined();
    expect(mapAch!.name).toBe('風車守將');
    expect(mapAch!.conditions[0].mapId).toBe(MAP_ID);
    expect(checkCondition(
      mapAch!,
      { ...getInitialStatistics(), mapsCompleted: { [MAP_ID]: 1 } },
      {},
    ).met).toBe(true);
  });
});
