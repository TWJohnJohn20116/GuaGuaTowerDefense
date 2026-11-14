/**
 * 渲染 snapshot 契約測試
 *
 * 這個純函式層的存在理由是「2D 與 3D 每幀吃同一份資料」，
 * 所以測試聚焦在三件事：
 *  1. 投影正確（血條比例、尺寸、護盾、出生時間、狀態色調…）
 *  2. 2D / 3D 兩個消費者拿到的值必然相同（同一 source + now → 相同投影）
 *  3. 逐幀重寫不配置新 slot（緩衝重用），這是 §6 的效能前提
 */

import { describe, it, expect } from 'vitest';
import { createRenderSnapshot, writeRenderSnapshot } from '@/data/renderSnapshot';
import { makeEnemy } from './fixtures';

describe('renderSnapshot 投影', () => {
  it('把敵人基本欄位投影成渲染 frame', () => {
    const snapshot = createRenderSnapshot();
    const enemy = makeEnemy({ id: 'e1', type: 'tank', x: 3.5, y: 7.25, size: 60, health: 120, maxHealth: 300 });

    writeRenderSnapshot({ enemies: [enemy] }, snapshot, 1000);

    expect(snapshot.enemyCount).toBe(1);
    expect(snapshot.timeMs).toBe(1000);
    const frame = snapshot.enemies[0];
    expect(frame.id).toBe('e1');
    expect(frame.type).toBe('tank');
    expect(frame.x).toBe(3.5);
    expect(frame.y).toBe(7.25);
    expect(frame.size).toBe(60);
    expect(frame.healthRatio).toBeCloseTo(0.4);
    expect(frame.baseColor).toBeTruthy();
  });

  it('血量與護盾比例夾在 0~1，沒有護盾上限時為 0', () => {
    const snapshot = createRenderSnapshot();
    writeRenderSnapshot(
      {
        enemies: [
          makeEnemy({ id: 'over', health: 500, maxHealth: 100 }),
          makeEnemy({ id: 'under', health: -50, maxHealth: 100, shield: 3 }),
        ],
      },
      snapshot,
      0,
    );

    expect(snapshot.enemies[0].healthRatio).toBe(1);
    expect(snapshot.enemies[1].healthRatio).toBe(0);
    expect(snapshot.enemies[1].shieldRatio).toBe(0);
  });

  it('護盾比例以 maxShield 為分母', () => {
    const snapshot = createRenderSnapshot();
    writeRenderSnapshot(
      { enemies: [makeEnemy({ id: 's', shield: 25, maxShield: 100 })] },
      snapshot,
      0,
    );
    expect(snapshot.enemies[0].shieldRatio).toBeCloseTo(0.25);
  });

  it('spawnAgeMs 由 now 與 spawnTime 推出；沒有 spawnTime 時為 -1', () => {
    const snapshot = createRenderSnapshot();
    writeRenderSnapshot(
      {
        enemies: [
          makeEnemy({ id: 'born', spawnTime: 1500 }),
          makeEnemy({ id: 'no-spawn-time' }),
        ],
      },
      snapshot,
      2000,
    );

    expect(snapshot.enemies[0].spawnAgeMs).toBe(500);
    expect(snapshot.enemies[1].spawnAgeMs).toBe(-1);
  });

  it('狀態色調取最高優先序（freeze 優先於 burn）', () => {
    const snapshot = createRenderSnapshot();
    writeRenderSnapshot(
      {
        enemies: [
          makeEnemy({
            id: 'both',
            effects: [
              { type: 'burn', duration: 1000, startTime: 0 },
              { type: 'freeze', duration: 1000, startTime: 0 },
            ],
          }),
        ],
      },
      snapshot,
      100,
    );

    expect(snapshot.enemies[0].statusTint).toBe(0x93c5fd);
    expect(snapshot.enemies[0].statusTintMix).toBeCloseTo(0.65);
  });

  it('沒有狀態時不帶色調', () => {
    const snapshot = createRenderSnapshot();
    writeRenderSnapshot({ enemies: [makeEnemy({ id: 'plain' })] }, snapshot, 0);
    expect(snapshot.enemies[0].statusTint).toBe(0);
  });

  it('冰凍期間主動光環視為被壓制，效果過期後解除', () => {
    const snapshot = createRenderSnapshot();
    const enemy = makeEnemy({
      id: 'frozen',
      effects: [{ type: 'freeze', duration: 1000, startTime: 0 }],
    });

    writeRenderSnapshot({ enemies: [enemy] }, snapshot, 500);
    expect(snapshot.enemies[0].abilitySuppressed).toBe(true);

    writeRenderSnapshot({ enemies: [enemy] }, snapshot, 2000);
    expect(snapshot.enemies[0].abilitySuppressed).toBe(false);
  });

  it('隱身型敵人進入隱身期後 ghostFade 升起', () => {
    const snapshot = createRenderSnapshot();
    const enemy = makeEnemy({ id: 'stealth', type: 'stealth', spawnTime: 0 });

    writeRenderSnapshot({ enemies: [enemy] }, snapshot, 100);
    const visibleFade = snapshot.enemies[0].ghostFade;

    // stealthCooldown 預設 5000ms：過了冷卻即進入隱身期
    writeRenderSnapshot({ enemies: [enemy] }, snapshot, 6000);
    const stealthFade = snapshot.enemies[0].ghostFade;

    expect(visibleFade).toBe(0);
    expect(stealthFade).toBeGreaterThan(0.9);
    expect(snapshot.enemies[0].ghostFade).toBe(
      Math.max(snapshot.enemies[0].stealthFade, snapshot.enemies[0].phaseFade),
    );
  });
});

