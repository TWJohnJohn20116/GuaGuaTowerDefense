import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useShopStore } from '@/store/shopStore';
import { useTalentStore } from '@/store/talentStore';
import { useAchievementStore } from '@/store/achievementStore';
import { getCatalogAchievements } from '@/store/achievementStoreCheck';
import { useWorkshopStore } from '@/store/workshopStore';
import { useTranslation } from '@/i18n';
import type { HomeFocusTarget } from '@/data/mainMenuHome';
import { HOME_QUICK_LEFT_CLASS, HOME_QUICK_RIGHT_CLASS } from '@/data/mainMenuHome';
import { ShopIcon, TreeIcon, TrophyIcon, WrenchIcon } from '@/components/ui/Icons';

/**
 * 主選單 · Hero 環繞的快捷磚
 *
 * 四塊磚環著中央舞台：左欄「金幣 → 成就」、右欄「天賦 → 工坊」。
 * 高度刻意不等（flex-[1.25] / flex-[1]），左右也不對稱，
 * 這樣拼貼才不會退化成另一種等寬網格。
 *
 * 磚的高度由 Hero 撐出來（約 300–430px），所以內容必須填滿，否則就是一片色塊：
 *   標籤列（頂）→ 數字（底）→ 進度條 → 動作提示，中央再用一枚半透明大圖示撐住。
 * 圖示只做視覺量體，狀態語意一律走 tone 與徽章。
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
        hint={t.mainMenu.hero.quickCoinsHint}
        icon={<ShopIcon className="h-52 w-52" />}
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
        hint={t.mainMenu.hero.quickAchievementsHint}
        icon={<TrophyIcon className="h-52 w-52" />}
        progress={catalog.length > 0 ? unlocked / catalog.length : 0}
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
  const projects = useWorkshopStore((s) => s.projects);

  return (
    <div className={HOME_QUICK_RIGHT_CLASS}>
      <QuickTile
        id="talentTree"
        label={t.mainMenu.hero.quickTalent}
        value={talentPoints}
        unit={t.mainMenu.points}
        tag={talentPoints > 0 ? t.mainMenu.hero.readyTag : undefined}
        hint={t.mainMenu.hero.quickTalentHint}
        icon={<TreeIcon className="h-52 w-52" />}
        tone="coral"
        flex="lg:flex-[1.25]"
        focused={focused === 'talentTree'}
        onFocus={() => onFocus('talentTree')}
        onSelect={() => setScene('talentTree')}
      />
      <QuickTile
        id="workshop"
        label={t.mainMenu.workshop}
        value={projects.length}
        unit={t.mainMenu.hero.projectUnit}
        hint={t.mainMenu.hero.quickWorkshopHint}
        icon={<WrenchIcon className="h-52 w-52" />}
        tone="plain"
        flex="lg:flex-[1]"
        focused={focused === 'workshop'}
        onFocus={() => onFocus('workshop')}
        onSelect={() => setScene('workshop')}
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
  hint,
  icon,
  progress,
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
  hint: string;
  icon: React.ReactNode;
  progress?: number;
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
        'group relative flex min-h-[92px] min-w-0 flex-col justify-between overflow-hidden rounded-[18px] border-[3px] px-4 py-3.5 text-left',
        'transition-[transform,border-color] duration-[160ms]',
        TONE[tone],
        flex,
        focused ? '-translate-y-1' : 'hover:-translate-y-1',
      ].join(' ')}
    >
      {/* 裝飾層：一枚半透明大圖示撐住磚的中央量體（只做視覺，狀態走 tone／徽章） */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="absolute inset-0 flex items-center justify-center opacity-[0.09]">{icon}</span>
      </span>

      <span className="relative flex items-center gap-2">
        <span className={tone === 'sun' ? 'arc-label text-[var(--cn-on-sun)]' : 'arc-label'}>{label}</span>
        {tag && (
          <span className="rounded-full bg-[var(--cn-cta)] px-1.5 py-[1px] font-mono text-[9px] font-extrabold text-[var(--cn-on-cta)]">
            {tag}
          </span>
        )}
      </span>

      <span className="relative flex flex-col gap-2">
        <span className="flex items-end justify-between gap-2">
          <span className="arc-num truncate text-[38px] leading-none lg:text-[56px]">{value}</span>
          <span className="ml-auto flex items-end gap-2">
            {unit && <span className="pb-1 font-mono text-[10px] opacity-70">{unit}</span>}
            <span
              aria-hidden="true"
              className="pb-1 font-mono text-[12px] font-black opacity-0 transition-opacity group-hover:opacity-100"
            >
              →
            </span>
          </span>
        </span>

        {progress !== undefined && (
          <span className="block h-2 w-full overflow-hidden rounded-full bg-[var(--cn-ink)]/10">
            <span
              className="block h-full rounded-full bg-[var(--cn-ink)]/45"
              style={{ width: Math.round(Math.min(1, Math.max(0, progress)) * 100) + '%' }}
            />
          </span>
        )}

        <span className="font-mono text-[10px] uppercase tracking-[0.1em] opacity-60">{hint}</span>
      </span>
    </button>
  );
}