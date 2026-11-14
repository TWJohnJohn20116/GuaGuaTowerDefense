export const GAME_SPEED_PRESETS = [0.5, 1, 2, 3, 5] as const;

/** 空白鍵循環：對齊底欄／暫停選單同一組倍率；教學 10x 等殘值會接到下一個預設。 */
export function nextGameSpeed(current: number): number {
  const exact = GAME_SPEED_PRESETS.indexOf(current as (typeof GAME_SPEED_PRESETS)[number]);
  if (exact >= 0) {
    return GAME_SPEED_PRESETS[(exact + 1) % GAME_SPEED_PRESETS.length];
  }
  return GAME_SPEED_PRESETS.find((speed) => speed > current) ?? GAME_SPEED_PRESETS[0];
}
