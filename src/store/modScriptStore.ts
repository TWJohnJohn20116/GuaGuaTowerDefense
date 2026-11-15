/**
 * Mod 腳本執行期狀態（總開關設為 persist；日誌與狀態只存在記憶體）
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ModScriptLogEntry, ModScriptRuntimeStatus } from '@/types/modScript';
import { MOD_SCRIPT_LIMITS, MOD_SCRIPT_STORE_NAME } from '@/mod-script/limits';

interface ModScriptStoreState {
  /** 全域總開關：關掉就不建立任何 Worker */
  enabled: boolean;
  logs: ModScriptLogEntry[];
  statuses: ModScriptRuntimeStatus[];
  setEnabled: (enabled: boolean) => void;
  pushLog: (entry: ModScriptLogEntry) => void;
  setStatuses: (statuses: ModScriptRuntimeStatus[]) => void;
  clearLogs: () => void;
}

export const useModScriptStore = create<ModScriptStoreState>()(
  persist(
    (set) => ({
      enabled: true,
      logs: [],
      statuses: [],
      setEnabled: (enabled) => set({ enabled }),
      pushLog: (entry) =>
        set((state) => ({
          logs: [...state.logs, entry].slice(-MOD_SCRIPT_LIMITS.logLimit),
        })),
      setStatuses: (statuses) => set({ statuses }),
      clearLogs: () => set({ logs: [] }),
    }),
    {
      name: MOD_SCRIPT_STORE_NAME,
      // 只讓總開關落地；日誌與狀態每次啟動重來
      partialize: (state) => ({ ...state, logs: [], statuses: [] }),
    },
  ),
);
