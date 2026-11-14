/**
 * 第三批擴充成就：波次里程碑、連擊擴展、升級擴展、傷害擴展、建造節奏、敵人擊殺進階
 * Expansion Achievements 3: Wave Milestones, Streaks+, Upgrades+, Damage+, Build Tempo, Enemy Kills+
 */

import type { Achievement } from '@/types/achievement';
import React from 'react';
import {
  WaveIcon, WaterWaveIcon, FlameIcon, SnowflakeIcon, LightningIcon,
  TornadoIcon, ExplosionIcon, SwordsIcon, SwordIcon, TargetIcon,
  TowerIcon, GearIcon, WrenchIcon, BuildIcon, ConstructionIcon,
  StarIcon, MedalIcon, TrophyIcon, CrownIcon, SparklesIcon,
  SkullIcon, SkullCrossbonesIcon, SpiderIcon, ScorpionIcon, GhostIcon,
  AntIcon, DemonIcon, AlienMonsterIcon, RobotIcon,
  HeartIcon, ShieldIcon, ZapIcon, RadioactiveIcon, BombIcon,
  DragonIcon, BoneIcon, BloodIcon, FootprintsIcon, RunIcon,
  TimerIcon, ClockIcon, HourglassIcon, CalendarIcon,
} from '@/components/ui/Icons';

// =====================================================================
// U. 波次里程碑 (Wave Milestones) - 達到特定波次
// =====================================================================
export const waveMilestoneAchievements: Achievement[] = [
  { id: 'wave_reach_20', name: '二十波勇士', description: '達到第 20 波', icon: React.createElement(WaveIcon, { className: 'w-8 h-8 text-cyan-300' }), category: 'progress', rarity: 'common', conditions: [{ type: 'waves_completed', target: 20 }], rewards: [{ type: 'points', value: 10 }], order: 300 },
  { id: 'wave_reach_30', name: '三十波勇士', description: '達到第 30 波', icon: React.createElement(WaveIcon, { className: 'w-8 h-8 text-cyan-300' }), category: 'progress', rarity: 'common', conditions: [{ type: 'waves_completed', target: 30 }], rewards: [{ type: 'points', value: 15 }], order: 301 },
  { id: 'wave_reach_40', name: '四十波勇士', description: '達到第 40 波', icon: React.createElement(WaveIcon, { className: 'w-8 h-8 text-cyan-300' }), category: 'progress', rarity: 'uncommon', conditions: [{ type: 'waves_completed', target: 40 }], rewards: [{ type: 'points', value: 20 }], order: 302 },
  { id: 'wave_reach_75', name: '七十五波', description: '達到第 75 波', icon: React.createElement(WaterWaveIcon, { className: 'w-8 h-8 text-cyan-400' }), category: 'progress', rarity: 'rare', conditions: [{ type: 'waves_completed', target: 75 }], rewards: [{ type: 'points', value: 30 }], order: 303 },
  { id: 'wave_reach_150', name: '一百五十波', description: '達到第 150 波', icon: React.createElement(WaterWaveIcon, { className: 'w-8 h-8 text-blue-400' }), category: 'progress', rarity: 'epic', conditions: [{ type: 'waves_completed', target: 150 }], rewards: [{ type: 'points', value: 60 }], order: 304 },
  { id: 'wave_reach_250', name: '波瀾不驚', description: '達到第 250 波', icon: React.createElement(WaterWaveIcon, { className: 'w-8 h-8 text-blue-500' }), category: 'progress', rarity: 'legendary', conditions: [{ type: 'waves_completed', target: 250 }], rewards: [{ type: 'points', value: 120 }, { type: 'title', value: '波瀾不驚' }], order: 305 },
  { id: 'wave_reach_500', name: '波濤洶湧', description: '達到第 500 波', icon: React.createElement(WaterWaveIcon, { className: 'w-8 h-8 text-indigo-500' }), category: 'legendary', rarity: 'legendary', conditions: [{ type: 'waves_completed', target: 500 }], rewards: [{ type: 'points', value: 250 }, { type: 'title', value: '滔天巨浪' }], order: 306 },
  { id: 'wave_perfect_30', name: '完美三十', description: '累計完成 30 個完美波次', icon: React.createElement(SparklesIcon, { className: 'w-8 h-8 text-emerald-300' }), category: 'milestone', rarity: 'uncommon', conditions: [{ type: 'perfect_waves', target: 30 }], rewards: [{ type: 'points', value: 25 }], order: 307 },
  { id: 'wave_perfect_500', name: '完美五百', description: '累計完成 500 個完美波次', icon: React.createElement(SparklesIcon, { className: 'w-8 h-8 text-amber-300' }), category: 'milestone', rarity: 'epic', conditions: [{ type: 'perfect_waves', target: 500 }], rewards: [{ type: 'points', value: 80 }], order: 308 },
];

