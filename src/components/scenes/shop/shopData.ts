/**
 * 商店資料層：分類、主題色、圖示映射與特性標籤推導
 *
 * 由 Shop.tsx / ShopGrid.tsx / ShopDetailPanel.tsx 共用，
 * 商品本體資料來自 TOWER_DATA 與 PLAYER_SKILLS，這裡只放商店呈現所需的衍生資訊。
 */

import type { SVGProps } from 'react';
import type { TowerType, TowerData } from '@/types/game';
import { TOWER_DATA } from '@/data/gameData';
import type { PlayerSkill, PlayerSkillId } from '@/data/playerSkillData';
import {
  CoinIcon, LightningIcon, SnowflakeIcon, SwordsIcon, MeteorIcon,
  ChainLightningIcon, HealIcon, AegisIcon, WarpIcon, EmpIcon,
} from '@/components/ui/Icons';

// ===== 商品選中參照 =====
export type ShopTab = 'towers' | 'skills';

export type ShopSelection =
  | { kind: 'tower'; id: TowerType }
  | { kind: 'skill'; id: PlayerSkillId };

export function getShopUnlockActionLabel(
  kind: ShopSelection['kind'],
  shop: { unlockTower: string; unlockSkill: string },
): string {
  return kind === 'skill' ? shop.unlockSkill : shop.unlockTower;
}

// ===== 塔分類 =====
export const BASIC_TOWERS: TowerType[] = ['basic', 'sniper', 'cannon', 'ballista', 'machine', 'shotgun'];
export const SPECIAL_TOWERS: TowerType[] = ['frost', 'poison', 'laser', 'lightning', 'flame', 'money', 'wind', 'pulse'];
export const ALL_TOWER_TYPES: TowerType[] = [...BASIC_TOWERS, ...SPECIAL_TOWERS];

// ===== 塔名稱 / 描述 / 角色定位 =====
// 名稱與描述直接取 TOWER_DATA（繁中）；角色定位用本地表，
// 避免依賴 i18n locale 缺鍵（如新塔尚未補翻譯時商店直接壞掉）。
export function getTowerName(towerId: TowerType): string {
  return TOWER_DATA[towerId]?.name ?? towerId;
}

export function getTowerDesc(towerId: TowerType): string {
  return TOWER_DATA[towerId]?.description ?? '';
}

const TOWER_ROLES: Record<TowerType, string> = {
  basic: '均衡入門',
  sniper: '遠程狙殺',
  cannon: '範圍轟炸',
  ballista: '直線貫穿',
  machine: '高速輸出',
  shotgun: '近戰爆發',
  frost: '減速控場',
  poison: '持續毒傷',
  laser: '單體聚焦',
  lightning: '連鎖打擊',
  flame: '近域燒灼',
  money: '經濟產出',
  wind: '擊退守門',
  pulse: '全域脈衝',
  storm: '連鎖控場',
  plague: '持續剝血',
  demolisher: '遠程濺射',
  tempest: '擊退爆發',
};

export function getTowerRole(towerId: TowerType): string {
  return TOWER_ROLES[towerId] ?? '';
}

// ===== 主動技能圖示 =====
export type SkillIconComp = (p: SVGProps<SVGSVGElement> & { className?: string }) => JSX.Element;

export const PLAYER_SKILL_ICONS: Record<PlayerSkill['effectKey'], SkillIconComp> = {
  lightning: LightningIcon,
  freeze: SnowflakeIcon,
  cash: CoinIcon,
  inspire: SwordsIcon,
  meteor: MeteorIcon,
  chain: ChainLightningIcon,
  heal: HealIcon,
  aegis: AegisIcon,
  warp: WarpIcon,
  emp: EmpIcon,
};

// ===== 塔特性標籤（由 TOWER_DATA 旗標推導） =====
export interface TraitTag {
  label: string;
  color: string; // hex 主色
}

export function getTowerTraits(data: TowerData): TraitTag[] {
  const traits: TraitTag[] = [];
  if (data.instantHit) traits.push({ label: '瞬間命中', color: '#a5f3fc' });
  if (data.splash) traits.push({ label: '範圍濺射', color: '#fb923c' });
  if (data.slowEffect) traits.push({ label: '減速控場', color: '#7dd3fc' });
  if (data.poisonEffect) traits.push({ label: '劇毒持續', color: '#86efac' });
  if (data.laserEffect) traits.push({ label: '持續光束', color: '#d8b4fe' });
  if (data.lightningEffect) traits.push({ label: '連鎖閃電', color: '#fde047' });
  if (data.flameEffect) traits.push({ label: '燃燒噴射', color: '#fca5a5' });
  if (data.moneyGeneration) traits.push({ label: '產出金幣', color: '#fde68a' });
  if (data.windEffect) traits.push({ label: '擊退氣流', color: '#5eead4' });
  if (data.pulseEffect) traits.push({ label: '全域脈衝', color: '#67e8f9' });
  if ((data.critChance ?? 0) > 0) traits.push({ label: '可暴擊', color: '#fdba74' });
  return traits;
}

// ===== 技能屬性摘要（詳情面板統計格） =====
export interface StatCell {
  label: string;
  value: string;
  color: string; // hex
}

export function getTowerStats(data: TowerData): StatCell[] {
  const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));
  return [
    {
      label: '傷害',
      value: data.damage > 0 ? fmt(data.damage) : data.damagePerSecond ? `${fmt(data.damagePerSecond)}/s` : '—',
      color: '#fda4af',
    },
    { label: '射程', value: data.range > 0 ? fmt(data.range) : '—', color: '#93c5fd' },
    { label: '攻速', value: data.fireRate ? `${fmt(data.fireRate)}/s` : '—', color: '#6ee7b7' },
  ];
}

export function getSkillStats(skill: PlayerSkill): StatCell[] {
  return [
    { label: '冷卻', value: `${skill.cooldown / 1000}s`, color: '#67e8f9' },
    { label: '持續', value: skill.duration ? `${skill.duration / 1000}s` : '即時', color: '#6ee7b7' },
    { label: '快捷鍵', value: `⇧${skill.hotkey}`, color: '#d8b4fe' },
  ];
}

// ===== 塔主題色（直接取塔本體顏色） =====
export function getTowerColor(towerId: TowerType): string {
  return TOWER_DATA[towerId]?.color ?? '#64748b';
}
