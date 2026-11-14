import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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

  it('wires Enter into game-over retry and victory next/play-again', () => {
    const over = readFileSync(resolve(__dirname, '../components/scenes/GameOver.tsx'), 'utf8');
    const victory = readFileSync(resolve(__dirname, '../components/scenes/Victory.tsx'), 'utf8');
    expect(over).toMatch(/resolveGameEndHotkey/);
    expect(over).toMatch(/handleQuickRetry/);
    expect(victory).toMatch(/resolveGameEndHotkey/);
    expect(victory).toMatch(/handleNextLevel/);
    expect(zhTW.game.enterToConfirm).toMatch(/Enter/);
  });
});
