import type { EnemyData, EnemyType, StatusEffectType, StatusEffectData } from '@/types/game';
import {
  FLAME_BURNING_DAMAGE_MULT,
  FROST_FROZEN_DAMAGE_MULT,
  FROST_SHATTER_DAMAGE,
  LASER_EXPOSED_DAMAGE_MULT,
  LIGHTNING_WEAKENED_DAMAGE_MULT,
  MACHINE_SILENCED_DAMAGE_MULT,
  POISON_HEAL_MULT,
  POISON_TOXIN_DAMAGE_MULT,
  PULSE_EXPOSED_DAMAGE_MULT,
  WIND_FEARED_DAMAGE_MULT,
} from '@/data/combatStatus';

// 敵人數據（速度值：1.0 = 基準速度，數值越高移動越快）
export const ENEMY_DATA: Record<EnemyType, EnemyData> = {
  normal: {
    name: '普通敵人',
    health: 80,
    speed: 1.0,
    reward: 18,
    size: 30,
    color: '#c83c3c',
    description: '基礎敵人單位，各方面屬性均衡'
  },
  fast: {
    name: '快速敵人',
    health: 50,
    speed: 1.6,
    reward: 15,
    size: 22,
    color: '#3cc83c',
    description: '移動速度快但血量較低'
  },
  elite: {
    name: '精英敵人',
    health: 120,
    speed: 1.2,
    reward: 28,
    size: 32,
    color: '#c8963c',
    description: '速度和血量都較高的精英單位'
  },
  speedy: {
    name: '極速敵人',
    health: 40,
    speed: 2.0,
    reward: 22,
    size: 18,
    color: '#3cffff',
    description: '速度極快，需要快速反應'
  },
  tank: {
    name: '坦克敵人',
    health: 200,
    speed: 0.6,
    reward: 38,
    size: 42,
    color: '#3c3cc8',
    description: '血量高但移動緩慢的坦克單位'
  },
  heavy: {
    name: '重型敵人',
    health: 280,
    speed: 0.5,
    reward: 48,
    size: 45,
    color: '#643cc8',
    description: '極高血量的重裝單位'
  },
  boss: {
    name: 'Boss',
    health: 500,
    speed: 0.5,
    reward: 100,
    size: 55,
    color: '#c83cc8',
    description: '強大的Boss單位，擁有極高血量'
  },
  flyer: {
    name: '飛行敵人',
    health: 60,
    speed: 1.4,
    reward: 28,
    size: 28,
    color: '#c8c8ff',
    ability: 'flying',
    description: '可飛行的敵人，會直線飛向終點'
  },
  healer: {
    name: '治療敵人',
    health: 100,
    speed: 0.8,
    reward: 38,
    size: 35,
    color: '#ffffff',
    ability: 'healing',
    healRadius: 80,
    healAmount: 5,
    description: '會治療周圍的敵人'
  },
  spawner: {
    name: '生產敵人',
    health: 300,
    speed: 0.4,
    reward: 58,
    size: 50,
    color: '#643232',
    ability: 'spawning',
    spawnOnDeath: { type: 'normal', count: 3 },
    description: '死亡時會分裂成數個小型敵人'
  },
  shield: {
    name: '護盾敵人',
    health: 100,
    speed: 0.9,
    reward: 35,
    size: 34,
    color: '#64c8ff',
    ability: 'shield',
    shieldAmount: 80,
    shieldRegen: 2,
    description: '擁有可再生護盾，需先擊破護盾才能造成傷害'
  },
  stealth: {
    name: '隱身敵人',
    health: 70,
    speed: 1.3,
    reward: 32,
    size: 26,
    color: '#969696',
    ability: 'stealth',
    stealthDuration: 3000,
    stealthCooldown: 5000,
    description: '會定期隱身，隱身時難以被瞄準'
  },
  berserker: {
    name: '狂戰士',
    health: 150,
    speed: 0.8,
    reward: 40,
    size: 36,
    color: '#ff3232',
    ability: 'berserk',
    berserkThreshold: 0.3,
    berserkSpeedBoost: 2.0,
    description: '血量低於30%時進入狂暴狀態，速度翻倍'
  },
  armored: {
    name: '裝甲敵人',
    health: 180,
    speed: 0.7,
    reward: 42,
    size: 40,
    color: '#808080',
    ability: 'armored',
    armorValue: 5,
    description: '厚重裝甲減少每次受到的傷害'
  },
  mage: {
    name: '法師敵人',
    health: 90,
    speed: 0.9,
    reward: 45,
    size: 30,
    color: '#c864ff',
    ability: 'teleport',
    teleportDistance: 2,
    teleportCooldown: 8000,
    description: '可向前傳送一段距離，跳過防禦區'
  },
  miniboss: {
    name: '小Boss',
    health: 350,
    speed: 0.6,
    reward: 75,
    size: 48,
    color: '#ffc864',
    ability: 'miniboss',
    description: '中型Boss，擁有較高血量和獎勵'
  },
  swarm: {
    name: '蟲群',
    health: 25,
    speed: 1.5,
    reward: 5,
    size: 16,
    color: '#96c832',
    ability: 'swarm',
    description: '單體很弱但數量眾多，容易突破防線'
  },
  ghost: {
    name: '幽靈',
    health: 85,
    speed: 1.1,
    reward: 38,
    size: 28,
    color: '#c8c8ff',
    ability: 'phase',
    phaseDuration: 2000,
    phaseCooldown: 4000,
    description: '會相位轉換，相位時完全免疫傷害'
  },
  bomber: {
    name: '爆破敵人',
    health: 120,
    speed: 0.85,
    reward: 30,
    size: 32,
    color: '#ff6432',
    ability: 'explode',
    explosionRadius: 60,
    explosionDamage: 15,
    description: '死亡時爆炸，對附近的塔造成傷害'
  },
  saboteur: {
    name: '破壞敵人',
    health: 150,
    speed: 0.9,
    reward: 45,
    size: 30,
    color: '#323232', // 深灰色
    ability: 'sabotage',
    description: '會主動尋找並破壞我方的防禦塔'
  },
  jammer: {
    name: '干擾敵人',
    health: 110,
    speed: 0.75,
    reward: 42,
    size: 32,
    color: '#a78bfa',
    ability: 'jam',
    jamRadius: 120,
    jamFireRateMult: 0.55,
    description: '靠近防禦塔時會降低攻速，塔擠在一起時特別危險'
  },
  escort: {
    name: '護航敵人',
    health: 120,
    speed: 0.7,
    reward: 44,
    size: 34,
    color: '#94a3b8',
    ability: 'escort',
    escortRadius: 110,
    escortArmor: 6,
    description: '為周圍敵人提供裝甲光環，優先擊殺才能打穿車隊'
  }
};

