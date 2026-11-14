/**
 * IndexedDB 音訊快取（ArrayBuffer + 授權資訊）
 */
import type { AudioAttribution } from './audioApiConfig';

const DB_NAME = 'guagua-audio-cache-v1';
const STORE = 'assets';
const DB_VERSION = 1;

interface CachedAudioRecord {
  key: string;
  data: ArrayBuffer;
  mimeType: string;
  attribution: AudioAttribution | null;
  fetchedAt: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'));
  });
  return dbPromise;
}

export async function readAudioCache(key: string): Promise<CachedAudioRecord | null> {
  if (typeof indexedDB === 'undefined') return null;
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve((req.result as CachedAudioRecord | undefined) ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function writeAudioCache(record: CachedAudioRecord): Promise<void> {
  if (typeof indexedDB === 'undefined') return;
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE).put(record);
  });
}

export async function listAudioAttributions(): Promise<AudioAttribution[]> {
  if (typeof indexedDB === 'undefined') return [];
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => {
      const rows = (req.result as CachedAudioRecord[]) ?? [];
      const seen = new Set<string>();
      const out: AudioAttribution[] = [];
      for (const row of rows) {
        if (!row.attribution) continue;
        const sig = `${row.attribution.url}|${row.attribution.title}`;
        if (seen.has(sig)) continue;
        seen.add(sig);
        out.push(row.attribution);
      }
      resolve(out);
    };
    req.onerror = () => reject(req.error);
  });
}
