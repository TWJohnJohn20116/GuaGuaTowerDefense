/**
 * 自由地圖渲染：整片連續場地 + 沿折線描出的路徑帶
 *
 * 舊版 `drawGrid` 把場地切成 15×11 個圓角方塊，方塊之間的 2.5px 縫隙就是玩家看到的「格線」，
 * 而「這一格能不能放塔」也綁在那個陣列上。自由制之後兩者都拆掉：
 * 場地是連續的一片，路徑是沿 waypoints 描出來的帶狀區域，能不能放塔由 mapGeometry 的圓形淨空決定。
 *
 * 座標單位仍是「格」，呼叫端負責乘上 tileSize；這裡不做任何 floor / 取整。
 */
import type { GridPosition, MapPoint, PathConfig } from '@/types/game';
import { getBoardColors } from '@/utils/themeBoard';
import { boundsOf, pathPolylines, pathWidthOf } from '@/data/mapGeometry';

export interface FieldRenderOptions {
  /** 是否畫路徑帶（預設 true） */
  showPath?: boolean;
  /** 是否畫地形點綴（預設 true）；舊版是每格 1/6 密度的紙紋，現在改成確定性散點 */
  showTerrain?: boolean;
  /** 是否標出起點與終點（預設 true） */
  showEndpoints?: boolean;
  /** 是否畫禁建區（預設 true） */
  showBlocked?: boolean;
}

/** 地形散點的雜湊種子：固定值，保證每次重繪位置一致（不能讓畫面閃動） */
const TERRAIN_SEED = 0x9e3779b9;

const drawTerrain = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  tileSize: number,
  offsetX: number,
  offsetY: number,
): void => {
  const ink = getBoardColors().edge;
  // 密度跟場地面積走：大圖多一點、小圖少一點，但封頂避免整片糊掉
  const count = Math.min(320, Math.round(width * height * 1.6));
  let seed = TERRAIN_SEED;
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = ink;
  for (let i = 0; i < count; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const px = offsetX + ((seed >>> 8) % 1024) / 1024 * width * tileSize;
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const py = offsetY + ((seed >>> 8) % 1024) / 1024 * height * tileSize;
    ctx.beginPath();
    ctx.arc(px, py, Math.max(1, tileSize * 0.028), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
};

/**
 * 真正的入口與出口。
 *
 * 入口：`startSegmentId` 指定那一段的第一點（缺省取第一段／第一條折線）。
 * 出口：所有「沒有下一段」的路段終點；沒有 segments 的普通地圖就是折線末端。
 */
const resolvePathEnds = (path: PathConfig): { kind: 'start' | 'end'; point: GridPosition }[] => {
  const result: { kind: 'start' | 'end'; point: GridPosition }[] = [];
  const segments = path.segments;

  if (segments && segments.length > 0) {
    const startSeg = segments.find((s) => s.id === path.startSegmentId) ?? segments[0];
    if (startSeg?.waypoints.length) result.push({ kind: 'start', point: startSeg.waypoints[0] });
    for (const seg of segments) {
      if (seg.next.length === 0 && seg.waypoints.length > 0) {
        result.push({ kind: 'end', point: seg.waypoints[seg.waypoints.length - 1] });
      }
    }
    return result;
  }

  const lines = pathPolylines(path);
  if (lines.length > 0) {
    result.push({ kind: 'start', point: lines[0][0] });
    const lastLine = lines[lines.length - 1];
    result.push({ kind: 'end', point: lastLine[lastLine.length - 1] });
  }
  return result;
};

const strokePolyline = (
  ctx: CanvasRenderingContext2D,
  pts: readonly GridPosition[],
  tileSize: number,
  offsetX: number,
  offsetY: number,
  lineWidth: number,
  color: string,
): void => {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(offsetX + pts[0].col * tileSize, offsetY + pts[0].row * tileSize);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(offsetX + pts[i].col * tileSize, offsetY + pts[i].row * tileSize);
  }
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();
};

/**
 * 繪製整張場地。
 *
 * 只做四件事：鋪底色 → 地形點綴 → 路徑帶 → 端點／禁建標記。
 * 不再逐格畫方塊，所以「格線」在這裡已經不存在了。
 */
export const drawField = (
  ctx: CanvasRenderingContext2D,
  path: PathConfig | null | undefined,
  tileSize: number,
  offsetX: number,
  offsetY: number,
  opts: FieldRenderOptions = {},
): void => {
  if (tileSize <= 0) return;
  const {
    showPath = true,
    showTerrain = true,
    showEndpoints = true,
    showBlocked = true,
  } = opts;

  const board = getBoardColors();
  const bounds = boundsOf(path);
  const widthPx = bounds.width * tileSize;
  const heightPx = bounds.height * tileSize;

  // 1) 整片場地底（連續、無格子）
  ctx.fillStyle = board.tile;
  ctx.fillRect(offsetX, offsetY, widthPx, heightPx);

  // 2) 地形點綴
  if (showTerrain) drawTerrain(ctx, bounds.width, bounds.height, tileSize, offsetX, offsetY);

  // 3) 路徑帶：外描邊 + 內填
  //
  // 一定要「先畫完所有外描邊，再畫所有內填」。
  // 逐條「外→內」的話，後畫那條的外描邊會壓在前一條的內填上：
  // 分岔點（多段交會處）就會露出一圈描邊色的弧線，看起來像接縫。
  if (showPath && path) {
    const lines = pathPolylines(path);
    const bandWidth = pathWidthOf(path) * tileSize;
    for (const line of lines) {
      strokePolyline(ctx, line, tileSize, offsetX, offsetY, bandWidth + 3, board.edge);
    }
    for (const line of lines) {
      strokePolyline(ctx, line, tileSize, offsetX, offsetY, bandWidth, board.path);
    }
  }

  // 4) 禁建區：半透明圓 + 虛線邊，讓玩家看得出「這裡不能蓋」
  if (showBlocked && path?.blockedAreas) {
    for (const area of path.blockedAreas) {
      const cx = offsetX + area.x * tileSize;
      const cy = offsetY + area.y * tileSize;
      const r = tileSize * 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = board.edge;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = board.edge;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // 5) 起點／終點：只標真正的入口與出口
  //    逐條折線各畫一顆的話，分岔點會被當成多條線的起點而疊出綠圓。
  if (showEndpoints && path) {
    for (const end of resolvePathEnds(path)) {
      ctx.beginPath();
      ctx.arc(
        offsetX + end.point.col * tileSize,
        offsetY + end.point.row * tileSize,
        tileSize * 0.32,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = end.kind === 'start' ? board.start : board.end;
      ctx.fill();
    }
  }
};

/**
 * 滑鼠位置的圓形提示（取代舊的「整格高亮」）。
 * 自由制沒有格子可以框，提示必須跟著游標的連續座標走，半徑＝塔的佔位半徑。
 */
export const drawHoverRing = (
  ctx: CanvasRenderingContext2D,
  point: MapPoint | null,
  radius: number,
  tileSize: number,
  offsetX: number,
  offsetY: number,
  color: string,
  filled = true,
): void => {
  if (!point) return;
  const cx = offsetX + point.x * tileSize;
  const cy = offsetY + point.y * tileSize;
  const r = Math.max(2, radius * tileSize);

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  if (filled) {
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = color;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
};
