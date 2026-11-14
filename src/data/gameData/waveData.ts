import type { EnemyType } from '@/types/game';

// 波次配置
export const WAVE_CONFIGS: { enemies: { type: EnemyType; count: number }[] }[] = [
  // 第 1-3 波：入門
  { enemies: [{ type: 'normal', count: 5 }] },
  { enemies: [{ type: 'normal', count: 8 }, { type: 'fast', count: 3 }] },
  { enemies: [{ type: 'normal', count: 10 }, { type: 'fast', count: 5 }, { type: 'swarm', count: 6 }] },
  // 第 4-6 波：加入新敵人
  { enemies: [{ type: 'normal', count: 8 }, { type: 'fast', count: 5 }, { type: 'elite', count: 2 }, { type: 'berserker', count: 2 }] },
  { enemies: [{ type: 'normal', count: 10 }, { type: 'fast', count: 8 }, { type: 'tank', count: 2 }, { type: 'shield', count: 2 }] },
  { enemies: [{ type: 'normal', count: 12 }, { type: 'elite', count: 5 }, { type: 'speedy', count: 5 }, { type: 'stealth', count: 3 }] },
  // 第 7-9 波：中期挑戰
  { enemies: [{ type: 'normal', count: 10 }, { type: 'tank', count: 4 }, { type: 'flyer', count: 3 }, { type: 'armored', count: 3 }, { type: 'jammer', count: 2 }] },
  { enemies: [{ type: 'elite', count: 8 }, { type: 'heavy', count: 3 }, { type: 'healer', count: 2 }, { type: 'ghost', count: 3 }, { type: 'miniboss', count: 1 }, { type: 'jammer', count: 1 }, { type: 'escort', count: 1 }] },
  { enemies: [{ type: 'normal', count: 15 }, { type: 'fast', count: 10 }, { type: 'spawner', count: 2 }, { type: 'mage', count: 3 }] },
  // 第 10 波：Boss 戰
  { enemies: [{ type: 'tank', count: 5 }, { type: 'heavy', count: 5 }, { type: 'boss', count: 2 }, { type: 'healer', count: 3 }, { type: 'miniboss', count: 2 }, { type: 'escort', count: 2 }] },
  // 第 11-12 波：高難度
  { enemies: [{ type: 'swarm', count: 20 }, { type: 'elite', count: 10 }, { type: 'berserker', count: 5 }, { type: 'bomber', count: 4 }] },
  { enemies: [{ type: 'shield', count: 6 }, { type: 'armored', count: 6 }, { type: 'ghost', count: 5 }, { type: 'stealth', count: 5 }, { type: 'mage', count: 4 }, { type: 'jammer', count: 3 }] },
  // 第 13-14 波：極限挑戰
  { enemies: [{ type: 'heavy', count: 8 }, { type: 'tank', count: 10 }, { type: 'healer', count: 5 }, { type: 'spawner', count: 4 }, { type: 'flyer', count: 6 }, { type: 'escort', count: 3 }] },
  { enemies: [{ type: 'swarm', count: 30 }, { type: 'speedy', count: 12 }, { type: 'ghost', count: 8 }, { type: 'berserker', count: 8 }, { type: 'bomber', count: 6 }] },
  // 第 15 波：最終 Boss 戰
  { enemies: [{ type: 'boss', count: 4 }, { type: 'miniboss', count: 6 }, { type: 'heavy', count: 8 }, { type: 'healer', count: 6 }, { type: 'shield', count: 8 }, { type: 'jammer', count: 4 }] }
];

// 無盡模式波次生成器

type EnemyEntry = { type: EnemyType; count: number };

// 單一敵人配比：ratio 相對 baseCount 的比例，minWave 為出現的最低波次
type EnemySpec = { type: EnemyType; ratio: number; minWave?: number };

// 波次層級：依 maxWave 區分，各層含主體敵人配比、可選縮放係數與 BOSS 規則
type WaveTier = {
  maxWave: number;
  specs: EnemySpec[];
  scaling?: (wave: number) => number;
  boss?: (wave: number) => EnemyEntry[];
};

