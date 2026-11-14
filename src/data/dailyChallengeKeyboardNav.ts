type DailyChallengeTabId = 'today' | 'history';
type DailyChallengeHotkeyAction = 'ignore' | 'prev' | 'next' | 'start' | 'claim';

export function isDailyChallengeTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
}

export function nextDailyChallengeTab(
  tab: DailyChallengeTabId,
  direction: 1 | -1,
): DailyChallengeTabId {
  if (direction === 1) return tab === 'today' ? 'history' : 'today';
  return tab === 'today' ? 'history' : 'today';
}

/** 方向鍵切今日／紀錄；Enter 在今日分頁開始未完成的挑戰，或領已完成未領的獎勵。 */
export function resolveDailyChallengeHotkey(input: {
  key: string;
  inTextField: boolean;
  tab: DailyChallengeTabId;
  hasChallenge: boolean;
  completed: boolean;
  claimed: boolean;
}): DailyChallengeHotkeyAction {
  if (input.inTextField) return 'ignore';
  if (input.key === 'ArrowLeft') return 'prev';
  if (input.key === 'ArrowRight') return 'next';
  if (input.key !== 'Enter') return 'ignore';
  if (input.tab !== 'today' || !input.hasChallenge) return 'ignore';
  if (!input.completed) return 'start';
  if (!input.claimed) return 'claim';
  return 'ignore';
}
