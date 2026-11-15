/**
 * 內容頁 · 波次時間軸行為測試（workshopTimeline）
 *
 * 鎖住 `src/workshop/content/timeline.ts` 的實際語意：
 *   1. `WaveConfig` ↔ `TimelineWave` 兩個方向可逆（含 reward / block id / startMs / durationMs）；
 *   2. 每組敵人先等自己的 delay，delay 從「前一組最後一隻」之後才累計，組內間隔 = GAME_CONSTANTS.ENEMY_SPAWN_DELAY；
 *   3. 曲線的 HP 在每隻出現時遞增、該波通關獎勵在波次結束才加；
 *   4. 驗證的每種問題各自只回報自己（用 toEqual 鎖住「不含未預期 code」）；
 *   5. 拖曳／縮放／追加／刪除／改組延遲後的重算結果。
 *
 * 間隔一律讀 `GAME_CONSTANTS.ENEMY_SPAWN_DELAY`，測試裡不寫死毫秒數。
 */

import { describe, it, expect } from 'vitest';
import type { WaveConfig } from '@/types/game';
import { ENEMY_DATA, GAME_CONSTANTS } from '@/data/gameData';
import {
  SPAWN_INTERVAL_MS,
  appendBlock,
  blockEndMs,
  blocksOfType,
  buildCurve,
  configsToTimelineWaves,
  createEnemyLookup,
  delayOf,
  enemyLabel,
  flattenWave,
  moveBlock,
  recomputeDuration,
  removeBlock,
  resizeBlock,
  setDelay,
  summarizeWave,
  timelineToWaveConfig,
  timelineWavesToConfigs,
  validateTimeline,
  validateWaveConfigs,
  waveConfigToTimeline,
} from '@/workshop/content/timeline';
import type {
  EnemyLookup,
  EnemyStats,
  TimelineBlock,
  TimelineWave,
  WaveCurve,
} from '@/workshop/content/timeline';

/** 引擎生成間隔：唯一真相在 GAME_CONSTANTS，不在測試裡 */
const SPAWN = GAME_CONSTANTS.ENEMY_SPAWN_DELAY;

/** 第二波那個 fixture 的組延遲（不跟 SPAWN 綁在一起） */
const FOLLOW_DELAY = 400;

/** 測試用敵人數值：與官方平衡值脫鉤，避免調數值把行為測試打紅 */
const STATS: Record<string, EnemyStats> = {
  normal: { health: 100, reward: 10 },
  fast: { health: 50, reward: 5 },
  elite: { health: 200, reward: 25 },
};

const lookup: EnemyLookup = (type) => STATS[type];

/** 只認得 normal 的查表，用來製造 unknownEnemy */
const partialLookup: EnemyLookup = (type) => (type === 'normal' ? STATS.normal : undefined);

/** 3 波 fixture：含同型敵人重複出現、delay 0 與非 0、波次 reward 0 */
const FIXTURE: WaveConfig[] = [
  {
    reward: 50,
    enemies: [
      { type: 'normal', count: 2, delay: 0 },
      { type: 'fast', count: 3, delay: 1200 },
      { type: 'normal', count: 1, delay: 0 },
    ],
  },
  {
    reward: 80,
    enemies: [
      { type: 'elite', count: 4, delay: 500 },
      { type: 'tank', count: 1, delay: 0 },
    ],
  },
  {
    reward: 0,
    enemies: [
      { type: 'heavy', count: 1, delay: 2500 },
      { type: 'normal', count: 5, delay: 0 },
      { type: 'elite', count: 2, delay: 0 },
    ],
  },
];

/** 兩組基礎波：normal#0@0（2 隻）、fast#0@2*SPAWN（1 隻）；duration = 3*SPAWN */
const baseWave: TimelineWave = waveConfigToTimeline({
  reward: 10,
  enemies: [
    { type: 'normal', count: 2, delay: 0 },
    { type: 'fast', count: 1, delay: 0 },
  ],
});

