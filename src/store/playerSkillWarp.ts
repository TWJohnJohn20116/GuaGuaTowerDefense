/**
 * 傳送陷阱（Warp Trap）路徑回溯演算
 *
 * 將敵人沿其行進路徑往回傳送指定格數，支援兩種地圖：
 *  - 普通地圖：waypoints 線性路徑，跨多個路徑段回溯，鉗制於起點
 *  - 進階地圖：segments 叉路路徑，於路段內回溯；跨路段時僅在
 *    「唯一父路段」可確定時繼續往回走（多父叉路無法判定來向，鉗制於路段起點）
 *
 * 另提供「逼近基地程度」排序鍵：普通地圖用全域路徑進度，
 * 進階地圖以 BFS 深度近似（深度越大越接近終點）。
 */

import type { Enemy, PathConfig, PathSegment, GridPosition } from '@/types/game';
import { getSegmentMap, getWaypointSegLengths } from './gameLoop/pathHelpers';

// 回溯後的敵人路徑狀態（直接覆寫至 Enemy）
export interface WarpResult {
  x: number;
  y: number;
  pathIndex: number;
  progress: number;
  currentSegmentId?: string;
  segmentWaypointIndex?: number;
}

// ===== 普通地圖：waypoints 回溯 =====
export function warpBackOnWaypoints(
  enemy: Enemy,
  path: PathConfig,
  distance: number,
): WarpResult | null {
  const wps = path.waypoints;
  if (!wps || wps.length < 2) return null;
  const segLens = getWaypointSegLengths(path);

  let idx = Math.min(enemy.pathIndex, wps.length - 2);
  let prog = idx === enemy.pathIndex ? enemy.progress : 1;
  let remaining = distance;

  while (remaining > 0) {
    const fromStart = prog * segLens[idx];
    if (remaining <= fromStart) {
      prog = (fromStart - remaining) / segLens[idx];
      remaining = 0;
    } else {
      remaining -= fromStart;
      if (idx === 0) {
        prog = 0;
        break;
      }
      idx--;
      prog = 1;
    }
  }

  const a = wps[idx];
  const b = wps[idx + 1];
  return {
    x: a.col + (b.col - a.col) * prog,
    y: a.row + (b.row - a.row) * prog,
    pathIndex: idx,
    progress: prog,
  };
}

// ===== 進階地圖：segments 回溯 =====

// 父路段索引：childId -> parentIds（一個路段可能有多個來向）
function buildParentMap(path: PathConfig): Map<string, string[]> {
  const parents = new Map<string, string[]>();
  for (const seg of path.segments || []) {
    for (const nextId of seg.next) {
      const list = parents.get(nextId);
      if (list) list.push(seg.id);
      else parents.set(nextId, [seg.id]);
    }
  }
  return parents;
}

const segWpLen = (wps: GridPosition[], i: number): number => {
  const dx = wps[i + 1].col - wps[i].col;
  const dy = wps[i + 1].row - wps[i].row;
  return Math.max(0.01, Math.sqrt(dx * dx + dy * dy));
};

export function warpBackOnSegments(
  enemy: Enemy,
  path: PathConfig,
  distance: number,
): WarpResult | null {
  if (!enemy.currentSegmentId) return null;
  const segMap = getSegmentMap(path);
  const parentMap = buildParentMap(path);

  let seg: PathSegment | undefined = segMap.get(enemy.currentSegmentId);
  if (!seg || seg.waypoints.length < 2) return null;

  let wpIdx = Math.min(enemy.segmentWaypointIndex ?? 0, seg.waypoints.length - 2);
  let prog = wpIdx === (enemy.segmentWaypointIndex ?? 0) ? enemy.progress : 1;
  let remaining = distance;

  while (remaining > 0) {
    const len = segWpLen(seg.waypoints, wpIdx);
    const fromStart = prog * len;
    if (remaining <= fromStart) {
      prog = (fromStart - remaining) / len;
      remaining = 0;
      break;
    }
    remaining -= fromStart;

    if (wpIdx > 0) {
      wpIdx--;
      prog = 1;
      continue;
    }

    // 已到路段起點：僅在父路段唯一時跨路段回溯（多父叉路無法判定來向）
    const parents = parentMap.get(seg.id);
    if (!parents || parents.length !== 1) {
      prog = 0;
      break;
    }
    const parentSeg = segMap.get(parents[0]);
    if (!parentSeg || parentSeg.waypoints.length < 2) {
      prog = 0;
      break;
    }
    seg = parentSeg;
    wpIdx = seg.waypoints.length - 2;
    prog = 1;
  }

  const a = seg.waypoints[wpIdx];
  const b = seg.waypoints[wpIdx + 1];
  return {
    x: a.col + (b.col - a.col) * prog,
    y: a.row + (b.row - a.row) * prog,
    pathIndex: wpIdx,
    progress: prog,
    currentSegmentId: seg.id,
    segmentWaypointIndex: wpIdx,
  };
}

// ===== 逼近基地程度排序鍵（值越大越接近終點） =====

// 進階地圖路段 BFS 深度快取（路徑為靜態資料）
const segDepthCache = new WeakMap<PathConfig, Map<string, number>>();

function getSegmentDepths(path: PathConfig): Map<string, number> {
  let depths = segDepthCache.get(path);
  if (!depths) {
    depths = new Map();
    const startId = path.startSegmentId || path.segments?.[0]?.id;
    if (startId) {
      const queue: Array<{ id: string; depth: number }> = [{ id: startId, depth: 0 }];
      const segMap = getSegmentMap(path);
      while (queue.length > 0) {
        const { id, depth } = queue.shift()!;
        if (depths.has(id)) continue;
        depths.set(id, depth);
        const seg = segMap.get(id);
        if (seg) {
          for (const nextId of seg.next) queue.push({ id: nextId, depth: depth + 1 });
        }
      }
    }
    segDepthCache.set(path, depths);
  }
  return depths;
}

export function getApproachKey(enemy: Enemy, path: PathConfig): number {
  const isAdvanced = path.category === 'advanced' && path.segments && path.segments.length > 0;
  if (isAdvanced && enemy.currentSegmentId) {
    const depth = getSegmentDepths(path).get(enemy.currentSegmentId) ?? 0;
    return depth * 1000 + (enemy.segmentWaypointIndex ?? 0) + enemy.progress;
  }
  return enemy.pathIndex + enemy.progress;
}

// 是否為進階叉路地圖
export function isAdvancedPath(path: PathConfig): boolean {
  return path.category === 'advanced' && !!path.segments && path.segments.length > 0;
}
