/**
 * 突變挑戰 · HARDLINE Console
 *
 * 左軌是難度級距（mono 編號 + 筆數），主區是密集挑戰格，右側是詳情 336px。
 */
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useMutatorChallengeStore } from '@/store/mutatorChallengeStore';
import { useShopStore } from '@/store/shopStore';
import { useTalentStore } from '@/store/talentStore';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n';
import { SceneShell } from '@/components/ui/SceneShell';
import { Key, Rail, RailItem, TopBar } from '@/components/hl';
import {
  isMutatorTypingTarget,
  nextMutatorSelection,
  resolveMutatorHotkey,
} from '@/data/mutatorKeyboardNav';
import { MUTATOR_CHALLENGES } from '@/data/mutatorChallengeData';
import type { MutatorChallenge as MutatorChallengeType } from '@/types/mutatorChallenge';
import { resolveMutatorStartConfig } from '@/utils/mutatorStart';
import {
  MutatorGrid,
  MutatorDetailPanel,
  MutatorToolbar,
  MutatorHeaderStats,
  filterByTier,
  type MutatorTierFilter,
} from './mutator-challenge';

export default function MutatorChallenge() {
  const { t } = useTranslation();
  const records = useMutatorChallengeStore((s) => s.records);
  const totalCompleted = useMutatorChallengeStore((s) => s.totalCompleted);
  const claimReward = useMutatorChallengeStore((s) => s.claimReward);
  const addCoins = useShopStore((s) => s.addCoins);
  const addTalentPoints = useTalentStore((s) => s.addTalentPoints);
  const startGame = useGameStore((s) => s.startGame);

  const [tierFilter, setTierFilter] = useState<MutatorTierFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(MUTATOR_CHALLENGES[0]?.id ?? null);

  const filtered = useMemo(() => filterByTier(MUTATOR_CHALLENGES, tierFilter), [tierFilter]);

  const claimableCount = useMemo(
    () => Object.values(records).filter((r) => r.completed && !r.claimed).length,
    [records],
  );

  const selected = useMemo(
    () => MUTATOR_CHALLENGES.find((c) => c.id === selectedId) ?? null,
    [selectedId],
  );

  const tb = t.mutatorChallenge.toolbar;
  const tierOptions: { id: MutatorTierFilter; label: string; count: number }[] = useMemo(
    () => [
      { id: 'all', label: tb.filterAll, count: MUTATOR_CHALLENGES.length },
      { id: 'easy', label: tb.tierEasy, count: MUTATOR_CHALLENGES.filter((c) => c.tier === 'easy').length },
      { id: 'medium', label: tb.tierMedium, count: MUTATOR_CHALLENGES.filter((c) => c.tier === 'medium').length },
      { id: 'hard', label: tb.tierHard, count: MUTATOR_CHALLENGES.filter((c) => c.tier === 'hard').length },
      { id: 'extreme', label: tb.tierExtreme, count: MUTATOR_CHALLENGES.filter((c) => c.tier === 'extreme').length },
    ],
    [tb],
  );

  const handleTierChange = (tier: MutatorTierFilter) => {
    setTierFilter(tier);
    const next = filterByTier(MUTATOR_CHALLENGES, tier);
    if (selectedId && !next.some((c) => c.id === selectedId)) {
      setSelectedId(next[0]?.id ?? null);
    }
  };

  const handleStart = useCallback(
    (c: MutatorChallengeType) => {
      const start = resolveMutatorStartConfig(c);
      startGame(
        start.pathName,
        start.difficulty,
        start.endless,
        start.maxWaves,
        start.customModifiers,
        start.customWaveSetId,
        start.mutator,
      );
    },
    [startGame],
  );

  const handleClaim = (c: MutatorChallengeType) => {
    const success = claimReward(c.id);
    if (!success) return;
    if (c.rewards.coins) addCoins(c.rewards.coins);
    if (c.rewards.talentPoints) addTalentPoints(c.rewards.talentPoints);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const action = resolveMutatorHotkey({
        key: e.key,
        inTextField: isMutatorTypingTarget(e.target),
      });
      if (action === 'ignore') return;
      e.preventDefault();
      if (action === 'prev' || action === 'next') {
        const nextId = nextMutatorSelection(
          filtered.map((c) => c.id),
          selectedId,
          action === 'next' ? 1 : -1,
        );
        if (nextId) setSelectedId(nextId);
        return;
      }
      if (action === 'start' && selected) handleStart(selected);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [filtered, selectedId, selected, handleStart]);

  return (
    <SceneShell scrollable={false}>
      <div className="flex h-full w-full flex-col">
        <TopBar
          title={t.mutatorChallenge.title}
          meta={t.mutatorChallenge.subtitle}
          back={{ to: 'mainMenu' }}
          right={
            <MutatorHeaderStats completed={totalCompleted} total={MUTATOR_CHALLENGES.length} />
          }
        />

        <div className="flex min-h-0 flex-1">
          <Rail
            label="tier"
            foot={
              <div className="flex flex-col gap-1.5">
                <span className="flex items-center gap-1.5">
                  <Key>←</Key>
                  <Key>→</Key>
                  <span className="text-[10px] text-[var(--hl-ink-3)]">
                    {tb.switchChallenge}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Key>↵</Key>
                  <span className="text-[10px] text-[var(--hl-ink-3)]">
                    {tb.startChallenge}
                  </span>
                </span>
              </div>
            }
          >
            {tierOptions.map((option, i) => (
              <RailItem
                key={option.id}
                index={i + 1}
                label={option.label}
                active={tierFilter === option.id}
                onClick={() => handleTierChange(option.id)}
                right={
                  <span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-4)]">
                    {option.count}
                  </span>
                }
              />
            ))}
          </Rail>

          <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--hl-void)]">
            <MutatorToolbar
              tierFilter={tierFilter}
              completed={totalCompleted}
              total={MUTATOR_CHALLENGES.length}
              claimableCount={claimableCount}
            />

            <div className="flex min-h-0 flex-1">
              <div className="min-h-0 flex-1 overflow-y-auto">
                <MutatorGrid
                  challenges={filtered}
                  records={records}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              </div>

              <aside className="hidden w-[336px] shrink-0 border-l border-[var(--hl-line)] bg-[var(--hl-deck)] lg:flex lg:flex-col">
                <MutatorDetailPanel
                  challenge={selected}
                  record={selected ? records[selected.id] : undefined}
                  onStart={handleStart}
                  onClaim={handleClaim}
                />
              </aside>
            </div>
          </main>
        </div>
      </div>
    </SceneShell>
  );
}