/** 攤平後依時間排序（時間軸的 canonical 順序） */
function flatBlocks(wave: TimelineWave): TimelineBlock[] {
  return wave.rows.flatMap((row) => row.blocks).sort((a, b) => a.startMs - b.startMs);
}

/**
 * 手算「每組第一隻」的時刻，當成與實作獨立的期望值。
 * fixture 的 delay/count 都是非負整數，所以不需要實作裡的 Math.max/Math.round 夾值；
 * 那兩個分支由「clamps a negative delay and rounds a fractional count」單獨覆蓋。
 */
function expectedStarts(config: WaveConfig): number[] {
  const starts: number[] = [];
  let cursor = 0;
  for (const group of config.enemies) {
    const start = cursor + group.delay;
    starts.push(start);
    cursor = start + group.count * SPAWN;
  }
  return starts;
}

function blockOf(wave: TimelineWave, blockId: string): TimelineBlock {
  const block = flatBlocks(wave).find((item) => item.id === blockId);
  if (!block) throw new Error('missing block ' + blockId);
  return block;
}

function pointAt(curve: WaveCurve, atMs: number) {
  const point = curve.points.find((item) => item.atMs === atMs);
  if (!point) throw new Error('missing curve point at ' + atMs);
  return point;
}

describe('SPAWN_INTERVAL_MS', () => {
  it('mirrors GAME_CONSTANTS.ENEMY_SPAWN_DELAY instead of a local magic number', () => {
    expect(SPAWN_INTERVAL_MS).toBe(GAME_CONSTANTS.ENEMY_SPAWN_DELAY);
    expect(SPAWN_INTERVAL_MS).toBeGreaterThan(0);
  });
});

describe('waveConfigToTimeline', () => {
  it('groups same-type groups into one row with <type>#<n> block ids', () => {
    const wave = waveConfigToTimeline(FIXTURE[0], 0);
    expect(wave.index).toBe(0);
    expect(wave.reward).toBe(FIXTURE[0].reward);
    expect(wave.rows.map((row) => row.type)).toEqual(['normal', 'fast']);
    expect(blocksOfType(wave, 'normal').map((block) => block.id)).toEqual(['normal#0', 'normal#1']);
    expect(blocksOfType(wave, 'fast').map((block) => block.id)).toEqual(['fast#0']);
  });

  it('keeps the display index handed in by the caller', () => {
    expect(waveConfigToTimeline(FIXTURE[0], 7).index).toBe(7);
    expect(waveConfigToTimeline(FIXTURE[0]).index).toBe(0);
  });

  it('derives every startMs from the previous block end plus this group delay', () => {
    FIXTURE.forEach((config, waveIndex) => {
      const wave = waveConfigToTimeline(config, waveIndex);
      const blocks = flatBlocks(wave);
      expect(blocks.map((block) => block.startMs)).toEqual(expectedStarts(config));

      let previousEnd = 0;
      config.enemies.forEach((group, groupIndex) => {
        const block = blocks[groupIndex];
        expect(block.type).toBe(group.type);
        expect(block.count).toBe(group.count);
        expect(block.startMs).toBe(previousEnd + group.delay);
        expect(blockEndMs(block)).toBe(block.startMs + group.count * SPAWN);
        previousEnd = blockEndMs(block);
      });
      // durationMs 是最後一組結束的時刻，不是任何中間組
      expect(wave.durationMs).toBe(previousEnd);
    });
  });

  it('counts a non-zero delay only after the previous group has fully spawned', () => {
    const config = FIXTURE[0];
    const wave = waveConfigToTimeline(config);
    const normalFirst = blockOf(wave, 'normal#0');
    const fast = blockOf(wave, 'fast#0');
    // 第一組 2 隻 = 2 * SPAWN，之後才輪到 fast 的 1200ms delay
    expect(normalFirst.startMs).toBe(0);
    expect(blockEndMs(normalFirst)).toBe(2 * SPAWN);
    expect(fast.startMs).toBe(2 * SPAWN + config.enemies[1].delay);
    // 收尾的是第三組（normal#1）而不是 fast：durationMs = 最後一組的結束
    const last = blockOf(wave, 'normal#1');
    expect(last.startMs).toBe(fast.startMs + config.enemies[1].count * SPAWN);
    expect(wave.durationMs).toBe(blockEndMs(last));
    expect(wave.durationMs).toBe(
      2 * SPAWN + config.enemies[1].delay + (config.enemies[1].count + 1) * SPAWN,
    );
  });

  it('clamps a negative delay and rounds a fractional count while converting', () => {
    const wave = waveConfigToTimeline({
      reward: 0,
      enemies: [{ type: 'normal', count: 2.6, delay: -500 }],
    });
    const block = blockOf(wave, 'normal#0');
    expect(block.startMs).toBe(0);
    expect(block.count).toBe(3);
    expect(wave.durationMs).toBe(3 * SPAWN);
  });
});

