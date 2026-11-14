/**
 * LivePreview 地圖路徑工具
 */
import { GAME_CONSTANTS } from '@/data/gameData';
import type { CustomMapData, GridPosition } from '@/types/game';

export interface PathViewport {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const LIVE_PREVIEW_MAP_VIEWPORT: PathViewport = {
  x: 232,
  y: 36,
  width: 236,
  height: 248,
};

/** 依路徑點展開為有序格子序列 */
export function buildOrderedPathCells(waypoints: GridPosition[]): GridPosition[] {
  if (waypoints.length === 0) return [];
  if (waypoints.length === 1) return [waypoints[0]];

  const cells: GridPosition[] = [];
  const seen = new Set<string>();
  const key = (r: number, c: number) => `${r},${c}`;

  for (let i = 0; i < waypoints.length - 1; i++) {
    const p1 = waypoints[i];
    const p2 = waypoints[i + 1];
    let r = p1.row;
    let c = p1.col;

    while (true) {
      const k = key(r, c);
      if (!seen.has(k)) {
        seen.add(k);
        cells.push({ row: r, col: c });
      }
      if (r === p2.row && c === p2.col) break;
      if (r < p2.row) r++;
      else if (r > p2.row) r--;
      else if (c < p2.col) c++;
      else if (c > p2.col) c--;
    }
  }
  return cells;
}

export function cellsToScreenPoints(
  cells: GridPosition[],
  viewport: PathViewport,
): { x: number; y: number }[] {
  const { GRID_COLS, GRID_ROWS } = GAME_CONSTANTS;
  const tileW = viewport.width / GRID_COLS;
  const tileH = viewport.height / GRID_ROWS;
  return cells.map((cell) => ({
    x: viewport.x + (cell.col + 0.5) * tileW,
    y: viewport.y + (cell.row + 0.5) * tileH,
  }));
}

export function interpolateAlongPath(
  points: { x: number; y: number }[],
  t: number,
): { x: number; y: number } {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return points[0];

  const segLens: number[] = [];
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const len = Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y);
    segLens.push(len);
    total += len;
  }
  if (total <= 0) return points[0];

  let dist = Math.max(0, Math.min(1, t)) * total;
  for (let i = 0; i < segLens.length; i++) {
    if (dist <= segLens[i] || i === segLens.length - 1) {
      const ratio = segLens[i] > 0 ? dist / segLens[i] : 0;
      return {
        x: points[i].x + (points[i + 1].x - points[i].x) * ratio,
        y: points[i].y + (points[i + 1].y - points[i].y) * ratio,
      };
    }
    dist -= segLens[i];
  }
  return points[points.length - 1];
}

export function pickPreviewMap(maps: CustomMapData[]): CustomMapData | null {
  return maps.find((m) => m.waypoints.length >= 2) ?? null;
}

export function drawLivePreviewMap(
  ctx: CanvasRenderingContext2D,
  map: CustomMapData,
  viewport: PathViewport,
) {
  const { GRID_COLS, GRID_ROWS } = GAME_CONSTANTS;
  const tileW = viewport.width / GRID_COLS;
  const tileH = viewport.height / GRID_ROWS;

  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(viewport.x, viewport.y, viewport.width, viewport.height);
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  ctx.strokeRect(viewport.x, viewport.y, viewport.width, viewport.height);

  (map.blockedCells ?? []).forEach((cell) => {
    ctx.fillStyle = 'rgba(60,65,75,0.9)';
    ctx.fillRect(
      viewport.x + cell.col * tileW + 1,
      viewport.y + cell.row * tileH + 1,
      tileW - 2,
      tileH - 2,
    );
  });

  const cells = buildOrderedPathCells(map.waypoints);
  cells.forEach((cell) => {
    ctx.fillStyle = 'rgba(136,192,208,0.22)';
    ctx.fillRect(
      viewport.x + cell.col * tileW + 1,
      viewport.y + cell.row * tileH + 1,
      tileW - 2,
      tileH - 2,
    );
  });

  const pts = cellsToScreenPoints(cells, viewport);
  if (pts.length > 1) {
    ctx.strokeStyle = 'rgba(136,192,208,0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.stroke();
  }

  if (pts.length > 0) {
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(pts[0].x, pts[0].y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(pts[pts.length - 1].x, pts[pts.length - 1].y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function buildPathScreenPoints(map: CustomMapData): { x: number; y: number }[] {
  return cellsToScreenPoints(buildOrderedPathCells(map.waypoints), LIVE_PREVIEW_MAP_VIEWPORT);
}
