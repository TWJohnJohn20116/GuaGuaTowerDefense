/**
 * 戰役關卡星數計算
 *
 * 統一所有「3 星 / 2 星 / 1 星」評定邏輯與 UI 描述來源。
 * 之前 `Victory.tsx` 與 `useGameSceneEffects.ts` 各自硬編碼絕對值
 * `health >= 80 / 50`，但 `INITIAL_HEALTH = 10`，造成戰役玩家
 * 永遠只能拿 1 星。本檔以「剩餘血量百分比」為唯一判定依據，
 * 並把門檻調寬鬆，讓滿星更容易達成。
 */
import { GAME_CONSTANTS } from '@/data/gameData';

export type CampaignStarRating = 1 | 2 | 3;

/**
 * 星數門檻：以 `health / startingHealth` 比值為單位。
 *
 * - `three`：剩餘血量 ≥ 50% 拿三星
 * - `two`：剩餘血量 ≥ 20% 拿兩星
 * - 其他完成情況：保底 1 星
 */
export const STAR_THRESHOLDS = {
  three: 0.5,
  two: 0.2,
} as const;

/**
 * 計算戰役關卡的星數評級。
 *
 * @param health         結算當下的剩餘生命
 * @param startingHealth 該局的起始生命（=分母）；省略則退回預設 `INITIAL_HEALTH`
 */
export function calculateCampaignStars(
  health: number,
  startingHealth?: number,
): CampaignStarRating {
  const denom = (startingHealth ?? GAME_CONSTANTS.INITIAL_HEALTH) || GAME_CONSTANTS.INITIAL_HEALTH;
  if (denom <= 0) return 1;

  const ratio = Math.max(0, health) / denom;
  if (ratio >= STAR_THRESHOLDS.three) return 3;
  if (ratio >= STAR_THRESHOLDS.two) return 2;
  return 1;
}

/**
 * 取得三星挑戰條件描述（百分比門檻字串）。
 * 由 UI 端統一引用，避免再出現「文字寫 ≥ 80 但邏輯卻是百分比」的不一致。
 */
export function getStarRequirementPercents(): {
  twoStarPercent: number;
  threeStarPercent: number;
} {
  return {
    twoStarPercent: Math.round(STAR_THRESHOLDS.two * 100),
    threeStarPercent: Math.round(STAR_THRESHOLDS.three * 100),
  };
}
