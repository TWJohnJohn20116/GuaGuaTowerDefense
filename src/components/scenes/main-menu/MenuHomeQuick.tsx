import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useShopStore } from '@/store/shopStore';
import { useTalentStore } from '@/store/talentStore';
import { useAchievementStore } from '@/store/achievementStore';
import { getCatalogAchievements } from '@/store/achievementStoreCheck';
import { useStatsStore } from '@/store/statsStore';
import { useTranslation } from '@/i18n';
import type { HomeFocusTarget } from '@/data/mainMenuHome';
import { HOME_QUICK_LEFT_CLASS, HOME_QUICK_RIGHT_CLASS } from '@/data/mainMenuHome';

/**
 * 主選單 · Hero 環繞的快捷磚
 *
 * 四塊磚環著中央舞台：左欄「金幣 → 成就」、右欄「天賦 → 戰績」。
 * 高度刻意不等（flex-[1.4] / flex-[1]），左右也不對稱，
 * 這樣拼貼才不會退化成另一種等寬網格。
 *
 * 這四塊同時是入口（點下去進對應場景），但視覺語彙是「儀表」不是「卡片」：
 * 數字當圖形用，標籤縮到 9px。
 */

type QuickTone = 'sun' | 'coral' | 'plain';

const TONE: Record<QuickTone, string> = {
  sun: 'border-[var(--cn-line)] bg-[var(--cn-sun)] text-[var(--cn-on-sun)] shadow-[0_4px_0_var(--cn-sun-deep)]',
  coral:
    'border-[var(--cn-line)] bg-[var(--cn-coral-soft)] text-[var(--cn-signal-text)] shadow-[0_4px_0_-2px_rgba(46,36,64,0.18)]',
  plain:
    'border-[var(--cn-line-soft)] bg-[var(--cn-card-2)] text-[var(--cn-ink)] shadow-[0_4px_0_-2px_rgba(46,36,64,0.16)]',
};

interface QuickProps {
  focused: HomeFocusTarget;
  onFocus: (id: HomeFocusTarget) => void;
}

export function MenuHomeQuickLeft({ focused, onFocus }: QuickProps) {
  const { t } = useTranslation();
  const setScene = useGameStore((s) => s.setScene);
  const coins = useShopStore((s) => s.coins);
  const playerAchievements = useAchievementStore((s) => s.playerAchievements);

  const catalog = useMemo(() => getCatalogAchievements(), []);
  const catalogIds = useMemo(() => new Set(catalog.map((a) => a.id)), [catalog]);
  const claimable = Object.values(playerAchievements).filter(
    (a) => catalogIds.has(a.id) && a.status === 'completed',
  ).length;
  const unlocked = Object.values(playerAchievements).filter(
    (a) => catalogIds.has(a.id) && (a.status === 'completed' || a.status === 'claimed'),
  ).length;

  return (
    <div className={HOME_QUICK_LEFT_CLASS}>
      <QuickTile
        id="shop"
        label={t.mainMenu.hero.quickCoins}
        value={coins.toLocaleString()}
        tone="sun"
        flex="lg:flex-[1.25]"
        focused={focused === 'shop'}
        onFocus={() => onFocus('shop')}
        onSelect={() => setScene('shop')}
      />
      <QuickTile
        id="achievements"
        label={t.mainMenu.hero.quickAchievements}
        value={unlocked + '/' + catalog.length}
        tag={claimable > 0 ? String(claimable) : undefined}
        tone="plain"
        flex="lg:flex-[1]"
        focused={focused === 'achievements'}
        onFocus={() => onFocus('achievements')}
        onSelect={() => setScene('achievements')}
      />
    </div>
  );
}

