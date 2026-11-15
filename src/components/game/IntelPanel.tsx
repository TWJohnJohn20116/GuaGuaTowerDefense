import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n';
import { useGetTowerData } from './hooks';
import { BD_LABEL, BD_NUM, BD_SUNKEN } from './hudBoard';

/**
 * 右側戰場資訊欄（棋盤語彙）
 *
 * 只放「一看就知道現在該做什麼」的態勢資料：
 *   波次進度 → 在場單位 → 選中單位 → 自動戰鬥。詳細統計仍在頂帶的放大鏡裡。
 */
export function IntelPanel() {
  const { t } = useTranslation();
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

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center justify-between gap-2 border-b border-[var(--bd-line)] px-2.5 py-2">
        <span className={BD_LABEL}>{t.game.fieldIntel}</span>
        <span
          className={`${BD_LABEL} ${waveActive ? 'text-[var(--bd-caution)]' : 'text-[var(--bd-ink-4)]'}`}
        >
          {waveActive ? t.game.combatActive : t.game.standby}
        </span>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* 波次進度 */}
        <div className="border-b border-[var(--bd-line)] px-2.5 py-2.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className={BD_LABEL}>{t.game.wave}</span>
            <span className={`${BD_NUM} text-[15px]`}>
              {currentWave}
              {maxWaves > 0 && !endlessMode ? (
                <span className="text-[var(--bd-ink-3)]">/{maxWaves}</span>
              ) : null}
            </span>
          </div>
          <div className={`mt-2 h-1.5 w-full overflow-hidden ${BD_SUNKEN}`}>
            <span
              className="block h-full bg-[var(--bd-accent)] transition-[width] duration-300 ease-out"
              style={{ width: `${waveRatio * 100}%` }}
            />
          </div>
        </div>

        {/* 在場單位 */}
        <div className="grid grid-cols-2 gap-px border-b border-[var(--bd-line)] bg-[var(--bd-line)]">
          <div className="bg-[var(--bd-tile)] px-2.5 py-2">
            <div className={`${BD_LABEL} truncate`}>{t.game.onFieldEnemiesLabel}</div>
            <div className="mt-1 font-mono text-[16px] font-semibold tabular-nums leading-none text-[var(--bd-alarm)]">
              {enemyCount}
            </div>
          </div>
          <div className="bg-[var(--bd-tile)] px-2.5 py-2">
            <div className={`${BD_LABEL} truncate`}>{t.game.onFieldTowersLabel}</div>
            <div className="mt-1 font-mono text-[16px] font-semibold tabular-nums leading-none text-[var(--bd-ink)]">
              {towerCount}
            </div>
          </div>
        </div>

        {/* 選中單位 */}
        <div className="border-b border-[var(--bd-line)] px-2.5 py-2.5">
          <div className={`${BD_LABEL} mb-1.5`}>{t.game.selectedTowerInfo}</div>
          {selectedTower && selectedName ? (
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-[11.5px] font-medium text-[var(--bd-ink)]">{selectedName}</span>
              <span className={`${BD_NUM} text-[11px] text-[var(--bd-ink-2)]`}>Lv.{selectedTower.level}</span>
            </div>
          ) : (
            <p className="text-[10.5px] leading-snug text-[var(--bd-ink-4)]">{t.game.selectTowerHint}</p>
          )}
        </div>

        {/* 自動戰鬥 */}
        {autoBattleEnabled && (
          <div className="border-b border-[var(--bd-line)] px-2.5 py-2.5">
            <div className={`${BD_LABEL} mb-1.5`}>{t.game.aiAutoBattle}</div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-[var(--bd-ink-2)]">
                {autoBattleStrategy === 'balanced'
                  ? t.game.balanced
                  : autoBattleStrategy === 'economy'
                    ? t.game.economy
                    : autoBattleStrategy === 'aggressive'
                      ? t.game.aggressive
                      : t.game.defensive}
              </span>
              <span className={`${BD_NUM} text-[11px] text-[var(--bd-vital)]`}>{t.game.combatActive}</span>
            </div>
          </div>
        )}

        {/* 分數 */}
        <div className="px-2.5 py-2.5">
          <div className={BD_LABEL}>{t.game.score}</div>
          <div className={`mt-1 ${BD_NUM} text-[18px]`}>{score}</div>
        </div>
      </div>
    </div>
  );
}
