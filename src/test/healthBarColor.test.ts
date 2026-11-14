/**
 * 血條色票測試
 *
 * 這個純函式層的存在理由是「2D canvas 與 3D InstancedMesh 用同一組門檻」：
 * 以前 2D 用 0.5、3D 用 0.55，同一場戰鬥切換視圖時變色時機會不一樣。
 * 所以測試聚焦在兩件事：
 *  1. 2D 與 3D 兩支函式在每個門檻上必然選到同一個顏色
 *  2. 邊界值（剛好 0.5 / 剛好 0.25 / 0 / 1）的歸屬固定
 */

import { describe, it, expect } from 'vitest';
import { healthBarColorHex, healthBarColorCss } from '@/data/healthBarColor';

describe('血條色票', () => {
  it('2D 與 3D 在同一 ratio 上選到相同的顏色', () => {
    for (const ratio of [1, 0.75, 0.5, 0.4, 0.25, 0.1, 0]) {
      expect(healthBarColorCss(ratio)).toBe(
        '#' + healthBarColorHex(ratio).toString(16).padStart(6, '0'),
      );
    }
  });

  it('高於 0.5 是綠、0.25 到 0.5 是黃、其餘是紅', () => {
    expect(healthBarColorCss(0.51)).toBe('#4ade80');
    expect(healthBarColorCss(0.25)).toBe('#facc15');
    expect(healthBarColorCss(0.24)).toBe('#ef4444');
  });

  it('滿血與空血都有明確顏色，不會回傳空字串', () => {
    expect(healthBarColorCss(1)).toBe('#4ade80');
    expect(healthBarColorCss(0)).toBe('#ef4444');
  });
});
