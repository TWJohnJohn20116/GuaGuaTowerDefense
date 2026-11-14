import {
  BALLISTA_ROOT_DURATION,
  BALLISTA_ROOTED_DAMAGE_MULT,
  BASIC_MARKED_DAMAGE_MULT,
  CANNON_STUN_DURATION,
  CANNON_STUNNED_DAMAGE_MULT,
  FLAME_BURNING_DAMAGE_MULT,
  FROST_FROZEN_DAMAGE_MULT,
  FROST_SHATTER_DAMAGE,
  LASER_EXECUTE_HP_RATIO,
  LASER_EXPOSED_DAMAGE_MULT,
  LIGHTNING_WEAKENED_DAMAGE_MULT,
  LIGHTNING_WEAKNESS_DURATION,
  MACHINE_SILENCE_DURATION,
  MACHINE_SILENCED_DAMAGE_MULT,
  POISON_TOXIN_DAMAGE_MULT,
  PULSE_EXPOSED_DAMAGE_MULT,
  SHOTGUN_BLEED_DURATION,
  SHOTGUN_BLEEDING_DAMAGE_MULT,
  SNIPER_MARK_DURATION,
  SNIPER_MARKED_DAMAGE_MULT,
  WIND_FEARED_DAMAGE_MULT,
  WIND_FLYER_DAMAGE_MULT,
} from '@/data/combatStatus';

export interface CombatIdentityPill {
  label: string;
  current: string;
  color: string;
  mult?: number;
}

function pct(mult: number): string {
  return `+${Math.round((mult - 1) * 100)}%`;
}

function sec(ms: number): string {
  return `${ms / 1000} 秒`;
}

const FROST_PILLS: CombatIdentityPill[] = [
  { label: '凍結碎裂', current: `${FROST_SHATTER_DAMAGE}`, color: 'text-sky-300/90' },
  { label: '凍結追擊', current: pct(FROST_FROZEN_DAMAGE_MULT), color: 'text-cyan-200/90', mult: FROST_FROZEN_DAMAGE_MULT },
];

const LIGHTNING_PILLS: CombatIdentityPill[] = [
  { label: '追弱', current: pct(LIGHTNING_WEAKENED_DAMAGE_MULT), color: 'text-yellow-300/90', mult: LIGHTNING_WEAKENED_DAMAGE_MULT },
  { label: '虛弱', current: sec(LIGHTNING_WEAKNESS_DURATION), color: 'text-amber-200/90' },
];

const LASER_PILLS: CombatIdentityPill[] = [
  { label: '追破', current: pct(LASER_EXPOSED_DAMAGE_MULT), color: 'text-fuchsia-300/90', mult: LASER_EXPOSED_DAMAGE_MULT },
  { label: '處決', current: `≤${Math.round(LASER_EXECUTE_HP_RATIO * 100)}%`, color: 'text-pink-200/90' },
];

const CANNON_PILLS: CombatIdentityPill[] = [
  { label: '暈眩碾壓', current: pct(CANNON_STUNNED_DAMAGE_MULT), color: 'text-orange-300/90', mult: CANNON_STUNNED_DAMAGE_MULT },
  { label: '濺射控場', current: sec(CANNON_STUN_DURATION), color: 'text-amber-200/90' },
];

const PULSE_PILLS: CombatIdentityPill[] = [
  { label: '破甲追擊', current: pct(PULSE_EXPOSED_DAMAGE_MULT), color: 'text-cyan-300/90', mult: PULSE_EXPOSED_DAMAGE_MULT },
  { label: '能量環', current: '全域', color: 'text-sky-200/90' },
];

const WIND_PILLS: CombatIdentityPill[] = [
  { label: '對空加傷', current: pct(WIND_FLYER_DAMAGE_MULT), color: 'text-teal-300/90', mult: WIND_FLYER_DAMAGE_MULT },
  { label: '恐懼追擊', current: pct(WIND_FEARED_DAMAGE_MULT), color: 'text-sky-200/90', mult: WIND_FEARED_DAMAGE_MULT },
];

