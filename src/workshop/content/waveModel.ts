/**
 * 波次編輯模型（單軌序列）
 *
 * 為什麼是單軌：引擎的生成佇列是嚴格序列——每一組的 `delay` 從「前一組最後一隻」
 * 之後才開始算，組內間隔固定。所以時間軸上不存在真正的並行，「每種敵人一列」的
 * 多軌視圖會騙人（拖一格把後面全部推遲，卻看不出來）。
 *
 * 這裡改成誠實的模型：整關一條軌，每一組敵人是一個片段，片段之間的空隙就是 delay。
 *   絕對時間 = 前面所有波的長度 + 本波內前面所有片段的長度 + 空隙
 *
 * 所有函式都是純函式，回傳新的 `TimelineWave[]`；index 一律重排，呼叫端不必自己補。
 * 沒有 React、沒有 store、沒有 i18n。
 */
import type { WaveConfig } from '@/types/game';
import {
  blockEndMs,
  flattenWave,
  recomputeDuration,
  waveConfigToTimeline,
  waveIntervalMs,
  type TimelineBlock,
  type TimelineWave,
} from '@/workshop/content/timeline';

/* ------------------------------------------------------------------ 型別 */

/** 軌上的一個片段（一組敵人），時間全部換算成「整關絕對時間」 */
export interface TrackSegment {
  waveIndex: number;
  blockId: string;
  type: string;
  count: number;
  /** 波內起點（毫秒） */
  startMs: number;
  /** 波內終點（毫秒） */
  endMs: number;
  /** 整關絕對起點（毫秒） */
  absoluteStartMs: number;
  /** 整關絕對終點（毫秒） */
  absoluteEndMs: number;
  /** 與前一組之間的空隙（毫秒）；本波第一組時是「波開始後多久才出第一隻」 */
  gapBeforeMs: number;
  /** 這一組是不是本波的第一組 */
  firstInWave: boolean;
}

/** 整關的軌道：片段 + 波次邊界 + 總長 */
export interface TrackModel {
  segments: TrackSegment[];
  /** 每一波的絕對起點，index 對應 waves */
  waveStarts: number[];
  totalMs: number;
}

/* -------------------------------------------------------------- 結構操作 */

/** 重排 index 並重算長度（所有結構操作的收尾） */
function reindex(waves: readonly TimelineWave[]): TimelineWave[] {
  return waves.map((wave, index) => {
    const next = recomputeDuration(wave);
    return next.index === index ? next : { ...next, index };
  });
}

/** 每一波的絕對起點（長度累加） */
function waveStartOffsets(waves: readonly TimelineWave[]): number[] {
  const starts: number[] = [];
  let acc = 0;
  for (const wave of waves) {
    starts.push(acc);
    acc += Math.max(0, wave.durationMs);
  }
  return starts;
}

/** 建出整關的單軌模型 */
export function buildTrack(waves: readonly TimelineWave[]): TrackModel {
  const waveStarts = waveStartOffsets(waves);
  const segments: TrackSegment[] = [];

  waves.forEach((wave, waveIndex) => {
    const interval = waveIntervalMs(wave);
    const flat = flattenWave(wave);
    const offset = waveStarts[waveIndex];
    flat.forEach((block, at) => {
      const previousEnd = at === 0 ? 0 : blockEndMs(flat[at - 1], interval);
      segments.push({
        waveIndex,
        blockId: block.id,
        type: block.type,
        count: block.count,
        startMs: block.startMs,
        endMs: blockEndMs(block, interval),
        absoluteStartMs: offset + block.startMs,
        absoluteEndMs: offset + blockEndMs(block, interval),
        gapBeforeMs: Math.max(0, block.startMs - previousEnd),
        firstInWave: at === 0,
      });
    });
  });

  const totalMs = waveStarts.length === 0
    ? 0
    : waveStarts[waveStarts.length - 1] + Math.max(0, waves[waves.length - 1].durationMs);

  return { segments, waveStarts, totalMs };
}

/* ---------------------------------------------------------- 片段層編輯 */

