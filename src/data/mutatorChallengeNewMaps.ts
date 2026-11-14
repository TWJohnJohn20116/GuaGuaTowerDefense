/**
 * 漏斗／鉤形／三線波次組突變挑戰
 */

import React from 'react';
import type { MutatorChallenge } from '@/types/mutatorChallenge';
import {
  TargetIcon, TornadoIcon, ChartIcon,
} from '@/components/ui/Icons';

export const NEW_MAP_MUTATORS: MutatorChallenge[] = [
  {
    id: 'mc_support_funnel',
    name: '漏斗支援網',
    description: '漏斗鎖定官方波次「支援網」。沒有毒與機槍，治療、護航與干擾會在頸部把防線磨穿。',
    icon: React.createElement(TargetIcon, { className: 'w-8 h-8 text-rose-300' }),
    accent: 'red',
    tier: 'hard',
    mapId: 'funnel',
    difficulty: 'hard',
    maxWaves: 10,
    customWaveSetId: 'official_support_web',
    rules: {
      bannedTowerTypes: ['poison', 'machine'],
      enemyAffix: { healthMult: 1.08 },
    },
    rewards: { coins: 400, talentPoints: 1 },
    tips: '頸部先放狙擊點治療，冰塔沉默干擾，火焰繞過護航裝甲。',
    tags: ['支援網', '漏斗', '禁毒/機槍', '敵人 +8% 血'],
  },
  {
    id: 'mc_phase_hook',
    name: '鉤形相位',
    description: '鉤形鎖定官方波次「相位奇襲」。沒有冰塔與風塔，幽影與潛行會走遠鉤或近路同時漏掉。',
    icon: React.createElement(TornadoIcon, { className: 'w-8 h-8 text-indigo-300' }),
    accent: 'purple',
    tier: 'hard',
    mapId: 'hook',
    difficulty: 'hard',
    maxWaves: 10,
    customWaveSetId: 'official_phase_raid',
    rules: {
      bannedTowerTypes: ['frost', 'wind'],
      enemyAffix: { speedMult: 1.08 },
    },
    rewards: { coins: 400, talentPoints: 1 },
    tips: '遠鉤與近路都要有覆蓋。偵察閃光或脈衝破隱，電擊打相位。',
    tags: ['相位奇襲', '鉤形', '禁冰/風', '敵人 +8% 速'],
  },
  {
    id: 'mc_siege_triple',
    name: '三線拆遷',
    description: '三線鎖定官方波次「爆破拆遷」。沒有狙擊與雷射，炸彈與破壞者會從上中下三路同時衝。',
    icon: React.createElement(ChartIcon, { className: 'w-8 h-8 text-orange-400' }),
    accent: 'orange',
    tier: 'hard',
    mapId: 'triple',
    difficulty: 'hard',
    maxWaves: 10,
    customWaveSetId: 'official_siege_mix',
    rules: {
      bannedTowerTypes: ['sniper', 'laser'],
      enemyAffix: { healthMult: 1.1 },
    },
    rewards: { coins: 400, talentPoints: 1 },
    tips: '三路都要有塔。加農暈住炸彈，散彈清破壞者，出口再補機槍。',
    tags: ['爆破拆遷', '三線', '禁狙擊/雷射', '敵人 +10% 血'],
  },
];