describe('round-trip', () => {
  it('turns each fixture wave back into the same WaveConfig', () => {
    FIXTURE.forEach((config, waveIndex) => {
      expect(timelineToWaveConfig(waveConfigToTimeline(config, waveIndex))).toEqual(config);
    });
  });

  it('round-trips the whole config list through both directions without drift', () => {
    const waves = configsToTimelineWaves(FIXTURE);
    const configs = timelineWavesToConfigs(waves);
    expect(configs).toEqual(FIXTURE);
    // 再轉回時間軸：block id / startMs / durationMs 都必須一致
    expect(configsToTimelineWaves(configs)).toEqual(waves);
  });

  it('restores delay 0 for a group that starts exactly where the previous group ended', () => {
    const config: WaveConfig = {
      reward: 30,
      enemies: [
        { type: 'normal', count: 2, delay: 0 },
        { type: 'fast', count: 1, delay: 0 },
      ],
    };
    const wave = waveConfigToTimeline(config);
    const blocks = flatBlocks(wave);
    expect(blocks[1].startMs).toBe(blockEndMs(blocks[0]));
    expect(timelineToWaveConfig(wave)).toEqual(config);
  });
});

describe('buildCurve', () => {
  const spawnWave = waveConfigToTimeline(
    { reward: 100, enemies: [{ type: 'normal', count: 2, delay: 0 }] },
    0,
  );
  const followWave = waveConfigToTimeline(
    { reward: 40, enemies: [{ type: 'fast', count: 1, delay: FOLLOW_DELAY }] },
    1,
  );

  it('returns a single zero point when there is no wave at all', () => {
    expect(buildCurve([], lookup)).toEqual({
      points: [{ atMs: 0, hp: 0, reward: 0 }],
      totalHp: 0,
      totalReward: 0,
      maxHp: 0,
      durationMs: 0,
    });
  });

  it('raises hp on every spawn and adds the wave reward only at the wave end', () => {
    const curve = buildCurve([spawnWave], lookup);
    expect(curve.points).toEqual([
      { atMs: 0, hp: 100, reward: 10 },
      { atMs: SPAWN, hp: 200, reward: 20 },
      { atMs: 2 * SPAWN, hp: 200, reward: 120 },
    ]);
    expect(curve.totalHp).toBe(200);
    expect(curve.totalReward).toBe(120);
    expect(curve.maxHp).toBe(200);
    expect(curve.durationMs).toBe(2 * SPAWN);
    // 波次結束那一點：場上 HP 不再變，只有通關獎勵跳 +100
    expect(pointAt(curve, 2 * SPAWN).hp).toBe(pointAt(curve, SPAWN).hp);
    expect(pointAt(curve, 2 * SPAWN).reward - pointAt(curve, SPAWN).reward).toBe(100);
  });

  it('keeps the first point at zero when nothing spawns at 0ms', () => {
    const wave = waveConfigToTimeline(
      { reward: 30, enemies: [{ type: 'normal', count: 1, delay: FOLLOW_DELAY }] },
      0,
    );
    expect(buildCurve([wave], lookup).points).toEqual([
      { atMs: 0, hp: 0, reward: 0 },
      { atMs: FOLLOW_DELAY, hp: 100, reward: 10 },
      { atMs: FOLLOW_DELAY + SPAWN, hp: 100, reward: 40 },
    ]);
  });

  it('shares one timeline offset across waves and keeps each reward at its own wave end', () => {
    const curve = buildCurve([spawnWave, followWave], lookup);
    expect(curve.points).toEqual([
      { atMs: 0, hp: 100, reward: 10 },
      { atMs: SPAWN, hp: 200, reward: 20 },
      { atMs: 2 * SPAWN, hp: 200, reward: 120 },
      { atMs: 2 * SPAWN + FOLLOW_DELAY, hp: 250, reward: 125 },
      { atMs: 2 * SPAWN + FOLLOW_DELAY + SPAWN, hp: 250, reward: 165 },
    ]);
    expect(curve.totalHp).toBe(250);
    expect(curve.totalReward).toBe(165);
    expect(curve.maxHp).toBe(250);
    expect(curve.durationMs).toBe(2 * SPAWN + FOLLOW_DELAY + SPAWN);
    // 第二波還沒結束前，只累積到它的擊殺獎勵，沒有它的通關獎勵
    expect(pointAt(curve, 2 * SPAWN + FOLLOW_DELAY).reward).toBe(125);
    expect(pointAt(curve, 2 * SPAWN + FOLLOW_DELAY).hp).toBe(250);
  });
});

