import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n';
import { useGetTowerData } from './hooks';
import { BD_LABEL, BD_NUM, BD_SHEET } from './hudBoard';
import { AIStatusHeader } from './sidebar/AIStatusHeader';

/**
 * 戰場情報（預設收起）
 *
 * 平時只佔一顆豎排小標籤，點開才是紙卡浮層 —— 右側不再躺著一大片空白。
 * 內容：波次進度、在場單位、選中單位、自動戰鬥、分數。
 */
export function IntelPanel() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const getTowerData = useGetTowerData();
  const currentWave = useGameStore((s) => s.currentWave);
  const maxWaves = useGameStore((s) => s.maxWaves);
  const endlessMode = useGameStore((s) => s.endlessMode);
  const waveActive = useGameStore((s) => s.waveActive);
  const enemyCount = useGameStore((s) => s.enemies.length);
  const towerCount = useGameStore((s) => s.towers.length);
  const score = useGameStore((s) => s.score);
  const selectedTower = useGameStore((s) => s.selectedTower);
  const autoBattleEnabled = useGameStore((s) => s.autoBattleEnabled);
  const autoBattleStrategy = useGameStore((s) => s.autoBattleStrategy);

  const waveRatio = !endlessMode && maxWaves > 0 ? Math.min(1, currentWave / maxWaves) : 0;
  const selectedName = selectedTower ? getTowerData(selectedTower.type)?.name ?? selectedTower.type : null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="pointer-events-auto flex h-24 w-8 flex-col items-center justify-center gap-1.5 rounded-[var(--cn-r-sm)] border-[3px] border-[var(--cn-line)] bg-[var(--cn-card)] text-[var(--cn-ink-2)] shadow-[0_4px_0_var(--cn-line)] transition-[transform,box-shadow] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none"
        aria-label={t.game.fieldIntel}
      >
        <span
          className="font-mono text-[9px] font-extrabold uppercase tracking-[0.22em]"
          style={{ writingMode: 'vertical-rl' }}
        >
          {t.game.fieldIntel}
        </span>
        {enemyCount > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--cn-alert)] px-1 font-mono text-[9px] font-extrabold text-white">
            {enemyCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className={`${BD_SHEET} flex max-h-[70vh] w-[236px] flex-col overflow-hidden`}>
      <header className="flex items-center justify-between gap-2 border-b-[3px] border-[var(--cn-line-soft)] px-3 py-2">
        <span className={BD_LABEL}>{t.game.fieldIntel}</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={t.common.close}
          className="flex h-6 w-6 items-center justify-center rounded-full border-[2px] border-[var(--cn-line)] text-[var(--cn-ink-3)] transition-colors hover:bg-[var(--cn-card-2)] hover:text-[var(--cn-ink)]"
        >
          <span className="text-[11px] font-extrabold leading-none">×</span>
        </button>
      </header>

      <AIStatusHeader />

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className={BD_LABEL}>{t.game.wave}</span>
          <span className={`${BD_NUM} text-[15px]`}>
            {currentWave}
            {maxWaves > 0 && !endlessMode ? <span className="text-[var(--cn-ink-3)]">/{maxWaves}</span> : null}
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--cn-card-2)]">
          <span
            className="block h-full rounded-full bg-[var(--cn-accent-text)] transition-[width] duration-300 ease-out"
            style={{ width: `${waveRatio * 100}%` }}
          />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 border-y border-[var(--cn-line-soft)] py-2.5">
          <div>
            <div className={`${BD_LABEL} truncate`}>{t.game.onFieldEnemiesLabel}</div>
            <div className="mt-1 font-mono text-[16px] font-black tabular-nums leading-none text-[var(--cn-alarm-text)]">
              {enemyCount}
            </div>
          </div>
          <div>
            <div className={`${BD_LABEL} truncate`}>{t.game.onFieldTowersLabel}</div>
            <div className="mt-1 font-mono text-[16px] font-black tabular-nums leading-none text-[var(--cn-ink)]">
              {towerCount}
            </div>
          </div>
        </div>

        <div className="border-b border-[var(--cn-line-soft)] py-2.5">
          <div className={`${BD_LABEL} mb-1.5`}>{t.game.selectedTowerInfo}</div>
          {selectedTower && selectedName ? (
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-[11.5px] font-bold text-[var(--cn-ink)]">{selectedName}</span>
              <span className={`${BD_NUM} text-[11px] text-[var(--cn-ink-2)]`}>Lv.{selectedTower.level}</span>
            </div>
          ) : (
            <p className="text-[10.5px] leading-snug text-[var(--cn-ink-4)]">{t.game.selectTowerHint}</p>
          )}
        </div>

        {autoBattleEnabled && (
          <div className="border-b border-[var(--cn-line-soft)] py-2.5">
            <div className={`${BD_LABEL} mb-1.5`}>{t.game.aiAutoBattle}</div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-[var(--cn-ink-2)]">
                {autoBattleStrategy === 'balanced'
                  ? t.game.balanced
                  : autoBattleStrategy === 'economy'
                    ? t.game.economy
                    : autoBattleStrategy === 'aggressive'
                      ? t.game.aggressive
                      : t.game.defensive}
              </span>
              <span className={`${BD_NUM} text-[11px] text-[var(--cn-vital-text)]`}>{waveActive ? t.game.combatActive : t.game.standby}</span>
            </div>
          </div>
        )}

        <div className="pt-2.5">
          <div className={BD_LABEL}>{t.game.score}</div>
          <div className={`mt-1 ${BD_NUM} text-[18px]`}>{score}</div>
        </div>
      </div>
    </div>
  );
}
