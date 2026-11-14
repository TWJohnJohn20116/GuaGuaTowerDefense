/**
 * 靜態層重繪條件（B + D）
 *
 * 背景：GameCanvas 的靜態層 effect 原本依賴 `towers` 與 `money`。
 * 但 `updateTowers` 每幀都產生新的 towers 陣列、`money` 每殺一隻就變一次，
 * 於是靜態層（地板 + 165 格 + 射程圈 + 多選高亮 + 協同預覽）
 * **每秒重繪 60 次**，等於整張畫面每幀畫兩遍。
 *
 * 這裡鎖住兩個 selector 的語意：
 *   towerLayoutKey      → 只有「結構」變了才換值（轉向/開火時間不算）
 *   canAffordSelected   → 只有跨過金額門檻才換值（錢的絕對值不算）
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from '@/store/gameStore';
import {
  canAffordSelectedSelector,
  towerLayoutKeySelector,
} from '@/components/scenes/game-scene/GameCanvas';
import { makeEnemy, makeTower } from '@/test/fixtures';

const key = () => towerLayoutKeySelector(useGameStore.getState());

describe('靜態層重繪的觸發條件', () => {
  beforeEach(() => {
    useGameStore.setState({
      towers: [makeTower({ id: 'a', type: 'basic', gridPos: { col: 3, row: 4 } })],
      money: 1000,
      selectedTowerType: 'basic',
    });
  });

  it('只有轉向 / 開火時間 / 目標改變時，簽章不變（不重繪）', () => {
    const before = key();
    const [tower] = useGameStore.getState().towers;

    useGameStore.setState({
      towers: [{
        ...tower,
        rotation: 1.234,
        lastFireTime: Date.now(),
        lastAttackTime: Date.now(),
        target: makeEnemy({ id: 'e1' }),
        totalDamage: 999,
        kills: 7,
      }],
    });

    expect(key()).toBe(before);
  });

  it('升級、鎖定、換位置、增減塔都會讓簽章改變（要重繪）', () => {
    const before = key();
    const [tower] = useGameStore.getState().towers;

    useGameStore.setState({ towers: [{ ...tower, level: 2, upgradePath: 'A' }] });
    const afterLevel = key();
    expect(afterLevel).not.toBe(before);

    useGameStore.setState({ towers: [{ ...tower, locked: true }] });
    expect(key()).not.toBe(afterLevel);

    useGameStore.setState({ towers: [{ ...tower, gridPos: { col: 9, row: 1 } }] });
    expect(key()).not.toBe(afterLevel);

    useGameStore.setState({ towers: [] });
    expect(key()).toBe('');
  });

  it('金錢在同一個門檻內變動，不會觸發靜態層重繪', () => {
    // basic 造價 100
    useGameStore.setState({ selectedTowerType: 'basic', money: 100 });
    expect(canAffordSelectedSelector(useGameStore.getState())).toBe(true);

    useGameStore.setState({ money: 250 });
    expect(canAffordSelectedSelector(useGameStore.getState())).toBe(true);

    useGameStore.setState({ money: 99 });
    expect(canAffordSelectedSelector(useGameStore.getState())).toBe(false);

    useGameStore.setState({ money: 0 });
    expect(canAffordSelectedSelector(useGameStore.getState())).toBe(false);
  });

  it('沒有選塔時永遠是「買不起」（不會亮起藍色可放置提示）', () => {
    useGameStore.setState({ selectedTowerType: null, money: 999999 });
    expect(canAffordSelectedSelector(useGameStore.getState())).toBe(false);
  });
});
