/**
 * 每日挑戰系統型別定義
 * Daily Challenge System Type Definitions
 */

import type React from 'react';

// 難度
export type DailyChallengeDifficulty = 'easy' | 'medium' | 'hard';

// 條件類型（沿用部分成就系統概念，但獨立追蹤）
export type DailyChallengeConditionType =
  | 'win_game'                    // 勝利一場遊戲（任意條件）
  | 'win_difficulty'              // 在指定難度勝利
  | 'win_speed'                   // 在 X 秒內贏得遊戲
  | 'win_no_damage'               // 無傷通關
  | 'win_full_hp'                 // 滿血通關
  | 'win_thrifty'                 // 花費少於 X 金錢通關
  | 'kill_enemies'                // 一場遊戲擊殺 X 個敵人
  | 'kill_enemy_type'             // 一場遊戲擊殺 X 個指定敵人類型
  | 'kill_bosses'                 // 一場遊戲擊殺 X 個 Boss
  | 'place_towers'                // 一場遊戲放置 X 座塔
  | 'place_tower_type'            // 一場遊戲放置 X 座指定塔類型
  | 'place_tower_variety'         // 一場遊戲使用 X 種不同的塔
  | 'tower_max_level'             // 一場遊戲讓 X 座塔升至滿級
  | 'perfect_waves'               // 一場遊戲完成 X 個無傷波次
  | 'reach_endless_wave'          // 在無盡模式達到第 X 波
  | 'earn_money'                  // 一場遊戲累積超過 X 金錢
  | 'fuse_towers'                 // 一場遊戲融合 X 次
  | 'win_wave_set';               // 用指定波次組勝利

// 條件
export interface DailyChallengeCondition {
  type: DailyChallengeConditionType;
  /** 目標數值 */
  target: number;
  /** 特定敵人類型（kill_enemy_type 用） */
  enemyType?: string;
  /** 特定塔類型（place_tower_type 用） */
  towerType?: string;
  /** 特定難度（win_difficulty 用） */
  difficulty?: string;
  /** 特定波次組（win_wave_set 用） */
  waveSetId?: string;
  /** 顯示用文字 */
  label: string;
}

// 獎勵
export interface DailyChallengeReward {
  /** 金幣 */
  coins?: number;
  /** 成就點數 */
  achievementPoints?: number;
  /** 天賦點 */
  talentPoints?: number;
  /** 特殊稱號 */
  title?: string;
}

// 挑戰模板（資料檔定義）
export interface DailyChallengeTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  difficulty: DailyChallengeDifficulty;
  conditions: DailyChallengeCondition[];
  rewards: DailyChallengeReward;
  /** 提示 */
  tips?: string;
}

// 即時挑戰（已綁定日期）
export interface DailyChallengeInstance {
  id: string;                            // template.id
  date: string;                          // YYYY-MM-DD
  template: DailyChallengeTemplate;
  /** 各條件的目前進度 */
  progress: number[];
  /** 是否完成 */
  completed: boolean;
  /** 完成時間戳 */
  completedAt?: number;
  /** 獎勵是否已領取 */
  claimed: boolean;
  claimedAt?: number;
}

// 玩家每日挑戰狀態
export interface DailyChallengeState {
  /** 今日挑戰 */
  todayChallenge: DailyChallengeInstance | null;
  /** 上次檢查日期 */
  lastCheckDate: string;
  /** 累計完成挑戰數 */
  totalCompleted: number;
  /** 目前連續完成天數 */
  currentStreak: number;
  /** 歷史最佳連續完成天數 */
  longestStreak: number;
  /** 過去 30 天紀錄（按日期由新到舊） */
  history: DailyChallengeHistoryEntry[];
}

export interface DailyChallengeHistoryEntry {
  date: string;            // YYYY-MM-DD
  templateId: string;
  completed: boolean;
}

// ============ 顏色與標籤 ============

export const DAILY_CHALLENGE_DIFFICULTY_CONFIG: Record<
  DailyChallengeDifficulty,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  easy: {
    label: '輕鬆',
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  medium: {
    label: '一般',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  hard: {
    label: '挑戰',
    color: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.1)',
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
};
