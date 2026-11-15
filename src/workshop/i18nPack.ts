/**
 * 翻譯包（.ggi18n.json）
 *
 * 為什麼是「純 JSON + 扁平 key」：
 * 1) 不接任何翻譯 API，譯者用任何文字編輯器都能改。
 * 2) 扁平 key（project.name／levels.0.title）讓缺鍵比對是集合運算，不需要遞迴比對樹。
 * 3) 匯入預設「只補不覆蓋」，避免一次誤匯把人工翻好的內容洗掉。
 */
export const I18N_PACK_FORMAT = 'ggi18n';
export const I18N_PACK_VERSION = 1;
export const I18N_PACK_EXTENSION = '.ggi18n.json';

export type I18nPackErrorCode = 'NOT_JSON' | 'SCHEMA_INVALID' | 'ENTRIES_INVALID' | 'LOCALE_INVALID' | 'VERSION_UNSUPPORTED';

export interface I18nPackIssue {
  code: I18nPackErrorCode;
  path?: string;
  /** 英文技術描述；UI 文案一律由 locales 提供 */
  message: string;
}

export type I18nPackResult<T> = { ok: true; value: T } | { ok: false; errors: I18nPackIssue[] };

export interface I18nPack {
  format: typeof I18N_PACK_FORMAT;
  version: number;
  locale: string;
  createdAt: string;
  projectId?: string;
  entries: Record<string, string>;
}

export type I18nMergeMode = 'fill' | 'overwrite';

export interface I18nMergeReport {
  /** 這次匯入實際寫入的鍵 */
  filled: string[];
  /** fill 模式下因為已有譯文而保留原值的鍵 */
  kept: string[];
  /** overwrite 模式下被覆蓋且值有變的鍵 */
  overwritten: string[];
  /** 專案需要、但合併後仍沒有譯文的鍵 */
  missing: string[];
  /** 包裡有、專案已經沒有用的鍵 */
  extra: string[];
  /** 專案需要、但譯文是空字串的鍵（有 key 沒內容） */
  empty: string[];
}

/** 抽可翻譯欄位時只看這些慣例欄位，避免把 id／顏色／腳本碼也拉進翻譯包 */
const TRANSLATABLE_KEYS = new Set(['name', 'title', 'description', 'subtitle', 'hint', 'label', 'summary', 'displayName']);
const MAX_DEPTH = 4;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * 把專案資料攤平成 key → 原文。
 * 例：{ name: '沙漠', levels: [{ title: '第一關' }] } → { 'name': '沙漠', 'levels.0.title': '第一關' }
 */
export function collectTranslatableEntries(source: unknown, prefix = ''): Record<string, string> {
  const entries: Record<string, string> = {};
  const walk = (value: unknown, path: string, depth: number): void => {
    if (depth > MAX_DEPTH) return;
    if (Array.isArray(value)) {
      value.forEach((item, index) => walk(item, path ? `${path}.${index}` : String(index), depth + 1));
      return;
    }
    if (isRecord(value)) {
      for (const [key, child] of Object.entries(value)) {
        const childPath = path ? `${path}.${key}` : key;
        if (typeof child === 'string') {
          if (TRANSLATABLE_KEYS.has(key) && child.trim() !== '') entries[childPath] = child;
          continue;
        }
        walk(child, childPath, depth + 1);
      }
    }
  };
  walk(source, prefix, 0);
  return entries;
}

function sortedRecord(record: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of Object.keys(record).sort()) out[key] = record[key];
  return out;
}

/** 建包；locale 只接受 BCP-47 風格的標籤（zh-TW／en／pt-BR），不接受空白 */
export function createI18nPack(input: {
  locale: string;
  entries: Record<string, string>;
  projectId?: string;
  now?: string;
}): I18nPackResult<I18nPack> {
  const locale = input.locale.trim();
  if (!/^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(locale)) {
    return { ok: false, errors: [{ code: 'LOCALE_INVALID', path: 'locale', message: `invalid locale tag "${input.locale}"` }] };
  }
  const entries: Record<string, string> = {};
  for (const [key, value] of Object.entries(input.entries)) {
    if (typeof value !== 'string') {
      return { ok: false, errors: [{ code: 'ENTRIES_INVALID', path: `entries.${key}`, message: 'entry value must be a string' }] };
    }
    if (!key) continue;
    entries[key] = value;
  }
  return {
    ok: true,
    value: {
      format: I18N_PACK_FORMAT,
      version: I18N_PACK_VERSION,
      locale,
      createdAt: input.now ?? new Date().toISOString(),
      ...(input.projectId ? { projectId: input.projectId } : {}),
      entries: sortedRecord(entries),
    },
  };
}

