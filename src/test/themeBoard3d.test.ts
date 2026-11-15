import { describe, expect, it } from 'vitest';
import { THEMES } from '@/data/themeData';
import { getBoard3DColors, mixHex, setActiveThemeId } from '@/utils/themeBoard';

describe('3D 場地色', () => {
  it('混色函式正常（半白半黑）', () => {
    expect(mixHex('#ffffff', '#000000', 0.5)).toBe('#808080');
    expect(mixHex('#ffffff', '#000000', 0)).toBe('#ffffff');
    expect(mixHex('#123456', '#000000', 1)).toBe('#000000');
  });

  it('每套主題都推導出完整的 3D 場地色', () => {
    for (const theme of THEMES) {
      setActiveThemeId(theme.id);
      const colors = getBoard3DColors();
      for (const value of Object.values(colors)) {
        expect(value).toMatch(/^#[0-9a-f]{6}$/);
      }
      // 空地與道路必須看得出差別，否則棋盤與路徑糊在一起
      expect(colors.empty).not.toBe(colors.path);
    }
  });

  it('換主題會換掉 3D 場地色（不是寫死一份）', () => {
    setActiveThemeId('coral');
    const coral = getBoard3DColors();
    setActiveThemeId('abyss');
    const abyss = getBoard3DColors();
    expect(abyss.ground).not.toBe(coral.ground);
    expect(abyss.path).not.toBe(coral.path);
    expect(abyss.pathLine).not.toBe(coral.pathLine);
  });
});
