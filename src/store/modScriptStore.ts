/**
 * Mod 腳本執行期狀態（總開關設為 persist；日誌與狀態只存在記憶體）
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ModScriptLogEntry,
  ModScriptRuntimeStatus,
  ScriptStateRecord,
  ScriptStateValue,
} from '@/types/modScript';
import { MOD_SCRIPT_LIMITS, MOD_SCRIPT_STORE_NAME } from '@/mod-script/limits';

interface ModScriptStoreState {
  /** 全域總開關：關掉就不建立任何 Worker */
  enabled: boolean;
  logs: ModScriptLogEntry[];
  statuses: ModScriptRuntimeStatus[];
  /**
   * 腳本自訂狀態：scriptId → { key: value }。
   * 跟著 store 一起 persist（重開程式仍在），上限見 MOD_SCRIPT_LIMITS。
   */
  scriptState: Record<string, ScriptStateRecord>;
  /**
   * 腳本信任模式：
   * - all：只要 mod 啟用就執行（本機自寫腳本的預設）
   * - signed：只執行「簽章有效」且公鑰指紋已被信任的 mod
   */
  trustMode: 'all' | 'signed';
  trustedKeyFingerprints: string[];
  setEnabled: (enabled: boolean) => void;
  setTrustMode: (mode: 'all' | 'signed') => void;
  trustKey: (fingerprint: string) => void;
  untrustKey: (fingerprint: string) => void;
  setScriptState: (scriptId: string, key: string, value: ScriptStateValue) => void;
  clearScriptState: (scriptId: string) => void;
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
      scriptState: {},
      trustMode: 'all',
      trustedKeyFingerprints: [],
      setEnabled: (enabled) => set({ enabled }),
      setTrustMode: (trustMode) => set({ trustMode }),
      trustKey: (fingerprint) =>
        set((state) => ({
          trustedKeyFingerprints: state.trustedKeyFingerprints.includes(fingerprint)
            ? state.trustedKeyFingerprints
            : [...state.trustedKeyFingerprints, fingerprint],
        })),
      untrustKey: (fingerprint) =>
        set((state) => ({
          trustedKeyFingerprints: state.trustedKeyFingerprints.filter((item) => item !== fingerprint),
        })),
      setScriptState: (scriptId, key, value) =>
        set((state) => ({
          scriptState: {
            ...state.scriptState,
            [scriptId]: { ...(state.scriptState[scriptId] ?? {}), [key]: value },
          },
        })),
      clearScriptState: (scriptId) =>
        set((state) => {
          const next = { ...state.scriptState };
          delete next[scriptId];
          return { scriptState: next };
        }),
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
