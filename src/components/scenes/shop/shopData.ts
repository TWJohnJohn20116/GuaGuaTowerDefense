/**
 * 商店資料層：分類、名稱／描述、技能圖示映射與呈現用型別
 *
 * 商品本體資料來自 TOWER_DATA 與 PLAYER_SKILLS，這裡只放商店呈現所需的衍生資訊。
 * 需要翻譯的衍生文字（角色定位、特性標籤、數值摘要）在 shopShopI18n.ts。
 */

import type { SVGProps } from 'react';
import type { TowerType } from '@/types/game';
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

// ===== 塔名稱 / 描述 =====
// 直接取 TOWER_DATA（繁中），避免依賴 i18n locale 缺鍵（新塔尚未補翻譯時商店不會壞）。
export function getTowerName(towerId: TowerType): string {
  return TOWER_DATA[towerId]?.name ?? towerId;
}

export function getTowerDesc(towerId: TowerType): string {
  return TOWER_DATA[towerId]?.description ?? '';
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

// ===== 塔特性標籤型別（實際推導在 shopShopI18n.ts） =====
export interface TraitTag {
  label: string;
  color: string; // hex 主色
}

// ===== 技能屬性摘要（詳情面板統計格） =====
export interface StatCell {
  label: string;
  value: string;
  color: string; // hex
}