const FLAME_PILLS: CombatIdentityPill[] = [
  { label: '追燃', current: pct(FLAME_BURNING_DAMAGE_MULT), color: 'text-orange-400/90', mult: FLAME_BURNING_DAMAGE_MULT },
  { label: '壓盾', current: '燃燒中', color: 'text-amber-200/90' },
];

const POISON_PILLS: CombatIdentityPill[] = [
  { label: '追毒', current: pct(POISON_TOXIN_DAMAGE_MULT), color: 'text-lime-300/90', mult: POISON_TOXIN_DAMAGE_MULT },
  { label: '抗療', current: '中毒中', color: 'text-green-200/90' },
];

const MACHINE_PILLS: CombatIdentityPill[] = [
  { label: '壓制追擊', current: pct(MACHINE_SILENCED_DAMAGE_MULT), color: 'text-emerald-300/90', mult: MACHINE_SILENCED_DAMAGE_MULT },
  { label: '沉默', current: sec(MACHINE_SILENCE_DURATION), color: 'text-lime-200/90' },
];

const BASIC_PILLS: CombatIdentityPill[] = [
  { label: '追標', current: pct(BASIC_MARKED_DAMAGE_MULT), color: 'text-sky-300/90', mult: BASIC_MARKED_DAMAGE_MULT },
  { label: '狙擊標記', current: '需標記', color: 'text-blue-200/90' },
];

const SNIPER_PILLS: CombatIdentityPill[] = [
  { label: '追標', current: pct(SNIPER_MARKED_DAMAGE_MULT), color: 'text-red-300/90', mult: SNIPER_MARKED_DAMAGE_MULT },
  { label: '標記', current: sec(SNIPER_MARK_DURATION), color: 'text-rose-200/90' },
];

const SHOTGUN_PILLS: CombatIdentityPill[] = [
  { label: '追血', current: pct(SHOTGUN_BLEEDING_DAMAGE_MULT), color: 'text-red-400/90', mult: SHOTGUN_BLEEDING_DAMAGE_MULT },
  { label: '流血', current: sec(SHOTGUN_BLEED_DURATION), color: 'text-rose-200/90' },
];

const BALLISTA_PILLS: CombatIdentityPill[] = [
  { label: '釘殺', current: pct(BALLISTA_ROOTED_DAMAGE_MULT), color: 'text-lime-300/90', mult: BALLISTA_ROOTED_DAMAGE_MULT },
  { label: '定身', current: sec(BALLISTA_ROOT_DURATION), color: 'text-green-200/90' },
];

/** 塔面板顯示的既有戰鬥身份；不含尚未實裝的新機制 */
export function getTowerCombatIdentityPills(towerType: string): CombatIdentityPill[] {
  const pills: CombatIdentityPill[] = [];
  if (towerType === 'basic') pills.push(...BASIC_PILLS);
  if (towerType === 'sniper' || towerType === 'demolisher') pills.push(...SNIPER_PILLS);
  if (towerType === 'shotgun') pills.push(...SHOTGUN_PILLS);
  if (towerType === 'ballista') pills.push(...BALLISTA_PILLS);
  if (towerType === 'frost' || towerType === 'storm') pills.push(...FROST_PILLS);
  if (towerType === 'lightning' || towerType === 'storm') pills.push(...LIGHTNING_PILLS);
  if (towerType === 'laser') pills.push(...LASER_PILLS);
  if (towerType === 'cannon' || towerType === 'demolisher') pills.push(...CANNON_PILLS);
  if (towerType === 'pulse' || towerType === 'tempest') pills.push(...PULSE_PILLS);
  if (towerType === 'wind' || towerType === 'tempest') pills.push(...WIND_PILLS);
  if (towerType === 'flame' || towerType === 'plague') pills.push(...FLAME_PILLS);
  if (towerType === 'poison' || towerType === 'plague') pills.push(...POISON_PILLS);
  if (towerType === 'machine') pills.push(...MACHINE_PILLS);
  return pills;
}
