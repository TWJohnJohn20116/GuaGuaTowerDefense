import { useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTutorialStore } from '@/store/tutorialStore';
import { useTranslation } from '@/i18n';
import { SearchIcon, CrossIcon } from '@/components/ui/Icons';
import { Btn, Deck, IconBtn, Num, SegHead } from '@/components/hl';

/** 儀表帶單格：mono 標籤 + mono 數值，右側 1px 分隔線 */
function BandCell({
  label,
  value,
  tone = 'ink',
  hint,
  title,
  wide = false,
}: {
  label: string;
  value: ReactNode;
  tone?: 'ink' | 'signal' | 'alarm' | 'caution' | 'muted';
  hint?: string;
  title?: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`flex h-full flex-col justify-center gap-1 border-r border-[var(--arc-line)] px-3 ${wide ? 'min-w-[92px]' : 'min-w-[74px]'}`}
      title={title}
    >
      <span className="arc-label truncate">{label}</span>
      <span className="flex items-baseline gap-1">
        <Num value={value} tone={tone} size="sm" />
        {hint && <span className="font-mono text-[9.5px] text-[var(--arc-ink-4)]">{hint}</span>}
      </span>
    </div>
  );
}

export const TopStatsBar = () => {
  const { t } = useTranslation();
  const money = useGameStore((s) => s.money);
  const health = useGameStore((s) => s.health);
  const score = useGameStore((s) => s.score);
  const currentWave = useGameStore((s) => s.currentWave);
  const maxWaves = useGameStore((s) => s.maxWaves);
  const endlessMode = useGameStore((s) => s.endlessMode);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const placementStats = useGameStore((s) => s.placementStats);
  const upgradeStats = useGameStore((s) => s.upgradeStats);
  const towerCount = useGameStore((s) => s.towers.length);
  const enemyCount = useGameStore((s) => s.enemies.length);
  const autoBattleEnabled = useGameStore((s) => s.autoBattleEnabled);
  const autoBattleStats = useGameStore((s) => s.autoBattleStats);
  const autoBattleStrategy = useGameStore((s) => s.autoBattleStrategy);
  const tutorialActive = useTutorialStore((s) => s.isActive);

  const waveValue = endlessMode ? currentWave : maxWaves > 0 ? `${currentWave}/${maxWaves}` : currentWave;

  return (
    <>
      <div
        id="tutorial-target-top-stats"
        className="flex h-full min-w-0 items-stretch overflow-hidden"
      >
        <BandCell
          label={t.game.health}
          value={health}
          tone={health <= 3 ? 'alarm' : 'ink'}
          title={t.game.health}
        />
        <BandCell
          label={t.game.money}
          value={Math.floor(money)}
          tone="signal"
          hint="$"
          title={t.game.money}
        />
        <BandCell
          label={t.game.wave}
          value={waveValue}
          tone={endlessMode ? 'caution' : 'ink'}
          title={t.game.wave}
        />
        <BandCell
          label={t.game.score}
          value={score}
          tone="muted"
          title={t.game.score}
        />
        <IconBtn
          label={t.game.zoomDetailInfo}
          className={`flex h-full w-9 shrink-0 items-center justify-center rounded-sm border-r border-[var(--arc-line)] px-0 ${
            tutorialActive
              ? 'cursor-not-allowed text-[var(--arc-ink-4)]'
              : 'text-[var(--arc-ink-3)] hover:text-[var(--arc-ink)]'
          }`}
          onClick={() => !tutorialActive && setShowStatsDialog(true)}
          disabled={tutorialActive}
        >
          <SearchIcon className="h-3.5 w-3.5" />
        </IconBtn>
      </div>

      {showStatsDialog && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(6,10,20,0.86)] p-4"
          onClick={() => setShowStatsDialog(false)}
        >
          <motion.div
            className="w-full max-w-[460px]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Deck notch className="flex max-h-[86vh] flex-col overflow-hidden">
              <header className="flex items-start gap-3 border-b border-[var(--arc-line)] px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="arc-label">theater / stats</div>
                  <h2 className="arc-title mt-1 text-[17px] font-semibold leading-tight text-[var(--arc-ink)]">
                    {t.game.statsOverview}
                  </h2>
                </div>
                <IconBtn
                  label={t.common.close}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm px-0 text-[var(--arc-ink-3)] hover:text-[var(--arc-ink)]"
                  onClick={() => setShowStatsDialog(false)}
                >
                  <CrossIcon className="h-3.5 w-3.5" />
                </IconBtn>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
                <dl className="grid grid-cols-2 gap-px bg-[var(--arc-line)]">
                  {[
                    { label: t.game.money, value: `$${Math.floor(money)}`, tone: 'signal' as const },
                    { label: t.game.health, value: health, tone: health <= 3 ? ('alarm' as const) : ('ink' as const) },
                    { label: endlessMode ? t.pathSelection.endlessMode : t.game.wave, value: waveValue, tone: 'ink' as const },
                    { label: t.game.score, value: score, tone: 'ink' as const },
                  ].map((cell) => (
                    <div key={cell.label} className="bg-[var(--arc-deck)] px-3 py-2.5">
                      <dt className="arc-label">{cell.label}</dt>
                      <dd className="mt-1.5">
                        <Num value={cell.value} tone={cell.tone} size="md" />
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-4">
                  <SegHead label={t.game.detailedStats} />
                  <div className="mt-2">
                    {[
                      { k: t.game.towersPlacedLabel, v: `${placementStats.totalPlaced} ${t.game.unitTower}` },
                      { k: t.game.towersSoldLabel, v: `${placementStats.totalSold} ${t.game.unitTower}` },
                      { k: t.game.buildCostLabel, v: `$${placementStats.totalSpent}` },
                      { k: t.game.upgradeCountLabel, v: `${upgradeStats.totalUpgrades} ${t.game.unitTimes}` },
                      { k: t.game.upgradeCostLabel, v: `$${upgradeStats.totalSpent}` },
                      { k: t.game.maxLevelLabel, v: `Lv.${upgradeStats.maxLevelReached}` },
                      { k: t.game.onFieldTowersLabel, v: `${towerCount} ${t.game.unitTower}` },
                      { k: t.game.onFieldEnemiesLabel, v: `${enemyCount} ${t.game.unitEnemy}` },
                    ].map((row) => (
                      <div
                        key={row.k}
                        className="flex items-baseline justify-between gap-4 border-b border-[var(--arc-line)] py-1.5 last:border-b-0"
                      >
                        <span className="arc-label">{row.k}</span>
                        <Num value={row.v} size="sm" />
                      </div>
                    ))}
                  </div>
                </div>

                {autoBattleEnabled && (
                  <div className="mt-4">
                    <SegHead label={t.game.aiStatsTitle} />
                    <div className="mt-2">
                      {[
                        { k: t.game.aiPlacedLabel, v: `${autoBattleStats.towersPlaced} ${t.game.unitTower}` },
                        { k: t.game.aiSpentLabel, v: `$${autoBattleStats.moneySpent}` },
                        { k: t.game.aiDecisionsLabel, v: `${autoBattleStats.decisionsCount} ${t.game.unitTimes}` },
                        {
                          k: t.game.aiModeLabel,
                          v: autoBattleStrategy === 'balanced'
                            ? t.game.balanced
                            : autoBattleStrategy === 'economy'
                              ? t.game.economy
                              : autoBattleStrategy === 'aggressive'
                                ? t.game.aggressive
                                : t.game.defensive,
                        },
                      ].map((row) => (
                        <div
                          key={row.k}
                          className="flex items-baseline justify-between gap-4 border-b border-[var(--arc-line)] py-1.5 last:border-b-0"
                        >
                          <span className="arc-label">{row.k}</span>
                          <Num value={row.v} size="sm" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <footer className="border-t border-[var(--arc-line)] p-3">
                <Btn variant="line" block onClick={() => setShowStatsDialog(false)}>
                  {t.common.close}
                </Btn>
              </footer>
            </Deck>
          </motion.div>
        </div>,
        document.body,
      )}
    </>
  );
};