/** 把一波的方塊依「原本的空隙」重新排成新的順序 */
function relayBlocks(wave: TimelineWave, order: readonly TimelineBlock[]): TimelineWave {
  const interval = waveIntervalMs(wave);
  const gaps = new Map<string, number>();
  const flat = flattenWave(wave);
  flat.forEach((block, at) => {
    const previousEnd = at === 0 ? 0 : blockEndMs(flat[at - 1], interval);
    gaps.set(block.id, Math.max(0, block.startMs - previousEnd));
  });

  let cursor = 0;
  const placed: TimelineBlock[] = [];
  order.forEach((block, at) => {
    // 第一組一律貼齊波次開頭：把中段片段拉到最前面時，不該帶著別人的空隙
    const gap = at === 0 ? 0 : gaps.get(block.id) ?? 0;
    const startMs = cursor + gap;
    placed.push({ ...block, startMs });
    cursor = startMs + Math.max(0, block.count) * interval;
  });

  const rows = wave.rows.map((row) => ({
    ...row,
    blocks: placed.filter((block) => block.type === row.type).sort((a, b) => a.startMs - b.startMs),
  }));
  return recomputeDuration({ ...wave, rows });
}

/** 波內重排：把某一組移到第 toIndex 個位置（0 起算） */
export function reorderSegments(
  waves: readonly TimelineWave[],
  waveIndex: number,
  blockId: string,
  toIndex: number,
): TimelineWave[] {
  const wave = waves[waveIndex];
  if (!wave) return reindex(waves);
  const flat = flattenWave(wave);
  const from = flat.findIndex((block) => block.id === blockId);
  if (from < 0) return reindex(waves);
  const target = Math.max(0, Math.min(flat.length - 1, Math.round(toIndex)));
  if (from === target) return reindex(waves);
  const order = [...flat];
  const [moved] = order.splice(from, 1);
  order.splice(target, 0, moved);
  return reindex(waves.map((item, at) => (at === waveIndex ? relayBlocks(item, order) : item)));
}

/**
 * 平移一組敵人：改它的出現時刻，同一波後面的組一起等量後移（保留原本空隙）。
 * 這是「拖曳＝改 delay，後續自動推遲」的實作。
 */
export function shiftSegment(
  waves: readonly TimelineWave[],
  waveIndex: number,
  blockId: string,
  deltaMs: number,
): TimelineWave[] {
  const wave = waves[waveIndex];
  if (!wave) return reindex(waves);
  const interval = waveIntervalMs(wave);
  const flat = flattenWave(wave);
  const at = flat.findIndex((block) => block.id === blockId);
  if (at < 0) return reindex(waves);

  const minStart = at === 0 ? 0 : blockEndMs(flat[at - 1], interval);
  const wanted = Math.max(minStart, flat[at].startMs + Math.round(deltaMs));
  const applied = wanted - flat[at].startMs;
  if (applied === 0) return reindex(waves);

  const moving = new Set(flat.slice(at).map((block) => block.id));
  const rows = wave.rows.map((row) => ({
    ...row,
    blocks: row.blocks.map((block) =>
      moving.has(block.id) ? { ...block, startMs: Math.max(0, block.startMs + applied) } : block,
    ),
  }));
  return reindex(waves.map((item, index) => (index === waveIndex ? recomputeDuration({ ...item, rows }) : item)));
}

/** 改一組的數量（拖右緣或輸入） */
export function resizeSegment(
  waves: readonly TimelineWave[],
  waveIndex: number,
  blockId: string,
  count: number,
): TimelineWave[] {
  const wave = waves[waveIndex];
  if (!wave) return reindex(waves);
  const rows = wave.rows.map((row) => ({
    ...row,
    blocks: row.blocks.map((block) =>
      block.id === blockId ? { ...block, count: Math.max(0, Math.round(count)) } : block,
    ),
  }));
  return reindex(waves.map((item, index) => (index === waveIndex ? recomputeDuration({ ...item, rows }) : item)));
}

