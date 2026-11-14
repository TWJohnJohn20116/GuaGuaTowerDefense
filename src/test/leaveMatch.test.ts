import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveLeaveMatchFromHud } from '@/data/leaveMatch';

describe('HUD leave match', () => {
  it('blocks leaving during tutorial and otherwise resets the match', () => {
    expect(resolveLeaveMatchFromHud({ tutorialActive: true })).toBe('blocked');
    expect(resolveLeaveMatchFromHud({ tutorialActive: false })).toBe('reset_match');
  });

  it('wires the HUD exit button to resetGame instead of only switching scene', () => {
    const src = readFileSync(
      resolve(__dirname, '../components/game/sidebar/BottomControls.tsx'),
      'utf8',
    );
    expect(src).toMatch(/resolveLeaveMatchFromHud/);
    expect(src).toMatch(/resetGame/);
    expect(src).not.toMatch(/onClick=\{\(\) => !tutorialActive && setScene\('mainMenu'\)\}/);
  });
});
