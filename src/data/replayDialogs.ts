export type ReplayConfirmKind = 'delete' | 'clearAll' | 'replayThis' | 'deleteNote';
type ReplayDialogHotkeyAction = 'confirm' | 'cancel' | 'ignore';
type ReplayRenameDraftAction = 'apply' | 'ignore';

export function resolveReplayDialogHotkey(key: string): ReplayDialogHotkeyAction {
  if (key === 'Enter') return 'confirm';
  if (key === 'Escape') return 'cancel';
  return 'ignore';
}

/** 空白或沒改過的名稱不送出。 */
export function resolveReplayRenameDraft(input: {
  draft: string;
  original: string;
}): ReplayRenameDraftAction {
  const name = input.draft.trim();
  if (!name || name === input.original) return 'ignore';
  return 'apply';
}

interface ReplayConfirmCopySource {
  delete: string;
  confirmDelete: string;
  clearAll: string;
  confirmClearAll: string;
  replayThis: string;
  confirmReplayThis: string;
  deleteNote: string;
  confirmDeleteNote: string;
}

export function getReplayConfirmCopy(
  kind: ReplayConfirmKind,
  r: ReplayConfirmCopySource,
): { title: string; description: string; confirm: string } {
  switch (kind) {
    case 'delete':
      return { title: r.delete, description: r.confirmDelete, confirm: r.delete };
    case 'clearAll':
      return { title: r.clearAll, description: r.confirmClearAll, confirm: r.clearAll };
    case 'replayThis':
      return { title: r.replayThis, description: r.confirmReplayThis, confirm: r.replayThis };
    case 'deleteNote':
      return { title: r.deleteNote, description: r.confirmDeleteNote, confirm: r.deleteNote };
  }
}
