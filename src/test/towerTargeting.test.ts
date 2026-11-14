import { describe, it, expect } from 'vitest';
import {
  defaultTargetPriority,
  getThreatScore,
  pickTowerTarget,
  type TargetCandidate,
} from '@/data/towerTargeting';

const LOOKUP = {
  normal: { ability: undefined },
  jammer: { ability: 'jam' },
  healer: { ability: 'healing' },
  bomber: { ability: 'explode' },
  saboteur: { ability: 'sabotage' },
  spawner: { ability: 'spawning' },
  escort: { ability: 'escort' },
};

function enemy(partial: Partial<TargetCandidate> & Pick<TargetCandidate, 'id' | 'type'>): TargetCandidate {
  return {
    x: 1,
    y: 1,
    health: 80,
    maxHealth: 80,
    speed: 1,
    pathIndex: 0,
    progress: 0.2,
    effects: [],
    ...partial,
  };
}

describe('tower targeting', () => {
  it('returns null when nobody is in range', () => {
    expect(pickTowerTarget([], 'first', 0, 0, LOOKUP, 0)).toBeNull();
  });

  it('picks the enemy closest to the exit with first priority', () => {
    const first = enemy({ id: 'a', type: 'normal', pathIndex: 2, progress: 0.1 });
    const closer = enemy({ id: 'b', type: 'normal', pathIndex: 2, progress: 0.9 });
    expect(pickTowerTarget([first, closer], 'first', 0, 0, LOOKUP, 0)?.id).toBe('b');
  });

  it('picks the strongest by current health', () => {
    const weak = enemy({ id: 'a', type: 'normal', health: 20, maxHealth: 100 });
    const tank = enemy({ id: 'b', type: 'normal', health: 90, maxHealth: 100 });
    expect(pickTowerTarget([weak, tank], 'strongest', 0, 0, LOOKUP, 0)?.id).toBe('b');
  });

  it('ranks support threats above fodder', () => {
    expect(getThreatScore('jam', LOOKUP.jammer)).toBeGreaterThan(getThreatScore(undefined, LOOKUP.normal));
    expect(getThreatScore('jam', LOOKUP.jammer)).toBeGreaterThan(getThreatScore('healing', LOOKUP.healer));
    expect(getThreatScore('healing', LOOKUP.healer)).toBeGreaterThan(getThreatScore('explode', LOOKUP.bomber));
  });

  it('threat priority locks a jammer before a closer normal', () => {
    const fodder = enemy({ id: 'mob', type: 'normal', pathIndex: 4, progress: 0.9 });
    const jammer = enemy({ id: 'jam', type: 'jammer', pathIndex: 1, progress: 0.1 });
    expect(pickTowerTarget([fodder, jammer], 'threat', 0, 0, LOOKUP, 0)?.id).toBe('jam');
  });

  it('prefers a marked enemy over the first-priority candidate', () => {
    const now = 10_000;
    const front = enemy({ id: 'front', type: 'normal', pathIndex: 5, progress: 0.8 });
    const marked = enemy({
      id: 'mark',
      type: 'normal',
      pathIndex: 1,
      progress: 0.1,
      effects: [{ type: 'marked', duration: 2000, startTime: 9000 }],
    });
    expect(pickTowerTarget([front, marked], 'first', 0, 0, LOOKUP, now)?.id).toBe('mark');
  });

  it('ignores expired marks', () => {
    const now = 12_000;
    const front = enemy({ id: 'front', type: 'normal', pathIndex: 5, progress: 0.8 });
    const marked = enemy({
      id: 'mark',
      type: 'normal',
      pathIndex: 1,
      progress: 0.1,
      effects: [{ type: 'marked', duration: 2000, startTime: 9000 }],
    });
    expect(pickTowerTarget([front, marked], 'first', 0, 0, LOOKUP, now)?.id).toBe('front');
  });

  it('defaults sniper and frost to threat targeting', () => {
    expect(defaultTargetPriority('sniper')).toBe('threat');
    expect(defaultTargetPriority('frost')).toBe('threat');
    expect(defaultTargetPriority('basic')).toBe('first');
  });
});
