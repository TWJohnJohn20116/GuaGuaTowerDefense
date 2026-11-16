import type { PathConfig } from '@/types/game';

export interface MapPointInfo {
  col: number;
  row: number;
}

/** 把一張地圖的所有路徑點攤平（進階地圖有 segments，普通地圖只有 waypoints） */
export const collectPathPoints = (cfg: PathConfig | undefined): MapPointInfo[] => {
  if (!cfg) return [];
  const out: MapPointInfo[] = [];
  if (cfg.segments && cfg.segments.length > 0) {
    for (const seg of cfg.segments) {
      for (const wp of seg.waypoints) out.push({ col: wp.col, row: wp.row });
    }
  }
  if (out.length === 0 && cfg.waypoints) {
    for (const wp of cfg.waypoints) out.push({ col: wp.col, row: wp.row });
  }
  return out;
};

/** 單一塔位在射程內覆蓋的路徑點數（格為單位，含小數容差） */
export const coveragePointsOf = (
  points: MapPointInfo[],
  col: number,
  row: number,
  range: number,
): number => {
  let covered = 0;
  for (const p of points) {
    const dx = p.col - col;
    const dy = p.row - row;
    if (dx * dx + dy * dy <= range * range) covered++;
  }
  return covered;
};

/** 這張地圖上任何一個塔位能達到的最大覆蓋（用於正規化） */
export const maxCoverageOfMap = (
  points: MapPointInfo[],
  cols: number,
  rows: number,
  range: number,
): number => {
  let best = 0;
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      const c = coveragePointsOf(points, col, row, range);
      if (c > best) best = c;
    }
  }
  return best;
};

/** 塔位到最近路徑點的距離（格）；沒有路徑回 Infinity */
export const distanceToPath = (points: MapPointInfo[], col: number, row: number): number => {
  let best = Number.POSITIVE_INFINITY;
  for (const p of points) {
    const d = Math.hypot(p.col - col, p.row - row);
    if (d < best) best = d;
  }
  return best;
};

/** 地圖尺寸（優先讀格子設定，缺省用 GAME_CONSTANTS 的 15×11） */
export const gridSizeOf = (cfg: PathConfig | undefined): { cols: number; rows: number } => {
  const grid = cfg && 'grid' in cfg ? (cfg as { grid?: { cols?: number; rows?: number } }).grid : undefined;
  return { cols: grid?.cols ?? 15, rows: grid?.rows ?? 11 };
};
