/**
 * 波間戰術協議
 *
 * 每完成奇數波後，從協議池抽出 3 張給玩家三選一。
 * 即時效果立刻結算；波次效果只在下一波戰鬥中生效。
 */

type ProtocolEffectKind =
  | 'money'
  | 'health'
  | 'towerFireRate'
  | 'towerRange'
  | 'towerCrit'
  | 'enemySlow'
  | 'enemyReward'
  | 'nextTowerDiscount'
  | 'revealStealth'
  | 'enemyHealth'
  | 'leakGuard'
  | 'waveClearBonus'
  | 'towerDamage'
  | 'towerIncome';

type ProtocolAccent = 'cyan' | 'amber' | 'emerald' | 'violet' | 'blue' | 'rose';

export type ProtocolIconKey =
  | 'coin'
  | 'heart'
  | 'zap'
  | 'crosshair'
  | 'snowflake'
  | 'moneyBag'
  | 'eye'
  | 'construction'
  | 'target'
  | 'shield';

export interface TacticalProtocol {
  id: string;
  name: string;
  description: string;
  accent: ProtocolAccent;
  icon: ProtocolIconKey;
  duration: 'instant' | 'nextWave';
  effect: {
    kind: ProtocolEffectKind;
    value: number;
  };
}

interface ProtocolWaveMods {
  fireRateMult: number;
  rangeMult: number;
  critChanceAdd: number;
  enemyRewardMult: number;
  enemySlow: number;
  revealStealth: boolean;
  enemyHealthMult: number;
  leakDamageMult: number;
  waveClearBonus: number;
  damageMult: number;
  incomeMult: number;
}

interface ProtocolInstantGrant {
  money: number;
  health: number;
  nextTowerDiscount: number;
}

type AutoBattleStrategy = 'balanced' | 'economy' | 'aggressive' | 'defensive';

