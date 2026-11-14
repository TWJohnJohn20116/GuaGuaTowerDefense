/**
 * 主選單 BGM 專輯偏好
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_MENU_ALBUM_ID } from '@/services/music/menuAlbumCatalog';

interface MenuMusicState {
  selectedAlbumId: string;
  shuffle: boolean;
  setSelectedAlbumId: (id: string) => void;
  setShuffle: (shuffle: boolean) => void;
}

export const useMenuMusicStore = create<MenuMusicState>()(
  persist(
    (set) => ({
      selectedAlbumId: DEFAULT_MENU_ALBUM_ID,
      shuffle: false,
      setSelectedAlbumId: (id) => set({ selectedAlbumId: id }),
      setShuffle: (shuffle) => set({ shuffle }),
    }),
    { name: 'guagua-menu-music' },
  ),
);
