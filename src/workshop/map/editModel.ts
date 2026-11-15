/**
 * 地圖編輯模型（純函式）
 *
 * 這一層只做「資料 → 資料」：路徑點增刪拖曳、障礙格筆刷、預覽塔、驗證、與真實遊戲 grid 的互轉。
 * 不 import store、不 import React，因此可以被測試與節點圖編譯器直接重用。
 *
 * 座標語彙沿用 GAME_CONSTANTS.GRID_COLS / GRID_ROWS 的 (col,row)，與 PathConfig.waypoints 一致。
 */
import { GAME_CONSTANTS } from '@/data/gameData';
import {
  DEFAULT_PATH_WIDTH,
  DEFAULT_TOWER_RADIUS,
  distanceToPolyline,
} from '@/data/mapGeometry';
import type { GridPosition, MapPoint } from '@/types/game';

/** 編輯器內使用的格座標（與 GridPosition 同構，但名稱更短） */
export interface GridPoint {
  col: number;
  row: number;
}

/** 預覽塔：只存在於工坊草稿，沒有 id 對應的 runtime Tower */
export interface PreviewTower {
  id: string;
  /** TowerType 字串；工坊不強制收斂，方便 mod 塔 */
  type: string;
  col: number;
  row: number;
}

/** 地圖草稿：工坊裡可編輯、可序列化、可還原的最小單位 */
/** 叉路地圖的一段：自己的路徑點 + 下一段（多個＝分岔） */
export interface MapSegmentDraft {
  id: string;
  /** 下一段的路段 id；空陣列＝這一段是終點 */
  next: string[];
  waypoints: GridPoint[];
}

export interface MapDraft {
  cols: number;
  rows: number;
  /**
   * 有序路徑點，第 0 個是起點、最後一個是終點。
   * 叉路地圖時，這裡永遠是「目前編輯中的那一段」（與 activeSegmentId 對應）。
   */
  waypoints: GridPoint[];
  /** 障礙格（不可建造）；允許與路徑重疊，但會被 validateDraft 標成衝突 */
  blocked: GridPoint[];
  /** 預覽塔（擺塔預覽，不扣錢、不開局） */
  towers: PreviewTower[];
  /** 叉路地圖的路段；空／undefined＝單一路徑（普通地圖） */
  segments?: MapSegmentDraft[];
  /** 目前編輯中的路段 id */
  activeSegmentId?: string | null;
  /** 起始路段 id（叉路地圖必填） */
  startSegmentId?: string | null;
}

export type MapIssueCode =
  | 'tooFewWaypoints'
  | 'segmentStartMissing'
  | 'segmentNextMissing'
  | 'outOfBounds'
  | 'duplicateWaypoint'
  | 'pathBroken'
  | 'blockedOnPath'
  | 'towerOnPath'
  | 'towerOnBlocked'
  | 'towerOverlap';

export interface MapIssue {
  code: MapIssueCode;
  /** 出問題的格（路徑類問題可能沒有單一格） */
  at?: GridPoint;
  /** 路徑點索引（waypoint 相關問題才有） */
  index?: number;
}

/** 一次編輯操作的結果：草稿 + 是否真的變了 + 被拒絕的原因 */
export interface DraftOpResult {
  draft: MapDraft;
  changed: boolean;
  issue?: MapIssue;
}

const key = (p: GridPoint): string => p.col + ',' + p.row;

export const pointKey = key;

export const samePoint = (a: GridPoint, b: GridPoint): boolean => a.col === b.col && a.row === b.row;

/**
 * 是否在地圖範圍內。
 * 自由制允許浮點（3.5, 7.25），只要落在 [0, cols) × [0, rows) 就是合法位置；
 * 舊版要求整數，等於把「只能拖到格點」寫進了資料層。
 */
export const isInside = (p: GridPoint, cols: number, rows: number): boolean =>
  Number.isFinite(p.col) && Number.isFinite(p.row) &&
  p.col >= 0 && p.col < cols && p.row >= 0 && p.row < rows;

/** 障礙圓心吸附到半格：自由拖曳但不讓筆刷堆出滿地重疊圓 */
const snapHalf = (v: number): number => Math.round(v * 2) / 2;

