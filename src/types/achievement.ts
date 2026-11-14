/**
 * 成就系統類型定義
 * Achievement System Type Definitions
 */

import React from 'react';
import { 
  ChartIcon, TowerIcon, AlienIcon, MapIcon, TrophyIcon, 
  BooksIcon, CalendarIcon, QuestionMarkIcon, 
  CrystalBallIcon, StarIcon, TimerIcon, ShieldIcon, MoneyBagIcon, TargetIcon 
} from '@/components/ui/Icons';

// 成就類型
export type AchievementCategory = 
  | 'progress'    // 遊戲進度
  | 'tower'       // 塔相關
  | 'enemy'       // 敵人相關
  | 'map'         // 地圖相關
  | 'challenge'   // 挑戰相關
  | 'collection'  // 收藏相關
  | 'weekly'      // 每週成就
  | 'hidden'      // 隱藏成就
  | 'rare'        // 稀有成就
  | 'legendary'   // 傳說成就
  | 'speedrun'    // 速通成就
  | 'noDamage'    // 無傷成就
  | 'economy'     // 節約成就
  | 'milestone';  // 里程碑成就

// 成就稀有度
export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

// 成就狀態
export type AchievementStatus = 'locked' | 'in_progress' | 'completed' | 'claimed';

// 成就條件類型
export type AchievementConditionType = 
  | 'games_played'         // 遊戲場數
  | 'games_won'            // 勝利場數
  | 'waves_completed'      // 完成波次
  | 'enemies_killed'       // 擊殺敵人
  | 'enemy_type_killed'    // 擊殺特定敵人
  | 'towers_placed'        // 放置塔數
  | 'tower_type_placed'    // 放置特定塔
  | 'towers_upgraded'      // 升級塔數
  | 'towers_max_level'     // 最高等級塔數
  | 'money_earned'         // 賺取金錢
  | 'money_spent'          // 花費金錢
  | 'damage_dealt'         // 造成傷害
  | 'damage_taken'         // 承受傷害
  | 'perfect_waves'        // 完美波次（無傷）
  | 'maps_completed'       // 完成地圖
  | 'map_completed'        // 完成特定地圖
  | 'difficulty_completed' // 完成特定難度
  | 'score_reached'        // 達到分數
  | 'time_played'          // 遊戲時間
  | 'boss_killed'          // 擊殺Boss
  | 'no_damage_wave'       // 無傷完成波次
  | 'no_damage_game'       // 無傷通關
  | 'speedrun'             // 速通
  | 'tower_sells'          // 出售塔數
  | 'skills_used'          // 使用技能次數
  | 'endless_waves'        // 無盡模式波次
  | 'total_playtime'       // 總遊戲時間
  | 'login_days'           // 登入天數
  | 'consecutive_days'     // 連續登入
  | 'mods_created'         // 創建模組
  | 'mods_used'            // 使用模組
  | 'towers_fused'          // 融合塔次數
  | 'tactical_protocols'    // 戰術協議選擇次數
  | 'tactical_protocol_types' // 戰術協議種類數
  | 'complete_map'
  | 'perfect_map'
  | 'build_tower'
  | 'upgrade_tower'
  | 'max_upgrade_tower'
  | 'build_all_types'
  | 'kill_enemy'
  | 'kill_boss'
  | 'complete_unique_maps'
  | '3star_all_maps'
  | 'complete_wave_set'
  | 'custom';              // 自定義條件

// 成就條件
interface AchievementCondition {
  type: AchievementConditionType;
  target: number;               // 目標數值
  current?: number;             // 當前進度
  enemyType?: string;           // 特定敵人類型
  towerType?: string;           // 特定塔類型
  mapId?: string;               // 特定地圖
  waveSetId?: string;           // 特定波次組
  difficulty?: string;          // 特定難度
  timeLimit?: number;           // 時間限制（秒）
}

// 成就獎勵類型
type AchievementRewardType = 
  | 'points'      // 成就點數
  | 'title'       // 稱號
  | 'badge'       // 徽章
  | 'skin'        // 皮膚
  | 'theme'       // 主題
  | 'currency'    // 貨幣
  | 'unlock';     // 解鎖內容

// 成就獎勵
interface AchievementReward {
  type: AchievementRewardType;
  value: number | string;
  name?: string;
  description?: string;
  icon?: string | React.ReactNode;
}

// 成就定義
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string | React.ReactNode;
  category: AchievementCategory;
  rarity: AchievementRarity;
  conditions: AchievementCondition[];
  rewards: AchievementReward[];
  hidden?: boolean;             // 是否隱藏
  secret?: boolean;             // 是否為秘密成就（完成前不顯示名稱）
  prerequisite?: string[];      // 前置成就
  order?: number;               // 排序順序
  tips?: string;                // 提示
}

// 玩家成就進度
export interface PlayerAchievement {
  id: string;
  status: AchievementStatus;
  progress: number[];           // 對應各條件的進度
  unlockedAt?: number;          // 解鎖時間戳
  claimedAt?: number;           // 領取時間戳
}

// 成就統計
export interface AchievementStats {
  totalAchievements: number;
  completedAchievements: number;
  claimedAchievements: number;
  totalPoints: number;
  earnedPoints: number;
  completionRate: number;
  byCategory: Record<AchievementCategory, { total: number; completed: number }>;
  byRarity: Record<AchievementRarity, { total: number; completed: number }>;
  recentUnlocks: string[];      // 最近解鎖的成就ID
}

