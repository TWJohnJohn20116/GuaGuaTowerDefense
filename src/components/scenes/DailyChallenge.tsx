/**
 * 每日挑戰 · HARDLINE Console
 *
 * ┌ TopBar 52px ────────────────────────────────────────┐
 * ├ Rail 212px（今日／歷史）│ 狀態帶（條件、連續、獎勵）─────┤
 * │                          │ 條件清單 / 歷史表格 + 右側詳情  │
 * └────────────────────────────────────────────────────┘
 */
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useDailyChallengeStore } from '@/store/dailyChallengeStore';
import { useShopStore } from '@/store/shopStore';
import { useTalentStore } from '@/store/talentStore';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n';
import { SceneShell } from '@/components/ui/SceneShell';
import { Btn, Key, Rail, RailItem, StatCell, TopBar } from '@/components/hl';
import { DailyChallengeStats } from '@/components/scenes/daily-challenge/DailyChallengeStats';
import {
  DailyChallengeToolbar,
  type DailyChallengeTab,
} from '@/components/scenes/daily-challenge/DailyChallengeToolbar';
import { DailyChallengeHero } from '@/components/scenes/daily-challenge/DailyChallengeHero';
import { DailyChallengeConditions } from '@/components/scenes/daily-challenge/DailyChallengeConditions';
import { DailyChallengeHistory } from '@/components/scenes/daily-challenge/DailyChallengeHistory';
import { DailyChallengeDetailPanel } from '@/components/scenes/daily-challenge/DailyChallengeDetailPanel';
import { DailyChallengeHistoryPanel } from '@/components/scenes/daily-challenge/DailyChallengeHistoryPanel';
import {
  isDailyChallengeTypingTarget,
  nextDailyChallengeTab,
  resolveDailyChallengeHotkey,
} from '@/data/dailyChallengeKeyboardNav';

