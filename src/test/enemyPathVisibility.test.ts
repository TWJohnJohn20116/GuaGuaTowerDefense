import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveDisplayedTileType, shouldShowEnemyPathFx } from '@/data/enemyPathVisibility';

describe('3D enemy path visibility', () => {
  it('treats path tiles as empty floor when the setting is off', () => {
    expect(resolveDisplayedTileType('path', true)).toBe('path');
    expect(resolveDisplayedTileType('fork', true)).toBe('fork');
    expect(resolveDisplayedTileType('start', true)).toBe('start');
    expect(resolveDisplayedTileType('path', false)).toBe('empty');
    expect(resolveDisplayedTileType('fork', false)).toBe('empty');
    expect(resolveDisplayedTileType('start', false)).toBe('empty');
    expect(resolveDisplayedTileType('end', false)).toBe('empty');
    expect(resolveDisplayedTileType('empty', false)).toBe('empty');
    expect(resolveDisplayedTileType('blocked', false)).toBe('blocked');
    expect(shouldShowEnemyPathFx(true)).toBe(true);
    expect(shouldShowEnemyPathFx(false)).toBe(false);
  });

  it('wires the player setting into 3D tiles, flow dots, and path lines', () => {
    const scene3d = readFileSync(
      resolve(__dirname, '../components/scenes/game-scene/three/GameScene3D.tsx'),
      'utf8',
    );
    const env = readFileSync(
      resolve(__dirname, '../components/scenes/game-scene/three/environment3d.ts'),
      'utf8',
    );
    expect(scene3d).toMatch(/showEnemyPath/);
    expect(scene3d).toMatch(/resolveDisplayedTileType/);
    expect(scene3d).toMatch(/shouldShowEnemyPathFx/);
    expect(env).toMatch(/setPathFlowVisible/);
  });
});
