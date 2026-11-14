import type { DifficultyModifiers } from './game';

export interface DialogueLine {
  speaker: string;
  avatar?: string;
  text: string;
  expression?: 'normal' | 'happy' | 'angry' | 'surprised' | 'serious';
}

export interface CampaignLevel {
  id: string;
  chapter: number;
  level: number;
  title: string;
  description: string;
  mapId: string;
  preBattleDialogue?: DialogueLine[];
  postBattleDialogue?: DialogueLine[];
  specialRules?: string[]; // 顯示給玩家看的特殊規則描述
  modifiers?: Partial<DifficultyModifiers>; // 實際套用的遊戲修改器
  maxWaves?: number; // 該關卡的總波次
  rewards: {
    coins: number;
    talentPoints: number;
    unlockTower?: string[];
  };
  isBossLevel?: boolean;
}

export interface CampaignChapter {
  id: string;
  chapterNumber: number;
  title: string;
  levels: CampaignLevel[];
}