describe('createEnemyLookup', () => {
  it('reads health and reward from the official enemy table', () => {
    const official = createEnemyLookup();
    const normal = ENEMY_DATA.normal;
    expect(official('normal')).toEqual({ health: normal.health, reward: normal.reward });
    expect(official('not-a-real-enemy-type')).toBeUndefined();
  });
});

describe('validateTimeline', () => {
  const emptyWave: TimelineWave = { index: 0, reward: 0, rows: [], durationMs: 0 };

  it('reports emptyWave and nothing else for a wave without any block', () => {
    expect(validateTimeline([emptyWave])).toEqual([
      { code: 'emptyWave', waveIndex: 0, blockId: null, type: null },
    ]);
  });

  it('reports zeroCount for a block whose count was resized to zero', () => {
    const wave = waveConfigToTimeline({ reward: 0, enemies: [{ type: 'normal', count: 2, delay: 0 }] });
    const issues = validateTimeline([resizeBlock(wave, 'normal#0', 0)]);
    expect(issues.map((issue) => issue.code)).toEqual(['zeroCount']);
    expect(issues[0]).toEqual({ code: 'zeroCount', waveIndex: 0, blockId: 'normal#0', type: 'normal' });
  });

  it('reports unknownEnemy only when the lookup cannot resolve the type', () => {
    const wave = waveConfigToTimeline({ reward: 0, enemies: [{ type: 'phantom', count: 1, delay: 0 }] });
    const issues = validateTimeline([wave], partialLookup);
    expect(issues.map((issue) => issue.code)).toEqual(['unknownEnemy']);
    expect(issues[0].blockId).toBe('phantom#0');
    expect(issues[0].type).toBe('phantom');

    const known = waveConfigToTimeline({ reward: 0, enemies: [{ type: 'normal', count: 1, delay: 0 }] });
    expect(validateTimeline([known], partialLookup)).toEqual([]);
  });

  it('reports negativeReward at the wave level only', () => {
    const wave: TimelineWave = {
      index: 0,
      reward: -10,
      rows: [{ type: 'normal', blocks: [{ id: 'normal#0', type: 'normal', count: 1, startMs: 0 }] }],
      durationMs: SPAWN,
    };
    const issues = validateTimeline([wave]);
    expect(issues.map((issue) => issue.code)).toEqual(['negativeReward']);
    expect(issues[0].blockId).toBeNull();
    expect(issues[0].type).toBeNull();
  });

  it('reports negativeDelay for a hand-built block with a negative start', () => {
    const wave: TimelineWave = {
      index: 0,
      reward: 0,
      rows: [{ type: 'normal', blocks: [{ id: 'normal#0', type: 'normal', count: 1, startMs: -1 }] }],
      durationMs: 0,
    };
    // 手動造的負 start 同時滿足 overlap 的判準（startMs < previousEnd = 0），實作就是兩條都報
    expect(validateTimeline([wave]).map((issue) => issue.code)).toEqual(['negativeDelay', 'overlap']);
  });

  it('reports overlap when a block is dragged in front of the previous block end', () => {
    const wave = waveConfigToTimeline({
      reward: 0,
      enemies: [
        { type: 'normal', count: 2, delay: 0 },
        { type: 'fast', count: 1, delay: 0 },
      ],
    });
    expect(validateTimeline([wave])).toEqual([]);

    const dragged = moveBlock(wave, 'fast#0', SPAWN);
    const fast = blockOf(dragged, 'fast#0');
    expect(fast.startMs).toBe(SPAWN);
    expect(fast.startMs).toBeLessThan(blockEndMs(blockOf(dragged, 'normal#0')));

    const issues = validateTimeline([dragged]);
    expect(issues.map((issue) => issue.code)).toEqual(['overlap']);
    expect(issues[0]).toEqual({ code: 'overlap', waveIndex: 0, blockId: 'fast#0', type: 'fast' });
  });

  it('keeps flagging overlaps after a long block that swallows the following ones', () => {
    const wave: TimelineWave = {
      index: 0,
      reward: 0,
      rows: [
        { type: 'normal', blocks: [{ id: 'normal#0', type: 'normal', count: 10, startMs: 0 }] },
        { type: 'fast', blocks: [{ id: 'fast#0', type: 'fast', count: 1, startMs: SPAWN }] },
        { type: 'elite', blocks: [{ id: 'elite#0', type: 'elite', count: 1, startMs: 2 * SPAWN }] },
      ],
      durationMs: 10 * SPAWN,
    };
    const issues = validateTimeline([wave]);
    expect(issues.map((issue) => issue.code)).toEqual(['overlap', 'overlap']);
    expect(issues.map((issue) => issue.blockId)).toEqual(['fast#0', 'elite#0']);
  });

  it('reports each offending wave with its own waveIndex', () => {
    const fine = waveConfigToTimeline({ reward: 0, enemies: [{ type: 'normal', count: 1, delay: 0 }] }, 0);
    // 陣列位置 1 的波，wave.index 故意寫 5：waveIndex 取的是陣列位置
    expect(validateTimeline([fine, { ...emptyWave, index: 5 }])).toEqual([
      { code: 'emptyWave', waveIndex: 1, blockId: null, type: null },
    ]);
  });
});

