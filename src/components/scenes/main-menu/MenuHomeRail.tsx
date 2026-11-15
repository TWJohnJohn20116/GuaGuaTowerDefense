import { version as APP_VERSION } from '../../../../package.json';
import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useShopStore } from '@/store/shopStore';
import { useTalentStore } from '@/store/talentStore';
import { useAchievementStore } from '@/store/achievementStore';
import { getCatalogAchievements } from '@/store/achievementStoreCheck';
import { useStatsStore } from '@/store/statsStore';
import { HOME_RAIL_CLASS } from '@/data/mainMenuHome';
import { useTranslation } from '@/i18n';
import { Btn, Dot } from '@/components/hl';

/**
 * 主選單 · 招牌欄
 *
 * 這一欄的節奏刻意做成四段不同的量體，而不是一疊同尺寸小格：
 *   大標題（品牌） → 最大（金幣獎章） → 中（天賦／成就兩格） → 小（戰績細線列） → 動作（開始遊戲）。
 * 全畫面只有一處大面積訊號色：底部那顆開始遊戲。
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
    <aside className={HOME_RAIL_CLASS}>
      {/* 底紋：右緣刻度 */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-[3px]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, var(--cn-line-soft) 0 1px, transparent 1px 14px)',
        }}
      />

      <div className="relative flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-3 pt-5">
        {/* 識別 */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <Dot tone="signal" pulse />
            <span className="arc-label">operations</span>
            <span className="h-px flex-1 bg-[var(--cn-line-soft)]" />
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--cn-ink-4)]">
              tower defense
            </span>
          </div>

          <h1 className="text-[38px] font-black leading-[0.9] tracking-[-0.05em] text-[var(--cn-ink)] lg:text-[50px] lg:leading-[0.86]">
            {t.mainMenu.title}
          </h1>

          <p className="hidden max-w-[30ch] text-[11.5px] leading-relaxed text-[var(--cn-ink-3)] lg:block">
            {t.mainMenu.subtitle}
          </p>
        </div>

        {/* 金幣獎章：整欄最大的一塊色，數值直接當圖形用 */}
        <div className="relative overflow-hidden rounded-[18px] border-[3px] border-[var(--cn-line)] bg-[var(--cn-sun)] px-4 py-2.5 shadow-[0_4px_0_var(--cn-sun-deep)] lg:py-3">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-6 -right-4 h-20 w-20 rounded-full border-[6px] border-[var(--cn-ink)]/10"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-1 -right-0 h-11 w-11 rounded-full border-[6px] border-[var(--cn-ink)]/10"
          />
          <span className="block font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--cn-ink)]/70">
            {t.mainMenu.coinsUnit}
          </span>
          <span className="arc-num block text-[26px] leading-none lg:text-[32px]">
            {coins.toLocaleString()}
          </span>
        </div>

        {/* 兩格：天賦／成就 */}
        <div className="grid grid-cols-2 gap-2">
          <MiniCell label={t.mainMenu.talentTree} value={talentPoints} unit={t.mainMenu.points} />
          <MiniCell label={t.mainMenu.achievements} value={`${unlocked}/${catalog.length}`} />
        </div>

        {/* 本機戰績：細線列，不是又一排卡片（窄螢幕讓位給入口卡） */}
        <div className="hidden flex-col gap-1 lg:flex">
          <span className="arc-label pb-1">{t.mainMenu.localRecordTitle}</span>
          <div className="divide-y divide-[var(--cn-line-soft)]">
            <RecordRow label={t.mainMenu.localGames} value={globalStats.totalGamesPlayed} />
            <RecordRow
              label={t.mainMenu.localWinRate}
              value={`${Math.round(globalStats.winRate * 100)}%`}
            />
            <RecordRow label={t.mainMenu.localBestWave} value={personalBests.highestWave} />
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
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--cn-mint-deep)]">
                all clear
              </span>
            </div>
          )}
        </div>

        {/* 快捷鍵 */}
        <div className="mt-auto hidden flex-col gap-1.5 pt-2 lg:flex">
          <span className="arc-label">shortcuts</span>
          <HintRow k="ENTER" v={t.mainMenu.startGame} />
          <HintRow k="↑ ↓" v="select module" />
          <HintRow k="ESC" v="back" />
        </div>
      </div>

      {/* 主行動：整頁唯一的大面積訊號色，也只留一個入口
          ——原本還有一顆「選擇地圖」，但兩顆都只做 setScene('pathSelection')，
             同一個目的地放兩顆按鈕等於叫玩家猜差別在哪 */}
      <div className="relative flex flex-col gap-2 border-t-[3px] border-[var(--cn-line-soft)] px-5 py-4">
        <Btn variant="signal" size="lg" block onClick={() => setScene('pathSelection')}>
          {t.mainMenu.startGame}
        </Btn>
        <div className="mt-1 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--cn-ink-4)]">
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
      <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-[var(--cn-ink-4)]">
        {v}
      </span>
      <span className="rounded-full border-2 border-[var(--cn-line-soft)] bg-[var(--cn-card-2)] px-2 py-[1px] font-mono text-[10px] font-extrabold text-[var(--cn-ink-2)]">
        {k}
      </span>
    </div>
  );
}

/** 中量體：淡底小磚，只放標籤與數值 */
function MiniCell({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number;
  unit?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-[14px] border-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card-2)] px-3 py-2">
      <span className="truncate font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--cn-ink-4)]">
        {label}
      </span>
      <span className="arc-num text-[16px] leading-none text-[var(--cn-ink)]">
        {value}
        {unit && <span className="ml-0.5 text-[9px] font-normal text-[var(--cn-ink-4)]">{unit}</span>}
      </span>
    </div>
  );
}

/** 小量體：標籤左、數值右的一行，靠分隔線成組 */
function RecordRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-1.5">
      <span className="truncate text-[11.5px] font-semibold text-[var(--cn-ink-3)]">{label}</span>
      <span className="arc-num shrink-0 text-[14px] leading-none text-[var(--cn-ink)]">{value}</span>
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
      ? 'text-[var(--cn-signal-text)]'
      : tone === 'vital'
        ? 'text-[var(--cn-mint-deep)]'
        : 'text-[var(--cn-caution-text)]';
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-2.5 rounded-[14px] px-2 py-2 text-left transition-colors duration-150 hover:bg-[var(--cn-card-2)]"
    >
      <Dot tone={tone} />
      <span className={`min-w-0 flex-1 truncate text-[11.5px] font-semibold ${color}`}>{text}</span>
      <span className="font-mono text-[10px] text-[var(--cn-ink-4)] transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-[var(--cn-ink-2)]">
        →
      </span>
    </button>
  );
}
