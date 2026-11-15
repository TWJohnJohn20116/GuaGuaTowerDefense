/**
 * 波次編輯模型行為測試（workshopWaveModel）
 *
 * 鎖住這輪新增的單軌序列語意：
 *   1. 重排時「空隙跟著組走」，首組一律貼齊 0；
 *   2. 平移一組時，同波後面的組等量後移（空隙不變），往前則夾在前一組結束；
 *   3. 跨波搬移後，來源波保留空波、目標波的 id 不撞；
 *   4. 批次的乘算有下限（數量至少 1、血量倍率至少 0.05）；
 *   5. 波次層的新增／複製／刪除／排序會重排 index；
 *   6. 單軌模型給的是整關絕對時間。
 *
 * 間隔一律讀 GAME_CONSTANTS.ENEMY_SPAWN_DELAY，不在測試裡寫死毫秒數。
 */
import { describe, expect, it } from 'vitest';
import type { WaveConfig } from '@/types/game';
import { GAME_CONSTANTS } from '@/data/gameData';
import { flattenWave, waveConfigToTimeline, type TimelineWave } from '@/workshop/content/timeline';
import {
  batchMultiplyCount,
  batchPatchWaves,
  buildTrack,
  countSegments,
  duplicateWaves,
  insertSegment,
  insertWave,
  listChapters,
  moveSegmentToWave,
  patchWave,
  removeSegment,
  removeWaves,
  reorderSegments,
  reorderWaves,
  resizeSegment,
  shiftSegment,
} from '@/workshop/content/waveModel';

const SPAWN = GAME_CONSTANTS.ENEMY_SPAWN_DELAY;

/** 三組敵人：normal 0–2400、fast 2800–4400、elite 4600–5400 */
function threeGroups(): WaveConfig {
  return {
    enemies: [
      { type: 'normal', count: 3, delay: 0 },
      { type: 'fast', count: 2, delay: 400 },
      { type: 'elite', count: 1, delay: 200 },
    ],
    reward: 50,
  };
}

const wave = (config: WaveConfig, index = 0): TimelineWave => waveConfigToTimeline(config, index);

const typesOf = (item: TimelineWave): string[] => flattenWave(item).map((block) => block.type);
const startsOf = (item: TimelineWave): number[] => flattenWave(item).map((block) => block.startMs);

describe('reorderSegments', () => {
  it('把中段組拉到最前面時，首組貼齊 0、其餘保留自己的空隙', () => {
    const waves = [wave(threeGroups())];
    const next = reorderSegments(waves, 0, 'fast#0', 0);
    expect(typesOf(next[0])).toEqual(['fast', 'normal', 'elite']);
    const starts = startsOf(next[0]);
    // fast 拉到最前面：不再帶著原本 400 的空隙
    expect(starts[0]).toBe(0);
    // normal 的空隙是 0 → 緊接在 fast 之後
    expect(starts[1]).toBe(2 * SPAWN);
    // elite 的空隙是 200 → 保留
    expect(starts[2]).toBe(2 * SPAWN + 3 * SPAWN + 200);
  });

  it('目標索引超出範圍時夾在最後一個位置', () => {
    const waves = [wave(threeGroups())];
    const next = reorderSegments(waves, 0, 'normal#0', 99);
    expect(typesOf(next[0])).toEqual(['fast', 'elite', 'normal']);
  });
});

