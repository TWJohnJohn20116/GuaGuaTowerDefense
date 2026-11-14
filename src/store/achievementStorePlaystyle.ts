/**
 * 玩法流派主義 · 局內追蹤與解鎖邏輯
 */

import type { PlaystyleGameEndContext, PlaystyleSessionStats } from '@/types/playstyleIsm';
import { getInitialPlaystyleSession } from '@/types/playstyleIsm';

const ELEMENT_TOWER_TYPES = ['flame', 'poison', 'laser', 'frost', 'lightning'] as const;
const CONTROL_TOWER_TYPES = ['frost', 'wind', 'pulse'] as const;
const RANGED_TOWER_TYPES = ['sniper', 'ballista'] as const;

type UnlockFn = (id: string) => void;

export function mergePlaystyleOnTowerPlaced(
  prev: PlaystyleSessionStats | undefined,
  _towerType: string,
  wave: number,
): PlaystyleSessionStats {
  const base = prev ?? getInitialPlaystyleSession();
  const isFirst = base.firstTowerWave === null;
  return {
    ...base,
    firstTowerWave: isFirst ? wave : base.firstTowerWave,
    lastTowerWave: wave,
    towersBuiltBeforeWave1:
      wave === 0 ? base.towersBuiltBeforeWave1 + 1 : base.towersBuiltBeforeWave1,
  };
}

export function mergePlaystyleOnUpgrade(
  prev: PlaystyleSessionStats | undefined,
  wave: number,
  towerType?: string,
): PlaystyleSessionStats {
  const base = prev ?? getInitialPlaystyleSession();
  const byType = { ...base.upgradesByTowerType };
  if (towerType) {
    byType[towerType] = (byType[towerType] || 0) + 1;
  }
  const next: PlaystyleSessionStats = { ...base, upgradesByTowerType: byType };
  if (wave > 3) return next;
  return { ...next, upgradesBeforeWave4: next.upgradesBeforeWave4 + 1 };
}

export function mergePlaystyleOnPause(
  prev: PlaystyleSessionStats | undefined,
): PlaystyleSessionStats {
  const base = prev ?? getInitialPlaystyleSession();
  return { ...base, pauseCount: base.pauseCount + 1 };
}

export function mergePlaystyleOnSkill(
  prev: PlaystyleSessionStats | undefined,
): PlaystyleSessionStats {
  const base = prev ?? getInitialPlaystyleSession();
  return { ...base, skillsUsedThisGame: base.skillsUsedThisGame + 1 };
}

function countTowerTypesUsed(byType: Record<string, number> | undefined): number {
  if (!byType) return 0;
  return Object.values(byType).filter((c) => (c || 0) > 0).length;
}

function onlyTowerTypes(byType: Record<string, number> | undefined, allowed: readonly string[]): boolean {
  if (!byType) return false;
  const used = Object.entries(byType).filter(([, c]) => (c || 0) > 0);
  if (used.length === 0) return false;
  return used.every(([type]) => allowed.includes(type));
}

function controlTowerRatio(byType: Record<string, number> | undefined): number {
  if (!byType) return 0;
  const total = Object.values(byType).reduce((s, c) => s + (c || 0), 0);
  if (total === 0) return 0;
  const control = CONTROL_TOWER_TYPES.reduce((s, t) => s + (byType[t] || 0), 0);
  return control / total;
}

export interface PlaystyleUnlockInput {
  won: boolean;
  wave: number;
  health: number;
  difficulty: string;
  endless: boolean;
  towersPlaced: number;
  towersUpgraded: number;
  noDamage: boolean;
  towersPlacedByType: Record<string, number>;
  totalTowersSold: number;
  playstyle: PlaystyleSessionStats | undefined;
  context: PlaystyleGameEndContext;
}

