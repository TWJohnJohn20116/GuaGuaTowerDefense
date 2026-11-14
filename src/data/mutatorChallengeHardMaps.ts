/**
 * 盤繞／閘門／谷地波次組突變挑戰
 */

import React from 'react';
import type { MutatorChallenge } from '@/types/mutatorChallenge';
import {
  WindIcon, SwordIcon, AlienIcon,
} from '@/components/ui/Icons';

export const HARD_MAP_MUTATORS: MutatorChallenge[] = [
  {
    id: 'mc_air_coil',
    name: '盤繞空閃',
    description: '盤繞鎖定官方波次「空閃縱隊」。沒有機槍與電擊，飛行與法師會走內圈或外圈同時漏掉。',
    icon: React.createElement(WindIcon, { className: 'w-8 h-8 text-sky-300' }),
    accent: 'cyan',
    tier: 'hard',
    mapId: 'coil',
    difficulty: 'hard',
    maxWaves: 10,
    customWaveSetId: 'official_air_blink',
    rules: {
      bannedTowerTypes: ['machine', 'lightning'],
      enemyAffix: { speedMult: 1.08 },
    },
    rewards: { coins: 400, talentPoints: 1 },
    tips: '內圈與外圈都要有遠程覆蓋。狙擊標記、雷射即時命中，出口再補基礎塔。',
    tags: ['空閃縱隊', '盤繞', '禁機槍/電擊', '敵人 +8% 速'],
  },
  {
    id: 'mc_rage_gate',
    name: '閘門狂暴',
    description: '閘門鎖定官方波次「狂暴鐵壁」。沒有冰塔與風塔，狂暴兵會在閘口加速衝破。',
    icon: React.createElement(SwordIcon, { className: 'w-8 h-8 text-red-400' }),
    accent: 'red',
    tier: 'hard',
    mapId: 'gate',
    difficulty: 'hard',
    maxWaves: 10,
    customWaveSetId: 'official_rage_wall',
    rules: {
      bannedTowerTypes: ['frost', 'wind'],
      enemyAffix: { healthMult: 1.1 },
    },
    rewards: { coins: 400, talentPoints: 1 },
    tips: '閘口先放加農暈住，狙擊點殘血，火焰磨穿裝甲。',
    tags: ['狂暴鐵壁', '閘門', '禁冰/風', '敵人 +10% 血'],
  },
  {
    id: 'mc_nest_valley',
    name: '谷地巢穴',
    description: '谷地鎖定官方波次「巢穴干擾」。沒有加農與散彈，分裂與干擾會從谷底與兩岸同時漏掉。',
    icon: React.createElement(AlienIcon, { className: 'w-8 h-8 text-lime-400' }),
    accent: 'green',
    tier: 'hard',
    mapId: 'valley',
    difficulty: 'hard',
    maxWaves: 10,
    customWaveSetId: 'official_nest_jam',
    rules: {
      bannedTowerTypes: ['cannon', 'shotgun'],
      enemyAffix: { healthMult: 1.08 },
    },
    rewards: { coins: 400, talentPoints: 1 },
    tips: '三路都要有塔。電擊清子體，機槍關干擾，毒磨巢穴。',
    tags: ['巢穴干擾', '谷地', '禁加農/散彈', '敵人 +8% 血'],
  },
];
