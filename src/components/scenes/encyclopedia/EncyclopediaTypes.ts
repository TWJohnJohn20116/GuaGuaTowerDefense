import type { EnemyType, TowerType, GameDifficulty, PathSegment } from '@/types/game';
import { getTowerCombatIdentityPills, type CombatIdentityPill } from '@/data/towerCombatIdentity';
import { hasEnemyAbility } from '@/data/gameData/enemyAbilities';

// 頁面標籤類型
export type TabType = 'enemies' | 'towers' | 'maps' | 'difficulty' | 'effects' | 'skills' | 'stats' | 'icons' | 'files';

// 排序類型
export type SortType = 'name' | 'cost' | 'damage' | 'health' | 'speed' | 'dps' | 'range' | 'reward';

// 塔分類類型
export type TowerCategory = 'all' | 'basic' | 'special' | 'mod';

// 敵人分類類型
export type EnemyCategory = 'all' | 'normal' | 'special' | 'mod';

// 統一的塔資料介面
export interface UnifiedTower {
  id: string;
  name: string;
  description: string;
  color: string;
  damage?: number;
  damagePerSecond?: number;
  range: number;
  fireRate?: number;
  cost: number;
  splash?: boolean;
  splashRadius?: number;
  slowEffect?: boolean;
  slowAmount?: number;
  slowDuration?: number;
  poisonEffect?: boolean;
  poisonDamage?: number;
  poisonDuration?: number;
  lightningEffect?: boolean;
  chainCount?: number;
  flameEffect?: boolean;
  windEffect?: boolean;
  windKnockbackDistance?: number;
  isModContent?: boolean;
  modName?: string;
  modId?: string;
  category: 'basic' | 'special' | 'mod';
}

// 統一的敵人資料介面
export interface UnifiedEnemy {
  id: string;
  name: string;
  description: string;
  color: string;
  health: number;
  speed: number;
  reward: number;
  size: number;
  ability?: string;
  isModContent?: boolean;
  modName?: string;
  modId?: string;
  category: 'normal' | 'special' | 'mod';
}

// 地圖資訊介面
export interface MapInfo {
  id: string;
  name: string;
  description: string;
  difficulty: string | number;
  waypoints: { row: number; col: number }[];
  segments?: PathSegment[];
  isModContent?: boolean;
  modName?: string;
  modId?: string;
}

// 塔分類列表
export const SPECIAL_TOWERS: TowerType[] = ['frost', 'poison', 'laser', 'lightning', 'flame', 'money', 'wind'];

// 敵人分類列表
export const SPECIAL_ENEMIES: EnemyType[] = ['boss', 'flyer', 'healer', 'spawner', 'shield', 'stealth', 'berserker', 'armored', 'mage', 'miniboss', 'swarm', 'ghost', 'bomber', 'saboteur', 'jammer', 'escort'];

// 難度類型列表
export const ALL_DIFFICULTIES: GameDifficulty[] = ['easy', 'normal', 'hard', 'nightmare', 'impossible'];

// 難度資訊 (僅圖示與顏色,文字內容由 i18n 提供)
export const DIFFICULTY_VISUAL: Record<string, { icon: string; color: string }> = {
  easy: { icon: '🌱', color: '#10b981' },
  normal: { icon: '⚔️', color: '#3b82f6' },
  hard: { icon: '🔥', color: '#f97316' },
  nightmare: { icon: '💀', color: '#ef4444' },
  impossible: { icon: '👑', color: '#a855f7' },
};

// 塔特效類型(顯示名稱由呼叫端透過 i18n 翻譯)
type TowerEffectKey = 'splash' | 'slow' | 'poison' | 'chain' | 'flame' | 'knockback';

// 獲取塔特效列表 (回傳 i18n key,而非翻譯後字串)
export const getTowerEffects = (tower: UnifiedTower) => {
  const effects: { icon: string; key: TowerEffectKey; rawValue: string | number; color: string; valueKind?: 'cells' | 'targets' | 'percent' | 'duration' | 'rate' }[] = [];
  if (tower.splash) effects.push({ icon: '💥', key: 'splash', rawValue: tower.splashRadius ?? 0, color: 'orange', valueKind: 'cells' });
  if (tower.slowEffect) effects.push({ icon: '❄️', key: 'slow', rawValue: Math.round((1 - (tower.slowAmount || 0)) * 100), color: 'cyan', valueKind: 'percent' });
  if (tower.poisonEffect) effects.push({ icon: '☠️', key: 'poison', rawValue: tower.poisonDamage ?? 0, color: 'green', valueKind: 'rate' });
  if (tower.lightningEffect) effects.push({ icon: '⚡', key: 'chain', rawValue: tower.chainCount ?? 0, color: 'yellow', valueKind: 'targets' });
  if (tower.flameEffect) effects.push({ icon: '🔥', key: 'flame', rawValue: '', color: 'red', valueKind: 'duration' });
  if (tower.windEffect) effects.push({ icon: '🌪️', key: 'knockback', rawValue: tower.windKnockbackDistance ?? 0, color: 'teal', valueKind: 'cells' });
  return effects;
};

