import { describe, expect, it } from 'vitest';
import { resolveLeaveMatchFromHud } from '@/data/leaveMatch';

describe('HUD leave match', () => {
  it('blocks leaving during tutorial and otherwise resets the match', () => {
    expect(resolveLeaveMatchFromHud({ tutorialActive: true })).toBe('blocked');
    expect(resolveLeaveMatchFromHud({ tutorialActive: false })).toBe('reset_match');
  });
});
