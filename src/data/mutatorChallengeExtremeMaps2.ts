/**
 * 稜鏡／層瀑／錨形波次組突變挑戰
 */

import React from 'react';
import type { MutatorChallenge } from '@/types/mutatorChallenge';
import {
  MagicIcon, ExplosionIcon, ShieldIcon,
} from '@/components/ui/Icons';

export const EXTREME_MAP_MUTATORS_2: MutatorChallenge[] = [
  {
    id: 'mc_arcane_prism',
    name: '稜鏡秘法',
    description: '稜鏡鎖定官方波次「秘法結界」。沒有狙擊與加農，法師與治療會在分光與裂口同時把防線磨穿。',
    icon: React.createElement(MagicIcon, { className: 'w-8 h-8 text-violet-300' }),
    accent: 'purple',
    tier: 'extreme',
    mapId: 'prism',
    difficulty: 'nightmare',
    maxWaves: 10,
    customWaveSetId: 'official_arcane_ward',
    rules: {
      bannedTowerTypes: ['sniper', 'cannon'],
      enemyAffix: { speedMult: 1.08 },
    },
    rewards: { coins: 500, talentPoints: 2 },
    tips: '三路與裂口都要有覆蓋。電擊打斷法師，毒線壓治療，出口再補雷射。',
    tags: ['秘法結界', '稜鏡', '禁狙擊/加農', '敵人 +8% 速'],
  },
  {
    id: 'mc_bomb_cascade',
    name: '層瀑爆破',
    description: '層瀑鎖定官方波次「空中爆破」。沒有冰塔與風塔，炸彈與飛機會從高台與谷底同時炸開。',
    icon: React.createElement(ExplosionIcon, { className: 'w-8 h-8 text-orange-400' }),
    accent: 'orange',
    tier: 'extreme',
    mapId: 'cascade',
    difficulty: 'nightmare',
    maxWaves: 10,
    customWaveSetId: 'official_air_bomb',
    rules: {
      bannedTowerTypes: ['frost', 'wind'],
      enemyAffix: { healthMult: 1.08 },
    },
    rewards: { coins: 500, talentPoints: 2 },
    tips: '高台與谷底都要有塔。加農暈炸彈，機槍打飛行，出口再補散彈。',
    tags: ['空中爆破', '層瀑', '禁冰/風', '敵人 +8% 血'],
  },
  {
    id: 'mc_iron_anchor',
    name: '錨形重盾',
    description: '錨形鎖定官方波次「重盾浪潮」。沒有毒與雷射，重裝與護盾會沿錨柄衝到兩翼出口。',
    icon: React.createElement(ShieldIcon, { className: 'w-8 h-8 text-slate-200' }),
    accent: 'cyan',
    tier: 'extreme',
    mapId: 'anchor',
    difficulty: 'nightmare',
    maxWaves: 10,
    customWaveSetId: 'official_iron_tide',
    rules: {
      bannedTowerTypes: ['poison', 'laser'],
      enemyAffix: { healthMult: 1.1 },
    },
    rewards: { coins: 500, talentPoints: 2 },
    tips: '錨柄先放脈衝破盾，兩翼補火焰與狙擊。',
    tags: ['重盾浪潮', '錨形', '禁毒/雷射', '敵人 +10% 血'],
  },
];
