// Tutorial.tsx 的數據定義 — i18n 友善版
import type { Translations } from '@/i18n';
import { TOWER_DATA, ENEMY_DATA } from '@/data/gameData';
import type { TowerType } from '@/types/game';
import { getEncyclopediaSynergiesForTower } from '@/data/towerSynergyData';

export type TutorialCategory = 'game' | 'mod';
export type GameTab =
  | 'quickstart' | 'towers' | 'enemies' | 'tips' | 'keys' | 'strategy' | 'upgrade' | 'autobattle'
  | 'playerSkills' | 'talentTree' | 'advancedTactics' | 'waveEconomy' | 'gameModes' | 'metaHub';
export type ModTab = 'intro' | 'tower' | 'enemy' | 'map' | 'export';

interface GameTabMeta {
  id: GameTab;
  icon: string;
  // 若提供則直接使用（繁體中文），否則從 i18n 取
  label?: string;
}

export const GAME_TABS_META: GameTabMeta[] = [
  { id: 'quickstart', icon: '🚀' },
  { id: 'towers', icon: '🗼' },
  { id: 'enemies', icon: '👾' },
  { id: 'strategy', icon: '🎯' },
  { id: 'upgrade', icon: '⬆️' },
  { id: 'autobattle', icon: '🤖' },
  { id: 'tips', icon: '💡' },
  { id: 'keys', icon: '⌨️' },
  // 以下為新增頁面（鎖定繁體中文，待 i18n 整合時轉換）
  { id: 'playerSkills', icon: '⚡', label: '主動技能' },
  { id: 'talentTree', icon: '🌲', label: '天賦樹' },
  { id: 'advancedTactics', icon: '⚔️', label: '進階戰術' },
  { id: 'waveEconomy', icon: '🌊', label: '波次與經濟' },
  { id: 'gameModes', icon: '🗺️', label: '遊戲模式' },
  { id: 'metaHub', icon: '🏛️', label: '元進度中心' },
];

export const buildGameTabs = (t: Translations) => GAME_TABS_META.map((m) => {
  if (m.label) return { ...m, label: m.label };
  const i18nLabel = (t.tutorial.gameTabs as Record<string, string>)[m.id] ?? m.id;
  return { ...m, label: i18nLabel };
});

export const MOD_TABS_META = [
  { id: 'intro' as const, icon: '📦' },
  { id: 'tower' as const, icon: '🗼' },
  { id: 'enemy' as const, icon: '👾' },
  { id: 'map' as const, icon: '🗺️' },
  { id: 'export' as const, icon: '📤' },
];

export const buildModTabs = (t: Translations) => MOD_TABS_META.map((m) => ({
  ...m,
  label: t.tutorial.modTabs[m.id],
}));

export const QUICK_START_ICONS = ['🗺️', '🏗️', '▶️', '⬆️', '🏆'];

export const buildQuickStartSteps = (t: Translations) => [
  { title: t.tutorial.quickStart.step1Title, description: t.tutorial.quickStart.step1Desc, icon: QUICK_START_ICONS[0], tip: t.tutorial.quickStart.step1Tip },
  { title: t.tutorial.quickStart.step2Title, description: t.tutorial.quickStart.step2Desc, icon: QUICK_START_ICONS[1], tip: t.tutorial.quickStart.step2Tip },
  { title: t.tutorial.quickStart.step3Title, description: t.tutorial.quickStart.step3Desc, icon: QUICK_START_ICONS[2], tip: t.tutorial.quickStart.step3Tip },
  { title: t.tutorial.quickStart.step4Title, description: t.tutorial.quickStart.step4Desc, icon: QUICK_START_ICONS[3], tip: t.tutorial.quickStart.step4Tip },
  { title: t.tutorial.quickStart.step5Title, description: t.tutorial.quickStart.step5Desc, icon: QUICK_START_ICONS[4], tip: t.tutorial.quickStart.step5Tip },
];

