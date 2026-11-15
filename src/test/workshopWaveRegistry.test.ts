import { describe, expect, it } from 'vitest';
import {
  clearPlaytestWaveSets,
  getPlaytestWaveSets,
  registerPlaytestWaveSets,
} from '@/workshop/playtest/waveRegistry';
import { findPlayableWaveSet, getPlayableWaveSets } from '@/utils/waveSets';
import type { CustomWaveData } from '@/types/game';

const set: CustomWaveData = {
  id: 'ws:test-level',
  modId: 'ws:test',
  name: '測試波次',
  description: '',
  waves: [{ enemies: [{ type: 'normal', count: 2, delay: 0 }], reward: 10 }],
};

describe('playtest wave registry', () => {
  it('註冊後 findPlayableWaveSet 找得到，清除後找不到', () => {
    registerPlaytestWaveSets([set]);
    expect(findPlayableWaveSet('ws:test-level')?.id).toBe('ws:test-level');
    expect(getPlayableWaveSets().some((item) => item.id === 'ws:test-level')).toBe(true);

    clearPlaytestWaveSets();
    expect(findPlayableWaveSet('ws:test-level')).toBeUndefined();
    expect(getPlaytestWaveSets()).toHaveLength(0);
  });

  it('註冊是整批覆蓋，不會累積上一局的波次', () => {
    registerPlaytestWaveSets([set]);
    registerPlaytestWaveSets([{ ...set, id: 'ws:second' }]);
    expect(getPlaytestWaveSets().map((item) => item.id)).toEqual(['ws:second']);
    clearPlaytestWaveSets();
  });
});
