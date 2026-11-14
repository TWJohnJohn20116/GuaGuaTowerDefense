/**
 * 突變挑戰型別定義
 * Mutator Challenge type definitions
 *
 * 突變挑戰 = 固定地圖 + 固定難度 + 一組「規則型」突變（禁用塔類、敵人全域詞綴、
 * 禁止賣塔、無被動收入）。與純數值的 DifficultyModifiers 不同，這些規則在遊戲
 * 迴圈內強制生效。
 */

import type React from 'react';
import type { GameDifficulty, TowerType } from './game';

/** 套用到全場敵人的全域詞綴（於 spawn 時注入敵人物件） */
interface EnemyAffix {
  /** 血量乘算（套在難度修正後的 health/maxHealth 上） */
  healthMult?: number;
  /** 速度乘算 */
  speedMult?: number;
  /** 額外護盾（加到 shield/maxShield） */
  shieldAdd?: number;
  /** 每次受擊的額外固定減傷（per-enemy，經統一傷害管線生效） */
  armorBonus?: number;
}

/** 突變規則：在遊戲迴圈內強制生效的玩法限制 */
export interface MutatorRules {
  /** 禁止建造的塔類型 */
  bannedTowerTypes?: TowerType[];
  /** 全場敵人詞綴 */
  enemyAffix?: EnemyAffix;
  /** 禁止賣塔 */
  sellingDisabled?: boolean;
  /** 停用塔的被動收入（money 塔不再產金） */
  interestDisabled?: boolean;
  /** 此波次之前（含）禁止建造塔（currentWave < buildLockUntilWave 時禁建） */
  buildLockUntilWave?: number;
  /** 禁用主動技能（塔技能與玩家技能） */
  skillsDisabled?: boolean;
}

/** 單一策劃挑戰 */
export interface MutatorChallenge {
  id: string;
  /** 顯示名稱（直接中文，比照 dailyChallengeData） */
  name: string;
  description: string;
  /** framer-motion 圖示元素 */
  icon: React.ReactNode;
  /** 主題色（影響卡片強調色） */
  accent: 'orange' | 'cyan' | 'red' | 'purple' | 'green' | 'yellow';
  /** 難度標示（僅供排序/顯示） */
  tier: 'easy' | 'medium' | 'hard' | 'extreme';
  /** 固定地圖（PATHS key） */
  mapId: string;
  /** 基礎難度 */
  difficulty: GameDifficulty;
  /** 是否無盡（true 時 maxWaves 視為 0） */
  endless?: boolean;
  /** 固定波數 */
  maxWaves: number;
  /** 鎖定官方或 Mod 波次組（開局會傳入 startGame） */
  customWaveSetId?: string;
  /** 突變規則 */
  rules: MutatorRules;
  /** 完成獎勵 */
  rewards: { coins?: number; talentPoints?: number };
  /** 戰術提示 */
  tips?: string;
  /** 顯示用標籤（例如「禁狙擊塔」「敵人狂暴」「不能賣塔」） */
  tags: string[];
}

/** 單一挑戰的進度紀錄 */
export interface MutatorChallengeRecord {
  completed: boolean;
  /** 歷來最佳分數 */
  bestScore: number;
  completedAt?: number;
  /** 獎勵是否已領取 */
  claimed: boolean;
}

/** 提交給進度 store 的結算結果 */
export interface MutatorGameOutcome {
  challengeId: string;
  won: boolean;
  score: number;
}