type TipKey = 'cornerPlacement' | 'slowCombo' | 'keepBudget' | 'priorityUpgrade' | 'observePath' | 'chainEffect' | 'sustainedDamage' | 'areaAttack';
export const TIPS_META: { icon: string; key: TipKey }[] = [
  { icon: '📍', key: 'cornerPlacement' },
  { icon: '❄️', key: 'slowCombo' },
  { icon: '💰', key: 'keepBudget' },
  { icon: '🎯', key: 'priorityUpgrade' },
  { icon: '👀', key: 'observePath' },
  { icon: '⚡', key: 'chainEffect' },
  { icon: '☠️', key: 'sustainedDamage' },
  { icon: '💥', key: 'areaAttack' },
];

export const buildTips = (t: Translations) => TIPS_META.map((m) => ({
  icon: m.icon,
  title: t.tutorial.tipsList[m.key].title,
  description: t.tutorial.tipsList[m.key].description,
}));

type StrategyKey = 'earlyEconomy' | 'midDevelopment' | 'lateDefense' | 'towerLayout';
export const STRATEGY_META: { icon: string; key: StrategyKey }[] = [
  { icon: '💰', key: 'earlyEconomy' },
  { icon: '📈', key: 'midDevelopment' },
  { icon: '🛡️', key: 'lateDefense' },
  { icon: '🏗️', key: 'towerLayout' },
];

export const buildStrategyGuides = (t: Translations) => STRATEGY_META.map((m) => ({
  icon: m.icon,
  title: t.tutorial.strategyGuides[m.key].title,
  points: [...t.tutorial.strategyGuides[m.key].points],
}));

export const buildUpgradeGuides = (t: Translations) => [
  {
    title: t.tutorial.upgradeGuides.pathATitle,
    description: t.tutorial.upgradeGuides.pathADesc,
    icon: '⚔️',
    color: 'text-red-400',
    benefits: [...t.tutorial.upgradeGuides.pathABenefits],
  },
  {
    title: t.tutorial.upgradeGuides.pathBTitle,
    description: t.tutorial.upgradeGuides.pathBDesc,
    icon: '✨',
    color: 'text-blue-400',
    benefits: [...t.tutorial.upgradeGuides.pathBBenefits],
  },
];

type AutoBattleKey = 'whatIs' | 'modes' | 'howEnable' | 'caveats';
export const AUTO_BATTLE_META: { icon: string; key: AutoBattleKey }[] = [
  { icon: '🤖', key: 'whatIs' },
  { icon: '🎯', key: 'modes' },
  { icon: '⚙️', key: 'howEnable' },
  { icon: '💡', key: 'caveats' },
];

export const buildAutoBattleGuides = (t: Translations) => AUTO_BATTLE_META.map((m) => ({
  icon: m.icon,
  title: t.tutorial.autoBattleGuides[m.key].title,
  content: t.tutorial.autoBattleGuides[m.key].content,
}));

// ── 模組教學 ─────────────────────────────────────────────────

type ModIntroStepKey = 'step1' | 'step2' | 'step3' | 'step4' | 'step5';
export const MOD_INTRO_STEPS_META: { icon: string; key: ModIntroStepKey }[] = [
  { icon: '📦', key: 'step1' },
  { icon: '🛠️', key: 'step2' },
  { icon: '➕', key: 'step3' },
  { icon: '🎨', key: 'step4' },
  { icon: '✅', key: 'step5' },
];

export const buildModIntroSteps = (t: Translations) => MOD_INTRO_STEPS_META.map((m) => {
  const k = m.key;
  const titleKey = `${k}Title` as 'step1Title' | 'step2Title' | 'step3Title' | 'step4Title' | 'step5Title';
  const descKey = `${k}Desc` as 'step1Desc' | 'step2Desc' | 'step3Desc' | 'step4Desc' | 'step5Desc';
  const tipKey = `${k}Tip` as 'step1Tip' | 'step2Tip' | 'step3Tip' | 'step4Tip' | 'step5Tip';
  return {
    icon: m.icon,
    title: t.tutorial.modIntro[titleKey],
    description: t.tutorial.modIntro[descKey],
    tip: t.tutorial.modIntro[tipKey],
  };
});