/** 在指定位置插入一組敵人 */
export function insertSegment(
  waves: readonly TimelineWave[],
  waveIndex: number,
  type: string,
  count = 1,
): TimelineWave[] {
  const wave = waves[waveIndex];
  if (!wave) return reindex(waves);
  const existing = wave.rows.find((row) => row.type === type)?.blocks ?? [];
  const ordinal = existing.reduce((max, block) => {
    const suffix = Number.parseInt(block.id.slice(block.id.lastIndexOf('#') + 1), 10);
    return Number.isFinite(suffix) ? Math.max(max, suffix + 1) : max;
  }, 0);
  const block: TimelineBlock = {
    id: `${type}#${ordinal}`,
    type,
    count: Math.max(0, Math.round(count)),
    startMs: wave.durationMs,
  };
  const flat = [...flattenWave(wave), block];
  const rows = wave.rows
    .map((row) => ({ ...row, blocks: flat.filter((item) => item.type === row.type) }))
    .concat(
      wave.rows.some((row) => row.type === type)
        ? []
        : [{ type, blocks: flat.filter((item) => item.type === type) }],
    );
  return reindex(waves.map((item, index) => (index === waveIndex ? recomputeDuration({ ...item, rows }) : item)));
}

/** 刪掉一組；整波空了就保留空波（讓作者自己決定要不要刪波） */
export function removeSegment(
  waves: readonly TimelineWave[],
  waveIndex: number,
  blockId: string,
): TimelineWave[] {
  const wave = waves[waveIndex];
  if (!wave) return reindex(waves);
  const rows = wave.rows
    .map((row) => ({ ...row, blocks: row.blocks.filter((block) => block.id !== blockId) }))
    .filter((row) => row.blocks.length > 0);
  return reindex(waves.map((item, index) => (index === waveIndex ? recomputeDuration({ ...item, rows }) : item)));
}

/** 把一組搬到另一波（跨波拖曳）；來源波空了就保留空波 */
export function moveSegmentToWave(
  waves: readonly TimelineWave[],
  fromWave: number,
  blockId: string,
  toWave: number,
  toIndex: number,
): TimelineWave[] {
  const source = waves[fromWave];
  const target = waves[toWave];
  if (!source || !target || fromWave === toWave) {
    return reorderSegments(waves, fromWave, blockId, toIndex);
  }
  const block = flattenWave(source).find((item) => item.id === blockId);
  if (!block) return reindex(waves);

  const sourceRows = source.rows
    .map((row) => ({ ...row, blocks: row.blocks.filter((item) => item.id !== blockId) }))
    .filter((row) => row.blocks.length > 0);

  const targetFlat = flattenWave(target);
  const existing = targetFlat.filter((item) => item.type === block.type).length;
  const ordinal = targetFlat.reduce((max, item) => {
    const suffix = Number.parseInt(item.id.slice(item.id.lastIndexOf('#') + 1), 10);
    return Number.isFinite(suffix) ? Math.max(max, suffix + 1) : max;
  }, 0);
  const moved: TimelineBlock = {
    id: `${block.type}#${Math.max(ordinal, existing)}`,
    type: block.type,
    count: block.count,
    startMs: target.durationMs,
  };
  const order = [...targetFlat];
  order.splice(Math.max(0, Math.min(order.length, Math.round(toIndex))), 0, moved);

  return reindex(
    waves.map((item, index) => {
      if (index === fromWave) return recomputeDuration({ ...item, rows: sourceRows });
      if (index === toWave) return relayBlocks(item, order);
      return item;
    }),
  );
}

/* ---------------------------------------------------------- 波次層編輯 */

/** 改單一波的欄位（reward/hpScale/intervalMs/enabled/chapter/name） */
export function patchWave(
  waves: readonly TimelineWave[],
  waveIndex: number,
  patch: Partial<Pick<TimelineWave, 'reward' | 'hpScale' | 'intervalMs' | 'enabled' | 'chapter' | 'name'>>,
): TimelineWave[] {
  return reindex(waves.map((wave, index) => (index === waveIndex ? { ...wave, ...patch } : wave)));
}

/** 在第 atIndex 個位置插入一波 */
export function insertWave(
  waves: readonly TimelineWave[],
  atIndex: number,
  config: WaveConfig,
): TimelineWave[] {
  const next = [...waves];
  const wave = waveConfigToTimeline(config, 0);
  next.splice(Math.max(0, Math.min(waves.length, Math.round(atIndex))), 0, wave);
  return reindex(next);
}

