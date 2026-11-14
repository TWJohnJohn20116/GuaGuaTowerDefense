type PathSelectionEscapeAction = 'ignore' | 'go_back';

export function isPathSelectionTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
}

/** 選圖 Esc：搜尋框自己處理；其餘跟標題列返回同一套（清每日銜接後 pop 場景歷史）。 */
export function resolvePathSelectionEscape(input: {
  key: string;
  inTextField: boolean;
}): PathSelectionEscapeAction {
  if (input.key !== 'Escape') return 'ignore';
  if (input.inTextField) return 'ignore';
  return 'go_back';
}
