/**
 * 主義解鎖邏輯驗證腳本
 * 執行：npx tsx scripts/verify-playstyle-isms.ts
 */

import { checkAndUnlockPlaystyleIsms } from '../src/store/achievementStorePlaystyle';
import type { PlaystyleGameEndContext, PlaystyleSessionStats } from '../src/types/playstyleIsm';
import { getInitialPlaystyleSession } from '../src/types/playstyleIsm';

let passed = 0;
let failed = 0;

function assert(name: string, condition: boolean) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.error(`  ✗ ${name}`);
  }
}

function runUnlockTest(
  name: string,
  expectedIds: string[],
  forbiddenIds: string[],
  input: Parameters<typeof checkAndUnlockPlaystyleIsms>[0],
) {
  const unlocked: string[] = [];
  checkAndUnlockPlaystyleIsms(input, (id) => unlocked.push(id));
  console.log(`\n[${name}]`);
  for (const id of expectedIds) {
    assert(`應解鎖 ${id}`, unlocked.includes(id));
  }
  for (const id of forbiddenIds) {
    assert(`不應解鎖 ${id}`, !unlocked.includes(id));
  }
}

const baseContext: PlaystyleGameEndContext = {
  maxWaves: 15,
  gameSpeed: 1,
  finalMoney: 500,
  allTowersMaxLevel: false,
  allTowersLevel1: false,
  maxTowerLevel: 3,
  maxLevelTowerCount: 0,
  soloMaxLevelRestLv1: false,
};

const basePlaystyle: PlaystyleSessionStats = {
  ...getInitialPlaystyleSession(200),
  firstTowerWave: 1,
  lastTowerWave: 3,
};

runUnlockTest(
  '前期主義：第5波後不建塔',
  ['no_build_after_wave_5'],
  ['no_build_after_wave_10'],
  {
    won: true, wave: 15, health: 10, difficulty: 'normal', endless: false,
    towersPlaced: 5, towersUpgraded: 2, noDamage: false,
    towersPlacedByType: { basic: 5 },
    totalTowersSold: 0,
    playstyle: { ...basePlaystyle, lastTowerWave: 5 },
    context: baseContext,
  },
);

runUnlockTest(
  '前期主義：短關卡（5波）不應解鎖',
  [],
  ['no_build_after_wave_5'],
  {
    won: true, wave: 5, health: 10, difficulty: 'normal', endless: false,
    towersPlaced: 3, towersUpgraded: 0, noDamage: false,
    towersPlacedByType: { basic: 3 },
    totalTowersSold: 0,
    playstyle: { ...basePlaystyle, lastTowerWave: 3 },
    context: { ...baseContext, maxWaves: 5 },
  },
);

runUnlockTest(
  '極致前期：困難 + 10波後不建',
  ['no_build_after_wave_10'],
  ['no_build_after_wave_5'],
  {
    won: true, wave: 15, health: 10, difficulty: 'hard', endless: false,
    towersPlaced: 8, towersUpgraded: 3, noDamage: false,
    towersPlacedByType: { cannon: 8 },
    totalTowersSold: 0,
    playstyle: { ...basePlaystyle, lastTowerWave: 8 },
    context: baseContext,
  },
);

runUnlockTest(
  '後期主義：短關卡（10波）不應解鎖',
  [],
  ['ism_late_bloom'],
  {
    won: true, wave: 10, health: 10, difficulty: 'normal', endless: false,
    towersPlaced: 4, towersUpgraded: 1, noDamage: false,
    towersPlacedByType: { sniper: 4 },
    totalTowersSold: 0,
    playstyle: { ...getInitialPlaystyleSession(200), firstTowerWave: 10, lastTowerWave: 10 },
    context: { ...baseContext, maxWaves: 10 },
  },
);

runUnlockTest(
  '後期主義：第11波才建塔',
  ['ism_late_bloom'],
  ['no_build_after_wave_5'],
  {
    won: true, wave: 15, health: 10, difficulty: 'normal', endless: false,
    towersPlaced: 4, towersUpgraded: 2, noDamage: false,
    towersPlacedByType: { sniper: 4 },
    totalTowersSold: 0,
    playstyle: { ...getInitialPlaystyleSession(200), firstTowerWave: 11, lastTowerWave: 14 },
    context: baseContext,
  },
);

runUnlockTest(
  '大器晚成：最後一波才放塔',
  ['late_bloomer'],
  [],
  {
    won: true, wave: 15, health: 10, difficulty: 'normal', endless: false,
    towersPlaced: 3, towersUpgraded: 1, noDamage: false,
    towersPlacedByType: { machine: 3 },
    totalTowersSold: 0,
    playstyle: { ...getInitialPlaystyleSession(200), firstTowerWave: 15, lastTowerWave: 15 },
    context: baseContext,
  },
);

runUnlockTest(
  '專一主義：單塔型（非元素）',
  ['one_type_only'],
  ['ism_element'],
  {
    won: true, wave: 15, health: 10, difficulty: 'normal', endless: false,
    towersPlaced: 6, towersUpgraded: 4, noDamage: false,
    towersPlacedByType: { cannon: 6 },
    totalTowersSold: 0,
    playstyle: basePlaystyle,
    context: baseContext,
  },
);

