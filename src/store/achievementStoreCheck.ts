/**
 * 成就條件檢查工具
 * Achievement Condition Checking Helpers
 *
 * 從 achievementStore.ts 抽出來的純函式部分，用以保持主檔在 888 行限制內。
 */

import type {
  Achievement,
  PlayerAchievement,
  GameStatistics,
} from '@/types/achievement';
import { ALL_ACHIEVEMENTS } from '@/data/achievementData';

const TIME_BASED_CUSTOM_IDS = new Set([
  'night_owl',
  'early_bird',
  'noon_warrior',
  'weekend_warrior',
  'friday_13th',
  'lucky_seven',
  'new_year_player',
]);

const HANDLED_CUSTOM_IDS = new Set([
  'completionist',
  'ultimate_completionist',
  'collect_achievements_150',
  'final_200_achievements',
  'final_300_achievements',
  'final_400_achievements',
  'final_500_unlocked',
  'final_all_achievements',
  'mystic_finder',
  'subtle_5_easter_eggs',
  'final_secret_finder',
  'final_legendary_total',
  'final_legendary_hunter',
  'skin_first',
  'skin_collector_5',
  'skin_collector_15',
  'skin_master',
  'skin_dresser',
  'mode_diversity',
  'all_difficulties_complete',
  'tower_arsenal',
  'all_tower_types_max',
  'tower_collector',
  'unstoppable_force',
  'protocol_first',
  'protocol_ten',
  'protocol_fifty',
  'protocol_variety',
  'synergy_first',
  'synergy_three',
  'synergy_catalog',
  'fuse_all_four',
]);

function isCustomAchievementHandled(id: string): boolean {
  return id.startsWith('achievement_hunter')
    || id.startsWith('ism_')
    || HANDLED_CUSTOM_IDS.has(id)
    || TIME_BASED_CUSTOM_IDS.has(id);
}

export function isAchievementTrackable(achievement: Achievement): boolean {
  return achievement.conditions.every(
    (condition) => condition.type !== 'custom' || isCustomAchievementHandled(achievement.id),
  );
}

export function getCatalogAchievements(): Achievement[] {
  return ALL_ACHIEVEMENTS.filter(isAchievementTrackable);
}

function countCompletedCatalog(
  playerAchievements: Record<string, PlayerAchievement>,
  pool: Achievement[] = getCatalogAchievements(),
): number {
  return pool.filter((achievement) => {
    const pa = playerAchievements[achievement.id];
    return pa && (pa.status === 'completed' || pa.status === 'claimed');
  }).length;
}

// 檢查成就條件並計算進度
export const checkCondition = (
  achievement: Achievement,
  statistics: GameStatistics,
  playerAchievements: Record<string, PlayerAchievement>
): { met: boolean; progress: number[] } => {
  const progress: number[] = [];
  let allMet = true;

  for (const condition of achievement.conditions) {
    let current = 0;
    const target = condition.target;

    switch (condition.type) {
      case 'games_played':
        current = statistics.gamesPlayed;
        break;
      case 'games_won':
        current = statistics.gamesWon;
        break;
      case 'waves_completed':
        current = statistics.wavesCompleted;
        break;
      case 'enemies_killed':
        current = statistics.totalEnemiesKilled;
        break;
      case 'enemy_type_killed':
        current = statistics.enemiesKilledByType[condition.enemyType || ''] || 0;
        break;
      case 'towers_placed':
        current = statistics.totalTowersPlaced;
        break;
      case 'tower_type_placed':
        current = statistics.towersPlacedByType[condition.towerType || ''] || 0;
        break;
      case 'towers_upgraded':
        current = statistics.totalTowersUpgraded;
        break;
      case 'towers_max_level':
        current = statistics.towersReachedMaxLevel;
        break;
      case 'money_earned':
        current = statistics.totalMoneyEarned;
        break;
      case 'money_spent':
        current = statistics.totalMoneySpent;
        break;
      case 'damage_dealt':
        current = statistics.totalDamageDealt;
        break;
      case 'damage_taken':
        current = statistics.totalDamageTaken;
        break;
      case 'perfect_waves':
        current = statistics.perfectWaves;
        break;
      case 'maps_completed':
      case 'complete_unique_maps':
        current = Object.keys(statistics.mapsCompleted).length;
        break;
      case 'complete_chapter':
        current = statistics.chaptersCompleted || 0;
        break;
      case 'map_completed':
      case 'complete_map':
        current = condition.mapId
          ? (statistics.mapsCompleted[condition.mapId] || 0)
          : Object.values(statistics.mapsCompleted).reduce((sum, n) => sum + n, 0);
        break;
      case 'complete_wave_set': {
        const completed = statistics.waveSetsCompleted || {};
        current = condition.waveSetId
          ? (completed[condition.waveSetId] || 0)
          : Object.values(completed).reduce((sum, n) => sum + n, 0);
        break;
      }
      case 'difficulty_completed':
        current = statistics.difficultiesCompleted[condition.difficulty || ''] || 0;
        break;
      case 'score_reached':
        current = statistics.highestScore;
        break;
      case 'boss_killed':
        current = statistics.bossesKilled;
        break;
      case 'no_damage_game':
        current = statistics.noDamageGames;
        break;
      case 'speedrun':
        // 對於速通，target 是最大時間，fastestWin 需要小於等於 target
        current = statistics.fastestWin <= target ? 1 : 0;
        progress.push(current);
        if (current < 1) allMet = false;
        continue;
      case 'tower_sells':
        current = statistics.totalTowersSold;
        break;
      case 'skills_used':
        current = statistics.skillsUsed;
        break;
      case 'endless_waves':
        current = statistics.endlessHighestWave;
        break;
      case 'total_playtime':
        current = statistics.totalPlaytime;
        break;
      case 'login_days':
        current = statistics.loginDays;
        break;
      case 'consecutive_days':
        current = statistics.consecutiveLoginDays;
        break;
      case 'mods_created':
        current = statistics.modsCreated;
        break;
      case 'mods_used':
        current = statistics.modsUsed;
        break;
      case 'towers_fused':
        current = statistics.totalTowerFusions;
        break;
      case 'tactical_protocols':
        current = statistics.tacticalProtocolsChosen || 0;
        break;
      case 'tactical_protocol_types':
        current = (statistics.tacticalProtocolTypes || []).length;
        break;
      case 'custom':
        current = computeCustomCurrent(achievement, statistics, playerAchievements);
        break;
    }

    progress.push(Math.min(current, target));
    if (current < target) allMet = false;
  }

  return { met: allMet, progress };
};

