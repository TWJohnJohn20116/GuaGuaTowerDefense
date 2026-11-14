type ModIconClearHotkeyAction = 'confirm' | 'cancel' | 'ignore';

export function resolveModIconClearHotkey(key: string): ModIconClearHotkeyAction {
  if (key === 'Enter') return 'confirm';
  if (key === 'Escape') return 'cancel';
  return 'ignore';
}

export function getModIconClearCopy(m: {
  clearCanvas: string;
  confirmClearCanvas: string;
}): { title: string; description: string; confirm: string } {
  return {
    title: m.clearCanvas,
    description: m.confirmClearCanvas,
    confirm: m.clearCanvas,
  };
}
