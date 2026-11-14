/**
 * 示範 Mod 資料定義
 * Sample Mod Data Definitions
 */

import type { Mod } from '@/types/game';

// 示範 Mod - 冰火雙塔
export const sampleMod: Mod = {
  metadata: {
    id: 'ice-fire-pack',
    name: '冰火雙塔',
    version: '1.0.0',
    author: '官方',
    description: '新增冰霜塔和烈焰塔，冰火相剋帶來全新策略體驗',
    type: 'tower',
    gameVersion: '2.1.1',
    tags: ['官方', '塔', '元素'],
    createdAt: '2026-02-01',
    updatedAt: '2026-02-01',
  },
  content: {
    towers: [
      {
        id: 'ice_burst',
        modId: 'ice-fire-pack',
        name: '冰爆塔',
        damage: 30,
        range: 120,
        fireRate: 0.8,
        cost: 180,
        color: '#87CEEB',
        projectileColor: '#00BFFF',
        highlightColor: '#E0FFFF',
        description: '發射冰霜爆彈，命中後造成範圍減速',
        projectileSpeed: 300,
        projectileSize: 6,
        splash: true,
        splashRadius: 50,
        slowEffect: true,
        slowAmount: 0.6,
        slowDuration: 2000,
      },
      {
        id: 'fire_storm',
        modId: 'ice-fire-pack',
        name: '烈焰風暴塔',
        damage: 15,
        damagePerSecond: 25,
        range: 100,
        cost: 200,
        color: '#FF4500',
        projectileColor: '#FF6347',
        highlightColor: '#FFD700',
        description: '持續噴射火焰風暴，對範圍內敵人造成灼燒傷害',
        flameEffect: true,
      },
    ],
  },
  enabled: true,
  loadOrder: 1,
};

// 示範 Mod - 精英敵人包
export const eliteEnemyMod: Mod = {
  metadata: {
    id: 'elite-enemy-pack',
    name: '精英敵人包',
    version: '1.0.0',
    author: '官方',
    description: '新增多種精英敵人，增加遊戲挑戰性',
    type: 'enemy',
    gameVersion: '2.1.1',
    tags: ['官方', '敵人', '困難'],
    createdAt: '2026-02-01',
    updatedAt: '2026-02-01',
  },
  content: {
    enemies: [
      {
        id: 'shadow_runner',
        modId: 'elite-enemy-pack',
        name: '暗影疾行者',
        health: 80,
        speed: 2.5,
        reward: 30,
        size: 10,
        color: '#2F2F4F',
        description: '極速移動的暗影生物，難以捕捉',
        ability: '移動速度極快',
      },
      {
        id: 'iron_golem',
        modId: 'elite-enemy-pack',
        name: '鐵甲魔像',
        health: 500,
        speed: 0.4,
        reward: 80,
        size: 18,
        color: '#708090',
        description: '堅固的鐵甲魔像，擁有極高的生命值',
        ability: '超高生命值',
      },
      {
        id: 'necromancer',
        modId: 'elite-enemy-pack',
        name: '亡靈法師',
        health: 150,
        speed: 0.7,
        reward: 60,
        size: 14,
        color: '#4B0082',
        description: '死亡時會召喚骷髏士兵',
        ability: '死亡召喚',
        spawnOnDeath: { type: 'normal', count: 3 },
      },
    ],
  },
  enabled: false,
  loadOrder: 2,
};

// 示範 Mod - 地獄難度地圖
export const hellMapMod: Mod = {
  metadata: {
    id: 'hell-maps',
    name: '地獄難度地圖',
    version: '1.0.0',
    author: '社區',
    description: '超高難度的地圖集合，考驗你的塔防極限',
    type: 'map',
    gameVersion: '2.1.1',
    tags: ['社區', '地圖', '極難'],
    createdAt: '2026-02-01',
    updatedAt: '2026-02-01',
  },
  content: {
    maps: [
      {
        id: 'maze_of_doom',
        modId: 'hell-maps',
        name: '末日迷宮',
        description: '複雜的迷宮路徑，敵人會從多個方向進攻',
        difficulty: '地獄',
        waypoints: [
          { col: 0, row: 0 },
          { col: 4, row: 0 },
          { col: 4, row: 4 },
          { col: 8, row: 4 },
          { col: 8, row: 0 },
          { col: 12, row: 0 },
          { col: 12, row: 8 },
          { col: 0, row: 8 },
          { col: 0, row: 5 },
          { col: 14, row: 5 },
        ],
      },
      {
        id: 'the_gauntlet',
        modId: 'hell-maps',
        name: '挑戰者之路',
        description: '直線路徑，快速敵人蜂擁而至',
        difficulty: '地獄',
        waypoints: [
          { col: 0, row: 5 },
          { col: 14, row: 5 },
        ],
      },
    ],
  },
  enabled: false,
  loadOrder: 3,
};

// 示範 Mod - 自訂波次組
export const sampleWaveMod: Mod = {
  metadata: {
    id: 'sample-waves',
    name: '挑戰波次組合',
    version: '1.0.0',
    author: '官方',
    description: '預設的特色波次組合,展示自訂波次功能',
    type: 'wave',
    gameVersion: '2.3.0',
    tags: ['官方', '波次', '挑戰'],
    createdAt: '2026-05-23',
    updatedAt: '2026-05-23',
  },
  content: {
    waves: [
      {
        id: 'sample_boss_rush',
        modId: 'sample-waves',
        name: 'Boss 連擊',
        description: '5 波接連 Boss 挑戰',
        waves: [
          { enemies: [{ type: 'tank', count: 5, delay: 0 }, { type: 'shield', count: 3, delay: 600 }], reward: 80 },
          { enemies: [{ type: 'heavy', count: 6, delay: 0 }, { type: 'healer', count: 2, delay: 800 }], reward: 100 },
          { enemies: [{ type: 'miniboss', count: 1, delay: 0 }, { type: 'armored', count: 5, delay: 600 }], reward: 150 },
          { enemies: [{ type: 'boss', count: 1, delay: 0 }, { type: 'shield', count: 4, delay: 500 }, { type: 'mage', count: 2, delay: 800 }], reward: 200 },
          { enemies: [{ type: 'boss', count: 2, delay: 0 }, { type: 'tank', count: 8, delay: 600 }, { type: 'healer', count: 3, delay: 1000 }], reward: 300 },
        ],
      },
      {
        id: 'sample_swarm_madness',
        modId: 'sample-waves',
        name: '蟲群狂潮',
        description: '海量小型敵人蜂擁而至',
        waves: [
          { enemies: [{ type: 'swarm', count: 25, delay: 0 }], reward: 60 },
          { enemies: [{ type: 'swarm', count: 30, delay: 0 }, { type: 'fast', count: 8, delay: 600 }], reward: 80 },
          { enemies: [{ type: 'swarm', count: 35, delay: 0 }, { type: 'speedy', count: 10, delay: 500 }], reward: 100 },
          { enemies: [{ type: 'swarm', count: 50, delay: 0 }, { type: 'flyer', count: 12, delay: 400 }], reward: 150 },
        ],
      },
    ],
  },
  enabled: false,
  loadOrder: 4,
};
