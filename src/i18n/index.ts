// 多語言系統
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zhTW } from './locales/zh-TW';

// 支援的語言
/** 巢狀可選（語言檔允許部分覆寫，執行時以 zh-TW merge 補齊） */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Language =
  | 'zh-TW'  // 繁體中文
  | 'zh-CN'  // 簡體中文
  | 'en'     // 英文
  | 'ja'     // 日文
  | 'ko'     // 韓文
  | 'fr'     // 法文
  | 'de'     // 德文
  | 'es'     // 西班牙文
  | 'ru'     // 俄文
  | 'pt';    // 葡萄牙文

// 語言名稱對照
const LANGUAGE_NAMES: Record<Language, string> = {
  'zh-TW': '繁體中文',
  'zh-CN': '简体中文',
  'en': 'English',
  'ja': '日本語',
  'ko': '한국어',
  'fr': 'Français',
  'de': 'Deutsch',
  'es': 'Español',
  'ru': 'Русский',
  'pt': 'Português',
};

/**
 * 翻譯鍵值型別。
 *
 * 這裡刻意「不再」手寫 4000 行的 interface：那份宣告與 locales/zh-TW.ts 長期雙向漂移，
 * 結果是型別說有、資料沒有，UI 直接渲染出 undefined（例如百科統計面板的 statsWins）。
 * 現在 zh-TW 是唯一真相來源，型別由它推導；新增文案只要改 locales/zh-TW.ts，
 * 而 runtime 對齊由 scripts/i18n-parity.mjs 把關。
 */
export type Translations = typeof zhTW;
export type TranslationKeys = Translations;

/**
 * 只保留「值是字串」的鍵。
 * 直接用 keyof 索引翻譯物件時，聯集裡會混進物件/陣列型的鍵，
 * 導致 g[key] 的型別變成 string | { ... } | string[]，前端拿它當字串用就會炸。
 */
export type StringValuedKeys<T> = {
  [K in keyof T]-?: T[K] extends string ? K : never;
}[keyof T];

type NonBaseLanguage = Exclude<Language, 'zh-TW'>;

/**
 * 非基準語言一律**按需載入**。
 *
 * 10 個語言檔加起來約 4 萬行，過去全部靜態 import，等於每次啟動都把
 * 玩家永遠不會用到的 8~9 種語言塞進主 chunk（實測主 chunk 2.08 MB）。
 * 現在 zh-TW 常駐（它是補齊其他語言的底層），其餘各自成為獨立 chunk，
 * 只有真的切到該語言時才下載。
 */
const LOCALE_LOADERS: Record<NonBaseLanguage, () => Promise<DeepPartial<Translations>>> = {
  'zh-CN': () => import('./locales/zh-CN').then((m) => m.zhCN),
  en: () => import('./locales/en').then((m) => m.en),
  ja: () => import('./locales/ja').then((m) => m.ja),
  ko: () => import('./locales/ko').then((m) => m.ko),
  fr: () => import('./locales/fr').then((m) => m.fr),
  de: () => import('./locales/de').then((m) => m.de),
  es: () => import('./locales/es').then((m) => m.es),
  ru: () => import('./locales/ru').then((m) => m.ru),
  pt: () => import('./locales/pt').then((m) => m.pt),
};

/** 已解析過的語言（切回同一語言不再重新 merge） */
const resolvedCache = new Map<Language, Translations>();

/** 以 zh-TW 為底層，補齊其他語言檔尚未翻譯的巢狀鍵值 */
function mergeTranslations(base: Translations, patch: DeepPartial<Translations>): Translations {
  const out = { ...base } as Record<string, unknown>;
  const patchRec = patch as unknown as Record<string, unknown>;
  const baseRec = base as unknown as Record<string, unknown>;

  for (const key of Object.keys(patchRec)) {
    const b = baseRec[key];
    const p = patchRec[key];
    if (
      p !== null &&
      typeof p === 'object' &&
      !Array.isArray(p) &&
      b !== null &&
      typeof b === 'object' &&
      !Array.isArray(b)
    ) {
      out[key] = mergeTranslations(b as Translations, p as DeepPartial<Translations>);
    } else if (p !== undefined) {
      out[key] = p;
    }
  }
  return out as unknown as Translations;
}

/**
 * 取得某語言的完整翻譯樹（缺的鍵以 zh-TW 補齊）。
 * 非 zh-TW 會動態載入對應語言檔；結果會快取。
 */
export async function loadTranslations(lang: Language): Promise<Translations> {
  if (lang === 'zh-TW') return zhTW;

  const cached = resolvedCache.get(lang);
  if (cached) return cached;

  const patch = await LOCALE_LOADERS[lang]();
  const merged = mergeTranslations(zhTW, patch);
  resolvedCache.set(lang, merged);
  return merged;
}

/** 供測試 / 除錯：目前已經解析過哪些語言 */
export const getResolvedLanguages = (): Language[] => ['zh-TW', ...resolvedCache.keys()];

// 語言 Store
interface LanguageStore {
  language: Language;
  /** 目前實際使用的翻譯樹（切換語言載入完成前仍是舊語言） */
  t: Translations;
  /** 正在載入非基準語言 */
  isLoading: boolean;
  setLanguage: (lang: Language) => Promise<void>;
}

/** 連續切換語言時，只有最後一次的回填有效 */
let pendingSwitch = 0;

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: 'zh-TW',
      t: zhTW,
      isLoading: false,
      setLanguage: async (lang) => {
        const ticket = ++pendingSwitch;
        set({ language: lang, isLoading: lang !== 'zh-TW' });

        try {
          const t = await loadTranslations(lang);
          if (ticket !== pendingSwitch) return; // 已經被後續切換取代
          set({ t, isLoading: false });
        } catch {
          // 載入失敗（離線 / chunk 抓不到）：保留現有翻譯，不要讓畫面變空白，
          // 也不要讓 fire-and-forget 的呼叫端產生未處理的 rejection。
          if (ticket !== pendingSwitch) return;
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'guagua-language',
      // 只持久化語言代碼。t 是整棵翻譯樹（數千個字串），寫進 localStorage 既慢又無意義，
      // 反序列化後會由 loadTranslations 重建。
      partialize: (state) => ({ language: state.language }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (state.language === 'zh-TW') {
          state.t = zhTW;
          return;
        }
        // 非基準語言要動態載入：先用 zh-TW 撐著，載入完成再換上
        const stored = state.language;
        void loadTranslations(stored).then((t) => {
          if (useLanguageStore.getState().language !== stored) return;
          useLanguageStore.setState({ t });
        });
      },
    },
  ),
);

// 便捷 hook：三個原子 selector，語言以外的狀態變動不會造成無謂重繪
export const useTranslation = () => {
  const t = useLanguageStore((state) => state.t);
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  return { t, language, setLanguage, languages: LANGUAGE_NAMES };
};
