/** batch28：shop / mutator / achievement / statistics / daily / memorial detail */

export const BATCH28_SHOP_ROLE_KEYS = [
  'roleBasic', 'roleSniper', 'roleCannon', 'roleBallista', 'roleMachine', 'roleShotgun',
  'roleFrost', 'rolePoison', 'roleLaser', 'roleLightning', 'roleFlame', 'roleMoney', 'roleWind', 'rolePulse',
];
export const BATCH28_SHOP_TRAIT_KEYS = [
  'traitInstantHit', 'traitSplash', 'traitSlow', 'traitPoison', 'traitLaser', 'traitLightning',
  'traitFlame', 'traitMoney', 'traitWind', 'traitPulse', 'traitCrit',
];
export const BATCH28_SHOP_STAT_KEYS = [
  'statDamage', 'statRange', 'statFireRate', 'statCooldown', 'statDuration', 'statHotkey', 'statInstant',
];

export const BATCH28_MUT_DETAIL_KEYS = [
  'selectHintLine1', 'selectHintLine2', 'mapLabel', 'difficultyLabel', 'rulesLabel', 'rewardLabel',
  'endlessSuffix', 'wavesSuffix', 'diffEasy', 'diffNormal', 'diffHard', 'diffNightmare', 'diffImpossible', 'diffCustom',
];

export const BATCH28_OBS_KEYS = ['claimableShort', 'rewardPointsUnit', 'keyboardHint'];
export const BATCH28_STATS_DETAIL_KEYS = ['selectHintLine1', 'selectHintLine2'];
export const BATCH28_DAILY_KEYS = ['emptySelectHint1', 'emptySelectHint2'];
export const BATCH28_MEM_DETAIL_KEYS = ['selectHintLine1', 'selectHintLine2', 'backToList', 'intro', 'story', 'lastWords', 'restInPeace', 'ageUnit'];

const ZH_SHOP_ROLES = {
  roleBasic: '均衡入門', roleSniper: '遠程狙殺', roleCannon: '範圍轟炸', roleBallista: '直線貫穿',
  roleMachine: '高速輸出', roleShotgun: '近戰爆發', roleFrost: '減速控場', rolePoison: '持續毒傷',
  roleLaser: '單體聚焦', roleLightning: '連鎖打擊', roleFlame: '近域燒灼', roleMoney: '經濟產出',
  roleWind: '擊退守門', rolePulse: '全域脈衝',
};
const EN_SHOP_ROLES = {
  roleBasic: 'Balanced starter', roleSniper: 'Long-range sniper', roleCannon: 'Area splash', roleBallista: 'Line pierce',
  roleMachine: 'High fire rate', roleShotgun: 'Close burst', roleFrost: 'Slow control', rolePoison: 'DoT poison',
  roleLaser: 'Single-target beam', roleLightning: 'Chain lightning', roleFlame: 'Close burn', roleMoney: 'Economy',
  roleWind: 'Knockback guard', rolePulse: 'Global pulse',
};
const ZH_SHOP_TRAITS = {
  traitInstantHit: '瞬間命中', traitSplash: '範圍濺射', traitSlow: '減速控場', traitPoison: '劇毒持續',
  traitLaser: '持續光束', traitLightning: '連鎖閃電', traitFlame: '燃燒噴射', traitMoney: '產出金幣',
  traitWind: '擊退氣流', traitPulse: '全域脈衝', traitCrit: '可暴擊',
};
const EN_SHOP_TRAITS = {
  traitInstantHit: 'Instant hit', traitSplash: 'Splash damage', traitSlow: 'Slow control', traitPoison: 'Poison DoT',
  traitLaser: 'Beam', traitLightning: 'Chain lightning', traitFlame: 'Flame jet', traitMoney: 'Generates gold',
  traitWind: 'Knockback', traitPulse: 'Global pulse', traitCrit: 'Can crit',
};
const ZH_SHOP_STATS = {
  statDamage: '傷害', statRange: '射程', statFireRate: '攻速', statCooldown: '冷卻',
  statDuration: '持續', statHotkey: '快捷鍵', statInstant: '即時',
};
const EN_SHOP_STATS = {
  statDamage: 'Damage', statRange: 'Range', statFireRate: 'Fire rate', statCooldown: 'Cooldown',
  statDuration: 'Duration', statHotkey: 'Hotkey', statInstant: 'Instant',
};

const ZH_MUT = {
  selectHintLine1: '點選左側挑戰', selectHintLine2: '查看規則與獎勵',
  mapLabel: '地圖', difficultyLabel: '難度', rulesLabel: '突變規則', rewardLabel: '獎勵',
  endlessSuffix: ' · 無盡', wavesSuffix: ' · {count} 波',
  diffEasy: '簡單', diffNormal: '普通', diffHard: '困難', diffNightmare: '夢魘', diffImpossible: '地獄', diffCustom: '自訂',
};
const EN_MUT = {
  selectHintLine1: 'Select a challenge on the left', selectHintLine2: 'to view rules and rewards',
  mapLabel: 'Map', difficultyLabel: 'Difficulty', rulesLabel: 'Mutator rules', rewardLabel: 'Rewards',
  endlessSuffix: ' · Endless', wavesSuffix: ' · {count} waves',
  diffEasy: 'Easy', diffNormal: 'Normal', diffHard: 'Hard', diffNightmare: 'Nightmare', diffImpossible: 'Hell', diffCustom: 'Custom',
};

