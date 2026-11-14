/**
 * 暫停內嵌圖鑑 · 資料目錄（與百科場景共用結構）
 */

import { useMemo } from 'react';
import { useModStore } from '@/store/modStore';
import { ENEMY_DATA, TOWER_DATA, STATUS_EFFECTS } from '@/data/gameData';
import type { EnemyType, TowerType, StatusEffectType } from '@/types/game';
import type { StringValuedKeys } from '@/i18n';
import {
  SPECIAL_ENEMIES,
  SPECIAL_TOWERS,
  type UnifiedEnemy,
  type UnifiedTower,
} from '@/components/scenes/encyclopedia/EncyclopediaTypes';

export function usePauseEncyclopediaCatalog() {
  const mods = useModStore((s) => s.mods);

  const allTowers = useMemo(() => {
    const towers: UnifiedTower[] = [];
    (Object.keys(TOWER_DATA) as TowerType[]).forEach((key) => {
      const tower = TOWER_DATA[key];
      const isSpecial = SPECIAL_TOWERS.includes(key);
      towers.push({
        id: key,
        name: tower.name,
        description: tower.description,
        color: tower.color,
        damage: tower.damage,
        damagePerSecond: tower.damagePerSecond,
        range: tower.range,
        fireRate: tower.fireRate,
        cost: tower.cost,
        splash: tower.splash,
        splashRadius: tower.splashRadius,
        slowEffect: tower.slowEffect,
        slowAmount: tower.slowAmount,
        slowDuration: tower.slowDuration,
        poisonEffect: tower.poisonEffect,
        poisonDamage: tower.poisonDamage,
        poisonDuration: tower.poisonDuration,
        lightningEffect: tower.lightningEffect,
        chainCount: tower.chainCount,
        flameEffect: tower.flameEffect,
        windEffect: tower.windEffect,
        windKnockbackDistance: tower.windKnockbackDistance,
        isModContent: false,
        category: isSpecial ? 'special' : 'basic',
      });
    });
    mods.filter((m) => m.enabled).forEach((mod) => {
      mod.content.towers?.forEach((tower) => {
        towers.push({
          id: tower.id,
          name: tower.name,
          description: tower.description || '',
          color: tower.color,
          damage: tower.damage,
          damagePerSecond: tower.damagePerSecond,
          range: tower.range,
          fireRate: tower.fireRate,
          cost: tower.cost,
          splash: tower.splash,
          splashRadius: tower.splashRadius,
          slowEffect: tower.slowEffect,
          slowAmount: tower.slowAmount,
          slowDuration: tower.slowDuration,
          poisonEffect: tower.poisonEffect,
          poisonDamage: tower.poisonDamage,
          poisonDuration: tower.poisonDuration,
          lightningEffect: tower.lightningEffect,
          chainCount: tower.chainCount,
          isModContent: true,
          modName: mod.metadata.name,
          category: 'mod',
        });
      });
    });
    return towers;
  }, [mods]);

  const allEnemies = useMemo(() => {
    const enemies: UnifiedEnemy[] = [];
    (Object.keys(ENEMY_DATA) as EnemyType[]).forEach((key) => {
      const enemy = ENEMY_DATA[key];
      const isSpecial = SPECIAL_ENEMIES.includes(key);
      enemies.push({
        id: key,
        name: enemy.name,
        description: enemy.description,
        color: enemy.color,
        health: enemy.health,
        speed: enemy.speed,
        reward: enemy.reward,
        size: enemy.size,
        ability: enemy.ability,
        isModContent: false,
        category: isSpecial ? 'special' : 'normal',
      });
    });
    mods.filter((m) => m.enabled).forEach((mod) => {
      mod.content.enemies?.forEach((enemy) => {
        enemies.push({
          id: enemy.id,
          name: enemy.name,
          description: enemy.description || '',
          color: enemy.color,
          health: enemy.health,
          speed: enemy.speed,
          reward: enemy.reward,
          size: enemy.size,
          ability: enemy.ability,
          isModContent: true,
          modName: mod.metadata.name,
          category: 'mod',
        });
      });
    });
    return enemies;
  }, [mods]);

  const allStatusEffects = useMemo(
    () => Object.keys(STATUS_EFFECTS) as StatusEffectType[],
    [],
  );

  return { allTowers, allEnemies, allStatusEffects };
}

const TAB_KEYS: Record<string, StringValuedKeys<import('@/i18n').Translations['game']>> = {
  enemies: 'pauseEncTabEnemies',
  towers: 'pauseEncTabTowers',
  skills: 'pauseEncTabSkills',
  effects: 'pauseEncTabEffects',
};

export function getPauseEncyclopediaTabLabel(
  tab: string,
  g: import('@/i18n').Translations['game'],
): string {
  const key = TAB_KEYS[tab];
  return key ? g[key] : g.pauseEncTabDefault;
}
