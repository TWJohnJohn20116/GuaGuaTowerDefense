/**
 * 結算畫面 · 成就解鎖區段
 *
 * 新解鎖清單、領取、差一點解鎖、前往成就館。
 * 稀有度只當資料色用：名稱轉稀有度色，左側一條 2px 色條，不做漸層底。
 */

import { useMemo, useCallback } from 'react';
import type React from 'react';
import { useGameStore } from '@/store/gameStore';
import { useAchievementStore } from '@/store/achievementStore';
import { getAchievement } from '@/data/achievementData';
import { RARITY_CONFIG } from '@/types/achievement';
import { useTranslation } from '@/i18n';
import {
  TrophyIcon, TargetIcon, GiftIcon,
  CheckIcon, BooksIcon, ChevronRightIcon,
} from '@/components/ui/Icons';
import { Btn, Deck, SegHead } from '@/components/hl';
import {
  pickNearMissAchievements,
  formatNearestProgressText,
} from './gameEndUtils';

interface Props {
  unlockedIds: string[];
  /** 場景自有的獎章列等，接在區段頭下方 */
  children?: React.ReactNode;
}

export function GameEndAchievementPanels({ unlockedIds, children }: Props) {
  const { t } = useTranslation();
  const setScene = useGameStore((s) => s.setScene);
  const playerAchievements = useAchievementStore((s) => s.playerAchievements);
  const {
    getAchievementStatus,
    getCompletionPercentage,
    getAchievementProgress,
    claimAchievement,
    setNavigateHighlightAchievementId,
  } = useAchievementStore();

  const unlocked = useMemo(
    () =>
      unlockedIds
        .map((id) => getAchievement(id))
        .filter((a): a is NonNullable<typeof a> => a != null),
    [unlockedIds],
  );

  const claimableIds = useMemo(
    () => unlockedIds.filter((id) => getAchievementStatus(id) === 'completed'),
    [unlockedIds, playerAchievements, getAchievementStatus],
  );

  const nearMiss = useMemo(
    () =>
      pickNearMissAchievements(
        getAchievementStatus,
        getCompletionPercentage,
        getAchievementProgress,
        { limit: 3, minPct: 35 },
      ),
    [playerAchievements, getAchievementStatus, getCompletionPercentage, getAchievementProgress],
  );

  const handleClaim = useCallback(
    (id: string) => {
      claimAchievement(id);
    },
    [claimAchievement],
  );

  const handleClaimAll = useCallback(() => {
    for (const id of claimableIds) {
      claimAchievement(id);
    }
  }, [claimableIds, claimAchievement]);

  const handleGoAchievements = useCallback(() => {
    const highlight =
      claimableIds[0] ??
      unlockedIds[0] ??
      nearMiss[0]?.achievement.id ??
      null;
    setNavigateHighlightAchievementId(highlight);
    setScene('achievements');
  }, [
    claimableIds,
    unlockedIds,
    nearMiss,
    setNavigateHighlightAchievementId,
    setScene,
  ]);

  const showUnlocked = unlocked.length > 0;
  const showNearMiss = nearMiss.length > 0;

  return (
    <section className="flex flex-col gap-3">
      <SegHead
        label="achievements"
        right={
          <span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-3)]">
            {String(unlocked.length).padStart(2, '0')}
          </span>
        }
      />

      {children}

      {showUnlocked && (
        <Deck className="flex flex-col gap-3 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <TrophyIcon className="h-3.5 w-3.5 text-[var(--hl-caution)]" />
              <span className="hl-label text-[var(--hl-ink-2)]">本局新解鎖成就</span>
              <span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-4)]">
                ({unlocked.length})
              </span>
            </div>
            {claimableIds.length > 1 && (
              <Btn variant="quiet" size="sm" icon={<GiftIcon className="h-3.5 w-3.5" />} onClick={handleClaimAll}>
                全部領取
              </Btn>
            )}
          </div>

          <div className="flex flex-col">
            {unlocked.map((achievement) => {
              const rarity = RARITY_CONFIG[achievement.rarity];
              const status = getAchievementStatus(achievement.id);
              const claimable = status === 'completed';
              const claimed = status === 'claimed';

              return (
                <div
                  key={achievement.id}
                  className="relative grid grid-cols-[32px_1fr_auto] items-center gap-3 border-b border-[var(--hl-line)] py-2.5 pl-2.5 last:border-b-0"
                >
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-2.5 h-[calc(100%-1.25rem)] w-[2px]"
                    style={{ background: rarity.color }}
                  />
                  <span className="flex h-8 w-8 items-center justify-center border border-[var(--hl-line)] bg-[var(--hl-deck-2)] text-[var(--hl-ink-2)]">
                    {achievement.icon}
                  </span>
                  <span className="min-w-0">
                    <span
                      className="block truncate text-[13px] font-medium"
                      style={{ color: rarity.color }}
                    >
                      {achievement.name}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-[var(--hl-ink-3)]">
                      {achievement.description}
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    {claimed ? (
                      <CheckIcon className="h-4 w-4 text-[var(--hl-vital)]" />
                    ) : claimable ? (
                      <Btn
                        variant="quiet"
                        size="sm"
                        icon={<GiftIcon className="h-3.5 w-3.5" />}
                        onClick={() => handleClaim(achievement.id)}
                      >
                        {t.dailyChallenge.claimReward}
                      </Btn>
                    ) : (
                      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--hl-ink-4)]">
                        {rarity.label}
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </Deck>
      )}

      {showNearMiss && (
        <Deck tone="sunken" className="flex flex-col gap-3 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <TargetIcon className="h-3.5 w-3.5 text-[var(--hl-ink-3)]" />
            <span className="hl-label text-[var(--hl-ink-2)]">差一點就解鎖</span>
          </div>

          <div className="flex flex-col">
            {nearMiss.map(({ achievement, pct, progress }) => {
              const rarity = RARITY_CONFIG[achievement.rarity];
              const progressText = formatNearestProgressText(achievement, progress);

              return (
                <div
                  key={achievement.id}
                  className="flex flex-col gap-1.5 border-b border-[var(--hl-line)] py-2.5 last:border-b-0"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 truncate text-[12.5px] text-[var(--hl-ink)]">
                      {achievement.name}
                    </span>
                    <span
                      className="shrink-0 font-mono text-[11px] font-semibold tabular-nums"
                      style={{ color: rarity.color }}
                    >
                      {Math.round(pct)}%
                    </span>
                  </div>
                  <span className="relative block h-1 w-full bg-[var(--hl-void-2)]">
                    <span
                      className="absolute inset-y-0 left-0"
                      style={{ width: `${pct}%`, background: rarity.color }}
                    />
                  </span>
                  {progressText && (
                    <span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-4)]">
                      進度 {progressText}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Deck>
      )}

      <div className="flex justify-end">
        <Btn
          variant="line"
          size="sm"
          icon={<BooksIcon className="h-3.5 w-3.5" />}
          onClick={handleGoAchievements}
        >
          前往成就館
          <ChevronRightIcon className="h-3 w-3" />
        </Btn>
      </div>
    </section>
  );
}
