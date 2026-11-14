/**
 * 主選單專輯 — Jamendo 下載與快取
 */
import {
  getMenuAlbumById,
  isRemoteMenuAlbum,
  type MenuMusicAlbum,
} from '@/services/music/menuAlbumCatalog';
import {
  countCachedMenuAlbumTracks,
  readMenuAlbumMeta,
  readMenuAlbumTrack,
  writeMenuAlbumMeta,
  writeMenuAlbumTrack,
  type MenuAlbumCacheMeta,
} from '@/services/music/menuMusicCache';
import { fetchJamendoTrackById, isJamendoConfigured, searchJamendoTracks } from './jamendoClient';

export async function ensureMenuAlbumCached(
  albumId: string,
  onProgress?: (done: number, total: number) => void,
): Promise<boolean> {
  const album = getMenuAlbumById(albumId);
  if (!album || !isRemoteMenuAlbum(album) || !isJamendoConfigured()) return false;

  const existing = await countCachedMenuAlbumTracks(albumId);
  if (existing >= album.trackCount) return true;

  const tracks = await searchJamendoTracks({
    tags: album.tags || undefined,
    duration_min: album.duration_min,
    duration_max: album.duration_max,
    limit: album.trackCount,
    albumId: album.jamendoAlbumId,
  });

  if (tracks.length === 0) return false;

  const meta: MenuAlbumCacheMeta = {
    albumId,
    updatedAt: Date.now(),
    tracks: [],
  };

  let done = 0;
  for (let i = 0; i < tracks.length; i++) {
    const t = tracks[i];
    const cached = await readMenuAlbumTrack(albumId, i);
    if (cached?.data?.byteLength) {
      meta.tracks.push({
        index: i,
        jamendoId: t.id,
        title: t.name,
        author: t.artist_name,
      });
      done++;
      onProgress?.(done, tracks.length);
      continue;
    }

    const remote = await fetchJamendoTrackById(t.id, t);
    if (!remote) continue;

    await writeMenuAlbumTrack(albumId, i, remote.data, remote.mimeType, remote.attribution);
    meta.tracks.push({
      index: i,
      jamendoId: t.id,
      title: t.name,
      author: t.artist_name,
    });
    done++;
    onProgress?.(done, tracks.length);
  }

  if (meta.tracks.length === 0) return false;
  await writeMenuAlbumMeta(meta);
  return true;
}

export async function getMenuAlbumTrackBuffer(
  albumId: string,
  trackIndex: number,
): Promise<ArrayBuffer | null> {
  const rec = await readMenuAlbumTrack(albumId, trackIndex);
  return rec?.data?.byteLength ? rec.data : null;
}

export async function getMenuAlbumTrackBlobUrl(
  albumId: string,
  trackIndex: number,
): Promise<string | null> {
  const rec = await readMenuAlbumTrack(albumId, trackIndex);
  if (!rec?.data?.byteLength) return null;
  return URL.createObjectURL(new Blob([rec.data], { type: rec.mimeType }));
}

export async function getMenuAlbumTrackCount(albumId: string): Promise<number> {
  const meta = await readMenuAlbumMeta(albumId);
  return meta?.tracks.length ?? 0;
}

export function albumDownloadItemKey(albumId: string): string {
  return `music:menu-album-pack:${albumId}`;
}

export function describeMenuAlbum(album: MenuMusicAlbum): string {
  return `${album.title}（${album.trackCount} 首）`;
}
