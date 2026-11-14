/**
 * 音效播放引擎
 * 檔案優先（public/sounds/*.wav），404 或播放失敗時 fallback 程序化 SFX
 */
import type { GameStore } from '@/store/gameStoreTypes';
import { canPlaySfx, type SfxType } from '@/store/settingsStore';
import type { TowerType } from '@/types/game';
import {
  DEFAULT_THROTTLE_MS,
  POOL_SIZE,
  SOUND_SRC,
  THROTTLE_MS,
  type SoundId,
} from './sfx/soundConfig';
import { playProceduralSfx, unlockProceduralSfx } from './sfx/proceduralSfx';
import {
  ensureSfxCached,
  resolveSfxSrc,
  startAudioPrefetch,
  onAudioPrefetchDone,
  getSfxBlobUrlSync,
} from './audioCache/audioFetchService';

type SfxCategory = SfxType | 'misc';

const CATEGORY_GAIN: Record<SfxCategory, number> = {
  attack: 0.5,
  death: 0.7,
  build: 0.8,
  ui: 0.6,
  misc: 0.9,
};

const pools: Partial<Record<SoundId, HTMLAudioElement[]>> = {};
const poolCursor: Partial<Record<SoundId, number>> = {};
const lastPlayed: Partial<Record<SoundId, number>> = {};
/** false = 已知檔案不可用，直接用程序化 */
const fileOk: Partial<Record<SoundId, boolean>> = {};
let initialized = false;

const now = (): number =>
  typeof performance !== 'undefined' ? performance.now() : Date.now();

function computeVolume(
  category: SfxCategory,
  soundVolume: number,
  extra?: number,
): number {
  const gain = CATEGORY_GAIN[category] ?? 1;
  return Math.max(0, Math.min(1, soundVolume * gain * (extra ?? 1)));
}

function playViaProcedural(
  id: SoundId,
  category: SfxCategory,
  soundVolume: number,
  extra?: number,
): void {
  playProceduralSfx(id, computeVolume(category, soundVolume, extra));
}

function buildPool(id: SoundId): HTMLAudioElement[] {
  const base = new Audio(resolveSfxSrc(id));
  base.preload = 'auto';
  const pool: HTMLAudioElement[] = [base];
  for (let i = 1; i < POOL_SIZE; i++) {
    pool.push(base.cloneNode(true) as HTMLAudioElement);
  }
  return pool;
}

async function probeSoundFiles(): Promise<void> {
  await Promise.all(
    (Object.keys(SOUND_SRC) as SoundId[]).map(async (id) => {
      try {
        const res = await fetch(SOUND_SRC[id], { method: 'HEAD' });
        fileOk[id] = res.ok;
      } catch {
        fileOk[id] = false;
      }
    }),
  );
}

type AudioPrefs = Pick<GameStore, 'soundEnabled' | 'soundVolume'>;

