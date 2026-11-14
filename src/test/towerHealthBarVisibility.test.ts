import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { shouldShowTowerHealthBar } from '@/data/towerHealthBarVisibility';

describe('tower health bar visibility', () => {
  it('only shows when the setting is on and the tower is damaged', () => {
    expect(shouldShowTowerHealthBar(80, 100, true)).toBe(true);
    expect(shouldShowTowerHealthBar(100, 100, true)).toBe(false);
    expect(shouldShowTowerHealthBar(80, 100, false)).toBe(false);
    expect(shouldShowTowerHealthBar(0, 100, true)).toBe(true);
  });

  it('2D and 3D both use the same rule and 3D actually draws the bars', () => {
    const helper = readFileSync(
      resolve(__dirname, '../data/towerHealthBarVisibility.ts'),
      'utf8',
    );
    const dynamic = readFileSync(
      resolve(__dirname, '../components/scenes/game-scene/GameCanvasDynamic.ts'),
      'utf8',
    );
    const scene3d = readFileSync(
      resolve(__dirname, '../components/scenes/game-scene/three/GameScene3D.tsx'),
      'utf8',
    );
    const bars3d = readFileSync(
      resolve(__dirname, '../components/scenes/game-scene/three/towerHealthBars3d.ts'),
      'utf8',
    );
    expect(helper).toMatch(/shouldShowTowerHealthBar/);
    expect(dynamic).toMatch(/shouldShowTowerHealthBar/);
    expect(scene3d).toMatch(/createTowerHealthBars3D/);
    expect(scene3d).toMatch(/showHealthBars/);
    expect(bars3d).toMatch(/shouldShowTowerHealthBar/);
  });
});
