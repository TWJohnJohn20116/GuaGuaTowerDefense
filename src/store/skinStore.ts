/**
 * 皮膚系統狀態管理
 * Skin System State Management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TowerType } from '@/types/game';
import type { SkinVisuals, PlayerSkinData } from '@/types/skin';
import { ALL_SKINS, getSkin, getDefaultSkinId, getSkinsForTower } from '@/data/skinData';

// 同步皮膚統計到成就系統（lazy import 避免循環依賴）
const syncToAchievement = (
  unlockedSkins: string[],
  equippedSkins: Record<TowerType, string | null>
) => {
  const totalSkins = ALL_SKINS.filter(s => !s.hidden).length;
  let nonDefaultEquipped = 0;
  Object.entries(equippedSkins).forEach(([towerType, skinId]) => {
    const defaultId = getDefaultSkinId(towerType as TowerType);
    if (skinId && skinId !== defaultId) nonDefaultEquipped++;
  });

  void import('@/store/achievementStore').then(mod => {
    mod.useAchievementStore.getState().syncSkinStats(
      unlockedSkins.length,
      nonDefaultEquipped,
      totalSkins,
    );
  });
};

// 所有塔類型
const ALL_TOWER_TYPES: TowerType[] = [
  'basic', 'sniper', 'cannon', 'machine', 'shotgun', 'ballista',
  'frost', 'poison', 'laser', 'lightning', 'flame', 'money', 'wind', 'pulse',
  'storm', 'plague', 'demolisher', 'tempest',
];

// 初始裝備的皮膚 (每種塔的預設皮膚)
const getInitialEquippedSkins = (): Record<TowerType, string | null> => {
  const equipped: Record<TowerType, string | null> = {} as Record<TowerType, string | null>;
  ALL_TOWER_TYPES.forEach(type => {
    equipped[type] = getDefaultSkinId(type);
  });
  return equipped;
};

// 取得預設解鎖的皮膚
const getInitialUnlockedSkins = (): string[] => {
  return ALL_SKINS
    .filter(skin => skin.unlockCondition.type === 'default')
    .map(skin => skin.id);
};

interface SkinStoreState extends PlayerSkinData {
  // 動作
  unlockSkin: (skinId: string) => void;
  equipSkin: (towerType: TowerType, skinId: string | null) => void;
  unequipSkin: (towerType: TowerType) => void;
  toggleFavorite: (skinId: string) => void;
  toggleFavoriteSet: (setId: string) => void;
  
  // 修改器功能
  unlockAllSkins: () => void;
  resetSkins: () => void;
  
  // 查詢
  isSkinUnlocked: (skinId: string) => boolean;
  isSkinEquipped: (skinId: string) => boolean;
  getEquippedSkin: (towerType: TowerType) => string | null;
  getSkinVisuals: (towerType: TowerType) => SkinVisuals | null;
  /** 取得當前裝備皮膚的模型集 ID (用於以自訂模型繪製塔) */
  getEquippedSkinModelSet: (towerType: TowerType) => string | undefined;
  getUnlockedSkinsForTower: (towerType: TowerType) => string[];
  
  // 統計
  getStats: () => {
    totalSkins: number;
    unlockedSkins: number;
    equippedSkins: number;
    completionRate: number;
  };
  
  // 條件檢查
  checkUnlockConditions: (stats: {
    kills?: Record<TowerType, number>;
    towersPlaced?: Record<TowerType, number>;
    gamesWon?: number;
    wavesCompleted?: number;
    achievements?: string[];
  }) => string[]; // 返回新解鎖的皮膚 ID
}

