import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TalentCategory = 'economy' | 'offense' | 'defense' | 'utility';

interface TalentRequirement {
  id: string;
  rank: number;
}

interface TalentEffect {
  startingMoneyMult?: number;
  startingMoneyFlat?: number;
  startingHealthFlat?: number;
  towerCostMult?: number;
  towerDamageMult?: number;
  enemyRewardMult?: number;
  metaCoinMult?: number;
  towerAttackSpeedMult?: number;
  towerRangeMult?: number;
  /** 暴擊機率（加成累加，0~1） */
  criticalChance?: number;
  /** 暴擊傷害倍率（額外，會以 1+sum 應用） */
  criticalDamage?: number;
  /** Boss 額外傷害倍率 */
  bossDamageMult?: number;
}

export interface TalentNode {
  id: string;
  category: TalentCategory;
  name: string;
  description: string;
  maxRank: number;
  costs: number[];
  requires?: TalentRequirement[];
  perRank: TalentEffect;
}

export interface TalentModifiers {
  startingMoneyMult: number;
  startingMoneyFlat: number;
  startingHealthFlat: number;
  towerCostMult: number;
  towerDamageMult: number;
  enemyRewardMult: number;
  metaCoinMult: number;
  towerAttackSpeedMult: number;
  towerRangeMult: number;
  criticalChance: number;
  criticalDamage: number;
  bossDamageMult: number;
}

