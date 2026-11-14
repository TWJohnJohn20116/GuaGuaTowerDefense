/**
 * 音訊 API 下載 + IndexedDB 快取 + 背景預取 + 進度追蹤
 */
import type { MusicTrackId } from '../music/musicConfig';
import { MUSIC_TRACKS } from '../music/musicConfig';
import type { SoundId } from '../sfx/soundConfig';
import { SOUND_SRC } from '../sfx/soundConfig';
import {
  FREESOUND_SEARCH,
  JAMENDO_SEARCH,
  musicCacheKey,
  sfxCacheKey,
  type AudioAttribution,
} from './audioApiConfig';
import { MUSIC_DOWNLOAD_LABELS, SFX_DOWNLOAD_LABELS } from './audioDownloadLabels';
import { readAudioCache, writeAudioCache, listAudioAttributions } from './audioCacheDb';
import { fetchFreesoundPreview, isFreesoundConfigured } from './freesoundClient';
import { fetchJamendoTrack, isJamendoConfigured } from './jamendoClient';
import {
  useAudioDownloadStore,
  type AudioDownloadItem,
  type AudioDownloadItemState,
} from '@/store/audioDownloadStore';

const inflight = new Map<string, Promise<unknown>>();
const sfxBlobUrls = new Map<SoundId, string>();

let prefetchPromise: Promise<void> | null = null;
const prefetchListeners = new Set<() => void>();

export function onAudioPrefetchDone(listener: () => void): () => void {
  prefetchListeners.add(listener);
  return () => prefetchListeners.delete(listener);
}

function notifyPrefetchDone(): void {
  for (const fn of prefetchListeners) fn();
}

function dedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;
  const p = fn().finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

async function localFileExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

function patchItem(key: string, patch: Partial<AudioDownloadItem>): void {
  useAudioDownloadStore.getState().patchItem(key, patch);
}

async function resolveInitialState(
  key: string,
  localUrl: string,
): Promise<AudioDownloadItemState> {
  if (await localFileExists(localUrl)) return 'skipped';
  const cached = await readAudioCache(key);
  if (cached?.data?.byteLength) return 'done';
  return 'pending';
}

/** 建立下載佇列並同步已快取 / 本地檔狀態 */
export async function refreshAudioDownloadQueue(): Promise<AudioDownloadItem[]> {
  const items: AudioDownloadItem[] = [];

  if (isJamendoConfigured()) {
    const musicIds = Object.keys(JAMENDO_SEARCH) as MusicTrackId[];
    for (const id of musicIds) {
      const key = musicCacheKey(id);
      const state = await resolveInitialState(key, MUSIC_TRACKS[id].src);
      const cached = state === 'done' ? await readAudioCache(key) : null;
      items.push({
        key,
        label: MUSIC_DOWNLOAD_LABELS[id],
        kind: 'music',
        state,
        bytes: cached?.data.byteLength,
      });
    }
  }

  if (isFreesoundConfigured()) {
    const sfxIds = Object.keys(FREESOUND_SEARCH) as SoundId[];
    for (const id of sfxIds) {
      const key = sfxCacheKey(id);
      const state = await resolveInitialState(key, SOUND_SRC[id]);
      const cached = state === 'done' ? await readAudioCache(key) : null;
      items.push({
        key,
        label: SFX_DOWNLOAD_LABELS[id],
        kind: 'sfx',
        state,
        bytes: cached?.data.byteLength,
      });
    }
  }

  useAudioDownloadStore.getState().setQueue(items);
  return items;
}

export async function getMusicArrayBuffer(trackId: MusicTrackId): Promise<ArrayBuffer | null> {
  const key = musicCacheKey(trackId);
  const cached = await readAudioCache(key);
  if (cached?.data?.byteLength) return cached.data;

  if (!(await localFileExists(MUSIC_TRACKS[trackId].src))) {
    return dedupe(key, async () => {
      patchItem(key, { state: 'downloading', error: undefined });
      try {
        const remote = await fetchJamendoTrack(trackId);
        if (!remote) {
          patchItem(key, { state: 'failed', error: 'Jamendo 無可用曲目' });
          return null;
        }
        await writeAudioCache({
          key,
          data: remote.data,
          mimeType: remote.mimeType,
          attribution: remote.attribution,
          fetchedAt: Date.now(),
        });
        patchItem(key, { state: 'done', bytes: remote.data.byteLength });
        return remote.data;
      } catch (e) {
        patchItem(key, {
          state: 'failed',
          error: e instanceof Error ? e.message : '下載失敗',
        });
        return null;
      }
    });
  }
  return null;
}

export function getSfxBlobUrlSync(soundId: SoundId): string | null {
  return sfxBlobUrls.get(soundId) ?? null;
}

async function materializeSfxBlob(soundId: SoundId, data: ArrayBuffer, mimeType: string): Promise<string> {
  const prev = sfxBlobUrls.get(soundId);
  if (prev) URL.revokeObjectURL(prev);
  const url = URL.createObjectURL(new Blob([data], { type: mimeType }));
  sfxBlobUrls.set(soundId, url);
  return url;
}

