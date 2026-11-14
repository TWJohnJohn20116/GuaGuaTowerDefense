/**
 * 玩法流派主義 · 成就註冊表
 * 集中管理所有「主義」相關成就 id，供解鎖邏輯與成就館篩選使用。
 */

import type { Achievement } from '@/types/achievement';
import { ALL_ACHIEVEMENTS } from '@/data/achievementData';
import { sortAchievements } from '@/data/achievementSort';

/** 第二批起新增的 ism_* 成就 */
const ISM_ACHIEVEMENT_IDS = [
  'ism_late_bloom',
  'ism_rush',
  'ism_watch',
  'ism_dense',
  'ism_max_level',
  'ism_element',
  'ism_control',
  'ism_ranged',
  'ism_melee',
  'ism_money',
  'ism_economy_purist',
  'ism_thrift',
  'ism_spendthrift',
  'ism_stubborn',
  'ism_no_skill',
  'ism_no_pause',
  'ism_double_speed',
  'ism_last_stand',
  'ism_ultimate',
  'ism_balanced',
  'ism_gamble',
  'ism_rotation',
] as const;

/** 早期主義成就（名稱含主義或語意對應） */
const LEGACY_ISM_ACHIEVEMENT_IDS = [
  'no_build_after_wave_5',
  'no_build_after_wave_10',
  'one_type_only',
  'late_bloomer',
  'tower_basic_humble',
  'minimalist',
  'no_upgrade',
  'apex_solo_tower_clear',
] as const;

const ISM_ID_SET = new Set<string>([
  ...ISM_ACHIEVEMENT_IDS,
  ...LEGACY_ISM_ACHIEVEMENT_IDS,
]);

/** 是否為流派主義成就 */
function isPlaystyleIsmAchievement(achievement: Achievement): boolean {
  if (ISM_ID_SET.has(achievement.id)) return true;
  return achievement.name.includes('主義');
}

/** 所有流派主義成就（依 order 排序） */
export function getPlaystyleIsmAchievements(): Achievement[] {
  return sortAchievements(ALL_ACHIEVEMENTS.filter(isPlaystyleIsmAchievement));
}
