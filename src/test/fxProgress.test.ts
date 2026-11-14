/**
 * 特效進度純函式測試：2D 與 3D 播同一段死亡/技能動畫必須得到同一個進度。
 */
import { describe, it, expect } from 'vitest';
import { fxFade, fxProgress } from '@/data/fxProgress';

describe('fxProgress', () => {
  it('中段回傳介於 0 與 1 的比例', () => {
    expect(fxProgress(1000, 400, 1100)).toBeCloseTo(0.25);
  });

  it('起點前夾到 0、結束後夾到 1', () => {
    expect(fxProgress(1000, 400, 900)).toBe(0);
    expect(fxProgress(1000, 400, 1400)).toBe(1);
    expect(fxProgress(1000, 400, 9999)).toBe(1);
  });

  it('duration 為 0 或負數視為已完成（避免除以零）', () => {
    expect(fxProgress(0, 0, 10)).toBe(1);
    expect(fxProgress(0, -5, 10)).toBe(1);
  });

  it('fxFade 是進度的補數', () => {
    expect(fxFade(0, 1000, 0)).toBe(1);
    expect(fxFade(0, 1000, 500)).toBeCloseTo(0.5);
    expect(fxFade(0, 1000, 1000)).toBe(0);
  });
});
