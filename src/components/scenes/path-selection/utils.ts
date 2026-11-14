import type { PathSegment } from '@/types/game';

// 計算路徑統計（支援進階地圖的叉路計算）
export const calculatePathStats = (
  waypoints: { col: number; row: number }[],
  segments?: PathSegment[],
) => {
  let totalLength = 0;
  let turns = 0;
  
  // 進階地圖：從路段計算長度和叉路數
  if (segments && segments.length > 0) {
    // 計算最長路徑長度（BFS/DFS 找最長路徑）
    const segMap = new Map(segments.map(s => [s.id, s]));
    
    const calcSegLength = (seg: PathSegment) => {
      let len = 0;
      for (let i = 0; i < seg.waypoints.length - 1; i++) {
        const dx = Math.abs(seg.waypoints[i + 1].col - seg.waypoints[i].col);
        const dy = Math.abs(seg.waypoints[i + 1].row - seg.waypoints[i].row);
        len += Math.max(dx, dy);
      }
      return len;
    };
    
    // 找最長路徑長度
    const findMaxLength = (segId: string, visited: Set<string>): number => {
      const seg = segMap.get(segId);
      if (!seg || visited.has(segId)) return 0;
      visited.add(segId);
      const segLen = calcSegLength(seg);
      if (seg.next.length === 0) return segLen;
      let maxNext = 0;
      for (const nextId of seg.next) {
        maxNext = Math.max(maxNext, findMaxLength(nextId, new Set(visited)));
      }
      return segLen + maxNext;
    };
    
    const startSeg = segments[0];
    totalLength = findMaxLength(startSeg.id, new Set());
    
    // 計算叉路數（有多個 next 的路段數量）
    for (const seg of segments) {
      if (seg.next.length > 1) {
        turns++;
      }
    }
  } else {
    // 普通地圖：從 waypoints 計算
    for (let i = 0; i < waypoints.length - 1; i++) {
      const dx = Math.abs(waypoints[i + 1].col - waypoints[i].col);
      const dy = Math.abs(waypoints[i + 1].row - waypoints[i].row);
      totalLength += Math.max(dx, dy);
      
      if (i > 0) {
        const prevDir = {
          x: Math.sign(waypoints[i].col - waypoints[i - 1].col),
          y: Math.sign(waypoints[i].row - waypoints[i - 1].row),
        };
        const currDir = {
          x: Math.sign(waypoints[i + 1].col - waypoints[i].col),
          y: Math.sign(waypoints[i + 1].row - waypoints[i].row),
        };
        if (prevDir.x !== currDir.x || prevDir.y !== currDir.y) {
          turns++;
        }
      }
    }
  }
  
  return { length: totalLength, turns };
};
