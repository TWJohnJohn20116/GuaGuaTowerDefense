/**
 * 鄰塔協同：正交相鄰（不含對角）的特定塔對會提供真實戰鬥加成。
 * 倍率會相乘後再套上限，並與戰術協議疊加而非覆蓋。
 */

import type { TowerType } from '@/types/game';

export interface TowerRef {
  id: string;
  type: TowerType;
  col: number;
  row: number;
}

export interface TowerSynergyDef {
  id: string;
  a: TowerType;
  b: TowerType;
  name: string;
  description: string;
  fireRateMult: number;
  damageMult: number;
  rangeMult: number;
  incomeMult: number;
}

export interface SynergyMods {
  fireRateMult: number;
  damageMult: number;
  rangeMult: number;
  incomeMult: number;
  linkIds: string[];
  linkNames: string[];
}

export interface SynergyLink {
  recipeId: string;
  name: string;
  aId: string;
  bId: string;
}

export const SYNERGY_FIRE_RATE_CAP = 1.45;
export const SYNERGY_DAMAGE_CAP = 1.35;
export const SYNERGY_RANGE_CAP = 1.25;
export const SYNERGY_INCOME_CAP = 1.4;

const IDENTITY: SynergyMods = {
  fireRateMult: 1,
  damageMult: 1,
  rangeMult: 1,
  incomeMult: 1,
  linkIds: [],
  linkNames: [],
};

const def = (
  id: string,
  a: TowerType,
  b: TowerType,
  name: string,
  description: string,
  bonus: Partial<Pick<TowerSynergyDef, 'fireRateMult' | 'damageMult' | 'rangeMult' | 'incomeMult'>>,
): TowerSynergyDef => ({
  id,
  a,
  b,
  name,
  description,
  fireRateMult: 1,
  damageMult: 1,
  rangeMult: 1,
  incomeMult: 1,
  ...bonus,
});

