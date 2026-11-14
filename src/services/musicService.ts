/**
 * BGM 背景音樂服務
 *
 * - 依 scene 自動切換曲目（menu / battle / victory / defeat）
 * - 優先播放 public/music/*.ogg；檔案不存在時 fallback 程序化 ambient
 * - 暫停遊戲時 duck 音量；讀取 gameStore musicEnabled / musicVolume
 * - 首次使用者互動後解鎖 AudioContext
 */
import { useGameStore } from '@/store/gameStore';
import type { GameScene } from '@/types/game';
import { MusicEngine } from './music/musicEngine';
import { PAUSE_DUCK, resolveMusicTrack } from './music/musicConfig';
import { onAudioPrefetchDone } from './audioCache/audioFetchService';
import { useMenuMusicStore } from '@/store/menuMusicStore';
import { prefetchSelectedMenuAlbum, setMenuAlbumPreview, getMenuAlbumPreview } from './music/menuMusicPlayback';
import { getMenuAlbumById, isRemoteMenuAlbum } from './music/menuAlbumCatalog';
import { ensureMenuAlbumCached } from './audioCache/menuJamendoService';

const engine = new MusicEngine();
let initialized = false;
let lastScene: GameScene | null = null;
let lastPaused = false;

function readAudioPrefs() {
  const { musicEnabled, musicVolume, isPaused, scene } = useGameStore.getState();
  return { musicEnabled, musicVolume, isPaused, scene };
}

function applyPrefs(): void {
  const { musicEnabled, musicVolume, isPaused, scene } = readAudioPrefs();
  engine.setEnabled(musicEnabled);
  engine.setVolume(musicVolume);
  const duck = scene === 'game' && isPaused ? PAUSE_DUCK : 1;
  engine.setDuck(duck);
}

/** 依場景同步 BGM（App 監聽 scene / isPaused 時呼叫） */
export function syncMusic(scene?: GameScene, force = false): void {
  if (typeof window === 'undefined') return;

  const state = useGameStore.getState();
  const targetScene = scene ?? state.scene;
  const isPaused = state.isPaused;

  applyPrefs();

  const track = resolveMusicTrack(targetScene);
  if (!track || !state.musicEnabled) {
    if (!state.musicEnabled) engine.stop();
    return;
  }

  const sceneChanged = lastScene !== targetScene;
  const pauseChanged = lastPaused !== isPaused;
  lastScene = targetScene;
  lastPaused = isPaused;

  if (sceneChanged || pauseChanged || force) {
    void engine.playTrack(track, force);
  }
}

/** 解鎖 BGM 並立即同步當前場景（強制重播以套用快取） */
export function unlockMusic(): void {
  engine.unlock();
  lastScene = null;
  syncMusic(undefined, true);
}

/**
 * 初始化 BGM：訂閱 store 音量變化 + 安裝首次互動解鎖
 * 在 App 掛載時呼叫一次
 */
export function initMusic(): void {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  const unlock = () => {
    unlockMusic();
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  };
  window.addEventListener('pointerdown', unlock, { once: true, passive: true });
  window.addEventListener('keydown', unlock, { once: true });

  useGameStore.subscribe((state, prev) => {
    const volChanged =
      state.musicEnabled !== prev.musicEnabled ||
      state.musicVolume !== prev.musicVolume;
    const pauseChanged = state.isPaused !== prev.isPaused;
    const sceneChanged = state.scene !== prev.scene;

    if (volChanged) {
      applyPrefs();
      if (state.musicEnabled && !prev.musicEnabled) {
        lastScene = null;
        syncMusic(state.scene);
      }
    }
    if (sceneChanged) syncMusic(state.scene);
    else if (pauseChanged && state.scene === 'game') applyPrefs();
  });

  onAudioPrefetchDone(() => {
    lastScene = null;
    syncMusic(undefined, true);
  });

  useMenuMusicStore.subscribe((state, prev) => {
    if (state.selectedAlbumId !== prev.selectedAlbumId || state.shuffle !== prev.shuffle) {
      lastScene = null;
      void prefetchSelectedMenuAlbum().then(() => syncMusic(undefined, true));
    }
  });
}

/** 設定頁試聽：暫時播放指定主選單專輯（不變更已選專輯） */
export async function previewMenuAlbum(albumId: string): Promise<boolean> {
  const { musicEnabled } = useGameStore.getState();
  if (!musicEnabled) return false;

  const album = getMenuAlbumById(albumId);
  if (!album) return false;

  setMenuAlbumPreview(albumId);
  engine.unlock();
  applyPrefs();

  if (isRemoteMenuAlbum(album)) {
    await ensureMenuAlbumCached(albumId);
  }

  lastScene = null;
  await engine.playTrack('menu', true);
  return true;
}

/** 停止試聽並恢復目前選定的專輯 */
export function stopMenuAlbumPreview(): void {
  if (!getMenuAlbumPreview()) return;
  setMenuAlbumPreview(null);
  lastScene = null;
  syncMusic(undefined, true);
}

/** 設定頁測試用：強制播放指定場景對應曲目 */
export function previewMusicForScene(scene: GameScene): void {
  engine.unlock();
  const track = resolveMusicTrack(scene);
  if (track) void engine.playTrack(track);
}