export const buildModTowerGuide = (t: Translations) => ({
  icon: '🛡️',
  title: t.tutorial.modTowerGuide.title,
  steps: [
    { title: t.tutorial.modTowerGuide.basicAttrTitle, content: t.tutorial.modTowerGuide.basicAttrContent },
    { title: t.tutorial.modTowerGuide.modelTitle, content: t.tutorial.modTowerGuide.modelContent },
    { title: t.tutorial.modTowerGuide.combatTitle, content: t.tutorial.modTowerGuide.combatContent },
    { title: t.tutorial.modTowerGuide.effectsTitle, content: t.tutorial.modTowerGuide.effectsContent },
    { title: t.tutorial.modTowerGuide.bulletTitle, content: t.tutorial.modTowerGuide.bulletContent },
  ],
  example: {
    name: t.tutorial.modTowerGuide.exampleName,
    stats: { damage: 30, range: 100, fireRate: 0.8, cost: 200 },
    effects: [t.tutorial.modTowerGuide.exampleEffect],
  },
});

export const buildModEnemyGuide = (t: Translations) => ({
  icon: '👾',
  title: t.tutorial.modEnemyGuide.title,
  steps: [
    { title: t.tutorial.modEnemyGuide.basicAttrTitle, content: t.tutorial.modEnemyGuide.basicAttrContent },
    { title: t.tutorial.modEnemyGuide.modelTitle, content: t.tutorial.modEnemyGuide.modelContent },
    { title: t.tutorial.modEnemyGuide.combatTitle, content: t.tutorial.modEnemyGuide.combatContent },
    { title: t.tutorial.modEnemyGuide.abilityTitle, content: t.tutorial.modEnemyGuide.abilityContent },
  ],
  example: {
    name: t.tutorial.modEnemyGuide.exampleName,
    stats: { health: 200, speed: 0.6, reward: 30 },
    ability: t.tutorial.modEnemyGuide.exampleAbility,
  },
});

export const buildModMapGuide = (t: Translations) => ({
  icon: '🗺️',
  title: t.tutorial.modMapGuide.title,
  steps: [
    { title: t.tutorial.modMapGuide.basicTitle, content: t.tutorial.modMapGuide.basicContent },
    { title: t.tutorial.modMapGuide.pathDesignTitle, content: t.tutorial.modMapGuide.pathDesignContent },
    { title: t.tutorial.modMapGuide.pathConnectTitle, content: t.tutorial.modMapGuide.pathConnectContent },
    { title: t.tutorial.modMapGuide.testTitle, content: t.tutorial.modMapGuide.testContent },
  ],
});

// ── 塔角色分類 ───────────────────────────────────────────────
export type TowerRole = 'damage' | 'control' | 'aoe' | 'economy';

export interface TowerGuideEntry {
  id: string;
  role: TowerRole;
  tier: 'S' | 'A' | 'B' | 'C';
  timing: string;
  placement: string;
  skill: { name: string; description: string; cooldown: string };
  tips: string[];
  synergies: { towerId: string; towerName: string; reason: string }[];
  dps: number;
}

export const TOWER_ROLES_VISUAL: Record<TowerRole, { icon: string; color: string }> = {
  damage: { icon: '⚔️', color: 'text-red-400' },
  control: { icon: '❄️', color: 'text-blue-400' },
  aoe: { icon: '💥', color: 'text-orange-400' },
  economy: { icon: '💰', color: 'text-yellow-400' },
};