// =====================================================================
// V. 連擊擴展 (Kill Streak Extension)
// =====================================================================
export const killStreakExtensionAchievements: Achievement[] = [
  { id: 'streak_kill_200', name: '兩百連擊', description: '單波中達成 200 連殺', icon: React.createElement(SwordsIcon, { className: 'w-8 h-8 text-rose-300' }), category: 'challenge', rarity: 'rare', conditions: [{ type: 'custom', target: 200 }], rewards: [{ type: 'points', value: 30 }], order: 310 },
  { id: 'streak_kill_300', name: '三百連擊', description: '單波中達成 300 連殺', icon: React.createElement(SwordIcon, { className: 'w-8 h-8 text-rose-400' }), category: 'challenge', rarity: 'rare', conditions: [{ type: 'custom', target: 300 }], rewards: [{ type: 'points', value: 40 }], order: 311 },
  { id: 'streak_kill_1000', name: '千人斬', description: '單局中累計擊殺 1,000 個敵人', icon: React.createElement(SwordIcon, { className: 'w-8 h-8 text-red-500' }), category: 'challenge', rarity: 'epic', conditions: [{ type: 'custom', target: 1000 }], rewards: [{ type: 'points', value: 70 }, { type: 'title', value: '千人斬' }], order: 312 },
  { id: 'streak_kill_5000', name: '五千殲滅', description: '單局中累計擊殺 5,000 個敵人', icon: React.createElement(SkullCrossbonesIcon, { className: 'w-8 h-8 text-rose-500' }), category: 'legendary', rarity: 'legendary', conditions: [{ type: 'custom', target: 5000 }], rewards: [{ type: 'points', value: 150 }, { type: 'title', value: '殲滅之主' }], order: 313 },
  { id: 'streak_perfect_10', name: '十場完美', description: '連續 10 場無傷通關', icon: React.createElement(SparklesIcon, { className: 'w-8 h-8 text-emerald-400' }), category: 'noDamage', rarity: 'legendary', conditions: [{ type: 'custom', target: 10 }], rewards: [{ type: 'points', value: 150 }, { type: 'title', value: '十場完美' }], order: 314 },
  { id: 'streak_win_50', name: '五十連勝', description: '連續 50 場勝利', icon: React.createElement(TrophyIcon, { className: 'w-8 h-8 text-yellow-500' }), category: 'legendary', rarity: 'legendary', conditions: [{ type: 'custom', target: 50 }], rewards: [{ type: 'points', value: 200 }, { type: 'title', value: '不敗傳說' }], order: 315 },
];