describe('validateWaveConfigs', () => {
  it('reports a negative group delay that the timeline itself clamps away', () => {
    const config: WaveConfig = { reward: 10, enemies: [{ type: 'normal', count: 1, delay: -500 }] };
    const issues = validateWaveConfigs([config]);
    expect(issues.map((issue) => issue.code)).toEqual(['negativeDelay']);
    expect(issues[0]).toEqual({ code: 'negativeDelay', waveIndex: 0, blockId: 'normal#0', type: 'normal' });
    // 只看時間軸的話這個存檔是「乾淨」的，問題只存在於原始 delay
    expect(validateTimeline(configsToTimelineWaves([config]))).toEqual([]);
  });

  it('reports blockId as the config group index, not the per-type ordinal', () => {
    const config: WaveConfig = {
      reward: 0,
      enemies: [
        { type: 'normal', count: 1, delay: 0 },
        { type: 'fast', count: 1, delay: 0 },
        { type: 'normal', count: 1, delay: -100 },
      ],
    };
    const issues = validateWaveConfigs([config]);
    expect(issues.map((issue) => issue.code)).toEqual(['negativeDelay']);
    // 現行契約：blockId 取 config 的全域組序（groupIndex），同型 ordinal 在時間軸上是 normal#1。
    // 兩者同值只在「同型沒有重複出現」時成立；若實作改成 ordinal，這一行要同步改。
    expect(issues[0].blockId).toBe('normal#2');
    expect(issues[0].type).toBe('normal');
  });

  it('reports unknownEnemy through the optional lookup', () => {
    const config: WaveConfig = { reward: 0, enemies: [{ type: 'phantom', count: 1, delay: 0 }] };
    const issues = validateWaveConfigs([config], partialLookup);
    expect(issues.map((issue) => issue.code)).toEqual(['unknownEnemy']);
    expect(issues[0].blockId).toBe('phantom#0');
  });
});

