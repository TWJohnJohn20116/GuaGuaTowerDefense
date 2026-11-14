// 玩家主動技能定義
export type PlayerSkillId = 'lightningStorm' | 'frozenTime' | 'cashRain' | 'battleInspire' | 'meteorStorm' | 'chainLightning' | 'holyHeal' | 'aegisBarrier' | 'warpTrap' | 'empPulse';

export interface PlayerSkill {
  id: PlayerSkillId;
  nameZh: string;
  nameEn: string;
  descZh: string;
  descEn: string;
  cooldown: number;     // ms
  duration?: number;    // ms (持續型效果)
  hotkey: string;       // 鍵位
  iconColor: string;    // 主色 (用於發光等)
  effectKey: 'lightning' | 'freeze' | 'cash' | 'inspire' | 'meteor' | 'chain' | 'heal' | 'aegis' | 'warp' | 'emp';
}

export const PLAYER_SKILLS: PlayerSkill[] = [
  {
    id: 'lightningStorm',
    nameZh: '雷霆風暴',
    nameEn: 'Lightning Storm',
    descZh: '對所有敵人造成 80 點傷害並眩暈 1 秒',
    descEn: 'Strike all enemies for 80 damage + 1s stun',
    cooldown: 60000,
    hotkey: '1',
    iconColor: '#facc15',
    effectKey: 'lightning',
  },
  {
    id: 'frozenTime',
    nameZh: '時間凍結',
    nameEn: 'Frozen Time',
    descZh: '凍結所有敵人 5 秒',
    descEn: 'Freeze all enemies for 5 seconds',
    cooldown: 90000,
    duration: 5000,
    hotkey: '2',
    iconColor: '#60a5fa',
    effectKey: 'freeze',
  },
  {
    id: 'cashRain',
    nameZh: '金幣雨',
    nameEn: 'Cash Rain',
    descZh: '立即獲得 $300 金幣',
    descEn: 'Instantly gain $300',
    cooldown: 75000,
    hotkey: '3',
    iconColor: '#fbbf24',
    effectKey: 'cash',
  },
  {
    id: 'battleInspire',
    nameZh: '狂戰激勵',
    nameEn: 'Battle Inspire',
    descZh: '所有塔攻擊速度提升 2 倍持續 10 秒',
    descEn: 'All towers attack 2x speed for 10 seconds',
    cooldown: 120000,
    duration: 10000,
    hotkey: '4',
    iconColor: '#a855f7',
    effectKey: 'inspire',
  },
  {
    id: 'meteorStorm',
    nameZh: '隕石風暴',
    nameEn: 'Meteor Storm',
    descZh: '召喚隕石轟炸全場，造成 120 點傷害並引燃灼燒（每秒 30，持續 4 秒）',
    descEn: 'Rain meteors on all enemies for 120 damage + burn (30/s for 4s)',
    cooldown: 100000,
    hotkey: '5',
    iconColor: '#f97316',
    effectKey: 'meteor',
  },
  {
    id: 'chainLightning',
    nameZh: '閃電鏈',
    nameEn: 'Chain Lightning',
    descZh: '鎖定強敵，閃電在鄰近敵人間連鎖彈跳（最多 8 段），造成 160 點遞減傷害並眩暈 0.6 秒',
    descEn: 'Arc lightning chains between nearby enemies (up to 8 jumps) for 160 falloff damage + 0.6s stun',
    cooldown: 70000,
    hotkey: '6',
    iconColor: '#22d3ee',
    effectKey: 'chain',
  },
  {
    id: 'holyHeal',
    nameZh: '聖光治療',
    nameEn: 'Holy Heal',
    descZh: '降下聖光立即恢復基地 25 點生命，並淨化全場敵人的所有增益狀態',
    descEn: 'Holy light restores 25 base HP and purges all enemy buffs',
    cooldown: 110000,
    hotkey: '7',
    iconColor: '#34d399',
    effectKey: 'heal',
  },
  {
    id: 'aegisBarrier',
    nameZh: '聖盾結界',
    nameEn: 'Aegis Barrier',
    descZh: '展開聖盾結界 10 秒，期間基地免疫所有傷害；展開瞬間的衝擊波使全場敵人減速 50% 持續 2 秒',
    descEn: 'Shield the base from all damage for 10s; the burst slows all enemies by 50% for 2s',
    cooldown: 130000,
    duration: 10000,
    hotkey: '8',
    iconColor: '#93c5fd',
    effectKey: 'aegis',
  },
  {
    id: 'warpTrap',
    nameZh: '傳送陷阱',
    nameEn: 'Warp Trap',
    descZh: '佈下空間陷阱，把最逼近基地的 6 隻敵人沿路徑回溯傳送 4 格並暈眩 0.8 秒（首領類僅被傳送一半距離）',
    descEn: 'Warp the 6 enemies nearest the base 4 tiles back along the path + 0.8s daze (bosses warp half distance)',
    cooldown: 85000,
    hotkey: '9',
    iconColor: '#e879f9',
    effectKey: 'warp',
  },
  {
    id: 'empPulse',
    nameZh: '電磁脈衝',
    nameEn: 'EMP Pulse',
    descZh: '瞬間擊破全場護盾，並對每個存活敵人造成 40 點傷害',
    descEn: 'Strip all shields and deal 40 damage to every living enemy',
    cooldown: 80000,
    hotkey: '0',
    iconColor: '#22d3ee',
    effectKey: 'emp',
  },
];

