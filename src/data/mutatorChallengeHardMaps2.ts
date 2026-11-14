/**
 * 新月／楔形／格網波次組突變挑戰
 */

import React from 'react';
import type { MutatorChallenge } from '@/types/mutatorChallenge';
import {
  WrenchIcon, SpiderIcon, EmpIcon,
} from '@/components/ui/Icons';

export const HARD_MAP_MUTATORS_2: MutatorChallenge[] = [
  {
    id: 'mc_shadow_crescent',
    name: '新月影襲',
    description: '新月鎖定官方波次「影襲破壞」。沒有冰塔與脈衝，破壞者會走外弧或內弦同時拆塔。',
    icon: React.createElement(WrenchIcon, { className: 'w-8 h-8 text-slate-200' }),
    accent: 'purple',
    tier: 'hard',
    mapId: 'crescent',
    difficulty: 'hard',
    maxWaves: 10,
    customWaveSetId: 'official_saboteur_veil',
    rules: {
      bannedTowerTypes: ['frost', 'pulse'],
      enemyAffix: { speedMult: 1.08 },
    },
    rewards: { coins: 400, talentPoints: 1 },
    tips: '外弧與內弦都要有覆蓋。火焰燒隱身，機槍點破壞者，出口再補狙擊。',
    tags: ['影襲破壞', '新月', '禁冰/脈衝', '敵人 +8% 速'],
  },
  {
    id: 'mc_swarm_wedge',
    name: '楔形蟲空',
    description: '楔形鎖定官方波次「蟲空潮汐」。沒有狙擊與雷射，蟲群與飛機會從兩翼擠向尖端再裂開。',
    icon: React.createElement(SpiderIcon, { className: 'w-8 h-8 text-lime-400' }),
    accent: 'green',
    tier: 'hard',
    mapId: 'wedge',
    difficulty: 'hard',
    maxWaves: 10,
    customWaveSetId: 'official_swarm_air',
    rules: {
      bannedTowerTypes: ['sniper', 'laser'],
      enemyAffix: { healthMult: 1.08 },
    },
    rewards: { coins: 400, talentPoints: 1 },
    tips: '兩翼與尖端都要有範圍傷害。加農清蟲，機槍打飛行。',
    tags: ['蟲空潮汐', '楔形', '禁狙擊/雷射', '敵人 +8% 血'],
  },
  {
    id: 'mc_elite_lattice',
    name: '格網干擾',
    description: '格網鎖定官方波次「干擾先鋒」。沒有加農與散彈，精英與干擾會在格線上把射速關燈。',
    icon: React.createElement(EmpIcon, { className: 'w-8 h-8 text-violet-400' }),
    accent: 'purple',
    tier: 'hard',
    mapId: 'lattice',
    difficulty: 'hard',
    maxWaves: 10,
    customWaveSetId: 'official_elite_jam',
    rules: {
      bannedTowerTypes: ['cannon', 'shotgun'],
      enemyAffix: { healthMult: 1.1 },
    },
    rewards: { coins: 400, talentPoints: 1 },
    tips: '上下格線與裂口都要有塔。冰塔關干擾，毒線磨精英。',
    tags: ['干擾先鋒', '格網', '禁加農/散彈', '敵人 +10% 血'],
  },
];
