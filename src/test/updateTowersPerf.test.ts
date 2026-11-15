/**
 * updateTowers 冷卻快路徑的效能對照（壓測場景形狀）
 *
 * 這條測試不是要比絕對毫秒（跑在 jsdom 裡、機器不同就差很多），
 * 而是鎖住「快路徑真的比完整掃描便宜一個量級」這件事：
 * 如果有人把冷卻判斷移回掃描後面，這裡會立刻紅。
 */
import { describe, expect, it } from 'vitest';
import { useGameStore } from '@/store/gameStore';
import { DEFAULT_PATH, DIFFICULTY_MODIFIERS, PATHS } from '@/data/gameData';
import { makeEnemy, makeTower } from '@/test/fixtures';
import type { Enemy, Tower } from '@/types/game';

const ENEMY_COUNT = 4_500;
const TOWER_COUNT = 100;

const buildScene = (): { enemies: Enemy[]; towers: Tower[] } => {
  const enemies: Enemy[] = [];
  for (let i = 0; i < ENEMY_COUNT; i++) {
    enemies.push(
      makeEnemy({
        id: `e${i}`,
        // 鋪在整張圖上，密度接近壓測畫面（15×11 格塞 4,500 隻）
        x: (i % 150) / 10,
        y: Math.floor(i / 150) / 10,
        health: 500,
        maxHealth: 500,
        speed: 0,
      }),
    );
  }

  const towers: Tower[] = [];
  for (let i = 0; i < TOWER_COUNT; i++) {
    towers.push(
      makeTower({
        id: `t${i}`,
        type: 'basic',
        pos: { x: (i % 15) + 0.5, y: Math.floor(i / 15) + 0.5 },
        rotation: 0,
      }),
    );
  }

  useGameStore.setState({
    scene: 'game',
    selectedPath: DEFAULT_PATH,
    activeMap: PATHS[DEFAULT_PATH] ?? null,
    enemies,
    towers,
    projectiles: [],
    money: 100000,
    currentWave: 1,
    difficultyModifiers: DIFFICULTY_MODIFIERS.normal,
    activeProtocol: null,
  });

  return { enemies, towers };
};

const measure = (frames: number, forceReady: boolean): number => {
  const started = performance.now();
  for (let i = 0; i < frames; i++) {
    if (forceReady) {
      // 讓每座塔都「可以開火」→ 走完整掃描路徑（等同舊行為）
      useGameStore.setState((s) => ({
        towers: s.towers.map((t) => ({ ...t, lastFireTime: 0 })),
        projectiles: [],
      }));
    }
    useGameStore.getState().updateTowers(16);
  }
  return (performance.now() - started) / frames;
};

describe('updateTowers 冷卻快路徑效能', () => {
  it(`冷卻中的幀應該明顯便宜於可開火的幀（${ENEMY_COUNT} 敵人 × ${TOWER_COUNT} 塔）`, () => {
    buildScene();

    // 先暖機，避免第一幀的 JIT / 快取影響
    measure(2, false);

    const cooldownMs = measure(8, false);
    const readyMs = measure(8, true);

    console.log(
      `[updateTowers] 冷卻中 ${cooldownMs.toFixed(2)}ms/幀 · 可開火 ${readyMs.toFixed(2)}ms/幀 ` +
        `(${((readyMs / cooldownMs) || 0).toFixed(1)}×)`,
    );

    // 冷卻期不該再掃描射程內全部敵人：至少要比全掃便宜一半，
    // 實測通常是一個數量級以上，這裡留足空間避免機器差異造成假紅。
    expect(cooldownMs).toBeLessThan(readyMs * 0.5);
  });
});