/** 單行 JSON：翻譯包要能直接 diff，不要縮排造成的假變更 */
export function serializeI18nPack(pack: I18nPack): string {
  return JSON.stringify(pack);
}

export function parseI18nPack(raw: string): I18nPackResult<I18nPack> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return { ok: false, errors: [{ code: 'NOT_JSON', message: error instanceof Error ? error.message : 'invalid JSON' }] };
  }
  if (!isRecord(parsed)) {
    return { ok: false, errors: [{ code: 'SCHEMA_INVALID', message: 'pack must be a JSON object' }] };
  }
  if (parsed.format !== I18N_PACK_FORMAT) {
    return { ok: false, errors: [{ code: 'SCHEMA_INVALID', path: 'format', message: `unexpected format "${String(parsed.format)}"` }] };
  }
  const version = parsed.version;
  if (typeof version !== 'number' || !Number.isInteger(version)) {
    return { ok: false, errors: [{ code: 'SCHEMA_INVALID', path: 'version', message: 'version must be an integer' }] };
  }
  if (version > I18N_PACK_VERSION) {
    return {
      ok: false,
      errors: [{
        code: 'VERSION_UNSUPPORTED',
        path: 'version',
        message: `unsupported pack version ${version} (supported 1..${I18N_PACK_VERSION})`,
      }],
    };
  }
  const locale = parsed.locale;
  if (typeof locale !== 'string' || !/^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(locale.trim())) {
    return { ok: false, errors: [{ code: 'LOCALE_INVALID', path: 'locale', message: 'locale must be a language tag' }] };
  }
  const rawEntries = parsed.entries;
  if (!isRecord(rawEntries)) {
    return { ok: false, errors: [{ code: 'SCHEMA_INVALID', path: 'entries', message: 'entries must be an object' }] };
  }
  const entries: Record<string, string> = {};
  for (const [key, value] of Object.entries(rawEntries)) {
    if (typeof value !== 'string') {
      return { ok: false, errors: [{ code: 'ENTRIES_INVALID', path: `entries.${key}`, message: 'entry value must be a string' }] };
    }
    entries[key] = value;
  }
  const createdAt = typeof parsed.createdAt === 'string' ? parsed.createdAt : new Date().toISOString();
  const projectId = typeof parsed.projectId === 'string' ? parsed.projectId : undefined;
  return {
    ok: true,
    value: {
      format: I18N_PACK_FORMAT,
      version,
      locale: locale.trim(),
      createdAt,
      ...(projectId ? { projectId } : {}),
      entries: sortedRecord(entries),
    },
  };
}

/**
 * 合併翻譯包。
 * - fill：只寫「目前沒有譯文或譯文是空字串」的鍵（人工成果不會被機器版洗掉）
 * - overwrite：一律以包為準
 * - requiredKeys 是專案實際需要的鍵集合，用來算 missing／extra／empty
 */
export function mergeI18nPack(
  current: Record<string, string>,
  incoming: I18nPack,
  requiredKeys: string[],
  mode: I18nMergeMode,
): { entries: Record<string, string>; report: I18nMergeReport } {
  const entries: Record<string, string> = { ...current };
  const report: I18nMergeReport = { filled: [], kept: [], overwritten: [], missing: [], extra: [], empty: [] };

  for (const [key, value] of Object.entries(incoming.entries)) {
    const existing = entries[key];
    const hasExisting = typeof existing === 'string' && existing.trim() !== '';
    if (mode === 'fill' && hasExisting) {
      report.kept.push(key);
      continue;
    }
    entries[key] = value;
    if (mode === 'overwrite' && hasExisting) report.overwritten.push(key);
    else report.filled.push(key);
  }

  const required = new Set(requiredKeys);
  for (const key of requiredKeys) {
    const value = entries[key];
    if (typeof value !== 'string') report.missing.push(key);
    else if (value.trim() === '') report.empty.push(key);
  }
  for (const key of Object.keys(entries)) {
    if (!required.has(key)) report.extra.push(key);
  }

  report.filled.sort();
  report.kept.sort();
  report.overwritten.sort();
  report.missing.sort();
  report.extra.sort();
  report.empty.sort();
  return { entries: sortedRecord(entries), report };
}

/** 匯出「未翻譯鍵清單」：只帶需要補的鍵，值留空讓譯者填 */
export function createMissingKeyPack(
  pack: I18nPack,
  missingKeys: string[],
): I18nPackResult<I18nPack> {
  const entries: Record<string, string> = {};
  for (const key of missingKeys) entries[key] = pack.entries[key] ?? '';
  return createI18nPack({ locale: pack.locale, entries, projectId: pack.projectId, now: new Date().toISOString() });
}
