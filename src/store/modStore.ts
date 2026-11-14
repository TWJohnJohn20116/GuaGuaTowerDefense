// Mod 管理 Store

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Mod, ModValidationResult, CustomTowerData, CustomEnemyData, CustomMapData, CustomWaveData } from '@/types/game';
import { sampleMod, eliteEnemyMod, hellMapMod, sampleWaveMod } from '@/data/sampleMods';
import { validateModContent, formatValidationMessage } from '@/components/mod-editor/modValidation';

export type ModEditorFocusTab = 'towers' | 'enemies' | 'maps' | 'waves';
export type WorkshopTab = 'modEditor' | 'modManager';

interface ModEditorFocus {
  tab: ModEditorFocusTab;
  itemId?: string;
}

// Mod Store 介面
interface ModStore {
  // 狀態
  mods: Mod[];
  installedMods: string[]; // Mod IDs
  editingMod: Mod | null; // 正在編輯的 Mod
  modEditorFocus: ModEditorFocus | null;
  workshopTab: WorkshopTab;
  
  // 獲取啟用的 Mod 內容
  getEnabledTowers: () => CustomTowerData[];
  getEnabledEnemies: () => CustomEnemyData[];
  getEnabledMaps: () => CustomMapData[];
  getEnabledWaves: () => CustomWaveData[];
  
  // Mod 管理
  installMod: (mod: Mod) => void;
  uninstallMod: (modId: string) => void;
  enableMod: (modId: string) => void;
  disableMod: (modId: string) => void;
  setLoadOrder: (modId: string, order: number) => void;
  updateMod: (mod: Mod) => void;
  
  // 編輯
  setEditingMod: (mod: Mod | null) => void;
  setModEditorFocus: (focus: ModEditorFocus | null) => void;
  clearModEditorFocus: () => void;
  setWorkshopTab: (tab: WorkshopTab) => void;
  
  // Mod 驗證
  validateMod: (mod: Mod) => ModValidationResult;
  
  // Mod 導入/導出
  exportMod: (modId: string) => string;
  importMod: (jsonString: string) => {
    success: boolean;
    error?: string;
    errorKey?: 'storeModAlreadyInstalled' | 'storeModInvalidFormat';
  };
  
  // 重置
  resetMods: () => void;
}

// 預設 Mods
const defaultMods: Mod[] = [sampleMod, eliteEnemyMod, hellMapMod, sampleWaveMod];

export const useModStore = create<ModStore>()(
  persist(
    (set, get) => ({
      mods: defaultMods,
      installedMods: defaultMods.map(m => m.metadata.id),
      editingMod: null,
      modEditorFocus: null,
      workshopTab: 'modEditor' as WorkshopTab,
      
      getEnabledTowers: () => {
        const { mods } = get();
        return mods
          .filter(mod => mod.enabled && mod.content.towers)
          .sort((a, b) => a.loadOrder - b.loadOrder)
          .flatMap(mod => mod.content.towers || []);
      },
      
      getEnabledEnemies: () => {
        const { mods } = get();
        return mods
          .filter(mod => mod.enabled && mod.content.enemies)
          .sort((a, b) => a.loadOrder - b.loadOrder)
          .flatMap(mod => mod.content.enemies || []);
      },
      
      getEnabledMaps: () => {
        const { mods } = get();
        return mods
          .filter(mod => mod.enabled && mod.content.maps)
          .sort((a, b) => a.loadOrder - b.loadOrder)
          .flatMap(mod => mod.content.maps || []);
      },
      
      getEnabledWaves: () => {
        const { mods } = get();
        return mods
          .filter(mod => mod.enabled && mod.content.waves)
          .sort((a, b) => a.loadOrder - b.loadOrder)
          .flatMap(mod => mod.content.waves || []);
      },
      
      installMod: (mod) => set((state) => {
        if (state.installedMods.includes(mod.metadata.id)) {
          return state;
        }
        return {
          mods: [...state.mods, mod],
          installedMods: [...state.installedMods, mod.metadata.id],
        };
      }),
      
      uninstallMod: (modId) => set((state) => ({
        mods: state.mods.filter(m => m.metadata.id !== modId),
        installedMods: state.installedMods.filter(id => id !== modId),
      })),
      
      enableMod: (modId) => set((state) => ({
        mods: state.mods.map(m => 
          m.metadata.id === modId ? { ...m, enabled: true } : m
        ),
      })),
      
      disableMod: (modId) => set((state) => ({
        mods: state.mods.map(m => 
          m.metadata.id === modId ? { ...m, enabled: false } : m
        ),
      })),
      
      setLoadOrder: (modId, order) => set((state) => ({
        mods: state.mods.map(m => 
          m.metadata.id === modId ? { ...m, loadOrder: order } : m
        ),
      })),
      
      updateMod: (mod) => set((state) => ({
        mods: state.mods.map(m => 
          m.metadata.id === mod.metadata.id ? { ...mod, metadata: { ...mod.metadata, updatedAt: new Date().toISOString().split('T')[0] } } : m
        ),
      })),
      
      setEditingMod: (mod) => set({ editingMod: mod }),
      setModEditorFocus: (focus) => set({ modEditorFocus: focus }),
      clearModEditorFocus: () => set({ modEditorFocus: null }),
      setWorkshopTab: (tab) => set({ workshopTab: tab }),
      
      validateMod: (mod) => {
        const installedModIds = get().mods.map((m) => m.metadata.id);
        return validateModContent(mod, { installedModIds });
      },
      
      exportMod: (modId) => {
        const mod = get().mods.find(m => m.metadata.id === modId);
        if (!mod) return '';
        return JSON.stringify(mod, null, 2);
      },
      
      importMod: (jsonString) => {
        try {
          const mod = JSON.parse(jsonString) as Mod;
          const validation = get().validateMod(mod);
          
          if (!validation.valid) {
            return {
              success: false,
              error: formatValidationMessage(validation),
            };
          }
          
          // 檢查是否已存在
          if (get().installedMods.includes(mod.metadata.id)) {
            return { success: false, errorKey: 'storeModAlreadyInstalled' };
          }
          
          // 設定預設值
          mod.enabled = false;
          mod.loadOrder = get().mods.length + 1;
          
          get().installMod(mod);
          return { success: true };
        } catch {
          return { success: false, errorKey: 'storeModInvalidFormat' };
        }
      },
      
      resetMods: () => set({
        mods: defaultMods,
        installedMods: defaultMods.map(m => m.metadata.id),
      }),
    }),
    {
      name: 'guagua-mods',
      version: 4, // 更新版本號以觸發重新載入 (新增 sampleWaveMod)
      migrate: (persistedState: unknown) => {
        // 當版本更新時，合併新模組
        const state = persistedState as { mods?: Mod[]; installedMods?: string[] } | undefined;
        if (!state) {
          return { mods: defaultMods, installedMods: defaultMods.map(m => m.metadata.id) };
        }
        
        // 找出新增的模組（在 defaultMods 中但不在已安裝列表中的）
        const existingIds = new Set(state.installedMods || []);
        const newMods = defaultMods.filter(m => !existingIds.has(m.metadata.id));
        
        // 合併現有模組和新模組
        const mergedMods = [...(state.mods || []), ...newMods];
        const mergedInstalledIds = [...(state.installedMods || []), ...newMods.map(m => m.metadata.id)];
        
        return {
          ...state,
          mods: mergedMods,
          installedMods: mergedInstalledIds,
        };
      },
    }
  )
);
