/**
 * 音訊 API 設定與資產搜尋 manifest
 */
import type { MusicTrackId } from '../music/musicConfig';
import type { SoundId } from '../sfx/soundConfig';

export const JAMENDO_CLIENT_ID =
  import.meta.env.VITE_JAMENDO_CLIENT_ID?.trim() || '709fa152';

export const FREESOUND_API_KEY =
  import.meta.env.VITE_FREESOUND_API_KEY?.trim() || '';

export const JAMENDO_BASE = 'https://api.jamendo.com/v3.0';
export const FREESOUND_BASE = 'https://freesound.org/apiv2';

/** Jamendo 標籤搜尋（CC 授權音樂） */
export const JAMENDO_SEARCH: Record<
  MusicTrackId,
  { tags: string; duration_min?: number; duration_max?: number }
> = {
  menu: { tags: 'ambient+chill+relaxing', duration_min: 60, duration_max: 300 },
  battle: { tags: 'electronic+rock', duration_min: 90, duration_max: 240 },
  victory: { tags: 'happy+upbeat', duration_min: 30, duration_max: 120 },
  defeat: { tags: 'sad+dramatic', duration_min: 30, duration_max: 120 },
};

/** Freesound 文字搜尋（preview MP3，免 OAuth） */
export const FREESOUND_SEARCH: Record<SoundId, string> = {
  basic_shoot: 'laser gun short sci-fi',
  cannon_shoot: 'cannon fire explosion',
  sniper_shoot: 'sniper rifle shot',
  machine_shoot: 'machine gun burst short',
  enemy_hit: 'impact hit punch',
  enemy_death: 'enemy death game',
  coin_collect: 'coin pickup collect',
  wave_start: 'horn fanfare short',
  pause: 'menu select soft',
  button_click: 'ui click button',
  button_hover: 'ui hover soft',
  game_over: 'game over fail',
  error: 'error buzz wrong',
};

export type AudioCacheSource = 'jamendo' | 'freesound' | 'file';

export interface AudioAttribution {
  title: string;
  author: string;
  url: string;
  license: string;
  source: AudioCacheSource;
}

export function musicCacheKey(trackId: MusicTrackId): string {
  return `music:${trackId}`;
}

export function sfxCacheKey(soundId: SoundId): string {
  return `sfx:${soundId}`;
}
