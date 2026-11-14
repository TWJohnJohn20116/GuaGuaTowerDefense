/**
 * 結算報告 · 每日挑戰 / 突變試煉區塊建構
 */

import { useDailyChallengeStore } from '@/store/dailyChallengeStore';
import { useMutatorChallengeStore } from '@/store/mutatorChallengeStore';
import { useGameStore } from '@/store/gameStore';
import { getMutatorChallengeById } from '@/data/mutatorChallengeData';
import type { MutatorChallengeRecord } from '@/types/mutatorChallenge';
import type {
  GameEndDailySection,
  GameEndMutatorSection,
} from '@/types/gameEndReport';
import type { GameOutcomeForChallenge } from '@/store/dailyChallengeStore';

export function submitDailyAndBuildSection(
  outcome: GameOutcomeForChallenge,
  progressBaseline: number[],
): GameEndDailySection | undefined {
  const daily = useDailyChallengeStore.getState();
  daily.refreshIfNeeded();
  const before = daily.todayChallenge;
  if (!before) return undefined;

  daily.submitGameOutcome(outcome);
  const after = useDailyChallengeStore.getState().todayChallenge;
  if (!after) return undefined;

  const conditions = after.template.conditions.map((cond, i) => {
    const current = after.progress[i] ?? 0;
    const base = progressBaseline[i] ?? 0;
    return {
      label: cond.label,
      current,
      target: cond.target,
      met: current >= cond.target,
      progressedThisSession: current > base,
    };
  });

  const totalTarget = conditions.reduce((s, c) => s + c.target, 0);
  const totalCurrent = conditions.reduce((s, c) => s + Math.min(c.current, c.target), 0);
  const overallPercent = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;

  const hadProgress = conditions.some((c) => c.progressedThisSession);
  const newlyCompleted = !before.completed && after.completed;
  if (!hadProgress && !newlyCompleted && before.completed) {
    // 今日已完成且本局無新進度：仍顯示簡要狀態
  }

  return {
    challengeName: after.template.name,
    conditions,
    overallPercent,
    newlyCompleted,
    alreadyCompleted: after.completed,
    claimable: after.completed && !after.claimed,
  };
}

export function submitMutatorAndBuildSection(
  won: boolean,
  score: number,
  recordBefore: MutatorChallengeRecord | null,
  challengeId: string | null,
): GameEndMutatorSection | undefined {
  if (!challengeId) return undefined;

  const def = getMutatorChallengeById(challengeId);
  if (!def) return undefined;

  const before = recordBefore ?? useMutatorChallengeStore.getState().getRecord(challengeId);
  useMutatorChallengeStore.getState().submitGameOutcome({ challengeId, won, score });
  const after = useMutatorChallengeStore.getState().getRecord(challengeId);

  return {
    challengeId,
    name: def.name,
    won,
    score,
    bestScore: after.bestScore,
    bestScoreImproved: after.bestScore > before.bestScore,
    newlyCompleted: won && !before.completed && after.completed,
    claimable: after.completed && !after.claimed,
  };
}

export function buildGameOutcomeForDaily(
  won: boolean,
  playTime: number,
  noDamage: boolean,
  fullHpFinish: boolean,
  currentGameStats: Record<string, unknown>,
  towersPlaced: number,
  endless: boolean,
  wave: number,
  difficulty: string,
  customWaveSetId?: string | null,
): GameOutcomeForChallenge {
  return {
    won,
    noDamage,
    fullHp: fullHpFinish,
    playTimeSeconds: playTime,
    moneySpent: (currentGameStats.totalMoneySpent as number) || 0,
    moneyEarned: (currentGameStats.totalMoneyEarned as number) || 0,
    enemiesKilled: (currentGameStats.totalEnemiesKilled as number) || 0,
    enemiesKilledByType: (currentGameStats.enemiesKilledByType as Record<string, number>) || {},
    bossesKilled: (currentGameStats.bossesKilled as number) || 0,
    towersPlaced,
    towersPlacedByType: (currentGameStats.towersPlacedByType as Record<string, number>) || {},
    towersReachedMaxLevel: (currentGameStats.towersReachedMaxLevel as number) || 0,
    perfectWaves: (currentGameStats.perfectWaves as number) || 0,
    endless,
    endlessWave: endless ? wave : 0,
    difficulty,
    towersFused: (currentGameStats.totalTowerFusions as number) || 0,
    customWaveSetId: customWaveSetId || undefined,
  };
}

/** 讀取本局突變挑戰 id（結算當下 gameStore 仍保留） */
export function getActiveMutatorChallengeId(): string | null {
  return useGameStore.getState().mutatorChallengeId;
}
