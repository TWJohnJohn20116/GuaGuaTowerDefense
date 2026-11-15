import { describe, expect, it } from 'vitest';
import { resolveVictoryMedalIds } from '@/data/victoryMedals';

const base = {
  stars: 2,
  health: 8,
  startingHealth: 10,
  totalKills: 20,
  towerCount: 4,
  maxLevelReached: 2,
  totalDamage: 100,
};

describe('victory medals', () => {
  it('awards iron wall when remaining health is at least starting health, not a leftover 100 HP check', () => {
    expect(resolveVictoryMedalIds({ ...base, health: 10, startingHealth: 10 })).toContain('ironWall');
    expect(resolveVictoryMedalIds({ ...base, health: 12, startingHealth: 10 })).toContain('ironWall');
    expect(resolveVictoryMedalIds({ ...base, health: 9, startingHealth: 10 })).not.toContain('ironWall');
  });

  it('keeps the other medal thresholds', () => {
    expect(resolveVictoryMedalIds({ ...base, stars: 3 })).toContain('perfectDefense');
    expect(resolveVictoryMedalIds({ ...base, totalKills: 100 })).toContain('hunter');
    expect(resolveVictoryMedalIds({ ...base, towerCount: 10 })).toContain('architect');
    expect(resolveVictoryMedalIds({ ...base, maxLevelReached: 5 })).toContain('maxUpgrade');
    expect(resolveVictoryMedalIds({ ...base, totalDamage: 10000 })).toContain('destroyer');
    expect(resolveVictoryMedalIds(base)).toEqual([]);
  });
});
