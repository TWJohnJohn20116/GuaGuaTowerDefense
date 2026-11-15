/**
 * 設定匯出 / 匯入
 */
import type { KeyBindings } from '@/types/game';
import type { Language } from '@/i18n';
import {
  DEFAULT_HUD_LAYOUT,
  useSettingsStore,
  type HudLayoutState,
  type SettingsState,
} from '@/store/settingsStore';
import { DEFAULT_KEY_BINDINGS } from '@/store/gameStoreUtils';
import { useGameStore } from '@/store/gameStore';
import { useLanguageStore } from '@/i18n';
import { APP_VERSION } from '@/services/updateService';
import { saveStoredSettingsFile } from '@/services/settingsFileDb';
import {
  ALL_SETTINGS_EXPORT_SECTIONS,
  type SettingsExportSection,
  type SettingsExportSelection,
  createDefaultExportSelection,
} from '@/services/settingsExportSections';

const SETTINGS_EXPORT_VERSION = 2;

interface SettingsExportGamePrefs {
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
  gameSpeed: number;
  keyBindings: KeyBindings;
}

export interface SettingsExportPayload {
  version: number;
  exportedAt: string;
  appVersion: string;
  sections: SettingsExportSection[];
  language?: Language;
  settings?: Partial<Pick<SettingsState, 'themeId' | 'visual' | 'gameplay' | 'audio' | 'controls' | 'hudLayout'>>;
  gamePrefs?: Partial<SettingsExportGamePrefs>;
}

export type SettingsImportResult =
  | { ok: true }
  | { ok: false; reason: string };

