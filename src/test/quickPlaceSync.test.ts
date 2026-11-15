import { describe, expect, it } from 'vitest';
import { shouldApplyQuickPlaceDefaultSync } from '@/data/quickPlaceSync';

describe('quick place default vs live Q toggle', () => {
  it('does not apply the default on first scene enter', () => {
    expect(shouldApplyQuickPlaceDefaultSync({
      previousDefault: null,
      nextDefault: true,
    })).toBe(false);
  });

  it('applies only when the persisted default actually changes', () => {
    expect(shouldApplyQuickPlaceDefaultSync({
      previousDefault: false,
      nextDefault: true,
    })).toBe(true);
    expect(shouldApplyQuickPlaceDefaultSync({
      previousDefault: true,
      nextDefault: true,
    })).toBe(false);
  });
});
