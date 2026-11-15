import { describe, expect, it } from 'vitest';
import { GAME_SPEED_BAR_CLASS } from '@/components/game/sidebar/hudStyle';

describe('game speed HUD', () => {
  it('keeps speed buttons visible at every breakpoint', () => {
    expect(GAME_SPEED_BAR_CLASS).toMatch(/\bflex\b/);
    expect(GAME_SPEED_BAR_CLASS).not.toMatch(/\bhidden\b/);
  });
});
