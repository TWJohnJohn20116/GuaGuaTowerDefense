// 風塔擊退輔助函數 - 計算擊退位置和回歸目標
import type { Enemy, PathConfig } from '@/types/game';
import { GAME_CONSTANTS } from '@/data/gameData';
import { getSegmentMap } from './gameLoop/pathHelpers';

/** 風塔擊退計算結果 */
interface WindKnockbackResult {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  returnIdx: number;
  returnSegId?: string;
  returnWpIdx?: number;
}

/**
 * 計算風塔擊退位置和回歸目標
 * 進階地圖使用敵人所在路段的 waypoints（而非僅有起終點的 path.waypoints）
 */
export function computeWindKnockback(
  target: Enemy,
  path: PathConfig,
  knockDist: number
): WindKnockbackResult {
  const isAdvancedMap = path.category === 'advanced' && path.segments && path.segments.length > 0;
  const segMap = isAdvancedMap ? getSegmentMap(path) : null;

  // 取得路徑方向用的 waypoints（進階地圖使用路段 waypoints）
  let dirWaypoints: { col: number; row: number }[];
  let dirWpIdx: number;
  if (isAdvancedMap && target.currentSegmentId) {
    const seg = segMap!.get(target.currentSegmentId);
    if (seg) {
      dirWaypoints = seg.waypoints;
      dirWpIdx = Math.min(target.segmentWaypointIndex ?? 0, Math.max(0, dirWaypoints.length - 2));
    } else {
      dirWaypoints = path.waypoints;
      dirWpIdx = 0;
    }
  } else {
    dirWaypoints = path.waypoints;
    dirWpIdx = Math.min(target.pathIndex, Math.max(0, path.waypoints.length - 2));
  }

  // 計算路徑方向（從目前路徑點到下一個路徑點）
  const currWp = dirWaypoints[dirWpIdx];
  const nextWp = dirWaypoints[dirWpIdx + 1] || currWp;
  const pathDx = nextWp.col - currWp.col;
  const pathDy = nextWp.row - currWp.row;

  // 垂直路徑方向（兩個方向擇其一）
  let perpX = -pathDy;
  let perpY = pathDx;
  const perpLen = Math.sqrt(perpX * perpX + perpY * perpY) || 1;
  perpX /= perpLen;
  perpY /= perpLen;
  // 隨機選擇吹向左或右
  if (Math.random() > 0.5) { perpX = -perpX; perpY = -perpY; }

  // 計算擊退後的位置（限制在地圖範圍內）
  const { GRID_COLS, GRID_ROWS } = GAME_CONSTANTS;
  const newX = Math.max(0.5, Math.min(GRID_COLS - 0.5, target.x + perpX * knockDist));
  const newY = Math.max(0.5, Math.min(GRID_ROWS - 0.5, target.y + perpY * knockDist));

  // 找到最近的路徑點作為回歸目標
  if (isAdvancedMap && target.currentSegmentId) {
    const seg = segMap!.get(target.currentSegmentId);
    if (seg) {
      let closestSegWpIdx = 0;
      let closestDist = Infinity;
      for (let i = 0; i < seg.waypoints.length; i++) {
        const d = Math.sqrt(Math.pow(seg.waypoints[i].col - newX, 2) + Math.pow(seg.waypoints[i].row - newY, 2));
        if (d < closestDist) { closestDist = d; closestSegWpIdx = i; }
      }
      
      // 允許往回走一格，或往前走
      const validClosestIdx = Math.max(0, Math.min(seg.waypoints.length - 1, closestSegWpIdx));
      
      return {
        x: newX, y: newY,
        targetX: seg.waypoints[validClosestIdx].col,
        targetY: seg.waypoints[validClosestIdx].row,
        returnIdx: validClosestIdx,
        returnSegId: target.currentSegmentId,
        returnWpIdx: validClosestIdx,
      };
    }
  }

  // 普通地圖或進階地圖後備邏輯
  const waypoints = path.waypoints;
  let closestIdx = 0;
  let closestDist = Infinity;
  for (let i = 0; i < waypoints.length; i++) {
    const d = Math.sqrt(Math.pow(waypoints[i].col - newX, 2) + Math.pow(waypoints[i].row - newY, 2));
    if (d < closestDist) { closestDist = d; closestIdx = i; }
  }
  
  return {
    x: newX, y: newY,
    targetX: waypoints[closestIdx].col,
    targetY: waypoints[closestIdx].row,
    returnIdx: closestIdx,
  };
}
