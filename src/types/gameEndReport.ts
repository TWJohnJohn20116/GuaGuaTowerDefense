/**
 * 單局結算報告 · 供勝利／失敗畫面展示
 */

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
}

export function formatPlayTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m <= 0) return `${s} 秒`;
  return `${m} 分 ${s} 秒`;
}
