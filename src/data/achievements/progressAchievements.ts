/**
 * 遊戲進度、塔、敵人、地圖相關成就
 * Progress, Tower, Enemy, Map Achievements
 */

import type { Achievement } from '@/types/achievement';
import { 
  StarIcon, TrophyIcon, ShieldIcon, MapIcon, SwordIcon, 
  TargetIcon, KillEnemyIcon, BuildTowerIcon, UpgradeTowerIcon, DangerIcon,
  MedalIcon
} from '@/components/ui/Icons';
import React from 'react';

// ==========================================
// 1. 進度成就 (Progress)
// ==========================================
export const progressAchievements: Achievement[] = [
  {
    id: 'prog_first_blood',
    name: '初出茅廬',
    description: '完成教學關卡，踏出保衛瓜瓜的第一步。',
    icon: React.createElement(StarIcon, { className: "w-8 h-8 text-yellow-400" }),
    category: 'progress',
    rarity: 'common',
    conditions: [
      { type: 'complete_map', target: 1, current: 0 }
    ],
    rewards: [
      { type: 'points', value: 10 }
    ],
    tips: '只要跟著教學指示完成第一關即可獲得。'
  },
  {
    id: 'prog_campaign_1',
    name: '戰役初探',
    description: '通關第一章「覺醒：未知的威脅」所有關卡。',
    icon: React.createElement(MapIcon, { className: "w-8 h-8 text-emerald-400" }),
    category: 'progress',
    rarity: 'common',
    conditions: [
      { type: 'complete_chapter', target: 1, current: 0 }
    ],
    rewards: [
      { type: 'points', value: 20 },
      { type: 'title', value: '新兵' }
    ]
  },
  {
    id: 'prog_campaign_2',
    name: '陰影獵手',
    description: '通關第二章「污染：擴散的陰影」所有關卡。',
    icon: React.createElement(ShieldIcon, { className: "w-8 h-8 text-cyan-400" }),
    category: 'progress',
    rarity: 'uncommon',
    conditions: [
      { type: 'complete_chapter', target: 2, current: 0 }
    ],
    rewards: [
      { type: 'points', value: 40 },
      { type: 'title', value: '前線指揮官' }
    ]
  },
  {
    id: 'prog_campaign_3',
    name: '源頭剋星',
    description: '通關第三章「真相：源頭之戰」並擊敗最終首領。',
    icon: React.createElement(TrophyIcon, { className: "w-8 h-8 text-purple-400" }),
    category: 'progress',
    rarity: 'epic',
    conditions: [
      { type: 'complete_chapter', target: 3, current: 0 }
    ],
    rewards: [
      { type: 'points', value: 100 },
      { type: 'title', value: '瓜瓜守護者' },
      { type: 'badge', value: '終焉勳章', name: '終焉勳章', icon: React.createElement(MedalIcon, { className: "w-4 h-4 text-purple-400" }) }
    ],
    tips: '通關前累積足夠的天賦點，並善用解鎖的所有防禦塔種類。'
  },
  {
    id: 'prog_campaign_half',
    name: '漸入佳境',
    description: '通關遊戲一半的關卡。',
    icon: React.createElement(ShieldIcon, { className: "w-8 h-8 text-blue-400" }),
    category: 'progress',
    rarity: 'uncommon',
    conditions: [
      { type: 'complete_map', target: 10, current: 0 }
    ],
    rewards: [
      { type: 'points', value: 30 }
    ]
  },
  {
    id: 'prog_campaign_master',
    name: '戰役大師',
    description: '通關所有基本地圖。',
    icon: React.createElement(TrophyIcon, { className: "w-8 h-8 text-amber-400" }),
    category: 'progress',
    rarity: 'rare',
    conditions: [
      { type: 'complete_map', target: 20, current: 0 }
    ],
    rewards: [
      { type: 'points', value: 50 },
      { type: 'badge', value: '戰役通關勳章', name: '戰役通關勳章', icon: React.createElement(MedalIcon, { className: "w-4 h-4 text-amber-400" }) }
    ]
  },
  {
    id: 'prog_perfect_campaign',
    name: '完美主義者',
    description: '以滿血狀態通關所有基本地圖。',
    icon: React.createElement(TrophyIcon, { className: "w-8 h-8 text-pink-400" }),
    category: 'progress',
    rarity: 'epic',
    conditions: [
      { type: 'perfect_map', target: 20, current: 0 }
    ],
    rewards: [
      { type: 'points', value: 100 },
      { type: 'title', value: '完美主義者' },
      { type: 'badge', value: '完美防禦勳章', name: '完美防禦勳章', icon: React.createElement(ShieldIcon, { className: "w-4 h-4 text-emerald-400" }) }
    ]
  }
];