const ZH_OBS = { claimableShort: '可領', rewardPointsUnit: '{value} 點', keyboardHint: '← → 切換 · Enter 跳轉' };
const EN_OBS = { claimableShort: 'Claim', rewardPointsUnit: '{value} pts', keyboardHint: '← → switch · Enter go' };

const ZH_STATS = { selectHintLine1: '點選左側戰局', selectHintLine2: '查看詳細數據' };
const EN_STATS = { selectHintLine1: 'Select a match on the left', selectHintLine2: 'to view detailed stats' };

const ZH_DAILY = { emptySelectHint1: '尚無今日挑戰', emptySelectHint2: '請稍後再試' };
const EN_DAILY = { emptySelectHint1: 'No daily challenge yet', emptySelectHint2: 'Please check back later' };

const ZH_MEM_DETAIL = {
  selectHintLine1: '點選左側紀念卡', selectHintLine2: '閱讀英雄故事', backToList: '返回名單',
  intro: '簡介', story: '生平故事', lastWords: '最後的話', restInPeace: '願您在初泉河畔安息', ageUnit: '歲',
};
const EN_MEM_DETAIL = {
  selectHintLine1: 'Select a memorial card on the left', selectHintLine2: 'to read their story', backToList: 'Back to roster',
  intro: 'Intro', story: 'Life story', lastWords: 'Last words', restInPeace: 'Rest in peace by the First Spring', ageUnit: 'yrs',
};

const MAP = (zh, en) => ({
  'zh-TW': zh, 'zh-CN': zh, en, ja: en, ko: en, de: en, fr: en, es: en, ru: en, pt: en,
});

export function getBatch28ShopRoles(loc) { return { ...EN_SHOP_ROLES, ...MAP(ZH_SHOP_ROLES, EN_SHOP_ROLES)[loc] }; }
export function getBatch28ShopTraits(loc) { return { ...EN_SHOP_TRAITS, ...MAP(ZH_SHOP_TRAITS, EN_SHOP_TRAITS)[loc] }; }
export function getBatch28ShopStats(loc) { return { ...EN_SHOP_STATS, ...MAP(ZH_SHOP_STATS, EN_SHOP_STATS)[loc] }; }
export function getBatch28MutDetail(loc) { return { ...EN_MUT, ...MAP(ZH_MUT, EN_MUT)[loc] }; }
export function getBatch28Obs(loc) { return { ...EN_OBS, ...MAP(ZH_OBS, EN_OBS)[loc] }; }
export function getBatch28StatsDetail(loc) { return { ...EN_STATS, ...MAP(ZH_STATS, EN_STATS)[loc] }; }
export function getBatch28Daily(loc) { return { ...EN_DAILY, ...MAP(ZH_DAILY, EN_DAILY)[loc] }; }
export function getBatch28MemDetail(loc) { return { ...EN_MEM_DETAIL, ...MAP(ZH_MEM_DETAIL, EN_MEM_DETAIL)[loc] }; }

function lines(keys, data, indent) {
  const pad = ' '.repeat(indent);
  return keys.map((k) => `${pad}${k}: ${JSON.stringify(data[k])},`).join('\n');
}

export function formatShopRoleLines(loc) { return lines(BATCH28_SHOP_ROLE_KEYS, getBatch28ShopRoles(loc), 4); }
export function formatShopTraitLines(loc) { return lines(BATCH28_SHOP_TRAIT_KEYS, getBatch28ShopTraits(loc), 4); }
export function formatShopStatLines(loc) { return lines(BATCH28_SHOP_STAT_KEYS, getBatch28ShopStats(loc), 4); }
export function formatMutDetailLines(loc) { return lines(BATCH28_MUT_DETAIL_KEYS, getBatch28MutDetail(loc), 6); }
export function formatObsLines(loc) { return lines(BATCH28_OBS_KEYS, getBatch28Obs(loc), 6); }
export function formatStatsDetailLines(loc) { return lines(BATCH28_STATS_DETAIL_KEYS, getBatch28StatsDetail(loc), 6); }
export function formatDailyLines(loc) { return lines(BATCH28_DAILY_KEYS, getBatch28Daily(loc), 4); }
export function formatMemDetailBlock(loc) {
  const d = getBatch28MemDetail(loc);
  return `    detail: {\n${lines(BATCH28_MEM_DETAIL_KEYS, d, 6)}\n    },`;
}
