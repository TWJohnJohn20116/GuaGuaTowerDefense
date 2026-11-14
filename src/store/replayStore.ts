// 回放系統 (Replay) Store
// 每 1 秒紀錄一個快照,遊戲結束時可儲存為 replay 並回看
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameDifficulty, DifficultyModifiers } from '@/types/game';

// 輕量版實體(僅含畫面所需資訊)
export interface ReplayTowerEntity {
  id: string;
  type: string;
  x: number;
  y: number;
  level: number;
  rotation?: number;
  color?: string;
}
export interface ReplayEnemyEntity {
  id: string;
  type: string;
  x: number;
  y: number;
  hp: number;        // 0-1 標準化
  size?: number;
  color?: string;
}
export interface ReplayProjectileEntity {
  x: number;
  y: number;
  color?: string;
  size?: number;
}

// 單一快照(包含統計與場景實體)
export interface ReplaySnapshot {
  time: number;              // 自開局秒數
  money: number;
  health: number;
  score: number;
  currentWave: number;
  waveActive: boolean;
  enemyCount: number;
  towerCount: number;
  projectileCount: number;
  totalDamage: number;
  totalKills: number;
  // 場景實體(供視覺回放使用,可省略以縮小檔案)
  towers?: ReplayTowerEntity[];
  enemies?: ReplayEnemyEntity[];
  projectiles?: ReplayProjectileEntity[];
}

// 關鍵事件(以可選方式記錄)
export interface ReplayEvent {
  time: number;
  type: 'towerPlaced' | 'towerUpgraded' | 'towerSold' | 'skillActivated' | 'waveStarted' | 'waveCompleted' | 'gameOver' | 'victory';
  data?: {
    towerType?: string;
    towerId?: string;
    waveNum?: number;
    [k: string]: unknown;
  };
}

// 註記 (使用者可在特定時間點加文字)
export interface ReplayNote {
  id: string;
  time: number;
  text: string;
}

// 完整 replay
export interface Replay {
  id: string;
  name: string;
  timestamp: number;          // 建立時間
  mapId: string;
  difficulty: GameDifficulty;
  endlessMode: boolean;
  // 本局最大波次（0 = 無限；舊版回放可能缺少此欄位）
  maxWaves?: number;
  duration: number;            // 秒
  finalWave: number;
  isVictory: boolean;
  finalScore: number;
  snapshots: ReplaySnapshot[];
  events: ReplayEvent[];
  /** 原始 startGame 路徑（戰役為 chX_lvY）；播放畫面仍用 mapId */
  startPathName?: string;
  customWaveSetId?: string;
  customModifiers?: DifficultyModifiers;
  // 元資料 (使用者可編輯)
  favorite?: boolean;          // 最愛收藏
  tags?: string[];             // 標籤
  notes?: ReplayNote[];        // 註記列表
}

interface ReplayRecordingMeta {
  mapId: string;
  difficulty: GameDifficulty;
  endlessMode: boolean;
  maxWaves?: number;
  startPathName?: string;
  customWaveSetId?: string;
  customModifiers?: DifficultyModifiers;
}

const MAX_REPLAYS = 15;        // 最大儲存數量（快照密度提高後同步調降，控制 localStorage 總量）
const STORAGE_KEY = 'guagua-replays';

// 單一回放的 JSON 字元預算（約 2.5MB）：超過時自動降低快照時間解析度
const REPLAY_SIZE_BUDGET = 2_500_000;

/**
 * 儲存大小保險：序列化後超過預算時，每輪保留一半快照（首尾必留），
 * 最多三輪。播放端在相鄰快照間插值，因此抽稀只降低運動解析度、不會卡頓。
 */
function shrinkSnapshotsToBudget(snapshots: ReplaySnapshot[]): ReplaySnapshot[] {
  let result = snapshots;
  if (result.length <= 60) return result;
  let size = JSON.stringify(result).length;
  for (let pass = 0; pass < 3 && size > REPLAY_SIZE_BUDGET && result.length > 60; pass++) {
    const lastIdx = result.length - 1;
    result = result.filter((_, i) => i % 2 === 0 || i === lastIdx);
    size = JSON.stringify(result).length;
  }
  return result;
}

interface ReplayStore {
  replays: Replay[];

  // 錄製中
  isRecording: boolean;
  recordStartedAt: number;
  recordingSnapshots: ReplaySnapshot[];
  recordingEvents: ReplayEvent[];
  recordingMeta: ReplayRecordingMeta | null;

  // 控制
  startRecording: (meta: ReplayRecordingMeta) => void;
  recordSnapshot: (snapshot: Omit<ReplaySnapshot, 'time'>) => void;
  recordEvent: (event: Omit<ReplayEvent, 'time'>) => void;
  stopRecording: (opts: { isVictory: boolean; finalWave: number; finalScore: number; name?: string }) => string | null;
  cancelRecording: () => void;

  // 列表管理
  deleteReplay: (id: string) => void;
  renameReplay: (id: string, name: string) => void;
  clearAll: () => void;

  // 元資料
  toggleFavorite: (id: string) => void;
  setTags: (id: string, tags: string[]) => void;
  addNote: (id: string, time: number, text: string) => void;
  deleteNote: (id: string, noteId: string) => void;
  updateNote: (id: string, noteId: string, text: string) => void;

  // 匯入匯出
  importReplay: (data: unknown) => string | null;

  // 取得
  getReplay: (id: string) => Replay | undefined;

  /** 最近一局自動儲存的回放 id（結算頁展示） */
  lastSessionReplayId: string | null;
  clearLastSessionReplay: () => void;
}