describe('renderSnapshot 共用與緩衝重用', () => {
  it('同一份 source + now，兩個緩衝投影出完全相同的結果（2D/3D 同源）', () => {
    const enemies = [
      makeEnemy({ id: 'a', type: 'fast', x: 1, y: 2, health: 30, maxHealth: 100, spawnTime: 0 }),
      makeEnemy({
        id: 'b',
        type: 'shield',
        x: 4,
        y: 5,
        shield: 10,
        maxShield: 20,
        effects: [{ type: 'slow', duration: 500, startTime: 0 }],
      }),
    ];

    const for2d = writeRenderSnapshot({ enemies }, createRenderSnapshot(), 200);
    const for3d = writeRenderSnapshot({ enemies }, createRenderSnapshot(), 200);

    expect(for3d.enemies.slice(0, for3d.enemyCount)).toEqual(
      for2d.enemies.slice(0, for2d.enemyCount),
    );
  });

  it('逐幀重寫沿用同一批 slot，不會每幀配置新物件', () => {
    const snapshot = createRenderSnapshot(2);
    const enemies = [makeEnemy({ id: 'a' }), makeEnemy({ id: 'b' })];

    writeRenderSnapshot({ enemies }, snapshot, 0);
    const firstSlot = snapshot.enemies[0];

    writeRenderSnapshot({ enemies }, snapshot, 16);
    expect(snapshot.enemies[0]).toBe(firstSlot);
    expect(snapshot.frameId).toBe(2);
  });

  it('敵人數下降時 enemyCount 跟著降，舊 slot 不計入', () => {
    const snapshot = createRenderSnapshot();
    writeRenderSnapshot(
      { enemies: [makeEnemy({ id: 'a' }), makeEnemy({ id: 'b' })] },
      snapshot,
      0,
    );
    writeRenderSnapshot({ enemies: [makeEnemy({ id: 'a' })] }, snapshot, 16);

    expect(snapshot.enemyCount).toBe(1);
    expect(snapshot.enemies.length).toBeGreaterThanOrEqual(2);
  });
});
