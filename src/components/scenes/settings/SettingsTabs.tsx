/**
 * 設定 · 共用小零件（HARDLINE）
 *
 * keyCodeToDisplayName：鍵位代碼 → 顯示名（暫停選單也共用）
 * LanguageButton：語言選項（方角、1px 線、選中訊號膜）
 */

import { SettingsChoiceButton } from './settingsChoice';
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