export const TACTICAL_PROTOCOLS: TacticalProtocol[] = [
  {
    id: 'supply_drop',
    name: '補給空投',
    description: '立即獲得 90 金錢，用來補塔或升級。',
    accent: 'amber',
    icon: 'coin',
    duration: 'instant',
    effect: { kind: 'money', value: 90 },
  },
  {
    id: 'fortify',
    name: '加固工事',
    description: '立即恢復 8 點基地生命。',
    accent: 'rose',
    icon: 'heart',
    duration: 'instant',
    effect: { kind: 'health', value: 8 },
  },
  {
    id: 'overclock',
    name: '過載協議',
    description: '下一波全塔攻速提升 28%。',
    accent: 'cyan',
    icon: 'zap',
    duration: 'nextWave',
    effect: { kind: 'towerFireRate', value: 1.28 },
  },
  {
    id: 'range_amp',
    name: '射程擴張',
    description: '下一波全塔射程提升 18%。',
    accent: 'blue',
    icon: 'crosshair',
    duration: 'nextWave',
    effect: { kind: 'towerRange', value: 1.18 },
  },
  {
    id: 'frost_line',
    name: '冰封防線',
    description: '下一波敵人出生時被減速 40%，持續整波。',
    accent: 'cyan',
    icon: 'snowflake',
    duration: 'nextWave',
    effect: { kind: 'enemySlow', value: 0.4 },
  },
  {
    id: 'bounty',
    name: '賞金令',
    description: '下一波擊殺賞金提升 40%。',
    accent: 'amber',
    icon: 'moneyBag',
    duration: 'nextWave',
    effect: { kind: 'enemyReward', value: 1.4 },
  },
  {
    id: 'recon_flare',
    name: '偵察閃光',
    description: '下一波隱身敵人無法躲過鎖定。',
    accent: 'violet',
    icon: 'eye',
    duration: 'nextWave',
    effect: { kind: 'revealStealth', value: 1 },
  },
  {
    id: 'rush_permit',
    name: '急建許可',
    description: '下一座塔建造費用減 45%。',
    accent: 'emerald',
    icon: 'construction',
    duration: 'instant',
    effect: { kind: 'nextTowerDiscount', value: 0.45 },
  },
  {
    id: 'precision_ammo',
    name: '精準彈藥',
    description: '下一波全塔暴擊率 +15%。',
    accent: 'violet',
    icon: 'target',
    duration: 'nextWave',
    effect: { kind: 'towerCrit', value: 0.15 },
  },
  {
    id: 'war_chest',
    name: '戰備金箱',
    description: '立即獲得 150 金錢，用來補線或升滿關鍵塔。',
    accent: 'amber',
    icon: 'coin',
    duration: 'instant',
    effect: { kind: 'money', value: 150 },
  },
  {
    id: 'salvo',
    name: '齊射協議',
    description: '下一波全塔攻速提升 38%。',
    accent: 'rose',
    icon: 'zap',
    duration: 'nextWave',
    effect: { kind: 'towerFireRate', value: 1.38 },
  },
  {
    id: 'wide_net',
    name: '廣域鎖定',
    description: '下一波全塔射程提升 26%。',
    accent: 'blue',
    icon: 'crosshair',
    duration: 'nextWave',
    effect: { kind: 'towerRange', value: 1.26 },
  },
  {
    id: 'weakness_scan',
    name: '弱點掃描',
    description: '下一波敵人生命降低 18%，方便集火突破。',
    accent: 'violet',
    icon: 'eye',
    duration: 'nextWave',
    effect: { kind: 'enemyHealth', value: 0.82 },
  },
  {
    id: 'aegis_line',
    name: '神盾防線',
    description: '下一波漏怪對基地的傷害減半。',
    accent: 'emerald',
    icon: 'shield',
    duration: 'nextWave',
    effect: { kind: 'leakGuard', value: 0.5 },
  },
  {
    id: 'salvage_rights',
    name: '回收權',
    description: '下一波清場後額外獲得 120 金錢。',
    accent: 'amber',
    icon: 'moneyBag',
    duration: 'nextWave',
    effect: { kind: 'waveClearBonus', value: 120 },
  },
  {
    id: 'medevac',
    name: '戰地後送',
    description: '立即恢復 16 點基地生命，穩住漏怪後的防線。',
    accent: 'rose',
    icon: 'heart',
    duration: 'instant',
    effect: { kind: 'health', value: 16 },
  },
  {
    id: 'deep_freeze',
    name: '深凍協議',
    description: '下一波敵人出生時被減速 55%，持續整波。',
    accent: 'cyan',
    icon: 'snowflake',
    duration: 'nextWave',
    effect: { kind: 'enemySlow', value: 0.55 },
  },
  {
    id: 'crit_storm',
    name: '暴擊風暴',
    description: '下一波全塔暴擊率 +22%。',
    accent: 'violet',
    icon: 'target',
    duration: 'nextWave',
    effect: { kind: 'towerCrit', value: 0.22 },
  },
  {
    id: 'plunder',
    name: '掠奪令',
    description: '下一波擊殺賞金提升 65%。',
    accent: 'amber',
    icon: 'moneyBag',
    duration: 'nextWave',
    effect: { kind: 'enemyReward', value: 1.65 },
  },
  {
    id: 'express_permit',
    name: '特急許可',
    description: '下一座塔建造費用減 60%。',
    accent: 'emerald',
    icon: 'construction',
    duration: 'instant',
    effect: { kind: 'nextTowerDiscount', value: 0.6 },
  },
  {
    id: 'scavenge',
    name: '戰場搜刮',
    description: '下一波清場後額外獲得 200 金錢。',
    accent: 'amber',
    icon: 'coin',
    duration: 'nextWave',
    effect: { kind: 'waveClearBonus', value: 200 },
  },
  {
    id: 'kill_zone',
    name: '殺傷區',
    description: '下一波全塔傷害提升 22%。',
    accent: 'rose',
    icon: 'target',
    duration: 'nextWave',
    effect: { kind: 'towerDamage', value: 1.22 },
  },
  {
    id: 'field_hospital',
    name: '野戰醫院',
    description: '立即恢復 22 點基地生命，撐過漏怪後的危局。',
    accent: 'rose',
    icon: 'heart',
    duration: 'instant',
    effect: { kind: 'health', value: 22 },
  },
  {
    id: 'shatter',
    name: '粉碎協議',
    description: '下一波敵人生命降低 28%，裝甲與護航也比較好打穿。',
    accent: 'violet',
    icon: 'eye',
    duration: 'nextWave',
    effect: { kind: 'enemyHealth', value: 0.72 },
  },
  {
    id: 'mint',
    name: '鑄幣廠',
    description: '下一波金錢塔產金提升 50%，用來把經濟線拉起來。',
    accent: 'amber',
    icon: 'coin',
    duration: 'nextWave',
    effect: { kind: 'towerIncome', value: 1.5 },
  },
  {
    id: 'iron_curtain',
    name: '鐵幕',
    description: '下一波漏怪對基地的傷害降為 35%。',
    accent: 'emerald',
    icon: 'shield',
    duration: 'nextWave',
    effect: { kind: 'leakGuard', value: 0.35 },
  },
  {
    id: 'headhunter',
    name: '獵頭協議',
    description: '下一波全塔暴擊率 +28%，方便點掉精英與治療。',
    accent: 'violet',
    icon: 'target',
    duration: 'nextWave',
    effect: { kind: 'towerCrit', value: 0.28 },
  },
  {
    id: 'stockpile',
    name: '屯積協議',
    description: '下一波清場後額外獲得 280 金錢，用來把下一波防線補滿。',
    accent: 'amber',
    icon: 'moneyBag',
    duration: 'nextWave',
    effect: { kind: 'waveClearBonus', value: 280 },
  },
  {
    id: 'ice_age',
    name: '冰河期',
    description: '下一波敵人出生時被減速 65%，持續整波。',
    accent: 'cyan',
    icon: 'snowflake',
    duration: 'nextWave',
    effect: { kind: 'enemySlow', value: 0.65 },
  },
  {
    id: 'bullseye',
    name: '準星協議',
    description: '下一波全塔暴擊率 +32%，方便點掉治療與精英。',
    accent: 'violet',
    icon: 'target',
    duration: 'nextWave',
    effect: { kind: 'towerCrit', value: 0.32 },
  },
  {
    id: 'payday',
    name: '發薪日',
    description: '立即獲得 200 金錢，用來把關鍵塔升滿或補第二條線。',
    accent: 'amber',
    icon: 'coin',
    duration: 'instant',
    effect: { kind: 'money', value: 200 },
  },
  {
    id: 'overwatch',
    name: '超視協議',
    description: '下一波全塔射程提升 32%，方便在閘門與盤繞上提前開火。',
    accent: 'blue',
    icon: 'crosshair',
    duration: 'nextWave',
    effect: { kind: 'towerRange', value: 1.32 },
  },
  {
    id: 'culling',
    name: '淘汰協議',
    description: '下一波敵人生命降低 32%，狂戰士與巢穴也比較好打穿。',
    accent: 'violet',
    icon: 'eye',
    duration: 'nextWave',
    effect: { kind: 'enemyHealth', value: 0.68 },
  },
  {
    id: 'windfall',
    name: '橫財',
    description: '立即獲得 240 金錢，用來把第二條線一次補滿。',
    accent: 'amber',
    icon: 'coin',
    duration: 'instant',
    effect: { kind: 'money', value: 240 },
  },
  {
    id: 'longshot',
    name: '遠眺協議',
    description: '下一波全塔射程提升 38%，方便在稜鏡與層瀑上提前開火。',
    accent: 'blue',
    icon: 'crosshair',
    duration: 'nextWave',
    effect: { kind: 'towerRange', value: 1.38 },
  },
  {
    id: 'execute',
    name: '處決協議',
    description: '下一波敵人生命降低 38%，重裝與炸彈也比較好打穿。',
    accent: 'violet',
    icon: 'eye',
    duration: 'nextWave',
    effect: { kind: 'enemyHealth', value: 0.62 },
  },
  {
    id: 'haul',
    name: '大運',
    description: '立即獲得 280 金錢，用來一次補滿第二條線。',
    accent: 'amber',
    icon: 'coin',
    duration: 'instant',
    effect: { kind: 'money', value: 280 },
  },
  {
    id: 'glacier',
    name: '冰川協議',
    description: '下一波敵人出生時被減速 75%，持續整波。',
    accent: 'cyan',
    icon: 'snowflake',
    duration: 'nextWave',
    effect: { kind: 'enemySlow', value: 0.75 },
  },
  {
    id: 'purge',
    name: '清算協議',
    description: '下一波敵人生命降低 44%，精英與破壞者也比較好打穿。',
    accent: 'violet',
    icon: 'eye',
    duration: 'nextWave',
    effect: { kind: 'enemyHealth', value: 0.56 },
  },
];