// 驗證匯入資料是否為合法 Replay
function isValidReplay(obj: unknown): obj is Replay {
  if (!obj || typeof obj !== 'object') return false;
  const r = obj as Record<string, unknown>;
  return (
    typeof r.id === 'string' &&
    typeof r.name === 'string' &&
    typeof r.timestamp === 'number' &&
    typeof r.mapId === 'string' &&
    typeof r.difficulty === 'string' &&
    typeof r.endlessMode === 'boolean' &&
    typeof r.duration === 'number' &&
    typeof r.finalWave === 'number' &&
    typeof r.isVictory === 'boolean' &&
    typeof r.finalScore === 'number' &&
    Array.isArray(r.snapshots) &&
    Array.isArray(r.events)
  );
}

export const useReplayStore = create<ReplayStore>()(
  persist(
    (set, get) => ({
      replays: [],
      isRecording: false,
      recordStartedAt: 0,
      recordingSnapshots: [],
      recordingEvents: [],
      recordingMeta: null,

      lastSessionReplayId: null,

      clearLastSessionReplay: () => set({ lastSessionReplayId: null }),

      startRecording: (meta) => {
        set({
          isRecording: true,
          recordStartedAt: Date.now(),
          recordingSnapshots: [],
          recordingEvents: [],
          recordingMeta: meta,
          lastSessionReplayId: null,
        });
      },

      recordSnapshot: (snapshot) => {
        const state = get();
        if (!state.isRecording) return;
        const time = (Date.now() - state.recordStartedAt) / 1000;
        set({
          recordingSnapshots: [...state.recordingSnapshots, { ...snapshot, time }],
        });
      },

      recordEvent: (event) => {
        const state = get();
        if (!state.isRecording) return;
        const time = (Date.now() - state.recordStartedAt) / 1000;
        set({
          recordingEvents: [...state.recordingEvents, { ...event, time }],
        });
      },

      stopRecording: ({ isVictory, finalWave, finalScore, name }) => {
        const state = get();
        if (!state.isRecording || !state.recordingMeta) {
          set({ isRecording: false });
          return null;
        }
        const duration = (Date.now() - state.recordStartedAt) / 1000;
        const id = `replay-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const replay: Replay = {
          id,
          name: name || `${state.recordingMeta.mapId} - W${finalWave}`,
          timestamp: Date.now(),
          mapId: state.recordingMeta.mapId,
          difficulty: state.recordingMeta.difficulty,
          endlessMode: state.recordingMeta.endlessMode,
          maxWaves: state.recordingMeta.maxWaves,
          startPathName: state.recordingMeta.startPathName,
          customWaveSetId: state.recordingMeta.customWaveSetId,
          customModifiers: state.recordingMeta.customModifiers,
          duration,
          finalWave,
          isVictory,
          finalScore,
          snapshots: shrinkSnapshotsToBudget(state.recordingSnapshots),
          events: state.recordingEvents,
        };
        const newReplays = [replay, ...state.replays].slice(0, MAX_REPLAYS);
        set({
          replays: newReplays,
          isRecording: false,
          recordingSnapshots: [],
          recordingEvents: [],
          recordingMeta: null,
          lastSessionReplayId: id,
        });
        return id;
      },

      cancelRecording: () => {
        set({
          isRecording: false,
          recordingSnapshots: [],
          recordingEvents: [],
          recordingMeta: null,
        });
      },

      deleteReplay: (id) => {
        set((state) => ({ replays: state.replays.filter((r) => r.id !== id) }));
      },

      renameReplay: (id, name) => {
        set((state) => ({
          replays: state.replays.map((r) => (r.id === id ? { ...r, name } : r)),
        }));
      },

      clearAll: () => {
        set({ replays: [] });
      },

      toggleFavorite: (id) => {
        set((state) => ({
          replays: state.replays.map((r) =>
            r.id === id ? { ...r, favorite: !r.favorite } : r
          ),
        }));
      },

      setTags: (id, tags) => {
        set((state) => ({
          replays: state.replays.map((r) =>
            r.id === id ? { ...r, tags } : r
          ),
        }));
      },

      addNote: (id, time, text) => {
        set((state) => ({
          replays: state.replays.map((r) => {
            if (r.id !== id) return r;
            const note: ReplayNote = {
              id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              time,
              text,
            };
            return { ...r, notes: [...(r.notes || []), note].sort((a, b) => a.time - b.time) };
          }),
        }));
      },

      deleteNote: (id, noteId) => {
        set((state) => ({
          replays: state.replays.map((r) =>
            r.id === id ? { ...r, notes: (r.notes || []).filter((n) => n.id !== noteId) } : r
          ),
        }));
      },

      updateNote: (id, noteId, text) => {
        set((state) => ({
          replays: state.replays.map((r) =>
            r.id === id
              ? { ...r, notes: (r.notes || []).map((n) => (n.id === noteId ? { ...n, text } : n)) }
              : r
          ),
        }));
      },

      importReplay: (data) => {
        if (!isValidReplay(data)) return null;
        const existing = get().replays;
        const newId = existing.find((r) => r.id === data.id)
          ? `replay-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
          : data.id;
        const replay: Replay = { ...data, id: newId };
        const newReplays = [replay, ...existing].slice(0, MAX_REPLAYS);
        set({ replays: newReplays });
        return newId;
      },

      getReplay: (id) => {
        return get().replays.find((r) => r.id === id);
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ replays: state.replays }),
    }
  )
);
