import type { AutoBattlePreset } from '@/types/autobattle';

export const AUTO_BATTLE_PRESETS: AutoBattlePreset[] = [
  {
    id: 'balanced',
    nameKey: 'content.autoBattle.preset.balanced.name',
    descKey: 'content.autoBattle.preset.balanced.desc',
    reserveRatio: 1.1,
    allowSell: true,
    allowFusion: true,
    skillThresholdScale: 1,
  },
  {
    id: 'steady',
    nameKey: 'content.autoBattle.preset.steady.name',
    descKey: 'content.autoBattle.preset.steady.desc',
    factorBoost: { reserve: 1.5, safety: 1.4, timing: 1.2, economyROI: 0.85 },
    weights: {
      place: { coverage: 0.24, threatFit: 0.2, typeMatch: 0.18, economyROI: 0.1, tempo: 0.06, reserve: 0.14, synergy: 0.08 },
    },
    reserveRatio: 1.6,
    allowSell: false,
    allowFusion: false,
    skillThresholdScale: 0.8,
  },
  {
    id: 'economy',
    nameKey: 'content.autoBattle.preset.economy.name',
    descKey: 'content.autoBattle.preset.economy.desc',
    factorBoost: { tempo: 1.5, reserve: 1.3, economyROI: 1.35, coverage: 0.9 },
    weights: {
      place: { coverage: 0.16, threatFit: 0.14, typeMatch: 0.12, economyROI: 0.24, tempo: 0.18, reserve: 0.1, synergy: 0.06 },
      upgrade: { marginal: 0.28, economyROI: 0.34, typeMatch: 0.12, threatFit: 0.12, reserve: 0.14 },
    },
    reserveRatio: 1.9,
    allowSell: true,
    allowFusion: false,
    skillThresholdScale: 1.3,
  },
  {
    id: 'pressure',
    nameKey: 'content.autoBattle.preset.pressure.name',
    descKey: 'content.autoBattle.preset.pressure.desc',
    factorBoost: { threatFit: 1.4, economyROI: 1.2, coverage: 1.1, reserve: 0.7 },
    weights: {
      place: { coverage: 0.2, threatFit: 0.3, typeMatch: 0.18, economyROI: 0.16, tempo: 0.1, reserve: 0.02, synergy: 0.04 },
    },
    reserveRatio: 0.6,
    allowSell: true,
    allowFusion: true,
    skillThresholdScale: 0.85,
  },
  {
    id: 'counter',
    nameKey: 'content.autoBattle.preset.counter.name',
    descKey: 'content.autoBattle.preset.counter.desc',
    factorBoost: { typeMatch: 1.8, threatFit: 1.1 },
    weights: {
      place: { coverage: 0.16, threatFit: 0.2, typeMatch: 0.3, economyROI: 0.14, tempo: 0.08, reserve: 0.06, synergy: 0.06 },
      upgrade: { marginal: 0.24, economyROI: 0.2, typeMatch: 0.3, threatFit: 0.14, reserve: 0.12 },
    },
    reserveRatio: 1.2,
    allowSell: true,
    allowFusion: true,
    skillThresholdScale: 1,
  },
  {
    id: 'synergy',
    nameKey: 'content.autoBattle.preset.synergy.name',
    descKey: 'content.autoBattle.preset.synergy.desc',
    factorBoost: { synergy: 2, marginal: 1.15 },
    weights: {
      place: { coverage: 0.16, threatFit: 0.16, typeMatch: 0.14, economyROI: 0.14, tempo: 0.08, reserve: 0.08, synergy: 0.24 },
      fusion: { synergy: 0.44, economyROI: 0.26, typeMatch: 0.16, reserve: 0.14 },
    },
    reserveRatio: 1.3,
    allowSell: true,
    allowFusion: true,
    skillThresholdScale: 1,
  },
];

/** 依 id 取預設；找不到回退第一個（balanced） */
export const getPreset = (id: string): AutoBattlePreset =>
  AUTO_BATTLE_PRESETS.find((p) => p.id === id) ?? AUTO_BATTLE_PRESETS[0];

/**
 * 舊戰術協議選擇器用的是四種策略名；新引擎以預設檔為準，
 * 這裡做一次語意映射，避免把 preset 概念滲進協議資料層。
 */
export const strategyOfPreset = (id: string): 'balanced' | 'economy' | 'aggressive' | 'defensive' => {
  switch (id) {
    case 'economy':
      return 'economy';
    case 'pressure':
      return 'aggressive';
    case 'steady':
      return 'defensive';
    default:
      return 'balanced';
  }
};