/** 四鄰相接（不含對角），拖曳後的路徑必須維持這個關係 */
const isAdjacent = (a: GridPoint, b: GridPoint): boolean =>
  Math.abs(a.col - b.col) + Math.abs(a.row - b.row) === 1;

export function createEmptyDraft(): MapDraft {
  return {
    cols: GAME_CONSTANTS.GRID_COLS,
    rows: GAME_CONSTANTS.GRID_ROWS,
    waypoints: [],
    blocked: [],
    towers: [],
  };
}

/** 起點固定在左緣、終點在右緣的預設骨架，讓新關卡一打開就能看到一條路 */
export function createStarterDraft(): MapDraft {
  const base = createEmptyDraft();
  const midRow = Math.floor(base.rows / 2);
  return {
    ...base,
    waypoints: [
      { col: 0, row: midRow },
      { col: Math.floor(base.cols / 2), row: midRow },
      { col: base.cols - 1, row: midRow },
    ],
  };
}

const replaceAt = (list: GridPoint[], index: number, next: GridPoint): GridPoint[] =>
  list.map((p, i) => (i === index ? next : p));

// ===== 路徑點 =====

/**
 * 新增路徑點。
 * - 不指定 index 時接在尾端（路徑延伸的直覺行為）
 * - 指定 index 時插在該位置之前（在既有轉角上插入新轉角）
 * - 重複點直接拒絕：重複點會讓 drawGrid 的連通判斷與方向箭頭同時失真
 */
export function addWaypoint(draft: MapDraft, point: GridPoint, index?: number): DraftOpResult {
  if (!isInside(point, draft.cols, draft.rows)) {
    return { draft, changed: false, issue: { code: 'outOfBounds', at: point } };
  }
  if (draft.waypoints.some((p) => samePoint(p, point))) {
    return { draft, changed: false, issue: { code: 'duplicateWaypoint', at: point } };
  }
  const at = index === undefined ? draft.waypoints.length : Math.max(0, Math.min(index, draft.waypoints.length));
  const waypoints = [...draft.waypoints.slice(0, at), point, ...draft.waypoints.slice(at)];
  return { draft: { ...draft, waypoints }, changed: true };
}

/** 拖曳移動路徑點；移到別人身上或出界一律拒絕，保留原圖 */
export function moveWaypoint(draft: MapDraft, index: number, to: GridPoint): DraftOpResult {
  if (index < 0 || index >= draft.waypoints.length) return { draft, changed: false };
  if (!isInside(to, draft.cols, draft.rows)) {
    return { draft, changed: false, issue: { code: 'outOfBounds', at: to } };
  }
  const occupied = draft.waypoints.some((p, i) => i !== index && samePoint(p, to));
  if (occupied) {
    return { draft, changed: false, issue: { code: 'duplicateWaypoint', at: to, index } };
  }
  if (samePoint(draft.waypoints[index], to)) return { draft, changed: false };
  return { draft: { ...draft, waypoints: replaceAt(draft.waypoints, index, to) }, changed: true };
}

/** 刪除路徑點；至少要留 2 點才是一條路徑 */
export function removeWaypoint(draft: MapDraft, index: number): DraftOpResult {
  if (index < 0 || index >= draft.waypoints.length) return { draft, changed: false };
  if (draft.waypoints.length <= 2) {
    return { draft, changed: false, issue: { code: 'tooFewWaypoints', index } };
  }
  const waypoints = draft.waypoints.filter((_, i) => i !== index);
  return { draft: { ...draft, waypoints }, changed: true };
}

// ===== 路徑展開 =====

/**
 * 把路徑點展開成有序格子序列。
 *
 * 走法與執行期一致：先走列、再走欄（L 型轉角），因此相鄰兩格永遠四鄰相接。
 * 這是「拖曳後路徑相鄰性」可以被測試的原因：只要 waypoints 沒有重複點，展開結果就不可能斷。
 */
