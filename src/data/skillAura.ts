import type { Enemy, StatusEffect, Tower } from '@/types/game';
import { SKILL_DATA, getSkillRangeCells } from '@/data/skillData';

type SkillAuraKind = 'poison' | 'burn';

interface SkillAuraSpec {
  kind: SkillAuraKind;
  rangeCells: number;
  damagePerSecond: number;
}

const AURA_SOURCE_PREFIX = 'skill-aura:';

export function getSkillAuraSpec(skillId: string): SkillAuraSpec | null {
  if (skillId === 'toxic_cloud') {
    return {
      kind: 'poison',
      rangeCells: getSkillRangeCells(SKILL_DATA.toxic_cloud),
      damagePerSecond: SKILL_DATA.toxic_cloud.damage ?? 5,
    };
  }
  if (skillId === 'inferno') {
    return {
      kind: 'burn',
      rangeCells: getSkillRangeCells(SKILL_DATA.inferno),
      damagePerSecond: SKILL_DATA.inferno.damage ?? 15,
    };
  }
  return null;
}

function auraSource(skillId: string): string {
  return `${AURA_SOURCE_PREFIX}${skillId}`;
}

function upsertAuraEffect(
  effects: StatusEffect[],
  spec: SkillAuraSpec,
  skillId: string,
  now: number,
  duration: number,
): StatusEffect[] {
  const source = auraSource(skillId);
  const next: StatusEffect = {
    type: spec.kind,
    value: spec.damagePerSecond,
    duration,
    startTime: now,
    stacks: 1,
    source,
  };
  const index = effects.findIndex((ef) => ef.type === spec.kind && ef.source === source);
  if (index < 0) return [...effects, next];
  const copy = effects.slice();
  copy[index] = next;
  return copy;
}

export function applySkillAuraToEnemies(
  enemies: Enemy[],
  origin: { col: number; row: number },
  skillId: string,
  now: number,
  remainingMs: number,
): { enemies: Enemy[]; changed: boolean } {
  const spec = getSkillAuraSpec(skillId);
  if (!spec || remainingMs <= 0) return { enemies, changed: false };

  const rangeSq = spec.rangeCells * spec.rangeCells;
  let changed = false;
  const nextEnemies = enemies.map((enemy) => {
    if (enemy.health <= 0) return enemy;
    const dx = enemy.x - origin.col;
    const dy = enemy.y - origin.row;
    if (dx * dx + dy * dy > rangeSq) return enemy;
    const effects = upsertAuraEffect(enemy.effects, spec, skillId, now, remainingMs);
    if (effects === enemy.effects) return enemy;
    changed = true;
    return { ...enemy, effects };
  });

  return { enemies: changed ? nextEnemies : enemies, changed };
}

export function tickTowerSkills(
  towers: Tower[],
  enemies: Enemy[],
  now: number,
): { towers: Tower[]; enemies: Enemy[]; towersChanged: boolean; enemiesChanged: boolean } {
  let nextEnemies = enemies;
  let enemiesChanged = false;
  let towersChanged = false;

  const nextTowers = towers.map((tower) => {
    if (!tower.skill || !tower.skill.isActive) return tower;

    if (tower.skill.activeUntil !== -1 && now >= tower.skill.activeUntil) {
      towersChanged = true;
      return {
        ...tower,
        skill: {
          ...tower.skill,
          isActive: false,
        },
      };
    }

    const remaining = tower.skill.activeUntil === -1
      ? 1000
      : Math.max(tower.skill.activeUntil - now, 200);
    const applied = applySkillAuraToEnemies(
      nextEnemies,
      { col: tower.pos.x, row: tower.pos.y },
      tower.skill.skillId,
      now,
      remaining,
    );
    if (applied.changed) {
      nextEnemies = applied.enemies;
      enemiesChanged = true;
    }
    return tower;
  });

  return {
    towers: towersChanged ? nextTowers : towers,
    enemies: nextEnemies,
    towersChanged,
    enemiesChanged,
  };
}
