/**
 * 音訊下載項目顯示名稱
 */
import type { MusicTrackId } from '../music/musicConfig';
import type { SoundId } from '../sfx/soundConfig';

export const MUSIC_DOWNLOAD_LABELS: Record<MusicTrackId, string> = {
  menu: '主選單 BGM',
  battle: '戰鬥 BGM',
  victory: '勝利 BGM',
  defeat: '失敗 BGM',
};

export const SFX_DOWNLOAD_LABELS: Record<SoundId, string> = {
  basic_shoot: '基礎射擊音效',
  cannon_shoot: '加農炮音效',
  sniper_shoot: '狙擊音效',
  machine_shoot: '機槍音效',
  enemy_hit: '敵人受擊',
  enemy_death: '敵人死亡',
  coin_collect: '金幣 / 建造',
  wave_start: '波次開始',
  pause: '暫停',
  button_click: '按鈕點擊',
  button_hover: '按鈕懸停',
  game_over: '遊戲失敗',
  error: '錯誤提示',
};
