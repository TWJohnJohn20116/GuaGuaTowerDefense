/**
 * 主選單 BGM 專輯播放輔助
 */
import {
  getMenuAlbumById,
  isRemoteMenuAlbum,
} from '@/services/music/menuAlbumCatalog';
import {
  ensureMenuAlbumCached,
  getMenuAlbumTrackBlobUrl,
  getMenuAlbumTrackBuffer,
  getMenuAlbumTrackCount,
} from '@/services/audioCache/menuJamendoService';
import { useMenuMusicStore } from '@/store/menuMusicStore';
import { MUSIC_TRACKS } from './musicConfig';
import { getMusicArrayBuffer, getMusicBlobUrl } from '../audioCache/audioFetchService';

export interface MenuPlaybackContext {
  albumId: string;
  trackIndex: number;
  trackCount: number;
  shuffle: boolean;
  useRemoteAlbum: boolean;
}

let menuBlobUrl: string | null = null;

export function revokeMenuBlobUrl(): void {
  if (menuBlobUrl) {
    URL.revokeObjectURL(menuBlobUrl);
    menuBlobUrl = null;
  }
}

let previewAlbumOverride: string | null = null;

export function setMenuAlbumPreview(albumId: string | null): void {
  previewAlbumOverride = albumId;
}

export function getMenuAlbumPreview(): string | null {
  return previewAlbumOverride;
}

export function readMenuPlaybackContext(trackIndex: number): MenuPlaybackContext {
  const { selectedAlbumId, shuffle } = useMenuMusicStore.getState();
  const albumId = previewAlbumOverride ?? selectedAlbumId;
  const album = getMenuAlbumById(albumId);
  const useRemoteAlbum = Boolean(album && isRemoteMenuAlbum(album));
  return {
    albumId,
    trackIndex,
    trackCount: album?.trackCount ?? 0,
    shuffle,
    useRemoteAlbum,
  };
}

export function pickNextMenuTrackIndex(ctx: MenuPlaybackContext): number {
  if (ctx.trackCount <= 1) return 0;
  if (ctx.shuffle) {
    if (ctx.trackCount === 2) return ctx.trackIndex === 0 ? 1 : 0;
    let next = ctx.trackIndex;
    while (next === ctx.trackIndex) {
      next = Math.floor(Math.random() * ctx.trackCount);
    }
    return next;
  }
  return (ctx.trackIndex + 1) % ctx.trackCount;
}

export async function resolveMenuTrackCount(albumId: string): Promise<number> {
  const album = getMenuAlbumById(albumId);
  if (!album || !isRemoteMenuAlbum(album)) return 0;
  await ensureMenuAlbumCached(albumId);
  return getMenuAlbumTrackCount(albumId);
}

/** 載入主選單音訊 ArrayBuffer（專輯或預設 menu） */
export async function loadMenuArrayBuffer(ctx: MenuPlaybackContext): Promise<ArrayBuffer | null> {
  if (!ctx.useRemoteAlbum) {
    return getMusicArrayBuffer('menu');
  }
  await ensureMenuAlbumCached(ctx.albumId);
  const count = await getMenuAlbumTrackCount(ctx.albumId);
  if (count === 0) return getMusicArrayBuffer('menu');
  const idx = Math.min(ctx.trackIndex, count - 1);
  return getMenuAlbumTrackBuffer(ctx.albumId, idx);
}

/** 載入主選單 blob URL（HTMLAudio fallback） */
export async function loadMenuBlobUrl(ctx: MenuPlaybackContext): Promise<string | null> {
  revokeMenuBlobUrl();
  if (!ctx.useRemoteAlbum) {
    return getMusicBlobUrl('menu');
  }
  await ensureMenuAlbumCached(ctx.albumId);
  const count = await getMenuAlbumTrackCount(ctx.albumId);
  if (count === 0) return getMusicBlobUrl('menu');
  const idx = Math.min(ctx.trackIndex, count - 1);
  const url = await getMenuAlbumTrackBlobUrl(ctx.albumId, idx);
  menuBlobUrl = url;
  return url;
}

export function shouldLoopMenuTrack(trackCount: number, useRemoteAlbum: boolean): boolean {
  if (!useRemoteAlbum) return MUSIC_TRACKS.menu.loop;
  return trackCount <= 1;
}

export async function prefetchSelectedMenuAlbum(): Promise<void> {
  const { selectedAlbumId } = useMenuMusicStore.getState();
  const album = getMenuAlbumById(selectedAlbumId);
  if (!album || !isRemoteMenuAlbum(album)) return;
  await ensureMenuAlbumCached(selectedAlbumId);
}
