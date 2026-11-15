/**
 * 內容頁 · 波次時間軸純函式
 *
 * 時間模型刻意對齊引擎的生成佇列（`useGameSceneEffects`）：
 *   1. 每一組敵人先等自己的 `delay`（毫秒），
 *   2. 組內每隻敵人之間隔 `GAME_CONSTANTS.ENEMY_SPAWN_DELAY`，
 *   3. 下一組的 delay 從「上一組最後一隻」之後才開始累計。
 *
 * 時間軸只保存「每組第一隻的出現時刻 startMs」，`delay` 由前後兩組推回。
 * 因此 `WaveConfig` ↔ `TimelineWave` 兩個方向對同一份資料是可逆的
 * （startMs 嚴格遞增，還原時排序即回到原本的 enemies 順序）。
 *
 * 這裡沒有任何 React、store、i18n：UI 只做投影，資料只做計算。
 */
import type { WaveConfig } from '@/types/game';
import { ENEMY_DATA, GAME_CONSTANTS } from '@/data/gameData';

/** 同一組敵人的生成間隔（毫秒）。引擎常數是唯一真相，不要在 UI 另寫 400/800。 */
export const SPAWN_INTERVAL_MS = GAME_CONSTANTS.ENEMY_SPAWN_DELAY;

/* ------------------------------------------------------------------ 型別 */

/** 時間軸上的一格：一次「生成 N 隻同型敵人」的事件 */
export interface TimelineBlock {
  /** 波次內穩定 id：`<type>#<同型第 n 組>`，供拖曳與選取定位 */
  id: string;
  /** 敵人類型 id（內建 EnemyType 或專案自訂敵人資產 id） */
  type: string;
  count: number;
  /** 這一組第一隻出現於「波次開始後」幾毫秒 */
  startMs: number;
}

/** 一列 = 一種敵人 */
export interface TimelineRow {
  type: string;
  blocks: TimelineBlock[];
}

/** 一波的時間軸模型 */
export interface TimelineWave {
  index: number;
  reward: number;
  rows: TimelineRow[];
  durationMs: number;
  /** 血量倍率（絕對值）；缺省＝1。與 WaveConfig.hpScale 對應 */
  hpScale?: number;
  /** 組內生成間隔（毫秒）；缺省＝全域常數。與 WaveConfig.intervalMs 對應 */
  intervalMs?: number;
  /** false＝停用；缺省＝啟用 */
  enabled?: boolean;
  /** 章節標籤；缺省＝未分組 */
  chapter?: string;
  /** 自訂波次名稱；缺省＝「第 N 波」 */
  name?: string;
}

/** 波次血量倍率（絕對值），非法值一律視為 1 */
export function waveHpScale(wave: TimelineWave): number {
  const value = wave.hpScale;
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 1;
}

/** 波次組內生成間隔（毫秒），非法值一律退回全域常數 */
export function waveIntervalMs(wave: TimelineWave): number {
  const value = wave.intervalMs;
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : SPAWN_INTERVAL_MS;
}

/** 波次是否啟用（缺省啟用） */
export function isWaveEnabled(wave: TimelineWave): boolean {
  return wave.enabled !== false;
}

/** 章節標籤（缺省空字串＝未分組） */
export function waveChapter(wave: TimelineWave): string {
  return wave.chapter ?? '';
}

export interface TimelineCurvePoint {
  atMs: number;
  hp: number;
  reward: number;
}

export interface WaveCurve {
  /** 依時間排序的累積點（含 0 與結尾） */
  points: TimelineCurvePoint[];
  totalHp: number;
  totalReward: number;
  maxHp: number;
  durationMs: number;
}

export interface EnemyStats {
  health: number;
  reward: number;
}

export type EnemyLookup = (type: string) => EnemyStats | undefined;

export type TimelineIssueCode =
  | 'emptyWave'
  | 'negativeDelay'
  | 'zeroCount'
  | 'unknownEnemy'
  | 'negativeReward'
  | 'overlap';

export interface TimelineIssue {
  code: TimelineIssueCode;
  waveIndex: number;
  /** 指向出問題的那一格；波次層級的問題是 null */
  blockId: string | null;
  /** 出問題的敵人類型；與敵人無關時是 null */
  type: string | null;
}

/* ------------------------------------------------------------------ 基礎 */

export function blockEndMs(block: TimelineBlock, intervalMs = SPAWN_INTERVAL_MS): number {
  return block.startMs + Math.max(0, block.count) * intervalMs;
}