export const buildTowerRoles = (t: Translations): Record<TowerRole, { label: string; icon: string; color: string; description: string }> => ({
  damage: { ...TOWER_ROLES_VISUAL.damage, label: t.tutorial.towerRoles.damage.label, description: t.tutorial.towerRoles.damage.description },
  control: { ...TOWER_ROLES_VISUAL.control, label: t.tutorial.towerRoles.control.label, description: t.tutorial.towerRoles.control.description },
  aoe: { ...TOWER_ROLES_VISUAL.aoe, label: t.tutorial.towerRoles.aoe.label, description: t.tutorial.towerRoles.aoe.description },
  economy: { ...TOWER_ROLES_VISUAL.economy, label: t.tutorial.towerRoles.economy.label, description: t.tutorial.towerRoles.economy.description },
});

// 塔指南 META（純結構,文字從 i18n 取）
export interface TowerGuideMeta {
  id: string;
  role: TowerRole;
  tier: 'S' | 'A' | 'B' | 'C';
  dps: number;
}

export const TOWER_GUIDES_META: TowerGuideMeta[] = [
  { id: 'basic',     role: 'damage',  tier: 'B', dps: 25 },
  { id: 'sniper',    role: 'damage',  tier: 'A', dps: 50 },
  { id: 'cannon',    role: 'aoe',     tier: 'A', dps: 52 },
  { id: 'machine',   role: 'damage',  tier: 'B', dps: 32.5 },
  { id: 'shotgun',   role: 'aoe',     tier: 'A', dps: 17 },
  { id: 'ballista',  role: 'damage',  tier: 'A', dps: 35 },
  { id: 'frost',     role: 'control', tier: 'S', dps: 24 },
  { id: 'poison',    role: 'control', tier: 'A', dps: 18 },
  { id: 'laser',     role: 'damage',  tier: 'S', dps: 75 },
  { id: 'lightning', role: 'aoe',     tier: 'A', dps: 40 },
  { id: 'flame',     role: 'damage',  tier: 'B', dps: 50 },
  { id: 'money',     role: 'economy', tier: 'A', dps: 0 },
  { id: 'wind',      role: 'control', tier: 'A', dps: 3 },
  { id: 'pulse',     role: 'aoe',     tier: 'A', dps: 28 },
];

export const buildTowerGuides = (t: Translations): TowerGuideEntry[] => TOWER_GUIDES_META.map((meta) => {
  const entry = t.tutorial.towerGuides[meta.id as keyof Translations['tutorial']['towerGuides']];
  return {
    id: meta.id,
    role: meta.role,
    tier: meta.tier,
    dps: meta.dps,
    timing: entry?.timing ?? '',
    placement: entry?.placement ?? '',
    skill: {
      name: entry?.skillName ?? '',
      description: entry?.skillDesc ?? '',
      cooldown: entry?.cooldown ?? '',
    },
    tips: [...(entry?.tips ?? [])],
    synergies: getEncyclopediaSynergiesForTower(meta.id as TowerType).map((synergy) => {
      const partner = TOWER_DATA[synergy.partnerType];
      return {
        towerId: synergy.partnerType,
        towerName: partner?.name ?? synergy.partnerType,
        reason: `${synergy.name}：${synergy.bonusLabel}。${synergy.description}`,
      };
    }),
  };
});

// ── 塔組合推薦 ───────────────────────────────────────────────
export interface TowerCombo {
  name: string;
  towers: { id: string; name: string }[];
  description: string;
  rating: number;
  situation: string;
}

type TowerComboKey = 'frostSniper' | 'aoeClear' | 'poisonMachine' | 'economicStart' | 'iceFire' | 'allInOne';

export const TOWER_COMBOS_META: { key: TowerComboKey; towerIds: string[]; rating: number }[] = [
  { key: 'frostSniper',    towerIds: ['frost', 'sniper'],            rating: 5 },
  { key: 'aoeClear',       towerIds: ['cannon', 'lightning'],        rating: 4 },
  { key: 'poisonMachine',  towerIds: ['poison', 'machine'],          rating: 4 },
  { key: 'economicStart',  towerIds: ['money', 'basic'],             rating: 4 },
  { key: 'iceFire',        towerIds: ['frost', 'flame'],             rating: 4 },
  { key: 'allInOne',       towerIds: ['frost', 'laser', 'cannon'],   rating: 5 },
];

