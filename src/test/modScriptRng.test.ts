import { describe, expect, it } from 'vitest';
import { createScriptRng, hashString } from '@/mod-script/rng';

describe('mod script rng', () => {
  it('同一個 seed 產生同一串數字', () => {
    const a = createScriptRng(1234);
    const b = createScriptRng(1234);
    const seqA = [a.next(), a.next(), a.next(), a.next()];
    const seqB = [b.next(), b.next(), b.next(), b.next()];
    expect(seqA).toEqual(seqB);
  });

  it('不同 seed 產生不同序列', () => {
    const a = createScriptRng(1).next();
    const b = createScriptRng(2).next();
    expect(a).not.toBe(b);
  });

  it('int 落在我給的範圍內且包含端點', () => {
    const rng = createScriptRng(7);
    for (let i = 0; i < 200; i += 1) {
      const value = rng.int(3, 5);
      expect(value).toBeGreaterThanOrEqual(3);
      expect(value).toBeLessThanOrEqual(5);
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  it('pick 對空陣列回傳 null，對單元素陣列回傳該元素', () => {
    const rng = createScriptRng(9);
    expect(rng.pick([])).toBeNull();
    expect(rng.pick(['only'])).toBe('only');
  });

  it('hashString 對相同輸入穩定、對不同輸入不同', () => {
    expect(hashString('mod_a')).toBe(hashString('mod_a'));
    expect(hashString('mod_a')).not.toBe(hashString('mod_b'));
  });
});
