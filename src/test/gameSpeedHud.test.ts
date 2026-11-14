import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { GAME_SPEED_BAR_CLASS } from '@/components/game/sidebar/hudStyle';

describe('game speed HUD', () => {
  it('keeps speed buttons visible at every breakpoint', () => {
    expect(GAME_SPEED_BAR_CLASS).toMatch(/\bflex\b/);
    expect(GAME_SPEED_BAR_CLASS).not.toMatch(/\bhidden\b/);
  });

  it('uses the always-visible speed bar class in the bottom controls', () => {
    const src = readFileSync(resolve(__dirname, '../components/game/sidebar/BottomControls.tsx'), 'utf8');
    expect(src).toMatch(/GAME_SPEED_BAR_CLASS/);
    expect(src).not.toMatch(/hidden sm:flex gap-1/);
  });
});
