/**
 * 回放批量匯出
 */
import type { Replay } from '@/store/replayStore';
import { getPathDisplayName } from '@/data/gameData/pathData';

export type ReplayExportScope = 'filtered' | 'all' | 'favorites';

export interface ReplayBatchExportSummary {
  count: number;
  victories: number;
  defeats: number;
  totalDuration: number;
  maps: Record<string, number>;
}

export function buildReplayBatchSummary(replays: Replay[]): ReplayBatchExportSummary {
  const maps: Record<string, number> = {};
  let victories = 0;
  let totalDuration = 0;
  for (const r of replays) {
    if (r.isVictory) victories++;
    totalDuration += r.duration;
    const label = getPathDisplayName(r.mapId);
    maps[label] = (maps[label] ?? 0) + 1;
  }
  return {
    count: replays.length,
    victories,
    defeats: replays.length - victories,
    totalDuration,
    maps,
  };
}

export function downloadReplayBatch(replays: Replay[], format: 'json' | 'zip-json'): boolean {
  if (replays.length === 0) return false;
  try {
    const stamp = new Date().toISOString().slice(0, 10);
    if (format === 'json') {
      const payload = {
        exportedAt: new Date().toISOString(),
        count: replays.length,
        replays,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      triggerDownload(blob, `guatd-replays-${stamp}.json`);
      return true;
    }
    // 逐檔 JSON 合併為單一陣列（簡化版 zip-json = 多筆合併包）
    const blob = new Blob([JSON.stringify(replays, null, 2)], { type: 'application/json' });
    triggerDownload(blob, `guatd-replays-batch-${stamp}.json`);
    return true;
  } catch (e) {
    console.error('Replay batch export failed:', e);
    return false;
  }
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