export function getEncyclopediaTowerSpecials(tower: UnifiedTower): {
  flagEffects: ReturnType<typeof getTowerEffects>;
  identities: CombatIdentityPill[];
} {
  return {
    flagEffects: getTowerEffects(tower),
    identities: tower.isModContent ? [] : getTowerCombatIdentityPills(tower.id),
  };
}

// 塔推薦對付類型 ID (顯示名稱由呼叫端翻譯)
type RecommendKey =
  | 'fast_enemies' | 'berserker'
  | 'swarm'
  | 'tank' | 'boss'
  | 'healer' | 'shield_enemy'
  | 'all_types'
  | 'armored_enemy'
  | 'normal_elite';

type ReasonKey =
  | 'reason_slow_fast' | 'reason_slow_berserk'
  | 'reason_splash_swarm'
  | 'reason_high_dmg_tank' | 'reason_high_dmg_boss'
  | 'reason_poison_healer' | 'reason_poison_shield'
  | 'reason_wind_all'
  | 'reason_flame_armor'
  | 'reason_balanced';

// 塔推薦對付的敵人 (回傳 i18n key)
export const getTowerRecommendedEnemies = (tower: UnifiedTower): { typeKey: RecommendKey; reasonKey: ReasonKey }[] => {
  const recs: { typeKey: RecommendKey; reasonKey: ReasonKey }[] = [];
  if (tower.slowEffect) {
    recs.push({ typeKey: 'fast_enemies', reasonKey: 'reason_slow_fast' });
    recs.push({ typeKey: 'berserker', reasonKey: 'reason_slow_berserk' });
  }
  if (tower.splash || tower.lightningEffect) {
    recs.push({ typeKey: 'swarm', reasonKey: 'reason_splash_swarm' });
  }
  if ((tower.damage || 0) >= 40 || tower.id === 'sniper') {
    recs.push({ typeKey: 'tank', reasonKey: 'reason_high_dmg_tank' });
    recs.push({ typeKey: 'boss', reasonKey: 'reason_high_dmg_boss' });
  }
  if (tower.poisonEffect) {
    recs.push({ typeKey: 'healer', reasonKey: 'reason_poison_healer' });
    recs.push({ typeKey: 'shield_enemy', reasonKey: 'reason_poison_shield' });
  }
  if (tower.windEffect) {
    recs.push({ typeKey: 'all_types', reasonKey: 'reason_wind_all' });
  }
  if (tower.flameEffect) {
    recs.push({ typeKey: 'armored_enemy', reasonKey: 'reason_flame_armor' });
  }
  if (recs.length === 0) {
    recs.push({ typeKey: 'normal_elite', reasonKey: 'reason_balanced' });
  }
  return recs;
};

// 敵人能力 ID 列表(顯示名稱由 i18n abilities 提供)
type AbilityKey = 'flying' | 'healing' | 'spawning' | 'shield' | 'stealth' | 'berserk' | 'armored' | 'teleport' | 'miniboss' | 'swarm' | 'phase' | 'explode' | 'sabotage' | 'jam' | 'escort';

// 由呼叫處透過 t.encyclopedia.abilities[ability] 取得名稱
export const getAbilityKey = (ability?: string): AbilityKey | undefined => {
  if (!ability) return undefined;
  const known: AbilityKey[] = ['flying', 'healing', 'spawning', 'shield', 'stealth', 'berserk', 'armored', 'teleport', 'miniboss', 'swarm', 'phase', 'explode', 'sabotage', 'jam', 'escort'];
  return known.includes(ability as AbilityKey) ? (ability as AbilityKey) : undefined;
};

// 剋星塔 ID (對應到 t.towers.types[towerKey])
type CounterTowerKey = 'frost' | 'wind' | 'sniper' | 'poison' | 'lightning' | 'cannon' | 'machine' | 'basic' | 'flame' | 'laser';

