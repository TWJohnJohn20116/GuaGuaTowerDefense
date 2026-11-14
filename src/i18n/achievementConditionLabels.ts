import type { AchievementConditionType } from '@/types/achievement';
import type { TranslationKeys } from '@/i18n';

type Cond = TranslationKeys['achievements']['conditions'];

const SNAKE_TO_CAMEL: Record<string, keyof Cond> = {
  games_played: 'gamesPlayed',
  games_won: 'gamesWon',
  waves_completed: 'wavesCompleted',
  enemies_killed: 'enemiesKilled',
  enemy_type_killed: 'enemyTypeKilled',
  towers_placed: 'towersPlaced',
  tower_type_placed: 'towerTypePlaced',
  towers_upgraded: 'towersUpgraded',
  towers_max_level: 'towersMaxLevel',
  money_earned: 'moneyEarned',
  money_spent: 'moneySpent',
  damage_dealt: 'damageDealt',
  damage_taken: 'damageTaken',
  perfect_waves: 'perfectWaves',
  maps_completed: 'mapsCompleted',
  map_completed: 'mapCompleted',
  difficulty_completed: 'difficultyCompleted',
  score_reached: 'scoreReached',
  time_played: 'timePlayed',
  boss_killed: 'bossKilled',
  no_damage_wave: 'noDamageWave',
  no_damage_game: 'noDamageGame',
  speedrun: 'speedrun',
  tower_sells: 'towerSells',
  skills_used: 'skillsUsed',
  endless_waves: 'endlessWaves',
  total_playtime: 'totalPlaytime',
  login_days: 'loginDays',
  consecutive_days: 'consecutiveDays',
  mods_created: 'modsCreated',
  mods_used: 'modsUsed',
  complete_map: 'completeMap',
  complete_wave_set: 'completeWaveSet',
  perfect_map: 'perfectMap',
  build_tower: 'buildTower',
  upgrade_tower: 'upgradeTower',
  max_upgrade_tower: 'maxUpgradeTower',
  build_all_types: 'buildAllTypes',
  kill_enemy: 'killEnemy',
  kill_boss: 'killBoss',
  complete_unique_maps: 'completeUniqueMaps',
  '3star_all_maps': 'star3AllMaps',
  custom: 'custom',
};

export function getAchievementConditionLabel(
  ach: TranslationKeys['achievements'],
  type: AchievementConditionType | string,
): string {
  const key = SNAKE_TO_CAMEL[type];
  if (key && ach.conditions[key]) return ach.conditions[key];
  return type;
}
