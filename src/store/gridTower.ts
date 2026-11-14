/**
 * 格子與塔的唯一橋樑
 *
 * 舊模型：`Tile.tower` 存一份「塔的複本」，`state.towers` 再存一份，
 * 全專案有 74 處手寫雙寫、95 處讀取。任何一處忘同步就是幽靈塔
 * （畫面上有、點不到；或已經賣掉但格子還佔著）。
 *
 * 新模型：格子只存 `towerId`（一個字串），塔的資料只有 `state.towers` 一份。
 * 這一頁就是全部的存取入口——要嘛走這裡，要嘛編譯不過。
 */
import type { GridPosition, Tile, Tower } from '@/types/game';

export type Grid = Tile[][];

/** 某格的塔 id（越界或空格回 null） */
export const towerIdAt = (grid: Grid, pos: { col: number; row: number }): string | null =>
  grid[pos.row]?.[pos.col]?.towerId ?? null;

export const positionKey = (pos: { col: number; row: number }): string => `${pos.col},${pos.row}`;

/**
 * 設定某格的塔 id（回傳新 grid；沒變就回傳原參考，避免無謂重繪）
 */
export const setTileTowerId = (grid: Grid, pos: GridPosition, towerId: string | null): Grid => {
  const tile = grid[pos.row]?.[pos.col];
  if (!tile || tile.towerId === towerId) return grid;

  const nextRow = grid[pos.row].slice();
  nextRow[pos.col] = { ...tile, towerId };

  const next = grid.slice();
  next[pos.row] = nextRow;
  return next;
};

/** 一次清掉多個塔 id（塔被摧毀 / 批量出售） */
export const clearTowerIds = (grid: Grid, ids: ReadonlySet<string>): Grid => {
  if (ids.size === 0) return grid;

  let changed = false;
  const next = grid.map((row) => {
    let rowChanged = false;
    const nextRow = row.map((tile) => {
      if (tile.towerId && ids.has(tile.towerId)) {
        rowChanged = true;
        return { ...tile, towerId: null };
      }
      return tile;
    });
    if (!rowChanged) return row;
    changed = true;
    return nextRow;
  });

  return changed ? next : grid;
};

/**
 * 以 towers 為權威來源重建整張 grid 的 towerId。
 *
 * 用在「不確定目前 grid 是否還對得上」的地方（例如讀檔、mod 載入、批量操作收尾），
 * 是這個模型下的安全網：呼叫一次就保證沒有孤兒 id、也沒有漏登記的塔。
 */
export const syncGridTowerIds = (grid: Grid, towers: readonly Tower[]): Grid => {
  const wanted = new Map<string, string>();
  for (const tower of towers) {
    wanted.set(positionKey(tower.gridPos), tower.id);
  }

  let changed = false;
  const next = grid.map((row) => {
    let rowChanged = false;
    const nextRow = row.map((tile) => {
      const shouldBe = wanted.get(positionKey(tile)) ?? null;
      if (tile.towerId !== shouldBe) {
        rowChanged = true;
        return { ...tile, towerId: shouldBe };
      }
      return tile;
    });
    if (!rowChanged) return row;
    changed = true;
    return nextRow;
  });

  return changed ? next : grid;
};