// =====================================================================
// W. 升級擴展 (Upgrades Extension)
// =====================================================================
export const upgradeExtensionAchievements: Achievement[] = [
  { id: 'upgrade_total_100', name: '升級新手', description: '累計升級塔 100 次', icon: React.createElement(StarIcon, { className: 'w-8 h-8 text-yellow-300' }), category: 'tower', rarity: 'common', conditions: [{ type: 'towers_upgraded', target: 100 }], rewards: [{ type: 'points', value: 10 }], order: 320 },
  { id: 'upgrade_total_500', name: '升級老手', description: '累計升級塔 500 次', icon: React.createElement(MedalIcon, { className: 'w-8 h-8 text-amber-300' }), category: 'tower', rarity: 'uncommon', conditions: [{ type: 'towers_upgraded', target: 500 }], rewards: [{ type: 'points', value: 25 }], order: 321 },
  { id: 'upgrade_total_2000', name: '升級大師', description: '累計升級塔 2,000 次', icon: React.createElement(MedalIcon, { className: 'w-8 h-8 text-orange-400' }), category: 'tower', rarity: 'rare', conditions: [{ type: 'towers_upgraded', target: 2000 }], rewards: [{ type: 'points', value: 50 }, { type: 'title', value: '升級大師' }], order: 322 },
  { id: 'upgrade_total_10000', name: '升級宗師', description: '累計升級塔 10,000 次', icon: React.createElement(CrownIcon, { className: 'w-8 h-8 text-amber-500' }), category: 'tower', rarity: 'legendary', conditions: [{ type: 'towers_upgraded', target: 10000 }], rewards: [{ type: 'points', value: 150 }, { type: 'title', value: '升級宗師' }], order: 323 },
  { id: 'max_tower_25', name: '滿級小隊', description: '累計擁有 25 座滿級塔', icon: React.createElement(TowerIcon, { className: 'w-8 h-8 text-violet-300' }), category: 'tower', rarity: 'uncommon', conditions: [{ type: 'towers_max_level', target: 25 }], rewards: [{ type: 'points', value: 20 }], order: 324 },
  { id: 'max_tower_100', name: '滿級軍團', description: '累計擁有 100 座滿級塔', icon: React.createElement(CrownIcon, { className: 'w-8 h-8 text-violet-400' }), category: 'tower', rarity: 'rare', conditions: [{ type: 'towers_max_level', target: 100 }], rewards: [{ type: 'points', value: 50 }, { type: 'title', value: '滿級軍團' }], order: 325 },
  { id: 'max_tower_500', name: '滿級帝國', description: '累計擁有 500 座滿級塔', icon: React.createElement(CrownIcon, { className: 'w-8 h-8 text-fuchsia-500' }), category: 'tower', rarity: 'epic', conditions: [{ type: 'towers_max_level', target: 500 }], rewards: [{ type: 'points', value: 100 }, { type: 'title', value: '滿級帝國' }], order: 326 },
];

