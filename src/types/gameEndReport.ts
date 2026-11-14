/**
 * 單局結算報告 · 供勝利／失敗畫面展示
 */

export interface GameEndDailyConditionRow {
  label: string;
  current: number;
  target: number;
  met: boolean;
  progressedThisSession: boolean;
}

export interface GameEndDailySection {
  challengeName: string;
  conditions: GameEndDailyConditionRow[];
  overallPercent: number;
  newlyCompleted: boolean;
  alreadyCompleted: boolean;
  claimable: boolean;
}

export interface GameEndMutatorSection {
  challengeId: string;
  name: string;
  won: boolean;
  score: number;
  bestScore: number;
  bestScoreImproved: boolean;
  newlyCompleted: boolean;
  claimable: boolean;
}

export interface LastGameEndReport {
  won: boolean;
  wave: number;
  maxWaves: number;
  endless: boolean;
  health: number;
  playTimeSeconds: number;
  damageTaken: number;
  perfectWaves: number;
  wavesCompleted: number;
  enemiesKilled: number;
  towersPlaced: number;
  towersSold: number;
  unlockedAchievementIds: string[];
  dailyChallenge?: GameEndDailySection;
  mutatorChallenge?: GameEndMutatorSection;
}

export function formatPlayTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m <= 0) return `${s} 秒`;
  return `${m} 分 ${s} 秒`;
}