export const TALENT_NODES: TalentNode[] = [
  {
    id: 'economy_starting_money',
    category: 'economy',
    name: '起始資金',
    description: '提升開局金錢 +5%。',
    maxRank: 5,
    costs: [1, 1, 2, 2, 3],
    perRank: { startingMoneyMult: 0.05 },
  },
  {
    id: 'economy_bounty_hunter',
    category: 'economy',
    name: '賞金獵人',
    description: '提升擊殺獎勵金錢 +4%。',
    maxRank: 5,
    costs: [1, 2, 2, 3, 3],
    requires: [{ id: 'economy_starting_money', rank: 2 }],
    perRank: { enemyRewardMult: 0.04 },
  },
  {
    id: 'economy_greed',
    category: 'economy',
    name: '貪婪契約',
    description: '提升擊殺獎勵金錢 +6%。',
    maxRank: 5,
    costs: [2, 3, 4, 5, 6],
    requires: [{ id: 'economy_bounty_hunter', rank: 3 }],
    perRank: { enemyRewardMult: 0.06 },
  },
  {
    id: 'utility_cheaper_towers',
    category: 'utility',
    name: '精打細算',
    description: '降低防禦塔建造費用 -3%。',
    maxRank: 5,
    costs: [1, 2, 2, 3, 3],
    requires: [{ id: 'economy_bounty_hunter', rank: 1 }],
    perRank: { towerCostMult: -0.03 },
  },
  {
    id: 'utility_mastery',
    category: 'utility',
    name: '大師工藝',
    description: '降低防禦塔建造費用 -4%。',
    maxRank: 5,
    costs: [2, 3, 4, 5, 6],
    requires: [{ id: 'utility_cheaper_towers', rank: 3 }],
    perRank: { towerCostMult: -0.04 },
  },
  {
    id: 'offense_damage',
    category: 'offense',
    name: '強化彈藥',
    description: '提升所有防禦塔傷害 +3%。',
    maxRank: 8,
    costs: [1, 1, 2, 2, 3, 3, 4, 4],
    requires: [{ id: 'economy_starting_money', rank: 1 }],
    perRank: { towerDamageMult: 0.03 },
  },
  {
    id: 'offense_sniper',
    category: 'offense',
    name: '狙擊訓練',
    description: '提升防禦塔傷害與範圍 +4%。',
    maxRank: 5,
    costs: [2, 3, 4, 5, 6],
    requires: [{ id: 'offense_damage', rank: 3 }],
    perRank: { towerDamageMult: 0.04, towerRangeMult: 0.04 },
  },
  {
    id: 'offense_attack_speed',
    category: 'offense',
    name: '超頻射擊',
    description: '提升所有防禦塔攻擊速度 +4%。',
    maxRank: 5,
    costs: [2, 2, 3, 3, 4],
    requires: [{ id: 'offense_damage', rank: 3 }],
    perRank: { towerAttackSpeedMult: 0.04 },
  },
  {
    id: 'offense_overload',
    category: 'offense',
    name: '武器超載',
    description: '提升所有防禦塔攻擊速度 +5%。',
    maxRank: 5,
    costs: [2, 3, 4, 5, 6],
    requires: [{ id: 'offense_attack_speed', rank: 3 }],
    perRank: { towerAttackSpeedMult: 0.05 },
  },
  {
    id: 'utility_range',
    category: 'utility',
    name: '鷹眼瞄準',
    description: '提升所有防禦塔攻擊範圍 +5%。',
    maxRank: 5,
    costs: [1, 2, 3, 4, 5],
    requires: [{ id: 'offense_sniper', rank: 2 }, { id: 'utility_cheaper_towers', rank: 2 }],
    perRank: { towerRangeMult: 0.05 },
  },
  {
    id: 'defense_extra_life',
    category: 'defense',
    name: '額外生命',
    description: '提升開局生命值 +1。',
    maxRank: 5,
    costs: [1, 1, 2, 2, 3],
    requires: [{ id: 'economy_starting_money', rank: 1 }],
    perRank: { startingHealthFlat: 1 },
  },
  {
    id: 'defense_armor',
    category: 'defense',
    name: '裝甲防護',
    description: '提升開局生命值 +2。',
    maxRank: 5,
    costs: [2, 3, 4, 5, 6],
    requires: [{ id: 'defense_extra_life', rank: 3 }],
    perRank: { startingHealthFlat: 2 },
  },
  {
    id: 'meta_coin_bonus',
    category: 'utility',
    name: '戰利品加成',
    description: '提升每局結算獲得的金幣 +5%。',
    maxRank: 5,
    costs: [1, 2, 2, 3, 3],
    requires: [
      { id: 'utility_mastery', rank: 2 },
      { id: 'utility_range', rank: 2 },
      { id: 'offense_overload', rank: 2 },
      { id: 'defense_armor', rank: 2 }
    ],
    perRank: { metaCoinMult: 0.05 },
  },

  // ============================================================
  // 新增天賦節點
  // ============================================================

  {
    id: 'economy_starter_kit',
    category: 'economy',
    name: '富裕開局',
    description: '直接增加開局現金 +50。',
    maxRank: 5,
    costs: [1, 1, 2, 2, 3],
    perRank: { startingMoneyFlat: 50 },
  },
  {
    id: 'economy_first_blood',
    category: 'economy',
    name: '首勝禮包',
    description: '額外增加開局金錢 +8%。',
    maxRank: 5,
    costs: [2, 2, 3, 3, 4],
    requires: [{ id: 'economy_greed', rank: 2 }],
    perRank: { startingMoneyMult: 0.08 },
  },
  {
    id: 'offense_critical_strike',
    category: 'offense',
    name: '致命一擊',
    description: '所有攻擊獲得 +5% 暴擊機率。',
    maxRank: 5,
    costs: [2, 2, 3, 3, 4],
    requires: [{ id: 'offense_damage', rank: 2 }],
    perRank: { criticalChance: 0.05 },
  },
  {
    id: 'offense_critical_focus',
    category: 'offense',
    name: '致命專注',
    description: '暴擊傷害提升 +20%。',
    maxRank: 5,
    costs: [2, 3, 3, 4, 5],
    requires: [{ id: 'offense_critical_strike', rank: 3 }],
    perRank: { criticalDamage: 0.2 },
  },
  {
    id: 'offense_boss_slayer',
    category: 'offense',
    name: '屠龍術',
    description: '對 Boss 敵人造成額外 +10% 傷害。',
    maxRank: 5,
    costs: [2, 2, 3, 3, 4],
    requires: [{ id: 'offense_sniper', rank: 2 }],
    perRank: { bossDamageMult: 0.1 },
  },
  {
    id: 'defense_iron_will',
    category: 'defense',
    name: '鋼鐵意志',
    description: '提升開局生命值 +3。',
    maxRank: 5,
    costs: [2, 2, 3, 4, 5],
    requires: [{ id: 'defense_armor', rank: 2 }],
    perRank: { startingHealthFlat: 3 },
  },
  {
    id: 'defense_keystone_fortress',
    category: 'defense',
    name: '要塞精神',
    description: '【Keystone】開局生命 +10、開局金錢 +200。',
    maxRank: 1,
    costs: [8],
    requires: [{ id: 'defense_iron_will', rank: 3 }],
    perRank: { startingHealthFlat: 10, startingMoneyFlat: 200 },
  },
  {
    id: 'meta_grand_loot',
    category: 'utility',
    name: '戰利品大師',
    description: '結算金幣再 +5%。',
    maxRank: 5,
    costs: [2, 2, 3, 3, 4],
    requires: [{ id: 'meta_coin_bonus', rank: 2 }],
    perRank: { metaCoinMult: 0.05 },
  },
  {
    id: 'offense_frenzy',
    category: 'offense',
    name: '狂亂連射',
    description: '提升所有防禦塔攻擊速度 +6%。',
    maxRank: 5,
    costs: [2, 3, 3, 4, 5],
    requires: [{ id: 'offense_overload', rank: 3 }],
    perRank: { towerAttackSpeedMult: 0.06 },
  },
  {
    id: 'offense_keystone_berserker',
    category: 'offense',
    name: '狂戰士之怒',
    description: '【Keystone】所有防禦塔傷害 +15%、攻擊速度 +10%、暴擊傷害 +30%。',
    maxRank: 1,
    costs: [10],
    requires: [
      { id: 'offense_critical_focus', rank: 3 },
      { id: 'offense_frenzy', rank: 2 },
      { id: 'offense_boss_slayer', rank: 2 },
    ],
    perRank: { towerDamageMult: 0.15, towerAttackSpeedMult: 0.10, criticalDamage: 0.30 },
  },
];

