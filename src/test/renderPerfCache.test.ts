/**
 * 渲染層的兩項去重（狀態環合批 + 每幀快取）
 *
 * 背景：壓測（7,587 敵人）時，狀態環是 canvas 呼叫量最大的來源之一
 * （每隻敵人 × 每個狀態各一次 save/arc/stroke/restore），
 * 而 jammer 光環在一幀內被 4 個地方各掃一次全部敵人。
 */
import { describe, expect, it } from 'vitest';
import { createStatusRingBatch } from '@/components/scenes/game-scene/GameCanvasStatusRings';
import { collectJammerAuras, collectJammerAurasCached } from '@/data/jammerAura';
import { getEnemyVisuals } from '@/store/gameStoreUtils';
import { makeEnemy } from '@/test/fixtures';
import type { StatusEffect } from '@/types/game';

const effect = (type: string): StatusEffect => ({
  type: type as StatusEffect['type'],
  value: 0,
  duration: 1000,
  startTime: 0,
});

const makeCtx = () => {
  const counters = { beginPath: 0, arc: 0, stroke: 0, setLineDash: 0 };
  const ctx = new Proxy(
    {},
    {
      get: (_t, prop) => {
        const name = String(prop);
        if (name in counters) return () => { counters[name as keyof typeof counters] += 1; };
        return () => {};
      },
      set: () => true,
    },
  );
  return { ctx: ctx as unknown as CanvasRenderingContext2D, counters };
};

describe('狀態環合批', () => {
  it('同色同虛線的環只 stroke 一次，但每個環仍各有一個 arc', () => {
    const { ctx, counters } = makeCtx();
    const batch = createStatusRingBatch();

    // 三隻敵人都中毒（同一個顏色群組）
    for (let i = 0; i < 3; i++) {
      const enemy = makeEnemy({ id: `e${i}`, effects: [effect('poison')] });
      batch.add(enemy, 10 + i, 20, 8, 1000);
    }

    expect(batch.ringCount).toBe(3);
    batch.flush(ctx);

    expect(counters.stroke).toBe(1);
    expect(counters.arc).toBe(3);
    expect(counters.beginPath).toBe(1);
  });

  it('不同顏色分成不同群組，各自一次 stroke', () => {
    const { ctx, counters } = makeCtx();
    const batch = createStatusRingBatch();

    batch.add(makeEnemy({ id: 'a', effects: [effect('poison')] }), 1, 1, 8, 1000);
    batch.add(makeEnemy({ id: 'b', effects: [effect('burn')] }), 2, 2, 8, 1000);
    batch.add(makeEnemy({ id: 'c', effects: [effect('slow')] }), 3, 3, 8, 1000);

    batch.flush(ctx);

    expect(counters.stroke).toBe(3);
    expect(counters.arc).toBe(3);
  });

  it('同一隻敵人多個狀態 → 多個環，但同色群組仍合併', () => {
    const { ctx } = makeCtx();
    const batch = createStatusRingBatch();

    batch.add(
      makeEnemy({ id: 'multi', effects: [effect('poison'), effect('burn'), effect('slow')] }),
      5, 5, 10, 1000,
    );

    expect(batch.ringCount).toBe(3);
    batch.flush(ctx);
    // flush 後批次清空，可重複使用
    expect(batch.ringCount).toBe(0);
  });

  it('沒有狀態也沒有位移時完全不產生環（不浪費 stroke）', () => {
    const { ctx, counters } = makeCtx();
    const batch = createStatusRingBatch();

    batch.add(makeEnemy({ id: 'clean', effects: [] }), 0, 0, 8, 1000);

    expect(batch.ringCount).toBe(0);
    batch.flush(ctx);
    expect(counters.stroke).toBe(0);
  });

  it('位移（風塔吹飛）也算一個環', () => {
    const { ctx, counters } = makeCtx();
    const batch = createStatusRingBatch();

    batch.add(makeEnemy({ id: 'blown', effects: [], isDisplaced: true }), 0, 0, 8, 1000);
    batch.flush(ctx);

    expect(counters.stroke).toBe(1);
  });
});

describe('jammer 光環每幀快取', () => {
  it('同一個敵人陣列只算一次（回傳同一個參考）', () => {
    const enemies = [
      makeEnemy({ id: 'a', type: 'jammer' }),
      makeEnemy({ id: 'b', type: 'normal' }),
    ];

    const first = collectJammerAurasCached(enemies, {});
    const second = collectJammerAurasCached(enemies, {});

    expect(second).toBe(first);
  });

  it('陣列換了（下一幀）就重新計算', () => {
    const frame1 = [makeEnemy({ id: 'a', type: 'jammer' })];
    const frame2 = [makeEnemy({ id: 'a', type: 'jammer' })];

    const first = collectJammerAurasCached(frame1, {});
    const second = collectJammerAurasCached(frame2, {});

    expect(second).not.toBe(first);
  });

  it('快取結果與非快取版本一致', () => {
    const enemies = [makeEnemy({ id: 'a', type: 'jammer' })];
    const lookup = {
      jammer: { ability: 'jam', jamRadius: 80, jamFireRateMult: 0.5 },
    };

    expect(collectJammerAurasCached(enemies, lookup)).toEqual(collectJammerAuras(enemies, lookup));
  });
});

describe('getEnemyVisuals 不再每幀配置物件', () => {
  it('同一種敵人重複呼叫回傳同一個物件', () => {
    const a = getEnemyVisuals('tank');
    const b = getEnemyVisuals('tank');
    expect(b).toBe(a);
  });

  it('不同種類各自一份', () => {
    expect(getEnemyVisuals('normal')).not.toBe(getEnemyVisuals('boss'));
  });

  it('未知型別回退到共用預設值（不會每次新建）', () => {
    const a = getEnemyVisuals('__not_a_real_enemy__');
    const b = getEnemyVisuals('__another_missing__');
    expect(b).toBe(a);
    expect(a.modelType).toBe('normal');
  });
});