describe('shiftSegment', () => {
  it('往後平移時，同一波後面的組等量後移，被帶著走的組之間空隙不變', () => {
    const waves = [wave(threeGroups())];
    const next = shiftSegment(waves, 0, 'fast#0', 400);
    const flat = flattenWave(next[0]);
    expect(flat[1].startMs).toBe(2800 + 400);
    expect(flat[2].startMs).toBe(4600 + 400);
    // 平移那一組自己與前一組的空隙變大——這就是「改 delay」
    expect(flat[1].startMs - (flat[0].startMs + flat[0].count * SPAWN)).toBe(400 + 400);
    // 被帶著走的 elite 相對 fast 的空隙不變
    expect(flat[2].startMs - (flat[1].startMs + flat[1].count * SPAWN)).toBe(200);
    expect(next[0].durationMs).toBe(5400 + 400);
  });

  it('往前平移會被前一組的結束時刻夾住', () => {
    const waves = [wave(threeGroups())];
    const next = shiftSegment(waves, 0, 'fast#0', -5000);
    const flat = flattenWave(next[0]);
    expect(flat[1].startMs).toBe(flat[0].startMs + flat[0].count * SPAWN);
  });

  it('平移量為 0 時回傳等值的資料', () => {
    const waves = [wave(threeGroups())];
    const next = shiftSegment(waves, 0, 'normal#0', 0);
    expect(startsOf(next[0])).toEqual(startsOf(waves[0]));
  });
});

describe('resizeSegment', () => {
  it('改數量只動該組與波次長度，後面的組留在原位（多出來的就是空隙）', () => {
    const waves = [wave(threeGroups())];
    const next = resizeSegment(waves, 0, 'normal#0', 1);
    const flat = flattenWave(next[0]);
    expect(flat[0].count).toBe(1);
    // 後面的組不會被吸上來：編輯時改數字不該讓整條軌道跳動
    expect(flat[1].startMs).toBe(2800);
    // 最後一組沒動 → 波次長度不變
    expect(next[0].durationMs).toBe(5400);
  });
});

