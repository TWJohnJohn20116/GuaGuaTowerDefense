import { describe, it, expect } from 'vitest';
import { digitFromKeyCode, towerHotkeyIndexFromDigit } from '@/store/gameHotkeys';

describe('in-game digit hotkeys', () => {
  it('maps Digit0 so EMP Shift+0 can fire', () => {
    expect(digitFromKeyCode('Digit0')).toBe('0');
    expect(digitFromKeyCode('Digit9')).toBe('9');
    expect(digitFromKeyCode('KeyQ')).toBeNull();
  });

  it('does not treat 0 as a tower selection slot', () => {
    expect(towerHotkeyIndexFromDigit('0')).toBeNull();
    expect(towerHotkeyIndexFromDigit('1')).toBe(0);
    expect(towerHotkeyIndexFromDigit('9')).toBe(8);
  });
});