// =====================================================================
// X. 傷害擴展 (Damage Extension)
// =====================================================================
export const damageExtensionAchievements: Achievement[] = [
  { id: 'dmg_single_50k', name: '五萬傷害', description: '單場造成 50,000 傷害', icon: React.createElement(ExplosionIcon, { className: 'w-8 h-8 text-orange-300' }), category: 'tower', rarity: 'common', conditions: [{ type: 'custom', target: 50000 }], rewards: [{ type: 'points', value: 10 }], order: 330 },
  { id: 'dmg_single_200k', name: '二十萬傷害', description: '單場造成 200,000 傷害', icon: React.createElement(ExplosionIcon, { className: 'w-8 h-8 text-orange-400' }), category: 'tower', rarity: 'uncommon', conditions: [{ type: 'custom', target: 200000 }], rewards: [{ type: 'points', value: 20 }], order: 331 },
  { id: 'dmg_single_1m', name: '百萬傷害', description: '單場造成 1,000,000 傷害', icon: React.createElement(ExplosionIcon, { className: 'w-8 h-8 text-rose-400' }), category: 'tower', rarity: 'rare', conditions: [{ type: 'custom', target: 1000000 }], rewards: [{ type: 'points', value: 35 }], order: 332 },
  { id: 'dmg_single_10m', name: '千萬傷害', description: '單場造成 10,000,000 傷害', icon: React.createElement(ExplosionIcon, { className: 'w-8 h-8 text-rose-500' }), category: 'tower', rarity: 'epic', conditions: [{ type: 'custom', target: 10000000 }], rewards: [{ type: 'points', value: 60 }, { type: 'title', value: '千萬殺手' }], order: 333 },
  { id: 'dmg_single_crit_100', name: '暴擊連發', description: '單場觸發 100 次暴擊', icon: React.createElement(ZapIcon, { className: 'w-8 h-8 text-yellow-400' }), category: 'tower', rarity: 'rare', conditions: [{ type: 'custom', target: 100 }], rewards: [{ type: 'points', value: 30 }], order: 334 },
  { id: 'dmg_single_crit_500', name: '致命連擊', description: '單場觸發 500 次暴擊', icon: React.createElement(ZapIcon, { className: 'w-8 h-8 text-yellow-500' }), category: 'tower', rarity: 'epic', conditions: [{ type: 'custom', target: 500 }], rewards: [{ type: 'points', value: 60 }, { type: 'title', value: '致命連擊' }], order: 335 },
  { id: 'dmg_total_500m', name: '五億傷害', description: '累計造成 500,000,000 傷害', icon: React.createElement(BombIcon, { className: 'w-8 h-8 text-red-400' }), category: 'milestone', rarity: 'epic', conditions: [{ type: 'damage_dealt', target: 500_000_000 }], rewards: [{ type: 'points', value: 100 }], order: 336 },
  { id: 'dmg_total_10b', name: '百億傷害', description: '累計造成 10,000,000,000 傷害', icon: React.createElement(RadioactiveIcon, { className: 'w-8 h-8 text-fuchsia-500' }), category: 'legendary', rarity: 'legendary', conditions: [{ type: 'damage_dealt', target: 10_000_000_000 }], rewards: [{ type: 'points', value: 250 }, { type: 'title', value: '毀滅之神' }], order: 337 },
];

// =====================================================================
// Y. 建造節奏 (Build Tempo)
// =====================================================================
export const buildTempoAchievements: Achievement[] = [
  { id: 'build_first_5_in_wave_1', name: '快速布陣', description: '在第一波之前建造 5 座塔', icon: React.createElement(ConstructionIcon, { className: 'w-8 h-8 text-blue-300' }), category: 'challenge', rarity: 'common', conditions: [{ type: 'custom', target: 5 }], rewards: [{ type: 'points', value: 10 }], order: 340 },
  { id: 'build_first_10_in_wave_3', name: '迅雷不及', description: '在第 3 波結束前建造 10 座塔', icon: React.createElement(BuildIcon, { className: 'w-8 h-8 text-cyan-300' }), category: 'challenge', rarity: 'uncommon', conditions: [{ type: 'custom', target: 10 }], rewards: [{ type: 'points', value: 20 }], order: 341 },
  { id: 'build_one_per_wave', name: '節奏大師', description: '一場遊戲中每波至少建造 1 座塔（連續 10 波）', icon: React.createElement(TimerIcon, { className: 'w-8 h-8 text-emerald-300' }), category: 'challenge', rarity: 'rare', conditions: [{ type: 'custom', target: 10 }], rewards: [{ type: 'points', value: 30 }], order: 342 },
  { id: 'build_total_500', name: '建造老手', description: '累計建造 500 座塔', icon: React.createElement(ConstructionIcon, { className: 'w-8 h-8 text-amber-300' }), category: 'milestone', rarity: 'uncommon', conditions: [{ type: 'towers_placed', target: 500 }], rewards: [{ type: 'points', value: 25 }], order: 343 },
  { id: 'build_total_2k', name: '建造大師', description: '累計建造 2,000 座塔', icon: React.createElement(GearIcon, { className: 'w-8 h-8 text-orange-400' }), category: 'milestone', rarity: 'rare', conditions: [{ type: 'towers_placed', target: 2000 }], rewards: [{ type: 'points', value: 50 }, { type: 'title', value: '建造大師' }], order: 344 },
  { id: 'build_total_10k', name: '建築宗師', description: '累計建造 10,000 座塔', icon: React.createElement(WrenchIcon, { className: 'w-8 h-8 text-rose-400' }), category: 'milestone', rarity: 'legendary', conditions: [{ type: 'towers_placed', target: 10000 }], rewards: [{ type: 'points', value: 150 }, { type: 'title', value: '建築宗師' }], order: 345 },
  { id: 'no_build_after_wave_5', name: '前期主義', description: '在第 5 波之後不再建造新塔且通關', icon: React.createElement(ShieldIcon, { className: 'w-8 h-8 text-blue-400' }), category: 'challenge', rarity: 'rare', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 30 }], order: 346 },
  { id: 'no_build_after_wave_10', name: '極致前期', description: '在第 10 波之後不再建造新塔且通關困難', icon: React.createElement(ShieldIcon, { className: 'w-8 h-8 text-blue-500' }), category: 'challenge', rarity: 'epic', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 60 }, { type: 'title', value: '前期主義' }], prerequisite: ['no_build_after_wave_5'], order: 347 },
];

