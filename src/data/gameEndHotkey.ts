type GameEndHotkeyAction = 'primary' | 'none';

export function isGameEndTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
}

/** 結算畫面：Enter 觸發主按鈕（重試／下一關），輸入框內不觸發。 */
export function resolveGameEndHotkey(
  key: string,
  input: { inTextField: boolean },
): GameEndHotkeyAction {
  if (input.inTextField) return 'none';
  if (key === 'Enter') return 'primary';
  return 'none';
}
