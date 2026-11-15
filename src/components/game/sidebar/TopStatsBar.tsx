import { useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTutorialStore } from '@/store/tutorialStore';
import { useTranslation } from '@/i18n';
import { SearchIcon, CrossIcon } from '@/components/ui/Icons';
import { BD_CELL, BD_CHECKER, BD_LABEL, BD_NUM, BD_SHEET, BD_SUNKEN } from '../hudBoard';

/**
 * 頂部狀態帶（棋盤語彙）
 *
 * 讀的是戰場格子的顏色：面板底＝空地格、格線＝道路接縫、強調＝路徑導引線。
 * 四格固定順序：生命 → 金錢 → 波次 → 分數；右端一顆放大鏡開詳細統計。
 */

type Tone = 'ink' | 'signal' | 'alarm' | 'caution' | 'muted';

/** 數值色階：深底上只有這五種語意，不要自己加色 */
const TONE_CLASS: Record<Tone, string> = {
  ink: 'text-[var(--bd-ink)]',
  signal: 'text-[var(--bd-accent)]',
  alarm: 'text-[var(--bd-alarm)]',
  caution: 'text-[var(--bd-caution)]',
  muted: 'text-[var(--bd-ink-2)]',
};

/** 狀態帶單格：標籤在上、數值在下，右側 1px 格線 */
function BandCell({
  label,
  value,
  tone = 'ink',
  hint,
  title,
  wide = false,
  className = '',
}: {
  label: string;
  value: ReactNode;
  tone?: Tone;
  hint?: string;
  title?: string;
  wide?: boolean;
  /** 窄版用：例如 'hidden sm:flex' 讓次要格在手機上退場 */
  className?: string;
}) {
  return (
    <div
      className={[
        'flex h-full flex-col justify-center gap-1 px-3',
        BD_CELL,
        wide ? 'min-w-[92px]' : 'min-w-[74px]',
        className,
      ].join(' ')}
      title={title}
    >
      <span className={`${BD_LABEL} truncate`}>{label}</span>
      <span className="flex items-baseline gap-1">
        <span className={`${BD_NUM} text-[13px] ${TONE_CLASS[tone]}`}>{value}</span>
        {hint && <span className="font-mono text-[9.5px] text-[var(--bd-ink-4)]">{hint}</span>}
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
        <BandCell label={t.game.health} value={health} tone={health <= 3 ? 'alarm' : 'ink'} title={t.game.health} />
        <BandCell label={t.game.money} value={Math.floor(money)} tone="signal" hint="$" title={t.game.money} />
        <BandCell label={t.game.wave} value={waveValue} tone={endlessMode ? 'caution' : 'ink'} title={t.game.wave} />
        <BandCell
          label={t.game.score}
          value={score}
          tone="muted"
          title={t.game.score}
          className="hidden min-w-[74px] sm:flex"
        />
        <button
          type="button"
          aria-label={t.game.zoomDetailInfo}
          className={[
            'flex h-full w-9 shrink-0 items-center justify-center rounded-none transition-colors duration-100',
            tutorialActive
              ? 'cursor-not-allowed text-[var(--bd-ink-4)]'
              : 'text-[var(--bd-ink-3)] hover:bg-[var(--bd-tile-2)] hover:text-[var(--bd-ink)]',
          ].join(' ')}
          onClick={() => !tutorialActive && setShowStatsDialog(true)}
          disabled={tutorialActive}
        >
          <SearchIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      {showStatsDialog && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(8,6,15,0.86)] p-4"
          onClick={() => setShowStatsDialog(false)}
        >
          <motion.div
            className="w-full max-w-[460px]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`${BD_SHEET} flex max-h-[86vh] flex-col overflow-hidden`}>
              <header className={`flex items-start gap-3 border-b border-[var(--bd-line)] px-4 py-3 ${BD_CHECKER}`}>
                <div className="min-w-0 flex-1">
                  <div className={BD_LABEL}>theater / stats</div>
                  <h2 className="mt-1 text-[17px] font-semibold leading-tight text-[var(--bd-ink)]">
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
                <dl className="grid grid-cols-2 gap-px bg-[var(--bd-line)]">
                  {[
                    { label: t.game.money, value: `$${Math.floor(money)}`, tone: 'signal' as Tone },
                    { label: t.game.health, value: String(health), tone: (health <= 3 ? 'alarm' : 'ink') as Tone },
                    { label: endlessMode ? t.pathSelection.endlessMode : t.game.wave, value: String(waveValue), tone: 'ink' as Tone },
                    { label: t.game.score, value: String(score), tone: 'ink' as Tone },
                  ].map((cell) => (
                    <div key={cell.label} className="bg-[var(--bd-tile)] px-3 py-2.5">
                      <dt className={BD_LABEL}>{cell.label}</dt>
                      <dd className={`mt-1.5 ${BD_NUM} text-[16px] ${TONE_CLASS[cell.tone]}`}>{cell.value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-4">
                  <div className={BD_LABEL}>{t.game.detailedStats}</div>
                  <div className={`mt-2 ${BD_SUNKEN} px-3 py-1.5`}>
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
                        className="flex items-baseline justify-between gap-4 border-b border-[var(--bd-line)] py-1.5 last:border-b-0"
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
                    <div className={`mt-2 ${BD_SUNKEN} px-3 py-1.5`}>
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
                          className="flex items-baseline justify-between gap-4 border-b border-[var(--bd-line)] py-1.5 last:border-b-0"
                        >
                          <span className={BD_LABEL}>{row.k}</span>
                          <span className={`${BD_NUM} text-[12px]`}>{row.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <footer className="border-t border-[var(--bd-line)] p-3">
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
        </div>,
        document.body,
      )}
    </>
  );
};
