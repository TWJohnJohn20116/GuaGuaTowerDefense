/**
 * 試玩用的波次組註冊表
 *
 * 為什麼需要：引擎找波次組只認「官方 + 已安裝 mod」（findPlayableWaveSet），
 * 而工坊的關卡波次是編譯期產物、不進 modStore。這裡當作臨時註冊表：
 * 開始試玩前把編譯出的 CustomWaveData 註冊進來，結束時清掉。
 */
import type { CustomWaveData } from '@/types/game';

let registered: CustomWaveData[] = [];

export function registerPlaytestWaveSets(sets: readonly CustomWaveData[]): void {
  registered = [...sets];
}

export function clearPlaytestWaveSets(): void {
  registered = [];
}

export function getPlaytestWaveSets(): readonly CustomWaveData[] {
  return registered;
}
