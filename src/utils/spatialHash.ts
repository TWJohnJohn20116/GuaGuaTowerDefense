// 空間哈希（Spatial Hash）工具
// 目的：將 O(N*M) 的塔/子彈 vs 敵人範圍查詢降至接近 O(N + M)
//
// 設計要點：
// - 地圖尺寸 15x11，採 CELL_SIZE = 2，分割後約 8x6 = 48 個格子
// - 每幀重建：成本 O(M)，遠低於 O(N*M) 的線性掃描
// - 內部使用整數 hash key（避免字串拼接 GC 壓力）
// - 儲存 index（非 reference）以兼容陣列被 spread 替換的情境

const CELL_SIZE = 2;
const HASH_MULT = 100000; // 足以容納 ±50000 格的 col 偏移

export type SpatialHash = Map<number, number[]>;

const hashKey = (col: number, row: number): number =>
  Math.floor(col / CELL_SIZE) * HASH_MULT + Math.floor(row / CELL_SIZE);

/** 建立空的 spatial hash（內部為 Map） */
export const createSpatialHash = (): SpatialHash => new Map();

/** 將索引插入 hash（不檢查重複） */
export const insertIntoHash = (
  hash: SpatialHash,
  idx: number,
  x: number,
  y: number
): void => {
  const key = hashKey(x, y);
  const list = hash.get(key);
  if (list) {
    list.push(idx);
  } else {
    hash.set(key, [idx]);
  }
};

/**
 * 從一組「具備 x/y 屬性」的元素批次建立 spatial hash。
 * 儲存的是元素在原陣列中的 index。
 */
export const buildSpatialHash = <T extends { x: number; y: number }>(
  items: readonly T[]
): SpatialHash => {
  const hash = createSpatialHash();
  for (let i = 0; i < items.length; i++) {
    insertIntoHash(hash, i, items[i].x, items[i].y);
  }
  return hash;
};

/**
 * 遍歷以 (x, y) 為中心、radius 半徑內所有 hash bucket 的 index。
 * 注意：callback 收到的 idx 可能在精確半徑外（只篩到 bucket），
 * 呼叫方需自行做精確距離判定（dx*dx + dy*dy <= r*r）。
 */
export const forEachInHashRadius = (
  hash: SpatialHash,
  x: number,
  y: number,
  radius: number,
  callback: (idx: number) => void
): void => {
  const cellRadius = Math.ceil(radius / CELL_SIZE);
  const cx = Math.floor(x / CELL_SIZE);
  const cy = Math.floor(y / CELL_SIZE);

  for (let dx = -cellRadius; dx <= cellRadius; dx++) {
    for (let dy = -cellRadius; dy <= cellRadius; dy++) {
      const key = (cx + dx) * HASH_MULT + (cy + dy);
      const list = hash.get(key);
      if (list !== undefined) {
        for (let i = 0; i < list.length; i++) {
          callback(list[i]);
        }
      }
    }
  }
};

/**
 * 在指定半徑內找出第一個符合 predicate 的 index。
 * 找到後立即返回（early-exit）。沒找到返回 -1。
 */
export const findInHashRadius = (
  hash: SpatialHash,
  x: number,
  y: number,
  radius: number,
  predicate: (idx: number) => boolean
): number => {
  const cellRadius = Math.ceil(radius / CELL_SIZE);
  const cx = Math.floor(x / CELL_SIZE);
  const cy = Math.floor(y / CELL_SIZE);

  for (let dx = -cellRadius; dx <= cellRadius; dx++) {
    for (let dy = -cellRadius; dy <= cellRadius; dy++) {
      const key = (cx + dx) * HASH_MULT + (cy + dy);
      const list = hash.get(key);
      if (list !== undefined) {
        for (let i = 0; i < list.length; i++) {
          if (predicate(list[i])) return list[i];
        }
      }
    }
  }
  return -1;
};

/**
 * 檢查指定半徑內是否「至少存在一個」符合 predicate 的元素。
 * 早期退出，O(1) 最佳情境。
 */
export const anyInHashRadius = (
  hash: SpatialHash,
  x: number,
  y: number,
  radius: number,
  predicate: (idx: number) => boolean
): boolean => {
  return findInHashRadius(hash, x, y, radius, predicate) !== -1;
};