export const TOWER_SYNERGIES: TowerSynergyDef[] = [
  def('chill_snipe', 'frost', 'sniper', '寒霜瞄準', '冰霜拖住敵人，兩塔攻速提升。', { fireRateMult: 1.18 }),
  def('chill_blast', 'frost', 'cannon', '寒霜爆破', '減速讓砲彈更容易打中群聚敵人。', { damageMult: 1.12 }),
  def('toxic_spray', 'poison', 'machine', '毒霧掃射', '機槍快速疊毒，兩塔攻速提升。', { fireRateMult: 1.16 }),
  def('chill_beam', 'frost', 'laser', '寒霜光束', '激光在減速目標上停留更久。', { damageMult: 1.12 }),
  def('chill_bolt', 'frost', 'lightning', '寒霜雷擊', '連鎖更容易跳到被凍住的敵人。', { damageMult: 1.1 }),
  def('blight', 'poison', 'flame', '凋零烈焰', '毒素與灼燒同時侵蝕，傷害提升。', { damageMult: 1.14 }),
  def('seed_money', 'money', 'basic', '種子金庫', '基礎塔護衛金庫，產金提升。', { incomeMult: 1.2 }),
  def('point_blank', 'shotgun', 'cannon', '近距火力', '散彈與砲彈在近戰線上互補。', { damageMult: 1.1 }),
  def('wind_snipe', 'wind', 'sniper', '破風校準', '風塔把敵人吹進狙擊線，兩塔射程提升。', { rangeMult: 1.14 }),
  def('pulse_bolt', 'pulse', 'lightning', '脈衝雷網', '脈衝標記後閃電更容易連跳，傷害提升。', { damageMult: 1.12 }),
  def('siege_line', 'ballista', 'cannon', '攻城連線', '弩砲與加農在遠距互補，傷害提升。', { damageMult: 1.12 }),
  def('beam_snipe', 'laser', 'sniper', '雙準連線', '雷射與狙擊共用校準，兩塔射程提升。', { rangeMult: 1.12 }),
  def('blaze_cannon', 'flame', 'cannon', '燃爆砲火', '砲彈把火焰打進人群，傷害提升。', { damageMult: 1.12 }),
  def('gale_pulse', 'wind', 'pulse', '風脈共振', '風與脈衝把敵人送進打擊節奏，攻速提升。', { fireRateMult: 1.14 }),
  def('chill_shot', 'frost', 'shotgun', '寒霜散彈', '減速讓散彈更容易打滿近戰線，傷害提升。', { damageMult: 1.12 }),
  def('pulse_vault', 'money', 'pulse', '脈衝金庫', '脈衝清場護住金庫，產金提升。', { incomeMult: 1.16 }),
  def('siege_snipe', 'ballista', 'sniper', '弩準連線', '弩砲與狙擊共用遠距校準，兩塔射程提升。', { rangeMult: 1.12 }),
  def('volt_beam', 'laser', 'lightning', '雷光連線', '雷射與電擊共用弱點，兩塔傷害提升。', { damageMult: 1.12 }),
  def('spray_line', 'shotgun', 'machine', '彈幕火網', '散彈與機槍把近戰線打成火網，攻速提升。', { fireRateMult: 1.14 }),
  def('frost_gale', 'frost', 'wind', '霜風夾擊', '冰與風把敵人送進打擊圈，兩塔射程提升。', { rangeMult: 1.12 }),
  def('ember_spray', 'flame', 'machine', '燃機火網', '火焰與機槍把近戰線燒穿，攻速提升。', { fireRateMult: 1.14 }),
  def('pulse_cannon', 'pulse', 'cannon', '脈衝砲擊', '脈衝破甲後砲彈打進人群，傷害提升。', { damageMult: 1.12 }),
  def('toxic_bolt', 'poison', 'lightning', '毒雷連線', '毒素標記後閃電連跳更痛，傷害提升。', { damageMult: 1.12 }),
  def('toxic_shot', 'poison', 'shotgun', '毒霧散彈', '散彈把毒霧打進近戰線，傷害提升。', { damageMult: 1.12 }),
  def('siege_flame', 'ballista', 'flame', '攻城烈焰', '弩砲點名後火焰燒穿裝甲，傷害提升。', { damageMult: 1.12 }),
  def('base_cannon', 'basic', 'cannon', '基砲連線', '基礎塔護住砲位，兩塔攻速提升。', { fireRateMult: 1.14 }),
  def('volt_spray', 'lightning', 'shotgun', '雷散連線', '電擊標記後散彈打滿近戰線，傷害提升。', { damageMult: 1.12 }),
  def('ember_pulse', 'flame', 'pulse', '燃脈連線', '脈衝破甲後火焰燒穿，兩塔攻速提升。', { fireRateMult: 1.14 }),
  def('mill_cannon', 'machine', 'cannon', '機砲火網', '機槍壓制後砲彈打進人群，傷害提升。', { damageMult: 1.12 }),
  def('toxic_pulse', 'poison', 'pulse', '毒脈連線', '脈衝破甲後毒素咬得更深，傷害提升。', { damageMult: 1.12 }),
  def('beam_flame', 'laser', 'flame', '焰束連線', '雷射點名後火焰燒穿殘血，傷害提升。', { damageMult: 1.12 }),
  def('vault_cannon', 'money', 'cannon', '砲庫連線', '加農護住金庫，產金提升。', { incomeMult: 1.16 }),
];

export function toTowerRef(tower: {
  id: string;
  type: TowerType;
  gridPos: { col: number; row: number };
}): TowerRef {
  return { id: tower.id, type: tower.type, col: tower.gridPos.col, row: tower.gridPos.row };
}

export function areOrthogonallyAdjacent(
  a: { col: number; row: number },
  b: { col: number; row: number },
): boolean {
  return Math.abs(a.col - b.col) + Math.abs(a.row - b.row) === 1;
}

export function findSynergyRecipe(a: TowerType, b: TowerType): TowerSynergyDef | undefined {
  return TOWER_SYNERGIES.find((s) => (s.a === a && s.b === b) || (s.a === b && s.b === a));
}