export async function ensureSfxCached(soundId: SoundId): Promise<string | null> {
  const ready = getSfxBlobUrlSync(soundId);
  if (ready) return ready;

  const key = sfxCacheKey(soundId);
  const cached = await readAudioCache(key);
  if (cached?.data?.byteLength) {
    patchItem(key, { state: 'done', bytes: cached.data.byteLength });
    return materializeSfxBlob(soundId, cached.data, cached.mimeType);
  }

  if (await localFileExists(SOUND_SRC[soundId])) {
    patchItem(key, { state: 'skipped' });
    return null;
  }

  return dedupe(key, async () => {
    patchItem(key, { state: 'downloading', error: undefined });
    try {
      const remote = await fetchFreesoundPreview(soundId);
      if (!remote) {
        patchItem(key, { state: 'failed', error: 'Freesound 無匹配音效' });
        return null;
      }
      await writeAudioCache({
        key,
        data: remote.data,
        mimeType: remote.mimeType,
        attribution: remote.attribution,
        fetchedAt: Date.now(),
      });
      patchItem(key, { state: 'done', bytes: remote.data.byteLength });
      return materializeSfxBlob(soundId, remote.data, remote.mimeType);
    } catch (e) {
      patchItem(key, {
        state: 'failed',
        error: e instanceof Error ? e.message : '下載失敗',
      });
      return null;
    }
  });
}
export function isRemoteAudioEnabled(): boolean {
  return isJamendoConfigured() || isFreesoundConfigured();
}

export async function getAudioAttributions(): Promise<AudioAttribution[]> {
  return listAudioAttributions();
}

export function startAudioPrefetch(force = false): void {
  if (prefetchPromise && !force) return;
  if (!isRemoteAudioEnabled()) {
    useAudioDownloadStore.getState().setStatus('idle');
    return;
  }

  prefetchPromise = runPrefetch(force).finally(() => {
    prefetchPromise = null;
  });
}

/** 重新下載失敗項目 */
export function retryFailedAudioDownloads(): void {
  const store = useAudioDownloadStore.getState();
  const items = store.items.map((it) =>
    it.state === 'failed' ? { ...it, state: 'pending' as const, error: undefined } : it,
  );
  store.setQueue(items);
  startAudioPrefetch(true);
}

async function runPrefetch(force: boolean): Promise<void> {
  const store = useAudioDownloadStore.getState();
  if (!force || store.items.length === 0) {
    await refreshAudioDownloadQueue();
  }

  const queue = useAudioDownloadStore.getState().items;
  const pendingMusic = queue.filter((i) => i.kind === 'music' && i.state === 'pending');
  const pendingSfx = queue.filter((i) => i.kind === 'sfx' && i.state === 'pending');

  if (pendingMusic.length === 0 && pendingSfx.length === 0) {
    const hasFailed = queue.some((i) => i.state === 'failed');
    store.setStatus(hasFailed ? 'partial' : queue.length > 0 ? 'done' : 'idle');
    store.setFinished(Date.now());
    notifyPrefetchDone();
    return;
  }

  store.setStatus('running');
  store.setStarted(Date.now());
  store.setFinished(null);

  const musicIds = pendingMusic.map((i) => i.key.replace('music:', '') as MusicTrackId);
  const sfxIds = pendingSfx.map((i) => i.key.replace('sfx:', '') as SoundId);

  const tasks: Array<() => Promise<unknown>> = [];
  for (const id of musicIds) tasks.push(() => getMusicArrayBuffer(id));
  for (const id of sfxIds) tasks.push(() => ensureSfxCached(id));

  let ok = 0;
  const batchSize = 2;
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    const results = await Promise.allSettled(batch.map((fn) => fn()));
    ok += results.filter((r) => r.status === 'fulfilled' && r.value).length;
  }

  const finalItems = useAudioDownloadStore.getState().items;
  const failed = finalItems.some((i) => i.state === 'failed');
  const allDone = finalItems.every(
    (i) => i.state === 'done' || i.state === 'skipped' || i.state === 'failed',
  );
  const successCount = finalItems.filter((i) => i.state === 'done' || i.state === 'skipped').length;

  store.setStatus(
    failed && successCount > 0 ? 'partial' : failed ? 'partial' : allDone ? 'done' : 'partial',
  );
  store.setFinished(Date.now());
  notifyPrefetchDone();
}

export function resolveSfxSrc(soundId: SoundId): string {
  return getSfxBlobUrlSync(soundId) ?? SOUND_SRC[soundId];
}

const musicBlobUrls = new Map<MusicTrackId, string>();

/** Jamendo MP3 的 blob URL（供 HTMLAudio 播放） */
export async function getMusicBlobUrl(trackId: MusicTrackId): Promise<string | null> {
  const existing = musicBlobUrls.get(trackId);
  if (existing) return existing;

  const data = await getMusicArrayBuffer(trackId);
  if (!data?.byteLength) return null;

  const url = URL.createObjectURL(new Blob([data], { type: 'audio/mpeg' }));
  musicBlobUrls.set(trackId, url);
  return url;
}
