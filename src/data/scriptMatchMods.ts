/**
 * 腳本調整難度（action.setDifficulty）的落地規則
 *
 * 為什麼要夾總量：指令是「乘上目前倍率」，而 onTick 這類事件會反覆觸發，
 * 若只夾單次倍率（0.1~10），接一條每幀觸發的規則就能把敵人血量乘到天文數字。
 * 這裡改為「乘完之後把總量夾在 0.1~10」，讓反覆觸發飽和在一個可預期的上限。
 */

export interface ScriptDifficultyMods {
  enemyHealthMult: number;
  enemySpeedMult: number;
  enemyRewardMult: number;
}

export interface ScriptDifficultyCommand {
  healthMult?: number;
  speedMult?: number;
  rewardMult?: number;
}

/** 難度倍率的總量上下限（與 UI 的難度倍率顯示範圍一致） */
export const SCRIPT_DIFFICULTY_MIN = 0.1;
export const SCRIPT_DIFFICULTY_MAX = 10;

export function clampDifficulty(value: number, fallback = 1): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(SCRIPT_DIFFICULTY_MAX, Math.max(SCRIPT_DIFFICULTY_MIN, value));
}

/** 把一次指令套到現有難度倍率上，並夾住總量 */
export function applyDifficultyCommand<T extends ScriptDifficultyMods>(
  current: T,
  command: ScriptDifficultyCommand,
): T {
  return {
    ...current,
    enemyHealthMult: clampDifficulty(current.enemyHealthMult * (command.healthMult ?? 1), current.enemyHealthMult),
    enemySpeedMult: clampDifficulty(current.enemySpeedMult * (command.speedMult ?? 1), current.enemySpeedMult),
    enemyRewardMult: clampDifficulty(current.enemyRewardMult * (command.rewardMult ?? 1), current.enemyRewardMult),
  };
}
