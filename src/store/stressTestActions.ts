/**
 * 壓力測試動作（只在 Dev 面板使用）
 *
 * 刻意做成「一次 set」：10,000 隻敵人如果走 10,000 次 spawnEnemy，
 * 光是 state 更新就會先卡死自己，量到的不是遊戲負載而是我們自己的寫法。
 */
import { PATHS } from '@/data/gameData';
import {
  buildStressEnemies,
  buildStressTowers,
  STRESS_DEFAULT_ENEMIES,
  STRESS_DEFAULT_TOWERS,
  STRESS_ENEMY_ID_PREFIX,
  STRESS_TOWER_ID_PREFIX,
} from '@/data/stressTest';
import { sampleBuildablePoints } from '@/data/mapGeometry';
import type { GameStore } from './gameStoreTypes';

type GetState = () => GameStore;
type SetState = (partial: Partial<GameStore>) => void;

export interface StressSpawnResult {
  enemies: number;
  towers: number;
  /** 想要 100 座、但地圖空格不足時，這裡會是實際數量 */
  reason?: 'not-in-game' | 'no-path';
}

const countWithPrefix = (ids: readonly string[], prefix: string): number =>
  ids.reduce((sum, id) => (id.startsWith(prefix) ? sum + 1 : sum), 0);

export const createStressTestActions = (get: GetState, set: SetState) => ({
  /**
   * 一鍵灌入壓測實體。
   * 敵人整批取代（壓測要的是乾淨的負載基線），塔則接在現有塔後面。
   */
  spawnStressEntities: (
    enemyCount: number = STRESS_DEFAULT_ENEMIES,
    towerCount: number = STRESS_DEFAULT_TOWERS,
  ): StressSpawnResult => {
    const state = get();
    if (state.scene !== 'game') return { enemies: 0, towers: 0, reason: 'not-in-game' };

    const path = PATHS[state.selectedPath];
    const enemies = buildStressEnemies({ count: enemyCount, path });
    if (enemies.length === 0) return { enemies: 0, towers: 0, reason: 'no-path' };

    const positions = sampleBuildablePoints(state.activeMap, towerCount);
    const newTowers = buildStressTowers(positions);

    const towers = [...state.towers, ...newTowers];

    set({
      enemies,
      towers,
      // 壓測期間不要有波次生成干擾，也不要因為場上 0 敵人被判定「本波清空」
      waveActive: false,
      allEnemiesSpawned: true,
      isGameOver: false,
      selectedTower: null,
      multiSelectedTowerIds: [],
    });

    return { enemies: enemies.length, towers: newTowers.length };
  },

  /** 清掉壓測實體（靠固定 id 前綴辨識），不影響玩家自己放的塔 */
  clearStressEntities: (): StressSpawnResult => {
    const state = get();

    const enemies = state.enemies.filter((e) => !e.id.startsWith(STRESS_ENEMY_ID_PREFIX));
    const stressTowers = state.towers.filter((t) => t.id.startsWith(STRESS_TOWER_ID_PREFIX));
    const towers = state.towers.filter((t) => !t.id.startsWith(STRESS_TOWER_ID_PREFIX));

    const deadIds = new Set(stressTowers.map((t) => t.id));

    set({
      enemies,
      towers,
      selectedTower:
        state.selectedTower && deadIds.has(state.selectedTower.id) ? null : state.selectedTower,
      multiSelectedTowerIds: state.multiSelectedTowerIds.filter((id) => !deadIds.has(id)),
    });

    return { enemies: enemies.length, towers: towers.length };
  },

  /** 目前場上有多少壓測實體（給 UI 顯示用） */
  countStressEntities: (): { enemies: number; towers: number } => {
    const state = get();
    return {
      enemies: countWithPrefix(state.enemies.map((e) => e.id), STRESS_ENEMY_ID_PREFIX),
      towers: countWithPrefix(state.towers.map((t) => t.id), STRESS_TOWER_ID_PREFIX),
    };
  },
});
