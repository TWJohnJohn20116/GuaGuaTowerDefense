/**
 * 工坊地圖編輯覆蓋層（雙層 canvas，純呈現）
 *
 * 這一支不 import store、不持有世界狀態：所有編輯意圖都經由 props 回呼交回上層，
 * 由 editModel 的純函式與 store 決定「到底改不改」。元件只負責畫與命中判定。
 *
 * 為什麼要兩層：
 *   base 層 = 真實遊戲的 drawGrid（地板＋路徑連通）＋預覽塔射程圈。
 *             這是最貴的一層（逐格 roundRect × 165 格），而且只有 draft 變動才需要重畫。
 *   chrome 層 = 編輯器自己的裝飾：格線、座標、骨幹、方向箭頭、拖曳把手、衝突斜線、
 *               hover 高亮、播放中的敵人圓點。拖曳 / hover / 脈動都只重畫這一層。
 * 若合成一層，每一次滑鼠移動都要重跑 drawGrid，165 格圓角矩形會讓拖曳明顯拖影。
 *
 * 座標語彙：與 editModel 一致，(col,row) 是格索引，格心 = (col+0.5, row+0.5)。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react';
import { GAME_CONSTANTS } from '@/data/gameData';
import { drawGrid } from '@/components/game/PathRenderer';
import { getBoardColors } from '@/utils/themeBoard';
import { createFrameLoopGuard } from '@/utils/frameLoopGuard';
import type { Tile } from '@/types/game';
import {
  blockedPathConflicts,
  isBlocked,
  isInside,
  pathCellKeys,
  pointKey,
  previewTowerAt,
  samePoint,
  toTileGrid,
  type GridPoint,
  type MapDraft,
} from '@/workshop/map/editModel';

/** 預覽塔射程：工坊不開局，用固定 2.5 格的「概念半徑」畫圈，不代表真實塔數值 */
const TOWER_RANGE_CELLS = 2.5;

/** 沿用遊戲本體的留白：(容器寬 - 40) / GRID_COLS 與 (容器高 - 40) / GRID_ROWS 取小值 */
const BOARD_PADDING = 40;

/** 座標文字的最小格子尺寸：小於這個值字會糊成一團，乾脆不畫 */
const COORD_MIN_TILE_SIZE = 28;

/** 脈動角速度（毫秒 / 弧度），讓播放中的敵人圓點呼吸而不是閃爍 */
const PULSE_PERIOD_MS = 220;

interface MapGeometry {
  width: number;
  height: number;
  tileSize: number;
  offsetX: number;
  offsetY: number;
  cols: number;
  rows: number;
}

/** 從 CSS token 讀出的繪製色；缺 token 時退回目前主題的場地色 */
interface MapPalette {
  line: string;
  lineSoft: string;
  ink: string;
  ink3: string;
  card: string;
  sun: string;
  coral: string;
  alert: string;
  mint: string;
  grape: string;
  sky: string;
}

interface DragPreview {
  index: number;
  point: GridPoint;
}

interface DragState {
  index: number;
  pointerId: number;
  point: GridPoint;
}

interface BrushState {
  pointerId: number;
  /** 這一輪是「塗上障礙」還是「擦掉障礙」；由 pointerdown 那一格決定後整輪不變 */
  erase: boolean;
  /** 本輪已處理過的格；同一格不重複觸發，避免整條 stroke 洗出幾百次回呼 */
  done: Set<string>;
}

interface ChromeFrame {
  hover: GridPoint | null;
  dragPreview: DragPreview | null;
  selectedWaypoint: number | null;
  selectedTowerId: string | null;
  showGrid: boolean;
  showCoords: boolean;
  showArrows: boolean;
  runner: { x: number; y: number } | null;
  now: number;
}

// ===== token 讀取 =====

