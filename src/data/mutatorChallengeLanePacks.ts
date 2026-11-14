/**
 * 直線／長廊／蛇形波次組突變挑戰
 * 與主庫分開，避免 mutatorChallengeData 超過 888 行。
 */

import React from 'react';
import type { MutatorChallenge } from '@/types/mutatorChallenge';
import {
  TowerIcon, ShieldIcon, FastForwardIcon,
} from '@/components/ui/Icons';

export const LANE_WAVE_MUTATORS: MutatorChallenge[] = [
  {
    id: 'mc_normal_straight',
    name: '直線潮汐',
    description: '直線鎖定官方波次「普通潮汐」。沒有冰塔與風塔，普通兵會從上下兩線同時漏掉。',
    icon: React.createElement(TowerIcon, { className: 'w-8 h-8 text-emerald-300' }),
    accent: 'green',
    tier: 'medium',
    mapId: 'straight',
    difficulty: 'hard',
    maxWaves: 10,
    customWaveSetId: 'official_normal_tide',
    rules: {
      bannedTowerTypes: ['frost', 'wind'],
      enemyAffix: { speedMult: 1.08 },
    },
    rewards: { coins: 350, talentPoints: 1 },
    tips: '上下直線都要有塔。機槍壓制治療，加農清蟲群，出口再補基礎塔。',
    tags: ['普通潮汐', '直線', '禁冰/風', '敵人 +8% 速'],
  },
  {
    id: 'mc_armor_corridor',
    name: '長廊裝甲',
    description: '長廊鎖定官方波次「裝甲縱隊」。沒有毒與火，裝甲兵會從上下走廊同時把防線磨穿。',
    icon: React.createElement(ShieldIcon, { className: 'w-8 h-8 text-slate-200' }),
    accent: 'purple',
    tier: 'hard',
    mapId: 'corridor',
    difficulty: 'hard',
    maxWaves: 10,
    customWaveSetId: 'official_armor_column',
    rules: {
      bannedTowerTypes: ['poison', 'flame'],
      enemyAffix: { healthMult: 1.1 },
    },
    rewards: { coins: 400, talentPoints: 1 },
    tips: '上下走廊都要有塔。雷射破甲、脈衝破甲削防，狙擊點治療。',
    tags: ['裝甲縱隊', '長廊', '禁毒/火', '敵人 +10% 血'],
  },
  {
    id: 'mc_fast_snake',
    name: '蛇形突襲',
    description: '蛇形鎖定官方波次「快速突襲」。沒有冰塔與加農，快速兵會走直路或繞路同時漏掉。',
    icon: React.createElement(FastForwardIcon, { className: 'w-8 h-8 text-lime-300' }),
    accent: 'cyan',
    tier: 'hard',
    mapId: 'snake',
    difficulty: 'hard',
    maxWaves: 10,
    customWaveSetId: 'official_fast_raid',
    rules: {
      bannedTowerTypes: ['frost', 'cannon'],
      enemyAffix: { speedMult: 1.1 },
    },
    rewards: { coins: 400, talentPoints: 1 },
    tips: '直路與繞路都要有塔。風刃恐懼拖速，機槍連打，雷射即時命中。',
    tags: ['快速突襲', '蛇形', '禁冰/加農', '敵人 +10% 速'],
  },
];
