import { describe, expect, it } from 'vitest';
import { resolveGameEndHotkey } from '@/data/gameEndHotkey';
import { zhTW } from '@/i18n/locales/zh-TW';

describe('game-end Enter hotkey', () => {
  it('triggers the primary action on Enter, and ignores typing or other keys', () => {
    expect(resolveGameEndHotkey('Enter', { inTextField: false })).toBe('primary');
    expect(resolveGameEndHotkey('Enter', { inTextField: true })).toBe('none');
    expect(resolveGameEndHotkey(' ', { inTextField: false })).toBe('none');
    expect(resolveGameEndHotkey('r', { inTextField: false })).toBe('none');
  });

  it('keeps the Enter confirm copy in Traditional Chinese', () => {
    expect(zhTW.game.enterToConfirm).toMatch(/Enter/);
  });
});
