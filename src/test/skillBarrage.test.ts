import { describe, it, expect } from 'vitest';
import { getSkillFireTargets } from '@/data/skillData';
import { makeEnemy } from './fixtures';
import type { TowerSkillState } from '@/types/game';

const enemy = (id: string) => makeEnemy({ id, x: 1, y: 1, health: 50, maxHealth: 50 });

describe('barrage fire targets', () => {
  const a = enemy('a');
  const b = enemy('b');
  const inRange = [a, b];

  it('fires at every enemy in range while barrage is active', () => {
    const skill: TowerSkillState = {
      skillId: 'barrage',
      lastUsedTime: 1,
      isActive: true,
      activeUntil: 9_999,
    };
    expect(getSkillFireTargets(skill, inRange, a).map((e) => e.id)).toEqual(['a', 'b']);
  });

  it('still fires at the primary target when barrage is off', () => {
    const skill: TowerSkillState = {
      skillId: 'barrage',
      lastUsedTime: 1,
      isActive: false,
      activeUntil: 0,
    };
    expect(getSkillFireTargets(skill, inRange, a).map((e) => e.id)).toEqual(['a']);
    expect(getSkillFireTargets(undefined, inRange, a).map((e) => e.id)).toEqual(['a']);
  });
});