const nodeById = new Map(TALENT_NODES.map((n) => [n.id, n]));

const createEmptyTalentRanks = (): Record<string, number> => {
  const ranks: Record<string, number> = {};
  for (const node of TALENT_NODES) ranks[node.id] = 0;
  return ranks;
};

export const computeTalentModifiers = (ranks: Record<string, number>): TalentModifiers => {
  const mods: TalentModifiers = {
    startingMoneyMult: 1,
    startingMoneyFlat: 0,
    startingHealthFlat: 0,
    towerCostMult: 1,
    towerDamageMult: 1,
    enemyRewardMult: 1,
    metaCoinMult: 1,
    towerAttackSpeedMult: 1,
    towerRangeMult: 1,
    criticalChance: 0,
    criticalDamage: 1,
    bossDamageMult: 1,
  };

  for (const node of TALENT_NODES) {
    const rank = Math.max(0, Math.min(node.maxRank, ranks[node.id] ?? 0));
    if (rank === 0) continue;

    const e = node.perRank;

    if (e.startingMoneyMult) mods.startingMoneyMult *= 1 + e.startingMoneyMult * rank;
    if (e.startingMoneyFlat) mods.startingMoneyFlat += e.startingMoneyFlat * rank;
    if (e.startingHealthFlat) mods.startingHealthFlat += e.startingHealthFlat * rank;

    if (e.towerCostMult) mods.towerCostMult *= 1 + e.towerCostMult * rank;
    if (e.towerDamageMult) mods.towerDamageMult *= 1 + e.towerDamageMult * rank;
    if (e.enemyRewardMult) mods.enemyRewardMult *= 1 + e.enemyRewardMult * rank;
    if (e.metaCoinMult) mods.metaCoinMult *= 1 + e.metaCoinMult * rank;
    if (e.towerAttackSpeedMult) mods.towerAttackSpeedMult *= 1 + e.towerAttackSpeedMult * rank;
    if (e.towerRangeMult) mods.towerRangeMult *= 1 + e.towerRangeMult * rank;

    if (e.criticalChance) mods.criticalChance += e.criticalChance * rank;
    if (e.criticalDamage) mods.criticalDamage += e.criticalDamage * rank;
    if (e.bossDamageMult) mods.bossDamageMult *= 1 + e.bossDamageMult * rank;
  }

  mods.towerCostMult = Math.max(0.2, mods.towerCostMult);
  mods.criticalChance = Math.min(1, Math.max(0, mods.criticalChance));
  return mods;
};

export const getTalentUpgradeCost = (nodeId: string, nextRank: number): number | null => {
  const node = nodeById.get(nodeId);
  if (!node) return null;
  if (nextRank < 1 || nextRank > node.maxRank) return null;
  return node.costs[nextRank - 1] ?? null;
};