/** 完成第 1、3、5… 波後提供協議（下一波為偶數波）；終局勝利不再出牌 */
export function shouldOfferProtocol(
  currentWave: number,
  tutorialActive: boolean,
  match?: { maxWaves: number; endlessMode: boolean },
): boolean {
  if (tutorialActive) return false;
  if (match && !match.endlessMode && match.maxWaves > 0 && currentWave >= match.maxWaves) return false;
  return currentWave > 0 && currentWave % 2 === 1;
}

function hashSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleInPlace<T>(items: T[], rand: () => number): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = items[i];
    items[i] = items[j];
    items[j] = tmp;
  }
  return items;
}

export function pickProtocolOffers(
  currentWave: number,
  seed: string,
  recentIds: string[],
): TacticalProtocol[] {
  const rand = mulberry32(hashSeed(`${seed}#${currentWave}`));
  const recent = new Set(recentIds);
  const fresh = TACTICAL_PROTOCOLS.filter((p) => !recent.has(p.id));
  const pool = fresh.length >= 3 ? fresh : [...TACTICAL_PROTOCOLS];
  const shuffled = shuffleInPlace([...pool], rand);
  return shuffled.slice(0, 3);
}

const IDENTITY_MODS: ProtocolWaveMods = {
  fireRateMult: 1,
  rangeMult: 1,
  critChanceAdd: 0,
  enemyRewardMult: 1,
  enemySlow: 0,
  revealStealth: false,
  enemyHealthMult: 1,
  leakDamageMult: 1,
  waveClearBonus: 0,
  damageMult: 1,
  incomeMult: 1,
};