// 剋星理由 i18n key
type CounterReasonKey =
  | 'cr_speed_frost' | 'cr_speed_wind' | 'cr_speed_cannon'
  | 'cr_health_sniper' | 'cr_health_poison' | 'cr_health_laser' | 'cr_health_flame'
  | 'cr_healer_poison' | 'cr_healer_sniper'
  | 'cr_shield_lightning' | 'cr_shield_poison' | 'cr_shield_flame'
  | 'cr_split_cannon' | 'cr_split_lightning'
  | 'cr_flyer_machine' | 'cr_flyer_lightning'
  | 'cr_jammer_frost' | 'cr_jammer_machine'
  | 'cr_healer_machine'
  | 'cr_escort_sniper' | 'cr_escort_flame' | 'cr_escort_machine'
  | 'cr_armor_poison' | 'cr_armor_flame'
  | 'cr_default_basic' | 'cr_default_machine';

// 敵人推薦剋星塔 (回傳 i18n key)
export const getEnemyCounterTowers = (enemy: UnifiedEnemy): { towerKey: CounterTowerKey; reasonKey: CounterReasonKey }[] => {
  const counters: { towerKey: CounterTowerKey; reasonKey: CounterReasonKey }[] = [];
  if (enemy.speed >= 1.5) {
    counters.push({ towerKey: 'frost', reasonKey: 'cr_speed_frost' });
    counters.push({ towerKey: 'wind', reasonKey: 'cr_speed_wind' });
    counters.push({ towerKey: 'cannon', reasonKey: 'cr_speed_cannon' });
  }
  if (enemy.health >= 200) {
    counters.push({ towerKey: 'sniper', reasonKey: 'cr_health_sniper' });
    counters.push({ towerKey: 'poison', reasonKey: 'cr_health_poison' });
    counters.push({ towerKey: 'laser', reasonKey: 'cr_health_laser' });
    counters.push({ towerKey: 'flame', reasonKey: 'cr_health_flame' });
  }
  if (enemy.ability?.includes('治療') || enemy.id === 'healer') {
    counters.push({ towerKey: 'poison', reasonKey: 'cr_healer_poison' });
    counters.push({ towerKey: 'sniper', reasonKey: 'cr_healer_sniper' });
    counters.push({ towerKey: 'machine', reasonKey: 'cr_healer_machine' });
  }
  if (enemy.ability?.includes('護盾') || enemy.id === 'shield') {
    counters.push({ towerKey: 'lightning', reasonKey: 'cr_shield_lightning' });
    counters.push({ towerKey: 'poison', reasonKey: 'cr_shield_poison' });
    counters.push({ towerKey: 'flame', reasonKey: 'cr_shield_flame' });
  }
  if (enemy.ability?.includes('分裂') || enemy.id === 'spawner') {
    counters.push({ towerKey: 'cannon', reasonKey: 'cr_split_cannon' });
    counters.push({ towerKey: 'lightning', reasonKey: 'cr_split_lightning' });
  }
  if (enemy.id === 'flyer') {
    counters.push({ towerKey: 'machine', reasonKey: 'cr_flyer_machine' });
    counters.push({ towerKey: 'lightning', reasonKey: 'cr_flyer_lightning' });
  }
  if (enemy.id === 'jammer') {
    counters.push({ towerKey: 'sniper', reasonKey: 'cr_health_sniper' });
    counters.push({ towerKey: 'frost', reasonKey: 'cr_jammer_frost' });
    counters.push({ towerKey: 'machine', reasonKey: 'cr_jammer_machine' });
  }
  if (enemy.id === 'escort') {
    counters.push({ towerKey: 'sniper', reasonKey: 'cr_escort_sniper' });
    counters.push({ towerKey: 'flame', reasonKey: 'cr_escort_flame' });
    counters.push({ towerKey: 'machine', reasonKey: 'cr_escort_machine' });
  }
  if (enemy.id === 'armored' || hasEnemyAbility(enemy, 'armored') || enemy.ability?.includes('裝甲')) {
    counters.push({ towerKey: 'poison', reasonKey: 'cr_armor_poison' });
    counters.push({ towerKey: 'flame', reasonKey: 'cr_armor_flame' });
  }
  if (counters.length === 0) {
    counters.push({ towerKey: 'basic', reasonKey: 'cr_default_basic' });
    counters.push({ towerKey: 'machine', reasonKey: 'cr_default_machine' });
  }
  return counters;
};
