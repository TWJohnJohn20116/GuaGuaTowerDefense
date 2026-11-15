/**
 * 自由地圖幾何核心（純函式：無 React、無 store、無副作用）
 *
 * 舊模型把地圖切成 Tile[][]，塔只能站在整數格上，放置判定是「這一格的 type 是不是 empty」。
 * 新模型沒有格子：座標是連續的世界座標（單位＝格，1 單位 = tileSize 像素），
 * 地圖只是一組折線 + 路徑寬度 + 圓形禁建區。所有判定都退化成幾何距離。
 *
 * 這一頁是唯一的「這點能不能放塔」真相來源；store、渲染、工坊都必須走這裡，
 * 否則三邊會各自用不同的近似，出現「畫面說能放、引擎說不能」。
 */
import type { GridPosition, MapPoint, PathConfig } from '@/types/game';

/** 路徑帶預設寬度（格單位） */
export const DEFAULT_PATH_WIDTH = 0.9;
/** 塔預設佔位半徑（格單位）：約 0.76 格直徑，比舊格子略小，讓密排看起來自然 */
export const DEFAULT_TOWER_RADIUS = 0.38;
/** 地圖預設可用範圍（格單位）：沿用舊版 15×11，舊地圖不必宣告 */
export const DEFAULT_MAP_BOUNDS = { width: 15, height: 11 } as const;

/** 折線點（col/row）轉世界座標（x/y）。同一個單位系統，只是欄位名不同 */
export const toPoint = (wp: GridPosition): MapPoint => ({ x: wp.col, y: wp.row });

export const pathWidthOf = (path: PathConfig | null | undefined): number =>
  path?.width ?? DEFAULT_PATH_WIDTH;

export const boundsOf = (path: PathConfig | null | undefined): { width: number; height: number } =>
  path?.bounds ?? DEFAULT_MAP_BOUNDS;

/**
 * 一張地圖的所有折線：進階地圖回傳每個 segment，普通地圖回傳單一條。
 * 長度不足 2 的折線直接丟掉（單點畫不出帶狀路徑，也算不出距離）。
 */
export const pathPolylines = (path: PathConfig | null | undefined): GridPosition[][] => {
  if (!path) return [];
  if (path.segments && path.segments.length > 0) {
    return path.segments.map((s) => s.waypoints).filter((wps) => wps.length >= 2);
  }
  return path.waypoints.length >= 2 ? [path.waypoints] : [];
};

/** 點到線段的距離（線段退化成長度 0 時回傳點距） */
export const distanceToSegment = (
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number => {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - ax, py - ay);
  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
  if (t < 0) t = 0;
  else if (t > 1) t = 1;
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
};

/** 點到折線的最近距離 */
export const distanceToPolyline = (p: MapPoint, pts: readonly GridPosition[]): number => {
  if (pts.length === 0) return Infinity;
  if (pts.length === 1) return Math.hypot(p.x - pts[0].col, p.y - pts[0].row);
  let best = Infinity;
  for (let i = 0; i < pts.length - 1; i++) {
    const d = distanceToSegment(p.x, p.y, pts[i].col, pts[i].row, pts[i + 1].col, pts[i + 1].row);
    if (d < best) best = d;
    if (best === 0) break;
  }
  return best;
};

/** 點到「整張地圖所有折線」的最近距離；沒有路徑時回傳 Infinity（整片都能放） */
export const pathClearance = (path: PathConfig | null | undefined, p: MapPoint): number => {
  const lines = pathPolylines(path);
  if (lines.length === 0) return Infinity;
  let best = Infinity;
  for (const line of lines) {
    const d = distanceToPolyline(p, line);
    if (d < best) best = d;
    if (best === 0) break;
  }
  return best;
};

/** 兩圓是否重疊（相切視為不重疊，讓密排的邊界可預期） */
export const circlesOverlap = (a: MapPoint, ra: number, b: MapPoint, rb: number): boolean => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const r = ra + rb;
  return dx * dx + dy * dy < r * r;
};

/** 點是否在地圖可用範圍內（margin 通常給塔半徑，避免塔半個身子出界） */
export const isInsideBounds = (
  path: PathConfig | null | undefined,
  p: MapPoint,
  margin = 0,
): boolean => {
  const b = boundsOf(path);
  return (
    p.x >= margin &&
    p.y >= margin &&
    p.x <= b.width - margin &&
    p.y <= b.height - margin
  );
};

/** 是否壓到圓形禁建區 */
export const isBlockedAt = (
  path: PathConfig | null | undefined,
  p: MapPoint,
  radius: number,
): boolean => {
  const areas = path?.blockedAreas;
  if (!areas || areas.length === 0) return false;
  for (const area of areas) {
    if (circlesOverlap(p, radius, area, DEFAULT_TOWER_RADIUS)) return true;
  }
  return false;
};

/**
 * 挑出可建造的候選點（最多 count 個），以整格步長均勻取樣。
 * 壓測塔、Dev 面板批量生成都吃這一份，避免兩邊各寫一套淨空判定。
 */
export const sampleBuildablePoints = (
  path: PathConfig | null | undefined,
  count: number,
): MapPoint[] => {
  if (count <= 0) return [];
  const points: MapPoint[] = [];
  const bounds = boundsOf(path);
  const clearance = pathWidthOf(path) / 2 + DEFAULT_TOWER_RADIUS;

  for (let y = 0.5; y < bounds.height; y += 1) {
    for (let x = 0.5; x < bounds.width; x += 1) {
      const point = { x, y };
      if (pathClearance(path, point) < clearance) continue;
      if (isBlockedAt(path, point, DEFAULT_TOWER_RADIUS)) continue;
      points.push(point);
      if (points.length >= count) return points;
    }
  }

  return points;
};

/** 折線總長（格單位）；敵人進度與工坊長度顯示共用 */
export const polylineLength = (pts: readonly GridPosition[]): number => {
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    total += Math.hypot(pts[i + 1].col - pts[i].col, pts[i + 1].row - pts[i].row);
  }
  return total;
};
