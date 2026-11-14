// 回放輔助工具
import type { Replay } from '@/store/replayStore';
import { getPathDisplayName } from '@/data/gameData/pathData';

export { getPathDisplayName };

export function formatReplayTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatReplayDate(ts: number, language: string): string {
  return new Date(ts).toLocaleDateString(language, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 匯出 replay 為 JSON 檔下載
export function exportReplayAsJson(replay: Replay): boolean {
  try {
    const json = JSON.stringify(replay, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = replay.name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40) || 'replay';
    a.href = url;
    a.download = `${safeName}-${replay.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (e) {
    console.error('Export replay failed:', e);
    return false;
  }
}

// 觸發系統檔案選擇對話框並讀取 JSON
export function triggerImportReplay(): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string);
          resolve(data);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    };
    input.click();
  });
}

// 從 snapshots 提取所有出現過的波次與其首次出現時間
export function extractWaveMarkers(snapshots: { time: number; currentWave: number }[]): { wave: number; time: number }[] {
  const seen = new Map<number, number>();
  for (const s of snapshots) {
    if (s.currentWave > 0 && !seen.has(s.currentWave)) {
      seen.set(s.currentWave, s.time);
    }
  }
  return Array.from(seen.entries())
    .map(([wave, time]) => ({ wave, time }))
    .sort((a, b) => a.wave - b.wave);
}

// 自動書籤型別
export interface AutoBookmark {
  time: number;
  type: 'lowHP' | 'bigDamage' | 'victory' | 'defeat';
  label: string;
}

// 計算自動書籤
// - lowHP: 生命降到 25% 以下
// - bigDamage: 兩個快照間擊殺 +5
// - victory/defeat: 結束事件
export function computeAutoBookmarks(
  snapshots: { time: number; health: number; totalKills: number }[],
  events: { time: number; type: string }[],
  labels: { lowHP: string; bigDamage: string; victory: string; defeat: string },
  startingHealth = 20
): AutoBookmark[] {
  const out: AutoBookmark[] = [];
  let lowHpAdded = false;

  for (let i = 0; i < snapshots.length; i++) {
    const s = snapshots[i];
    if (!lowHpAdded && s.health > 0 && s.health / startingHealth < 0.25) {
      out.push({ time: s.time, type: 'lowHP', label: labels.lowHP });
      lowHpAdded = true;
    }
    if (i > 0) {
      const prev = snapshots[i - 1];
      const killDelta = s.totalKills - prev.totalKills;
      if (killDelta >= 5) {
        out.push({ time: s.time, type: 'bigDamage', label: labels.bigDamage });
      }
    }
  }

  for (const e of events) {
    if (e.type === 'victory') {
      out.push({ time: e.time, type: 'victory', label: labels.victory });
    } else if (e.type === 'gameOver') {
      out.push({ time: e.time, type: 'defeat', label: labels.defeat });
    }
  }

  // 移除過於相近的書籤 (<1.5s 視為重疊)
  const sorted = out.sort((a, b) => a.time - b.time);
  const dedup: AutoBookmark[] = [];
  for (const b of sorted) {
    const last = dedup[dedup.length - 1];
    if (!last || b.time - last.time > 1.5 || last.type !== b.type) {
      dedup.push(b);
    }
  }
  return dedup;
}
