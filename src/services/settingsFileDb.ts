/**
 * 設定備份 · 本機檔案庫（IndexedDB）
 */
import type { SettingsExportPayload } from './settingsExportService';

const DB_NAME = 'guagua-settings-vault-v1';
const STORE = 'files';
const DB_VERSION = 1;

export interface StoredSettingsFile {
  id: string;
  name: string;
  payload: SettingsExportPayload;
  createdAt: number;
  updatedAt: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB 不可用'));
  }
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'));
  });
  return dbPromise;
}

function makeId(): string {
  return `sf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function listStoredSettingsFiles(): Promise<StoredSettingsFile[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => {
      const rows = (req.result as StoredSettingsFile[]) ?? [];
      rows.sort((a, b) => b.updatedAt - a.updatedAt);
      resolve(rows);
    };
    req.onerror = () => reject(req.error);
  });
}

async function getStoredSettingsFile(id: string): Promise<StoredSettingsFile | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve((req.result as StoredSettingsFile | undefined) ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function saveStoredSettingsFile(
  payload: SettingsExportPayload,
  name?: string,
  id?: string,
): Promise<StoredSettingsFile> {
  const db = await openDb();
  const now = Date.now();
  const stamp = new Date(now).toISOString().slice(0, 16).replace('T', ' ');
  const record: StoredSettingsFile = {
    id: id ?? makeId(),
    name: name?.trim() || `設定備份 ${stamp}`,
    payload,
    createdAt: now,
    updatedAt: now,
  };

  if (id) {
    const existing = await getStoredSettingsFile(id);
    if (existing) {
      record.createdAt = existing.createdAt;
      record.name = name?.trim() || existing.name;
    }
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.oncomplete = () => resolve(record);
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE).put(record);
  });
}

export async function renameStoredSettingsFile(id: string, name: string): Promise<boolean> {
  const existing = await getStoredSettingsFile(id);
  if (!existing) return false;
  await saveStoredSettingsFile(existing.payload, name.trim() || existing.name, id);
  return true;
}

export async function deleteStoredSettingsFile(id: string): Promise<boolean> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE).delete(id);
  });
}

export function estimatePayloadSize(payload: SettingsExportPayload): number {
  try {
    return new Blob([JSON.stringify(payload)]).size;
  } catch {
    return 0;
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
