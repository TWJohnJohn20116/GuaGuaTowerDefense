/**
 * 特效生命週期進度（純函式）
 *
 * 同一個死亡/技能動畫，2D canvas 與 3D Three.js 各自算 `(now - startTime) / duration`，
 * 很容易一邊夾制一邊不夾制（過去 3D 死亡碎片用 `min(elapsed/1000, duration/1000)`、
 * 2D 用 `min(1, elapsed/duration)`）。這裡提供唯一一份語意：進度一律 0~1。
 */

export const fxProgress = (startTime: number, duration: number, now: number): number => {
  if (!(duration > 0)) return 1;
  const progress = (now - startTime) / duration;
  if (progress <= 0) return 0;
  if (progress >= 1) return 1;
  return progress;
};

/** 淡出係數：1（剛開始）→ 0（結束） */
export const fxFade = (startTime: number, duration: number, now: number): number =>
  1 - fxProgress(startTime, duration, now);
