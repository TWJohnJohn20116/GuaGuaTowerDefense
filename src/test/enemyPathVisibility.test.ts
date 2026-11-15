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
});