// =====================================================================
// Z. 敵人擊殺進階 (Enemy Kills Advanced)
// =====================================================================
export const enemyKillsAdvancedAchievements: Achievement[] = [
  { id: 'kill_total_500k', name: '五十萬殲滅', description: '累計擊殺 500,000 個敵人', icon: React.createElement(SkullIcon, { className: 'w-8 h-8 text-rose-500' }), category: 'milestone', rarity: 'legendary', conditions: [{ type: 'enemies_killed', target: 500000 }], rewards: [{ type: 'points', value: 150 }, { type: 'title', value: '殲滅大師' }], order: 350 },
  { id: 'kill_total_1m', name: '百萬殲滅', description: '累計擊殺 1,000,000 個敵人', icon: React.createElement(SkullCrossbonesIcon, { className: 'w-8 h-8 text-fuchsia-500' }), category: 'legendary', rarity: 'legendary', conditions: [{ type: 'enemies_killed', target: 1000000 }], rewards: [{ type: 'points', value: 300 }, { type: 'title', value: '百萬殲滅者' }], order: 351 },
  { id: 'kill_boss_10', name: 'Boss 屠夫', description: '累計擊殺 10 個 Boss', icon: React.createElement(CrownIcon, { className: 'w-8 h-8 text-red-400' }), category: 'enemy', rarity: 'uncommon', conditions: [{ type: 'boss_killed', target: 10 }], rewards: [{ type: 'points', value: 20 }], order: 352 },
  { id: 'kill_boss_50', name: 'Boss 殺神', description: '累計擊殺 50 個 Boss', icon: React.createElement(CrownIcon, { className: 'w-8 h-8 text-red-500' }), category: 'enemy', rarity: 'epic', conditions: [{ type: 'boss_killed', target: 50 }], rewards: [{ type: 'points', value: 70 }, { type: 'title', value: 'Boss 殺神' }], order: 353 },
  { id: 'kill_boss_200', name: 'Boss 終結者', description: '累計擊殺 200 個 Boss', icon: React.createElement(DragonIcon, { className: 'w-8 h-8 text-red-600' }), category: 'enemy', rarity: 'legendary', conditions: [{ type: 'boss_killed', target: 200 }], rewards: [{ type: 'points', value: 200 }, { type: 'title', value: 'Boss 終結者' }], order: 354 },
  { id: 'kill_spider', name: '蛛蛛之敵', description: '擊殺 500 個蜘蛛類敵人', icon: React.createElement(SpiderIcon, { className: 'w-8 h-8 text-purple-400' }), category: 'enemy', rarity: 'uncommon', conditions: [{ type: 'custom', target: 500 }], rewards: [{ type: 'points', value: 20 }], order: 355 },
  { id: 'kill_ghost_phantom', name: '驅魔人', description: '擊殺 500 個幽靈類敵人', icon: React.createElement(GhostIcon, { className: 'w-8 h-8 text-indigo-300' }), category: 'enemy', rarity: 'uncommon', conditions: [{ type: 'custom', target: 500 }], rewards: [{ type: 'points', value: 20 }], order: 356 },
  { id: 'kill_robot_army', name: '機械戰爭', description: '擊殺 500 個機器人類敵人', icon: React.createElement(RobotIcon, { className: 'w-8 h-8 text-slate-300' }), category: 'enemy', rarity: 'uncommon', conditions: [{ type: 'custom', target: 500 }], rewards: [{ type: 'points', value: 20 }], order: 357 },
  { id: 'kill_demon_horde', name: '惡魔殺手', description: '擊殺 500 個惡魔類敵人', icon: React.createElement(DemonIcon, { className: 'w-8 h-8 text-red-400' }), category: 'enemy', rarity: 'rare', conditions: [{ type: 'custom', target: 500 }], rewards: [{ type: 'points', value: 30 }, { type: 'title', value: '驅魔師' }], order: 358 },
  { id: 'kill_alien_invader', name: '異星驅逐', description: '擊殺 500 個外星類敵人', icon: React.createElement(AlienMonsterIcon, { className: 'w-8 h-8 text-emerald-400' }), category: 'enemy', rarity: 'rare', conditions: [{ type: 'custom', target: 500 }], rewards: [{ type: 'points', value: 30 }], order: 359 },
  { id: 'kill_ant_swarm', name: '蟻群殺手', description: '擊殺 1,000 個小型敵人', icon: React.createElement(AntIcon, { className: 'w-8 h-8 text-amber-300' }), category: 'enemy', rarity: 'common', conditions: [{ type: 'custom', target: 1000 }], rewards: [{ type: 'points', value: 15 }], order: 360 },
  { id: 'kill_scorpion_master', name: '蠍之主', description: '擊殺 200 個蠍類敵人', icon: React.createElement(ScorpionIcon, { className: 'w-8 h-8 text-orange-400' }), category: 'enemy', rarity: 'uncommon', conditions: [{ type: 'custom', target: 200 }], rewards: [{ type: 'points', value: 20 }], order: 361 },
];

