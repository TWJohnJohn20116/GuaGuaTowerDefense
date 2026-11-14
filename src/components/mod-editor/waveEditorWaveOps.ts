/**
 * 波次編輯器共用操作
 */
import type { WaveConfig } from '@/types/game';

export function reorderWaves(waves: WaveConfig[], from: number, to: number): WaveConfig[] {
  if (from === to || from < 0 || to < 0 || from >= waves.length || to >= waves.length) {
    return waves;
  }
  const next = [...waves];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export function duplicateAllWaves(waves: WaveConfig[]): WaveConfig[] {
  if (waves.length === 0) return waves;
  const cloned = waves.map((w) => JSON.parse(JSON.stringify(w)) as WaveConfig);
  return [...waves, ...cloned];
}

export function adjustFocusedIndexAfterReorder(
  focused: number | null,
  from: number,
  to: number,
): number | null {
  if (focused === null) return null;
  if (focused === from) return to;
  if (from < focused && to >= focused) return focused - 1;
  if (from > focused && to <= focused) return focused + 1;
  return focused;
}