export function getSynergyModsForTower(tower: TowerRef, allTowers: TowerRef[]): SynergyMods {
  let fireRateMult = 1;
  let damageMult = 1;
  let rangeMult = 1;
  let incomeMult = 1;
  const linkIds: string[] = [];
  const nameSet = new Set<string>();

  for (const other of allTowers) {
    if (other.id === tower.id) continue;
    if (!areOrthogonallyAdjacent(tower, other)) continue;
    const recipe = findSynergyRecipe(tower.type, other.type);
    if (!recipe) continue;
    fireRateMult *= recipe.fireRateMult;
    damageMult *= recipe.damageMult;
    rangeMult *= recipe.rangeMult;
    incomeMult *= recipe.incomeMult;
    if (!linkIds.includes(recipe.id)) linkIds.push(recipe.id);
    nameSet.add(recipe.name);
  }

  if (linkIds.length === 0) return IDENTITY;

  return {
    fireRateMult: Math.min(SYNERGY_FIRE_RATE_CAP, fireRateMult),
    damageMult: Math.min(SYNERGY_DAMAGE_CAP, damageMult),
    rangeMult: Math.min(SYNERGY_RANGE_CAP, rangeMult),
    incomeMult: Math.min(SYNERGY_INCOME_CAP, incomeMult),
    linkIds,
    linkNames: [...nameSet],
  };
}

export function countActiveSynergyKinds(towers: TowerRef[]): number {
  return getActiveSynergyKindIds(towers).length;
}

export function getActiveSynergyKindIds(towers: TowerRef[]): string[] {
  const ids = new Set<string>();
  for (let i = 0; i < towers.length; i++) {
    for (let j = i + 1; j < towers.length; j++) {
      if (!areOrthogonallyAdjacent(towers[i], towers[j])) continue;
      const recipe = findSynergyRecipe(towers[i].type, towers[j].type);
      if (recipe) ids.add(recipe.id);
    }
  }
  return [...ids];
}

export function listActiveSynergyLinks(towers: TowerRef[]): SynergyLink[] {
  const links: SynergyLink[] = [];
  for (let i = 0; i < towers.length; i++) {
    for (let j = i + 1; j < towers.length; j++) {
      if (!areOrthogonallyAdjacent(towers[i], towers[j])) continue;
      const recipe = findSynergyRecipe(towers[i].type, towers[j].type);
      if (!recipe) continue;
      links.push({
        recipeId: recipe.id,
        name: recipe.name,
        aId: towers[i].id,
        bId: towers[j].id,
      });
    }
  }
  return links;
}

export interface EncyclopediaSynergy {
  recipeId: string;
  name: string;
  description: string;
  partnerType: TowerType;
  bonusLabel: string;
}

export function formatSynergyBonus(recipe: TowerSynergyDef): string {
  const parts: string[] = [];
  if (recipe.fireRateMult > 1) parts.push(`攻速 ×${recipe.fireRateMult}`);
  if (recipe.damageMult > 1) parts.push(`傷害 ×${recipe.damageMult}`);
  if (recipe.rangeMult > 1) parts.push(`射程 ×${recipe.rangeMult}`);
  if (recipe.incomeMult > 1) parts.push(`產金 ×${recipe.incomeMult}`);
  return parts.join(' · ');
}

export function getEncyclopediaSynergiesForTower(type: TowerType): EncyclopediaSynergy[] {
  return TOWER_SYNERGIES.filter((recipe) => recipe.a === type || recipe.b === type).map((recipe) => ({
    recipeId: recipe.id,
    name: recipe.name,
    description: recipe.description,
    partnerType: recipe.a === type ? recipe.b : recipe.a,
    bonusLabel: formatSynergyBonus(recipe),
  }));
}

export interface PlacementSynergyPreview {
  recipeId: string;
  name: string;
  bonusLabel: string;
  partnerId: string;
  partnerCol: number;
  partnerRow: number;
}

export function previewPlacementSynergies(
  placingType: TowerType,
  col: number,
  row: number,
  towers: TowerRef[],
): PlacementSynergyPreview[] {
  const previews: PlacementSynergyPreview[] = [];
  for (const other of towers) {
    if (!areOrthogonallyAdjacent({ col, row }, other)) continue;
    const recipe = findSynergyRecipe(placingType, other.type);
    if (!recipe) continue;
    previews.push({
      recipeId: recipe.id,
      name: recipe.name,
      bonusLabel: formatSynergyBonus(recipe),
      partnerId: other.id,
      partnerCol: other.col,
      partnerRow: other.row,
    });
  }
  return previews;
}

