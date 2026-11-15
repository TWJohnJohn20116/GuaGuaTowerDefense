/**
 * 可選波次組：官方內建 + 已啟用 Mod
 */

import { OFFICIAL_WAVE_SETS, OFFICIAL_WAVE_MOD_ID } from '@/data/officialWaveSets';
import { useModStore } from '@/store/modStore';
import { getPlaytestWaveSets } from '@/workshop/playtest/waveRegistry';
import type { CustomWaveData } from '@/types/game';

export { OFFICIAL_WAVE_SETS, OFFICIAL_WAVE_MOD_ID };

export function getPlayableWaveSets(): CustomWaveData[] {
  const officialIds = new Set(OFFICIAL_WAVE_SETS.map((set) => set.id));
  const fromMods = useModStore.getState().getEnabledWaves()
    .filter((set) => !officialIds.has(set.id));
  // 工坊試玩：編譯出的關卡波次組（每次開始試玩前註冊，結束清除）
  const fromPlaytest = getPlaytestWaveSets().filter((set) => !officialIds.has(set.id));
  return [...OFFICIAL_WAVE_SETS, ...fromMods, ...fromPlaytest];
}

export function findPlayableWaveSet(id: string | undefined | null): CustomWaveData | undefined {
  if (!id) return undefined;
  return getPlayableWaveSets().find((set) => set.id === id);
}

export function getWaveSetSourceLabel(set: CustomWaveData): string {
  if (set.modId === OFFICIAL_WAVE_MOD_ID) return '官方';
  const mod = useModStore.getState().mods.find((item) => item.metadata.id === set.modId);
  return mod?.metadata.name ?? set.modId;
}
