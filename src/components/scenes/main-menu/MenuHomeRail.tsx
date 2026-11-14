import { version as APP_VERSION } from '../../../../package.json';
import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useShopStore } from '@/store/shopStore';
import { useTalentStore } from '@/store/talentStore';
import { useAchievementStore } from '@/store/achievementStore';
import { getCatalogAchievements } from '@/store/achievementStoreCheck';
import { useStatsStore } from '@/store/statsStore';
import { useTranslation } from '@/i18n';
import { Btn, Dot } from '@/components/hl';

/**
 * 主選單 · 招牌欄
 *
 * 構圖：識別 → 四格計量 → 待辦 → 主行動釘底。
 * 這欄只有一處大面積訊號色：開始遊戲。
 */
export function MenuHomeRail() {
  const { t } = useTranslation();
  const setScene = useGameStore((s) => s.setScene);
  const coins = useShopStore((s) => s.coins);
  const talentPoints = useTalentStore((s) => s.talentPoints);
  const playerAchievements = useAchievementStore((s) => s.playerAchievements);

  const globalStats = useStatsStore((s) => s.globalStats);
  const personalBests = useStatsStore((s) => s.personalBests);

  const catalog = useMemo(() => getCatalogAchievements(), []);
  const catalogIds = useMemo(() => new Set(catalog.map((a) => a.id)), [catalog]);

  const claimable = useMemo(
    () =>
      Object.values(playerAchievements).filter(
        (a) => catalogIds.has(a.id) && a.status === 'completed',
      ).length,
    [playerAchievements, catalogIds],
  );
  const unlocked = useMemo(
    () =>
      Object.values(playerAchievements).filter(
        (a) => catalogIds.has(a.id) && (a.status === 'completed' || a.status === 'claimed'),
      ).length,
    [playerAchievements, catalogIds],
  );

  return (
    <aside className="relative m-3 flex w-auto shrink-0 flex-col overflow-hidden rounded-[var(--cn-r-lg)] border-[3px] border-[var(--cn-line)] bg-[var(--cn-card)] shadow-[0_5px_0_-1px_rgba(46,36,64,0.18)] lg:mb-3 lg:ml-3 lg:mt-3 lg:w-[400px]">
      {/* 底紋：右緣刻度 */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-[3px]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, var(--arc-line) 0 1px, transparent 1px 14px)',
        }}
      />

      <div className="relative flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 pb-4 pt-6">
        {/* 識別 */}
        <div className="flex flex-col gap-3.5">
          <div className="flex items-center gap-2">
            <Dot tone="signal" pulse />
            <span className="arc-label">operations</span>
            <span className="h-px flex-1 bg-[var(--arc-line)]" />
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--arc-ink-4)]">
              tower defense
            </span>
          </div>

          <h1 className="text-[52px] font-bold leading-[0.9] tracking-[-0.04em] text-[var(--arc-ink)]">
            {t.mainMenu.title}
          </h1>

          <p className="max-w-[32ch] text-[11.5px] leading-relaxed text-[var(--arc-ink-3)]">
            {t.mainMenu.subtitle}
          </p>
        </div>

        {/* 四格計量 */}
        <div className="grid grid-cols-2 gap-2 border-t-[3px] border-[var(--cn-line-soft)] pt-4">
          <MetricCell label={t.mainMenu.coinsUnit} value={coins.toLocaleString()} tone="signal" />
          <MetricCell label={t.mainMenu.talentTree} value={talentPoints} unit={t.mainMenu.points} />
          <MetricCell
            label={t.mainMenu.achievements}
            value={`${unlocked}/${catalog.length}`}
            tone="ink"
          />
        </div>

        {/* 本機戰績：章節資料移除後填補中段，資料取自 statsStore */}
        <div className="flex flex-col gap-3 border-t-[3px] border-[var(--cn-line-soft)] pt-4">
          <span className="arc-label">{t.mainMenu.localRecordTitle}</span>
          <div className="grid grid-cols-3 gap-2">
            <MetricCell label={t.mainMenu.localGames} value={globalStats.totalGamesPlayed} />
            <MetricCell
              label={t.mainMenu.localWinRate}
              value={`${Math.round(globalStats.winRate * 100)}%`}
            />
            <MetricCell label={t.mainMenu.localBestWave} value={personalBests.highestWave} />
          </div>
        </div>

        {/* 待辦（短螢幕時優先可見，快捷鍵其次） */}
        <div className="flex flex-col gap-1 border-t-[3px] border-[var(--cn-line-soft)] pt-2">
          {claimable > 0 && (
            <AlertRow
              tone="signal"
              text={`${t.mainMenu.alertChips.claimable} ${t.mainMenu.alertChips.claimableUnit.replace('{count}', String(claimable))}`}
              onClick={() => setScene('achievements')}
            />
          )}
          {claimable === 0 && (
            <div className="flex items-center gap-2 py-2">
              <Dot tone="vital" />
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--arc-vital)]">
                all clear
              </span>
            </div>
          )}
        </div>

        {/* 快捷鍵 */}
        <div className="mt-auto flex flex-col gap-1.5 pt-2 [@media(max-height:820px)]:hidden">
          <span className="arc-label">shortcuts</span>
          <HintRow k="ENTER" v={t.mainMenu.startGame} />
          <HintRow k="↑ ↓" v="select module" />
          <HintRow k="ESC" v="back" />
        </div>
      </div>

      {/* 主行動 */}
      <div className="relative flex flex-col gap-2 border-t-[3px] border-[var(--cn-line-soft)] px-6 py-4">
        <Btn variant="signal" size="lg" block onClick={() => setScene('pathSelection')}>
          {t.mainMenu.startGame}
        </Btn>
        <Btn variant="line" size="md" block onClick={() => setScene('pathSelection')}>
          {t.game.selectMap}
        </Btn>
        <div className="mt-1 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--arc-ink-4)]">
          <span>{`build ${APP_VERSION}`}</span>
          <span>local save</span>
        </div>
      </div>
    </aside>
  );
}

function HintRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-2 py-0.5">
      <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-[var(--arc-ink-4)]">
        {v}
      </span>
      <span className="rounded-full border-2 border-[var(--cn-line-soft)] bg-[var(--cn-card-2)] px-2 py-[1px] font-mono text-[10px] font-extrabold text-[var(--cn-ink-2)]">
        {k}
      </span>
    </div>
  );
}

function MetricCell({
  label,
  value,
  unit,
  tone = 'ink',
}: {
  label: string;
  value: string | number;
  unit?: string;
  tone?: 'ink' | 'signal' | 'caution' | 'vital';
}) {
  const color =
    tone === 'signal'
      ? 'text-[var(--arc-gold)]'
      : tone === 'caution'
        ? 'text-[var(--arc-caution)]'
        : tone === 'vital'
          ? 'text-[var(--arc-vital)]'
          : 'text-[var(--arc-ink)]';
  return (
    <div className="flex flex-col gap-1 rounded-[14px] border-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card-2)] px-3 py-2.5">
      <span className="truncate font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--arc-ink-4)]">
        {label}
      </span>
      <span className={`font-mono text-[15px] font-semibold leading-none tabular-nums arc-num ${color}`}>
        {value}
        {unit && <span className="ml-0.5 text-[9px] font-normal text-[var(--arc-ink-4)]">{unit}</span>}
      </span>
    </div>
  );
}

function AlertRow({
  tone,
  text,
  onClick,
}: {
  tone: 'signal' | 'vital' | 'caution';
  text: string;
  onClick: () => void;
}) {
  const color =
    tone === 'signal'
      ? 'text-[var(--arc-gold)]'
      : tone === 'vital'
        ? 'text-[var(--arc-vital)]'
        : 'text-[var(--arc-caution)]';
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-2.5 rounded-[14px] px-2 py-2 text-left transition-colors duration-150 hover:bg-[var(--cn-card-2)]"
    >
      <Dot tone={tone} />
      <span className={`min-w-0 flex-1 truncate text-[11.5px] ${color}`}>{text}</span>
      <span className="font-mono text-[10px] text-[var(--arc-ink-4)] transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-[var(--arc-ink-2)]">
        →
      </span>
    </button>
  );
}
