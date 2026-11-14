import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { shouldShowTowerRangeRing } from '@/data/towerRangeVisibility';

describe('tower range visibility', () => {
  it('hides range rings when the setting is off, even if the tower has range', () => {
    expect(shouldShowTowerRangeRing(false, 3)).toBe(false);
    expect(shouldShowTowerRangeRing(true, 3)).toBe(true);
    expect(shouldShowTowerRangeRing(true, 0)).toBe(false);
  });

  it('wires the helper into 3D interaction range rings', () => {
    const src = readFileSync(
      resolve(__dirname, '../components/scenes/game-scene/three/interaction3d.ts'),
      'utf8',
    );
    expect(src).toMatch(/shouldShowTowerRangeRing/);
    expect(src).toMatch(/showTowerRange/);
  });
});