// =====================================================================
// AA. 元素塔運用 (Element Tower Usage)
// =====================================================================
export const elementTowerAchievements: Achievement[] = [
  { id: 'fire_burn_1000', name: '焚天大師', description: '使用火焰塔造成燃燒效果 1,000 次', icon: React.createElement(FlameIcon, { className: 'w-8 h-8 text-orange-500' }), category: 'tower', rarity: 'rare', conditions: [{ type: 'custom', target: 1000 }], rewards: [{ type: 'points', value: 30 }], order: 370 },
  { id: 'ice_freeze_1000', name: '極凍長者', description: '使用冰霜塔造成冰凍效果 1,000 次', icon: React.createElement(SnowflakeIcon, { className: 'w-8 h-8 text-cyan-400' }), category: 'tower', rarity: 'rare', conditions: [{ type: 'custom', target: 1000 }], rewards: [{ type: 'points', value: 30 }], order: 371 },
  { id: 'thunder_chain_1000', name: '雷霆連鎖', description: '使用閃電塔觸發連鎖 1,000 次', icon: React.createElement(LightningIcon, { className: 'w-8 h-8 text-yellow-400' }), category: 'tower', rarity: 'rare', conditions: [{ type: 'custom', target: 1000 }], rewards: [{ type: 'points', value: 30 }], order: 372 },
  { id: 'poison_dot_1000', name: '劇毒大師', description: '使用毒素塔造成中毒效果 1,000 次', icon: React.createElement(RadioactiveIcon, { className: 'w-8 h-8 text-green-400' }), category: 'tower', rarity: 'rare', conditions: [{ type: 'custom', target: 1000 }], rewards: [{ type: 'points', value: 30 }], order: 373 },
  { id: 'wind_push_500', name: '吹風達人', description: '使用風塔擊退 500 次', icon: React.createElement(TornadoIcon, { className: 'w-8 h-8 text-sky-300' }), category: 'tower', rarity: 'uncommon', conditions: [{ type: 'custom', target: 500 }], rewards: [{ type: 'points', value: 25 }], order: 374 },
  { id: 'laser_pierce_2000', name: '雷射穿透', description: '使用雷射塔穿透 2,000 次', icon: React.createElement(ZapIcon, { className: 'w-8 h-8 text-pink-400' }), category: 'tower', rarity: 'rare', conditions: [{ type: 'custom', target: 2000 }], rewards: [{ type: 'points', value: 30 }], order: 375 },
  { id: 'machine_volley_500', name: '機關齊射', description: '使用機關槍塔同時打擊 500 次', icon: React.createElement(TargetIcon, { className: 'w-8 h-8 text-cyan-300' }), category: 'tower', rarity: 'uncommon', conditions: [{ type: 'custom', target: 500 }], rewards: [{ type: 'points', value: 25 }], order: 376 },
  { id: 'cannon_splash_500', name: '加農濺射', description: '使用加農炮塔造成範圍傷害 500 次', icon: React.createElement(BombIcon, { className: 'w-8 h-8 text-orange-400' }), category: 'tower', rarity: 'uncommon', conditions: [{ type: 'custom', target: 500 }], rewards: [{ type: 'points', value: 25 }], order: 377 },
  { id: 'sniper_headshot_1000', name: '狙擊爆頭', description: '使用狙擊塔擊出暴擊 1,000 次', icon: React.createElement(TargetIcon, { className: 'w-8 h-8 text-red-400' }), category: 'tower', rarity: 'rare', conditions: [{ type: 'custom', target: 1000 }], rewards: [{ type: 'points', value: 30 }], order: 378 },
  { id: 'basic_steady_5000', name: '基礎穩重', description: '使用基礎塔造成累計 5,000,000 傷害', icon: React.createElement(TowerIcon, { className: 'w-8 h-8 text-blue-400' }), category: 'tower', rarity: 'rare', conditions: [{ type: 'custom', target: 5000000 }], rewards: [{ type: 'points', value: 30 }], order: 379 },
];

