/**
 * 成就資料定義 - 主要匯出檔案
 * Achievement Data Definitions - Main Barrel File
 */

import type { Achievement } from '@/types/achievement';

// 從子模組匯入成就資料
import {
  progressAchievements,
  towerAchievements,
  enemyAchievements,
  mapAchievements,
} from './achievements/progressAchievements';

import {
  challengeAchievements,
  noDamageAchievements,
  speedrunAchievements,
  economyAchievements,
  endlessAchievements,
  hiddenAchievements,
  milestoneAchievements,
} from './achievements/challengeAchievements';

import {
  modAchievements,
  comboAchievements,
  towerMasteryAchievements,
  specialEnemyAchievements,
  funHiddenAchievements,
  dailyAchievements,
  weeklyAchievements,
  legendaryAchievements,
  rareCollectionAchievements,
} from './achievements/specialAchievements';

import {
  towerMasteryExtraAchievements,
  skillAchievements,
  damageAchievements,
  milestoneExtraAchievements,
  highChallengeAchievements,
} from './achievements/bonusAchievements';

import {
  skinCollectionAchievements,
  timeChallengeAchievements,
  specialComboAchievements,
  funEasterAchievements,
} from './achievements/worldAchievements';

import {
  tacticalAchievements,
  survivalAchievements,
  discoveryAchievements,
  dedicationAchievements,
  towerMasteryExpansionAchievements,
  economyExpansionAchievements,
  easterExpansionAchievements,
  apexChallengeAchievements,
  streakBurstAchievements,
  collectionBonusAchievements,
} from './achievements/expansionAchievements';

import {
  seasonalHolidayAchievements,
  towerSynergyAchievements,
  timeChallengeExtraAchievements,
  resilienceAchievements,
  firstTimesAchievements,
  detailLoverAchievements,
  miracleBattleAchievements,
  encyclopediaDepthAchievements,
  economyExtremeAchievements,
  hiddenComboAchievements,
} from './achievements/expansionAchievements2';

import {
  waveMilestoneAchievements,
  killStreakExtensionAchievements,
  upgradeExtensionAchievements,
  damageExtensionAchievements,
  buildTempoAchievements,
  enemyKillsAdvancedAchievements,
  elementTowerAchievements,
  combatDurationAchievements,
  mobilityAchievements,
  heartSeriesAchievements,
} from './achievements/expansionAchievements3';

import {
  mapCompletionAchievements,
  chapterProgressAchievements,
  modAdvancedAchievements,
  multiComboAchievements,
  skillsAdvancedAchievements,
  scoreAdvancedAchievements,
  playerBehaviorAchievements,
  playtimeSeriesAchievements,
  robotThemedAchievements,
  visualArtisticAchievements,
  tutorialBookAchievements,
  fireExtendedAchievements,
} from './achievements/expansionAchievements4';

import {
  apexBattleAchievements,
  strategicMasterAchievements,
  aestheticCollectionAchievements,
  economyExtremesAchievements,
  perfectionismAchievements,
  culturalAchievements,
  wisdomPathAchievements,
  monsterHunterAchievements,
  pureExtremeAchievements,
  crypticHiddenAchievements,
  subtleObservationAchievements,
  memorialHeroAchievements,
  tacticalProtocolAchievements,
  adjacencySynergyAchievements,
  fateLuckAchievements,
  finalCompilationAchievements,
  supplementaryAchievements,
} from './achievements/expansionAchievements5';

import { playstyleIsmAchievements } from './achievements/playstyleIsms';