/** 攤平成一維並依時間排序（同時間時保持列順序，排序穩定） */
function flattenBlocks(rows: readonly TimelineRow[]): TimelineBlock[] {
  const flat: { block: TimelineBlock; row: number; col: number }[] = [];
  rows.forEach((row, rowIndex) => {
    row.blocks.forEach((block, colIndex) => flat.push({ block, row: rowIndex, col: colIndex }));
  });
  flat.sort((a, b) => a.block.startMs - b.block.startMs || a.row - b.row || a.col - b.col);
  return flat.map((item) => item.block);
}

/** 依「型別首次出現」分列，列內依時間排序 */
function groupBlocks(blocks: readonly TimelineBlock[]): TimelineRow[] {
  const rows: TimelineRow[] = [];
  const index = new Map<string, TimelineRow>();
  for (const block of blocks) {
    let row = index.get(block.type);
    if (!row) {
      row = { type: block.type, blocks: [] };
      index.set(block.type, row);
      rows.push(row);
    }
    row.blocks.push({ ...block });
  }
  for (const row of rows) row.blocks.sort((a, b) => a.startMs - b.startMs);
  return rows;
}

/** 依目前方塊重算波次長度（最後一格結束的時刻） */
export function recomputeDuration(wave: TimelineWave): TimelineWave {
  const flat = flattenBlocks(wave.rows);
  const interval = waveIntervalMs(wave);
  const durationMs = flat.reduce((max, block) => Math.max(max, blockEndMs(block, interval)), 0);
  return { ...wave, durationMs };
}

/* -------------------------------------------------------------- 雙向轉換 */

/** `WaveConfig` → 時間軸。第 index 波（0 起算，只影響顯示）。 */
export function waveConfigToTimeline(config: WaveConfig, index = 0): TimelineWave {
  const counters = new Map<string, number>();
  const blocks: TimelineBlock[] = [];
  const interval =
    typeof config.intervalMs === 'number' && config.intervalMs > 0 ? config.intervalMs : SPAWN_INTERVAL_MS;
  let cursor = 0;

  for (const group of config.enemies) {
    const delay = Math.max(0, group.delay ?? 0);
    const count = Math.max(0, Math.round(group.count));
    const startMs = cursor + delay;
    const ordinal = counters.get(group.type) ?? 0;
    counters.set(group.type, ordinal + 1);
    blocks.push({ id: `${group.type}#${ordinal}`, type: group.type, count, startMs });
    cursor = startMs + count * interval;
  }

  const wave: TimelineWave = {
    index,
    reward: config.reward,
    rows: groupBlocks(blocks),
    durationMs: cursor,
  };
  // 只把「與預設不同」的欄位帶進模型，讓預設波次維持乾淨的形狀
  if (typeof config.hpScale === 'number' && config.hpScale > 0) wave.hpScale = config.hpScale;
  if (typeof config.intervalMs === 'number' && config.intervalMs > 0) wave.intervalMs = config.intervalMs;
  if (config.enabled === false) wave.enabled = false;
  if (config.chapter) wave.chapter = config.chapter;
  if (config.name) wave.name = config.name;
  return wave;
}

/** 時間軸 → `WaveConfig`。delay 一律取「距前一組結束的正差」，負值歸零。 */
export function timelineToWaveConfig(wave: TimelineWave): WaveConfig {
  const flat = flattenBlocks(wave.rows);
  const enemies: WaveConfig['enemies'] = [];
  const interval = waveIntervalMs(wave);
  let cursor = 0;

  for (const block of flat) {
    const startMs = Math.max(0, block.startMs);
    const count = Math.max(0, Math.round(block.count));
    enemies.push({ type: block.type, count, delay: Math.max(0, startMs - cursor) });
    cursor = startMs + count * interval;
  }

  const config: WaveConfig = { enemies, reward: wave.reward };
  if (wave.hpScale !== undefined && waveHpScale(wave) !== 1) config.hpScale = waveHpScale(wave);
  if (wave.intervalMs !== undefined && interval !== SPAWN_INTERVAL_MS) config.intervalMs = interval;
  if (wave.enabled === false) config.enabled = false;
  if (wave.chapter) config.chapter = wave.chapter;
  if (wave.name) config.name = wave.name;
  return config;
}

export function configsToTimelineWaves(configs: readonly WaveConfig[]): TimelineWave[] {
  return configs.map((config, index) => waveConfigToTimeline(config, index));
}

export function timelineWavesToConfigs(waves: readonly TimelineWave[]): WaveConfig[] {
  return waves.map((wave) => timelineToWaveConfig(wave));
}

/* -------------------------------------------------------------- 時間軸操作 */