// ==========================================
// 2. 防禦塔成就 (Towers)
// ==========================================
export const towerAchievements: Achievement[] = [
  {
    id: 'tower_builder_1',
    name: '見習建築師',
    description: '累計建造 100 座防禦塔。',
    icon: React.createElement(BuildTowerIcon, { className: "w-8 h-8 text-slate-400" }),
    category: 'tower',
    rarity: 'common',
    conditions: [
      { type: 'build_tower', target: 100, current: 0 }
    ],
    rewards: [
      { type: 'points', value: 10 }
    ]
  },
  {
    id: 'tower_builder_2',
    name: '建築大師',
    description: '累計建造 1,000 座防禦塔。',
    icon: React.createElement(BuildTowerIcon, { className: "w-8 h-8 text-blue-400" }),
    category: 'tower',
    rarity: 'uncommon',
    conditions: [
      { type: 'build_tower', target: 1000, current: 0 }
    ],
    rewards: [
      { type: 'points', value: 30 },
      { type: 'title', value: '大工匠' }
    ]
  },
  {
    id: 'tower_builder_3',
    name: '奇觀創造者',
    description: '累計建造 10,000 座防禦塔。',
    icon: React.createElement(BuildTowerIcon, { className: "w-8 h-8 text-purple-400" }),
    category: 'tower',
    rarity: 'rare',
    conditions: [
      { type: 'build_tower', target: 10000, current: 0 }
    ],
    rewards: [
      { type: 'points', value: 50 },
      { type: 'title', value: '建築宗師' }
    ]
  },
  {
    id: 'tower_upgrade_1',
    name: '初級強化',
    description: '累計將防禦塔升級 50 次。',
    icon: React.createElement(UpgradeTowerIcon, { className: "w-8 h-8 text-green-400" }),
    category: 'tower',
    rarity: 'common',
    conditions: [
      { type: 'upgrade_tower', target: 50, current: 0 }
    ],
    rewards: [
      { type: 'points', value: 10 }
    ]
  },
  {
    id: 'tower_upgrade_2',
    name: '升級狂人',
    description: '累計將防禦塔升級 500 次。',
    icon: React.createElement(UpgradeTowerIcon, { className: "w-8 h-8 text-yellow-400" }),
    category: 'tower',
    rarity: 'uncommon',
    conditions: [
      { type: 'upgrade_tower', target: 500, current: 0 }
    ],
    rewards: [
      { type: 'points', value: 25 }
    ]
  },
  {
    id: 'tower_max_level',
    name: '究極兵器',
    description: '首次將任意一座防禦塔升至滿級。',
    icon: React.createElement(TrophyIcon, { className: "w-8 h-8 text-red-400" }),
    category: 'tower',
    rarity: 'uncommon',
    conditions: [
      { type: 'max_upgrade_tower', target: 1, current: 0 }
    ],
    rewards: [
      { type: 'points', value: 20 }
    ],
    tips: '集中資源升級一座塔是個好策略。'
  },
  {
    id: 'tower_all_types',
    name: '百花齊放',
    description: '在一局遊戲內建造過所有種類的防禦塔。',
    icon: React.createElement(MapIcon, { className: "w-8 h-8 text-pink-400" }),
    category: 'tower',
    rarity: 'rare',
    conditions: [
      { type: 'build_all_types', target: 1, current: 0 }
    ],
    rewards: [
      { type: 'points', value: 40 },
      { type: 'title', value: '戰術家' }
    ]
  }
];