export function expandPathCells(waypoints: GridPoint[]): GridPoint[] {
  if (waypoints.length === 0) return [];
  if (waypoints.length === 1) return [{ ...waypoints[0] }];

  const cells: GridPoint[] = [];
  const seen = new Set<string>();

  const push = (p: GridPoint): void => {
    const k = key(p);
    if (seen.has(k)) return;
    seen.add(k);
    cells.push({ col: p.col, row: p.row });
  };

  for (let i = 0; i < waypoints.length - 1; i++) {
    const from = waypoints[i];
    const to = waypoints[i + 1];
    // 自由制：路徑點可能是浮點。膨脹是給 UI 與斷裂檢查用的整數取樣，
    // 先四捨五入再走 L 型，避免浮點讓 while 永遠到不了終點。
    let col = Math.round(from.col);
    let row = Math.round(from.row);
    const toCol = Math.round(to.col);
    const toRow = Math.round(to.row);
    // 保險上限：避免資料壞掉時無限迴圈（最短路徑不可能超過 cols+rows 步）
    let guard = 0;
    while (guard <= GAME_CONSTANTS.GRID_COLS + GAME_CONSTANTS.GRID_ROWS + 2) {
      push({ col, row });
      if (col === toCol && row === toRow) break;
      if (row < toRow) row++;
      else if (row > toRow) row--;
      else if (col < toCol) col++;
      else if (col > toCol) col--;
      guard++;
    }
  }
  push(waypoints[waypoints.length - 1]);
  return cells;
}

/** 回傳所有「與前一格不相接」的索引，正常情況一定是空陣列 */
export function findPathBreaks(cells: GridPoint[]): number[] {
  const breaks: number[] = [];
  for (let i = 1; i < cells.length; i++) {
    if (!isAdjacent(cells[i - 1], cells[i])) breaks.push(i);
  }
  return breaks;
}

/** 路徑格集合（用於障礙/塔衝突判定） */
/* ------------------------------------------------- 叉路地圖（路段） */

/** 把目前編輯中的路徑點寫回它所屬的路段（其他操作都先呼叫這支，避免兩份真相） */
function commitActiveSegment(draft: MapDraft): MapDraft {
  const segments = draft.segments;
  if (!segments || segments.length === 0) return draft;
  const activeId = draft.activeSegmentId ?? segments[0].id;
  return {
    ...draft,
    segments: segments.map((segment) =>
      segment.id === activeId ? { ...segment, waypoints: draft.waypoints } : segment,
    ),
  };
}

/** 目前的路段清單（已同步編輯中的那一段；普通地圖回空陣列） */
export function segmentList(draft: MapDraft): MapSegmentDraft[] {
  return commitActiveSegment(draft).segments ?? [];
}

function nextSegmentId(draft: MapDraft): string {
  let max = 0;
  for (const segment of draft.segments ?? []) {
    const hit = /^seg_(\d+)$/.exec(segment.id);
    if (hit) max = Math.max(max, Number(hit[1]));
  }
  return 'seg_' + (max + 1);
}

/** 把單一路徑升級成叉路地圖（第一段就是目前的路徑） */
export function enableSegments(draft: MapDraft): DraftOpResult {
  if ((draft.segments ?? []).length > 0) return { draft, changed: false };
  const first: MapSegmentDraft = { id: 'seg_1', next: [], waypoints: draft.waypoints };
  return {
    draft: { ...draft, segments: [first], activeSegmentId: first.id, startSegmentId: first.id },
    changed: true,
  };
}

/** 新增一段並切換過去（新段是空的） */
export function addSegment(draft: MapDraft): DraftOpResult {
  const base = commitActiveSegment(draft);
  const id = nextSegmentId(base);
  const segments = [...(base.segments ?? []), { id, next: [], waypoints: [] }];
  return {
    draft: {
      ...base,
      segments,
      activeSegmentId: id,
      waypoints: [],
      startSegmentId: base.startSegmentId ?? id,
    },
    changed: true,
  };
}

/** 切換編輯中的路段（先把目前這段存回去） */
export function selectSegment(draft: MapDraft, id: string): DraftOpResult {
  const base = commitActiveSegment(draft);
  const target = (base.segments ?? []).find((segment) => segment.id === id);
  if (!target) return { draft, changed: false };
  return { draft: { ...base, activeSegmentId: id, waypoints: target.waypoints }, changed: true };
}

