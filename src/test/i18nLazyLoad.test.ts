/**
 * 語言按需載入
 *
 * 10 個語言檔全部靜態 import 時，主 chunk 要背著 4 萬行翻譯（實測 2.08 MB）。
 * 現在只有 zh-TW 常駐，其餘各自成 chunk；這支測試鎖定三件事：
 *   1. 非基準語言能載入，且「有翻的用該語言、沒翻的回退繁中」
 *   2. 載入結果有快取（切回同一語言不再重新 merge）
 *   3. store 切換語言會把 t 換掉
 */
import { describe, expect, it } from 'vitest';
import { getResolvedLanguages, loadTranslations, useLanguageStore } from '@/i18n';
import { zhTW } from '@/i18n/locales/zh-TW';

describe('i18n 按需載入', () => {
  it('zh-TW 直接回傳常駐基準物件，不做任何載入', async () => {
    await expect(loadTranslations('zh-TW')).resolves.toBe(zhTW);
  });

  it('英文檔覆寫了對應文案', async () => {
    const en = await loadTranslations('en');
    expect(en.common.back).toBe('Back');
    expect(en.common.back).not.toBe(zhTW.common.back);
  });

  it('語言檔沒翻到的鍵會回退繁中（不是 undefined）', async () => {
    const en = await loadTranslations('en');
    // 這批鍵是後來才補進 zh-TW 的，其他語言檔都還沒有
    expect(zhTW.encyclopedia.statsWins.length).toBeGreaterThan(0);
    expect(en.encyclopedia.statsWins).toBe(zhTW.encyclopedia.statsWins);
    expect(en.encyclopedia.statsTotalPlaytime).toBe(zhTW.encyclopedia.statsTotalPlaytime);
  });

  it('同一語言只 merge 一次（快取）', async () => {
    const first = await loadTranslations('ja');
    const second = await loadTranslations('ja');
    expect(second).toBe(first);
    expect(getResolvedLanguages()).toContain('ja');
  });

  it('store 切換語言後 t 會換成該語言', async () => {
    await useLanguageStore.getState().setLanguage('fr');
    const state = useLanguageStore.getState();
    expect(state.language).toBe('fr');
    expect(state.isLoading).toBe(false);
    expect(state.t.common.back).toBe('Retour');
  });

  it('切回 zh-TW 會回到常駐基準物件', async () => {
    await useLanguageStore.getState().setLanguage('zh-TW');
    expect(useLanguageStore.getState().t).toBe(zhTW);
  });
});