const ENDLESS_WAVE_TIERS: WaveTier[] = [
  // 早期波次（1-5）：普通與快速敵人為主
  {
    maxWave: 5,
    specs: [
      { type: 'normal', ratio: 1 },
      { type: 'fast', ratio: 0.4, minWave: 2 },
      { type: 'swarm', ratio: 0.5, minWave: 3 },
      { type: 'berserker', ratio: 0.15, minWave: 4 },
    ],
  },
  // 中期波次（6-10）：加入精英、坦克與新敵人
  {
    maxWave: 10,
    specs: [
      { type: 'normal', ratio: 0.5 },
      { type: 'fast', ratio: 0.3 },
      { type: 'elite', ratio: 0.2 },
      { type: 'swarm', ratio: 0.4 },
      { type: 'shield', ratio: 0.1, minWave: 6 },
      { type: 'stealth', ratio: 0.1, minWave: 7 },
      { type: 'tank', ratio: 0.1, minWave: 8 },
      { type: 'armored', ratio: 0.1, minWave: 9 },
    ],
    boss: (wave) => (wave === 10 ? [{ type: 'miniboss', count: 1 }] : []),
  },
  // 後期波次（11-20）：多種敵人混合 + 特殊敵人
  {
    maxWave: 20,
    specs: [
      { type: 'normal', ratio: 0.3 },
      { type: 'fast', ratio: 0.25 },
      { type: 'elite', ratio: 0.25 },
      { type: 'swarm', ratio: 0.5 },
      { type: 'tank', ratio: 0.12 },
      { type: 'speedy', ratio: 0.15 },
      { type: 'shield', ratio: 0.12 },
      { type: 'stealth', ratio: 0.1 },
      { type: 'berserker', ratio: 0.1 },
      { type: 'armored', ratio: 0.1 },
      { type: 'ghost', ratio: 0.08, minWave: 12 },
      { type: 'mage', ratio: 0.08, minWave: 14 },
      { type: 'heavy', ratio: 0.1, minWave: 15 },
      { type: 'bomber', ratio: 0.1, minWave: 16 },
      { type: 'jammer', ratio: 0.08, minWave: 12 },
      { type: 'escort', ratio: 0.07, minWave: 13 },
    ],
    boss: (wave) =>
      wave % 5 === 0
        ? [
            { type: 'miniboss', count: Math.floor(wave / 10) + 1 },
            { type: 'boss', count: Math.floor(wave / 10) },
          ]
        : [],
  },
  // 超級後期（21-35）：所有類型敵人 + 更多 BOSS
  {
    maxWave: 35,
    scaling: (wave) => 1 + (wave - 20) * 0.05,
    specs: [
      { type: 'normal', ratio: 0.25 },
      { type: 'fast', ratio: 0.2 },
      { type: 'elite', ratio: 0.25 },
      { type: 'swarm', ratio: 0.6 },
      { type: 'tank', ratio: 0.15 },
      { type: 'speedy', ratio: 0.15 },
      { type: 'heavy', ratio: 0.12 },
      { type: 'shield', ratio: 0.12 },
      { type: 'stealth', ratio: 0.1 },
      { type: 'berserker', ratio: 0.12 },
      { type: 'armored', ratio: 0.12 },
      { type: 'ghost', ratio: 0.1 },
      { type: 'mage', ratio: 0.08 },
      { type: 'bomber', ratio: 0.1 },
      { type: 'flyer', ratio: 0.1 },
      { type: 'healer', ratio: 0.05 },
      { type: 'spawner', ratio: 0.05 },
      { type: 'jammer', ratio: 0.06 },
      { type: 'escort', ratio: 0.05 },
    ],
    boss: (wave) => {
      if (wave % 5 === 0) {
        return [
          { type: 'miniboss', count: Math.floor(wave / 8) },
          { type: 'boss', count: Math.floor(wave / 10) },
        ];
      }
      if (wave % 3 === 0) return [{ type: 'miniboss', count: 1 }];
      return [];
    },
  },
  // 地獄模式（36+）：極限挑戰
  {
    maxWave: Infinity,
    scaling: (wave) => 1 + (wave - 35) * 0.08,
    specs: [
      { type: 'elite', ratio: 0.3 },
      { type: 'swarm', ratio: 0.8 },
      { type: 'tank', ratio: 0.2 },
      { type: 'speedy', ratio: 0.2 },
      { type: 'heavy', ratio: 0.15 },
      { type: 'shield', ratio: 0.15 },
      { type: 'stealth', ratio: 0.12 },
      { type: 'berserker', ratio: 0.15 },
      { type: 'armored', ratio: 0.15 },
      { type: 'ghost', ratio: 0.12 },
      { type: 'mage', ratio: 0.12 },
      { type: 'bomber', ratio: 0.12 },
      { type: 'flyer', ratio: 0.12 },
      { type: 'healer', ratio: 0.08 },
      { type: 'spawner', ratio: 0.08 },
      { type: 'jammer', ratio: 0.08 },
      { type: 'escort', ratio: 0.07 },
    ],
    boss: (wave) => {
      const units: EnemyEntry[] = [{ type: 'miniboss', count: Math.floor(wave / 6) }];
      if (wave % 3 === 0) units.push({ type: 'boss', count: Math.floor(wave / 8) });
      if (wave % 5 === 0) units.push({ type: 'boss', count: Math.floor(wave / 5) });
      return units;
    },
  },
];

