/**
 * updateTowers 冷卻期快路徑
 *
 * 背景：壓測顯示 updateTowers 佔 18.3ms／幀（101 塔 × 4,530 敵人），
 * 但其中約 94% 的幀其實「開不了火」，舊版仍然完整掃描射程內所有敵人、
 * 塞進陣列再依優先級逐一比較，全部是白工。
 *
 * 這裡鎖住三件事，確保快路徑沒有改變任何玩法：
 *   1. 冷卻中不產生子彈，但槍口仍會轉向目標
 *   2. 冷卻結束就正常開火（不是被永久跳過）
 *   3. 火焰塔是「每幀持續輸出」，不受冷卻影響，絕不能被跳過
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from '@/store/gameStore';
import { initializeGrid } from '@/store/gameStoreUtils';
import { DEFAULT_PATH, DIFFICULTY_MODIFIERS } from '@/data/gameData';
import { makeEnemy, makeSkill, makeTower } from '@/test/fixtures';
import type { Enemy, Tower } from '@/types/game';

const FRAME_MS = 16;

const setup = (towers: Tower[], enemies: Enemy[]) => {
  useGameStore.setState({
    scene: 'game',
    selectedPath: DEFAULT_PATH,
    grid: initializeGrid(DEFAULT_PATH),
    towers,
    enemies,
    projectiles: [],
    enemiesRemaining: enemies.length,
    money: 1000,
    currentWave: 1,
    difficultyModifiers: DIFFICULTY_MODIFIERS.normal,
    mutatorRules: null,
    activeProtocol: null,
  });
};

/** 一隻站在塔正上方一格的普通敵人（x/y 是格子座標） */
const enemyNear = (id: string, col: number, row: number): Enemy =>
  makeEnemy({ id, x: col + 0.5, y: row - 1, health: 500, maxHealth: 500, speed: 0 });

describe('updateTowers 冷卻期快路徑', () => {
  beforeEach(() => {
    useGameStore.setState({ isGameOver: false });
  });

  it('冷卻中：不發射子彈，但槍口仍朝目標轉動', () => {
    const tower = makeTower({
      id: 't-cool',
      type: 'basic',
      gridPos: { col: 5, row: 5 },
      rotation: 0,
      // 剛開過火 → 冷卻中
      lastFireTime: Date.now(),
    });
    setup([tower], [enemyNear('e1', 5, 5)]);

    useGameStore.getState().updateTowers(FRAME_MS);

    const after = useGameStore.getState();
    expect(after.projectiles).toHaveLength(0);
    // 目標在正上方 → 目標角度 -π/2，旋轉應該往負方向走
    expect(after.towers[0].rotation).toBeLessThan(0);
    // 快路徑也要把 target 寫回去，否則槍口會空指
    expect(after.towers[0].target?.id).toBe('e1');
  });

  it('冷卻結束：正常開火（沒有被快路徑永久跳過）', () => {
    const tower = makeTower({
      id: 't-ready',
      type: 'basic',
      gridPos: { col: 5, row: 5 },
      rotation: 0,
      lastFireTime: 0, // 很久沒開火 → 本幀可以射
    });
    setup([tower], [enemyNear('e1', 5, 5)]);

    useGameStore.getState().updateTowers(FRAME_MS);

    const after = useGameStore.getState();
    expect(after.projectiles.length).toBeGreaterThan(0);
    expect(after.towers[0].lastFireTime).toBeGreaterThan(0);
  });

  it('火焰塔：即使「剛攻擊過」仍每幀持續輸出（不受冷卻限制）', () => {
    const tower = makeTower({
      id: 't-flame',
      type: 'flame',
      gridPos: { col: 5, row: 5 },
      rotation: 0,
      lastFireTime: Date.now(), // 若被誤判成「冷卻中就跳過」，這隻敵人不會掉血
      skill: makeSkill({ skillId: 'inferno' }),
    });
    const enemy = enemyNear('e1', 5, 5);
    setup([tower], [enemy]);

    useGameStore.getState().updateTowers(FRAME_MS);

    const after = useGameStore.getState();
    expect(after.enemies[0].health).toBeLessThan(enemy.health);
    expect(after.towers[0].totalDamage).toBeGreaterThan(0);
  });

  it('目標離開射程後，冷卻中的塔不再鎖著它', () => {
    const tower = makeTower({
      id: 't-lost',
      type: 'basic',
      gridPos: { col: 5, row: 5 },
      rotation: 0,
      lastFireTime: Date.now(),
    });
    // 敵人站在 10 格外，遠超過 basic 的 4 格射程
    setup([tower], [makeEnemy({ id: 'far', x: 14.5, y: 0.5, speed: 0 })]);

    useGameStore.getState().updateTowers(FRAME_MS);

    const after = useGameStore.getState();
    expect(after.towers[0].target).toBeNull();
    expect(after.towers[0].rotation).toBe(0);
  });
});
