import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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

  it('wires health bars, damage numbers, and shake into the 2D canvas', () => {
    const canvas = readFileSync(
      resolve(__dirname, '../components/scenes/game-scene/GameCanvas.tsx'),
      'utf8',
    );
    const dynamic = readFileSync(
      resolve(__dirname, '../components/scenes/game-scene/GameCanvasDynamic.ts'),
      'utf8',
    );
    expect(canvas).toMatch(/showHealthBars/);
    expect(canvas).toMatch(/showDamageNumbers/);
    expect(canvas).toMatch(/visibleDamageTexts/);
    expect(canvas).toMatch(/resolveCanvasShakeIntensity/);
    expect(dynamic).toMatch(/showHealthBars/);
  });
});
