/**
 * BGM 曲目定義與場景映射
 */
import type { GameScene } from '@/types/game';

export type MusicTrackId = 'menu' | 'battle' | 'victory' | 'defeat';

export interface MusicTrackDef {
  id: MusicTrackId;
  /** public/ 下的相對路徑 */
  src: string;
  loop: boolean;
}

export const MUSIC_TRACKS: Record<MusicTrackId, MusicTrackDef> = {
  menu: { id: 'menu', src: '/music/menu.ogg', loop: true },
  battle: { id: 'battle', src: '/music/battle.ogg', loop: true },
  victory: { id: 'victory', src: '/music/victory.ogg', loop: false },
  defeat: { id: 'defeat', src: '/music/defeat.ogg', loop: false },
};

/** 結算曲目播放完畢後回到的曲目 */
export const STINGER_RETURN: Record<'victory' | 'defeat', MusicTrackId> = {
  victory: 'menu',
  defeat: 'menu',
};

const MENU_SCENES = new Set<GameScene>([
  'mainMenu',
  'pathSelection',
  'settings',
  'tutorial',
  'changelog',
  'encyclopedia',
  'workshop',
  'achievements',
  'skins',
  'shop',
  'statistics',
  'modEditor',
  'modManager',
  'mapEditor',
  'talentTree',
  'replay',
  'memorial',
  'dailyChallenge',
  'mutatorChallenge',
]);

/** 依場景解析應播放的 BGM 曲目 */
export function resolveMusicTrack(scene: GameScene): MusicTrackId | null {
  if (scene === 'game') return 'battle';
  if (scene === 'victory') return 'victory';
  if (scene === 'gameOver') return 'defeat';
  if (MENU_SCENES.has(scene)) return 'menu';
  return 'menu';
}

export const CROSSFADE_SEC = 1.4;
export const PAUSE_DUCK = 0.32;