/** 拖曳方塊：改這一組的出現時刻（毫秒），不可早於 0。 */
export function moveBlock(wave: TimelineWave, blockId: string, startMs: number): TimelineWave {
  const next = mapBlock(wave, blockId, (block) => ({
    ...block,
    startMs: Math.max(0, Math.round(startMs)),
  }));
  return recomputeDuration(next);
}

/** 拖右緣：改這一組的數量（0 代表「空組」，交給驗證提示）。 */
export function resizeBlock(wave: TimelineWave, blockId: string, count: number): TimelineWave {
  const next = mapBlock(wave, blockId, (block) => ({
    ...block,
    count: Math.max(0, Math.round(count)),
  }));
  return recomputeDuration(next);
}

/** 在波次尾端追加一組敵人 */
export function appendBlock(wave: TimelineWave, type: string, count = 1): TimelineWave {
  // id 取「現有同型最大序號 + 1」，避免刪過中間組後長度與序號錯開而撞 id
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
  const flat = [...flattenBlocks(wave.rows), block];
  return recomputeDuration({ ...wave, rows: groupBlocks(flat) });
}

/** 攤平一波的所有方塊（依時間排序），給檢視器列出「組」用 */
export function flattenWave(wave: TimelineWave): TimelineBlock[] {
  return flattenBlocks(wave.rows);
}

/** 某一格的「組延遲」＝距前一組結束的正差（毫秒） */
export function delayOf(wave: TimelineWave, blockId: string): number {
  const flat = flattenBlocks(wave.rows);
  const index = flat.findIndex((block) => block.id === blockId);
  if (index <= 0) {
    const first = flat[0];
    return first && first.id === blockId ? Math.max(0, first.startMs) : 0;
  }
  const previousEnd = blockEndMs(flat[index - 1], waveIntervalMs(wave));
  return Math.max(0, flat[index].startMs - previousEnd);
}

/** 改某一格的組延遲：往前推則夾在 0（不可與前一組重疊），長度跟著重算 */
export function setDelay(wave: TimelineWave, blockId: string, delay: number): TimelineWave {
  const flat = flattenBlocks(wave.rows);
  const index = flat.findIndex((block) => block.id === blockId);
  if (index < 0) return wave;
  const previousEnd = index === 0 ? 0 : blockEndMs(flat[index - 1], waveIntervalMs(wave));
  const startMs = previousEnd + Math.max(0, Math.round(delay));
  return moveBlock(wave, blockId, startMs);
}

export function removeBlock(wave: TimelineWave, blockId: string): TimelineWave {
  const rows = wave.rows
    .map((row) => ({ ...row, blocks: row.blocks.filter((block) => block.id !== blockId) }))
    .filter((row) => row.blocks.length > 0);
  return recomputeDuration({ ...wave, rows });
}

/** 找出所有用到這個敵人型別的方塊（用於「移除引用」） */
export function blocksOfType(wave: TimelineWave, type: string): TimelineBlock[] {
  return wave.rows.find((row) => row.type === type)?.blocks ?? [];
}

function mapBlock(
  wave: TimelineWave,
  blockId: string,
  patch: (block: TimelineBlock) => TimelineBlock,
): TimelineWave {
  const rows = wave.rows.map((row) => ({
    ...row,
    blocks: row.blocks.map((block) => (block.id === blockId ? patch(block) : block)),
  }));
  return { ...wave, rows };
}

/* ---------------------------------------------------------------- 曲線資料 */

/** 官方敵人數值查表（自訂資產由呼叫端自己包一層 lookup 覆蓋） */
export function createEnemyLookup(): EnemyLookup {
  return (type: string) => {
    const data = ENEMY_DATA[type];
    if (!data) return undefined;
    return { health: data.health, reward: data.reward };
  };
}

/**
 * 整場的「累積 HP / 累積獎勵」曲線。
 *
 * 判定方式（刻意寫死，測試會鎖住）：
 * - 每隻敵人**出現時**就把自己的 `health` 計入累積 HP（場上總量）；
 * - 同時把自己的擊殺獎勵 `reward` 計入累積獎勵；
 * - 每一波結束（該波最後一格結束）才把該波的 `reward` 加上去，因為那是通關才發的。
 */
