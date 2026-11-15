import { describe, expect, it } from 'vitest';
import {
  resolveCanvasShakeIntensity,
  visibleDamageTexts,
} from '@/data/hudVisualVisibility';

describe('2D HUD visual settings', () => {
  it('hides damage texts and canvas shake when the matching setting is off', () => {
    expect(visibleDamageTexts([{ id: 1 }], false)).toEqual([]);
    expect(visibleDamageTexts([{ id: 1 }], true)).toEqual([{ id: 1 }]);
    expect(resolveCanvasShakeIntensity(8, false)).toBe(0);
    expect(resolveCanvasShakeIntensity(8, true)).toBe(8);
    expect(resolveCanvasShakeIntensity(0, true)).toBe(0);
  });
});
