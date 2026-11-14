/** 2D HUD 視覺開關：傷害數字與螢幕抖動。血條由繪製層直接讀 boolean。 */

export function visibleDamageTexts<T>(texts: T[], showDamageNumbers: boolean): T[] {
  return showDamageNumbers ? texts : [];
}

export function resolveCanvasShakeIntensity(shakeIntensity: number, screenShake: boolean): number {
  if (!screenShake || shakeIntensity <= 0) return 0;
  return shakeIntensity;
}
