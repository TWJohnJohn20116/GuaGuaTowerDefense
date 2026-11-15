import { describe, expect, it } from 'vitest';
import {
  DEFAULT_THEME_ID,
  THEMES,
  THEME_IDS,
  getTheme,
  isThemeId,
  themeCssVars,
} from '@/data/themeData';
import { contrastRatio, findContrastFailures, TEXT_CONTRAST_REQUIREMENTS } from '@/data/themeContrast';

describe('主題色票', () => {
  it('至少 8 套，且 id 不重複', () => {
    expect(THEMES.length).toBeGreaterThanOrEqual(8);
    expect(new Set(THEME_IDS).size).toBe(THEMES.length);
  });

  it('兩種模式都有，深色至少 2 套', () => {
    expect(THEMES.filter((theme) => theme.mode === 'dark').length).toBeGreaterThanOrEqual(2);
    expect(THEMES.some((theme) => theme.mode === 'light')).toBe(true);
  });

  it('每套主題都產出完整的文字與按鈕角色變數', () => {
    for (const theme of THEMES) {
      const vars = themeCssVars(theme);
      expect(vars['--cn-paper']).toBeTruthy();
      expect(vars['--cn-ink']).toBeTruthy();
      expect(vars['--cn-accent-text']).toBeTruthy();
      expect(vars['--cn-cta']).toBeTruthy();
      expect(vars['--cn-on-cta']).toBeTruthy();
      expect(vars['--cn-glow-1']).toContain('rgba(');
    }
  });

  it('未知 id 回退預設主題，存檔壞掉也不會讓畫面空白', () => {
    expect(isThemeId('coral')).toBe(true);
    expect(isThemeId('nope')).toBe(false);
    expect(getTheme('nope' as typeof DEFAULT_THEME_ID).id).toBe(DEFAULT_THEME_ID);
  });
});

describe('主題文字對比（WCAG AA）', () => {
  it('對比函式本身正確', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
  });

  it('檢查項目涵蓋標題、說明字、徽章與主要按鈕', () => {
    const names = TEXT_CONTRAST_REQUIREMENTS.map((req) => req.name).join('|');
    expect(names).toContain('正文墨');
    expect(names).toContain('四階墨');
    expect(names).toContain('主要按鈕字');
    expect(names).toContain('強調色文字');
  });

  it('12 套主題的每一條文字門檻都過', () => {
    expect(THEMES.flatMap(findContrastFailures)).toEqual([]);
  });
});
