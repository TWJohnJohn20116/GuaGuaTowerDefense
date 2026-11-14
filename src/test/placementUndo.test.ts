import { describe, it, expect } from 'vitest';
import { canRedoPlacement, canUndoPlacement } from '@/store/placementHistory';

describe('placement undo/redo availability', () => {
  it('allows undoing the first placed tower', () => {
    expect(canUndoPlacement(-1)).toBe(false);
    expect(canUndoPlacement(0)).toBe(true);
    expect(canUndoPlacement(1)).toBe(true);
  });

  it('allows redo only after an undo', () => {
    expect(canRedoPlacement(0, 1)).toBe(false);
    expect(canRedoPlacement(-1, 1)).toBe(true);
    expect(canRedoPlacement(0, 2)).toBe(true);
  });
});