export function buildCurve(waves: readonly TimelineWave[], lookup: EnemyLookup): WaveCurve {
  const buckets = new Map<number, { hp: number; reward: number }>();
  const add = (atMs: number, hp: number, reward: number) => {
    const current = buckets.get(atMs) ?? { hp: 0, reward: 0 };
    current.hp += hp;
    current.reward += reward;
    buckets.set(atMs, current);
  };

  let offset = 0;
  for (const wave of waves) {
    const interval = waveIntervalMs(wave);
    const scale = waveHpScale(wave);
    for (const block of flattenBlocks(wave.rows)) {
      const stats = lookup(block.type);
      const health = (stats?.health ?? 0) * scale;
      const unitReward = stats?.reward ?? 0;
      for (let i = 0; i < block.count; i++) {
        add(offset + block.startMs + i * interval, health, unitReward);
      }
    }
    const waveEnd = offset + wave.durationMs;
    add(waveEnd, 0, Math.max(0, wave.reward));
    offset = waveEnd;
  }

  const times = [...buckets.keys()].sort((a, b) => a - b);
  if (times.length === 0) {
    return { points: [{ atMs: 0, hp: 0, reward: 0 }], totalHp: 0, totalReward: 0, maxHp: 0, durationMs: 0 };
  }

  let hp = 0;
  let reward = 0;
  const points: TimelineCurvePoint[] = [{ atMs: 0, hp: 0, reward: 0 }];
  for (const atMs of times) {
    const bucket = buckets.get(atMs);
    if (!bucket) continue;
    hp += bucket.hp;
    reward += bucket.reward;
    if (atMs === 0) {
      points[0] = { atMs: 0, hp, reward };
      continue;
    }
    points.push({ atMs, hp, reward });
  }

  const last = points[points.length - 1];
  if (last.atMs !== offset) points.push({ atMs: offset, hp, reward });

  return {
    points,
    totalHp: hp,
    totalReward: reward,
    maxHp: hp,
    durationMs: offset,
  };
}

/* ------------------------------------------------------------------- 驗證 */

export function validateTimeline(
  waves: readonly TimelineWave[],
  lookup?: EnemyLookup,
): TimelineIssue[] {
  const issues: TimelineIssue[] = [];

  waves.forEach((wave, waveIndex) => {
    const flat = flattenBlocks(wave.rows);
    const interval = waveIntervalMs(wave);

    // 停用的波次本來就沒有敵人，不該被判成空波
    if (flat.length === 0 && isWaveEnabled(wave)) {
      issues.push({ code: 'emptyWave', waveIndex, blockId: null, type: null });
    }

    if (wave.reward < 0) {
      issues.push({ code: 'negativeReward', waveIndex, blockId: null, type: null });
    }

    let previousEnd = 0;
    for (const block of flat) {
      if (block.count === 0) {
        issues.push({ code: 'zeroCount', waveIndex, blockId: block.id, type: block.type });
      }
      if (block.startMs < 0) {
        issues.push({ code: 'negativeDelay', waveIndex, blockId: block.id, type: block.type });
      }
      if (block.startMs < previousEnd) {
        issues.push({ code: 'overlap', waveIndex, blockId: block.id, type: block.type });
      }
      if (lookup && !lookup(block.type)) {
        issues.push({ code: 'unknownEnemy', waveIndex, blockId: block.id, type: block.type });
      }
      previousEnd = Math.max(previousEnd, blockEndMs(block, interval));
    }
  });

  return issues;
}

/** 直接驗證存檔格式：先看原始 delay 有沒有負值，再走時間軸驗證 */
export function validateWaveConfigs(
  configs: readonly WaveConfig[],
  lookup?: EnemyLookup,
): TimelineIssue[] {
  const issues = validateTimeline(configsToTimelineWaves(configs), lookup);
  configs.forEach((config, waveIndex) => {
    config.enemies.forEach((group, groupIndex) => {
      if ((group.delay ?? 0) < 0) {
        issues.push({
          code: 'negativeDelay',
          waveIndex,
          blockId: `${group.type}#${groupIndex}`,
          type: group.type,
        });
      }
    });
  });
  return issues;
}

/* ------------------------------------------------------------------- 摘要 */

export interface WaveSummary {
  enemyCount: number;
  totalHp: number;
  totalReward: number;
  durationMs: number;
}

export function summarizeWave(wave: TimelineWave, lookup: EnemyLookup): WaveSummary {
  let enemyCount = 0;
  let totalHp = 0;
  let totalReward = 0;
  const scale = waveHpScale(wave);
  for (const block of flattenBlocks(wave.rows)) {
    enemyCount += block.count;
    const stats = lookup(block.type);
    totalHp += (stats?.health ?? 0) * scale * block.count;
    totalReward += (stats?.reward ?? 0) * block.count;
  }
  return { enemyCount, totalHp, totalReward, durationMs: wave.durationMs };
}

/** 陣容顯示名稱：專案自訂資產優先，其次官方資料，最後退回型別 id */
export function enemyLabel(type: string, customNames?: Readonly<Record<string, string>>): string {
  const custom = customNames?.[type];
  if (custom) return custom;
  return ENEMY_DATA[type]?.name ?? type;
}