/** 刪除一段：清掉其他段對它的引用，並在必要時換掉起點與編輯中路段 */
export function removeSegment(draft: MapDraft, id: string): DraftOpResult {
  const base = commitActiveSegment(draft);
  const remaining = (base.segments ?? []).filter((segment) => segment.id !== id);
  if (remaining.length === (base.segments ?? []).length) return { draft, changed: false };
  const cleaned = remaining.map((segment) => ({
    ...segment,
    next: segment.next.filter((nextId) => nextId !== id),
  }));
  const activeId =
    base.activeSegmentId === id ? cleaned[0]?.id ?? null : base.activeSegmentId ?? null;
  const active = cleaned.find((segment) => segment.id === activeId);
  return {
    draft: {
      ...base,
      segments: cleaned,
      activeSegmentId: activeId,
      waypoints: active ? active.waypoints : base.waypoints,
      startSegmentId: base.startSegmentId === id ? cleaned[0]?.id ?? null : base.startSegmentId ?? null,
    },
    changed: true,
  };
}

/** 指定起始路段 */
export function setStartSegment(draft: MapDraft, id: string): DraftOpResult {
  const base = commitActiveSegment(draft);
  if (!(base.segments ?? []).some((segment) => segment.id === id)) return { draft, changed: false };
  return { draft: { ...base, startSegmentId: id }, changed: true };
}

/** 設定某一段的下一段（自動濾掉不存在與自己） */
export function setSegmentNext(draft: MapDraft, id: string, next: string[]): DraftOpResult {
  const base = commitActiveSegment(draft);
  const ids = new Set((base.segments ?? []).map((segment) => segment.id));
  const cleaned = next.filter((nextId) => nextId !== id && ids.has(nextId));
  return {
    draft: {
      ...base,
      segments: (base.segments ?? []).map((segment) =>
        segment.id === id ? { ...segment, next: cleaned } : segment,
      ),
    },
    changed: true,
  };
}

/** 草稿的所有折線（主路徑 + 各路段），給幾何判定用 */
const draftPolylines = (draft: MapDraft): GridPoint[][] => {
  const all = [draft.waypoints, ...(draft.segments ?? []).map((segment) => segment.waypoints)];
  return all.filter((wps) => wps.length >= 2);
};

/** 塔或障礙圓心到最近路徑的距離（格單位） */
const clearanceToPath = (draft: MapDraft, point: GridPoint): number => {
  const center = { x: point.col + 0.5, y: point.row + 0.5 };
  let best = Infinity;
  for (const line of draftPolylines(draft)) {
    const d = distanceToPolyline(center, line);
    if (d < best) best = d;
  }
  return best;
};

export function pathCellKeys(draft: MapDraft): Set<string> {
  const keys = new Set(expandPathCells(draft.waypoints).map(key));
  // 叉路地圖：其他路段走過的格子也算路徑（畫格子與障礙衝突判定都要看全部）
  for (const segment of draft.segments ?? []) {
    for (const p of expandPathCells(segment.waypoints)) keys.add(key(p));
  }
  return keys;
}

// ===== 障礙格 =====

export function toggleBlocked(draft: MapDraft, point: GridPoint): DraftOpResult {
  const snapped = { col: snapHalf(point.col), row: snapHalf(point.row) };
  if (!isInside(snapped, draft.cols, draft.rows)) {
    return { draft, changed: false, issue: { code: 'outOfBounds', at: point } };
  }
  const exists = draft.blocked.some((p) => samePoint(p, snapped));
  const blocked = exists
    ? draft.blocked.filter((p) => !samePoint(p, snapped))
    : [...draft.blocked, snapped];
  return { draft: { ...draft, blocked }, changed: true };
}

/** 筆刷：一次塗整批格（拖曳塗抹），已塗的格不會重複加入 */
export function paintBlocked(draft: MapDraft, points: GridPoint[], blocked: boolean): DraftOpResult {
  // 筆刷先吸附半格再過濾：自由拖曳不會堆出滿地重疊圓
  const valid = points
    .map((p) => ({ col: snapHalf(p.col), row: snapHalf(p.row) }))
    .filter((p) => isInside(p, draft.cols, draft.rows));
  if (valid.length === 0) return { draft, changed: false };
  const set = new Set(draft.blocked.map(key));
  let changed = false;
  for (const p of valid) {
    const k = key(p);
    if (blocked && !set.has(k)) {
      set.add(k);
      changed = true;
    } else if (!blocked && set.has(k)) {
      set.delete(k);
      changed = true;
    }
  }
  if (!changed) return { draft, changed: false };
  const next: GridPoint[] = [];
  set.forEach((k) => {
    const [col, row] = k.split(',').map(Number);
    next.push({ col, row });
  });
  return { draft: { ...draft, blocked: next }, changed: true };
}