const readPalette = (el: HTMLElement | null): MapPalette => {
  const board = getBoardColors();
  const host: HTMLElement | null = el ?? (typeof document === 'undefined' ? null : document.documentElement);
  const style: CSSStyleDeclaration | null = host ? getComputedStyle(host) : null;

  const pick = (name: string, fallback: string): string => {
    if (!style) return fallback;
    const value = style.getPropertyValue(name).trim();
    return value.length > 0 ? value : fallback;
  };

  return {
    line: pick('--cn-line', board.edge),
    lineSoft: pick('--cn-line-soft', board.edge),
    ink: pick('--cn-ink', board.edge),
    ink3: pick('--cn-ink-3', board.path),
    card: pick('--cn-card', board.tile),
    sun: pick('--cn-sun', board.start),
    coral: pick('--cn-coral', board.end),
    alert: pick('--cn-alert', board.end),
    mint: pick('--cn-mint', board.start),
    grape: pick('--cn-grape', board.path),
    sky: pick('--cn-sky', board.path),
  };
};

// ===== 幾何 =====

const computeGeometry = (width: number, height: number, cols: number, rows: number): MapGeometry => {
  if (width <= 0 || height <= 0 || cols <= 0 || rows <= 0) {
    return { width, height, tileSize: 0, offsetX: 0, offsetY: 0, cols, rows };
  }
  const tileSize = Math.max(0, Math.min((width - BOARD_PADDING) / cols, (height - BOARD_PADDING) / rows));
  return {
    width,
    height,
    tileSize,
    offsetX: (width - tileSize * cols) / 2,
    offsetY: (height - tileSize * rows) / 2,
    cols,
    rows,
  };
};

const cellCenterX = (geom: MapGeometry, col: number): number => geom.offsetX + (col + 0.5) * geom.tileSize;
const cellCenterY = (geom: MapGeometry, row: number): number => geom.offsetY + (row + 0.5) * geom.tileSize;

/**
 * 把 canvas 的 backing store 對齊裝置像素，回傳已套用 dpr 變換的 ctx。
 * 尺寸沒變就不重設（設定 canvas.width 會清空並重置所有狀態，逐幀重設很貴）。
 */
const prepareCanvas = (canvas: HTMLCanvasElement, geom: MapGeometry): CanvasRenderingContext2D | null => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const dpr = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;
  const deviceWidth = Math.max(1, Math.round(geom.width * dpr));
  const deviceHeight = Math.max(1, Math.round(geom.height * dpr));
  if (canvas.width !== deviceWidth || canvas.height !== deviceHeight) {
    canvas.width = deviceWidth;
    canvas.height = deviceHeight;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, geom.width, geom.height);
  return ctx;
};

const localPoint = (canvas: HTMLCanvasElement, clientX: number, clientY: number): { x: number; y: number } => {
  const rect = canvas.getBoundingClientRect();
  return { x: clientX - rect.left, y: clientY - rect.top };
};

const pointAt = (geom: MapGeometry, x: number, y: number): GridPoint | null => {
  if (geom.tileSize <= 0) return null;
  const point: GridPoint = {
    col: Math.floor((x - geom.offsetX) / geom.tileSize),
    row: Math.floor((y - geom.offsetY) / geom.tileSize),
  };
  return isInside(point, geom.cols, geom.rows) ? point : null;
};

/** 命中最近的路徑點把手；命中半徑比視覺半徑大，手指與滑鼠都好按 */
const hitWaypoint = (geom: MapGeometry, waypoints: GridPoint[], x: number, y: number): number => {
  const hitRadius = Math.max(7, geom.tileSize * 0.34);
  let best = -1;
  let bestDistance = hitRadius * hitRadius;
  for (let i = 0; i < waypoints.length; i++) {
    const dx = x - cellCenterX(geom, waypoints[i].col);
    const dy = y - cellCenterY(geom, waypoints[i].row);
    const distance = dx * dx + dy * dy;
    if (distance <= bestDistance) {
      bestDistance = distance;
      best = i;
    }
  }
  return best;
};

// ===== 單格裝飾 =====

/** 障礙 × 路徑重疊：紅色斜線 + 虛線框，比純色塊更「編輯器」 */
const drawConflictCell = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
): void => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 3]);
  ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
  ctx.setLineDash([]);
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = Math.max(1.6, size * 0.09);
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const cx = x + size * (0.3 + i * 0.2);
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.12, y + size * 0.82);
    ctx.lineTo(cx + size * 0.12, y + size * 0.18);
    ctx.stroke();
  }
  ctx.restore();
};

