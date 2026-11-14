/** 邏輯音效 id（對應 public/sounds 下的檔名） */
export type SoundId =
  | 'basic_shoot' | 'cannon_shoot' | 'sniper_shoot' | 'machine_shoot'
  | 'enemy_hit' | 'enemy_death' | 'coin_collect' | 'wave_start' | 'pause'
  | 'button_click' | 'button_hover' | 'game_over' | 'error';

export const SOUND_SRC: Record<SoundId, string> = {
  basic_shoot: '/sounds/basic_shoot.wav',
  cannon_shoot: '/sounds/cannon_shoot.wav',
  sniper_shoot: '/sounds/sniper_shoot.wav',
  machine_shoot: '/sounds/machine_shoot.wav',
  enemy_hit: '/sounds/enemy_hit.wav',
  enemy_death: '/sounds/enemy_death.wav',
  coin_collect: '/sounds/coin_collect.wav',
  wave_start: '/sounds/wave_start.wav',
  pause: '/sounds/pause.wav',
  button_click: '/sounds/button_click.wav',
  button_hover: '/sounds/button_hover.wav',
  game_over: '/sounds/game_over.wav',
  error: '/sounds/error.wav',
};

export const THROTTLE_MS: Partial<Record<SoundId, number>> = {
  basic_shoot: 55,
  cannon_shoot: 70,
  sniper_shoot: 70,
  machine_shoot: 45,
  enemy_hit: 70,
  enemy_death: 45,
  coin_collect: 70,
  button_hover: 50,
  button_click: 30,
};

export const DEFAULT_THROTTLE_MS = 40;

export const POOL_SIZE = 6;