// 自定義條件解析：集中處理所有 custom 類型成就的進度計算
export const computeCustomCurrent = (
  achievement: Achievement,
  statistics: GameStatistics,
  playerAchievements: Record<string, PlayerAchievement>
): number => {
  const id = achievement.id;
  const catalog = getCatalogAchievements();
  const completedCount = countCompletedCatalog(playerAchievements, catalog);

  // 已完成成就數量類
  if (id.startsWith('achievement_hunter')) return completedCount;
  if (id === 'completionist') return completedCount >= catalog.length ? 1 : 0;
  if (id === 'ultimate_completionist') return completedCount;
  // 第五批擴充：里程碑成就計數類
  if (id === 'collect_achievements_150') return completedCount;
  if (id === 'final_200_achievements') return completedCount;
  if (id === 'final_300_achievements') return completedCount;
  if (id === 'final_400_achievements') return completedCount;
  if (id === 'final_500_unlocked') return completedCount;
  if (id === 'final_all_achievements') return completedCount >= catalog.length ? 1 : 0;

  // 隱藏成就解鎖數量
  if (id === 'mystic_finder' || id === 'subtle_5_easter_eggs' || id === 'final_secret_finder') {
    return catalog.filter(a => a.hidden).reduce((acc, a) => {
      const pa = playerAchievements[a.id];
      return acc + (pa && (pa.status === 'completed' || pa.status === 'claimed') ? 1 : 0);
    }, 0);
  }

  // 傳說級成就解鎖數量
  if (id === 'final_legendary_total' || id === 'final_legendary_hunter') {
    const legendary = catalog.filter(a => a.rarity === 'legendary');
    const total = legendary.reduce((acc, a) => {
      const pa = playerAchievements[a.id];
      return acc + (pa && (pa.status === 'completed' || pa.status === 'claimed') ? 1 : 0);
    }, 0);
    if (id === 'final_legendary_total') {
      return total >= legendary.length ? 1 : 0;
    }
    return total;
  }

  // 皮膚收藏類
  if (id === 'skin_first') return statistics.unlockedSkinsCount > 0 ? 1 : 0;
  if (id === 'skin_collector_5') return statistics.unlockedSkinsCount;
  if (id === 'skin_collector_15') return statistics.unlockedSkinsCount;
  if (id === 'skin_master') {
    return statistics.totalSkinsCount > 0 && statistics.unlockedSkinsCount >= statistics.totalSkinsCount ? 1 : 0;
  }
  if (id === 'skin_dresser') return statistics.equippedNonDefaultSkinsCount;

  // 難度多樣化
  if (id === 'mode_diversity') {
    let count = 0;
    if ((statistics.difficultiesCompleted['easy'] || 0) > 0) count++;
    if ((statistics.difficultiesCompleted['normal'] || 0) > 0) count++;
    if ((statistics.difficultiesCompleted['hard'] || 0) > 0) count++;
    return count;
  }
  if (id === 'all_difficulties_complete') {
    return ['easy', 'normal', 'hard', 'nightmare', 'impossible']
      .filter(d => (statistics.difficultiesCompleted[d] || 0) > 0).length;
  }

  // 塔類型多樣化
  if (id === 'tower_arsenal') {
    return Object.entries(statistics.towersPlacedByType || {})
      .filter(([, count]) => (count || 0) > 0).length;
  }
  if (id === 'all_tower_types_max') {
    return (statistics.towerTypesReachedMaxLevel || []).length;
  }
  if (id === 'tower_collector') {
    return Object.entries(statistics.towersPlacedByType || {})
      .filter(([, count]) => (count || 0) > 0).length >= 10 ? 1 : 0;
  }

  if (id === 'fuse_all_four') {
    return (['storm', 'plague', 'demolisher', 'tempest'] as const)
      .filter((type) => (statistics.towersPlacedByType?.[type] || 0) > 0).length;
  }

  // 連勝
  if (id === 'unstoppable_force') return statistics.bestWinStreak || 0;

  if (id === 'protocol_first') return (statistics.tacticalProtocolsChosen || 0) >= 1 ? 1 : 0;
  if (id === 'protocol_ten' || id === 'protocol_fifty') return statistics.tacticalProtocolsChosen || 0;
  if (id === 'protocol_variety') return (statistics.tacticalProtocolTypes || []).length;
  if (id === 'synergy_first') return (statistics.towerSynergyTypes || []).length >= 1 ? 1 : 0;
  if (id === 'synergy_three') return statistics.towerSynergyMaxKinds || 0;
  if (id === 'synergy_catalog') return (statistics.towerSynergyTypes || []).length;

  // 時間／日期式成就：依靠 timeFlags 紀錄是否曾在指定時段啟動遊戲
  if (statistics.timeFlags?.[id]) return achievement.conditions[0]?.target ?? 1;

  return 0;
};
