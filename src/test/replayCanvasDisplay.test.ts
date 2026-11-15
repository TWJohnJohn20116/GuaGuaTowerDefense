import { describe, expect, it } from 'vitest';
import { shouldDrawReplayEnemyHealthBar } from '@/data/replayCanvasDisplay';

describe('replay canvas display settings', () => {
  it('hides enemy health bars when the setting is off or the enemy is full', () => {
    expect(shouldDrawReplayEnemyHealthBar({ hpRatio: 0.4, showHealthBars: true })).toBe(true);
    expect(shouldDrawReplayEnemyHealthBar({ hpRatio: 1, showHealthBars: true })).toBe(false);
    expect(shouldDrawReplayEnemyHealthBar({ hpRatio: 0.4, showHealthBars: false })).toBe(false);
  });
});
