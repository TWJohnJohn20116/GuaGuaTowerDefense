import type { TowerSkill, SkillType, TowerType } from '@/types/game';

// 所有技能定義
export const SKILL_DATA: Record<SkillType, TowerSkill> = {
  overcharge: {
    id: 'overcharge',
    name: '超載',
    description: '大幅提升攻擊速度持續5秒',
    icon: '⚡',
    cooldown: 15000,
    duration: 5000,
    effectMultiplier: 3, // 攻速x3
  },
  precision: {
    id: 'precision',
    name: '精準射擊',
    description: '下一次攻擊造成3倍傷害',
    icon: '🎯',
    cooldown: 12000,
    duration: -1, // 瞬發，持續到下次攻擊
    effectMultiplier: 3,
  },
  barrage: {
    id: 'barrage',
    name: '彈幕風暴',
    description: '同時攻擊範圍內所有敵人',
    icon: '💥',
    cooldown: 20000,
    duration: 3000,
  },
  freeze_blast: {
    id: 'freeze_blast',
    name: '冰凍爆發',
    description: '凍結範圍內所有敵人3秒',
    icon: '❄️',
    cooldown: 25000,
    duration: 0,
    range: 4, // 格子，不是攻擊像素
    effectMultiplier: 1, // 100%減速
  },
  toxic_cloud: {
    id: 'toxic_cloud',
    name: '毒霧擴散',
    description: '釋放毒雲，持續造成傷害',
    icon: '☠️',
    cooldown: 18000,
    duration: 6000,
    damage: 5,
    range: 120,
  },
  chain_surge: {
    id: 'chain_surge',
    name: '連鎖激流',
    description: '電擊連鎖數量翻倍',
    icon: '🔗',
    cooldown: 15000,
    duration: 8000,
    effectMultiplier: 2, // 連鎖數x2
  },
  inferno: {
    id: 'inferno',
    name: '地獄烈焰',
    description: '在目標位置創建火焰區域',
    icon: '🔥',
    cooldown: 22000,
    duration: 5000,
    damage: 15,
    range: 100,
  },
  sniper_focus: {
    id: 'sniper_focus',
    name: '專注狙擊',
    description: '下一次攻擊造成5倍傷害',
    icon: '🔭',
    cooldown: 20000,
    duration: -1,
    effectMultiplier: 5,
  },
  repair: {
    id: 'repair',
    name: '戰術修復',
    description: '減少周圍塔50%技能冷卻',
    icon: '🔧',
    cooldown: 30000,
    duration: 0,
    range: 5, // 格子，不是攻擊像素
    effectMultiplier: 0.5,
  },
  // ===== 融合塔專屬技能 =====
  storm_surge: {
    id: 'storm_surge',
    name: '暴風雷暴',
    description: '召喚雷暴，全場連鎖閃電並凍結命中敵人',
    icon: '🌩️',
    cooldown: 24000,
    duration: 0,
    range: 200,
    effectMultiplier: 1.5,
  },
  plague_burst: {
    id: 'plague_burst',
    name: '瘟疫爆發',
    description: '釋放劇毒烈焰雲，大範圍持續灼燒與中毒',
    icon: '☣️',
    cooldown: 22000,
    duration: 0,
    range: 4.5,
  },
  siege_volley: {
    id: 'siege_volley',
    name: '攻城齊射',
    description: '對最遠處敵人發射三連重型濺射彈',
    icon: '💣',
    cooldown: 26000,
    duration: 0,
    range: 200,
    effectMultiplier: 2.5,
  },
  tempest_blast: {
    id: 'tempest_blast',
    name: '颶風爆破',
    description: '釋放衝擊波，全場擊退並造成脈衝傷害',
    icon: '🌀',
    cooldown: 23000,
    duration: 0,
    range: 200,
    effectMultiplier: 1.8,
  },
};

/** 地圖格數不會超過這個門檻；更大的 range 視為舊像素值。 */
const SKILL_RANGE_CELL_MAX = 16;
const SKILL_RANGE_PIXELS_PER_CELL = 28;

/** 技能範圍（格子）。≤16 當格，更大則除以 28 轉格。 */
export function getSkillRangeCells(
  skill: { range?: number },
  fallback = 4,
): number {
  const range = skill.range;
  if (range == null || !(range > 0)) return fallback;
  if (range <= SKILL_RANGE_CELL_MAX) return range;
  return range / SKILL_RANGE_PIXELS_PER_CELL;
}

/** 把剩餘冷卻乘上 keepFraction（戰術修復 0.5 = 砍半）。已就緒或未用過不變。 */
export function applySkillCooldownReduction(
  lastUsedTime: number,
  now: number,
  cooldown: number,
  keepFraction = 0.5,
): number {
  if (lastUsedTime <= 0 || cooldown <= 0) return lastUsedTime;
  const elapsed = now - lastUsedTime;
  if (elapsed >= cooldown) return lastUsedTime;
  const remaining = cooldown - elapsed;
  const newRemaining = remaining * keepFraction;
  return now - (cooldown - newRemaining);
}

/** 彈幕生效時對範圍內所有敵人開火；否則只打主目標。 */
export function getSkillFireTargets<T>(
  skill: { skillId: string; isActive: boolean } | undefined,
  enemiesInRange: T[],
  primaryTarget: T | null,
): T[] {
  if (skill?.isActive && skill.skillId === 'barrage' && enemiesInRange.length > 0) {
    return enemiesInRange;
  }
  return primaryTarget ? [primaryTarget] : [];
}

// 塔類型對應的技能
export const TOWER_SKILLS: Record<TowerType, SkillType> = {
  basic: 'overcharge',
  sniper: 'sniper_focus',
  cannon: 'barrage',
  machine: 'overcharge',
  shotgun: 'barrage',
  ballista: 'precision',
  frost: 'freeze_blast',
  poison: 'toxic_cloud',
  laser: 'precision',
  lightning: 'chain_surge',
  flame: 'inferno',
  money: 'repair',
  wind: 'freeze_blast',
  pulse: 'overcharge',
  // 融合塔
  storm: 'storm_surge',
  plague: 'plague_burst',
  demolisher: 'siege_volley',
  tempest: 'tempest_blast',
};

// 獲取塔的技能數據
export const getTowerSkill = (towerType: TowerType): TowerSkill => {
  const skillType = TOWER_SKILLS[towerType];
  return SKILL_DATA[skillType];
};

// 檢查技能是否可用（冷卻完成）
export const isSkillReady = (lastUsedTime: number, cooldown: number): boolean => {
  return Date.now() - lastUsedTime >= cooldown;
};

// 獲取技能冷卻百分比 (0-1)
export const getSkillCooldownPercent = (lastUsedTime: number, cooldown: number): number => {
  const elapsed = Date.now() - lastUsedTime;
  if (elapsed >= cooldown) return 1;
  return elapsed / cooldown;
};

// 獲取技能剩餘冷卻時間（秒）
export const getSkillRemainingCooldown = (lastUsedTime: number, cooldown: number): number => {
  const elapsed = Date.now() - lastUsedTime;
  if (elapsed >= cooldown) return 0;
  return Math.ceil((cooldown - elapsed) / 1000);
};