export default function DailyChallenge() {
  const { t } = useTranslation();
  const refreshIfNeeded = useDailyChallengeStore((s) => s.refreshIfNeeded);
  const todayChallenge = useDailyChallengeStore((s) => s.todayChallenge);
  const totalCompleted = useDailyChallengeStore((s) => s.totalCompleted);
  const currentStreak = useDailyChallengeStore((s) => s.currentStreak);
  const longestStreak = useDailyChallengeStore((s) => s.longestStreak);
  const history = useDailyChallengeStore((s) => s.history);
  const claimReward = useDailyChallengeStore((s) => s.claimReward);
  const beginPathHandoff = useDailyChallengeStore((s) => s.beginPathHandoff);

  const addCoins = useShopStore((s) => s.addCoins);
  const addTalentPoints = useTalentStore((s) => s.addTalentPoints);
  const setScene = useGameStore((s) => s.setScene);

  const [tab, setTab] = useState<DailyChallengeTab>('today');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshIfNeeded();
    const timer = window.setTimeout(() => setLoading(false), 100);
    return () => window.clearTimeout(timer);
  }, [refreshIfNeeded]);

  const challenge = todayChallenge;

  const overallProgress = useMemo(() => {
    if (!challenge) return 0;
    let total = 0;
    let done = 0;
    challenge.template.conditions.forEach((cond, i) => {
      total += cond.target;
      done += Math.min(cond.target, challenge.progress[i] || 0);
    });
    return total > 0 ? (done / total) * 100 : 0;
  }, [challenge]);

  const historyEntries = useMemo(() => history.slice(0, 30), [history]);
  const historyCompleted = useMemo(
    () => historyEntries.filter((e) => e.completed).length,
    [historyEntries],
  );

  const handleClaim = useCallback(() => {
    if (!challenge || !challenge.completed || challenge.claimed) return;
    const success = claimReward();
    if (!success) return;
    const r = challenge.template.rewards;
    if (r.coins) addCoins(r.coins);
    if (r.talentPoints) addTalentPoints(r.talentPoints);
  }, [challenge, claimReward, addCoins, addTalentPoints]);

  const handleStart = useCallback(() => {
    beginPathHandoff();
    setScene('pathSelection');
  }, [beginPathHandoff, setScene]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const action = resolveDailyChallengeHotkey({
        key: e.key,
        inTextField: isDailyChallengeTypingTarget(e.target),
        tab,
        hasChallenge: Boolean(challenge),
        completed: challenge?.completed ?? false,
        claimed: challenge?.claimed ?? false,
      });
      if (action === 'ignore') return;
      e.preventDefault();
      if (action === 'prev') setTab((current) => nextDailyChallengeTab(current, -1));
      else if (action === 'next') setTab((current) => nextDailyChallengeTab(current, 1));
      else if (action === 'start') handleStart();
      else handleClaim();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [tab, challenge, handleStart, handleClaim]);

  const rewards = challenge?.template.rewards;
  const claimed = challenge?.claimed ?? false;
  const completed = challenge?.completed ?? false;

  return (
    <SceneShell scrollable={false}>
      <div className="flex h-full w-full flex-col">
        <TopBar
          title={t.dailyChallenge.title}
          meta={t.dailyChallenge.subtitle}
          back={{ to: 'mainMenu' }}
        />

        <div className="flex min-h-0 flex-1">
          <Rail
            label="daily"
            foot={
              completed && !claimed ? (
                <Btn variant="signal" size="lg" block onClick={handleClaim}>
                  {t.dailyChallenge.claimReward}
                </Btn>
              ) : !completed ? (
                <Btn variant="signal" size="lg" block onClick={handleStart}>
                  {t.dailyChallenge.startChallenge}
                </Btn>
              ) : (
                <div className="flex items-center gap-2 py-1.5">
                  <span className="h-1.5 w-1.5 bg-[var(--hl-vital)]" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--hl-vital)]">
                    {t.dailyChallenge.rewardClaimed}
                  </span>
                </div>
              )
            }
          >
            <RailItem
              index={1}
              label={t.dailyChallenge.tabToday}
              active={tab === 'today'}
              onClick={() => setTab('today')}
              right={
                <span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-3)]">
                  {Math.round(overallProgress)}%
                </span>
              }
            />
            <RailItem
              index={2}
              label={t.dailyChallenge.pastThirtyDays}
              active={tab === 'history'}
              onClick={() => setTab('history')}
              right={
                <span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-3)]">
                  {`${historyCompleted}/${historyEntries.length}`}
                </span>
              }
            />

            <div className="mt-3 border-t border-[var(--hl-line)] px-3 py-2.5">
              <div className="hl-label">keys</div>
              <div className="mt-1.5 flex flex-col gap-1.5">
                <span className="flex items-center gap-1.5">
                  <Key>←</Key>
                  <Key>→</Key>
                  <span className="text-[10.5px] text-[var(--hl-ink-3)]">
                    {`${t.dailyChallenge.tabToday} / ${t.dailyChallenge.pastThirtyDays}`}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Key>↵</Key>
                  <span className="text-[10.5px] text-[var(--hl-ink-3)]">
                    {completed && !claimed
                      ? t.dailyChallenge.claimReward
                      : t.dailyChallenge.startChallenge}
                  </span>
                </span>
              </div>
            </div>
          </Rail>

          <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--hl-void)]">
            {/* 狀態帶 */}
            <div className="shrink-0 border-b border-[var(--hl-line)] bg-[var(--hl-void-2)]">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2.5">
                <div className="min-w-0 flex-1">
                  {challenge ? (
                    <DailyChallengeHero challenge={challenge} overallProgress={overallProgress} />
                  ) : (
                    <span className="text-[12.5px] text-[var(--hl-ink-3)]">
                      {t.dailyChallenge.loading}
                    </span>
                  )}
                </div>

                <DailyChallengeStats
                  totalCompleted={totalCompleted}
                  currentStreak={currentStreak}
                  longestStreak={longestStreak}
                />

                {rewards && (
                  <div className="flex items-stretch divide-x divide-[var(--hl-line)] border border-[var(--hl-line)]">
                    {rewards.coins != null && (
                      <div className="px-3 py-1.5">
                        <StatCell label={t.dailyChallenge.coins} value={rewards.coins} tone="signal" />
                      </div>
                    )}
                    {rewards.talentPoints != null && (
                      <div className="px-3 py-1.5">
                        <StatCell
                          label={t.dailyChallenge.talentPoints}
                          value={rewards.talentPoints}
                          tone="reach"
                        />
                      </div>
                    )}
                    {rewards.achievementPoints != null && (
                      <div className="px-3 py-1.5">
                        <StatCell
                          label={t.dailyChallenge.achievementPoints}
                          value={rewards.achievementPoints}
                          tone="caution"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <DailyChallengeToolbar
                tab={tab}
                progressPercent={overallProgress}
                historyCompleted={historyCompleted}
                historyTotal={historyEntries.length}
                labels={{
                  today: t.dailyChallenge.tabToday,
                  history: t.dailyChallenge.pastThirtyDays,
                  todayHint: t.dailyChallenge.todayHint,
                  historyHint: t.dailyChallenge.historyHint,
                }}
              />
            </div>

            <div className="flex min-h-0 flex-1">
              <div className="min-h-0 flex-1 overflow-y-auto">
                {tab === 'today' ? (
                  challenge ? (
                    <DailyChallengeConditions challenge={challenge} />
                  ) : null
                ) : (
                  <DailyChallengeHistory history={history} />
                )}
              </div>

              <aside className="hidden w-[336px] shrink-0 border-l border-[var(--hl-line)] bg-[var(--hl-deck)] lg:flex lg:flex-col">
                {tab === 'today' ? (
                  <DailyChallengeDetailPanel
                    challenge={challenge}
                    loading={loading && !challenge}
                  />
                ) : (
                  <DailyChallengeHistoryPanel
                    totalCompleted={totalCompleted}
                    currentStreak={currentStreak}
                    longestStreak={longestStreak}
                    historyCompleted={historyCompleted}
                    historyTotal={historyEntries.length}
                  />
                )}
              </aside>
            </div>
          </main>
        </div>
      </div>
    </SceneShell>
  );
}
