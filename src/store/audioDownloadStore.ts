/**
 * 音訊 API 下載進度（Zustand）
 */
import { create } from 'zustand';

export type AudioDownloadItemState =
  | 'pending'
  | 'downloading'
  | 'done'
  | 'failed'
  | 'skipped';

export type AudioDownloadKind = 'music' | 'sfx';

export interface AudioDownloadItem {
  key: string;
  label: string;
  kind: AudioDownloadKind;
  state: AudioDownloadItemState;
  bytes?: number;
  error?: string;
}

export type AudioDownloadOverallStatus = 'idle' | 'running' | 'done' | 'partial';

interface AudioDownloadStore {
  status: AudioDownloadOverallStatus;
  items: AudioDownloadItem[];
  startedAt: number | null;
  finishedAt: number | null;
  setQueue: (items: AudioDownloadItem[]) => void;
  patchItem: (key: string, patch: Partial<AudioDownloadItem>) => void;
  setStatus: (status: AudioDownloadOverallStatus) => void;
  setStarted: (ts: number | null) => void;
  setFinished: (ts: number | null) => void;
  reset: () => void;
}

const initialState = {
  status: 'idle' as AudioDownloadOverallStatus,
  items: [] as AudioDownloadItem[],
  startedAt: null as number | null,
  finishedAt: null as number | null,
};

export const useAudioDownloadStore = create<AudioDownloadStore>((set) => ({
  ...initialState,
  setQueue: (items) => set({ items }),
  patchItem: (key, patch) =>
    set((s) => ({
      items: s.items.map((it) => (it.key === key ? { ...it, ...patch } : it)),
    })),
  setStatus: (status) => set({ status }),
  setStarted: (startedAt) => set({ startedAt }),
  setFinished: (finishedAt) => set({ finishedAt }),
  reset: () => set(initialState),
}));

export function selectDownloadStats(items: AudioDownloadItem[]) {
  const total = items.length;
  const done = items.filter((i) => i.state === 'done' || i.state === 'skipped').length;
  const failed = items.filter((i) => i.state === 'failed').length;
  const downloading = items.filter((i) => i.state === 'downloading').length;
  const pending = items.filter((i) => i.state === 'pending').length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return { total, done, failed, downloading, pending, percent };
}
