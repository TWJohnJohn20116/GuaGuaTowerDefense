import { describe, expect, it } from 'vitest';
import { computeSnap, EQUAL_GAP_TOLERANCE, GRID_STEP, type SnapBox } from '@/workshop/graph/snap';

const box = (nodeId: string, x: number, y: number, width = 180, height = 90): SnapBox => ({ nodeId, x, y, width, height });
const moving = (...ids: string[]) => new Set(ids);

describe('graph snap', () => {
  it('沒有鄰居時吸格線', () => {
    const result = computeSnap({
      primaryId: 'a',
      movingIds: moving('a'),
      rawDx: 23,
      rawDy: 17,
      boxes: [box('a', 80, 80)],
    });
    expect(result.dx).toBe(20); // 80+23=103 → 100
    expect(result.dy).toBe(20); // 80+17=97 → 100
    expect(result.guides).toBeNull();
  });

  it('靠近另一節點的左緣時對齊並回報輔助線', () => {
    const result = computeSnap({
      primaryId: 'a',
      movingIds: moving('a'),
      rawDx: 196,
      rawDy: 0,
      boxes: [box('a', 0, 0), box('b', 200, 0)],
    });
    expect(result.dx).toBe(200); // 196 → 對齊 b.x = 200
    expect(result.guides?.x).toEqual([200]);
  });

  it('左右間距差在容差內時夾成等距', () => {
    // 左節點右緣 180；中間節點候選 x=300（左距 120）；右節點 x=600（右距 120）
    // 拖 +4 讓左距 124、右距 116，差 8 ≤ 14 → 應夾回 120/120
    const boxes = [box('l', 0, 0), box('m', 296, 0), box('r', 600, 0)];
    const result = computeSnap({
      primaryId: 'm',
      movingIds: moving('m'),
      rawDx: 8,
      rawDy: 0,
      boxes,
    });
    expect(result.dx).toBe(4); // 304 → 夾回 300（左右各 120）
    expect(result.guides?.spacing).toHaveLength(1);
    const spacing = result.guides?.spacing[0];
    expect(spacing?.axis).toBe('x');
    expect(spacing?.segments).toHaveLength(2);
  });

  it('間距差超過容差就不夾等距', () => {
    const boxes = [box('l', 0, 0), box('m', 296, 0), box('r', 600, 0)];
    const result = computeSnap({
      primaryId: 'm',
      movingIds: moving('m'),
      rawDx: 40,
      rawDy: 0,
      boxes,
    });
    expect(result.guides?.spacing ?? []).toHaveLength(0);
  });

  it('多選時只用主節點計算，其他移動節點不當對齊目標', () => {
    const boxes = [box('m', 300, 0), box('peer', 302, 0), box('other', 900, 0)];
    const result = computeSnap({
      primaryId: 'm',
      movingIds: moving('m', 'peer'),
      rawDx: 2,
      rawDy: 0,
      boxes,
    });
    expect(result.dx).toBe(0); // 302 與 300 只差 2 → 吸到格線 300（peer 不參與對齊）
  });

  it('容差與格線常數符合設計', () => {
    expect(GRID_STEP).toBe(10);
    expect(EQUAL_GAP_TOLERANCE).toBe(14);
  });
});