// 成就通知
export interface AchievementNotification {
  id: string;
  achievementId: string;
  type: 'unlock' | 'progress' | 'claim';
  timestamp: number;
  dismissed: boolean;
}

// 遊戲統計（用於成就追蹤）
export interface GameStatistics {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  wavesCompleted: number;
  totalEnemiesKilled: number;
  enemiesKilledByType: Record<string, number>;
  totalTowersPlaced: number;
  towersPlacedByType: Record<string, number>;
  totalTowersUpgraded: number;
  totalTowersSold: number;
  towersReachedMaxLevel: number;
  totalMoneyEarned: number;
  totalMoneySpent: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  perfectWaves: number;
  bossesKilled: number;
  mapsCompleted: Record<string, number>;
  waveSetsCompleted: Record<string, number>;
  difficultiesCompleted: Record<string, number>;
  chaptersCompleted: number;
  highestScore: number;
  highestWave: number;
  fastestWin: number;           // 最快通關時間（秒）
  noDamageGames: number;
  endlessHighestWave: number;
  totalPlaytime: number;        // 總遊戲時間（秒）
  skillsUsed: number;
  modsCreated: number;
  modsUsed: number;
  totalTowerFusions: number;
  loginDays: number;
  consecutiveLoginDays: number;
  lastLoginDate: string;
  // ============ 進階追蹤（Bonus + World 成就用） ============
  winStreak: number;                          // 目前連勝場數
  bestWinStreak: number;                      // 歷史最佳連勝
  fullHpWins: number;                         // 滿血通關次數
  towerTypesReachedMaxLevel: string[];        // 至少滿級過一次的塔類型
  unlockedSkinsCount: number;                 // 已解鎖皮膚數（鏡像自 skinStore）
  equippedNonDefaultSkinsCount: number;       // 已裝備過非預設皮膚的塔數
  totalSkinsCount: number;                    // 全皮膚總數（鏡像自 skinStore）
  timeFlags: Record<string, boolean>;         // 時間／日期相關隱藏觸發紀錄
  tacticalProtocolsChosen: number;
  tacticalProtocolTypes: string[];
  towerSynergyTypes: string[];
  towerSynergyMaxKinds: number;
}

// 稀有度配置
export const RARITY_CONFIG: Record<AchievementRarity, {
  color: string;
  bgColor: string;
  borderColor: string;
  points: number;
  label: string;
}> = {
  common: {
    color: '#9ca3af',
    bgColor: 'rgba(156, 163, 175, 0.1)',
    borderColor: 'rgba(156, 163, 175, 0.3)',
    points: 5,
    label: '普通',
  },
  uncommon: {
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
    points: 10,
    label: '稀有',
  },
  rare: {
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    points: 25,
    label: '精良',
  },
  epic: {
    color: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.1)',
    borderColor: 'rgba(168, 85, 247, 0.3)',
    points: 50,
    label: '史詩',
  },
  legendary: {
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    points: 100,
    label: '傳說',
  },
};

// 類別配置
export const CATEGORY_CONFIG: Record<AchievementCategory, {
  icon: React.ReactNode;
  label: string;
  description: string;
}> = {
  progress: { icon: React.createElement(ChartIcon, { className: "w-4 h-4 text-blue-400" }), label: '遊戲進度', description: '遊戲基礎進度相關成就' },
  tower: { icon: React.createElement(TowerIcon, { className: "w-4 h-4 text-amber-400" }), label: '塔防大師', description: '防禦塔相關成就' },
  enemy: { icon: React.createElement(AlienIcon, { className: "w-4 h-4 text-red-400" }), label: '獵殺者', description: '敵人相關成就' },
  map: { icon: React.createElement(MapIcon, { className: "w-4 h-4 text-emerald-400" }), label: '探索者', description: '地圖相關成就' },
  challenge: { icon: React.createElement(TrophyIcon, { className: "w-4 h-4 text-yellow-400" }), label: '挑戰者', description: '挑戰相關成就' },
  collection: { icon: React.createElement(BooksIcon, { className: "w-4 h-4 text-indigo-400" }), label: '收藏家', description: '收藏相關成就' },
  weekly: { icon: React.createElement(CalendarIcon, { className: "w-4 h-4 text-purple-400" }), label: '每週挑戰', description: '每週刷新的成就' },
  hidden: { icon: React.createElement(QuestionMarkIcon, { className: "w-4 h-4 text-slate-400" }), label: '隱藏成就', description: '神秘的隱藏成就' },
  rare: { icon: React.createElement(CrystalBallIcon, { className: "w-4 h-4 text-fuchsia-400" }), label: '稀有收藏', description: '稀有成就' },
  legendary: { icon: React.createElement(StarIcon, { className: "w-4 h-4 text-yellow-500" }), label: '傳說殿堂', description: '傳說級成就' },
  speedrun: { icon: React.createElement(TimerIcon, { className: "w-4 h-4 text-sky-400" }), label: '速度之王', description: '速通相關成就' },
  noDamage: { icon: React.createElement(ShieldIcon, { className: "w-4 h-4 text-emerald-500" }), label: '完美防守', description: '無傷相關成就' },
  economy: { icon: React.createElement(MoneyBagIcon, { className: "w-4 h-4 text-amber-500" }), label: '經濟專家', description: '金錢相關成就' },
  milestone: { icon: React.createElement(TargetIcon, { className: "w-4 h-4 text-red-500" }), label: '里程碑', description: '重要里程碑成就' },
};