/** 兩點之間的骨幹與箭頭（箭頭指向下一個路徑點） */
const drawBackboneArrow = (
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string,
  size: number,
): void => {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const length = Math.hypot(dx, dy);
  if (length < size * 2.4) return;

  const ux = dx / length;
  const uy = dy / length;
  const startX = fromX + ux * size * 1.25;
  const startY = fromY + uy * size * 1.25;
  const endX = toX - ux * size * 1.3;
  const endY = toY - uy * size * 1.3;
  const angle = Math.atan2(uy, ux);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.5, size * 0.4);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  const head = Math.max(4, size * 1.2);
  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(endX + Math.cos(angle + Math.PI * 0.78) * head, endY + Math.sin(angle + Math.PI * 0.78) * head);
  ctx.moveTo(endX, endY);
  ctx.lineTo(endX + Math.cos(angle - Math.PI * 0.78) * head, endY + Math.sin(angle - Math.PI * 0.78) * head);
  ctx.stroke();
  ctx.restore();
};

// ===== base 層 =====

const drawBaseLayer = (
  ctx: CanvasRenderingContext2D,
  geom: MapGeometry,
  draft: MapDraft,
  selectedTowerId: string | null,
  palette: MapPalette,
): void => {
  if (geom.tileSize <= 0) return;

  // 真實遊戲的繪製入口：地板、路徑連通、起終點標記、障礙塊都在這裡
  const grid: Tile[][] = toTileGrid(draft);
  drawGrid(ctx, grid, geom.tileSize, geom.offsetX, geom.offsetY, true);

  const range = TOWER_RANGE_CELLS * geom.tileSize;
  for (let i = 0; i < draft.towers.length; i++) {
    const tower = draft.towers[i];
    const cx = cellCenterX(geom, tower.col);
    const cy = cellCenterY(geom, tower.row);

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, range, 0, Math.PI * 2);
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = palette.grape;
    ctx.fill();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = palette.grape;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.restore();

    const bodyRadius = Math.max(3, geom.tileSize * 0.26);
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, bodyRadius, 0, Math.PI * 2);
    ctx.fillStyle = palette.grape;
    ctx.fill();
    ctx.strokeStyle = palette.card;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(1, bodyRadius * 0.36), 0, Math.PI * 2);
    ctx.fillStyle = palette.card;
    ctx.fill();

    if (selectedTowerId === tower.id) {
      ctx.beginPath();
      ctx.arc(cx, cy, bodyRadius * 1.65, 0, Math.PI * 2);
      ctx.strokeStyle = palette.coral;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
    ctx.restore();
  }
};

// ===== chrome 層 =====

