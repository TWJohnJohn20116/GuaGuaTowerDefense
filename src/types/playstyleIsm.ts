/**
 * 玩法流派主義 · 局內追蹤型別
 */

/** 單局主義相關統計（存在 achievementStore.currentGameStats.playstyle） */
export interface PlaystyleSessionStats {
  /** 第一座塔建造時的波次（null = 本局未建塔） */
  firstTowerWave: number | null;
  /** 最後一座塔建造時的波次 */
  lastTowerWave: number;
  /** 第一波開始前（currentWave === 0）建造的塔數 */
  towersBuiltBeforeWave1: number;
  /** 本局暫停次數 */
  pauseCount: number;
  /** 本局使用主動技能次數 */
  skillsUsedThisGame: number;
  /** 開局起始資金快照 */
  startingMoney: number;
  /** 第 4 波開始前（wave <= 3）的升級次數 */
  upgradesBeforeWave4: number;
  /** 各塔型本局升級次數 */
  upgradesByTowerType: Record<string, number>;
}

export const getInitialPlaystyleSession = (startingMoney = 0): PlaystyleSessionStats => ({
  firstTowerWave: null,
  lastTowerWave: 0,
  towersBuiltBeforeWave1: 0,
  pauseCount: 0,
  skillsUsedThisGame: 0,
  startingMoney,
  upgradesBeforeWave4: 0,
  upgradesByTowerType: {},
});

/** 遊戲結束時傳入的額外上下文 */
export interface PlaystyleGameEndContext {
  maxWaves: number;
  gameSpeed: number;
  finalMoney: number;
  /** 本局所有塔是否皆滿級 */
  allTowersMaxLevel: boolean;
  /** 本局所有塔是否皆為 Lv1 */
  allTowersLevel1: boolean;
  maxTowerLevel: number;
  /** 滿級塔數量 */
  maxLevelTowerCount: number;
  /** 僅一座滿級、其餘皆 Lv1 */
  soloMaxLevelRestLv1: boolean;
}