// ============ 匯出所有成就 ============
export const ALL_ACHIEVEMENTS: Achievement[] = [
  ...progressAchievements,
  ...towerAchievements,
  ...enemyAchievements,
  ...mapAchievements,
  ...challengeAchievements,
  ...noDamageAchievements,
  ...speedrunAchievements,
  ...economyAchievements,
  ...endlessAchievements,
  ...hiddenAchievements,
  ...milestoneAchievements,
  ...modAchievements,
  ...comboAchievements,
  ...towerMasteryAchievements,
  ...specialEnemyAchievements,
  ...funHiddenAchievements,
  ...dailyAchievements,
  ...weeklyAchievements,
  ...legendaryAchievements,
  ...rareCollectionAchievements,
  ...towerMasteryExtraAchievements,
  ...skillAchievements,
  ...damageAchievements,
  ...milestoneExtraAchievements,
  ...highChallengeAchievements,
  ...skinCollectionAchievements,
  ...timeChallengeAchievements,
  ...specialComboAchievements,
  ...funEasterAchievements,
  ...tacticalAchievements,
  ...survivalAchievements,
  ...discoveryAchievements,
  ...dedicationAchievements,
  ...towerMasteryExpansionAchievements,
  ...economyExpansionAchievements,
  ...easterExpansionAchievements,
  ...apexChallengeAchievements,
  ...streakBurstAchievements,
  ...collectionBonusAchievements,
  ...seasonalHolidayAchievements,
  ...towerSynergyAchievements,
  ...timeChallengeExtraAchievements,
  ...resilienceAchievements,
  ...firstTimesAchievements,
  ...detailLoverAchievements,
  ...miracleBattleAchievements,
  ...encyclopediaDepthAchievements,
  ...economyExtremeAchievements,
  ...hiddenComboAchievements,
  ...waveMilestoneAchievements,
  ...killStreakExtensionAchievements,
  ...upgradeExtensionAchievements,
  ...damageExtensionAchievements,
  ...buildTempoAchievements,
  ...enemyKillsAdvancedAchievements,
  ...elementTowerAchievements,
  ...combatDurationAchievements,
  ...mobilityAchievements,
  ...heartSeriesAchievements,
  ...mapCompletionAchievements,
  ...chapterProgressAchievements,
  ...modAdvancedAchievements,
  ...multiComboAchievements,
  ...skillsAdvancedAchievements,
  ...scoreAdvancedAchievements,
  ...playerBehaviorAchievements,
  ...playtimeSeriesAchievements,
  ...robotThemedAchievements,
  ...visualArtisticAchievements,
  ...tutorialBookAchievements,
  ...fireExtendedAchievements,
  ...apexBattleAchievements,
  ...strategicMasterAchievements,
  ...aestheticCollectionAchievements,
  ...economyExtremesAchievements,
  ...perfectionismAchievements,
  ...culturalAchievements,
  ...wisdomPathAchievements,
  ...monsterHunterAchievements,
  ...pureExtremeAchievements,
  ...crypticHiddenAchievements,
  ...subtleObservationAchievements,
  ...memorialHeroAchievements,
  ...tacticalProtocolAchievements,
  ...adjacencySynergyAchievements,
  ...fateLuckAchievements,
  ...finalCompilationAchievements,
  ...supplementaryAchievements,
  ...playstyleIsmAchievements,
];

// 按類別分組的成就
export const ACHIEVEMENTS_BY_CATEGORY = ALL_ACHIEVEMENTS.reduce((acc, achievement) => {
  if (!acc[achievement.category]) {
    acc[achievement.category] = [];
  }
  acc[achievement.category].push(achievement);
  return acc;
}, {} as Record<string, Achievement[]>);

// 取得成就
export const getAchievement = (id: string): Achievement | undefined => {
  return ALL_ACHIEVEMENTS.find(a => a.id === id);
};

// 計算成就點數
export const calculateAchievementPoints = (achievementId: string): number => {
  const achievement = getAchievement(achievementId);
  if (!achievement) return 0;
  
  const pointsReward = achievement.rewards.find(r => r.type === 'points');
  return typeof pointsReward?.value === 'number' ? pointsReward.value : 0;
};

// 取得成就總點數
export const getTotalAchievementPoints = (): number => {
  return ALL_ACHIEVEMENTS.reduce((total, achievement) => {
    return total + calculateAchievementPoints(achievement.id);
  }, 0);
};

// 初始統計
export const getInitialStatistics = (): import('@/types/achievement').GameStatistics => ({
  gamesPlayed: 0,
  gamesWon: 0,
  gamesLost: 0,
  wavesCompleted: 0,
  totalEnemiesKilled: 0,
  enemiesKilledByType: {},
  totalTowersPlaced: 0,
  towersPlacedByType: {},
  totalTowersUpgraded: 0,
  totalTowersSold: 0,
  towersReachedMaxLevel: 0,
  totalMoneyEarned: 0,
  totalMoneySpent: 0,
  totalDamageDealt: 0,
  totalDamageTaken: 0,
  perfectWaves: 0,
  bossesKilled: 0,
  mapsCompleted: {},
  waveSetsCompleted: {},
  difficultiesCompleted: {},
  chaptersCompleted: 0,
  highestScore: 0,
  highestWave: 0,
  fastestWin: Infinity,
  noDamageGames: 0,
  endlessHighestWave: 0,
  totalPlaytime: 0,
  skillsUsed: 0,
  modsCreated: 0,
  modsUsed: 0,
  totalTowerFusions: 0,
  loginDays: 0,
  consecutiveLoginDays: 0,
  lastLoginDate: '',
  winStreak: 0,
  bestWinStreak: 0,
  fullHpWins: 0,
  towerTypesReachedMaxLevel: [],
  unlockedSkinsCount: 0,
  equippedNonDefaultSkinsCount: 0,
  totalSkinsCount: 0,
  timeFlags: {},
  tacticalProtocolsChosen: 0,
  tacticalProtocolTypes: [],
  towerSynergyTypes: [],
  towerSynergyMaxKinds: 0,
});
