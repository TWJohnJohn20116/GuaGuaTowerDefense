/**
 * 皮膚解鎖條件 · 進度計算
 */
import type { TowerSkin, UnlockCondition } from '@/types/skin';
import type { GameStatistics } from '@/types/achievement';
import type { TowerType } from '@/types/game';
import { useStatsStore } from '@/store/statsStore';

export interface SkinUnlockProgress {
  description: string;
  current: number;
  target: number;
  percent: number;
  trackable: boolean;
  complete: boolean;
}

/** 從戰績歷史彙總各塔種擊殺數 */
export function getTowerKillsByType(): Record<string, number> {
  const { gameHistory, currentGame } = useStatsStore.getState();
  const totals: Record<string, number> = {};

  for (const game of gameHistory) {
    for (const ts of game.towerStats) {
      totals[ts.type] = (totals[ts.type] || 0) + ts.kills;
    }
  }

  if (currentGame) {
    for (const [, data] of currentGame.towerTracking) {
      totals[data.type] = (totals[data.type] || 0) + data.kills;
    }
  }

  return totals;
}

function resolveCurrentValue(
  condition: UnlockCondition,
  skin: TowerSkin,
  statistics: GameStatistics,
  completedAchievements: string[],
  towerKills: Record<string, number>,
): { current: number; target: number; trackable: boolean } {
  switch (condition.type) {
    case 'default':
      return { current: 1, target: 1, trackable: false };

    case 'kills': {
      if (!condition.target) return { current: 0, target: 0, trackable: false };
      if (skin.towerType !== 'all') {
        const current = towerKills[skin.towerType] || 0;
        return { current, target: condition.target, trackable: true };
      }
      const current = statistics.totalEnemiesKilled;
      return { current, target: condition.target, trackable: true };
    }

    case 'tower_placed': {
      if (!condition.target) return { current: 0, target: 0, trackable: false };
      if (skin.towerType !== 'all') {
        const current = statistics.towersPlacedByType[skin.towerType] || 0;
        return { current, target: condition.target, trackable: true };
      }
      const current = statistics.totalTowersPlaced;
      return { current, target: condition.target, trackable: true };
    }

    case 'games_won':
      return {
        current: statistics.gamesWon,
        target: condition.target ?? 0,
        trackable: !!condition.target,
      };

    case 'waves_completed':
      return {
        current: statistics.wavesCompleted,
        target: condition.target ?? 0,
        trackable: !!condition.target,
      };

    case 'achievement': {
      const met = condition.achievementId
        ? completedAchievements.includes(condition.achievementId)
        : false;
      return { current: met ? 1 : 0, target: 1, trackable: true };
    }

    case 'special':
    case 'tower_upgraded':
    default:
      return { current: 0, target: 0, trackable: false };
  }
}

export function getSkinUnlockProgress(
  skin: TowerSkin,
  statistics: GameStatistics,
  completedAchievements: string[],
  isUnlocked: boolean,
): SkinUnlockProgress {
  const condition = skin.unlockCondition;

  if (isUnlocked || condition.type === 'default') {
    return {
      description: condition.description,
      current: condition.target ?? 1,
      target: condition.target ?? 1,
      percent: 100,
      trackable: false,
      complete: true,
    };
  }

  const towerKills = getTowerKillsByType();
  const { current, target, trackable } = resolveCurrentValue(
    condition,
    skin,
    statistics,
    completedAchievements,
    towerKills,
  );

  const percent = trackable && target > 0
    ? Math.min(100, Math.round((current / target) * 100))
    : 0;

  return {
    description: condition.description,
    current,
    target,
    percent,
    trackable,
    complete: trackable && target > 0 && current >= target,
  };
}

/** 取得某塔種目前已裝備的皮膚 ID */
export function getEquippedSkinIdForSkin(
  skin: TowerSkin,
  equippedSkins: Record<TowerType, string | null>,
): string | null {
  const tower = skin.towerType === 'all' ? 'basic' : (skin.towerType as TowerType);
  return equippedSkins[tower] ?? null;
}