export function getProtocolWaveMods(protocol: TacticalProtocol | null): ProtocolWaveMods {
  if (!protocol) return IDENTITY_MODS;
  switch (protocol.effect.kind) {
    case 'towerFireRate':
      return { ...IDENTITY_MODS, fireRateMult: protocol.effect.value };
    case 'towerRange':
      return { ...IDENTITY_MODS, rangeMult: protocol.effect.value };
    case 'towerCrit':
      return { ...IDENTITY_MODS, critChanceAdd: protocol.effect.value };
    case 'enemySlow':
      return { ...IDENTITY_MODS, enemySlow: protocol.effect.value };
    case 'enemyReward':
      return { ...IDENTITY_MODS, enemyRewardMult: protocol.effect.value };
    case 'revealStealth':
      return { ...IDENTITY_MODS, revealStealth: true };
    case 'enemyHealth':
      return { ...IDENTITY_MODS, enemyHealthMult: protocol.effect.value };
    case 'leakGuard':
      return { ...IDENTITY_MODS, leakDamageMult: protocol.effect.value };
    case 'waveClearBonus':
      return { ...IDENTITY_MODS, waveClearBonus: protocol.effect.value };
    case 'towerDamage':
      return { ...IDENTITY_MODS, damageMult: protocol.effect.value };
    case 'towerIncome':
      return { ...IDENTITY_MODS, incomeMult: protocol.effect.value };
    default:
      return IDENTITY_MODS;
  }
}

export function applyInstantGrant(protocol: TacticalProtocol): ProtocolInstantGrant {
  const grant: ProtocolInstantGrant = { money: 0, health: 0, nextTowerDiscount: 0 };
  switch (protocol.effect.kind) {
    case 'money':
      grant.money = protocol.effect.value;
      break;
    case 'health':
      grant.health = protocol.effect.value;
      break;
    case 'nextTowerDiscount':
      grant.nextTowerDiscount = protocol.effect.value;
      break;
    default:
      break;
  }
  return grant;
}

const STRATEGY_PREFERENCE: Record<AutoBattleStrategy, string[]> = {
  economy: ['haul', 'windfall', 'payday', 'stockpile', 'mint', 'plunder', 'scavenge', 'express_permit', 'salvage_rights', 'bounty', 'war_chest', 'supply_drop', 'rush_permit'],
  aggressive: ['purge', 'execute', 'culling', 'bullseye', 'headhunter', 'kill_zone', 'shatter', 'weakness_scan', 'crit_storm', 'salvo', 'overclock', 'precision_ammo', 'range_amp'],
  defensive: ['glacier', 'longshot', 'overwatch', 'ice_age', 'iron_curtain', 'field_hospital', 'aegis_line', 'deep_freeze', 'medevac', 'frost_line', 'fortify', 'wide_net', 'recon_flare'],
  balanced: ['kill_zone', 'weakness_scan', 'overclock', 'bounty', 'aegis_line', 'frost_line'],
};

export function pickProtocolForStrategy(
  offers: TacticalProtocol[],
  strategy: AutoBattleStrategy,
): TacticalProtocol {
  if (offers.length === 0) {
    throw new Error('pickProtocolForStrategy requires at least one offer');
  }
  const preferred = STRATEGY_PREFERENCE[strategy] ?? STRATEGY_PREFERENCE.balanced;
  for (const id of preferred) {
    const found = offers.find((p) => p.id === id);
    if (found) return found;
  }
  return offers[0];
}

export function getDiscountedTowerCost(baseCost: number, discount: number): number {
  if (discount <= 0) return Math.round(baseCost);
  return Math.max(1, Math.round(baseCost * (1 - discount)));
}

export const PROTOCOL_SLOW_DURATION_MS = 30_000;
export const PROTOCOL_HEALTH_CAP_BONUS = 20;
