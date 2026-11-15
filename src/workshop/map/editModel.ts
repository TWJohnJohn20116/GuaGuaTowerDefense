/**
 * 地圖編輯模型（純函式）
 *
 * 這一層只做「資料 → 資料」：路徑點增刪拖曳、障礙格筆刷、預覽塔、驗證、與真實遊戲 grid 的互轉。
 * 不 import store、不 import React，因此可以被測試與節點圖編譯器直接重用。
 *
 * 座標語彙沿用 GAME_CONSTANTS.GRID_COLS / GRID_ROWS 的 (col,row)，與 PathConfig.waypoints 一致。
 */
import { GAME_CONSTANTS } from '@/data/gameData';
import type { GridPosition, Tile, TileType } from '@/types/game';

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
export interface MapDraft {
  cols: number;
  rows: number;
  /** 有序路徑點，第 0 個是起點、最後一個是終點 */
  waypoints: GridPoint[];
  /** 障礙格（不可建造）；允許與路徑重疊，但會被 validateDraft 標成衝突 */
  blocked: GridPoint[];
  /** 預覽塔（擺塔預覽，不扣錢、不開局） */
  towers: PreviewTower[];
}

export type MapIssueCode =
  | 'tooFewWaypoints'
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

export const isInside = (p: GridPoint, cols: number, rows: number): boolean =>
  Number.isInteger(p.col) && Number.isInteger(p.row) && p.col >= 0 && p.col < cols && p.row >= 0 && p.row < rows;

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
    let { col, row } = from;
    // 保險上限：避免資料壞掉時無限迴圈（最短路徑不可能超過 cols+rows 步）
    let guard = 0;
    while (guard <= GAME_CONSTANTS.GRID_COLS + GAME_CONSTANTS.GRID_ROWS + 2) {
      push({ col, row });
      if (col === to.col && row === to.row) break;
      if (row < to.row) row++;
      else if (row > to.row) row--;
      else if (col < to.col) col++;
      else if (col > to.col) col--;
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
export function pathCellKeys(draft: MapDraft): Set<string> {
  return new Set(expandPathCells(draft.waypoints).map(key));
}

// ===== 障礙格 =====

export function toggleBlocked(draft: MapDraft, point: GridPoint): DraftOpResult {
  if (!isInside(point, draft.cols, draft.rows)) {
    return { draft, changed: false, issue: { code: 'outOfBounds', at: point } };
  }
  const exists = draft.blocked.some((p) => samePoint(p, point));
  const blocked = exists ? draft.blocked.filter((p) => !samePoint(p, point)) : [...draft.blocked, point];
  return { draft: { ...draft, blocked }, changed: true };
}

/** 筆刷：一次塗整批格（拖曳塗抹），已塗的格不會重複加入 */
export function paintBlocked(draft: MapDraft, points: GridPoint[], blocked: boolean): DraftOpResult {
  const valid = points.filter((p) => isInside(p, draft.cols, draft.rows));
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
  const pathKeys = pathCellKeys(draft);
  return draft.blocked.filter((p) => pathKeys.has(key(p)));
}

// ===== 預覽塔 =====

export function previewTowerAt(draft: MapDraft, point: GridPoint): PreviewTower | null {
  return draft.towers.find((t) => t.col === point.col && t.row === point.row) ?? null;
}

/** 這一格能不能擺預覽塔（不考慮金錢：工坊不開局、不扣錢） */
export function canPlacePreviewTower(draft: MapDraft, point: GridPoint): { ok: boolean; issue?: MapIssue } {
  if (!isInside(point, draft.cols, draft.rows)) return { ok: false, issue: { code: 'outOfBounds', at: point } };
  if (pathCellKeys(draft).has(key(point))) return { ok: false, issue: { code: 'towerOnPath', at: point } };
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

  return issues;
}

// ===== 與真實遊戲 grid 互轉 =====

/**
 * 產出真正的 Tile[][]，直接餵給遊戲本體的 PathRenderer.drawGrid。
 * 這是「用真實渲染」的接縫：工坊不需要自己畫一套格子。
 */
export function toTileGrid(draft: MapDraft): Tile[][] {
  const pathKeys = pathCellKeys(draft);
  const first = draft.waypoints[0];
  const last = draft.waypoints[draft.waypoints.length - 1];
  const blockedKeys = new Set(draft.blocked.map(key));

  const grid: Tile[][] = [];
  for (let row = 0; row < draft.rows; row++) {
    const rowTiles: Tile[] = [];
    for (let col = 0; col < draft.cols; col++) {
      const k = col + ',' + row;
      let type: TileType = 'empty';
      if (pathKeys.has(k)) {
        if (first && first.col === col && first.row === row) type = 'start';
        else if (last && last.col === col && last.row === row) type = 'end';
        else type = 'path';
      } else if (blockedKeys.has(k)) {
        type = 'blocked';
      }
      const tower = draft.towers.find((t) => t.col === col && t.row === row);
      rowTiles.push({ type, row, col, towerId: tower ? tower.id : null });
    }
    grid.push(rowTiles);
  }
  return grid;
}

// ===== 序列化 / 從專案容錯讀取 =====

/** 專案層要寫回的欄位（實際形狀由 foundation 線決定；此處只保證 payload 純淨） */
export interface SerializedMapDraft {
  cols: number;
  rows: number;
  waypoints: GridPosition[];
  blockedCells: GridPosition[];
  towers: { id: string; type: string; col: number; row: number }[];
}

export function serializeDraft(draft: MapDraft): SerializedMapDraft {
  return {
    cols: draft.cols,
    rows: draft.rows,
    waypoints: draft.waypoints.map((p) => ({ col: p.col, row: p.row })),
    blockedCells: draft.blocked.map((p) => ({ col: p.col, row: p.row })),
    towers: draft.towers.map((t) => ({ id: t.id, type: t.type, col: t.col, row: t.row })),
  };
}

const readPoint = (v: unknown): GridPoint | null => {
  if (!v || typeof v !== 'object') return null;
  const rec = v as Record<string, unknown>;
  const col = rec.col;
  const row = rec.row;
  if (typeof col !== 'number' || typeof row !== 'number') return null;
  if (!Number.isFinite(col) || !Number.isFinite(row)) return null;
  return { col: Math.trunc(col), row: Math.trunc(row) };
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
  const blocked = readPoints(mapSource.blockedCells ?? mapSource.blocked);

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

  if (waypoints.length === 0) {
    return { cols, rows, waypoints: createStarterDraft().waypoints, blocked, towers };
  }
  return { cols, rows, waypoints, blocked, towers };
}

/** 草稿的內容簽章：用來當 useMemo / 播放重算的依賴 */
export function draftSignature(draft: MapDraft): string {
  const wp = draft.waypoints.map((p) => p.col + '.' + p.row).join('-');
  const bl = draft.blocked
    .map(key)
    .sort()
    .join('-');
  const tw = draft.towers
    .map((t) => t.id + ':' + t.type + '@' + t.col + '.' + t.row)
    .sort()
    .join('-');
  return draft.cols + 'x' + draft.rows + '|' + wp + '|' + bl + '|' + tw;
}