export function clearBlocked(draft: MapDraft): DraftOpResult {
  if (draft.blocked.length === 0) return { draft, changed: false };
  return { draft: { ...draft, blocked: [] }, changed: true };
}

export const isBlocked = (draft: MapDraft, point: GridPoint): boolean =>
  draft.blocked.some((p) => samePoint(p, point));

/** 障礙格與路徑重疊的格子：UI 要即時標紅 */
export function blockedPathConflicts(draft: MapDraft): GridPoint[] {
  // 自由制：障礙是圓心，壓到路徑就看距離，不再比對格集合
  const clearance = DEFAULT_PATH_WIDTH / 2 + DEFAULT_TOWER_RADIUS;
  return draft.blocked.filter((p) => clearanceToPath(draft, p) < clearance);
}

// ===== 預覽塔 =====

export function previewTowerAt(draft: MapDraft, point: GridPoint): PreviewTower | null {
  // 自由制：座標是連續值，用半格容差取代精確相等
  return draft.towers.find(
    (t) => Math.abs(t.col - point.col) < 0.5 && Math.abs(t.row - point.row) < 0.5,
  ) ?? null;
}

/** 這一格能不能擺預覽塔（不考慮金錢：工坊不開局、不扣錢） */
export function canPlacePreviewTower(draft: MapDraft, point: GridPoint): { ok: boolean; issue?: MapIssue } {
  if (!isInside(point, draft.cols, draft.rows)) return { ok: false, issue: { code: 'outOfBounds', at: point } };
  const clearance = DEFAULT_PATH_WIDTH / 2 + DEFAULT_TOWER_RADIUS;
  if (clearanceToPath(draft, point) < clearance) return { ok: false, issue: { code: 'towerOnPath', at: point } };
  if (isBlocked(draft, point)) return { ok: false, issue: { code: 'towerOnBlocked', at: point } };
  if (previewTowerAt(draft, point)) return { ok: false, issue: { code: 'towerOverlap', at: point } };
  return { ok: true };
}

export function addPreviewTower(draft: MapDraft, point: GridPoint, type: string, id: string): DraftOpResult {
  const check = canPlacePreviewTower(draft, point);
  if (!check.ok) return { draft, changed: false, issue: check.issue };
  const towers = [...draft.towers, { id, type, col: point.col, row: point.row }];
  return { draft: { ...draft, towers }, changed: true };
}

export function movePreviewTower(draft: MapDraft, id: string, to: GridPoint): DraftOpResult {
  const current = draft.towers.find((t) => t.id === id);
  if (!current) return { draft, changed: false };
  if (current.col === to.col && current.row === to.row) return { draft, changed: false };
  const others: MapDraft = { ...draft, towers: draft.towers.filter((t) => t.id !== id) };
  const check = canPlacePreviewTower(others, to);
  if (!check.ok) return { draft, changed: false, issue: check.issue };
  const towers = draft.towers.map((t) => (t.id === id ? { ...t, col: to.col, row: to.row } : t));
  return { draft: { ...draft, towers }, changed: true };
}

export function removePreviewTower(draft: MapDraft, id: string): DraftOpResult {
  if (!draft.towers.some((t) => t.id === id)) return { draft, changed: false };
  return { draft: { ...draft, towers: draft.towers.filter((t) => t.id !== id) }, changed: true };
}

export function clearPreviewTowers(draft: MapDraft): DraftOpResult {
  if (draft.towers.length === 0) return { draft, changed: false };
  return { draft: { ...draft, towers: [] }, changed: true };
}

// ===== 驗證 =====

