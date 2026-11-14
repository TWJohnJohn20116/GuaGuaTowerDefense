export const LOADING_TIP_CLASS = 'text-xs tracking-[0.15em] text-white/75';

export function nextLoadingTipIndex(current: number, count: number): number {
  if (count <= 0) return 0;
  return (current + 1) % count;
}

export function loadingTipAt(tips: string[] | undefined, index: number): string {
  if (!tips || tips.length === 0) return '';
  return tips[((index % tips.length) + tips.length) % tips.length] ?? '';
}

/** 關閉「遊戲提示」時載入畫面不顯示循環提示。 */
export function visibleLoadingTip(
  tips: string[] | undefined,
  index: number,
  showTips: boolean,
): string {
  if (!showTips) return '';
  return loadingTipAt(tips, index);
}
