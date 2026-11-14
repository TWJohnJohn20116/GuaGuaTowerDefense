export type SettingsEscapeAction = 'ignore' | 'go_back';

export function isSettingsTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
}

/** 設定 Esc：搜尋框與改快捷鍵時交給自己；其餘跟標題列返回同一套（pop 場景歷史）。 */
export function resolveSettingsEscape(input: {
  key: string;
  inTextField: boolean;
  capturingBind: boolean;
}): SettingsEscapeAction {
  if (input.key !== 'Escape') return 'ignore';
  if (input.inTextField || input.capturingBind) return 'ignore';
  return 'go_back';
}
