/**
 * 設定 · 共用小零件（HARDLINE）
 *
 * keyCodeToDisplayName：鍵位代碼 → 顯示名（暫停選單也共用）
 * LanguageButton：語言選項（方角、1px 線、選中訊號膜）
 * KeyBindingItem：鍵位列（保留給舊呼叫端，樣式與設定列一致）
 */

import { useEffect, type ReactNode } from 'react';
import type { KeyAction } from '@/types/game';
import { SettingsChoiceButton } from './settingsChoice';

export type SettingsTab = 'general' | 'audio' | 'controls' | 'about';

export const keyCodeToDisplayName = (code: string): string => {
  const keyMap: Record<string, string> = {
    KeyA: 'A', KeyB: 'B', KeyC: 'C', KeyD: 'D', KeyE: 'E',
    KeyF: 'F', KeyG: 'G', KeyH: 'H', KeyI: 'I', KeyJ: 'J',
    KeyK: 'K', KeyL: 'L', KeyM: 'M', KeyN: 'N', KeyO: 'O',
    KeyP: 'P', KeyQ: 'Q', KeyR: 'R', KeyS: 'S', KeyT: 'T',
    KeyU: 'U', KeyV: 'V', KeyW: 'W', KeyX: 'X', KeyY: 'Y',
    KeyZ: 'Z',
    Digit0: '0', Digit1: '1', Digit2: '2', Digit3: '3',
    Digit4: '4', Digit5: '5', Digit6: '6', Digit7: '7',
    Digit8: '8', Digit9: '9',
    Space: 'Space', Enter: 'Enter', Escape: 'ESC',
    Tab: 'Tab', Backspace: 'Backspace',
    'ArrowUp': 'Up', 'ArrowDown': 'Down', 'ArrowLeft': 'Left', 'ArrowRight': 'Right',
    ShiftLeft: 'L-Shift', ShiftRight: 'R-Shift',
    ControlLeft: 'L-Ctrl', ControlRight: 'R-Ctrl',
    AltLeft: 'L-Alt', AltRight: 'R-Alt',
  };

  return keyMap[code] || code;
};

/** 相容轉出：暫停選單仍使用 @/components/ui/VolumeSlider */
export { VolumeSlider } from '@/components/ui/VolumeSlider';

const KeyBindingItem = ({
  label,
  action,
  currentKey,
  isEditing,
  onStartEdit,
  onKeyCapture,
  icon,
}: {
  label: string;
  action: KeyAction;
  currentKey: string;
  isEditing: boolean;
  onStartEdit: () => void;
  onKeyCapture: (action: KeyAction, key: string) => void;
  icon: ReactNode;
}) => {
  useEffect(() => {
    if (!isEditing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onKeyCapture(action, e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, action, onKeyCapture]);

  return (
    <button
      type="button"
      onClick={onStartEdit}
      className={[
        'flex items-center justify-between gap-3 border px-3 py-2 transition-colors duration-150',
        isEditing
          ? 'border-[var(--hl-signal)] bg-[var(--hl-signal-veil)]'
          : 'border-[var(--hl-line)] bg-transparent hover:border-[var(--hl-line-hot)] hover:bg-[var(--hl-deck-2)]',
      ].join(' ')}
    >
      <span className="flex min-w-0 items-center gap-2">
        <span className="flex h-4 w-4 shrink-0 items-center justify-center text-[var(--hl-ink-3)]">
          {icon}
        </span>
        <span className="truncate text-[12.5px] text-[var(--hl-ink-2)]">{label}</span>
      </span>
      <kbd
        className={[
          'shrink-0 border px-2 py-0.5 font-mono text-[11px] tabular-nums',
          isEditing
            ? 'border-[var(--hl-signal)] bg-[var(--hl-signal)] text-[var(--hl-signal-ink)]'
            : 'border-[var(--hl-line-strong)] bg-[var(--hl-void-2)] text-[var(--hl-ink-2)]',
        ].join(' ')}
      >
        {keyCodeToDisplayName(currentKey)}
      </kbd>
    </button>
  );
};

export const LanguageButton = ({
  name,
  selected,
  onClick,
}: {
  name: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <SettingsChoiceButton active={selected} onClick={onClick} className="truncate">
    {name}
  </SettingsChoiceButton>
);
