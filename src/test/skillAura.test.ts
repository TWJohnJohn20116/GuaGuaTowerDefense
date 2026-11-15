import { describe, expect, it } from 'vitest';
import { SKILL_DATA } from '@/data/skillData';
import { applySkillAuraToEnemies, getSkillAuraSpec, tickTowerSkills } from '@/data/skillAura';
import type { Tower } from '@/types/game';
import { makeEnemy, makeSkill, makeTower } from './fixtures';

const enemy = (id: string, x: number, y: number) =>
  makeEnemy({ id, x, y, health: 80, maxHealth: 80 });

function tower(skillId: 'toxic_cloud' | 'inferno', active: boolean, until = 9_000): Tower {
  return makeTower({
    id: 'tower-1',
    type: skillId === 'inferno' ? 'flame' : 'poison',
    pos: { x: 4, y: 4 },
    skill: makeSkill({ skillId, lastUsedTime: 1_000, isActive: active, activeUntil: until }),
  });
}

describe('toxic cloud and inferno auras', () => {
  it('defines poison and burn zones from the skill tables', () => {
    const cloud = getSkillAuraSpec('toxic_cloud');
    const inferno = getSkillAuraSpec('inferno');
    expect(cloud?.kind).toBe('poison');
    expect(cloud?.damagePerSecond).toBe(SKILL_DATA.toxic_cloud.damage);
    expect(inferno?.kind).toBe('burn');
    expect(inferno?.damagePerSecond).toBe(SKILL_DATA.inferno.damage);
    expect(getSkillAuraSpec('overcharge')).toBeNull();
  });

  it('applies poison to enemies standing in the toxic cloud', () => {
    const now = 2_000;
    const inside = enemy('in', 5, 4);
    const outside = enemy('out', 20, 20);
    const next = applySkillAuraToEnemies(
      [inside, outside],
      { col: 4, row: 4 },
      'toxic_cloud',
      now,
      4_000,
    );
    expect(next.changed).toBe(true);
    expect(next.enemies[0].effects).toEqual([
      expect.objectContaining({ type: 'poison', value: SKILL_DATA.toxic_cloud.damage, startTime: now }),
    ]);
    expect(next.enemies[1].effects).toEqual([]);
  });

  it('applies burn to enemies standing in inferno', () => {
    const now = 3_000;
    const inside = enemy('in', 4, 5);
    const next = applySkillAuraToEnemies(
      [inside],
      { col: 4, row: 4 },
      'inferno',
      now,
      3_000,
    );
    expect(next.enemies[0].effects[0]).toMatchObject({
      type: 'burn',
      value: SKILL_DATA.inferno.damage,
      startTime: now,
    });
  });

  it('ticks active auras and expires them when time is up', () => {
    const now = 5_000;
    const target = enemy('in', 4, 4);
    const active = tickTowerSkills([tower('toxic_cloud', true, 9_000)], [target], now);
    expect(active.enemies[0].effects.some((e) => e.type === 'poison')).toBe(true);
    expect(active.towers[0].skill?.isActive).toBe(true);

    const expired = tickTowerSkills([tower('inferno', true, 4_000)], [target], now);
    expect(expired.towers[0].skill?.isActive).toBe(false);
    expect(expired.enemies[0].effects.some((e) => e.type === 'burn')).toBe(false);
  });
});
