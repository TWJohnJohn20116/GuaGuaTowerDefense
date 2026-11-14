/**
 * 商店系統狀態管理
 * Shop System State Management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TowerType } from '@/types/game';
import type { PlayerSkillId } from '@/data/playerSkillData';

// 塔的商店價格（用金幣購買解鎖）
// basic 是免費的，其他塔需要用金幣解鎖
export const TOWER_SHOP_PRICES: Record<TowerType, number> = {
  basic: 0,       // 預設解鎖
  sniper: 50,     // 早期解鎖
  cannon: 100,    // 範圍傷害
  ballista: 120,  // 直線貫穿
  machine: 150,   // 高速輸出
  shotgun: 200,   // 近戰爆發
  frost: 250,     // 控場
  poison: 300,    // 持續傷害
  flame: 400,     // 強力範圍
  wind: 450,      // 擊退
  lightning: 500, // 連鎖傷害
  laser: 600,     // 終極單體
  money: 800,     // 經濟建築
  pulse: 1000,    // 大範圍爆發
  storm: 0,       // 融合塔（不可購買，由合體產生）
  plague: 0,
  demolisher: 0,
  tempest: 0,
};

// 玩家主動技能商店價格（用金幣購買解鎖）
// 一開始所有技能都是鎖定的，必須在商店購買後才能在遊戲中使用
export const PLAYER_SKILL_SHOP_PRICES: Record<PlayerSkillId, number> = {
  cashRain: 400,         // 入門：經濟回血
  lightningStorm: 600,   // 中階：清場 + 眩暈
  chainLightning: 700,   // 中階：連鎖彈跳爆發
  warpTrap: 750,         // 中階：空間位移控場
  empPulse: 720,         // 中階：破盾脈衝
  frozenTime: 800,       // 進階：全體凍結
  holyHeal: 850,         // 進階：恢復生命 + 淨化增益
  meteorStorm: 900,      // 進階：範圍轟炸 + 灼燒
  aegisBarrier: 950,     // 進階：基地免傷結界 + 衝擊減速
  battleInspire: 1000,   // 終極：全塔激勵
};

interface ShopStoreState {
  // 金幣（跨局持久化）
  coins: number;
  // 已解鎖的塔類型
  unlockedTowers: TowerType[];
  // 已解鎖的玩家主動技能
  unlockedPlayerSkills: PlayerSkillId[];
  // 累計遊戲場次
  totalGamesPlayed: number;

  // 動作
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  purchaseTower: (towerType: TowerType) => boolean;
  grantTowers: (towerTypes: TowerType[]) => TowerType[];
  isTowerUnlocked: (towerType: TowerType) => boolean;
  getTowerPrice: (towerType: TowerType) => number;
  purchasePlayerSkill: (skillId: PlayerSkillId) => boolean;
  isPlayerSkillUnlocked: (skillId: PlayerSkillId) => boolean;
  getPlayerSkillPrice: (skillId: PlayerSkillId) => number;
  incrementGamesPlayed: () => void;
  resetShop: () => void;
}

export const useShopStore = create<ShopStoreState>()(
  persist(
    (set, get) => ({
      coins: 0,
      unlockedTowers: ['basic'], // basic 預設解鎖
      unlockedPlayerSkills: [], // 一開始所有主動技能都鎖定
      totalGamesPlayed: 0,

      addCoins: (amount) => {
        set((state) => ({ coins: state.coins + amount }));
      },

      spendCoins: (amount) => {
        const { coins } = get();
        if (coins < amount) return false;
        set({ coins: coins - amount });
        return true;
      },

      purchaseTower: (towerType) => {
        const { coins, unlockedTowers } = get();
        if (unlockedTowers.includes(towerType)) return false; // 已解鎖
        const price = TOWER_SHOP_PRICES[towerType];
        if (coins < price) return false; // 金幣不足
        set({
          coins: coins - price,
          unlockedTowers: [...unlockedTowers, towerType],
        });
        return true;
      },

      grantTowers: (towerTypes) => {
        const newly: TowerType[] = [];
        set((state) => {
          const next = [...state.unlockedTowers];
          for (const towerType of towerTypes) {
            if (!next.includes(towerType)) {
              next.push(towerType);
              newly.push(towerType);
            }
          }
          return { unlockedTowers: next };
        });
        return newly;
      },

      isTowerUnlocked: (towerType) => {
        return get().unlockedTowers.includes(towerType);
      },

      getTowerPrice: (towerType) => {
        return TOWER_SHOP_PRICES[towerType];
      },

      purchasePlayerSkill: (skillId) => {
        const { coins, unlockedPlayerSkills } = get();
        if (unlockedPlayerSkills.includes(skillId)) return false;
        const price = PLAYER_SKILL_SHOP_PRICES[skillId];
        if (coins < price) return false;
        set({
          coins: coins - price,
          unlockedPlayerSkills: [...unlockedPlayerSkills, skillId],
        });
        return true;
      },

      isPlayerSkillUnlocked: (skillId) => {
        return get().unlockedPlayerSkills.includes(skillId);
      },

      getPlayerSkillPrice: (skillId) => {
        return PLAYER_SKILL_SHOP_PRICES[skillId];
      },

      incrementGamesPlayed: () => {
        set((state) => ({ totalGamesPlayed: state.totalGamesPlayed + 1 }));
      },

      resetShop: () => {
        set({
          coins: 0,
          unlockedTowers: ['basic'],
          unlockedPlayerSkills: [],
          totalGamesPlayed: 0,
        });
      },
    }),
    {
      name: 'tower-shop-storage',
      version: 2,
      migrate: (persistedState, version) => {
        const next = persistedState as Partial<ShopStoreState> | undefined;
        if (!next) return next;
        // v1 -> v2 新增 unlockedPlayerSkills
        if (version < 2 && !Array.isArray(next.unlockedPlayerSkills)) {
          next.unlockedPlayerSkills = [];
        }
        return next;
      },
    }
  )
);

/**
 * 計算一局遊戲結束後的金幣獎勵
 */
export function calculateCoinReward(params: {
  isVictory: boolean;
  score: number;
  currentWave: number;
  health: number;
  stars?: number;
}): number {
  const { isVictory, score, currentWave, health, stars = 0 } = params;

  let reward = 0;

  // 基礎獎勵：每波 5 金幣
  reward += currentWave * 5;

  // 分數獎勵：每 1000 分 10 金幣
  reward += Math.floor(score / 1000) * 10;

  // 勝利獎勵
  if (isVictory) {
    reward += 50;
    // 星星加成
    reward += stars * 20;
    // 滿血加成
    if (health >= 100) reward += 30;
  }

  return reward;
}

export default useShopStore;
