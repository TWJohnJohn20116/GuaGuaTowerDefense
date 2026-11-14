type DialogueAdvanceKind = 'reveal' | 'next' | 'complete';

export function isDialogueAdvanceKey(key: string): boolean {
  return key === 'Enter' || key === ' ';
}

export function nextDialogueAdvance(
  isTyping: boolean,
  currentIndex: number,
  totalLines: number,
): DialogueAdvanceKind {
  if (isTyping) return 'reveal';
  if (currentIndex < totalLines - 1) return 'next';
  return 'complete';
}