export function validateDraft(draft: MapDraft): MapIssue[] {
  const issues: MapIssue[] = [];

  if (draft.waypoints.length < 2) issues.push({ code: 'tooFewWaypoints' });

  const seen = new Set<string>();
  draft.waypoints.forEach((p, index) => {
    if (!isInside(p, draft.cols, draft.rows)) issues.push({ code: 'outOfBounds', at: p, index });
    const k = key(p);
    if (seen.has(k)) issues.push({ code: 'duplicateWaypoint', at: p, index });
    seen.add(k);
  });

  if (findPathBreaks(expandPathCells(draft.waypoints)).length > 0) issues.push({ code: 'pathBroken' });

  for (const p of blockedPathConflicts(draft)) issues.push({ code: 'blockedOnPath', at: p });

  // 叉路地圖：每一段都要能走，起點與下一段引用都要存在
  const segments = draft.segments ?? [];
  if (segments.length > 0) {
    const ids = new Set(segments.map((segment) => segment.id));
    for (const segment of segments) {
      if (segment.waypoints.length < 2) issues.push({ code: 'tooFewWaypoints' });
      for (const p of segment.waypoints) {
        if (!isInside(p, draft.cols, draft.rows)) issues.push({ code: 'outOfBounds', at: p });
      }
      for (const nextId of segment.next) {
        if (!ids.has(nextId)) issues.push({ code: 'segmentNextMissing' });
      }
    }
    if (!draft.startSegmentId || !ids.has(draft.startSegmentId)) {
      issues.push({ code: 'segmentStartMissing' });
    }
  }

  return issues;
}

// ===== 序列化 / 從專案容錯讀取 =====

/** 專案層要寫回的欄位（實際形狀由 foundation 線決定；此處只保證 payload 純淨） */
export interface SerializedMapDraft {
  cols: number;
  rows: number;
  waypoints: GridPosition[];
  /** 圓形禁建區（圓心座標，單位＝格；取代舊的格子清單） */
  blockedAreas: MapPoint[];
  towers: { id: string; type: string; col: number; row: number }[];
  /** 叉路地圖的路段（普通地圖不寫這個欄位） */
  segments?: { id: string; next: string[]; waypoints: GridPosition[] }[];
  startSegmentId?: string;
}

export function serializeDraft(draft: MapDraft): SerializedMapDraft {
  const segments = commitActiveSegment(draft).segments ?? [];
  return {
    cols: draft.cols,
    rows: draft.rows,
    waypoints: draft.waypoints.map((p) => ({ col: p.col, row: p.row })),
    blockedAreas: draft.blocked.map((p) => ({ x: p.col + 0.5, y: p.row + 0.5 })),
    towers: draft.towers.map((t) => ({ id: t.id, type: t.type, col: t.col, row: t.row })),
    ...(segments.length > 0
      ? {
          segments: segments.map((segment) => ({
            id: segment.id,
            next: [...segment.next],
            waypoints: segment.waypoints.map((p) => ({ col: p.col, row: p.row })),
          })),
        }
      : {}),
    ...(draft.startSegmentId ? { startSegmentId: draft.startSegmentId } : {}),
  };
}

const readPoint = (v: unknown): GridPoint | null => {
  if (!v || typeof v !== 'object') return null;
  const rec = v as Record<string, unknown>;
  const col = rec.col;
  const row = rec.row;
  if (typeof col !== 'number' || typeof row !== 'number') return null;
  if (!Number.isFinite(col) || !Number.isFinite(row)) return null;
  // 自由制：路徑點可以是浮點（斜線／曲線），不再截成整數
  return { col, row };
};

/** 圓形禁建區 → 編輯器用的格點（取最近的格中心） */
const readAreas = (v: unknown): GridPoint[] => {
  if (!Array.isArray(v)) return [];
  const out: GridPoint[] = [];
  for (const item of v) {
    if (!item || typeof item !== 'object') continue;
    const rec = item as Record<string, unknown>;
    if (typeof rec.x !== 'number' || typeof rec.y !== 'number') continue;
    // 保留浮點：障礙圓心可以落在半格上
    out.push({ col: rec.x - 0.5, row: rec.y - 0.5 });
  }
  return out;
};

const readPoints = (v: unknown): GridPoint[] => {
  if (!Array.isArray(v)) return [];
  const out: GridPoint[] = [];
  for (const item of v) {
    const p = readPoint(item);
    if (p) out.push(p);
  }
  return out;
};

