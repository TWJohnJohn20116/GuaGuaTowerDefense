type TalentEscapeAction = 'ignore' | 'close_detail' | 'go_back';

export function isTalentTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
}

/** 天賦 Esc：重置彈窗自己處理；先關節點詳情，再跟標題列一樣回主選單。 */
export function resolveTalentEscape(input: {
  key: string;
  inTextField: boolean;
  hasResetModal: boolean;
  hasDetail: boolean;
}): TalentEscapeAction {
  if (input.key !== 'Escape') return 'ignore';
  if (input.inTextField) return 'ignore';
  if (input.hasResetModal) return 'ignore';
  if (input.hasDetail) return 'close_detail';
  return 'go_back';
}
