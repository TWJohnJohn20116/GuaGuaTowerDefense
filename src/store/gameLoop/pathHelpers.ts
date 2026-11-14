// 性能優化：path.segments.find(s => s.id === segId) 在敵人主循環中
// 每幀執行極多次。本檔提供基於 WeakMap 的 Map<id, segment> 快取。
import type { PathConfig, PathSegment } from '@/types/game';

const segmentMapCache = new WeakMap<PathConfig, Map<string, PathSegment>>();

export const getSegmentMap = (path: PathConfig): Map<string, PathSegment> => {
  let map = segmentMapCache.get(path);
  if (!map) {
    map = new Map();
    if (path.segments) {
      for (const seg of path.segments) {
        map.set(seg.id, seg);
      }
    }
    segmentMapCache.set(path, map);
  }
  return map;
};

// 普通地圖 waypoints 相鄰段長快取（路徑為靜態資料，段長固定不變）
const waypointSegLenCache = new WeakMap<PathConfig, number[]>();

export const getWaypointSegLengths = (path: PathConfig): number[] => {
  let lens = waypointSegLenCache.get(path);
  if (!lens) {
    const wps = path.waypoints;
    lens = [];
    for (let i = 0; i < wps.length - 1; i++) {
      const dx = wps[i + 1].col - wps[i].col;
      const dy = wps[i + 1].row - wps[i].row;
      lens.push(Math.sqrt(dx * dx + dy * dy));
    }
    waypointSegLenCache.set(path, lens);
  }
  return lens;
};
