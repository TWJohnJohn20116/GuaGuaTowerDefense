import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTutorialStore } from '@/store/tutorialStore';
import { useTranslation } from '@/i18n';
import { SearchIcon, CrossIcon } from '@/components/ui/Icons';
import { BD_LABEL, BD_NUM, BD_SHEET } from '../hudBoard';
import { FADE_FAST, FADE_OUT, SPRING_SOFT } from '@/utils/motionTokens';

/**
 * 戰況簇（無卡片）
 *
 * 四個數值排成一簇直接壓在戰場左上：數值 22px 黑體等寬、標籤 9px 大寫，
 * 一眼先讀數字、再看標籤。不用白卡、不用格線，只靠字階與間距分組。
 * 右端一顆放大鏡開詳細統計（彈窗才有紙卡底）。
 */

type Tone = 'ink' | 'signal' | 'alarm' | 'caution' | 'muted';

const TONE_CLASS: Record<Tone, string> = {
  ink: 'text-[var(--cn-ink)]',
  signal: 'text-[var(--cn-accent-text)]',
  alarm: 'text-[var(--cn-alarm-text)]',
  caution: 'text-[var(--cn-caution-text)]',
  muted: 'text-[var(--cn-ink-2)]',
};

function Stat({
  label,
  value,
  tone = 'ink',
  hint,
  title,
  animate = false,
}: {
  label: string;
  value: string | number;
  tone?: Tone;
  hint?: string;
  title?: string;
  /** 值變化時做一次上浮淡入（金幣每幀都變，不要開） */
  animate?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1" title={title}>
      <span className={`${BD_LABEL} whitespace-nowrap`}>{label}</span>
      <span className={`hud-ink flex items-baseline gap-0.5 font-mono text-[22px] font-black leading-none tabular-nums ${TONE_CLASS[tone]}`}>
        {animate ? (
          <motion.span
            key={String(value)}
            initial={{ y: 6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={FADE_FAST}
            className="inline-block"
          >
            {value}
          </motion.span>
        ) : value}
        {hint && <span className="text-[11px] font-bold text-[var(--cn-ink-3)]">{hint}</span>}
      </span>
    </div>
  );
}

export const TopStatsBar = () => {
  const { t } = useTranslation();
  // 金幣每幀都可能變；取整後才訂閱，避免整個戰況簇每幀重渲染
  const money = useGameStore((s) => Math.floor(s.money));
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
      <div id="tutorial-target-top-stats" className="flex items-end gap-5">
        <Stat label={t.game.health} value={health} tone={health <= 3 ? 'alarm' : 'ink'} title={t.game.health} animate />
        <Stat label={t.game.money} value={money} tone="signal" hint="$" title={t.game.money} />
        <Stat label={t.game.wave} value={waveValue} tone={endlessMode ? 'caution' : 'ink'} title={t.game.wave} animate />
        <Stat label={t.game.score} value={score} tone="muted" title={t.game.score} animate />
        <button
          type="button"
          aria-label={t.game.zoomDetailInfo}
          onClick={() => !tutorialActive && setShowStatsDialog(true)}
          disabled={tutorialActive}
          className="mb-0.5 flex h-6 w-6 items-center justify-center rounded-full text-[var(--cn-ink-3)] transition-colors duration-100 hover:bg-[color-mix(in_oklab,var(--cn-line)_16%,transparent)] hover:text-[var(--cn-ink)] disabled:opacity-40"
        >
          <SearchIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      {createPortal(
        <AnimatePresence>
          {showStatsDialog && (
            <motion.div
              key="stats-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: FADE_OUT }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(46,36,64,0.55)] p-4"
              onClick={() => setShowStatsDialog(false)}
            >
              <motion.div
                className="w-full max-w-[560px]"
                initial={{ opacity: 0, y: 14, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.97, transition: FADE_OUT }}
                transition={SPRING_SOFT}
                onClick={(e) => e.stopPropagation()}
              >
            <div className={`${BD_SHEET} flex max-h-[86vh] flex-col overflow-hidden`}>
              <header className="flex items-start gap-3 border-b-[3px] border-[var(--cn-line-soft)] px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className={BD_LABEL}>theater / stats</div>
                  <h2 className="mt-1 text-[17px] font-extrabold leading-tight text-[var(--cn-ink)]">
                    {t.game.statsOverview}
                  </h2>
                </div>
                <button
                  type="button"
                  aria-label={t.common.close}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[3px] border-[var(--cn-line)] text-[var(--cn-ink-3)] transition-colors hover:bg-[var(--cn-card-2)] hover:text-[var(--cn-ink)]"
                  onClick={() => setShowStatsDialog(false)}
                >
                  <CrossIcon className="h-3.5 w-3.5" />
                </button>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
                <dl className="grid grid-cols-2 gap-2">
                  {[
                    { label: t.game.money, value: `$${Math.floor(money)}`, tone: 'signal' as Tone },
                    { label: t.game.health, value: String(health), tone: (health <= 3 ? 'alarm' : 'ink') as Tone },
                    { label: endlessMode ? t.pathSelection.endlessMode : t.game.wave, value: String(waveValue), tone: 'ink' as Tone },
                    { label: t.game.score, value: String(score), tone: 'ink' as Tone },
                  ].map((cell) => (
                    <div key={cell.label} className="rounded-[var(--cn-r-sm)] bg-[var(--cn-card-2)] px-3 py-2.5">
                      <dt className={BD_LABEL}>{cell.label}</dt>
                      <dd className={`mt-1.5 font-mono text-[16px] font-black tabular-nums ${TONE_CLASS[cell.tone]}`}>{cell.value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-4">
                  <div className={BD_LABEL}>{t.game.detailedStats}</div>
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
                        className="flex items-baseline justify-between gap-4 border-b border-[var(--cn-line-soft)] py-1.5 last:border-b-0"
                      >
                        <span className={BD_LABEL}>{row.k}</span>
                        <span className={`${BD_NUM} text-[12px]`}>{row.v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {autoBattleEnabled && (
                  <div className="mt-4">
                    <div className={BD_LABEL}>{t.game.aiStatsTitle}</div>
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
                          className="flex items-baseline justify-between gap-4 border-b border-[var(--cn-line-soft)] py-1.5 last:border-b-0"
                        >
                          <span className={BD_LABEL}>{row.k}</span>
                          <span className={`${BD_NUM} text-[12px]`}>{row.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <footer className="border-t-[3px] border-[var(--cn-line-soft)] p-3">
                <button
                  type="button"
                  className="w-full rounded-[var(--cn-r-sm)] border-[3px] border-[var(--cn-line)] bg-[var(--cn-cta)] px-3 py-2 font-mono text-[11px] font-extrabold uppercase tracking-[0.08em] text-[var(--cn-on-cta)] shadow-[0_4px_0_var(--cn-line)] transition-[transform,box-shadow] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none"
                  onClick={() => setShowStatsDialog(false)}
                >
                  {t.common.close}
                </button>
              </footer>
            </div>
          </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
};
