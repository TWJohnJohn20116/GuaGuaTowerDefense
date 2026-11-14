import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatVictoryNextLabel } from '@/data/victoryNextCopy';
import { zhTW } from '@/i18n/locales/zh-TW';

describe('victory next-level button copy', () => {
  it('fills the next-level action and chapter title into the template', () => {
    expect(formatVictoryNextLabel('{action} · {title}', '下一關', '夜襲港口')).toBe(
      '下一關 · 夜襲港口',
    );
  });

  it('uses Traditional Chinese template that includes the same next-level verb', () => {
    expect(zhTW.game.nextLevelNamed).toMatch(/\{action\}/);
    expect(zhTW.game.nextLevelNamed).toMatch(/\{title\}/);
    expect(zhTW.game.nextLevel).toBe('下一關');
  });

  it('wires the helper into the victory primary button', () => {
    const src = readFileSync(
      resolve(__dirname, '../components/scenes/Victory.tsx'),
      'utf8',
    );
    expect(src).toMatch(/formatVictoryNextLabel/);
    expect(src).toMatch(/nextLevelNamed/);
    expect(src).not.toMatch(/`下一關 · \$\{nextLevelData\.title\}`/);
  });
});
