/**
 * 結算畫面 · 挑戰報告區段
 *
 * 每日挑戰與突變試煉的結果、條件進度、領取。
 * 條件進度用 Meter（方塊線），領取用 quiet Btn，不用彩色底。
 */

import { useCallback } from 'react';
import type React from 'react';
import { useGameStore } from '@/store/gameStore';
import { useDailyChallengeStore } from '@/store/dailyChallengeStore';
import { useMutatorChallengeStore } from '@/store/mutatorChallengeStore';
import { useShopStore } from '@/store/shopStore';
import { useTalentStore } from '@/store/talentStore';
import { getMutatorChallengeById } from '@/data/mutatorChallengeData';
import { resolveGameEndClaimView } from '@/data/gameEndClaimView';
import { useTranslation } from '@/i18n';
import type { GameEndDailySection, GameEndMutatorSection } from '@/types/gameEndReport';
import {
  FlameIcon, DangerIcon, CheckIcon, GiftIcon, ChevronRightIcon, TrophyIcon,
} from '@/components/ui/Icons';
import { Btn, Deck, Dot, Meter, SegHead, StatCell } from '@/components/hl';

interface Props {
  daily?: GameEndDailySection;
  mutator?: GameEndMutatorSection;
  /** 場景自有的報告（例如失敗分析），接在區段頭下方 */
  children?: React.ReactNode;
}