/** 這個執行環境有沒有 Web Audio（jsdom 沒有，Tauri/Chromium 有） */
const hasWebAudio = (): boolean =>
  typeof window !== 'undefined' &&
  (typeof (window as unknown as { AudioContext?: unknown }).AudioContext !== 'undefined' ||
    typeof (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext !== 'undefined');

/**
 * 音效偏好讀取器（由入口注入）。
 * 不在這裡 import useGameStore，是為了避免 store ⇄ service 的循環依賴；
 * 未注入時退回預設值，讓音效服務可以獨立被測試或提前載入。
 */
let readAudioPrefs: () => AudioPrefs = () => ({ soundEnabled: true, soundVolume: 0.7 });

export function setAudioPrefsProvider(provider: () => AudioPrefs): void {
  readAudioPrefs = provider;
}

export function playSfx(
  id: SoundId,
  opts: { category: SfxCategory; volume?: number } = { category: 'misc' },
): void {
  if (typeof window === 'undefined') return;
  // 沒有 Web Audio 的環境（jsdom / 舊 webview）整段跳過：
  // 之前會走到 el.play() 回傳 undefined 再 .catch 爆掉，然後 fallback 的程序化音效
  // 也因為沒有 AudioContext 再爆一次——音效是裝飾品，不該讓呼叫它的遊戲邏輯（例如建造）失敗。
  if (!hasWebAudio()) return;

  const { soundEnabled, soundVolume } = readAudioPrefs();
  if (!soundEnabled || soundVolume <= 0) return;

  const { category } = opts;
  if (category !== 'misc' && !canPlaySfx(category)) return;

  const t = now();
  const minGap = THROTTLE_MS[id] ?? DEFAULT_THROTTLE_MS;
  if (t - (lastPlayed[id] ?? -Infinity) < minGap) return;
  lastPlayed[id] = t;

  if (fileOk[id] === false) {
    const blobSrc = resolveSfxSrc(id);
    if (blobSrc !== SOUND_SRC[id]) {
      fileOk[id] = true;
      delete pools[id];
    } else {
      playViaProcedural(id, category, soundVolume, opts.volume);
      void ensureSfxCached(id).then((url) => {
        if (url) {
          fileOk[id] = true;
          delete pools[id];
        }
      });
      return;
    }
  }

  let pool = pools[id];
  if (!pool) {
    pool = buildPool(id);
    pools[id] = pool;
    poolCursor[id] = 0;
  }
  const idx = (poolCursor[id] ?? 0) % pool.length;
  poolCursor[id] = idx + 1;

  const el = pool[idx];
  const vol = computeVolume(category, soundVolume, opts.volume);
  el.volume = vol;
  try {
    el.currentTime = 0;
    void el.play().catch(() => {
      fileOk[id] = false;
      playViaProcedural(id, category, soundVolume, opts.volume);
    });
  } catch {
    fileOk[id] = false;
    playViaProcedural(id, category, soundVolume, opts.volume);
  }
}

const TOWER_FIRE_SOUND: Partial<Record<TowerType, SoundId>> = {
  basic: 'basic_shoot',
  machine: 'machine_shoot',
  sniper: 'sniper_shoot',
  cannon: 'cannon_shoot',
  ballista: 'sniper_shoot',
};

export const playTowerFire = (towerType: TowerType): void =>
  playSfx(TOWER_FIRE_SOUND[towerType] ?? 'basic_shoot', { category: 'attack' });

export const playEnemyHit = (): void => playSfx('enemy_hit', { category: 'attack' });
export const playEnemyDeath = (): void => playSfx('enemy_death', { category: 'death' });
export const playBuild = (): void => playSfx('coin_collect', { category: 'build' });
export const playUpgrade = (): void => playSfx('coin_collect', { category: 'build', volume: 1.1 });
export const playSkill = (): void => playSfx('cannon_shoot', { category: 'attack', volume: 1.1 });
export const playWaveStart = (): void => playSfx('wave_start', { category: 'misc' });
export const playLeak = (): void => playSfx('error', { category: 'misc' });
export const playGameOver = (): void => playSfx('game_over', { category: 'misc' });
export const playVictory = (): void => playSfx('wave_start', { category: 'misc', volume: 1.2 });
const playUiClick = (): void => playSfx('button_click', { category: 'ui' });
export const playUiHover = (): void => playSfx('button_hover', { category: 'ui', volume: 0.7 });

export function initAudio(): void {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  void probeSoundFiles().then(() => {
    for (const id of Object.keys(SOUND_SRC) as SoundId[]) {
      if (fileOk[id] === false) void ensureSfxCached(id);
    }
  });

  startAudioPrefetch();

  onAudioPrefetchDone(() => {
    for (const id of Object.keys(SOUND_SRC) as SoundId[]) {
      if (getSfxBlobUrlSync(id)) {
        fileOk[id] = true;
        delete pools[id];
      }
    }
  });

  const unlock = () => {
    unlockProceduralSfx();
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  };
  window.addEventListener('pointerdown', unlock, { once: true, passive: true });
  window.addEventListener('keydown', unlock, { once: true });

  document.addEventListener(
    'pointerdown',
    (e) => {
      const target = e.target as HTMLElement | null;
      const btn = target?.closest?.('button');
      if (!btn) return;
      if (btn.hasAttribute('disabled') || btn.hasAttribute('data-no-sfx')) return;
      playUiClick();
    },
    { capture: true },
  );
}
