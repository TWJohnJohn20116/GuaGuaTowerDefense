/**
 * 主選單專輯曲目快取 key 與 meta
 */
import { readAudioCache, writeAudioCache } from '../audioCache/audioCacheDb';
import type { AudioAttribution } from '../audioCache/audioApiConfig';

interface MenuAlbumTrackMeta {
  index: number;
  jamendoId: string;
  title: string;
  author: string;
}

export interface MenuAlbumCacheMeta {
  albumId: string;
  tracks: MenuAlbumTrackMeta[];
  updatedAt: number;
}

function menuAlbumMetaKey(albumId: string): string {
  return `music:menu-album-meta:${albumId}`;
}

function menuAlbumTrackKey(albumId: string, index: number): string {
  return `music:menu-album:${albumId}:${index}`;
}

function metaToBuffer(meta: MenuAlbumCacheMeta): ArrayBuffer {
  const json = JSON.stringify(meta);
  return new TextEncoder().encode(json).buffer;
}

function bufferToMeta(data: ArrayBuffer): MenuAlbumCacheMeta | null {
  try {
    const json = new TextDecoder().decode(data);
    return JSON.parse(json) as MenuAlbumCacheMeta;
  } catch {
    return null;
  }
}

export async function readMenuAlbumMeta(albumId: string): Promise<MenuAlbumCacheMeta | null> {
  const rec = await readAudioCache(menuAlbumMetaKey(albumId));
  if (!rec?.data?.byteLength) return null;
  return bufferToMeta(rec.data);
}

export async function writeMenuAlbumMeta(meta: MenuAlbumCacheMeta): Promise<void> {
  await writeAudioCache({
    key: menuAlbumMetaKey(meta.albumId),
    data: metaToBuffer(meta),
    mimeType: 'application/json',
    attribution: null,
    fetchedAt: Date.now(),
  });
}

export async function readMenuAlbumTrack(
  albumId: string,
  index: number,
): Promise<{ data: ArrayBuffer; mimeType: string; attribution: AudioAttribution | null } | null> {
  const rec = await readAudioCache(menuAlbumTrackKey(albumId, index));
  if (!rec?.data?.byteLength) return null;
  return {
    data: rec.data,
    mimeType: rec.mimeType,
    attribution: rec.attribution,
  };
}

export async function writeMenuAlbumTrack(
  albumId: string,
  index: number,
  data: ArrayBuffer,
  mimeType: string,
  attribution: AudioAttribution,
): Promise<void> {
  await writeAudioCache({
    key: menuAlbumTrackKey(albumId, index),
    data,
    mimeType,
    attribution,
    fetchedAt: Date.now(),
  });
}

export async function countCachedMenuAlbumTracks(albumId: string): Promise<number> {
  const meta = await readMenuAlbumMeta(albumId);
  if (!meta?.tracks.length) return 0;
  let n = 0;
  for (const t of meta.tracks) {
    const rec = await readAudioCache(menuAlbumTrackKey(albumId, t.index));
    if (rec?.data?.byteLength) n++;
  }
  return n;
}