export const buildTowerCombos = (t: Translations): TowerCombo[] => TOWER_COMBOS_META.map((m) => {
  const c = t.tutorial.towerCombos[m.key];
  return {
    name: c.name,
    description: c.description,
    rating: m.rating,
    situation: c.situation,
    towers: m.towerIds.map((id) => ({
      id,
      name: TOWER_DATA[id as keyof typeof TOWER_DATA]?.name ?? id,
    })),
  };
});

// ── 敵人角色分類 ─────────────────────────────────────────────
export type EnemyRole = 'basic' | 'speed' | 'tank' | 'special' | 'boss';

export interface EnemyGuideEntry {
  id: string;
  role: EnemyRole;
  danger: 'S' | 'A' | 'B' | 'C';
  abilityDesc: string;
  tips: string[];
  counters: { towerId: string; towerName: string; reason: string }[];
  weakness: string;
  spawnWave: string;
}

export const ENEMY_ROLES_VISUAL: Record<EnemyRole, { icon: string; color: string }> = {
  basic:   { icon: '👤', color: 'text-[var(--hl-ink-3)]' },
  speed:   { icon: '💨', color: 'text-green-400' },
  tank:    { icon: '🛡️', color: 'text-blue-400' },
  special: { icon: '✨', color: 'text-purple-400' },
  boss:    { icon: '👑', color: 'text-yellow-400' },
};

export const buildEnemyRoles = (t: Translations): Record<EnemyRole, { label: string; icon: string; color: string; description: string }> => ({
  basic:   { ...ENEMY_ROLES_VISUAL.basic,   label: t.tutorial.enemyRoles.basic.label,   description: t.tutorial.enemyRoles.basic.description },
  speed:   { ...ENEMY_ROLES_VISUAL.speed,   label: t.tutorial.enemyRoles.speed.label,   description: t.tutorial.enemyRoles.speed.description },
  tank:    { ...ENEMY_ROLES_VISUAL.tank,    label: t.tutorial.enemyRoles.tank.label,    description: t.tutorial.enemyRoles.tank.description },
  special: { ...ENEMY_ROLES_VISUAL.special, label: t.tutorial.enemyRoles.special.label, description: t.tutorial.enemyRoles.special.description },
  boss:    { ...ENEMY_ROLES_VISUAL.boss,    label: t.tutorial.enemyRoles.boss.label,    description: t.tutorial.enemyRoles.boss.description },
});

// 敵人指南 META
export interface EnemyGuideMeta {
  id: string;
  role: EnemyRole;
  danger: 'S' | 'A' | 'B' | 'C';
  counterTowerIds: string[];
}

export const ENEMY_GUIDES_META: EnemyGuideMeta[] = [
  { id: 'normal',    role: 'basic',   danger: 'C', counterTowerIds: ['basic'] },
  { id: 'fast',      role: 'speed',   danger: 'B', counterTowerIds: ['frost', 'machine'] },
  { id: 'elite',     role: 'basic',   danger: 'B', counterTowerIds: ['sniper'] },
  { id: 'speedy',    role: 'speed',   danger: 'A', counterTowerIds: ['frost', 'laser', 'lightning'] },
  { id: 'tank',      role: 'tank',    danger: 'B', counterTowerIds: ['sniper', 'poison'] },
  { id: 'heavy',     role: 'tank',    danger: 'A', counterTowerIds: ['laser', 'frost', 'poison'] },
  { id: 'boss',      role: 'boss',    danger: 'S', counterTowerIds: ['frost', 'laser', 'sniper'] },
  { id: 'flyer',     role: 'special', danger: 'A', counterTowerIds: ['laser', 'sniper'] },
  { id: 'healer',    role: 'special', danger: 'A', counterTowerIds: ['sniper', 'laser'] },
  { id: 'spawner',   role: 'special', danger: 'A', counterTowerIds: ['cannon', 'lightning'] },
  { id: 'shield',    role: 'special', danger: 'A', counterTowerIds: ['machine', 'flame'] },
  { id: 'stealth',   role: 'special', danger: 'B', counterTowerIds: ['poison', 'flame', 'cannon'] },
  { id: 'berserker', role: 'special', danger: 'A', counterTowerIds: ['sniper', 'frost'] },
  { id: 'armored',   role: 'tank',    danger: 'B', counterTowerIds: ['sniper', 'poison', 'laser'] },
  { id: 'mage',      role: 'special', danger: 'S', counterTowerIds: ['frost', 'laser'] },
  { id: 'miniboss',  role: 'boss',    danger: 'A', counterTowerIds: ['laser', 'frost'] },
  { id: 'swarm',     role: 'speed',   danger: 'B', counterTowerIds: ['cannon', 'lightning', 'flame'] },
  { id: 'ghost',     role: 'special', danger: 'A', counterTowerIds: ['sniper', 'frost'] },
  { id: 'bomber',    role: 'special', danger: 'B', counterTowerIds: ['sniper', 'laser'] },
];