const drawChromeLayer = (
  ctx: CanvasRenderingContext2D,
  geom: MapGeometry,
  draft: MapDraft,
  palette: MapPalette,
  frame: ChromeFrame,
): void => {
  const ts = geom.tileSize;
  if (ts <= 0) return;
  const ox = geom.offsetX;
  const oy = geom.offsetY;
  const pathKeys = pathCellKeys(draft);

  // 1) 編輯器格線
  if (frame.showGrid) {
    ctx.save();
    ctx.strokeStyle = palette.lineSoft;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let c = 0; c <= geom.cols; c++) {
      const x = Math.round(ox + c * ts) + 0.5;
      ctx.moveTo(x, oy);
      ctx.lineTo(x, oy + geom.rows * ts);
    }
    for (let r = 0; r <= geom.rows; r++) {
      const y = Math.round(oy + r * ts) + 0.5;
      ctx.moveTo(ox, y);
      ctx.lineTo(ox + geom.cols * ts, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  // 2) 每格座標（字太小就整個跳過，不做縮放硬擠）
  if (frame.showCoords && ts >= COORD_MIN_TILE_SIZE) {
    ctx.save();
    ctx.fillStyle = palette.ink3;
    ctx.font = Math.round(ts * 0.24) + 'px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    for (let r = 0; r < geom.rows; r++) {
      for (let c = 0; c < geom.cols; c++) {
        ctx.fillText(c + ',' + r, ox + c * ts + 3, oy + r * ts + 2);
      }
    }
    ctx.restore();
  }

  // 3) 障礙蓋在路徑上的衝突格
  const conflicts = blockedPathConflicts(draft);
  for (let i = 0; i < conflicts.length; i++) {
    drawConflictCell(
      ctx,
      ox + conflicts[i].col * ts,
      oy + conflicts[i].row * ts,
      ts,
      palette.alert,
    );
  }

  // 4) hover 高亮（不可建造的格用 alert 色，直接看得出「這裡不能擺」）
  if (frame.hover) {
    const hx = ox + frame.hover.col * ts;
    const hy = oy + frame.hover.row * ts;
    const unbuildable = pathKeys.has(pointKey(frame.hover)) || isBlocked(draft, frame.hover);
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = unbuildable ? palette.alert : palette.sky;
    ctx.fillRect(hx + 1, hy + 1, ts - 2, ts - 2);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = unbuildable ? palette.alert : palette.sky;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(hx + 2, hy + 2, ts - 4, ts - 4);
    ctx.setLineDash([]);
    ctx.restore();
  }

  // 拖曳中的把手用 preview 座標畫，不等 draft 回來
  const display: GridPoint[] = draft.waypoints.map((p, i) =>
    frame.dragPreview && frame.dragPreview.index === i ? frame.dragPreview.point : p,
  );
  const handleRadius = Math.max(3.5, ts * 0.15);

  // 4.5) 其他路段：淡淡畫出來，讓作者看得到整張叉路圖（編輯中的那段仍用正常顏色）
  const otherSegments = (draft.segments ?? []).filter(
    (segment) => segment.id !== draft.activeSegmentId && segment.waypoints.length > 1,
  );
  if (otherSegments.length > 0) {
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = palette.sky;
    ctx.fillStyle = palette.sky;
    ctx.lineWidth = Math.max(1.5, ts * 0.05);
    ctx.lineCap = 'round';
    for (const segment of otherSegments) {
      ctx.beginPath();
      for (let i = 0; i < segment.waypoints.length; i += 1) {
        const x = cellCenterX(geom, segment.waypoints[i].col);
        const y = cellCenterY(geom, segment.waypoints[i].row);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      const first = segment.waypoints[0];
      ctx.beginPath();
      ctx.arc(
        cellCenterX(geom, first.col),
        cellCenterY(geom, first.row),
        Math.max(2, ts * 0.08),
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.restore();
  }

  // 5) 路徑點之間的白色虛線骨幹
  if (display.length > 1) {
    ctx.save();
    ctx.strokeStyle = palette.card;
    ctx.lineWidth = Math.max(2, ts * 0.08);
    ctx.lineCap = 'round';
    ctx.setLineDash([Math.max(4, ts * 0.2), Math.max(3, ts * 0.14)]);
    ctx.beginPath();
    for (let i = 0; i < display.length; i++) {
      const x = cellCenterX(geom, display[i].col);
      const y = cellCenterY(geom, display[i].row);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  // 6) 方向箭頭：每一點指向下一點
  if (frame.showArrows) {
    for (let i = 0; i < display.length - 1; i++) {
      drawBackboneArrow(
        ctx,
        cellCenterX(geom, display[i].col),
        cellCenterY(geom, display[i].row),
        cellCenterX(geom, display[i + 1].col),
        cellCenterY(geom, display[i + 1].row),
        palette.ink,
        handleRadius,
      );
    }
  }

  // 7) 終點方塊（最後一點）
  if (display.length > 0) {
    const last = display[display.length - 1];
    const cx = cellCenterX(geom, last.col);
    const cy = cellCenterY(geom, last.row);
    const half = Math.max(5, ts * 0.21);
    ctx.save();
    ctx.fillStyle = palette.alert;
    ctx.strokeStyle = palette.line;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(cx - half, cy - half, half * 2, half * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // 8) 拖曳把手
  for (let i = 0; i < display.length; i++) {
    const cx = cellCenterX(geom, display[i].col);
    const cy = cellCenterY(geom, display[i].row);
    const isSelected = frame.selectedWaypoint === i;
    const isDragging = frame.dragPreview !== null && frame.dragPreview.index === i;

    ctx.save();
    if (isDragging) {
      ctx.beginPath();
      ctx.arc(cx, cy, handleRadius * 1.7, 0, Math.PI * 2);
      ctx.strokeStyle = palette.coral;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(cx, cy, handleRadius, 0, Math.PI * 2);
    ctx.fillStyle = isDragging ? palette.sun : isSelected ? palette.coral : palette.card;
    ctx.fill();
    ctx.strokeStyle = isSelected || isDragging ? palette.coral : i === 0 ? palette.mint : palette.ink;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 選中的把手加白色內圈：在糖果色底上仍然看得出「這是被抓住的那一點」
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(1, handleRadius * (isSelected || isDragging ? 0.42 : 0.24)), 0, Math.PI * 2);
    ctx.fillStyle = isSelected || isDragging ? palette.card : palette.ink;
    ctx.fill();
    ctx.restore();
  }

  // 9) 播放中的敵人：脈動圓點。
  // RunnerPoint 已是「含半格」的格心座標（(0.5,0.5) = 第 (0,0) 格中心，見 useMapPlayback），
  // 所以這裡直接乘 tileSize，不再補 + 0.5。
  if (frame.runner) {
    const cx = ox + frame.runner.x * ts;
    const cy = oy + frame.runner.y * ts;
    const pulse = 1 + 0.18 * Math.sin(frame.now / PULSE_PERIOD_MS);
    const radius = Math.max(3, ts * 0.24 * pulse);
    ctx.save();
    ctx.globalAlpha = 0.26;
    ctx.fillStyle = palette.sun;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 2.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = palette.coral;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = palette.card;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
};

// ===== 元件 =====

export interface MapOverlayCanvasProps {
  draft: MapDraft;
  tool: 'waypoint' | 'blocked' | 'tower' | 'erase';
  selectedWaypoint: number | null;
  selectedTowerId: string | null;
  selectedTowerType: string | null;
  showGrid: boolean;
  showCoords: boolean;
  showArrows: boolean;
  runner: { x: number; y: number } | null;
  onAddWaypoint: (point: GridPoint, insertIndex?: number) => void;
  onMoveWaypoint: (index: number, to: GridPoint) => void;
  onRemoveWaypoint: (index: number) => void;
  onSelectWaypoint: (index: number | null) => void;
  onPaintBlocked: (point: GridPoint, blocked: boolean) => void;
  onPlaceTower: (point: GridPoint) => void;
  onSelectTower: (id: string | null) => void;
  onRemoveTower: (id: string) => void;
}

export function MapOverlayCanvas(props: MapOverlayCanvasProps) {
  const {
    draft,
    tool,
    selectedWaypoint,
    selectedTowerId,
    showGrid,
    showCoords,
    showArrows,
    runner,
    onAddWaypoint,
    onMoveWaypoint,
    onRemoveWaypoint,
    onSelectWaypoint,
    onPaintBlocked,
    onPlaceTower,
    onSelectTower,
    onRemoveTower,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const baseCanvasRef = useRef<HTMLCanvasElement>(null);
  const chromeCanvasRef = useRef<HTMLCanvasElement>(null);

  // 尺寸放在 ref：ResizeObserver 回呼不該每幀觸發 React 重繪，只有「真的變了」才 bump sizeTick
  const sizeRef = useRef({ width: 0, height: 0 });
  const [sizeTick, setSizeTick] = useState(0);

  const [hoverCell, setHoverCell] = useState<GridPoint | null>(null);
  // 拖曳中的落點是「本地預覽」：pointermove 只改這裡，pointerup 才呼叫 onMoveWaypoint。
  // 理由：每一次 move 都 commit 的話，上層 draft 會逐像素重建 → base 層（drawGrid）跟著重畫兩次以上，
  // 拖過 5 格就是十幾次整盤重繪 + 上層 validateDraft 重算，手感會變成拖影。
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);

  // 這兩份是「輸入路由狀態」：只影響下一次指標事件怎麼處理，不影響畫面，所以用 ref 不用 state
  const dragRef = useRef<DragState | null>(null);
  const brushRef = useRef<BrushState | null>(null);

  const cols = draft.cols > 0 ? draft.cols : GAME_CONSTANTS.GRID_COLS;
  const rows = draft.rows > 0 ? draft.rows : GAME_CONSTANTS.GRID_ROWS;

  // 量容器：clientWidth/clientHeight 只在尺寸真的變化時寫回 ref 並 bump 一次
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = (): void => {
      const width = el.clientWidth;
      const height = el.clientHeight;
      const prev = sizeRef.current;
      if (prev.width === width && prev.height === height) return;
      sizeRef.current = { width, height };
      setSizeTick((value) => value + 1);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      observer.disconnect();
    };
  }, []);

  const geom = useMemo(() => {
    const size = sizeRef.current;
    return computeGeometry(size.width, size.height, cols, rows);
    // sizeRef 是 ref，不會觸發重算；sizeTick 才是尺寸變更的訊號（變更時 ref 已經寫好了）
  }, [sizeTick, cols, rows]);

  const palette = useMemo(() => readPalette(containerRef.current), [sizeTick, cols, rows]);

  // base 層：只在 draft / 尺寸 / 主題色變動時重畫
  useEffect(() => {
    const canvas = baseCanvasRef.current;
    if (!canvas || geom.tileSize <= 0) return;
    const ctx = prepareCanvas(canvas, geom);
    if (!ctx) return;
    drawBaseLayer(ctx, geom, draft, selectedTowerId, palette);
  }, [draft, geom, palette, selectedTowerId]);

  const drawChrome = useCallback(
    (now: number): void => {
      const canvas = chromeCanvasRef.current;
      if (!canvas || geom.tileSize <= 0) return;
      const ctx = prepareCanvas(canvas, geom);
      if (!ctx) return;
      drawChromeLayer(ctx, geom, draft, palette, {
        hover: hoverCell,
        dragPreview,
        selectedWaypoint,
        selectedTowerId,
        showGrid,
        showCoords,
        showArrows,
        runner,
        now,
      });
    },
    // deps 逐項列出（不用整包 props）：每一項都是真的會影響這一層像素的輸入
    [geom, draft, palette, hoverCell, dragPreview, selectedWaypoint, selectedTowerId, showGrid, showCoords, showArrows, runner],
  );

  // rAF 迴圈要拿到「最新一次 render 的 drawChrome」，故此處同步 ref（迴圈本身不重建）
  const drawChromeRef = useRef(drawChrome);
  useEffect(() => {
    drawChromeRef.current = drawChrome;
  }, [drawChrome]);

  // 靜態幀：hover / 選取 / 開關 / drag preview 變動時重畫
  useEffect(() => {
    drawChrome(performance.now());
  }, [drawChrome]);

  // 播放中的 runner 需要脈動 → 用 rAF 重畫 chrome 層。
  // 每一幀都必須走 guard.run（frameLoopGuard），單幀異常只掉一幀，不會讓整層安靜停住。
  // deps 放 runner：上層每推一次新位置就重建這個 effect（等同「有在動」），
  // 因此迴圈自己跑滿 30 幀就收手——暫停／播完時 runner 仍是同一個物件，不會空轉 60fps。
  useEffect(() => {
    if (!runner) return;
    const guard = createFrameLoopGuard({ label: 'workshop-map-overlay' });
    let frameId = 0;
    let frames = 0;
    const loop = (): void => {
      guard.run(() => {
        drawChromeRef.current(performance.now());
      });
      frames += 1;
      if (frames > 30) {
        frameId = 0;
        return;
      }
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [runner]);

  const setHover = useCallback((next: GridPoint | null): void => {
    setHoverCell((prev) => {
      if (prev === null && next === null) return prev;
      if (prev !== null && next !== null && samePoint(prev, next)) return prev;
      return next;
    });
  }, []);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>): void => {
      if (event.button === 2) return; // 右鍵交給 contextmenu，避免刪點又順手拖一次
      if (geom.tileSize <= 0) return;

      const canvas = event.currentTarget;
      const local = localPoint(canvas, event.clientX, event.clientY);

      // (1) 把手優先：任何工具下都能拖路徑點（把手是很小的精準目標，不會跟筆刷打架）
      const waypointIndex = hitWaypoint(geom, draft.waypoints, local.x, local.y);
      if (waypointIndex >= 0) {
        const point = draft.waypoints[waypointIndex];
        canvas.setPointerCapture(event.pointerId);
        dragRef.current = { index: waypointIndex, pointerId: event.pointerId, point };
        setDragPreview({ index: waypointIndex, point });
        onSelectWaypoint(waypointIndex);
        return;
      }

      const point = pointAt(geom, local.x, local.y);
      if (!point) return;

      // (2) 障礙筆刷：起點那一格已經是障礙 → 整輪改成擦除
      if (tool === 'blocked') {
        const erase = isBlocked(draft, point);
        canvas.setPointerCapture(event.pointerId);
        brushRef.current = {
          pointerId: event.pointerId,
          erase,
          done: new Set<string>([pointKey(point)]),
        };
        onPaintBlocked(point, !erase);
        return;
      }

      // (3) 擺塔：點到既有預覽塔是選取，點空格是擺放（能不能擺由 editModel 判斷）
      if (tool === 'tower') {
        const existing = previewTowerAt(draft, point);
        if (existing) {
          onSelectTower(existing.id);
          return;
        }
        onPlaceTower(point);
        return;
      }

      // (4) 擦除工具：擦塔；點到空地就順手取消選取
      if (tool === 'erase') {
        const existing = previewTowerAt(draft, point);
        if (existing) {
          onRemoveTower(existing.id);
          return;
        }
        onSelectTower(null);
        return;
      }

      // (5) waypoint 工具：單擊只清選取，新增點交給雙擊
      onSelectWaypoint(null);
    },
    [geom, draft, tool, onPaintBlocked, onPlaceTower, onRemoveTower, onSelectTower, onSelectWaypoint],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>): void => {
      const local = localPoint(event.currentTarget, event.clientX, event.clientY);
      const point = pointAt(geom, local.x, local.y);
      setHover(point);

      const drag = dragRef.current;
      if (drag && drag.pointerId === event.pointerId) {
        if (!point || samePoint(point, drag.point)) return;
        // 只有跨格才更新預覽，同一格內的像素移動不造成任何重繪
        drag.point = point;
        setDragPreview({ index: drag.index, point });
        return;
      }

      const brush = brushRef.current;
      if (brush && brush.pointerId === event.pointerId) {
        if (!point) return;
        const key = pointKey(point);
        if (brush.done.has(key)) return;
        brush.done.add(key);
        onPaintBlocked(point, !brush.erase);
      }
    },
    [geom, onPaintBlocked, setHover],
  );

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>): void => {
      const canvas = event.currentTarget;
      const drag = dragRef.current;
      if (drag && drag.pointerId === event.pointerId) {
        dragRef.current = null;
        setDragPreview(null);
        const origin = draft.waypoints[drag.index];
        if (origin && !samePoint(origin, drag.point)) onMoveWaypoint(drag.index, drag.point);
      }
      const brush = brushRef.current;
      if (brush && brush.pointerId === event.pointerId) brushRef.current = null;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    },
    [draft, onMoveWaypoint],
  );

  const handlePointerCancel = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>): void => {
      const canvas = event.currentTarget;
      // 取消（視窗失焦、觸控被系統接管）不 commit，避免留下半途的落點
      if (dragRef.current && dragRef.current.pointerId === event.pointerId) {
        dragRef.current = null;
        setDragPreview(null);
      }
      if (brushRef.current && brushRef.current.pointerId === event.pointerId) brushRef.current = null;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    },
    [],
  );

  const handlePointerLeave = useCallback((): void => {
    setHover(null);
  }, [setHover]);

  const handleDoubleClick = useCallback(
    (event: ReactMouseEvent<HTMLCanvasElement>): void => {
      if (tool !== 'waypoint') return;
      const local = localPoint(event.currentTarget, event.clientX, event.clientY);
      const point = pointAt(geom, local.x, local.y);
      if (!point) return;
      onAddWaypoint(point);
    },
    [geom, tool, onAddWaypoint],
  );

  const handleContextMenu = useCallback(
    (event: ReactMouseEvent<HTMLCanvasElement>): void => {
      const local = localPoint(event.currentTarget, event.clientX, event.clientY);
      const waypointIndex = hitWaypoint(geom, draft.waypoints, local.x, local.y);
      if (waypointIndex < 0) return;
      event.preventDefault();
      if (dragRef.current) {
        dragRef.current = null;
        setDragPreview(null);
      }
      onRemoveWaypoint(waypointIndex);
    },
    [geom, draft, onRemoveWaypoint],
  );

  // 註：props.selectedTowerType 由契約保留，但這一層不讀它——
  // 預覽塔的種類只影響上層擺放邏輯，畫面上 draft.towers 已經帶 type，不需重複。

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      <canvas
        ref={baseCanvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      />
      <canvas
        ref={chromeCanvasRef}
        className="absolute inset-0 h-full w-full touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handlePointerLeave}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
      />
    </div>
  );
}