export const generateEndlessWaveConfig = (waveNumber: number): { enemies: EnemyEntry[] } => {
  const baseCount = Math.floor(5 + waveNumber * 1.5);
  const tier =
    ENDLESS_WAVE_TIERS.find((t) => waveNumber <= t.maxWave) ??
    ENDLESS_WAVE_TIERS[ENDLESS_WAVE_TIERS.length - 1];
  const scalingFactor = tier.scaling?.(waveNumber) ?? 1;

  const bodyEnemies = tier.specs
    .filter((spec) => waveNumber >= (spec.minWave ?? 0))
    .map((spec) => ({ type: spec.type, count: Math.floor(baseCount * spec.ratio * scalingFactor) }));
  const bossEnemies = tier.boss?.(waveNumber) ?? [];

  return { enemies: [...bodyEnemies, ...bossEnemies].filter((e) => e.count > 0) };
};

// 游戏常量
export const GAME_CONSTANTS = {
  GRID_COLS: 15,
  GRID_ROWS: 11,
  INITIAL_MONEY: 500,
  INITIAL_HEALTH: 10,
  WAVE_DELAY: 5000,
  ENEMY_SPAWN_DELAY: 800,
  MAX_TOWER_LEVEL: 5, // 最大塔等級
};

// 難度設定
export const DIFFICULTY_MODIFIERS: Record<import('@/types/game').GameDifficulty, import('@/types/game').DifficultyModifiers> = {
  easy: {
    enemyHealthMult: 0.7,
    enemySpeedMult: 0.85,
    enemyRewardMult: 1.2,
    startingMoney: 700,
    startingHealth: 20,
    towerCostMult: 0.9,
    waveDelayMult: 1.3,
  },
  normal: {
    enemyHealthMult: 1.0,
    enemySpeedMult: 1.0,
    enemyRewardMult: 1.0,
    startingMoney: 500,
    startingHealth: 10,
    towerCostMult: 1.0,
    waveDelayMult: 1.0,
  },
  hard: {
    enemyHealthMult: 1.4,
    enemySpeedMult: 1.15,
    enemyRewardMult: 0.9,
    startingMoney: 400,
    startingHealth: 8,
    towerCostMult: 1.1,
    waveDelayMult: 0.85,
  },
  nightmare: {
    enemyHealthMult: 2.0,
    enemySpeedMult: 1.3,
    enemyRewardMult: 0.8,
    startingMoney: 300,
    startingHealth: 5,
    towerCostMult: 1.2,
    waveDelayMult: 0.7,
  },
  impossible: {
    enemyHealthMult: 3.0,
    enemySpeedMult: 1.5,
    enemyRewardMult: 0.7,
    startingMoney: 200,
    startingHealth: 3,
    towerCostMult: 1.3,
    waveDelayMult: 0.5,
  },
  custom: {
    enemyHealthMult: 1.0,
    enemySpeedMult: 1.0,
    enemyRewardMult: 1.0,
    startingMoney: 500,
    startingHealth: 10,
    towerCostMult: 1.0,
    waveDelayMult: 1.0,
  },
};