export const buildEnemyGuides = (t: Translations): EnemyGuideEntry[] => ENEMY_GUIDES_META.map((meta) => {
  const entry = t.tutorial.enemyGuides[meta.id as keyof Translations['tutorial']['enemyGuides']];
  return {
    id: meta.id,
    role: meta.role,
    danger: meta.danger,
    abilityDesc: entry?.abilityDesc ?? '',
    tips: [...(entry?.tips ?? [])],
    weakness: entry?.weakness ?? '',
    spawnWave: entry?.spawnWave ?? '',
    counters: meta.counterTowerIds.map((towerId) => {
      const tower = TOWER_DATA[towerId as keyof typeof TOWER_DATA];
      // counterReasons 只列「有對策」的塔種，故以 Record 讀取並容忍缺項
      const reasons = entry?.counterReasons as Record<string, string> | undefined;
      return {
        towerId,
        towerName: tower?.name ?? towerId,
        reason: reasons?.[towerId] ?? '',
      };
    }),
  };
});

// ── 快捷鍵 ───────────────────────────────────────────────────
type KeybindKey = 'pause' | 'back' | 'speed1' | 'speed2' | 'speed3' | 'cycleSpeed' | 'startWave' | 'sellTower' | 'upgradeTower';
export const KEYBINDS_META: { keyName: string; icon: string; i18nKey: KeybindKey }[] = [
  { keyName: 'P',     icon: '⏸️', i18nKey: 'pause' },
  { keyName: 'ESC',   icon: '↩️', i18nKey: 'back' },
  { keyName: '1',     icon: '▶️', i18nKey: 'speed1' },
  { keyName: '2',     icon: '⏩', i18nKey: 'speed2' },
  { keyName: '3',     icon: '⏭️', i18nKey: 'speed3' },
  { keyName: 'Space', icon: '🔄', i18nKey: 'cycleSpeed' },
  { keyName: 'Enter', icon: '🌊', i18nKey: 'startWave' },
  { keyName: 'S',     icon: '💰', i18nKey: 'sellTower' },
  { keyName: 'U',     icon: '⬆️', i18nKey: 'upgradeTower' },
];

export const buildKeybinds = (t: Translations) => KEYBINDS_META.map((m) => ({
  action: t.tutorial.keybinds[m.i18nKey],
  key: m.keyName,
  icon: m.icon,
}));

// ── 向後相容 export (僅供未遷移呼叫處臨時使用,新呼叫請用 build* 函數) ──
// 注:這些 export 不含翻譯,僅作為過渡。所有新元件必須使用 build* 變體。
export const ENEMY_GUIDES: EnemyGuideEntry[] = [];
export const TOWER_GUIDES: TowerGuideEntry[] = [];
export const TOWER_COMBOS: TowerCombo[] = [];
// 防呆:讀 ENEMY_DATA 確保模組依存解析 (不執行任何動作)
void ENEMY_DATA;
