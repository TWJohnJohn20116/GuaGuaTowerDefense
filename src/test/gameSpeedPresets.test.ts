import { describe, expect, it } from 'vitest';
import { GAME_SPEED_PRESETS, nextGameSpeed } from '@/data/gameSpeedPresets';

describe('game speed presets', () => {
  it('keeps HUD, pause, and Space on the same preset list', () => {
    expect([...GAME_SPEED_PRESETS]).toEqual([0.5, 1, 2, 3, 5]);
  });

  it('cycles Space through those presets, wrapping at the end', () => {
    expect(nextGameSpeed(0.5)).toBe(1);
    expect(nextGameSpeed(1)).toBe(2);
    expect(nextGameSpeed(5)).toBe(0.5);
  });

  it('snaps leftover speeds such as tutorial 10x onto the shared cycle', () => {
    expect(nextGameSpeed(10)).toBe(0.5);
    expect(nextGameSpeed(1.5)).toBe(2);
    expect(nextGameSpeed(0.75)).toBe(1);
  });
});
