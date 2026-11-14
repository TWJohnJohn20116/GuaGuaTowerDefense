import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  resolveGridTowerClick,
  resolveMarqueeAsClick,
} from '@/data/gridTowerClick';

describe('grid tower click', () => {
  it('toggles multi-select with shift or ctrl, and selects all of a type on double-click', () => {
    expect(resolveGridTowerClick({ hasTower: true, modifierSelect: true, doubleClick: false, canPlace: false })).toBe('toggle_multi');
    expect(resolveGridTowerClick({ hasTower: true, modifierSelect: false, doubleClick: true, canPlace: false })).toBe('select_type');
    expect(resolveGridTowerClick({ hasTower: true, modifierSelect: false, doubleClick: false, canPlace: false })).toBe('select');
  });

  it('places on empty buildable tiles and otherwise clears selection', () => {
    expect(resolveGridTowerClick({ hasTower: false, modifierSelect: false, doubleClick: false, canPlace: true })).toBe('place');
    expect(resolveGridTowerClick({ hasTower: false, modifierSelect: false, doubleClick: false, canPlace: false })).toBe('clear');
  });

  it('treats a tiny ctrl-drag as a click instead of a failed box select', () => {
    expect(resolveMarqueeAsClick(0)).toBe(true);
    expect(resolveMarqueeAsClick(63)).toBe(true);
    expect(resolveMarqueeAsClick(64)).toBe(false);
  });
});

describe('grid tower click wiring', () => {
  it('uses the shared click resolver on the 2D canvas and 3D interaction', () => {
    const canvas = readFileSync(
      resolve(__dirname, '../components/scenes/game-scene/GameCanvas.tsx'),
      'utf8',
    );
    const interaction = readFileSync(
      resolve(__dirname, '../components/scenes/game-scene/three/interaction3d.ts'),
      'utf8',
    );
    expect(canvas).toMatch(/resolveGridTowerClick/);
    expect(interaction).toMatch(/resolveGridTowerClick/);
    expect(interaction).toMatch(/resolveMarqueeAsClick/);
    expect(interaction).toMatch(/toggleTowerInMultiSelect/);
    expect(interaction).toMatch(/selectAllTowersOfType/);
  });
});