/**
 * 從「專案 / 關卡」這種形狀未定的物件容錯讀出草稿。
 *
 * 專案資料由 foundation 線定義，這裡刻意不接受強型別：工坊不應該因為欄位改名就整頁爆掉，
 * 讀不到就退回骨架草稿，並在 UI 標示「此關卡尚無地圖」。
 */
export function readMapDraft(source: unknown): MapDraft {
  const base = createEmptyDraft();
  if (!source || typeof source !== 'object') return createStarterDraft();

  const rec = source as Record<string, unknown>;
  const mapSource =
    rec.map && typeof rec.map === 'object'
      ? (rec.map as Record<string, unknown>)
      : rec.mapDraft && typeof rec.mapDraft === 'object'
        ? (rec.mapDraft as Record<string, unknown>)
        : rec;

  const cols = typeof mapSource.cols === 'number' ? Math.max(1, Math.trunc(mapSource.cols)) : base.cols;
  const rows = typeof mapSource.rows === 'number' ? Math.max(1, Math.trunc(mapSource.rows)) : base.rows;

  const waypoints = readPoints(mapSource.waypoints);
  const blocked = [
    ...readPoints(mapSource.blockedCells ?? mapSource.blocked),
    ...readAreas(mapSource.blockedAreas),
  ];

  const rawTowers = mapSource.towers;
  const towers: PreviewTower[] = [];
  if (Array.isArray(rawTowers)) {
    for (const item of rawTowers) {
      if (!item || typeof item !== 'object') continue;
      const t = item as Record<string, unknown>;
      const p = readPoint(t);
      if (!p) continue;
      towers.push({
        id: typeof t.id === 'string' ? t.id : 'pt-' + p.col + '-' + p.row,
        type: typeof t.type === 'string' ? t.type : 'basic',
        col: p.col,
        row: p.row,
      });
    }
  }

  // 叉路地圖：路段優先，編輯中的那一段就是 waypoints 的來源
  const segments: MapSegmentDraft[] = [];
  const rawSegments = mapSource.segments;
  if (Array.isArray(rawSegments)) {
    for (const item of rawSegments) {
      if (!item || typeof item !== 'object') continue;
      const seg = item as Record<string, unknown>;
      const id = typeof seg.id === 'string' && seg.id.length > 0 ? seg.id : 'seg_' + (segments.length + 1);
      const next = Array.isArray(seg.next)
        ? seg.next.filter((value): value is string => typeof value === 'string')
        : [];
      segments.push({ id, next, waypoints: readPoints(seg.waypoints) });
    }
  }
  const startSegmentId =
    typeof mapSource.startSegmentId === 'string' && mapSource.startSegmentId.length > 0
      ? mapSource.startSegmentId
      : segments[0]?.id ?? null;
  const active = segments.find((segment) => segment.id === startSegmentId) ?? segments[0];

  if (segments.length === 0 && waypoints.length === 0) {
    return { cols, rows, waypoints: createStarterDraft().waypoints, blocked, towers };
  }
  return {
    cols,
    rows,
    waypoints: active ? active.waypoints : waypoints,
    blocked,
    towers,
    ...(segments.length > 0
      ? { segments, activeSegmentId: active?.id ?? null, startSegmentId }
      : {}),
  };
}

/** 草稿的內容簽章：用來當 useMemo / 播放重算的依賴 */
export function draftSignature(draft: MapDraft): string {
  const seg = (draft.segments ?? [])
    .map((segment) => segment.id + '>' + segment.next.join('|') + ':' + segment.waypoints.map((p) => p.col + '.' + p.row).join('-'))
    .join(';');
  const wp = draft.waypoints.map((p) => p.col + '.' + p.row).join('-');
  const bl = draft.blocked
    .map(key)
    .sort()
    .join('-');
  const tw = draft.towers
    .map((t) => t.id + ':' + t.type + '@' + t.col + '.' + t.row)
    .sort()
    .join('-');
  const start = draft.startSegmentId ?? '';
  return draft.cols + 'x' + draft.rows + '|' + wp + '|' + bl + '|' + tw + '|' + seg + '|' + start;
}
