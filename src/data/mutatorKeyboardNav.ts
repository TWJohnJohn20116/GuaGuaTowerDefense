export function isMutatorTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
}

/** 突變挑戰方向鍵：在目前篩選清單裡循環切換。 */
export function nextMutatorSelection(
  ids: string[],
  current: string | null,
  direction: 1 | -1,
): string | null {
  if (ids.length === 0) return null;
  if (!current) return ids[0];
  const index = ids.findIndex((id) => id === current);
  if (index < 0) return ids[0];
  return ids[(index + direction + ids.length) % ids.length];
}

export type MutatorHotkeyAction = 'ignore' | 'prev' | 'next' | 'start';

export function resolveMutatorHotkey(input: {
  key: string;
  inTextField: boolean;
}): MutatorHotkeyAction {
  if (input.inTextField) return 'ignore';
  if (input.key === 'ArrowLeft') return 'prev';
  if (input.key === 'ArrowRight') return 'next';
  if (input.key === 'Enter') return 'start';
  return 'ignore';
}
