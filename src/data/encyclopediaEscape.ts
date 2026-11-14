export type EncyclopediaEscapeAction = 'ignore' | 'close_detail' | 'go_back';

export function isEncyclopediaTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
}

/** 圖鑑 Esc：先關詳情，再跟標題列返回鈕一樣離開頁面；搜尋框內不觸發。 */
export function resolveEncyclopediaEscape(input: {
  key: string;
  inTextField: boolean;
  hasDetail: boolean;
}): EncyclopediaEscapeAction {
  if (input.key !== 'Escape') return 'ignore';
  if (input.inTextField) return 'ignore';
  if (input.hasDetail) return 'close_detail';
  return 'go_back';
}
