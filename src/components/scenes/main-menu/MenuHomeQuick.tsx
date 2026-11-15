import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { EASE_OUT, SPRING_SOFT } from '@/utils/motionTokens';
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
 *
 * 單調的來源不是「東西太少」，是「四塊長得一樣」：同一個 label 位置、同一枚灰影圖示、
 * 同一個數字左下。所以四塊刻意錯開：
 *   金幣  斜紋底 + 最大圖示（240）＋ 最大數字（64）
 *   天賦  點陣底 + 中圖示（208）
 *   成就  橫線底 + 小圖示（176）＋ 進度條帶百分比
 *   工坊  薄荷綠底（第三個色階）+ 斜格底 + 大圖示（224）
 * 高度也不等（flex-[1.25] / flex-[1]），左右不對稱。
 */

/** 磚進場：淡入上移（常數化，避免 render 時重建物件） */
const TILE_IN = { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 } };

type QuickTone = 'sun' | 'coral' | 'mint' | 'plain';

const TONE: Record<QuickTone, string> = {
  sun: 'border-[var(--cn-line)] bg-[var(--cn-sun)] text-[var(--cn-on-sun)] shadow-[0_4px_0_var(--cn-sun-deep)]',
  coral:
    'border-[var(--cn-line)] bg-[var(--cn-coral-soft)] text-[var(--cn-signal-text)] shadow-[0_4px_0_-2px_rgba(46,36,64,0.18)]',
  mint:
    'border-[var(--cn-line)] bg-[var(--cn-mint-soft)] text-[var(--cn-mint-deep)] shadow-[0_4px_0_-2px_rgba(46,36,64,0.18)]',
  plain:
    'border-[var(--cn-line-soft)] bg-[var(--cn-card-2)] text-[var(--cn-ink)] shadow-[0_4px_0_-2px_rgba(46,36,64,0.16)]',
};

/** 底紋：四塊各一種，讓四塊磚不是同一張紙印出來的 */
const PATTERN: Record<QuickTone, { image: string; size: string }> = {
  sun: { image: 'repeating-linear-gradient(135deg, rgba(46,36,64,0.06) 0 2px, transparent 2px 14px)', size: 'auto' },
  coral: { image: 'radial-gradient(rgba(46,36,64,0.075) 1.5px, transparent 1.5px)', size: '18px 18px' },
  mint: { image: 'repeating-linear-gradient(45deg, rgba(46,36,64,0.055) 0 1px, transparent 1px 12px)', size: 'auto' },
  plain: { image: 'repeating-linear-gradient(0deg, rgba(46,36,64,0.045) 0 1px, transparent 1px 10px)', size: 'auto' },
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
        icon={<ShopIcon className="h-60 w-60" />}
        tone="sun"
        flex="lg:flex-[1.25]"
        order={0}
        valueClass="lg:text-[64px]"
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
        icon={<TrophyIcon className="h-44 w-44" />}
        progress={catalog.length > 0 ? unlocked / catalog.length : 0}
        tone="plain"
        flex="lg:flex-[1]"
        order={1}
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
        order={2}
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
        icon={<WrenchIcon className="h-56 w-56" />}
        tone="mint"
        flex="lg:flex-[1]"
        order={3}
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
  order = 0,
  valueClass = '',
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
  /** 進場延遲序號（左欄 0/1、右欄 2/3） */
  order?: number;
  valueClass?: string;
  focused: boolean;
  onFocus: () => void;
  onSelect: () => void;
}) {
  const pattern = PATTERN[tone];

  return (
    <motion.button
      {...TILE_IN}
      transition={{ ...SPRING_SOFT, delay: 0.08 + order * 0.05 }}
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
      {/* 裝飾層：底紋 + 半透明大圖示。兩者都包在 overflow-hidden 裡，避免撐大 scroll 區 */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <span
          className="absolute inset-0"
          style={{ backgroundImage: pattern.image, backgroundSize: pattern.size }}
        />
        <span className="absolute inset-0 flex items-center justify-center opacity-[0.11] transition-transform duration-500 group-hover:scale-105">
          {icon}
        </span>
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
          <span className={['arc-num truncate text-[38px] leading-none', valueClass].join(' ')}>{value}</span>
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
          <span className="flex items-center gap-2">
            <span className="block h-2 flex-1 overflow-hidden rounded-full bg-[var(--cn-ink)]/10">
              <motion.span
                className="block h-full rounded-full bg-[var(--cn-ink)]/45"
                style={{
                  width: Math.round(Math.min(1, Math.max(0, progress)) * 100) + '%',
                  transformOrigin: 'left',
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.45, ease: EASE_OUT }}
              />
            </span>
            <span className="shrink-0 font-mono text-[10px] font-extrabold opacity-65">
              {Math.round(progress * 100) + '%'}
            </span>
          </span>
        )}

        <span className="font-mono text-[10px] uppercase tracking-[0.1em] opacity-60">{hint}</span>
      </span>
    </motion.button>
  );
}