describe('timeline operations', () => {
  it('clamps moveBlock to zero and recomputes duration without mutating the input', () => {
    expect(baseWave.durationMs).toBe(3 * SPAWN);

    const dragged = moveBlock(baseWave, 'fast#0', -900);
    expect(blockOf(dragged, 'fast#0').startMs).toBe(0);
    expect(dragged.durationMs).toBe(2 * SPAWN);
    expect(blockOf(baseWave, 'fast#0').startMs).toBe(2 * SPAWN);

    const later = moveBlock(baseWave, 'fast#0', 2 * SPAWN + FOLLOW_DELAY);
    expect(blockOf(later, 'fast#0').startMs).toBe(2 * SPAWN + FOLLOW_DELAY);
    expect(later.durationMs).toBe(3 * SPAWN + FOLLOW_DELAY);
  });

  it('rounds fractional moveBlock targets', () => {
    expect(blockOf(moveBlock(baseWave, 'fast#0', 1234.6), 'fast#0').startMs).toBe(1235);
  });

  it('clamps resizeBlock count to zero and recomputes duration both ways', () => {
    const grown = resizeBlock(baseWave, 'normal#0', 4);
    expect(blockOf(grown, 'normal#0').count).toBe(4);
    expect(grown.durationMs).toBe(4 * SPAWN);

    const shrunk = resizeBlock(baseWave, 'normal#0', -2);
    expect(blockOf(shrunk, 'normal#0').count).toBe(0);
    expect(shrunk.durationMs).toBe(3 * SPAWN);
  });

  it('appends a block at the wave tail and increments the per-type ordinal', () => {
    const appended = appendBlock(baseWave, 'fast');
    const fast = blockOf(appended, 'fast#1');
    expect(fast.startMs).toBe(baseWave.durationMs);
    expect(fast.count).toBe(1);
    expect(appended.durationMs).toBe(baseWave.durationMs + SPAWN);
    expect(blocksOfType(appended, 'fast').map((block) => block.id)).toEqual(['fast#0', 'fast#1']);

    const newType = appendBlock(baseWave, 'elite', 3);
    expect(blockOf(newType, 'elite#0').startMs).toBe(baseWave.durationMs);
    expect(newType.durationMs).toBe(baseWave.durationMs + 3 * SPAWN);
  });

  it('keeps block ids unique after removing a middle block and appending again', () => {
    const twoFasts = appendBlock(baseWave, 'fast');
    const removed = removeBlock(twoFasts, 'fast#0');
    expect(blocksOfType(removed, 'fast').map((block) => block.id)).toEqual(['fast#1']);

    // 這一列只剩 fast#1，序號必須取「現有最大 + 1」，不能退回長度 1 撞出重複 id
    const again = appendBlock(removed, 'fast');
    expect(blocksOfType(again, 'fast').map((block) => block.id)).toEqual(['fast#1', 'fast#2']);
  });

  it('removes a block and drops its row once that row is empty', () => {
    const withoutFast = removeBlock(baseWave, 'fast#0');
    expect(withoutFast.rows.map((row) => row.type)).toEqual(['normal']);
    expect(blocksOfType(withoutFast, 'fast')).toEqual([]);
    expect(withoutFast.durationMs).toBe(2 * SPAWN);

    const withoutNormal = removeBlock(baseWave, 'normal#0');
    expect(withoutNormal.rows.map((row) => row.type)).toEqual(['fast']);
    expect(withoutNormal.durationMs).toBe(3 * SPAWN);
  });
});

