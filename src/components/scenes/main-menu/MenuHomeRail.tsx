import { version as APP_VERSION } from '../../../../package.json';
import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useCampaignStore } from '@/store/campaignStore';
import { useShopStore } from '@/store/shopStore';
import { useTalentStore } from '@/store/talentStore';
import { useAchievementStore } from '@/store/achievementStore';
import { useDailyChallengeStore } from '@/store/dailyChallengeStore';
import { getCatalogAchievements } from '@/store/achievementStoreCheck';
import { useTranslation } from '@/i18n';
import { Btn, Dot, Segments } from '@/components/hl';

/**
 * 主選單 · 招牌欄
 *
 * 構圖：識別 → 章節 → 四格計量 → 待辦 → 主行動釘底。
 * 這欄只有一處大面積訊號色：開始遊戲。
 */
export function MenuHomeRail() {
  const { t } = useTranslation();
  const setScene = useGameStore((s) => s.setScene);
  const currentChapter = useCampaignStore((s) => s.currentChapter);
  const levelStars = useCampaignStore((s) => s.levelStars);
  const coins = useShopStore((s) => s.coins);
  const talentPoints = useTalentStore((s) => s.talentPoints);
  const playerAchievements = useAchievementStore((s) => s.playerAchievements);
  const todayChallenge = useDailyChallengeStore((s) => s.todayChallenge);
  const currentStreak = useDailyChallengeStore((s) => s.currentStreak);

  const catalog = useMemo(() => getCatalogAchievements(), []);
  const catalogIds = useMemo(() => new Set(catalog.map((a) => a.id)), [catalog]);

  const totalStars = useMemo(
    () => Object.values(levelStars).reduce((sum, s) => sum + s, 0),
    [levelStars],
  );
  const clearedLevels = useMemo(() => Object.keys(levelStars).length, [levelStars]);
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

  const dailyDone = !!todayChallenge?.completed;
  const dailyReward = dailyDone && !todayChallenge?.claimed;
  const chapterLabel = String(currentChapter).padStart(2, '0');

  return (
    <aside className="relative flex w-full shrink-0 flex-col overflow-hidden border-b border-[var(--hl-line)] lg:w-[420px] lg:border-b-0 lg:border-r">
      {/* 底紋：章節數字 */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-4 top-[88px] select-none font-mono text-[240px] font-bold leading-none tracking-tighter text-[var(--hl-ink)] opacity-[0.03]"
      >
        {chapterLabel}
      </span>
      {/* 底紋：右緣刻度 */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-[3px]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, var(--hl-line) 0 1px, transparent 1px 14px)',
        }}
      />

      <div className="relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-7 pb-4 pt-7">
        {/* 識別 */}
        <div className="flex flex-col gap-3.5">
          <div className="flex items-center gap-2">
            <Dot tone="signal" pulse />
            <span className="hl-label">operations</span>
            <span className="h-px flex-1 bg-[var(--hl-line)]" />
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--hl-ink-4)]">
              tower defense
            </span>
          </div>

          <h1 className="text-[52px] font-bold leading-[0.9] tracking-[-0.04em] text-[var(--hl-ink)]">
            {t.mainMenu.title}
          </h1>

          <p className="max-w-[32ch] text-[11.5px] leading-relaxed text-[var(--hl-ink-3)]">
            {t.mainMenu.subtitle}
          </p>
        </div>

        {/* 章節 */}
        <div className="flex flex-col gap-3 border-t border-[var(--hl-line)] pt-4">
          <div className="flex items-baseline justify-between">
            <span className="hl-label">campaign</span>
            <span className="font-mono text-[11px] tabular-nums tracking-[0.06em] text-[var(--hl-ink-2)]">
              {`ch.${chapterLabel}`}
            </span>
          </div>

          <div className="flex items-end justify-between gap-3">
            <span className="flex items-baseline gap-2">
              <span className="font-mono text-[34px] font-bold leading-none tabular-nums text-[var(--hl-ink)]">
                {totalStars}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--hl-ink-4)]">
                stars
              </span>
            </span>
            <span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-4)]">
              {`${clearedLevels} cleared`}
            </span>
          </div>

          <Segments total={12} filled={Math.min(12, clearedLevels)} tone="signal" size="sm" />
        </div>

        {/* 四格計量 */}
        <div className="grid grid-cols-2 border-l border-t border-[var(--hl-line)]">
          <MetricCell label={t.mainMenu.coinsUnit} value={coins.toLocaleString()} tone="signal" />
          <MetricCell label={t.mainMenu.talentTree} value={talentPoints} unit={t.mainMenu.points} />
          <MetricCell
            label={t.mainMenu.achievements}
            value={`${unlocked}/${catalog.length}`}
            tone="ink"
          />
          <MetricCell
            label={t.dailyChallenge.title}
            value={currentStreak > 0 ? `${currentStreak}` : '—'}
            unit={currentStreak > 0 ? 'd' : undefined}
            tone={dailyDone ? 'vital' : 'caution'}
          />
        </div>

        {/* 待辦（短螢幕時優先可見，快捷鍵其次） */}
        <div className="flex flex-col gap-0 border-t border-[var(--hl-line)] pt-1">
          {claimable > 0 && (
            <AlertRow
              tone="signal"
              text={`${t.mainMenu.alertChips.claimable} ${t.mainMenu.alertChips.claimableUnit.replace('{count}', String(claimable))}`}
              onClick={() => setScene('achievements')}
            />
          )}
          {dailyReward && (
            <AlertRow
              tone="vital"
              text={`${t.mainMenu.alertChips.dailyReward} · ${t.mainMenu.alertChips.claimableReward}`}
              onClick={() => setScene('dailyChallenge')}
            />
          )}
          {!dailyDone && (
            <AlertRow
              tone="caution"
              text={
                currentStreak > 0
                  ? t.mainMenu.alertChips.streakIncomplete.replace('{count}', String(currentStreak))
                  : t.mainMenu.alertChips.dailyIncomplete
              }
              onClick={() => setScene('dailyChallenge')}
            />
          )}
          {claimable === 0 && !dailyReward && dailyDone && (
            <div className="flex items-center gap-2 py-2">
              <Dot tone="vital" />
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--hl-vital)]">
                all clear
              </span>
            </div>
          )}
        </div>

        {/* 快捷鍵 */}
        <div className="flex flex-col gap-1.5 [@media(max-height:820px)]:hidden">
          <span className="hl-label">shortcuts</span>
          <HintRow k="ENTER" v={t.mainMenu.startGame} />
          <HintRow k="↑ ↓" v="select module" />
          <HintRow k="ESC" v="back" />
        </div>
      </div>

      {/* 主行動 */}
      <div className="relative flex flex-col gap-2 border-t border-[var(--hl-line)] px-7 py-4">
        <Btn variant="signal" size="lg" block onClick={() => setScene('pathSelection')}>
          {t.mainMenu.startGame}
        </Btn>
        <Btn variant="line" size="md" block onClick={() => setScene('pathSelection')}>
          {t.game.selectMap}
        </Btn>
        <div className="mt-1 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--hl-ink-4)]">
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
      <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-[var(--hl-ink-4)]">
        {v}
      </span>
      <span className="border border-[var(--hl-line)] px-1.5 py-[1px] font-mono text-[9px] tracking-[0.08em] text-[var(--hl-ink-2)]">
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
      ? 'text-[var(--hl-signal)]'
      : tone === 'caution'
        ? 'text-[var(--hl-caution)]'
        : tone === 'vital'
          ? 'text-[var(--hl-vital)]'
          : 'text-[var(--hl-ink)]';
  return (
    <div className="flex flex-col gap-1 border-b border-r border-[var(--hl-line)] px-3 py-2.5">
      <span className="truncate font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--hl-ink-4)]">
        {label}
      </span>
      <span className={`font-mono text-[15px] font-semibold leading-none tabular-nums ${color}`}>
        {value}
        {unit && <span className="ml-0.5 text-[9px] font-normal text-[var(--hl-ink-4)]">{unit}</span>}
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
      ? 'text-[var(--hl-signal)]'
      : tone === 'vital'
        ? 'text-[var(--hl-vital)]'
        : 'text-[var(--hl-caution)]';
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-2.5 border-t border-[var(--hl-line)] py-2 text-left transition-colors duration-150 hover:bg-[var(--hl-deck-2)]"
    >
      <Dot tone={tone} />
      <span className={`min-w-0 flex-1 truncate text-[11.5px] ${color}`}>{text}</span>
      <span className="font-mono text-[10px] text-[var(--hl-ink-4)] transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-[var(--hl-ink-2)]">
        →
      </span>
    </button>
  );
}