// 狀態效果數據
export const STATUS_EFFECTS: Record<StatusEffectType, StatusEffectData> = {
  slow: {
    name: '減速',
    description: '降低移動速度',
    icon: '🐌',
    color: '#60a5fa',
    isDebuff: true,
    canStack: false,
    maxStacks: 1
  },
  poison: {
    name: '中毒',
    description: `持續受到毒素傷害；毒塔與瘟疫再打傷害 ×${POISON_TOXIN_DAMAGE_MULT}，治療 ×${POISON_HEAL_MULT}`,
    icon: '☠️',
    color: '#22c55e',
    isDebuff: true,
    canStack: true,
    maxStacks: 5
  },
  burn: {
    name: '燃燒',
    description: `持續受到火焰傷害，可疊加；火焰與瘟疫再打傷害 ×${FLAME_BURNING_DAMAGE_MULT}，燃燒中護盾不回`,
    icon: '🔥',
    color: '#f97316',
    isDebuff: true,
    canStack: true,
    maxStacks: 3
  },
  freeze: {
    name: '冰凍',
    description: `完全無法移動；冰塔與暴風再打傷害 ×${FROST_FROZEN_DAMAGE_MULT}，解凍碎裂 ${FROST_SHATTER_DAMAGE}`,
    icon: '❄️',
    color: '#06b6d4',
    isDebuff: true,
    canStack: false,
    maxStacks: 1
  },
  stun: {
    name: '眩暈',
    description: '暫時無法行動；加農與攻城再打傷害 ×1.4',
    icon: '💫',
    color: '#fbbf24',
    isDebuff: true,
    canStack: false,
    maxStacks: 1
  },
  bleed: {
    name: '流血',
    description: '移動時受到傷害；散彈再打傷害 ×1.35',
    icon: '🩸',
    color: '#dc2626',
    isDebuff: true,
    canStack: true,
    maxStacks: 5
  },
  weakness: {
    name: '虛弱',
    description: `受到的傷害增加 50%；電擊與暴風再打傷害 ×${LIGHTNING_WEAKENED_DAMAGE_MULT}`,
    icon: '💔',
    color: '#a855f7',
    isDebuff: true,
    canStack: false,
    maxStacks: 1
  },
  marked: {
    name: '標記',
    description: '成為優先攻擊目標；狙擊與攻城再打傷害 ×1.5，基礎塔 ×1.35',
    icon: '🎯',
    color: '#ef4444',
    isDebuff: true,
    canStack: false,
    maxStacks: 1
  },
  exposed: {
    name: '暴露',
    description: `防禦力降低；脈衝與颶風再打傷害 ×${PULSE_EXPOSED_DAMAGE_MULT}，雷射再打傷害 ×${LASER_EXPOSED_DAMAGE_MULT}`,
    icon: '👁️',
    color: '#f472b6',
    isDebuff: true,
    canStack: true,
    maxStacks: 3
  },
  fear: {
    name: '恐懼',
    description: `短暫向後逃跑；風塔與颶風再打傷害 ×${WIND_FEARED_DAMAGE_MULT}`,
    icon: '😱',
    color: '#7c3aed',
    isDebuff: true,
    canStack: false,
    maxStacks: 1
  },
  root: {
    name: '定身',
    description: '無法移動但可被攻擊；弩砲再打傷害 ×1.4',
    icon: '🌿',
    color: '#84cc16',
    isDebuff: true,
    canStack: false,
    maxStacks: 1
  },
  curse: {
    name: '詛咒',
    description: '治療效果降低 75%',
    icon: '💀',
    color: '#6b21a8',
    isDebuff: true,
    canStack: false,
    maxStacks: 1
  },
  shield: {
    name: '護盾',
    description: '吸收一定量的傷害',
    icon: '🛡️',
    color: '#3b82f6',
    isDebuff: false,
    canStack: false,
    maxStacks: 1
  },
  regen: {
    name: '再生',
    description: '持續恢復生命值',
    icon: '💚',
    color: '#10b981',
    isDebuff: false,
    canStack: false,
    maxStacks: 1
  },
  haste: {
    name: '加速',
    description: '移動速度提升',
    icon: '⚡',
    color: '#eab308',
    isDebuff: false,
    canStack: false,
    maxStacks: 1
  },
  berserk: {
    name: '狂暴',
    description: '速度和傷害大幅提升',
    icon: '😡',
    color: '#ef4444',
    isDebuff: false,
    canStack: false,
    maxStacks: 1
  },
  immune: {
    name: '免疫',
    description: '免疫所有負面效果',
    icon: '✨',
    color: '#f59e0b',
    isDebuff: false,
    canStack: false,
    maxStacks: 1
  },
  confuse: {
    name: '混亂',
    description: '隨機改變移動方向',
    icon: '😵',
    color: '#ec4899',
    isDebuff: true,
    canStack: false,
    maxStacks: 1
  },
  silence: {
    name: '沉默',
    description: `無法使用特殊能力；機槍再打傷害 ×${MACHINE_SILENCED_DAMAGE_MULT}`,
    icon: '🤫',
    color: '#64748b',
    isDebuff: true,
    canStack: false,
    maxStacks: 1
  },
  petrify: {
    name: '石化',
    description: '完全無法行動，受到傷害減半',
    icon: '🗿',
    color: '#78716c',
    isDebuff: true,
    canStack: false,
    maxStacks: 1
  },
  wind: {
    name: '擊退',
    description: '被風力吹離路徑，正在努力走回',
    icon: '🌪️',
    color: '#a8d8ea',
    isDebuff: true,
    canStack: false,
    maxStacks: 1
  },
  frostbite: {
    name: '冰霜',
    description: '疊滿三層會凍結，期間無法移動',
    icon: 'frostbite',
    color: '#bae6fd',
    isDebuff: true,
    canStack: true,
    maxStacks: 3
  }
};
