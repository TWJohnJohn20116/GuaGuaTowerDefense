/**
 * 決定性隨機數（腳本用）
 *
 * 同一個 seed + 同一個事件序號 = 同一個結果，回放與測試才可重現。
 */
export function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** mulberry32：32 位狀態、分佈夠好、實作短 */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface ScriptRng {
  next: () => number;
  int: (min: number, max: number) => number;
  chance: (probability: number) => boolean;
  pick: <T>(items: readonly T[]) => T | null;
}

export function createScriptRng(seed: number): ScriptRng {
  const next = mulberry32(seed);
  return {
    next,
    int: (min, max) => {
      const lo = Math.ceil(Math.min(min, max));
      const hi = Math.floor(Math.max(min, max));
      if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi < lo) return lo;
      return lo + Math.floor(next() * (hi - lo + 1));
    },
    chance: (probability) => {
      if (!Number.isFinite(probability)) return false;
      return next() < probability;
    },
    pick: (items) => {
      if (items.length === 0) return null;
      return items[Math.floor(next() * items.length)] ?? null;
    },
  };
}