/** 複製某幾波（含順序），插在最後一個被選波之後；章節與名稱一併複製 */
export function duplicateWaves(
  waves: readonly TimelineWave[],
  indices: readonly number[],
  times = 1,
): TimelineWave[] {
  const picked = [...new Set(indices)]
    .filter((index) => index >= 0 && index < waves.length)
    .sort((a, b) => a - b);
  if (picked.length === 0) return reindex(waves);
  const insertAt = picked[picked.length - 1] + 1;
  const copies: TimelineWave[] = [];
  for (let round = 0; round < Math.max(1, Math.round(times)); round += 1) {
    for (const index of picked) copies.push({ ...waves[index], rows: waves[index].rows.map((row) => ({ ...row, blocks: row.blocks.map((block) => ({ ...block })) })) });
  }
  const next = [...waves];
  next.splice(insertAt, 0, ...copies);
  return reindex(next);
}

/** 刪掉某幾波 */
export function removeWaves(waves: readonly TimelineWave[], indices: readonly number[]): TimelineWave[] {
  const drop = new Set(indices);
  return reindex(waves.filter((_, index) => !drop.has(index)));
}

/** 把某幾波搬到新的位置（左欄拖曳排序） */
export function reorderWaves(
  waves: readonly TimelineWave[],
  fromIndex: number,
  toIndex: number,
): TimelineWave[] {
  if (fromIndex === toIndex) return reindex(waves);
  if (fromIndex < 0 || fromIndex >= waves.length) return reindex(waves);
  const next = [...waves];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(Math.max(0, Math.min(next.length, Math.round(toIndex))), 0, moved);
  return reindex(next);
}

/** 批次：所有敵人數量乘上倍率（至少 1 隻） */
export function batchMultiplyCount(
  waves: readonly TimelineWave[],
  indices: readonly number[],
  factor: number,
): TimelineWave[] {
  const picked = new Set(indices);
  const scale = Number.isFinite(factor) && factor > 0 ? factor : 1;
  return reindex(
    waves.map((wave, index) => {
      if (!picked.has(index)) return wave;
      const rows = wave.rows.map((row) => ({
        ...row,
        blocks: row.blocks.map((block) => ({ ...block, count: Math.max(1, Math.round(block.count * scale)) })),
      }));
      return recomputeDuration({ ...wave, rows });
    }),
  );
}

/** 批次：套用單一欄位（獎勵加成、血量倍率乘算、間隔、啟用、章節） */
export function batchPatchWaves(
  waves: readonly TimelineWave[],
  indices: readonly number[],
  patch: { rewardAdd?: number; hpScaleMul?: number; intervalMs?: number; enabled?: boolean; chapter?: string },
): TimelineWave[] {
  const picked = new Set(indices);
  return reindex(
    waves.map((wave, index) => {
      if (!picked.has(index)) return wave;
      const next: TimelineWave = { ...wave };
      if (typeof patch.rewardAdd === 'number') next.reward = Math.max(0, wave.reward + Math.round(patch.rewardAdd));
      if (typeof patch.hpScaleMul === 'number' && patch.hpScaleMul > 0) {
        const current = wave.hpScale ?? 1;
        next.hpScale = Math.max(0.05, Math.round(current * patch.hpScaleMul * 100) / 100);
      }
      if (typeof patch.intervalMs === 'number' && patch.intervalMs > 0) next.intervalMs = patch.intervalMs;
      if (typeof patch.enabled === 'boolean') next.enabled = patch.enabled;
      if (typeof patch.chapter === 'string') next.chapter = patch.chapter;
      return recomputeDuration(next);
    }),
  );
}

/** 章節清單（依出現順序；空字串代表未分組，排在最後） */
export function listChapters(waves: readonly TimelineWave[]): { chapter: string; fromWave: number; count: number }[] {
  const order: string[] = [];
  const stats = new Map<string, { fromWave: number; count: number }>();
  waves.forEach((wave, index) => {
    const key = wave.chapter ?? '';
    if (!stats.has(key)) {
      stats.set(key, { fromWave: index, count: 0 });
      order.push(key);
    }
    const entry = stats.get(key);
    if (entry) entry.count += 1;
  });
  return order
    .map((chapter) => ({ chapter, ...(stats.get(chapter) ?? { fromWave: 0, count: 0 }) }))
    .sort((a, b) => (a.chapter === '' ? 1 : b.chapter === '' ? -1 : a.fromWave - b.fromWave));
}

/** 全關的片段總數（＝組數），給狀態列用 */
export function countSegments(waves: readonly TimelineWave[]): number {
  return waves.reduce((sum, wave) => sum + wave.rows.reduce((inner, row) => inner + row.blocks.length, 0), 0);
}
