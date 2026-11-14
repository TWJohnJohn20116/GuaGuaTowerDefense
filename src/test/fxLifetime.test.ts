/**
 * 特效生命週期契約測試
 *
 * 這個模組的價值有一半在「回傳的是哪一個陣列」上，所以測試不只看內容，也看 identity：
 *  1. 沒有過期 → 必須回傳同一參照（`toBe`），這是呼叫端能用 `===` 省掉 setState 的唯一依據；
 *     一旦這裡退化成「每次都回新陣列」，特效存活期間會每幀寫 store，但畫面看起來完全正常，
 *     屬於沒有測試就抓不到的效能退化。
 *  2. 有過期 → 只留存活、順序不變，而且原陣列不被改動（store 的狀態不可被清理器就地改寫）。
 *  3. 邊界：`elapsed === duration` 算過期、`duration - 1` 仍保留（兩份舊實作一個用 `<`、一個用 `>= 1`，
 *     這條測試把語意釘成唯一一種）。
 *  4. 三個專用清理器各自的時長（升級 1500 / 出售 600 / 融合 1400）與 `FX_DURATIONS` 一致。
 *
 * 時間一律由測試注入 `now`，不碰 `Date.now()`，所以邊界是確定性的。
 */

import { describe, it, expect } from 'vitest';
import {
  FX_DURATIONS,
  pruneExpired,
  pruneFusionAnimations,
  pruneSellAnimations,
  pruneUpgradeAnimations,
} from '@/data/fxLifetime';

/** 最小 fixture：只帶清理器實際需要的欄位（`T extends { startTime: number }` 的用意） */
interface FxStub {
  id: string;
  startTime: number;
}

const makeFx = (id: string, startTime: number): FxStub => ({ id, startTime });

describe('FX_DURATIONS', () => {
  it('三種特效時長與 2D / 3D 目前的實作值一致', () => {
    expect(FX_DURATIONS.upgrade).toBe(1500);
    expect(FX_DURATIONS.sell).toBe(600);
    expect(FX_DURATIONS.fusion).toBe(1400);
  });
});

describe('pruneExpired 泛型清理', () => {
  it('全部存活時回傳同一參照（呼叫端可用 === 判斷不用 setState）', () => {
    const items = [makeFx('a', 1000), makeFx('b', 1200), makeFx('c', 1400)];

    const result = pruneExpired(items, () => false);

    expect(result).toBe(items);
  });

  it('有項目過期時只保留存活項目，且順序不變', () => {
    const items = [makeFx('keep-1', 0), makeFx('drop-1', 0), makeFx('keep-2', 0), makeFx('drop-2', 0)];
    const expiredIds = new Set(['drop-1', 'drop-2']);

    const result = pruneExpired(items, (item) => expiredIds.has(item.id));

    expect(result).not.toBe(items);
    expect(result.map((item) => item.id)).toEqual(['keep-1', 'keep-2']);
  });

  it('清掉領頭與尾端項目時前後都不留空洞', () => {
    const items = [makeFx('drop-head', 0), makeFx('keep', 0), makeFx('drop-tail', 0)];

    const result = pruneExpired(items, (item) => item.id.startsWith('drop'));

    expect(result.map((item) => item.id)).toEqual(['keep']);
  });

  it('不改動來源陣列（清理器不碰 store 狀態）', () => {
    const items = [makeFx('a', 0), makeFx('b', 0), makeFx('c', 0)];

    pruneExpired(items, (item) => item.id === 'b');

    expect(items.map((item) => item.id)).toEqual(['a', 'b', 'c']);
  });

  it('空陣列回傳同一參照，不產生新陣列', () => {
    const empty: FxStub[] = [];

    expect(pruneExpired(empty, () => true)).toBe(empty);
  });

  it('自訂判斷式可運作（不限於時間判斷）', () => {
    const values = [3, 8, 12, 1];

    const result = pruneExpired(values, (value) => value >= 10);

    expect(result).toEqual([3, 8, 1]);
    expect(values).toEqual([3, 8, 12, 1]);
  });
});

describe('專用清理器的時長', () => {
  it('升級動畫存活 1500ms', () => {
    const items = [makeFx('u', 1000)];

    expect(pruneUpgradeAnimations(items, 1000 + 1499)).toBe(items);
    expect(pruneUpgradeAnimations(items, 1000 + 1500)).toEqual([]);
  });

  it('出售動畫存活 600ms', () => {
    const items = [makeFx('s', 1000)];

    expect(pruneSellAnimations(items, 1000 + 599)).toBe(items);
    expect(pruneSellAnimations(items, 1000 + 600)).toEqual([]);
  });

  it('融合動畫存活 1400ms', () => {
    const items = [makeFx('f', 1000)];

    expect(pruneFusionAnimations(items, 1000 + 1399)).toBe(items);
    expect(pruneFusionAnimations(items, 1000 + 1400)).toEqual([]);
  });

  it('邊界：elapsed === duration 視為過期，duration - 1 仍保留', () => {
    const items = [makeFx('edge', 0)];

    expect(pruneUpgradeAnimations(items, FX_DURATIONS.upgrade - 1)).toBe(items);
    expect(pruneUpgradeAnimations(items, FX_DURATIONS.upgrade)).toEqual([]);
  });

  it('三者對同一份混合清單各自依自己的時長過濾', () => {
    const now = 5000;
    const items = [makeFx('new', 4900), makeFx('mid', 4000), makeFx('old', 3000)];

    // elapsed：100 / 1000 / 2000
    expect(pruneUpgradeAnimations(items, now).map((item) => item.id)).toEqual(['new', 'mid']);
    expect(pruneSellAnimations(items, now).map((item) => item.id)).toEqual(['new']);
    expect(pruneFusionAnimations(items, now).map((item) => item.id)).toEqual(['new', 'mid']);
  });

  it('吃 store 形狀的完整動畫物件（多餘欄位不影響，不需轉型）', () => {
    const items = [
      {
        id: 'anim-1',
        towerId: 'tower-1',
        gridPos: { col: 2, row: 3 },
        newLevel: 4,
        towerColor: '#ffcc00',
        startTime: 0,
      },
    ];

    expect(pruneUpgradeAnimations(items, FX_DURATIONS.upgrade - 1)).toBe(items);
    expect(pruneUpgradeAnimations(items, FX_DURATIONS.upgrade)).toEqual([]);
  });
});
