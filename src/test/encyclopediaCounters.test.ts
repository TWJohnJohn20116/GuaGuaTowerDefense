import { describe, it, expect } from 'vitest';
import {
  getEnemyCounterTowers,
  getEncyclopediaTowerSpecials,
  getTowerEffects,
  type UnifiedEnemy,
  type UnifiedTower,
} from '@/components/scenes/encyclopedia/EncyclopediaTypes';
import {
  BASIC_MARKED_DAMAGE_MULT,
  BALLISTA_ROOTED_DAMAGE_MULT,
  SHOTGUN_BLEEDING_DAMAGE_MULT,
  SNIPER_MARKED_DAMAGE_MULT,
} from '@/data/combatStatus';

function enemy(partial: Partial<UnifiedEnemy> & Pick<UnifiedEnemy, 'id' | 'speed' | 'health'>): UnifiedEnemy {
  return {
    name: partial.id,
    description: '',
    color: '#000',
    reward: 1,
    size: 20,
    category: 'normal',
    ...partial,
  };
}

describe('encyclopedia counters', () => {
  it('recommends cannon stun against fast rushes', () => {
    const speedy = getEnemyCounterTowers(enemy({ id: 'speedy', speed: 2, health: 40 }));
    expect(speedy).toEqual(expect.arrayContaining([
      { towerKey: 'cannon', reasonKey: 'cr_speed_cannon' },
    ]));

    const swarm = getEnemyCounterTowers(enemy({ id: 'swarm', speed: 1.5, health: 25, ability: 'swarm' }));
    expect(swarm).toEqual(expect.arrayContaining([
      { towerKey: 'cannon', reasonKey: 'cr_speed_cannon' },
    ]));

    const tank = getEnemyCounterTowers(enemy({ id: 'tank', speed: 0.6, health: 200 }));
    expect(tank.some((item) => item.reasonKey === 'cr_speed_cannon')).toBe(false);
  });

  it('recommends laser execute against high-health enemies', () => {
    const tank = getEnemyCounterTowers(enemy({ id: 'tank', speed: 0.6, health: 200 }));
    expect(tank).toEqual(expect.arrayContaining([
      { towerKey: 'laser', reasonKey: 'cr_health_laser' },
      { towerKey: 'flame', reasonKey: 'cr_health_flame' },
    ]));
    const swarm = getEnemyCounterTowers(enemy({ id: 'swarm', speed: 1.5, health: 25 }));
    expect(swarm.some((item) => item.reasonKey === 'cr_health_laser')).toBe(false);
    expect(swarm.some((item) => item.reasonKey === 'cr_health_flame')).toBe(false);
  });

  it('recommends poison and flame against armor and shields', () => {
    const armored = getEnemyCounterTowers(enemy({ id: 'armored', speed: 0.7, health: 180, ability: 'armored' }));
    expect(armored).toEqual(expect.arrayContaining([
      { towerKey: 'poison', reasonKey: 'cr_armor_poison' },
      { towerKey: 'flame', reasonKey: 'cr_armor_flame' },
    ]));

    const shield = getEnemyCounterTowers(enemy({ id: 'shield', speed: 0.9, health: 70, ability: '護盾' }));
    expect(shield).toEqual(expect.arrayContaining([
      { towerKey: 'flame', reasonKey: 'cr_shield_flame' },
    ]));
  });

  it('recommends machine silence against jammer, healer and escort', () => {
    const jammer = getEnemyCounterTowers(enemy({ id: 'jammer', speed: 0.9, health: 180 }));
    expect(jammer).toEqual(expect.arrayContaining([
      { towerKey: 'machine', reasonKey: 'cr_jammer_machine' },
    ]));

    const healer = getEnemyCounterTowers(enemy({ id: 'healer', speed: 0.8, health: 90, ability: '治療光環' }));
    expect(healer).toEqual(expect.arrayContaining([
      { towerKey: 'machine', reasonKey: 'cr_healer_machine' },
    ]));

    const escort = getEnemyCounterTowers(enemy({ id: 'escort', speed: 0.85, health: 160 }));
    expect(escort).toEqual(expect.arrayContaining([
      { towerKey: 'machine', reasonKey: 'cr_escort_machine' },
    ]));
  });
});

function tower(id: string, extra: Partial<UnifiedTower> = {}): UnifiedTower {
  return {
    id,
    name: id,
    description: '',
    color: '#000',
    range: 3,
    cost: 100,
    category: 'basic',
    ...extra,
  };
}

describe('encyclopedia tower specials', () => {
  it('shows combat identity when splash or slow flags are missing', () => {
    expect(getTowerEffects(tower('sniper'))).toEqual([]);
    expect(getEncyclopediaTowerSpecials(tower('sniper')).identities.map((pill) => pill.mult)).toContain(SNIPER_MARKED_DAMAGE_MULT);
    expect(getEncyclopediaTowerSpecials(tower('shotgun')).identities.map((pill) => pill.mult)).toContain(SHOTGUN_BLEEDING_DAMAGE_MULT);
    expect(getEncyclopediaTowerSpecials(tower('ballista')).identities.map((pill) => pill.mult)).toContain(BALLISTA_ROOTED_DAMAGE_MULT);
    expect(getEncyclopediaTowerSpecials(tower('basic')).identities.map((pill) => pill.mult)).toContain(BASIC_MARKED_DAMAGE_MULT);
  });

  it('does not invent identity specials for mod towers', () => {
    expect(getEncyclopediaTowerSpecials(tower('custom', { isModContent: true })).identities).toEqual([]);
  });
});
