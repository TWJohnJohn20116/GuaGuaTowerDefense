/**
 * 地圖編輯器進階路徑 / 障礙工具
 */
import type { GridPosition } from '@/types/game';

export function mirrorWaypointsHorizontal(
  waypoints: GridPosition[],
  gridCols: number,
): GridPosition[] {
  return waypoints.map((wp) => ({ col: gridCols - 1 - wp.col, row: wp.row }));
}

export function mirrorWaypointsVertical(
  waypoints: GridPosition[],
  gridRows: number,
): GridPosition[] {
  return waypoints.map((wp) => ({ col: wp.col, row: gridRows - 1 - wp.row }));
}

function offsetWaypoints(
  waypoints: GridPosition[],
  dCol: number,
  dRow: number,
  gridCols: number,
  gridRows: number,
): GridPosition[] {
  return waypoints.map((wp) => ({
    col: Math.max(0, Math.min(gridCols - 1, wp.col + dCol)),
    row: Math.max(0, Math.min(gridRows - 1, wp.row + dRow)),
  }));
}

export function mirrorCellsHorizontal(
  cells: GridPosition[],
  gridCols: number,
): GridPosition[] {
  return cells.map((c) => ({ col: gridCols - 1 - c.col, row: c.row }));
}

export function mirrorCellsVertical(
  cells: GridPosition[],
  gridRows: number,
): GridPosition[] {
  return cells.map((c) => ({ col: c.col, row: gridRows - 1 - c.row }));
}

export function appendOffsetPath(
  waypoints: GridPosition[],
  dCol: number,
  dRow: number,
  gridCols: number,
  gridRows: number,
): GridPosition[] {
  const offset = offsetWaypoints(waypoints, dCol, dRow, gridCols, gridRows);
  return [...waypoints, ...offset];
}

export function appendOffsetBlocked(
  blocked: GridPosition[],
  dCol: number,
  dRow: number,
  gridCols: number,
  gridRows: number,
): GridPosition[] {
  const offset = blocked.map((c) => ({
    col: Math.max(0, Math.min(gridCols - 1, c.col + dCol)),
    row: Math.max(0, Math.min(gridRows - 1, c.row + dRow)),
  }));
  const key = (c: GridPosition) => `${c.col},${c.row}`;
  const seen = new Set(blocked.map(key));
  const merged = [...blocked];
  offset.forEach((c) => {
    const k = key(c);
    if (!seen.has(k)) {
      seen.add(k);
      merged.push(c);
    }
  });
  return merged;
}
