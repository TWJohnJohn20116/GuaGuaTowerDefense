// 遊戲迴圈：擊殺敵人結算（金錢/分數/成就/統計 + 死亡動畫）
import { useAchievementStore } from '../achievementStore';
import { useStatsStore } from '../statsStore';
import type { GetState, SetState } from './shared';
import { playEnemyDeath } from '@/services/audioService';
import { collectMoneyAuras, getKillBountyBonus } from '@/data/moneyAura';

export const createRemoveEnemy =
  (get: GetState, set: SetState) =>
  (id: string) => {
    const { enemies, money, score, addDeathAnimation, towers } = get();
    const enemy = enemies.find(e => e.id === id);
    if (!enemy) return;

    const bounty = getKillBountyBonus(
      enemy.x,
      enemy.y,
      enemy.reward,
      collectMoneyAuras(towers),
    );
    const gained = enemy.reward + bounty;

    set({
      enemies: enemies.filter(e => e.id !== id),
      money: money + gained,
      score: score + enemy.reward,
    });

    // 觸發死亡動畫
    if (addDeathAnimation) addDeathAnimation(enemy);
    playEnemyDeath(); // 擊殺音（自帶節流）
    if (bounty > 0) get().addMoneyText(enemy.x, enemy.y, bounty, true);

    // 追蹤成就（直接同步調用，避免 dynamic import 的 microtask 開銷）
    const isBoss = enemy.type === 'boss' || enemy.type === 'miniboss';
    const achStore = useAchievementStore.getState();
    achStore.onEnemyKilled(enemy.type, isBoss, enemy.maxHealth);
    achStore.onMoneyEarned(gained);

    // 追蹤統計
    useStatsStore.getState().trackEnemyKilled(enemy.type);
  };