// =====================================================================
// BB. 戰鬥時長 (Combat Duration)
// =====================================================================
export const combatDurationAchievements: Achievement[] = [
  { id: 'duration_30min', name: '半小時戰役', description: '單場遊戲時間達 30 分鐘', icon: React.createElement(ClockIcon, { className: 'w-8 h-8 text-cyan-300' }), category: 'challenge', rarity: 'common', conditions: [{ type: 'custom', target: 1800 }], rewards: [{ type: 'points', value: 10 }], order: 380 },
  { id: 'duration_1h', name: '一小時戰役', description: '單場遊戲時間達 60 分鐘', icon: React.createElement(HourglassIcon, { className: 'w-8 h-8 text-amber-300' }), category: 'challenge', rarity: 'uncommon', conditions: [{ type: 'custom', target: 3600 }], rewards: [{ type: 'points', value: 20 }], order: 381 },
  { id: 'duration_2h', name: '兩小時戰役', description: '單場遊戲時間達 120 分鐘', icon: React.createElement(HourglassIcon, { className: 'w-8 h-8 text-orange-400' }), category: 'challenge', rarity: 'rare', conditions: [{ type: 'custom', target: 7200 }], rewards: [{ type: 'points', value: 30 }, { type: 'title', value: '長征者' }], order: 382 },
  { id: 'duration_24h_session', name: '日以繼夜', description: '在 24 小時內完成 10 場以上對局', icon: React.createElement(CalendarIcon, { className: 'w-8 h-8 text-rose-300' }), category: 'hidden', rarity: 'rare', conditions: [{ type: 'custom', target: 10 }], rewards: [{ type: 'points', value: 30 }], hidden: true, order: 383 },
];