interface SettingsExportOptions {
  selection?: SettingsExportSelection;
  download?: boolean;
  saveToVault?: boolean;
  vaultName?: string;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function selectedSections(selection: SettingsExportSelection): SettingsExportSection[] {
  return ALL_SETTINGS_EXPORT_SECTIONS.filter((s) => selection[s]);
}

/** 依勾選項目收集設定快照 */
function collectSettingsExportPayload(
  selection: SettingsExportSelection = createDefaultExportSelection(),
): SettingsExportPayload | null {
  const sections = selectedSections(selection);
  if (sections.length === 0) return null;

  const store = useSettingsStore.getState();
  const game = useGameStore.getState();
  const payload: SettingsExportPayload = {
    version: SETTINGS_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    appVersion: APP_VERSION,
    sections,
  };

  if (selection.language) {
    payload.language = useLanguageStore.getState().language;
  }

  const settings: SettingsExportPayload['settings'] = {};
  if (selection.theme) settings!.themeId = store.themeId;
  if (selection.visual) settings!.visual = { ...store.visual };
  if (selection.gameplay) settings!.gameplay = { ...store.gameplay };
  if (selection.audio) settings!.audio = { ...store.audio };
  if (selection.controls) settings!.controls = { ...store.controls };
  if (selection.hudLayout) settings!.hudLayout = { ...store.hudLayout };
  if (Object.keys(settings!).length > 0) payload.settings = settings;

  const gamePrefs: Partial<SettingsExportGamePrefs> = {};
  if (selection.masterAudio) {
    gamePrefs.soundEnabled = game.soundEnabled;
    gamePrefs.musicEnabled = game.musicEnabled;
    gamePrefs.soundVolume = game.soundVolume;
    gamePrefs.musicVolume = game.musicVolume;
  }
  if (selection.keyBindings) gamePrefs.keyBindings = { ...game.keyBindings };
  if (selection.gameSpeed) gamePrefs.gameSpeed = game.gameSpeed;
  if (Object.keys(gamePrefs).length > 0) payload.gamePrefs = gamePrefs;

  return payload;
}

function downloadPayloadJson(payload: SettingsExportPayload): boolean {
  try {
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const stamp = payload.exportedAt.slice(0, 10);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guagua-settings-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (e) {
    console.error('[settingsExport] download failed', e);
    return false;
  }
}

/** 匯出設定（可選下載 / 存入本機檔案庫） */
export async function exportSettings(options: SettingsExportOptions = {}): Promise<SettingsImportResult> {
  const selection = options.selection ?? createDefaultExportSelection();
  const payload = collectSettingsExportPayload(selection);
  if (!payload) {
    return { ok: false, reason: '請至少勾選一項設定' };
  }
  if (!options.download && !options.saveToVault) {
    return { ok: false, reason: '請選擇匯出目的地' };
  }

  try {
    if (options.saveToVault) {
      await saveStoredSettingsFile(payload, options.vaultName);
    }
    if (options.download) {
      const ok = downloadPayloadJson(payload);
      if (!ok) return { ok: false, reason: '下載失敗' };
    }
    return { ok: true };
  } catch (e) {
    console.error('[settingsExport] export failed', e);
    return { ok: false, reason: '匯出失敗，請稍後再試' };
  }
}
function normalizeLegacyPayload(raw: Record<string, unknown>): SettingsExportPayload | null {
  if (!isRecord(raw.settings) || !isRecord(raw.gamePrefs)) return null;
  const gamePrefs = raw.gamePrefs as unknown as SettingsExportGamePrefs;
  if (
    typeof gamePrefs.soundEnabled !== 'boolean' ||
    typeof gamePrefs.musicEnabled !== 'boolean' ||
    typeof gamePrefs.soundVolume !== 'number' ||
    typeof gamePrefs.musicVolume !== 'number' ||
    typeof gamePrefs.gameSpeed !== 'number' ||
    !isRecord(gamePrefs.keyBindings)
  ) {
    return null;
  }
  return {
    version: typeof raw.version === 'number' ? raw.version : 1,
    exportedAt: typeof raw.exportedAt === 'string' ? raw.exportedAt : new Date().toISOString(),
    appVersion: typeof raw.appVersion === 'string' ? raw.appVersion : 'unknown',
    sections: [...ALL_SETTINGS_EXPORT_SECTIONS],
    language: (typeof raw.language === 'string' ? raw.language : 'zh-TW') as Language,
    settings: raw.settings as SettingsExportPayload['settings'],
    gamePrefs,
  };
}

export function parseSettingsPayload(raw: unknown): SettingsExportPayload | null {
  if (!isRecord(raw)) return null;
  if (typeof raw.version !== 'number' || raw.version < 1 || raw.version > SETTINGS_EXPORT_VERSION) {
    return null;
  }

  if (Array.isArray(raw.sections)) {
    const sections = raw.sections.filter(
      (s): s is SettingsExportSection =>
        typeof s === 'string' && ALL_SETTINGS_EXPORT_SECTIONS.includes(s as SettingsExportSection),
    );
    if (sections.length === 0) return null;
    return {
      version: raw.version,
      exportedAt: typeof raw.exportedAt === 'string' ? raw.exportedAt : new Date().toISOString(),
      appVersion: typeof raw.appVersion === 'string' ? raw.appVersion : 'unknown',
      sections,
      language: typeof raw.language === 'string' ? (raw.language as Language) : undefined,
      settings: isRecord(raw.settings) ? (raw.settings as SettingsExportPayload['settings']) : undefined,
      gamePrefs: isRecord(raw.gamePrefs) ? (raw.gamePrefs as Partial<SettingsExportGamePrefs>) : undefined,
    };
  }

  return normalizeLegacyPayload(raw);
}

/** 套用已驗證的設定快照（可選擇性覆寫區段） */
function applySettingsPayload(
  payload: SettingsExportPayload,
  selection?: SettingsExportSelection,
): void {
  const effectiveSections = selection
    ? payload.sections.filter((s) => selection[s])
    : payload.sections;
  const sections = new Set(effectiveSections);
  if (sections.size === 0) return;
  const partial: Partial<Pick<SettingsState, 'themeId' | 'visual' | 'gameplay' | 'audio' | 'controls' | 'hudLayout'>> = {};

  if (payload.settings) {
    // 壞檔／舊檔沒有 themeId，或用不存在的 id → 交給 setAll 的 isThemeId 擋掉
    if (sections.has('theme') && payload.settings.themeId) partial.themeId = payload.settings.themeId;
    if (sections.has('visual') && payload.settings.visual) partial.visual = payload.settings.visual;
    if (sections.has('gameplay') && payload.settings.gameplay) partial.gameplay = payload.settings.gameplay;
    if (sections.has('audio') && payload.settings.audio) partial.audio = payload.settings.audio;
    if (sections.has('controls') && payload.settings.controls) partial.controls = payload.settings.controls;
    if (sections.has('hudLayout') && payload.settings.hudLayout) {
      partial.hudLayout = {
        ...DEFAULT_HUD_LAYOUT,
        ...(payload.settings.hudLayout as Partial<HudLayoutState>),
      };
    }
  }
  if (Object.keys(partial).length > 0) {
    useSettingsStore.getState().setAll(partial);
  }

  const gp = payload.gamePrefs;
  if (gp) {
    const gamePatch: Partial<SettingsExportGamePrefs> = {};
    if (sections.has('masterAudio')) {
      if (typeof gp.soundEnabled === 'boolean') gamePatch.soundEnabled = gp.soundEnabled;
      if (typeof gp.musicEnabled === 'boolean') gamePatch.musicEnabled = gp.musicEnabled;
      if (typeof gp.soundVolume === 'number') gamePatch.soundVolume = clamp01(gp.soundVolume);
      if (typeof gp.musicVolume === 'number') gamePatch.musicVolume = clamp01(gp.musicVolume);
    }
    if (sections.has('keyBindings') && gp.keyBindings) {
      gamePatch.keyBindings = { ...DEFAULT_KEY_BINDINGS, ...gp.keyBindings };
    }
    if (Object.keys(gamePatch).length > 0) {
      useGameStore.setState(gamePatch);
    }
    if (sections.has('gameSpeed') && typeof gp.gameSpeed === 'number') {
      useGameStore.getState().setGameSpeed(Math.max(0.25, Math.min(10, gp.gameSpeed)));
    }
  }

  if (sections.has('language') && payload.language) {
    // 非基準語言是按需載入的非同步操作；載入失敗已由 store 內部吞掉
    void useLanguageStore.getState().setLanguage(payload.language);
  }

  if (sections.has('gameplay')) {
    useGameStore.getState().setQuickPlaceMode(
      useSettingsStore.getState().gameplay.quickPlaceDefault,
    );
  }

  void import('@/services/musicService').then((m) => {
    m.syncMusic(undefined, true);
  });
}

/** 讀取 JSON 檔並解析（不套用） */
async function readSettingsFile(
  file: File,
): Promise<{ ok: true; payload: SettingsExportPayload } | { ok: false; reason: string }> {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text) as unknown;
    const payload = parseSettingsPayload(parsed);
    if (!payload) {
      return { ok: false, reason: '檔案格式不正確或版本不支援' };
    }
    return { ok: true, payload };
  } catch (e) {
    console.error('[settingsExport] read failed', e);
    return { ok: false, reason: '無法解析 JSON 檔案' };
  }
}

