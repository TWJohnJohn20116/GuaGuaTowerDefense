/**
 * 本機設定檔瀏覽（File System Access API + 傳統檔案選擇器 fallback）
 */
import { parseSettingsPayload, type SettingsExportPayload } from './settingsExportService';

export interface LocalSettingsFileEntry {
  id: string;
  name: string;
  pathLabel: string;
  payload: SettingsExportPayload;
  size: number;
  lastModified: number;
}

export type LocalBrowseResult =
  | { ok: true; files: LocalSettingsFileEntry[] }
  | { ok: false; reason: string };

type PickerWindow = Window & {
  showOpenFilePicker?: (options?: {
    multiple?: boolean;
    types?: { description: string; accept: Record<string, string[]> }[];
  }) => Promise<FileSystemFileHandle[]>;
  showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
};

const JSON_PICKER_TYPES = [{
  description: '設定備份 JSON',
  accept: { 'application/json': ['.json'] },
}];

function makeEntryId(name: string, size: number, lastModified: number): string {
  return `local_${name}_${size}_${lastModified}`;
}

async function fileToEntry(file: File, pathLabel: string): Promise<LocalSettingsFileEntry | null> {
  try {
    const text = await file.text();
    const payload = parseSettingsPayload(JSON.parse(text) as unknown);
    if (!payload) return null;
    return {
      id: makeEntryId(file.name, file.size, file.lastModified),
      name: file.name.replace(/\.json$/i, ''),
      pathLabel,
      payload,
      size: file.size,
      lastModified: file.lastModified,
    };
  } catch {
    return null;
  }
}

async function collectJsonFromDirectory(
  dir: FileSystemDirectoryHandle,
  pathLabel: string,
): Promise<LocalSettingsFileEntry[]> {
  const results: LocalSettingsFileEntry[] = [];
  for await (const handle of dir.values()) {
    if (handle.kind === 'file' && handle.name.toLowerCase().endsWith('.json')) {
      const file = await handle.getFile();
      const entry = await fileToEntry(file, pathLabel);
      if (entry) results.push(entry);
    } else if (handle.kind === 'directory') {
      const sub = handle as FileSystemDirectoryHandle;
      const nested = await collectJsonFromDirectory(sub, `${pathLabel}/${sub.name}`);
      results.push(...nested);
    }
  }
  return results;
}

function pickWithInput(multiple: boolean): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.multiple = multiple;
    input.onchange = () => resolve(Array.from(input.files ?? []));
    input.click();
  });
}

export function supportsOpenFilePicker(): boolean {
  return typeof window !== 'undefined' && 'showOpenFilePicker' in window;
}

export function supportsDirectoryPicker(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

/** 從本機選取一或多個 JSON 設定檔 */
export async function browseLocalSettingsFiles(): Promise<LocalBrowseResult> {
  try {
    const win = window as PickerWindow;
    let rawFiles: File[] = [];

    if (win.showOpenFilePicker) {
      const handles = await win.showOpenFilePicker({
        multiple: true,
        types: JSON_PICKER_TYPES,
      });
      rawFiles = await Promise.all(handles.map((h) => h.getFile()));
    } else {
      rawFiles = await pickWithInput(true);
    }

    if (rawFiles.length === 0) {
      return { ok: false, reason: 'no_file' };
    }

    const files: LocalSettingsFileEntry[] = [];
    for (const file of rawFiles) {
      const entry = await fileToEntry(file, '本機');
      if (entry) files.push(entry);
    }

    if (files.length === 0) {
      return { ok: false, reason: '所選檔案均非有效設定備份' };
    }
    return { ok: true, files };
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      return { ok: false, reason: 'cancelled' };
    }
    console.error('[settingsLocalFile] browse files failed', e);
    return { ok: false, reason: '無法讀取本機檔案' };
  }
}

/** 選取資料夾並掃描其中所有 JSON 設定檔（含子資料夾） */
export async function browseLocalSettingsDirectory(): Promise<LocalBrowseResult> {
  try {
    const win = window as PickerWindow;
    if (!win.showDirectoryPicker) {
      return { ok: false, reason: '此瀏覽器不支援資料夾瀏覽，請改用選擇檔案' };
    }

    const dir = await win.showDirectoryPicker();
    const files = await collectJsonFromDirectory(dir, dir.name);
    if (files.length === 0) {
      return { ok: false, reason: '資料夾內找不到有效的設定 JSON' };
    }
    files.sort((a, b) => b.lastModified - a.lastModified);
    return { ok: true, files };
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      return { ok: false, reason: 'cancelled' };
    }
    console.error('[settingsLocalFile] browse directory failed', e);
    return { ok: false, reason: '無法讀取資料夾' };
  }
}
