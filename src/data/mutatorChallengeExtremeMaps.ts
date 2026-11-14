/**
 * 四葉／甬道／三角洲波次組突變挑戰
 */

import React from 'react';
import type { MutatorChallenge } from '@/types/mutatorChallenge';
import {
  RobotIcon, EyeIcon, AegisIcon,
} from '@/components/ui/Icons';

export const EXTREME_MAP_MUTATORS: MutatorChallenge[] = [
  {
    id: 'mc_tank_clover',
    name: '四葉坦克',
    description: '四葉鎖定官方波次「坦克壓境」。沒有毒與火，坦克會從四路同時把防線碾過。',
    icon: React.createElement(RobotIcon, { className: 'w-8 h-8 text-slate-200' }),
    accent: 'purple',
    tier: 'extreme',
    mapId: 'clover',
    difficulty: 'nightmare',
    maxWaves: 10,
    customWaveSetId: 'official_tank_push',
    rules: {
      bannedTowerTypes: ['poison', 'flame'],
      enemyAffix: { healthMult: 1.12 },
    },
    rewards: { coins: 500, talentPoints: 2 },
    tips: '四路都要有破甲。雷射處決、脈衝破甲，出口再補狙擊。',
    tags: ['坦克壓境', '四葉', '禁毒/火', '敵人 +12% 血'],
  },
  {
    id: 'mc_shadow_gauntlet',
    name: '甬道影行',
    description: '甬道鎖定官方波次「影行突襲」。沒有冰塔與脈衝，潛行兵會在長甬裡消失再從上下出口漏掉。',
    icon: React.createElement(EyeIcon, { className: 'w-8 h-8 text-indigo-300' }),
    accent: 'purple',
    tier: 'extreme',
    mapId: 'gauntlet',
    difficulty: 'nightmare',
    maxWaves: 10,
    customWaveSetId: 'official_shadow_run',
    rules: {
      bannedTowerTypes: ['frost', 'pulse'],
      enemyAffix: { speedMult: 1.1 },
    },
    rewards: { coins: 500, talentPoints: 2 },
    tips: '甬道中段先放火焰燒隱身，出口上下都要有機槍與雷射。',
    tags: ['影行突襲', '甬道', '禁冰/脈衝', '敵人 +10% 速'],
  },
  {
    id: 'mc_guard_delta',
    name: '三角洲護航',
    description: '三角洲鎖定官方波次「護航扇面」。沒有狙擊與雷射，護航者會在匯流口把整群裝甲起來。',
    icon: React.createElement(AegisIcon, { className: 'w-8 h-8 text-cyan-300' }),
    accent: 'cyan',
    tier: 'extreme',
    mapId: 'delta',
    difficulty: 'nightmare',
    maxWaves: 10,
    customWaveSetId: 'official_guard_fan',
    rules: {
      bannedTowerTypes: ['sniper', 'laser'],
      enemyAffix: { healthMult: 1.1 },
    },
    rewards: { coins: 500, talentPoints: 2 },
    tips: '三路與匯流口都要有塔。機槍關護航光環，火焰繞過裝甲。',
    tags: ['護航扇面', '三角洲', '禁狙擊/雷射', '敵人 +10% 血'],
  },
];
