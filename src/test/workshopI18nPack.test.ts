/**
 * 翻譯包：扁平化、建包／讀包驗證、合併（只補不覆蓋／覆蓋）與缺鍵報告
 */
import { describe, expect, it } from 'vitest';
import {
  I18N_PACK_FORMAT,
  I18N_PACK_VERSION,
  collectTranslatableEntries,
  createI18nPack,
  createMissingKeyPack,
  mergeI18nPack,
  parseI18nPack,
  serializeI18nPack,
} from '@/workshop/i18nPack';

const projectLike = {
  id: 'proj-1',
  name: '沙漠前哨',
  description: '第一張測試地圖',
  tags: ['desert', 'hard'],
  levels: [
    { id: 'lv-1', name: '第一關', description: '', scripts: { code: 'return 1' } },
    { id: 'lv-2', name: '第二關' },
  ],
};

describe('collectTranslatableEntries', () => {
  it('flattens only human-facing fields with dotted paths', () => {
    const entries = collectTranslatableEntries(projectLike);
    expect(entries['name']).toBe('沙漠前哨');
    expect(entries['description']).toBe('第一張測試地圖');
    expect(entries['levels.0.name']).toBe('第一關');
    expect(entries['levels.1.name']).toBe('第二關');
  });

  it('skips empty strings, script code and non-whitelisted keys', () => {
    const entries = collectTranslatableEntries(projectLike);
    expect(entries['levels.0.description']).toBeUndefined();
    expect(entries['levels.0.scripts.code']).toBeUndefined();
    expect(entries['tags.0']).toBeUndefined();
    expect(entries['id']).toBeUndefined();
  });
});

describe('createI18nPack', () => {
  it('sorts entries and stamps format/version', () => {
    const result = createI18nPack({ locale: 'en', entries: { b: 'B', a: 'A' }, now: '2026-01-01T00:00:00.000Z' });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.format).toBe(I18N_PACK_FORMAT);
    expect(result.value.version).toBe(I18N_PACK_VERSION);
    expect(Object.keys(result.value.entries)).toEqual(['a', 'b']);
    expect(result.value.createdAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('rejects a locale that is not a language tag', () => {
    const result = createI18nPack({ locale: '  ', entries: {} });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0].code).toBe('LOCALE_INVALID');
  });

  it('rejects non-string entry values', () => {
    const entries = { a: 1 } as unknown as Record<string, string>;
    const result = createI18nPack({ locale: 'en', entries });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0].code).toBe('ENTRIES_INVALID');
    expect(result.errors[0].path).toBe('entries.a');
  });
});

describe('parseI18nPack', () => {
  it('round-trips through serialize', () => {
    const created = createI18nPack({ locale: 'ja', entries: { 'name': '砂漠', 'levels.0.name': '第一' }, projectId: 'p' });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    const parsed = parseI18nPack(serializeI18nPack(created.value));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.locale).toBe('ja');
    expect(parsed.value.entries['name']).toBe('砂漠');
    expect(parsed.value.projectId).toBe('p');
  });

  it('reports NOT_JSON for garbage input', () => {
    const parsed = parseI18nPack('not json at all');
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.errors[0].code).toBe('NOT_JSON');
  });

  it('rejects a foreign format and a future version with distinct codes', () => {
    const foreign = parseI18nPack(JSON.stringify({ format: 'ggmod', version: 1, locale: 'en', entries: {} }));
    expect(foreign.ok).toBe(false);
    if (!foreign.ok) expect(foreign.errors[0].code).toBe('SCHEMA_INVALID');

    const future = parseI18nPack(
      JSON.stringify({ format: I18N_PACK_FORMAT, version: I18N_PACK_VERSION + 5, locale: 'en', entries: {} }),
    );
    expect(future.ok).toBe(false);
    if (!future.ok) {
      expect(future.errors[0].code).toBe('VERSION_UNSUPPORTED');
      expect(future.errors[0].path).toBe('version');
    }
  });

  it('rejects non-string entry values inside a file', () => {
    const parsed = parseI18nPack(
      JSON.stringify({ format: I18N_PACK_FORMAT, version: 1, locale: 'en', entries: { a: 5 } }),
    );
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) expect(parsed.errors[0].code).toBe('ENTRIES_INVALID');
  });
});

describe('mergeI18nPack', () => {
  const pack = (entries: Record<string, string>) => {
    const created = createI18nPack({ locale: 'en', entries });
    if (!created.ok) throw new Error('fixture pack invalid');
    return created.value;
  };
  const required = ['a', 'b', 'c'];

  it('fill mode only writes keys that have no translation yet', () => {
    const { entries, report } = mergeI18nPack({ a: '已翻A' }, pack({ a: 'NEW-A', b: 'B' }), required, 'fill');
    expect(entries.a).toBe('已翻A');
    expect(entries.b).toBe('B');
    expect(report.kept).toEqual(['a']);
    expect(report.filled).toEqual(['b']);
    expect(report.missing).toEqual(['c']);
  });

  it('fill mode treats an empty translation as missing and fills it', () => {
    const { entries, report } = mergeI18nPack({ a: '   ' }, pack({ a: 'A' }), required, 'fill');
    expect(entries.a).toBe('A');
    expect(report.filled).toContain('a');
    expect(report.kept).toEqual([]);
  });

  it('overwrite mode replaces existing translations and reports them', () => {
    const { entries, report } = mergeI18nPack({ a: '舊A' }, pack({ a: 'NEW-A' }), required, 'overwrite');
    expect(entries.a).toBe('NEW-A');
    expect(report.overwritten).toEqual(['a']);
    expect(report.filled).toEqual([]);
  });

  it('reports extra keys the project no longer needs and empty values it still needs', () => {
    const { entries, report } = mergeI18nPack({ a: '' }, pack({ z: 'Z' }), required, 'fill');
    expect(entries.z).toBe('Z');
    expect(report.extra).toEqual(['z']);
    expect(report.missing).toEqual(['b', 'c']);
    expect(report.empty).toEqual(['a']);
  });
});

describe('createMissingKeyPack', () => {
  it('exports only untranslated keys with empty values', () => {
    const base = createI18nPack({ locale: 'de', entries: { a: 'A', b: '' } });
    expect(base.ok).toBe(true);
    if (!base.ok) return;
    const missing = createMissingKeyPack(base.value, ['b', 'c']);
    expect(missing.ok).toBe(true);
    if (!missing.ok) return;
    expect(missing.value.entries).toEqual({ b: '', c: '' });
    expect(missing.value.locale).toBe('de');
  });
});
