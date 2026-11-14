/**
 * 暫停戰況 · 敵人特性標籤工具
 */

import type { Enemy, EnemyData, EnemyType, StatusEffectType } from '@/types/game';
import { ENEMY_DATA } from '@/data/gameData';
import type { StringValuedKeys, Translations } from '@/i18n';

export interface EnemyTraitTag {
  text: string;
  tone: 'armor' | 'shield' | 'special' | 'mutator' | 'debuff';
}

const FIELD_EFFECT_KEYS: Partial<Record<StatusEffectType, StringValuedKeys<Translations['game']>>> = {
  slow: 'pauseFieldEffectSlow',
  poison: 'pauseFieldEffectPoison',
  burn: 'pauseFieldEffectBurn',
  freeze: 'pauseFieldEffectFreeze',
  stun: 'pauseFieldEffectStun',
  bleed: 'pauseFieldEffectBleed',
  weakness: 'pauseFieldEffectWeakness',
  root: 'pauseFieldEffectRoot',
};

/** 從敵人資料與實例組出威脅標籤 */
export function getEnemyTraitTags(
  type: EnemyType,
  sample: Enemy | undefined,
  t: Translations,
): EnemyTraitTag[] {
  const data = ENEMY_DATA[type as keyof typeof ENEMY_DATA];
  if (!data) return [];

  const g = t.game;
  const abilities = t.encyclopedia.abilities;
  const tags: EnemyTraitTag[] = [];

  if (data.ability) {
    const abilityKey = data.ability as keyof typeof abilities;
    tags.push({
      text: abilities[abilityKey] ?? data.ability,
      tone: 'special',
    });
  }
  if (data.armorValue != null && data.armorValue > 0) {
    tags.push({
      text: g.pauseTraitArmorPerHit.replace('{value}', String(data.armorValue)),
      tone: 'armor',
    });
  }
  if (sample?.armorBonus != null && sample.armorBonus > 0) {
    tags.push({
      text: g.pauseTraitMutatorArmor.replace('{value}', String(sample.armorBonus)),
      tone: 'mutator',
    });
  }
  if (data.shieldAmount != null && data.shieldAmount > 0) {
    tags.push({
      text: g.pauseTraitShieldMax.replace('{value}', String(data.shieldAmount)),
      tone: 'shield',
    });
  }
  if (sample?.shield != null && sample.maxShield != null && sample.shield > 0) {
    tags.push({
      text: g.pauseTraitShieldCurrent.replace('{value}', String(Math.ceil(sample.shield))),
      tone: 'shield',
    });
  }

  return tags;
}

export function getEnemyDisplayName(type: EnemyType): string {
  return ENEMY_DATA[type as keyof typeof ENEMY_DATA]?.name ?? type;
}

export function getEnemyColor(type: EnemyType): string {
  return ENEMY_DATA[type as keyof typeof ENEMY_DATA]?.color ?? '#888';
}

interface EnemyTypeGroup {
  type: EnemyType;
  count: number;
  totalHp: number;
  avgHpPercent: number;
  sample: Enemy;
  data: EnemyData;
  traits: EnemyTraitTag[];
}

/** 依類型彙總場上敵人 */
export function groupFieldEnemies(enemies: Enemy[], t: Translations): EnemyTypeGroup[] {
  const map = new Map<EnemyType, Enemy[]>();
  for (const e of enemies) {
    const list = map.get(e.type) ?? [];
    list.push(e);
    map.set(e.type, list);
  }

  return [...map.entries()]
    .map(([type, list]) => {
      const data = ENEMY_DATA[type as keyof typeof ENEMY_DATA];
      const totalHp = list.reduce((s, e) => s + e.health, 0);
      const totalMax = list.reduce((s, e) => s + e.maxHealth, 0);
      const toughest = [...list].sort((a, b) => b.health - a.health)[0];
      return {
        type,
        count: list.length,
        totalHp,
        avgHpPercent: totalMax > 0 ? Math.round((totalHp / totalMax) * 100) : 0,
        sample: toughest,
        data,
        traits: getEnemyTraitTags(type, toughest, t),
      };
    })
    .sort((a, b) => b.totalHp - a.totalHp);
}

/** 場上負面狀態彙總 */
interface FieldDebuffSummary {
  effectType: StatusEffectType;
  label: string;
  count: number;
}

export function summarizeFieldDebuffs(enemies: Enemy[], t: Translations): FieldDebuffSummary[] {
  const g = t.game;
  const counts = new Map<StatusEffectType, number>();
  for (const e of enemies) {
    for (const fx of e.effects) {
      if (!FIELD_EFFECT_KEYS[fx.type]) continue;
      counts.set(fx.type, (counts.get(fx.type) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([type, count]) => {
      const key = FIELD_EFFECT_KEYS[type];
      const label = key ? g[key] : type;
      return { effectType: type, label, count };
    })
    .sort((a, b) => b.count - a.count);
}