runUnlockTest(
  '元素主義：單一元素塔',
  ['one_type_only', 'ism_element'],
  [],
  {
    won: true, wave: 15, health: 10, difficulty: 'normal', endless: false,
    towersPlaced: 4, towersUpgraded: 2, noDamage: false,
    towersPlacedByType: { frost: 4 },
    totalTowersSold: 0,
    playstyle: { ...getInitialPlaystyleSession(200), firstTowerWave: 2, lastTowerWave: 10 },
    context: baseContext,
  },
);

runUnlockTest(
  '速攻主義：第一波前建8塔',
  ['ism_rush'],
  [],
  {
    won: true, wave: 15, health: 10, difficulty: 'normal', endless: false,
    towersPlaced: 10, towersUpgraded: 0, noDamage: false,
    towersPlacedByType: { basic: 10 },
    totalTowersSold: 0,
    playstyle: { ...getInitialPlaystyleSession(5000), firstTowerWave: 0, lastTowerWave: 12, towersBuiltBeforeWave1: 8 },
    context: baseContext,
  },
);

runUnlockTest(
  '靜觀主義：前3波不升級',
  ['ism_watch'],
  [],
  {
    won: true, wave: 15, health: 10, difficulty: 'normal', endless: false,
    towersPlaced: 5, towersUpgraded: 3, noDamage: false,
    towersPlacedByType: { basic: 5 },
    totalTowersSold: 0,
    playstyle: { ...getInitialPlaystyleSession(200), firstTowerWave: 1, lastTowerWave: 8, upgradesBeforeWave4: 0 },
    context: baseContext,
  },
);

runUnlockTest(
  '基礎信仰：僅基礎塔困難通關',
  ['tower_basic_humble'],
  [],
  {
    won: true, wave: 15, health: 10, difficulty: 'hard', endless: false,
    towersPlaced: 6, towersUpgraded: 2, noDamage: false,
    towersPlacedByType: { basic: 6 },
    totalTowersSold: 0,
    playstyle: basePlaystyle,
    context: baseContext,
  },
);

runUnlockTest(
  '敗北不應解鎖',
  [],
  ['no_build_after_wave_5', 'ism_late_bloom', 'one_type_only'],
  {
    won: false, wave: 10, health: 0, difficulty: 'normal', endless: false,
    towersPlaced: 5, towersUpgraded: 0, noDamage: false,
    towersPlacedByType: { basic: 5 },
    totalTowersSold: 0,
    playstyle: { ...basePlaystyle, lastTowerWave: 3 },
    context: baseContext,
  },
);

runUnlockTest(
  '究極主義：多重限制',
  ['ism_ultimate'],
  [],
  {
    won: true, wave: 15, health: 10, difficulty: 'hard', endless: false,
    towersPlaced: 8, towersUpgraded: 4, noDamage: true,
    towersPlacedByType: { cannon: 8 },
    totalTowersSold: 0,
    playstyle: {
      ...getInitialPlaystyleSession(200),
      firstTowerWave: 1,
      lastTowerWave: 10,
      pauseCount: 0,
      skillsUsedThisGame: 0,
      upgradesBeforeWave4: 2,
    },
    context: baseContext,
  },
);

runUnlockTest(
  '均衡主義：5種塔各升2次',
  ['ism_balanced'],
  [],
  {
    won: true, wave: 15, health: 10, difficulty: 'normal', endless: false,
    towersPlaced: 10, towersUpgraded: 10, noDamage: false,
    towersPlacedByType: { basic: 2, sniper: 2, cannon: 2, frost: 2, flame: 2 },
    totalTowersSold: 0,
    playstyle: {
      ...getInitialPlaystyleSession(200),
      firstTowerWave: 1,
      lastTowerWave: 12,
      upgradesByTowerType: { basic: 2, sniper: 2, cannon: 2, frost: 2, flame: 2 },
    },
    context: baseContext,
  },
);

runUnlockTest(
  '孤注主義：一塔滿級其餘Lv1',
  ['ism_gamble'],
  [],
  {
    won: true, wave: 15, health: 10, difficulty: 'normal', endless: false,
    towersPlaced: 4, towersUpgraded: 4, noDamage: false,
    towersPlacedByType: { cannon: 2, sniper: 2 },
    totalTowersSold: 0,
    playstyle: basePlaystyle,
    context: { ...baseContext, maxLevelTowerCount: 1, soloMaxLevelRestLv1: true },
  },
);

runUnlockTest(
  '輪換主義：賣塔10次',
  ['ism_rotation'],
  [],
  {
    won: true, wave: 15, health: 10, difficulty: 'normal', endless: false,
    towersPlaced: 8, towersUpgraded: 2, noDamage: false,
    towersPlacedByType: { basic: 8 },
    totalTowersSold: 12,
    playstyle: basePlaystyle,
    context: baseContext,
  },
);

console.log(`\n--- 結果：${passed} 通過，${failed} 失敗 ---`);
process.exit(failed > 0 ? 1 : 0);