export const useSkinStore = create<SkinStoreState>()(
  persist(
    (set, get) => ({
      // 初始狀態
      unlockedSkins: getInitialUnlockedSkins(),
      equippedSkins: getInitialEquippedSkins(),
      favorites: [],
      favoriteSets: [],
      lastViewed: undefined,

      // 解鎖皮膚
      unlockSkin: (skinId) => {
        const { unlockedSkins, equippedSkins } = get();
        if (unlockedSkins.includes(skinId)) return;
        
        const newUnlocked = [...unlockedSkins, skinId];
        set({ unlockedSkins: newUnlocked });
        syncToAchievement(newUnlocked, equippedSkins);
      },

      // 裝備皮膚
      equipSkin: (towerType, skinId) => {
        const { unlockedSkins, equippedSkins } = get();
        
        // 如果皮膚未解鎖，不能裝備
        if (skinId && !unlockedSkins.includes(skinId)) return;
        
        // 驗證皮膚是否適用於此塔類型
        if (skinId) {
          const skin = getSkin(skinId);
          if (!skin) return;
          if (skin.towerType !== 'all' && skin.towerType !== towerType) return;
        }
        
        const newEquipped = {
          ...equippedSkins,
          [towerType]: skinId,
        };
        set({ equippedSkins: newEquipped });
        syncToAchievement(unlockedSkins, newEquipped);
      },

      // 取消裝備皮膚 (恢復預設)
      unequipSkin: (towerType) => {
        const { equippedSkins, unlockedSkins } = get();
        const newEquipped = {
          ...equippedSkins,
          [towerType]: getDefaultSkinId(towerType),
        };
        set({ equippedSkins: newEquipped });
        syncToAchievement(unlockedSkins, newEquipped);
      },

      // 收藏/取消收藏
      toggleFavorite: (skinId) => {
        const { favorites } = get();
        if (favorites.includes(skinId)) {
          set({ favorites: favorites.filter(id => id !== skinId) });
        } else {
          set({ favorites: [...favorites, skinId] });
        }
      },

      toggleFavoriteSet: (setId) => {
        const { favoriteSets = [] } = get();
        if (favoriteSets.includes(setId)) {
          set({ favoriteSets: favoriteSets.filter(id => id !== setId) });
        } else {
          set({ favoriteSets: [...favoriteSets, setId] });
        }
      },

      // 解鎖所有皮膚 (修改器功能)
      unlockAllSkins: () => {
        const allSkinIds = ALL_SKINS.map(skin => skin.id);
        const { equippedSkins } = get();
        set({ unlockedSkins: allSkinIds });
        syncToAchievement(allSkinIds, equippedSkins);
      },

      // 重置皮膚 (恢復預設狀態)
      resetSkins: () => {
        const newUnlocked = getInitialUnlockedSkins();
        const newEquipped = getInitialEquippedSkins();
        set({
          unlockedSkins: newUnlocked,
          equippedSkins: newEquipped,
          favorites: [],
          favoriteSets: [],
          lastViewed: undefined,
        });
        syncToAchievement(newUnlocked, newEquipped);
      },

      // 檢查皮膚是否已解鎖
      isSkinUnlocked: (skinId) => {
        return get().unlockedSkins.includes(skinId);
      },

      // 檢查皮膚是否已裝備
      isSkinEquipped: (skinId) => {
        const { equippedSkins } = get();
        return Object.values(equippedSkins).includes(skinId);
      },

      // 取得塔裝備的皮膚
      getEquippedSkin: (towerType) => {
        return get().equippedSkins[towerType];
      },

      // 取得塔的視覺配置 (根據裝備的皮膚)
      getSkinVisuals: (towerType) => {
        const { equippedSkins } = get();
        const skinId = equippedSkins[towerType];
        if (!skinId) return null;
        
        const skin = getSkin(skinId);
        return skin?.visuals || null;
      },

      // 取得塔當前裝備皮膚的模型集 ID
      getEquippedSkinModelSet: (towerType) => {
        const { equippedSkins } = get();
        const skinId = equippedSkins[towerType];
        if (!skinId) return undefined;

        const skin = getSkin(skinId);
        return skin?.modelSet;
      },

      // 取得塔已解鎖的皮膚
      getUnlockedSkinsForTower: (towerType) => {
        const { unlockedSkins } = get();
        const availableSkins = getSkinsForTower(towerType);
        return availableSkins
          .filter(skin => unlockedSkins.includes(skin.id))
          .map(skin => skin.id);
      },

      // 取得統計
      getStats: () => {
        const { unlockedSkins, equippedSkins } = get();
        const totalSkins = ALL_SKINS.filter(s => !s.hidden).length;
        const unlockedCount = unlockedSkins.length;
        const equippedCount = Object.values(equippedSkins).filter(Boolean).length;
        
        return {
          totalSkins,
          unlockedSkins: unlockedCount,
          equippedSkins: equippedCount,
          completionRate: (unlockedCount / totalSkins) * 100,
        };
      },

      // 檢查解鎖條件
      checkUnlockConditions: (stats) => {
        const { unlockedSkins } = get();
        const newlyUnlocked: string[] = [];
        
        for (const skin of ALL_SKINS) {
          // 跳過已解鎖的
          if (unlockedSkins.includes(skin.id)) continue;
          
          const condition = skin.unlockCondition;
          let shouldUnlock = false;
          
          switch (condition.type) {
            case 'kills':
              if (stats.kills && condition.target) {
                // 檢查特定塔類型的擊殺數
                if (skin.towerType !== 'all') {
                  const towerKills = stats.kills[skin.towerType as TowerType] || 0;
                  shouldUnlock = towerKills >= condition.target;
                } else {
                  // 通用皮膚檢查總擊殺數
                  const totalKills = Object.values(stats.kills).reduce((a, b) => a + b, 0);
                  shouldUnlock = totalKills >= condition.target;
                }
              }
              break;
              
            case 'tower_placed':
              if (stats.towersPlaced && condition.target) {
                if (skin.towerType !== 'all') {
                  const placed = stats.towersPlaced[skin.towerType as TowerType] || 0;
                  shouldUnlock = placed >= condition.target;
                } else {
                  const totalPlaced = Object.values(stats.towersPlaced).reduce((a, b) => a + b, 0);
                  shouldUnlock = totalPlaced >= condition.target;
                }
              }
              break;
              
            case 'games_won':
              if (stats.gamesWon && condition.target) {
                shouldUnlock = stats.gamesWon >= condition.target;
              }
              break;
              
            case 'waves_completed':
              if (stats.wavesCompleted && condition.target) {
                shouldUnlock = stats.wavesCompleted >= condition.target;
              }
              break;
              
            case 'achievement':
              if (stats.achievements && condition.achievementId) {
                shouldUnlock = stats.achievements.includes(condition.achievementId);
              }
              break;
          }
          
          if (shouldUnlock) {
            newlyUnlocked.push(skin.id);
            get().unlockSkin(skin.id);
          }
        }
        
        return newlyUnlocked;
      },
    }),
    {
      name: 'tower-skin-storage',
      version: 2,
      migrate: (persistedState, version) => {
        const next = persistedState as Partial<SkinStoreState> | undefined;
        if (!next) return next;
        if (version < 2) {
          const equipped = { ...(next.equippedSkins ?? {}) } as Record<TowerType, string | null>;
          const fusionTypes: TowerType[] = ['storm', 'plague', 'demolisher', 'tempest'];
          for (const type of fusionTypes) {
            if (!equipped[type]) equipped[type] = getDefaultSkinId(type);
          }
          next.equippedSkins = equipped;
          const unlocked = new Set(next.unlockedSkins ?? []);
          for (const type of fusionTypes) unlocked.add(getDefaultSkinId(type));
          next.unlockedSkins = [...unlocked];
        }
        return next;
      },
    }
  )
);

export default useSkinStore;