describe('delayOf / setDelay', () => {
  const wave = waveConfigToTimeline(FIXTURE[0], 0);

  it('reports the group delay as the gap after the previous block end', () => {
    expect(delayOf(wave, 'normal#0')).toBe(0);
    expect(delayOf(wave, 'fast#0')).toBe(FIXTURE[0].enemies[1].delay);
    expect(delayOf(wave, 'normal#1')).toBe(0);
  });

  it('clamps a negative delay to the previous block end instead of overlapping', () => {
    const pushed = setDelay(wave, 'fast#0', -500);
    expect(blockOf(pushed, 'fast#0').startMs).toBe(blockEndMs(blockOf(pushed, 'normal#0')));
    expect(delayOf(pushed, 'fast#0')).toBe(0);
    // 往前推不會製造重疊
    expect(validateTimeline([pushed])).toEqual([]);
  });

  it('moves the block forward by the requested delay and recomputes duration', () => {
    const delayed = setDelay(wave, 'fast#0', 2 * SPAWN);
    expect(blockOf(delayed, 'fast#0').startMs).toBe(2 * SPAWN + 2 * SPAWN);
    expect(delayOf(delayed, 'fast#0')).toBe(2 * SPAWN);
    expect(delayed.durationMs).toBe(blockEndMs(blockOf(delayed, 'normal#1')));
  });

  it('ignores an unknown block id', () => {
    expect(setDelay(wave, 'ghost#9', SPAWN)).toEqual(wave);
  });
});

describe('flattenWave / recomputeDuration / enemyLabel', () => {
  it('flattens every row into one startMs-ordered list', () => {
    expect(flattenWave(waveConfigToTimeline(FIXTURE[0], 0)).map((block) => block.id)).toEqual([
      'normal#0',
      'fast#0',
      'normal#1',
    ]);
  });

  it('recomputes duration from the last block end without mutating the input', () => {
    const stale: TimelineWave = { ...baseWave, durationMs: 0 };
    expect(recomputeDuration(stale).durationMs).toBe(3 * SPAWN);
    expect(stale.durationMs).toBe(0);
  });

  it('prefers a custom label, then the official name, then the raw type', () => {
    expect(enemyLabel('normal', { normal: 'Custom Normal' })).toBe('Custom Normal');
    expect(enemyLabel('normal')).toBe(ENEMY_DATA.normal.name);
    expect(enemyLabel('phantom')).toBe('phantom');
  });
});

describe('summarizeWave', () => {
  it('sums enemy count, total hp and kill rewards', () => {
    const wave = waveConfigToTimeline({
      reward: 99,
      enemies: [
        { type: 'normal', count: 2, delay: 0 },
        { type: 'fast', count: 3, delay: 0 },
      ],
    });
    expect(summarizeWave(wave, lookup)).toEqual({
      enemyCount: 5,
      totalHp: 350,
      totalReward: 35,
      durationMs: 5 * SPAWN,
    });
  });

  it('counts enemies the lookup cannot resolve without inventing hp or reward', () => {
    const wave = waveConfigToTimeline({ reward: 0, enemies: [{ type: 'phantom', count: 2, delay: 0 }] });
    expect(summarizeWave(wave, lookup)).toEqual({
      enemyCount: 2,
      totalHp: 0,
      totalReward: 0,
      durationMs: 2 * SPAWN,
    });
  });
});
