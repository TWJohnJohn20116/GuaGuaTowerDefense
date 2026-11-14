import { describe, it, expect } from 'vitest';
import { SKILL_DATA, getSkillRangeCells } from '@/data/skillData';
import { GAME_CONSTANTS } from '@/data/gameData';

describe('tower skill range in cells', () => {
  it('keeps freeze blast and repair local on the play grid', () => {
    const mapReach = Math.max(GAME_CONSTANTS.GRID_COLS, GAME_CONSTANTS.GRID_ROWS);
    expect(getSkillRangeCells(SKILL_DATA.freeze_blast)).toBe(4);
    expect(getSkillRangeCells(SKILL_DATA.repair)).toBe(5);
    expect(getSkillRangeCells(SKILL_DATA.freeze_blast)).toBeLessThan(mapReach);
    expect(getSkillRangeCells(SKILL_DATA.repair)).toBeLessThan(mapReach);
  });

  it('keeps plague burst in cells and converts leftover pixel ranges', () => {
    expect(getSkillRangeCells(SKILL_DATA.plague_burst)).toBe(4.5);
    expect(getSkillRangeCells(SKILL_DATA.tempest_blast)).toBeCloseTo(200 / 28);
  });
});
