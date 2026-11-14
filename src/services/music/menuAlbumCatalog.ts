/**
 * 主選單 BGM 專輯目錄（Jamendo 標籤 / 專輯搜尋）
 */

export interface MenuMusicAlbum {
  id: string;
  title: string;
  description: string;
  /** UI 點綴色 */
  accent: string;
  /** Jamendo 標籤（+ 分隔） */
  tags: string;
  duration_min?: number;
  duration_max?: number;
  /** 從 API 抓幾首曲目輪播 */
  trackCount: number;
  /** 若指定則用 albums/tracks API */
  jamendoAlbumId?: number;
}

export const DEFAULT_MENU_ALBUM_ID = 'ambient-chill';

export const MENU_MUSIC_ALBUMS: MenuMusicAlbum[] = [
  {
    id: 'local-default',
    title: '預設氛圍',
    description: '本地 menu.ogg 或程序化合成',
    accent: '#94a3b8',
    tags: '',
    trackCount: 0,
  },
  {
    id: 'ambient-chill',
    title: '寧靜氛圍',
    description: '輕柔 ambient · 適合主選單閒逛',
    accent: '#67e8f9',
    tags: 'ambient+chill+relaxing',
    duration_min: 90,
    duration_max: 360,
    trackCount: 4,
  },
  {
    id: 'lofi-study',
    title: 'Lo-Fi 午後',
    description: 'lofi hip hop · 輕鬆節拍',
    accent: '#fcd34d',
    tags: 'lofi+chillhop+relaxing',
    duration_min: 120,
    duration_max: 300,
    trackCount: 4,
  },
  {
    id: 'piano-dreams',
    title: '鋼琴夢境',
    description: '鋼琴與弦樂 · 沉靜優雅',
    accent: '#c4b5fd',
    tags: 'piano+classical+relaxing',
    duration_min: 90,
    duration_max: 300,
    trackCount: 3,
  },
  {
    id: 'synthwave',
    title: '賽博 Synthwave',
    description: '復古電子 · 霓虹都市感',
    accent: '#f472b6',
    tags: 'synthwave+electronic+retro',
    duration_min: 120,
    duration_max: 300,
    trackCount: 4,
  },
  {
    id: 'acoustic-morning',
    title: '清晨 acoustic',
    description: '木吉他與暖陽 · 清新開始',
    accent: '#fdba74',
    tags: 'acoustic+guitar+happy',
    duration_min: 90,
    duration_max: 240,
    trackCount: 3,
  },
  {
    id: 'space-odyssey',
    title: '太空漫遊',
    description: 'space ambient · 深邃宇宙',
    accent: '#818cf8',
    tags: 'space+ambient+electronic',
    duration_min: 120,
    duration_max: 420,
    trackCount: 3,
  },
  {
    id: 'orchestral-calm',
    title: '管弦寧靜',
    description: '管弦樂 · 史詩而不吵鬧',
    accent: '#86efac',
    tags: 'orchestral+cinematic+calm',
    duration_min: 120,
    duration_max: 360,
    trackCount: 3,
  },
  {
    id: 'world-fusion',
    title: '世界融合',
    description: 'world + ethnic · 異域旅途',
    accent: '#fb923c',
    tags: 'world+ethnic+relaxing',
    duration_min: 90,
    duration_max: 300,
    trackCount: 3,
  },
];

export function getMenuAlbumById(id: string): MenuMusicAlbum | undefined {
  return MENU_MUSIC_ALBUMS.find((a) => a.id === id);
}

export function isRemoteMenuAlbum(album: MenuMusicAlbum): boolean {
  return album.id !== 'local-default' && album.trackCount > 0;
}