export function MenuHomeQuickRight({ focused, onFocus }: QuickProps) {
  const { t } = useTranslation();
  const setScene = useGameStore((s) => s.setScene);
  const talentPoints = useTalentStore((s) => s.talentPoints);
  const globalStats = useStatsStore((s) => s.globalStats);
  const personalBests = useStatsStore((s) => s.personalBests);

  return (
    <div className={HOME_QUICK_RIGHT_CLASS}>
      <QuickTile
        id="talentTree"
        label={t.mainMenu.hero.quickTalent}
        value={talentPoints}
        unit={t.mainMenu.points}
        tag={talentPoints > 0 ? t.mainMenu.hero.readyTag : undefined}
        tone="coral"
        flex="lg:flex-[1.25]"
        focused={focused === 'talentTree'}
        onFocus={() => onFocus('talentTree')}
        onSelect={() => setScene('talentTree')}
      />
      <RecordTile
        id="statistics"
        label={t.mainMenu.hero.quickRecords}
        rows={[
          { k: t.mainMenu.hero.quickWinRate, v: Math.round(globalStats.winRate * 100) + '%' },
          { k: t.mainMenu.hero.quickBestWave, v: String(personalBests.highestWave) },
          { k: t.mainMenu.hero.quickGames, v: String(globalStats.totalGamesPlayed) },
        ]}
        focused={focused === 'statistics'}
        onFocus={() => onFocus('statistics')}
        onSelect={() => setScene('statistics')}
      />
    </div>
  );
}

function QuickTile({
  id,
  label,
  value,
  unit,
  tag,
  tone,
  flex,
  focused,
  onFocus,
  onSelect,
}: {
  id: HomeFocusTarget;
  label: string;
  value: string | number;
  unit?: string;
  tag?: string;
  tone: QuickTone;
  flex: string;
  focused: boolean;
  onFocus: () => void;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      data-focus-id={id}
      onClick={onSelect}
      onMouseEnter={onFocus}
      onFocus={onFocus}
      className={[
        'group relative flex min-h-[92px] min-w-0 flex-col justify-between overflow-hidden rounded-[18px] border-[3px] px-4 py-3 text-left',
        'transition-[transform,border-color] duration-[160ms]',
        TONE[tone],
        flex,
        focused ? '-translate-y-1' : 'hover:-translate-y-1',
      ].join(' ')}
    >
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="absolute -bottom-6 -right-4 h-20 w-20 rounded-full border-[6px] border-current opacity-[0.12]" />
      </span>
      <span className="flex items-center gap-2">
        <span className={tone === 'sun' ? 'arc-label text-[var(--cn-on-sun)]' : 'arc-label'}>{label}</span>
        {tag && (
          <span className="rounded-full bg-[var(--cn-cta)] px-1.5 py-[1px] font-mono text-[9px] font-extrabold text-[var(--cn-on-cta)]">
            {tag}
          </span>
        )}
      </span>
      <span className="flex items-end justify-between gap-2">
        <span className="arc-num truncate text-[30px] leading-none lg:text-[42px]">{value}</span>
        <span className="ml-auto flex items-end gap-2">
          {unit && <span className="pb-0.5 font-mono text-[10px] opacity-70">{unit}</span>}
          <span
            aria-hidden="true"
            className="font-mono text-[12px] font-black opacity-0 transition-opacity group-hover:opacity-100"
          >
            →
          </span>
        </span>
      </span>
    </button>
  );
}

/** 戰績磚：不放單一數字，改成三行細列（勝率／最高波／場次），資訊不減、少一層卡片 */
function RecordTile({
  id,
  label,
  rows,
  focused,
  onFocus,
  onSelect,
}: {
  id: HomeFocusTarget;
  label: string;
  rows: { k: string; v: string }[];
  focused: boolean;
  onFocus: () => void;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      data-focus-id={id}
      onClick={onSelect}
      onMouseEnter={onFocus}
      onFocus={onFocus}
      className={[
        'group relative flex min-h-[92px] min-w-0 flex-col justify-between gap-1.5 overflow-hidden rounded-[18px] border-[3px] px-4 py-3 text-left',
        'transition-[transform,border-color] duration-[160ms]',
        TONE.plain,
        'lg:flex-[1]',
        focused ? '-translate-y-1 border-[var(--cn-line)]' : 'hover:-translate-y-1 hover:border-[var(--cn-line)]',
      ].join(' ')}
    >
      <span className="arc-label">{label}</span>
      <span className="flex flex-col gap-0.5">
        {rows.map((r) => (
          <span key={r.k} className="flex items-baseline justify-between gap-2">
            <span className="truncate text-[11px] font-semibold text-[var(--cn-ink-3)]">{r.k}</span>
            <span className="arc-num shrink-0 text-[13px] leading-none text-[var(--cn-ink)]">{r.v}</span>
          </span>
        ))}
      </span>
    </button>
  );
}