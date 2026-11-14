/**
 * 新地圖必須存在、格子不越界、叉路銜接正確
 */

import { describe, it, expect } from 'vitest';
import { PATHS } from '@/data/gameData';
import { GAME_CONSTANTS } from '@/data/gameData/waveData';
import type { PathConfig } from '@/types/game';

const NEW_MAPS = ['hourglass', 'switchback'] as const;

function collectPoints(path: PathConfig) {
  const points = [...path.waypoints];
  for (const seg of path.segments ?? []) {
    points.push(...seg.waypoints);
  }
  return points;
}

describe('new maps', () => {
  it('registers hourglass and switchback', () => {
    for (const id of NEW_MAPS) {
      expect(PATHS[id], id).toBeDefined();
      expect(PATHS[id].name.length).toBeGreaterThan(0);
      expect(PATHS[id].description.length).toBeGreaterThan(0);
    }
  });

  it('keeps every waypoint inside the grid', () => {
    for (const id of NEW_MAPS) {
      for (const point of collectPoints(PATHS[id])) {
        expect(point.col, `${id} col`).toBeGreaterThanOrEqual(0);
        expect(point.col, `${id} col`).toBeLessThan(GAME_CONSTANTS.GRID_COLS);
        expect(point.row, `${id} row`).toBeGreaterThanOrEqual(0);
        expect(point.row, `${id} row`).toBeLessThan(GAME_CONSTANTS.GRID_ROWS);
      }
    }
  });

  it('connects fork segments without gaps', () => {
    for (const id of NEW_MAPS) {
      const path = PATHS[id];
      const segments = path.segments ?? [];
      expect(segments.length, id).toBeGreaterThan(0);
      const byId = new Map(segments.map((seg) => [seg.id, seg]));
      expect(byId.has(path.startSegmentId ?? ''), `${id} start`).toBe(true);
      for (const seg of segments) {
        const last = seg.waypoints[seg.waypoints.length - 1];
        for (const nextId of seg.next) {
          const next = byId.get(nextId);
          expect(next, `${id} -> ${nextId}`).toBeDefined();
          const first = next!.waypoints[0];
          expect(first).toEqual(last);
        }
      }
      expect(segments.some((seg) => seg.next.length === 0), `${id} exit`).toBe(true);
    }
  });
});