// =====================================================================
// CC. 跑步與動作 (Mobility) - 操作習慣
// =====================================================================
export const mobilityAchievements: Achievement[] = [
  { id: 'mob_pause_play', name: '暫停精算師', description: '在一場遊戲中暫停 20 次以上', icon: React.createElement(HourglassIcon, { className: 'w-8 h-8 text-slate-300' }), category: 'hidden', rarity: 'common', conditions: [{ type: 'custom', target: 20 }], rewards: [{ type: 'points', value: 10 }], hidden: true, order: 390 },
  { id: 'mob_speed_clear', name: '飛奔者', description: '以最快速度通關 10 場遊戲', icon: React.createElement(RunIcon, { className: 'w-8 h-8 text-amber-300' }), category: 'hidden', rarity: 'uncommon', conditions: [{ type: 'custom', target: 10 }], rewards: [{ type: 'points', value: 20 }], hidden: true, order: 391 },
  { id: 'mob_steady_walker', name: '穩步前進', description: '以普通速度通關 50 場遊戲', icon: React.createElement(FootprintsIcon, { className: 'w-8 h-8 text-emerald-300' }), category: 'progress', rarity: 'common', conditions: [{ type: 'custom', target: 50 }], rewards: [{ type: 'points', value: 15 }], order: 392 },
  { id: 'mob_blood_trail', name: '血跡斑斑', description: '單場承受 500 點以上傷害但仍通關', icon: React.createElement(BloodIcon, { className: 'w-8 h-8 text-rose-400' }), category: 'challenge', rarity: 'rare', conditions: [{ type: 'custom', target: 500 }], rewards: [{ type: 'points', value: 30 }, { type: 'title', value: '血戰勝者' }], order: 393 },
  { id: 'mob_bone_warrior', name: '骨灰玩家', description: '單場結束時剩餘塔數低於 3 但仍通關', icon: React.createElement(BoneIcon, { className: 'w-8 h-8 text-amber-300' }), category: 'challenge', rarity: 'epic', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 50 }, { type: 'title', value: '不屈鬥士' }], order: 394 },
];

// =====================================================================
// DD. 心臟系列 (Heart) - 生命值相關
// =====================================================================
export const heartSeriesAchievements: Achievement[] = [
  { id: 'heart_full_100_games', name: '不破之心', description: '累計 100 場全程零失血勝利', icon: React.createElement(HeartIcon, { className: 'w-8 h-8 text-red-400' }), category: 'noDamage', rarity: 'legendary', conditions: [{ type: 'custom', target: 100 }], rewards: [{ type: 'points', value: 200 }, { type: 'title', value: '不破之心' }], order: 400 },
  { id: 'heart_low_hp_clutch', name: '臨危不亂', description: '在生命值低於 3 點時連續通關 5 場', icon: React.createElement(HeartIcon, { className: 'w-8 h-8 text-rose-500' }), category: 'noDamage', rarity: 'epic', conditions: [{ type: 'custom', target: 5 }], rewards: [{ type: 'points', value: 70 }], order: 401 },
  { id: 'heart_endless_no_dmg', name: '無盡之心', description: '在無盡模式中無傷完成 100 波', icon: React.createElement(HeartIcon, { className: 'w-8 h-8 text-pink-500' }), category: 'noDamage', rarity: 'legendary', conditions: [{ type: 'custom', target: 100 }], rewards: [{ type: 'points', value: 200 }, { type: 'title', value: '無盡之心' }], order: 402 },
];
