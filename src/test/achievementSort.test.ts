import { describe, expect, it } from 'vitest';
import { ALL_ACHIEVEMENTS } from '@/data/achievementData';
import { compareAchievements, sortAchievements } from '@/data/achievementSort';
import type { Achievement } from '@/types/achievement';

describe('成就穩定排序', () => {
  it('排序結果與輸入順序無關（換 import 順序、換平台都不會跳位）', () => {
    const forward = sortAchievements(ALL_ACHIEVEMENTS).map((a) => a.id);
    const backward = sortAchievements([...ALL_ACHIEVEMENTS].reverse()).map((a) => a.id);
    expect(backward).toEqual(forward);
  });

  it('不改動來源陣列', () => {
    const before = ALL_ACHIEVEMENTS.map((a) => a.id);
    sortAchievements(ALL_ACHIEVEMENTS);
    expect(ALL_ACHIEVEMENTS.map((a) => a.id)).toEqual(before);
  });

  it('order 相同的成就不會互相插隊（同 order 內以分類、id 決定）', () => {
    const sorted = sortAchievements(ALL_ACHIEVEMENTS);

    // 找出第一組 order 相同、但分類/id 不同的相鄰項
    let checked = 0;
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const cur = sorted[i];
      if ((prev.order ?? 0) !== (cur.order ?? 0)) continue;
      expect(prev.category.localeCompare(cur.category, 'en')).toBeLessThanOrEqual(0);
      if (prev.category === cur.category) {
        expect(prev.id.localeCompare(cur.id, 'en')).toBeLessThan(0);
      }
      checked++;
    }

    // 資料本身有大量 order 碰撞（682 個成就只有 439 個不同 order），這裡一定跑得到
    expect(checked).toBeGreaterThan(0);
  });

  it('比較器是同一個等價關係（a<b 則 b>a，且 a==a）', () => {
    const [a, b]: Achievement[] = [ALL_ACHIEVEMENTS[0], ALL_ACHIEVEMENTS[1]];
    expect(compareAchievements(a, a)).toBe(0);
    expect(Math.sign(compareAchievements(a, b))).toBe(-Math.sign(compareAchievements(b, a)));
  });
});
