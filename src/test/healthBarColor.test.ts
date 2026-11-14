/**
 * 血條顏色測試：2D 與 3D 共用同一組門檻（先前 2D 用 0.5、3D 用 0.55）。
 */
import { describe, it, expect } from 'vitest';
import { healthBarColorCss, healthBarColorHex } from '@/data/healthBarColor';

describe('healthBarColor', () => {
  it('三個級距的顏色在 2D 與 3D 表示法一致', () => {
    expect(healthBarColorHex(0.9)).toBe(0x4ade80);
    expect(healthBarColorCss(0.9)).toBe('#4ade80');

    expect(healthBarColorHex(0.4)).toBe(0xfacc15);
    expect(healthBarColorCss(0.4)).toBe('#facc15');

    expect(healthBarColorHex(0.1)).toBe(0xef4444);
    expect(healthBarColorCss(0.1)).toBe('#ef4444');
  });

  it('門檻邊界：0.5 與 0.25 屬於下一級', () => {
    expect(healthBarColorHex(0.5)).toBe(0xfacc15);
    expect(healthBarColorHex(0.25)).toBe(0xef4444);
    expect(healthBarColorHex(0.51)).toBe(0x4ade80);
    expect(healthBarColorHex(0.26)).toBe(0xfacc15);
  });
});
