/**
 * 塔皮膚系統類型定義
 * Tower Skin System Type Definitions
 */

import type { TowerType } from './game';

import React from 'react';
import { PaletteIcon, FlowerIcon, TrophyIcon, StarIcon, CrownIcon } from '@/components/ui/Icons';

// 皮膚稀有度
export type SkinRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

// 皮膚類別
type SkinCategory = 
  | 'default'     // 預設
  | 'seasonal'    // 季節限定
  | 'achievement' // 成就解鎖
  | 'special'     // 特殊活動
  | 'premium';    // 高級

// 解鎖條件類型
type UnlockConditionType = 
  | 'default'           // 預設解鎖
  | 'achievement'       // 成就解鎖
  | 'kills'             // 擊殺數
  | 'tower_placed'      // 放置塔數量
  | 'tower_upgraded'    // 升級次數
  | 'games_won'         // 勝利場數
  | 'waves_completed'   // 完成波次
  | 'special';          // 特殊條件

// 解鎖條件
export interface UnlockCondition {
  type: UnlockConditionType;
  target?: number;
  achievementId?: string;
  description: string;
}

// 視覺效果配置
export interface SkinVisuals {
  // 基礎顏色
  color: string;
  projectileColor: string;
  highlightColor: string;
  
  // 額外視覺效果 (可選)
  glowColor?: string;
  glowIntensity?: number;
  trailColor?: string;
  trailLength?: number;
  particleColor?: string;
  particleCount?: number;
  
  // 動畫效果
  idleAnimation?: 'none' | 'pulse' | 'rotate' | 'float' | 'glow';
  attackAnimation?: 'none' | 'flash' | 'shake' | 'expand';
  
  // 特殊視覺
  auraEffect?: boolean;
  auraColor?: string;
}

// 皮膚定義
export interface TowerSkin {
  id: string;
  name: string;
  description: string;
  towerType: TowerType | 'all';  // 'all' 表示適用於所有塔
  rarity: SkinRarity;
  category: SkinCategory;
  
  // 視覺配置
  visuals: SkinVisuals;
  
  // 預覽圖示
  icon: string;
  previewEmoji?: string;
  
  /**
   * 模型集 ID (新)
   * 若設定，將以指定的模型集繪製塔，並且 1-5 級各有獨立模型
   * 若未設定，使用該塔類型的預設模型（依舊套用 visuals 顏色）
   */
  modelSet?: string;
  
  // 解鎖條件
  unlockCondition: UnlockCondition;
  
  // 元數據
  order?: number;
  hidden?: boolean;
  releaseDate?: string;
}

// 玩家皮膚數據
export interface PlayerSkinData {
  unlockedSkins: string[];           // 已解鎖的皮膚 ID
  equippedSkins: Record<TowerType, string | null>;  // 每種塔裝備的皮膚
  favorites: string[];               // 收藏的皮膚
  favoriteSets?: string[];           // 收藏的模型套裝 ID
  lastViewed?: string;               // 最後查看的皮膚
}

// 皮膚 Store 狀態
export interface SkinStoreState extends PlayerSkinData {
  // 動作
  unlockSkin: (skinId: string) => void;
  equipSkin: (towerType: TowerType, skinId: string | null) => void;
  toggleFavorite: (skinId: string) => void;
  isSkinUnlocked: (skinId: string) => boolean;
  getEquippedSkin: (towerType: TowerType) => string | null;
  getSkinVisuals: (towerType: TowerType) => SkinVisuals | null;
  checkUnlockConditions: () => void;
}

// 稀有度配置
export const SKIN_RARITY_CONFIG: Record<SkinRarity, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
}> = {
  common: {
    label: '普通',
    color: '#9ca3af',
    bgColor: 'rgba(156, 163, 175, 0.1)',
    borderColor: 'rgba(156, 163, 175, 0.3)',
    glowColor: 'rgba(156, 163, 175, 0.3)',
  },
  uncommon: {
    label: '優良',
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
    glowColor: 'rgba(34, 197, 94, 0.3)',
  },
  rare: {
    label: '稀有',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    glowColor: 'rgba(59, 130, 246, 0.3)',
  },
  epic: {
    label: '史詩',
    color: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.1)',
    borderColor: 'rgba(168, 85, 247, 0.3)',
    glowColor: 'rgba(168, 85, 247, 0.3)',
  },
  legendary: {
    label: '傳說',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    glowColor: 'rgba(245, 158, 11, 0.5)',
  },
};

// 類別配置
export const SKIN_CATEGORY_CONFIG: Record<SkinCategory, {
  label: string;
  icon: React.ReactNode;
  description: string;
}> = {
  default: {
    label: '預設',
    icon: React.createElement(PaletteIcon, { className: "w-4 h-4 text-slate-400" }),
    description: '基礎皮膚',
  },
  seasonal: {
    label: '季節限定',
    icon: React.createElement(FlowerIcon, { className: "w-4 h-4 text-pink-400" }),
    description: '季節活動限定皮膚',
  },
  achievement: {
    label: '成就獎勵',
    icon: React.createElement(TrophyIcon, { className: "w-4 h-4 text-yellow-400" }),
    description: '完成成就解鎖',
  },
  special: {
    label: '特殊活動',
    icon: React.createElement(StarIcon, { className: "w-4 h-4 text-purple-400" }),
    description: '特殊活動獲得',
  },
  premium: {
    label: '高級',
    icon: React.createElement(CrownIcon, { className: "w-4 h-4 text-amber-500" }),
    description: '高級皮膚',
  },
};
