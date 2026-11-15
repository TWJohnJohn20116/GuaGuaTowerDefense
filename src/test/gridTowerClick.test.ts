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
