/**
 * 場景外殼設計 token 契約（ARCADE HUD）
 *
 * 這裡取代了四支「讀 .tsx 原始碼、用正則抓 class 字串」的舊測試
 * （splitSceneChrome / pauseOverlayChrome / overlayDimFill / nordicUiUnification）。
 * 那些測試把某次改版當下的 class 字串釘死，設計一改就變紅，卻抓不到真正的問題。
 *
 * 真正的契約只有一個：所有場景外殼都吃這幾個 token。
 * 只要 token 本身守住 ARCADE 的規則——小圓角、斜切、硬陰影、無玻璃模糊、金青語意——
 * 換皮就不會出現兩套視覺。
 */
import { describe, expect, it } from 'vitest';
import { SCENE_BROWSE, SCENE_GLASS } from '@/components/ui/SceneWorkshopLayout';
import {
  SPLIT_MAIN_CLASS,
  SPLIT_SIDEBAR_CLASS,
  SPLIT_TABS_CLASS,
} from '@/test/contracts/splitSceneChrome';

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

/**
 * ARCADE 禁止的三類寫法：
 *   1. 玻璃模糊（backdrop-blur）——ARCADE 的層次靠厚度與硬陰影，不靠霧。
 *   2. Tailwind 的柔和大陰影（shadow-2xl/xl/lg）——要用硬陰影或 bevel。
 *   3. 超大圓角（>= 2rem）——ARCADE 只有 2–14px 的小圓角。
 */
const FORBIDDEN = /backdrop-blur|shadow-(?:2xl|xl|lg)|rounded-\[(?:2|3|4|5|6|7|8|9)[0-9]*rem\]/;

/** Tailwind 產不出東西的壞寫法：bg-black/55-[8px]（把 blur 尺寸接到透明度後面） */
const MANGLED_DIM = /\/\d+-\[\d+px\]/;

describe('ARCADE 場景外殼 token', () => {
  it('所有 token 都不含玻璃模糊、柔和大陰影、超大圓角', () => {
    const offenders = ALL_TOKENS.filter(([, value]) => FORBIDDEN.test(value));
    expect(offenders.map(([name]) => name)).toEqual([]);
  });

  it('所有 token 都沒有被壓壞的透明度後綴', () => {
    const offenders = ALL_TOKENS.filter(([, value]) => MANGLED_DIM.test(value));
    expect(offenders.map(([name]) => name)).toEqual([]);
  });

  it('面板 token 都吃到 arc 語意色，不是舊的 hl token', () => {
    for (const [name, value] of collectStringTokens(SCENE_GLASS, 'SCENE_GLASS')) {
      expect(value, name).not.toMatch(/--hl-/);
    }
    for (const [name, value] of collectStringTokens(SCENE_BROWSE, 'SCENE_BROWSE')) {
      expect(value, name).not.toMatch(/--hl-/);
    }
  });

  it('有底色的面板 token 一定帶邊框（厚度來自線，不是陰影）', () => {
    for (const [name, value] of [
      ...collectStringTokens(SCENE_GLASS, 'SCENE_GLASS'),
      ...collectStringTokens(SCENE_BROWSE, 'SCENE_BROWSE'),
    ]) {
      if (!/bg-\[var\(--arc-/.test(value)) continue;
      if (/arc-panel/.test(value)) continue; // arc-panel 自帶邊框與陰影
      expect(value, name).toMatch(/\bborder\b/);
    }
  });

  it('split 場景殼固定 240px 側欄寬、10px 小圓角、共用同一組 arc 線色與底色', () => {
    expect(SPLIT_SIDEBAR_CLASS).toContain('md:w-[240px]');
    expect(SPLIT_SIDEBAR_CLASS).toContain('rounded-[10px]');
    expect(SPLIT_MAIN_CLASS).toContain('rounded-[10px]');
    expect(SPLIT_TABS_CLASS).toContain('rounded-[10px]');

    for (const [name, value] of [
      ['SPLIT_SIDEBAR_CLASS', SPLIT_SIDEBAR_CLASS],
      ['SPLIT_MAIN_CLASS', SPLIT_MAIN_CLASS],
      ['SPLIT_TABS_CLASS', SPLIT_TABS_CLASS],
    ] as const) {
      expect(value, name).toContain('border-[var(--arc-line-strong)]');
      expect(value, name).toMatch(/bg-\[var\(--arc-(?:deck|deck-2|deck-3)\)\]/);
    }
  });
});
