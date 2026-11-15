/**
 * 規則圖的拖曳吸附（純函式）
 *
 * 三層優先序：
 *   1. 對齊其他節點的邊／中心（門檻 6）
 *   2. 等距：左右（或上下）鄰居的間距差在容差內 → 夾成完全相等
 *   3. 都沒有 → 吸 10 單位格線
 *
 * 這裡不碰 React、不碰 store；畫布只負責把場景幾何餵進來、把 guides 畫出來。
 */
export interface SnapBox {
  nodeId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpacingGuide {
  /** 'x' = 水平間距（畫在 y=at） */
  axis: 'x' | 'y';
  at: number;
  segments: [number, number][];
}

export interface SnapGuides {
  x: number[];
  y: number[];
  spacing: SpacingGuide[];
}

export interface SnapResult {
  dx: number;
  dy: number;
  guides: SnapGuides | null;
}

export interface SnapInput {
  primaryId: string;
  /** 這次一起拖曳的節點（含主節點），不參與對齊比較 */
  movingIds: ReadonlySet<string>;
  rawDx: number;
  rawDy: number;
  boxes: readonly SnapBox[];
}

/** 邊／中心對齊門檻（圖座標單位） */
export const SNAP_THRESHOLD = 6;
/** 格線吸附間距 */
export const GRID_STEP = 10;
/** 等距容差：兩邊間距差在這以內就夾成相等 */
export const EQUAL_GAP_TOLERANCE = 14;

export function computeSnap(input: SnapInput): SnapResult {
  const { primaryId, movingIds, rawDx, rawDy, boxes } = input;
  const primary = boxes.find((box) => box.nodeId === primaryId);
  if (!primary) return { dx: rawDx, dy: rawDy, guides: null };

  const x0 = primary.x + rawDx;
  const y0 = primary.y + rawDy;
  const xs = [x0, x0 + primary.width / 2, x0 + primary.width];
  const ys = [y0, y0 + primary.height / 2, y0 + primary.height];

  let bestX: { diff: number; at: number } | null = null;
  let bestY: { diff: number; at: number } | null = null;

  for (const box of boxes) {
    if (movingIds.has(box.nodeId)) continue;
    const targetsX = [box.x, box.x + box.width / 2, box.x + box.width];
    const targetsY = [box.y, box.y + box.height / 2, box.y + box.height];
    for (const current of xs) {
      for (const target of targetsX) {
        const diff = target - current;
        if (Math.abs(diff) <= SNAP_THRESHOLD && (bestX === null || Math.abs(diff) < Math.abs(bestX.diff))) {
          bestX = { diff, at: target };
        }
      }
    }
    for (const current of ys) {
      for (const target of targetsY) {
        const diff = target - current;
        if (Math.abs(diff) <= SNAP_THRESHOLD && (bestY === null || Math.abs(diff) < Math.abs(bestY.diff))) {
          bestY = { diff, at: target };
        }
      }
    }
  }

  const others = boxes.filter((box) => !movingIds.has(box.nodeId));
  const draggedRight = x0 + primary.width;
  const draggedBottom = y0 + primary.height;

  let equalX: { diff: number; spacing: SpacingGuide } | null = null;
  for (const left of others) {
    const leftEdge = left.x + left.width;
    if (leftEdge > x0) continue;
    for (const right of others) {
      if (right.nodeId === left.nodeId || right.x < draggedRight) continue;
      const gapLeft = x0 - leftEdge;
      const gapRight = right.x - draggedRight;
      if (Math.abs(gapRight - gapLeft) > EQUAL_GAP_TOLERANCE) continue;
      const diff = (gapRight - gapLeft) / 2;
      if (equalX !== null && Math.abs(diff) >= Math.abs(equalX.diff)) continue;
      equalX = {
        diff,
        spacing: {
          axis: 'x',
          at: y0 + primary.height / 2,
          segments: [[leftEdge, x0 + diff], [draggedRight + diff, right.x]],
        },
      };
    }
  }

  let equalY: { diff: number; spacing: SpacingGuide } | null = null;
  for (const top of others) {
    const topEdge = top.y + top.height;
    if (topEdge > y0) continue;
    for (const bottom of others) {
      if (bottom.nodeId === top.nodeId || bottom.y < draggedBottom) continue;
      const gapTop = y0 - topEdge;
      const gapBottom = bottom.y - draggedBottom;
      if (Math.abs(gapBottom - gapTop) > EQUAL_GAP_TOLERANCE) continue;
      const diff = (gapBottom - gapTop) / 2;
      if (equalY !== null && Math.abs(diff) >= Math.abs(equalY.diff)) continue;
      equalY = {
        diff,
        spacing: {
          axis: 'y',
          at: x0 + primary.width / 2,
          segments: [[topEdge, y0 + diff], [draggedBottom + diff, bottom.y]],
        },
      };
    }
  }

  const dx = bestX !== null
    ? rawDx + bestX.diff
    : equalX !== null
      ? rawDx + equalX.diff
      : Math.round((primary.x + rawDx) / GRID_STEP) * GRID_STEP - primary.x;
  const dy = bestY !== null
    ? rawDy + bestY.diff
    : equalY !== null
      ? rawDy + equalY.diff
      : Math.round((primary.y + rawDy) / GRID_STEP) * GRID_STEP - primary.y;

  const spacing: SpacingGuide[] = [];
  if (bestX === null && equalX !== null) spacing.push(equalX.spacing);
  if (bestY === null && equalY !== null) spacing.push(equalY.spacing);
  const hasAlignment = bestX !== null || bestY !== null;

  return {
    dx,
    dy,
    guides: hasAlignment || spacing.length > 0
      ? { x: bestX !== null ? [bestX.at] : [], y: bestY !== null ? [bestY.at] : [], spacing }
      : null,
  };
}
