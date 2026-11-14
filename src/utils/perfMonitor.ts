// 性能監控工具：以低開銷方式測量遊戲主迴圈各 stage 的耗時
// - 預設關閉，啟用後每 1 秒匯總一次快照供 UI 顯示
// - 關閉時所有開銷壓縮至一次 boolean 判斷

export interface StageSnapshot {
  avg: number;     // 平均每次呼叫耗時 (ms)
  max: number;     // 視窗內單次最大耗時 (ms)
  count: number;   // 呼叫次數
  total: number;   // 視窗內累計耗時 (ms)
}

export interface PerfSnapshot {
  stages: Record<string, StageSnapshot>;
  windowMs: number;
  framesInWindow: number;
}

interface StageStats {
  totalTime: number;
  count: number;
  maxTime: number;
}

const WINDOW_MS = 1000;

const stages = new Map<string, StageStats>();
let windowStart = performance.now();
let frameCount = 0;

let enabled = false;

let cachedSnapshot: PerfSnapshot = {
  stages: {},
  windowMs: WINDOW_MS,
  framesInWindow: 0,
};

const resetWindow = () => {
  stages.clear();
  frameCount = 0;
  windowStart = performance.now();
};

export const setPerfEnabled = (v: boolean): void => {
  if (enabled === v) return;
  enabled = v;
  if (!enabled) {
    resetWindow();
    cachedSnapshot = { stages: {}, windowMs: WINDOW_MS, framesInWindow: 0 };
  } else {
    resetWindow();
  }
};

export const isPerfEnabled = (): boolean => enabled;

/**
 * 包裝任意同步函式並紀錄其耗時。
 * 關閉時直接呼叫函式，無額外開銷。
 */
export const time = (name: string, fn: () => void): void => {
  if (!enabled) {
    fn();
    return;
  }
  const t0 = performance.now();
  fn();
  const dt = performance.now() - t0;
  let s = stages.get(name);
  if (!s) {
    s = { totalTime: 0, count: 0, maxTime: 0 };
    stages.set(name, s);
  }
  s.totalTime += dt;
  s.count += 1;
  if (dt > s.maxTime) s.maxTime = dt;
};

/**
 * 每幀結束時呼叫，達到視窗時匯總並更新快照。
 */
export const tickFrame = (): void => {
  if (!enabled) return;
  frameCount += 1;
  const now = performance.now();
  const elapsed = now - windowStart;
  if (elapsed >= WINDOW_MS) {
    const snapshotStages: Record<string, StageSnapshot> = {};
    stages.forEach((s, name) => {
      snapshotStages[name] = {
        avg: s.totalTime / Math.max(1, s.count),
        max: s.maxTime,
        count: s.count,
        total: s.totalTime,
      };
    });
    cachedSnapshot = {
      stages: snapshotStages,
      windowMs: elapsed,
      framesInWindow: frameCount,
    };
    resetWindow();
  }
};

export const getSnapshot = (): PerfSnapshot => cachedSnapshot;
