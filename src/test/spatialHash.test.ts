/**
 * 空間哈希表 (Spatial Hash) 測試
 *
 * 測試空間哈希表的建立、插入、範圍查詢正確性
 * 這是遊戲效能關鍵路徑的核心資料結構
 */

import { describe, it, expect } from 'vitest';
import {
  createSpatialHash,
  insertIntoHash,
  buildSpatialHash,
  forEachInHashRadius,
  findInHashRadius,
} from '@/utils/spatialHash';

describe('createSpatialHash', () => {
  it('should create an empty Map', () => {
    const hash = createSpatialHash();
    expect(hash).toBeInstanceOf(Map);
    expect(hash.size).toBe(0);
  });
});

describe('insertIntoHash', () => {
  it('should insert an index into the hash', () => {
    const hash = createSpatialHash();
    insertIntoHash(hash, 0, 3, 5);
    expect(hash.size).toBeGreaterThan(0);
  });

  it('should group items in the same cell', () => {
    const hash = createSpatialHash();
    insertIntoHash(hash, 0, 3.1, 5.1);
    insertIntoHash(hash, 1, 3.2, 5.2);
    // 這兩點應該在同一個 cell (CELL_SIZE = 2)
    const allIndices = Array.from(hash.values()).flat();
    expect(allIndices).toContain(0);
    expect(allIndices).toContain(1);
  });
});

describe('buildSpatialHash', () => {
  it('should build hash from an array of items with x/y', () => {
    const items = [
      { x: 1, y: 2, id: 'a' },
      { x: 3, y: 4, id: 'b' },
      { x: 5, y: 6, id: 'c' },
    ];
    const hash = buildSpatialHash(items);
    // 所有 index 應該都在 hash 中
    const allIndices = Array.from(hash.values()).flat().sort();
    expect(allIndices).toEqual([0, 1, 2]);
  });

  it('should handle empty array', () => {
    const hash = buildSpatialHash([]);
    expect(hash.size).toBe(0);
  });
});

describe('forEachInHashRadius', () => {
  it('should find items within radius', () => {
    const items = [
      { x: 5, y: 5, id: 'center' },
      { x: 6, y: 5, id: 'near' },
      { x: 10, y: 10, id: 'far' },
    ];
    const hash = buildSpatialHash(items);
    const found: number[] = [];
    forEachInHashRadius(hash, 5, 5, 3, (idx) => {
      const item = items[idx];
      const dx = item.x - 5;
      const dy = item.y - 5;
      if (dx * dx + dy * dy <= 3 * 3) {
        found.push(idx);
      }
    });
    // center (0) and near (1) should be found, far (2) should not
    expect(found).toContain(0);
    expect(found).toContain(1);
    expect(found).not.toContain(2);
  });

  it('should not find items outside radius', () => {
    const items = [
      { x: 5, y: 5, id: 'center' },
      { x: 10, y: 10, id: 'far' },
    ];
    const hash = buildSpatialHash(items);
    const found: number[] = [];
    forEachInHashRadius(hash, 5, 5, 1, (idx) => {
      const item = items[idx];
      const dx = item.x - 5;
      const dy = item.y - 5;
      if (dx * dx + dy * dy <= 1 * 1) {
        found.push(idx);
      }
    });
    // far is ~7.07 units away, so only center should be found
    expect(found).toEqual([0]);
  });
});

describe('findInHashRadius', () => {
  it('should return the first matching index', () => {
    const items = [
      { x: 5, y: 5, id: 'center' },
      { x: 6, y: 5, id: 'near' },
    ];
    const hash = buildSpatialHash(items);
    const result = findInHashRadius(hash, 5, 5, 3, (idx) => {
      const item = items[idx];
      const dx = item.x - 5;
      const dy = item.y - 5;
      return dx * dx + dy * dy <= 3 * 3;
    });
    expect(result).not.toBe(-1);
    expect(items[result].id).toBe('center');
  });

  it('should return -1 when no match found', () => {
    const items = [
      { x: 10, y: 10, id: 'far' },
    ];
    const hash = buildSpatialHash(items);
    const result = findInHashRadius(hash, 1, 1, 1, () => true);
    expect(result).toBe(-1);
  });
});