/** 檢查並解鎖所有主義相關成就 */
export function checkAndUnlockPlaystyleIsms(
  input: PlaystyleUnlockInput,
  unlock: UnlockFn,
): void {
  const {
    won,
    wave: _wave,
    health,
    difficulty,
    endless,
    towersPlaced,
    towersUpgraded,
    noDamage,
    towersPlacedByType,
    totalTowersSold,
    playstyle,
    context,
  } = input;

  if (!playstyle) return;

  const { firstTowerWave, lastTowerWave, towersBuiltBeforeWave1, pauseCount, skillsUsedThisGame, upgradesBeforeWave4 } = playstyle;
  const typesUsed = countTowerTypesUsed(towersPlacedByType);
  const isHardPlus = difficulty === 'hard' || difficulty === 'nightmare' || difficulty === 'impossible';

  if (!won || endless) return;

  const maxWaves = context.maxWaves;

  // --- 既有主義（補完解鎖） ---
  if (lastTowerWave <= 5 && towersPlaced > 0 && maxWaves > 5) {
    unlock('no_build_after_wave_5');
  }
  if (lastTowerWave <= 10 && towersPlaced > 0 && isHardPlus && maxWaves > 10) {
    unlock('no_build_after_wave_10');
  }
  if (typesUsed === 1 && towersPlaced > 0) {
    unlock('one_type_only');
  }
  if (
    firstTowerWave !== null &&
    context.maxWaves > 0 &&
    firstTowerWave === context.maxWaves &&
    towersPlaced >= 1
  ) {
    unlock('late_bloomer');
  }
  if (onlyTowerTypes(towersPlacedByType, ['basic']) && isHardPlus) {
    unlock('tower_basic_humble');
  }

  // --- 新主義成就 ---
  if (firstTowerWave !== null && firstTowerWave >= 11 && maxWaves >= 11) {
    unlock('ism_late_bloom');
  }
  if (towersBuiltBeforeWave1 >= 8) {
    unlock('ism_rush');
  }
  if (upgradesBeforeWave4 === 0 && towersUpgraded >= 1) {
    unlock('ism_watch');
  }
  if (towersPlaced >= 30) {
    unlock('ism_dense');
  }
  if (towersPlaced > 0 && context.allTowersMaxLevel) {
    unlock('ism_max_level');
  }
  if (typesUsed === 1 && towersPlaced > 0 && ELEMENT_TOWER_TYPES.some((t) => (towersPlacedByType[t] || 0) > 0)) {
    unlock('ism_element');
  }
  if (controlTowerRatio(towersPlacedByType) >= 0.5 && towersPlaced > 0) {
    unlock('ism_control');
  }
  if ((towersPlacedByType.money || 0) === 0 && isHardPlus) {
    unlock('ism_economy_purist');
    unlock('eco_no_money_tower_win');
  }
  if (skillsUsedThisGame === 0 && isHardPlus) {
    unlock('ism_no_skill');
    unlock('perfect_no_skill_hard');
  }
  if (totalTowersSold === 0 && isHardPlus) {
    unlock('ism_stubborn');
    unlock('apex_no_tower_sold_clear');
  }
  if (towersUpgraded === 0 && towersPlaced > 0) {
    unlock('no_upgrade');
  }
  if (towersPlaced === 1 && isHardPlus) {
    unlock('apex_solo_tower_clear');
  }
  if (context.allTowersLevel1 && towersPlaced > 0) {
    unlock('apex_only_lv1_clear');
  }
  if (pauseCount === 0 && isHardPlus) {
    unlock('ism_no_pause');
    unlock('perfect_no_pause');
  }
  if (context.gameSpeed >= 2 && isHardPlus) {
    unlock('ism_double_speed');
    unlock('apex_double_speed_clear');
  }
  if (health === 1) {
    unlock('last_stand');
    unlock('ism_last_stand');
  }
  if (
    noDamage &&
    pauseCount === 0 &&
    totalTowersSold === 0 &&
    skillsUsedThisGame === 0 &&
    isHardPlus
  ) {
    unlock('ism_ultimate');
  }
  if (onlyTowerTypes(towersPlacedByType, [...RANGED_TOWER_TYPES]) && towersPlaced > 0 && isHardPlus) {
    unlock('ism_ranged');
  }
  const hasRanged = RANGED_TOWER_TYPES.some((t) => (towersPlacedByType[t] || 0) > 0);
  if (!hasRanged && towersPlaced > 0 && isHardPlus) {
    unlock('ism_melee');
  }
  if ((towersPlacedByType.money || 0) >= 3) {
    unlock('ism_money');
  }
  if (won && context.finalMoney === 0) {
    unlock('ism_spendthrift');
    unlock('eco_spend_all_no_money');
  }
  if (playstyle.startingMoney > 0 && context.finalMoney >= playstyle.startingMoney * 3) {
    unlock('ism_thrift');
  }
  const balancedTypes = Object.entries(playstyle.upgradesByTowerType).filter(([, c]) => c >= 2).length;
  if (balancedTypes >= 5) {
    unlock('ism_balanced');
  }
  if (context.soloMaxLevelRestLv1 && towersPlaced >= 2) {
    unlock('ism_gamble');
  }
  if (totalTowersSold >= 10) {
    unlock('ism_rotation');
  }
}