export const meetsTalentRequirements = (ranks: Record<string, number>, nodeId: string): boolean => {
  const node = nodeById.get(nodeId);
  if (!node) return false;
  if (!node.requires || node.requires.length === 0) return true;
  return node.requires.every((r) => (ranks[r.id] ?? 0) >= r.rank);
};

interface TalentStoreState {
  talentPoints: number;
  ranks: Record<string, number>;
  totalEarnedPoints: number;
  totalSpentPoints: number;

  addTalentPoints: (amount: number) => void;
  canUpgradeTalent: (nodeId: string) => boolean;
  upgradeTalent: (nodeId: string) => boolean;
  /** 退還單一節點的最後一階（同時退還該階花費）。會檢查不能讓後續節點變成不滿足需求。 */
  refundOneRank: (nodeId: string) => boolean;
  resetTalents: () => void;

  getModifiers: () => TalentModifiers;
  getRank: (nodeId: string) => number;
}

export const useTalentStore = create<TalentStoreState>()(
  persist(
    (set, get) => ({
      talentPoints: 0,
      ranks: createEmptyTalentRanks(),
      totalEarnedPoints: 0,
      totalSpentPoints: 0,

      addTalentPoints: (amount) => {
        const n = Math.max(0, Math.floor(amount));
        if (n <= 0) return;
        set((s) => ({
          talentPoints: s.talentPoints + n,
          totalEarnedPoints: s.totalEarnedPoints + n,
        }));
      },

      canUpgradeTalent: (nodeId) => {
        const state = get();
        const node = nodeById.get(nodeId);
        if (!node) return false;
        const currentRank = state.ranks[nodeId] ?? 0;
        if (currentRank >= node.maxRank) return false;
        if (!meetsTalentRequirements(state.ranks, nodeId)) return false;
        const cost = getTalentUpgradeCost(nodeId, currentRank + 1);
        if (cost == null) return false;
        return state.talentPoints >= cost;
      },

      upgradeTalent: (nodeId) => {
        const state = get();
        const node = nodeById.get(nodeId);
        if (!node) return false;
        const currentRank = state.ranks[nodeId] ?? 0;
        if (currentRank >= node.maxRank) return false;
        if (!meetsTalentRequirements(state.ranks, nodeId)) return false;
        const cost = getTalentUpgradeCost(nodeId, currentRank + 1);
        if (cost == null || state.talentPoints < cost) return false;

        set((s) => ({
          talentPoints: s.talentPoints - cost,
          totalSpentPoints: s.totalSpentPoints + cost,
          ranks: { ...s.ranks, [nodeId]: currentRank + 1 },
        }));
        return true;
      },

      refundOneRank: (nodeId) => {
        const state = get();
        const node = nodeById.get(nodeId);
        if (!node) return false;
        const currentRank = state.ranks[nodeId] ?? 0;
        if (currentRank <= 0) return false;

        const refundCost = getTalentUpgradeCost(nodeId, currentRank);
        if (refundCost == null) return false;

        const nextRanks = { ...state.ranks, [nodeId]: currentRank - 1 };
        for (const other of TALENT_NODES) {
          const otherRank = nextRanks[other.id] ?? 0;
          if (otherRank > 0 && !meetsTalentRequirements(nextRanks, other.id)) {
            return false;
          }
        }

        set({
          talentPoints: state.talentPoints + refundCost,
          totalSpentPoints: Math.max(0, state.totalSpentPoints - refundCost),
          ranks: nextRanks,
        });
        return true;
      },

      resetTalents: () => {
        const state = get();
        const refunded = Math.max(0, state.totalSpentPoints);
        set({
          talentPoints: state.talentPoints + refunded,
          totalSpentPoints: 0,
          ranks: createEmptyTalentRanks(),
        });
      },

      getModifiers: () => computeTalentModifiers(get().ranks),
      getRank: (nodeId) => get().ranks[nodeId] ?? 0,
    }),
    {
      name: 'guagua-talent-storage',
      version: 1,
      partialize: (s) => ({
        talentPoints: s.talentPoints,
        ranks: s.ranks,
        totalEarnedPoints: s.totalEarnedPoints,
        totalSpentPoints: s.totalSpentPoints,
      }),
    }
  )
);

export default useTalentStore;