// ==========================================
// 3. 戰鬥成就 (Combat/Enemies)
// ==========================================
export const enemyAchievements: Achievement[] = [
  {
    id: 'enemy_slayer_1',
    name: '第一滴血',
    description: '擊殺第一名敵人。',
    icon: React.createElement(KillEnemyIcon, { className: "w-8 h-8 text-red-400" }),
    category: 'enemy',
    rarity: 'common',
    conditions: [
      { type: 'kill_enemy', target: 1, current: 0 }
    ],
    rewards: [
      { type: 'points', value: 5 }
    ]
  },
  {
    id: 'enemy_slayer_2',
    name: '敵人殺手',
    description: '累計擊殺 1,000 名敵人。',
    icon: React.createElement(SwordIcon, { className: "w-8 h-8 text-orange-400" }),
    category: 'enemy',
    rarity: 'common',
    conditions: [
      { type: 'kill_enemy', target: 1000, current: 0 }
    ],
    rewards: [
      { type: 'points', value: 15 }
    ]
  },
  {
    id: 'enemy_slayer_3',
    name: '萬人斬',
    description: '累計擊殺 10,000 名敵人。',
    icon: React.createElement(SwordIcon, { className: "w-8 h-8 text-red-500" }),
    category: 'enemy',
    rarity: 'rare',
    conditions: [
      { type: 'kill_enemy', target: 10000, current: 0 }
    ],
    rewards: [
      { type: 'points', value: 50 },
      { type: 'title', value: '修羅' }
    ]
  },
  {
    id: 'enemy_slayer_4',
    name: '百萬大軍',
    description: '累計擊殺 1,000,000 名敵人。',
    icon: React.createElement(TargetIcon, { className: "w-8 h-8 text-purple-500" }),
    category: 'enemy',
    rarity: 'epic',
    conditions: [
      { type: 'kill_enemy', target: 1000000, current: 0 }
    ],
    rewards: [
      { type: 'points', value: 100 },
      { type: 'title', value: '滅世者' }
    ]
  },
  {
    id: 'boss_hunter_1',
    name: '初嚐勝果',
    description: '首次擊殺 Boss。',
    icon: React.createElement(DangerIcon, { className: "w-8 h-8 text-red-400" }),
    category: 'enemy',
    rarity: 'uncommon',
    conditions: [
      { type: 'kill_boss', target: 1, current: 0 }
    ],
    rewards: [
      { type: 'points', value: 20 }
    ]
  },
  {
    id: 'boss_hunter_2',
    name: 'Boss 獵人',
    description: '累計擊殺 10 隻 Boss。',
    icon: React.createElement(DangerIcon, { className: "w-8 h-8 text-red-500" }),
    category: 'enemy',
    rarity: 'rare',
    conditions: [
      { type: 'kill_boss', target: 10, current: 0 }
    ],
    rewards: [
      { type: 'points', value: 40 },
      { type: 'title', value: '怪物獵人' }
    ]
  },
  {
    id: 'boss_hunter_3',
    name: '首領剋星',
    description: '累計擊殺 100 隻 Boss。',
    icon: React.createElement(DangerIcon, { className: "w-8 h-8 text-purple-500" }),
    category: 'enemy',
    rarity: 'epic',
    conditions: [
      { type: 'kill_boss', target: 100, current: 0 }
    ],
    rewards: [
      { type: 'points', value: 80 },
      { type: 'title', value: '弒君者' }
    ]
  }
];

// ==========================================
// 4. 地圖成就 (Maps)
// ==========================================
export const mapAchievements: Achievement[] = [
  {
    id: 'map_explorer_1',
    name: '地圖探索者',
    description: '成功通關 5 張不同的地圖。',
    icon: React.createElement(MapIcon, { className: "w-8 h-8 text-emerald-400" }),
    category: 'progress',
    rarity: 'uncommon',
    conditions: [
      { type: 'complete_unique_maps', target: 5, current: 0 }
    ],
    rewards: [
      { type: 'points', value: 20 },
      { type: 'title', value: '探險家' }
    ]
  },
  {
    id: 'map_explorer_2',
    name: '環遊世界',
    description: '成功通關 15 張不同的地圖。',
    icon: React.createElement(MapIcon, { className: "w-8 h-8 text-cyan-400" }),
    category: 'progress',
    rarity: 'rare',
    conditions: [
      { type: 'complete_unique_maps', target: 15, current: 0 }
    ],
    rewards: [
      { type: 'points', value: 40 },
      { type: 'title', value: '冒險家' }
    ]
  },
  {
    id: 'map_master',
    name: '地圖大師',
    description: '以三星評價通關所有地圖。',
    icon: React.createElement(StarIcon, { className: "w-8 h-8 text-yellow-400" }),
    category: 'progress',
    rarity: 'epic',
    conditions: [
      { type: '3star_all_maps', target: 1, current: 0 }
    ],
    rewards: [
      { type: 'points', value: 100 },
      { type: 'title', value: '大滿貫' },
      { type: 'badge', value: '全滿星勳章', name: '全滿星勳章', icon: React.createElement(StarIcon, { className: "w-4 h-4 text-yellow-400" }) }
    ]
  }
];