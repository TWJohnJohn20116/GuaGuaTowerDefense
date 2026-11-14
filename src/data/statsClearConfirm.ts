export type StatsClearHotkeyAction = 'confirm' | 'cancel' | 'ignore';

export function resolveStatsClearHotkey(key: string): StatsClearHotkeyAction {
  if (key === 'Enter') return 'confirm';
  if (key === 'Escape') return 'cancel';
  return 'ignore';
}