export const PLAYER_SKILL_BY_ID: Record<PlayerSkillId, PlayerSkill> = PLAYER_SKILLS.reduce(
  (acc, s) => ({ ...acc, [s.id]: s }),
  {} as Record<PlayerSkillId, PlayerSkill>
);

// 默認金幣雨數量
export const CASH_RAIN_AMOUNT = 300;
// 默認雷霆傷害
export const LIGHTNING_DAMAGE = 80;
// 隕石風暴：立即範圍傷害
export const METEOR_DAMAGE = 120;
// 隕石風暴：灼燒每秒傷害
export const METEOR_BURN_DPS = 30;
// 隕石風暴：灼燒持續時間 (ms)
export const METEOR_BURN_DURATION = 4000;
// 閃電鏈：首擊傷害
export const CHAIN_LIGHTNING_DAMAGE = 160;
// 閃電鏈：最大彈跳段數（含起點）
export const CHAIN_LIGHTNING_MAX_JUMPS = 8;
// 閃電鏈：每跳傷害保留比例（遞減係數）
export const CHAIN_LIGHTNING_FALLOFF = 0.82;
// 閃電鏈：命中眩暈時間 (ms)
export const CHAIN_LIGHTNING_STUN_DURATION = 600;
// 閃電鏈：相鄰彈跳的最大格距
export const CHAIN_LIGHTNING_JUMP_RANGE = 3.5;
// 聖光治療：恢復基地生命量（封頂於初始滿血值）
export const HOLY_HEAL_AMOUNT = 25;
// 聖光治療：被淨化的敵方增益狀態類型
export const HOLY_HEAL_PURGE_BUFFS = ['haste', 'berserk', 'regen', 'immune', 'shield'] as const;
// 聖盾結界：展開衝擊波的減速比例（敵人速度乘數）
export const AEGIS_SLOW_VALUE = 0.5;
// 聖盾結界：衝擊波減速持續時間 (ms)
export const AEGIS_SLOW_DURATION = 2000;
// 傳送陷阱：單次最多傳送的敵人數（取最逼近基地者）
export const WARP_TRAP_MAX_TARGETS = 6;
// 傳送陷阱：沿路徑回溯的距離（格）
export const WARP_TRAP_DISTANCE = 4;
// 傳送陷阱：首領 / 次首領的傳送距離倍率
export const WARP_TRAP_BOSS_DIST_MULT = 0.5;
// 傳送陷阱：傳送落地後的暈眩時間 (ms)
export const WARP_TRAP_STUN_DURATION = 800;
// 電磁脈衝：破盾後對本體造成的傷害
export const EMP_PULSE_DAMAGE = 40;