describe('insertSegment / removeSegment', () => {
  it('插入同型別時 id 不會撞到既有組', () => {
    const waves = [wave(threeGroups())];
    const next = insertSegment(waves, 0, 'normal', 2);
    const ids = flattenWave(next[0]).map((block) => block.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain('normal#1');
  });

  it('刪掉最後一組後整波變空，但波次本身保留', () => {
    const waves = [wave({ enemies: [{ type: 'normal', count: 1, delay: 0 }], reward: 10 })];
    const next = removeSegment(waves, 0, 'normal#0');
    expect(next).toHaveLength(1);
    expect(flattenWave(next[0])).toEqual([]);
    expect(next[0].durationMs).toBe(0);
  });
});

describe('moveSegmentToWave', () => {
  it('搬到另一波後，來源波保留空波、目標波 id 不重複', () => {
    const waves = [
      wave({ enemies: [{ type: 'normal', count: 2, delay: 0 }], reward: 10 }, 0),
      wave({ enemies: [{ type: 'normal', count: 1, delay: 0 }], reward: 20 }, 1),
    ];
    const next = moveSegmentToWave(waves, 0, 'normal#0', 1, 1);
    expect(flattenWave(next[0])).toEqual([]);
    const target = flattenWave(next[1]);
    expect(target).toHaveLength(2);
    expect(new Set(target.map((block) => block.id)).size).toBe(2);
    // index 會重排
    expect(next.map((item) => item.index)).toEqual([0, 1]);
  });
});

describe('波次層操作', () => {
  it('insertWave 會把新波插在指定位置並重排 index', () => {
    const waves = [wave({ enemies: [], reward: 10 }, 0)];
    const next = insertWave(waves, 0, { enemies: [{ type: 'fast', count: 2, delay: 0 }], reward: 30 });
    expect(next).toHaveLength(2);
    expect(next[0].reward).toBe(30);
    expect(next.map((item) => item.index)).toEqual([0, 1]);
  });

  it('duplicateWaves 依序複製 N 份並接在被選波之後', () => {
    const waves = [
      wave({ enemies: [{ type: 'normal', count: 1, delay: 0 }], reward: 10 }, 0),
      wave({ enemies: [{ type: 'fast', count: 1, delay: 0 }], reward: 20 }, 1),
    ];
    const next = duplicateWaves(waves, [0], 2);
    expect(next).toHaveLength(4);
    expect(next.map((item) => item.reward)).toEqual([10, 10, 10, 20]);
    expect(next.map((item) => item.index)).toEqual([0, 1, 2, 3]);
  });

  it('removeWaves 與 reorderWaves 都重排 index', () => {
    const waves = [
      wave({ enemies: [], reward: 10 }, 0),
      wave({ enemies: [], reward: 20 }, 1),
      wave({ enemies: [], reward: 30 }, 2),
    ];
    const removed = removeWaves(waves, [1]);
    expect(removed.map((item) => item.reward)).toEqual([10, 30]);
    expect(removed.map((item) => item.index)).toEqual([0, 1]);

    const moved = reorderWaves(waves, 0, 2);
    expect(moved.map((item) => item.reward)).toEqual([20, 30, 10]);
    expect(moved.map((item) => item.index)).toEqual([0, 1, 2]);
  });
});

describe('批次編輯', () => {
  it('數量乘算至少留 1 隻', () => {
    const waves = [wave(threeGroups())];
    const scaled = batchMultiplyCount(waves, [0], 0.1);
    expect(flattenWave(scaled[0]).every((block) => block.count >= 1)).toBe(true);
  });

  it('血量倍率乘算夾在 0.05', () => {
    const waves = [wave(threeGroups())];
    const scaled = batchPatchWaves(waves, [0], { hpScaleMul: 0.01 });
    expect(scaled[0].hpScale).toBe(0.05);
  });

  it('獎勵加成不會變成負數', () => {
    const waves = [wave(threeGroups())];
    const scaled = batchPatchWaves(waves, [0], { rewardAdd: -999 });
    expect(scaled[0].reward).toBe(0);
  });

  it('只影響被選到的波次', () => {
    const waves = [
      wave({ enemies: [{ type: 'normal', count: 1, delay: 0 }], reward: 10 }, 0),
      wave({ enemies: [{ type: 'normal', count: 1, delay: 0 }], reward: 10 }, 1),
    ];
    const next = batchPatchWaves(waves, [1], { chapter: '中段' });
    expect(next[0].chapter).toBeUndefined();
    expect(next[1].chapter).toBe('中段');
  });
});

describe('patchWave', () => {
  it('可清掉間隔與血量倍率（回到跟隨全域）', () => {
    const waves = [wave({ enemies: [], reward: 10, intervalMs: 400, hpScale: 2 }, 0)];
    const next = patchWave(waves, 0, { intervalMs: undefined, hpScale: undefined });
    expect(next[0].intervalMs).toBeUndefined();
    expect(next[0].hpScale).toBeUndefined();
  });
});

describe('listChapters', () => {
  it('未分組排在最後，章節依首次出現排序', () => {
    const waves = [
      wave({ enemies: [], reward: 1 }, 0),
      wave({ enemies: [], reward: 1, chapter: 'A' }, 1),
      wave({ enemies: [], reward: 1, chapter: 'A' }, 2),
    ];
    const chapters = listChapters(waves);
    expect(chapters.map((item) => item.chapter)).toEqual(['A', '']);
    expect(chapters[0]).toMatchObject({ fromWave: 1, count: 2 });
    expect(chapters[1]).toMatchObject({ fromWave: 0, count: 1 });
  });
});

describe('buildTrack', () => {
  it('給的是整關絕對時間，第二波接在第一波長度之後', () => {
    const waves = [
      wave(threeGroups(), 0),
      wave({ enemies: [{ type: 'normal', count: 2, delay: 0 }], reward: 20 }, 1),
    ];
    const track = buildTrack(waves);
    expect(track.waveStarts).toEqual([0, 5400]);
    expect(track.totalMs).toBe(5400 + 2 * SPAWN);
    const second = track.segments.filter((segment) => segment.waveIndex === 1);
    expect(second[0].absoluteStartMs).toBe(5400);
    expect(second[0].firstInWave).toBe(true);
  });

  it('countSegments 算的是組數，不是敵人數', () => {
    const waves = [wave(threeGroups())];
    expect(countSegments(waves)).toBe(3);
  });
});
