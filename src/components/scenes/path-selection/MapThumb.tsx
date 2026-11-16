/**
 * 選圖 · 卡面路線縮圖（SVG）
 *
 * 卡片牆一次顯示幾十張圖，用 canvas 畫就是幾十個 2D context；
 * 卡面只需要「這張圖長什麼形狀」，所以用 SVG 折線：可重用、可縮放、換色只改 class。
 * 真正的地圖渲染（場地色、路徑寬度）留給簡報層的 PathPreview，那份和遊戲內同一套 drawField。
 *
 * viewBox 直接用格座標（不是固定的 0 0 100 100）：
 * 卡面是 16:9，多數地圖也接近 16:9，用格座標才鋪得滿；
 * 固定 100×100 會讓寬圖被 min(寬,高) 壓成中間一小塊。
 */

import type { PathConfig } from '@/types/game';

interface Point {
  col: number;
  row: number;
}

/** 蒐集所有要畫的折線（進階地圖＝每段一條，普通地圖＝整條主線） */
function collectLines(path: PathConfig): Point[][] {
  if (path.segments && path.segments.length > 0) {
    return path.segments.map((segment) => segment.waypoints).filter((line) => line.length >= 2);
  }
  return path.waypoints.length >= 2 ? [path.waypoints] : [];
}

/** 起點＝主線第一點；終點＝沒有後繼路段的那一段最後一點 */
function collectEnds(path: PathConfig): { start: Point; end: Point } | null {
  const lines = collectLines(path);
  if (lines.length === 0) return null;
  const start = lines[0][0];
  if (path.segments && path.segments.length > 0) {
    const terminals = path.segments.filter((segment) => segment.next.length === 0);
    const tail = terminals.length > 0 ? terminals[terminals.length - 1] : path.segments[path.segments.length - 1];
    const tailLine = tail.waypoints;
    return { start, end: tailLine[tailLine.length - 1] };
  }
  const main = path.waypoints;
  return { start, end: main[main.length - 1] };
}

/** 所有折線的外接範圍（格座標） */
function boundsOfLines(lines: Point[][]): { minCol: number; minRow: number; width: number; height: number } {
  let minCol = Infinity;
  let maxCol = -Infinity;
  let minRow = Infinity;
  let maxRow = -Infinity;
  lines.forEach((line) =>
    line.forEach((point) => {
      minCol = Math.min(minCol, point.col);
      maxCol = Math.max(maxCol, point.col);
      minRow = Math.min(minRow, point.row);
      maxRow = Math.max(maxRow, point.row);
    }),
  );
  return {
    minCol,
    minRow,
    width: Math.max(1, maxCol - minCol),
    height: Math.max(1, maxRow - minRow),
  };
}

export function MapThumb({
  path,
  tone = 'ink',
  className = '',
}: {
  path: PathConfig;
  /** ink＝未選中的灰階路線；signal＝卡面被選中時的強調色 */
  tone?: 'ink' | 'signal';
  className?: string;
}) {
  const lines = collectLines(path);
  if (lines.length === 0) return <div className={`h-full w-full ${className}`} aria-hidden="true" />;

  const box = boundsOfLines(lines);
  const pad = 1;
  const ends = collectEnds(path);
  const stroke = tone === 'signal' ? 'var(--cn-coral)' : 'var(--cn-ink-3)';

  return (
    <svg
      viewBox={`${box.minCol - pad} ${box.minRow - pad} ${box.width + pad * 2} ${box.height + pad * 2}`}
      preserveAspectRatio="xMidYMid meet"
      className={`h-full w-full ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      {lines.map((line, index) => (
        <polyline
          key={index}
          points={line.map((point) => `${point.col},${point.row}`).join(' ')}
          fill="none"
          stroke={stroke}
          strokeWidth={0.3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {ends && (
        <>
          <circle cx={ends.start.col} cy={ends.start.row} r={0.45} fill="var(--cn-mint)" stroke="var(--cn-line)" strokeWidth={0.14} />
          <circle cx={ends.end.col} cy={ends.end.row} r={0.45} fill="var(--cn-alert)" stroke="var(--cn-line)" strokeWidth={0.14} />
        </>
      )}
    </svg>
  );
}

export default MapThumb;
