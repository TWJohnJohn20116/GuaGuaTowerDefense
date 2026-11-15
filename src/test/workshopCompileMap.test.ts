import { describe, expect, it } from 'vitest';
import { compileMap } from '@/workshop/compile/compileMaps';
import type { WorkshopMapAsset } from '@/types/workshop';

const mapAsset: WorkshopMapAsset = {
  id: 'map-1',
  kind: 'map',
  version: '1.0.0',
  name: '測試地圖',
  data: {
    grid: { cols: 12, rows: 10 },
    waypoints: [],
    blockedAreas: [],
    difficulty: 'hard',
    category: 'normal',
  },
};

describe('compileMap', () => {
  it('carries the fields the engine needs', () => {
    const { map } = compileMap('proj-1', mapAsset);
    expect(map.difficulty).toBe('hard');
    expect(map.name).toBe('測試地圖');
  });

  it('survives an asset whose data block is missing', () => {
    // 型別上 data 是必填，但 localStorage 裡的舊存檔／半寫入資產可能整塊不見。
    // 這條路徑曾經讓試玩（PlaytestStage）與平衡面板（BalancePanel）一起白屏：
    // TypeError: Cannot read properties of undefined (reading 'difficulty')
    const broken: WorkshopMapAsset = JSON.parse(
      JSON.stringify({ ...mapAsset, data: undefined }),
    );
    expect(() => compileMap('proj-1', broken)).not.toThrow();
    const { map } = compileMap('proj-1', broken);
    expect(map.difficulty).toBe('normal');
    expect(map.waypoints).toEqual([]);
    expect(map.blockedAreas).toEqual([]);
  });
});