/**
 * 場景外殼設計 token 契約（HARDLINE）
 *
 * 這裡取代了四支「讀 .tsx 原始碼、用正則抓 class 字串」的舊測試
 * （splitSceneChrome / pauseOverlayChrome / overlayDimFill / nordicUiUnification）。
 * 那些測試把某次改版當下的 class 字串釘死，設計一改就變紅，卻抓不到真正的問題。
 *
 * 真正的契約只有一個：所有場景外殼都吃這幾個 token。
 * 只要 token 本身守住「方角、1px 線、實色底、無玻璃、無陰影」，換皮就不會出現兩套視覺。
 */
import { describe, expect, it } from 'vitest';
import { SCENE_BROWSE, SCENE_GLASS } from '@/components/ui/SceneWorkshopLayout';
import {
  SPLIT_MAIN_CLASS,
  SPLIT_SIDEBAR_CLASS,
  SPLIT_TABS_CLASS,
} from '@/data/splitSceneChrome';

const collectStringTokens = (source: Record<string, unknown>, prefix: string) => {
  const out: Array<[string, string]> = [];
  for (const [key, value] of Object.entries(source)) {
    if (typeof value === 'string') out.push([`${prefix}.${key}`, value]);
  }
  return out;
};

const ALL_TOKENS: Array<[string, string]> = [
  ...collectStringTokens(SCENE_GLASS, 'SCENE_GLASS'),
  ...collectStringTokens(SCENE_BROWSE, 'SCENE_BROWSE'),
  ['SPLIT_SIDEBAR_CLASS', SPLIT_SIDEBAR_CLASS],
  ['SPLIT_MAIN_CLASS', SPLIT_MAIN_CLASS],
  ['SPLIT_TABS_CLASS', SPLIT_TABS_CLASS],
];

/** 玻璃、投影、超大圓角、半透明白底：HARDLINE 換皮要全面移除的四類寫法 */
const FORBIDDEN = /backdrop-blur|shadow-(?:2xl|xl|lg)|rounded-\[2rem\]|bg-white\/\[0\./;

/** Tailwind 產不出東西的壞寫法：bg-black/55-[8px]（把 blur 尺寸接到透明度後面） */
const MANGLED_DIM = /\/\d+-\[\d+px\]/;

describe('HARDLINE 場景外殼 token', () => {
  it('所有 token 都不含玻璃、陰影、超大圓角', () => {
    const offenders = ALL_TOKENS.filter(([, value]) => FORBIDDEN.test(value));
    expect(offenders.map(([name]) => name)).toEqual([]);
  });

  it('所有 token 都沒有被壓壞的透明度後綴', () => {
    const offenders = ALL_TOKENS.filter(([, value]) => MANGLED_DIM.test(value));
    expect(offenders.map(([name]) => name)).toEqual([]);
  });

  it('SCENE_GLASS 的每個面板都是實色底 + 1px 線（不再有半透明疊層）', () => {
    for (const [name, value] of collectStringTokens(SCENE_GLASS, 'SCENE_GLASS')) {
      if (!/bg-\[var\(--hl-/.test(value)) continue; // 純排版 token 不在此列
      // 有實色底就必須帶 1px 線（可為實線、虛線或選中態 signal 色）
      expect(value, name).toMatch(/\bborder\b.*border-\[var\(--hl-/);
    }
  });

  it('split 場景殼固定 240px 側欄寬、10px 方角、共用同一個線色', () => {
    expect(SPLIT_SIDEBAR_CLASS).toContain('md:w-[240px]');
    expect(SPLIT_SIDEBAR_CLASS).toContain('rounded-[10px]');
    expect(SPLIT_MAIN_CLASS).toContain('rounded-[10px]');
    expect(SPLIT_TABS_CLASS).toContain('rounded-[10px]');

    for (const [name, value] of [
      ['SPLIT_SIDEBAR_CLASS', SPLIT_SIDEBAR_CLASS],
      ['SPLIT_MAIN_CLASS', SPLIT_MAIN_CLASS],
      ['SPLIT_TABS_CLASS', SPLIT_TABS_CLASS],
    ] as const) {
      expect(value, name).toContain('border-[#3d4a5c]');
      expect(value, name).toMatch(/bg-\[#(?:1c2430|273140)\]/);
    }
  });
});