export function GameEndChallengePanel({ daily, mutator, children }: Props) {
  const { t } = useTranslation();
  const g = t.gameEnd;
  const setScene = useGameStore((s) => s.setScene);
  const claimDaily = useDailyChallengeStore((s) => s.claimReward);
  const claimMutator = useMutatorChallengeStore((s) => s.claimReward);
  const addCoins = useShopStore((s) => s.addCoins);
  const addTalentPoints = useTalentStore((s) => s.addTalentPoints);
  const todayChallenge = useDailyChallengeStore((s) => s.todayChallenge);
  const mutatorClaimed = useMutatorChallengeStore((s) =>
    mutator ? (s.records[mutator.challengeId]?.claimed ?? false) : false,
  );

  const dailyClaimView = resolveGameEndClaimView({
    snapshotClaimable: daily?.claimable ?? false,
    liveClaimed: todayChallenge?.claimed ?? false,
  });
  const mutatorClaimView = resolveGameEndClaimView({
    snapshotClaimable: mutator?.claimable ?? false,
    liveClaimed: mutatorClaimed,
  });

  const handleClaimDaily = useCallback(() => {
    if (!claimDaily() || !todayChallenge) return;
    const rewards = todayChallenge.template.rewards;
    if (rewards.coins) addCoins(rewards.coins);
    if (rewards.talentPoints) addTalentPoints(rewards.talentPoints);
  }, [claimDaily, todayChallenge, addCoins, addTalentPoints]);

  const handleClaimMutator = useCallback(() => {
    if (!mutator) return;
    const def = getMutatorChallengeById(mutator.challengeId);
    if (!def) return;
    if (!claimMutator(mutator.challengeId)) return;
    if (def.rewards.coins) addCoins(def.rewards.coins);
    if (def.rewards.talentPoints) addTalentPoints(def.rewards.talentPoints);
  }, [mutator, claimMutator, addCoins, addTalentPoints]);

  if (!daily && !mutator && !children) return null;

  const dailyHasActivity =
    daily &&
    (daily.newlyCompleted ||
      daily.conditions.some((c) => c.progressedThisSession) ||
      !daily.alreadyCompleted);

  return (
    <section className="flex flex-col gap-3">
      <SegHead label="challenge report" />

      {children}

      {daily && dailyHasActivity && (
        <Deck className="flex flex-col gap-3 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FlameIcon className="h-3.5 w-3.5 text-[var(--hl-caution)]" />
              <span className="hl-label text-[var(--hl-ink-2)]">{g.dailyChallenge}</span>
              <span className="font-mono text-[11px] text-[var(--hl-ink-3)]">
                {daily.challengeName}
              </span>
            </div>
            {daily.newlyCompleted && (
              <span className="inline-flex items-center gap-1.5 border border-[var(--hl-line-strong)] px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.1em] text-[var(--hl-vital)]">
                <CheckIcon className="h-3 w-3" />
                {g.todayCompleted}
              </span>
            )}
          </div>

          <div className="flex flex-col">
            {daily.conditions.map((cond, i) => (
              <div
                key={i}
                className="flex flex-col gap-1.5 border-b border-[var(--hl-line)] py-2 last:border-b-0"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <Dot tone={cond.met ? 'vital' : 'ink'} />
                    <span
                      className={`min-w-0 truncate text-[12px] ${
                        cond.met ? 'text-[var(--hl-vital)]' : 'text-[var(--hl-ink-2)]'
                      }`}
                    >
                      {cond.label}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-[11px] tabular-nums text-[var(--hl-ink-3)]">
                    {cond.current} / {cond.target}
                  </span>
                </div>
                <Meter
                  value={cond.current}
                  max={cond.target}
                  tone={cond.met ? 'vital' : 'caution'}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--hl-ink-4)]">
              {g.overallProgress}
              <span className="ml-1.5 tabular-nums text-[var(--hl-ink-2)]">
                {daily.overallPercent}%
              </span>
            </span>
            {dailyClaimView === 'claim' ? (
              <Btn
                variant="quiet"
                size="sm"
                icon={<GiftIcon className="h-3.5 w-3.5" />}
                onClick={handleClaimDaily}
              >
                {g.claimDailyReward}
              </Btn>
            ) : dailyClaimView === 'claimed' ? (
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--hl-vital)]">
                <CheckIcon className="h-3 w-3" />
                {t.dailyChallenge.rewardClaimed}
              </span>
            ) : (
              <Btn
                variant="ghost"
                size="sm"
                onClick={() => setScene('dailyChallenge')}
              >
                {g.viewChallenge}
                <ChevronRightIcon className="h-3 w-3" />
              </Btn>
            )}
          </div>
        </Deck>
      )}

      {mutator && (
        <Deck tone="sunken" className="flex flex-col gap-3 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <DangerIcon className="h-3.5 w-3.5 text-[var(--hl-alarm)]" />
              <span className="hl-label text-[var(--hl-ink-2)]">{g.mutatorTrial}</span>
              <span className="font-mono text-[11px] text-[var(--hl-ink-3)]">{mutator.name}</span>
            </div>
            {mutator.newlyCompleted && (
              <span className="inline-flex items-center gap-1.5 border border-[var(--hl-line-strong)] px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.1em] text-[var(--hl-vital)]">
                <CheckIcon className="h-3 w-3" />
                {g.firstClear}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-5 border-y border-[var(--hl-line)] py-3">
            <StatCell
              label={g.sessionResult}
              value={mutator.won ? g.cleared : g.failed}
              tone={mutator.won ? 'vital' : 'alarm'}
            />
            <div className="flex flex-col gap-1.5">
              <span className="hl-label">{g.bestScore}</span>
              <span className="flex items-center gap-1.5">
                <span className="hl-num text-[15px] leading-none text-[var(--hl-caution)]">
                  {mutator.bestScore.toLocaleString()}
                </span>
                {mutator.bestScoreImproved && (
                  <TrophyIcon className="h-3.5 w-3.5 text-[var(--hl-caution)]" />
                )}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--hl-ink-4)]">
              {g.sessionScore}
              <span className="ml-1.5 tabular-nums text-[var(--hl-ink-2)]">
                {mutator.score.toLocaleString()}
              </span>
            </span>
            {mutatorClaimView === 'claim' ? (
              <Btn
                variant="quiet"
                size="sm"
                icon={<GiftIcon className="h-3.5 w-3.5" />}
                onClick={handleClaimMutator}
              >
                {g.claimMutatorReward}
              </Btn>
            ) : mutatorClaimView === 'claimed' ? (
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--hl-vital)]">
                <CheckIcon className="h-3 w-3" />
                {t.dailyChallenge.rewardClaimed}
              </span>
            ) : (
              <Btn
                variant="ghost"
                size="sm"
                onClick={() => setScene('mutatorChallenge')}
              >
                {g.viewTrial}
                <ChevronRightIcon className="h-3 w-3" />
              </Btn>
            )}
          </div>
        </Deck>
      )}
    </section>
  );
}