/** 讀取並匯入 JSON 檔（可選是否存入檔案庫、選擇性區段） */
async function importSettingsFromFile(
  file: File,
  options?: { saveToVault?: boolean; selection?: SettingsExportSelection },
): Promise<SettingsImportResult> {
  const read = await readSettingsFile(file);
  if (!read.ok) return read;
  const { payload } = read;
  if (options?.selection) {
    const selected = payload.sections.filter((s) => options.selection![s]);
    if (selected.length === 0) {
      return { ok: false, reason: '請至少勾選一項設定' };
    }
  }
  try {
    if (options?.saveToVault !== false) {
      await saveStoredSettingsFile(payload, file.name.replace(/\.json$/i, ''));
    }
    applySettingsPayload(payload, options?.selection);
    return { ok: true };
  } catch (e) {
    console.error('[settingsExport] import failed', e);
    return { ok: false, reason: '匯入失敗，請稍後再試' };
  }
}

/** 從本機檔案庫紀錄匯入（可選擇性區段） */
export function importSettingsPayload(
  payload: SettingsExportPayload,
  selection?: SettingsExportSelection,
): SettingsImportResult {
  const parsed = parseSettingsPayload(payload);
  if (!parsed) return { ok: false, reason: '備份資料無效' };
  const effective = selection
    ? parsed.sections.filter((s) => selection[s])
    : parsed.sections;
  if (effective.length === 0) {
    return { ok: false, reason: '請至少勾選一項設定' };
  }
  applySettingsPayload(parsed, selection);
  return { ok: true };
}

/** 觸發系統檔案選擇（加入檔案庫或直接匯入） */
export function triggerSettingsImportPicker(
  mode: 'import' | 'vault' | 'pick' = 'import',
): Promise<SettingsImportResult | { ok: true; payload: SettingsExportPayload }> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve({ ok: false, reason: 'no_file' });
        return;
      }
      const read = await readSettingsFile(file);
      if (!read.ok) {
        resolve(read);
        return;
      }
      if (mode === 'pick') {
        resolve({ ok: true, payload: read.payload });
        return;
      }
      if (mode === 'vault') {
        try {
          await saveStoredSettingsFile(read.payload, file.name.replace(/\.json$/i, ''));
          resolve({ ok: true });
        } catch {
          resolve({ ok: false, reason: '存入檔案庫失敗' });
        }
        return;
      }
      resolve(await importSettingsFromFile(file));
    };
    input.click();
  });
}
