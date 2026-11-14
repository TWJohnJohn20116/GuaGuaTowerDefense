import { useMemo, useRef, useState } from 'react';
import type React from 'react';
import { useGameStore } from '@/store/gameStore';
import { useShopStore } from '@/store/shopStore';
import { useTalentStore } from '@/store/talentStore';
import { useAchievementStore } from '@/store/achievementStore';
import { getCatalogAchievements } from '@/store/achievementStoreCheck';
import type { HomeEntryScene } from '@/data/mainMenuHome';
import {
  HOME_ENTRY_SCENES,
  HOME_ENTRY_SPAN,
  HOME_GRID_CLASS,
  HOME_SPAN_CLASS,
  homeEntrySize,
} from '@/data/mainMenuHome';
import { version as APP_VERSION } from '../../../../package.json';
import { useTranslation } from '@/i18n';
import { MenuHomeCard } from './MenuHomeCard';
import {
  TrophyIcon, PaletteIcon, ShopIcon, WrenchIcon,
  BooksIcon, TreeIcon, ChartIcon,
  OpenBookIcon, ClipboardIcon, GearIcon, PlayIcon,
} from '@/components/ui/Icons';

/**
 * 主選單 · 入口牆
 *
 * 12 欄 bento：卡片跨 2/3/4/5 欄，三行各自是不同的切割比例，
 * 有數值的入口（金幣、天賦點、待領成就）給大磚，工具類收窄成小磚。
 * 方向鍵在牆上移動、Enter 進入；滑鼠與鍵盤共用同一組焦點樣式。
 */
export function MenuHomeGrid() {
  const { t } = useTranslation();
  const setScene = useGameStore((s) => s.setScene);
  const coins = useShopStore((s) => s.coins);
  const talentPoints = useTalentStore((s) => s.talentPoints);
  const playerAchievements = useAchievementStore((s) => s.playerAchievements);
  const [focus, setFocus] = useState(0);

  const catalog = useMemo(() => getCatalogAchievements(), []);
  const catalogIds = useMemo(() => new Set(catalog.map((a) => a.id)), [catalog]);
  const unlockedCount = Object.values(playerAchievements).filter(
    (a) => catalogIds.has(a.id) && (a.status === 'completed' || a.status === 'claimed'),
  ).length;
  const claimableCount = Object.values(playerAchievements).filter(
    (a) => catalogIds.has(a.id) && a.status === 'completed',
  ).length;

  const rows: Record<
    HomeEntryScene,
    {
      label: string;
      sub: string;
      icon: React.ReactNode;
      tag?: string;
      tone?: 'signal' | 'vital' | 'caution' | 'ink';
    }
  > = {
    shop: {
      label: t.mainMenu.shop,
      sub: `${t.mainMenu.coinsUnit} ${coins.toLocaleString()}`,
      icon: <ShopIcon className="h-6 w-6" />,
      tone: 'caution',
    },
    talentTree: {
      label: t.mainMenu.talentTree,
      sub: `${talentPoints} ${t.mainMenu.points}`,
      icon: <TreeIcon className="h-6 w-6" />,
      tag: talentPoints > 0 ? 'ready' : undefined,
      tone: 'signal',
    },
    achievements: {
      label: t.mainMenu.achievements,
      sub:
        claimableCount > 0
          ? t.mainMenu.bento.claimableCount.replace('{count}', String(claimableCount))
          : `${unlockedCount}/${catalog.length}`,
      icon: <TrophyIcon className="h-6 w-6" />,
      tag: claimableCount > 0 ? 'claim' : undefined,
      tone: claimableCount > 0 ? 'signal' : 'caution',
    },
    encyclopedia: {
      label: t.mainMenu.encyclopedia,
      sub: t.mainMenu.encyclopediaDesc,
      icon: <BooksIcon className="h-6 w-6" />,
      tone: 'ink',
    },
    skins: {
      label: t.mainMenu.skins,
      sub: t.mainMenu.skinsDesc,
      icon: <PaletteIcon className="h-6 w-6" />,
      tone: 'ink',
    },
    workshop: {
      label: t.mainMenu.workshop,
      sub: t.mainMenu.workshopDesc,
      icon: <WrenchIcon className="h-6 w-6" />,
      tone: 'ink',
    },
    statistics: {
      label: t.encyclopedia.statsOverview,
      sub: t.encyclopedia.statsOverviewDesc,
      icon: <ChartIcon className="h-6 w-6" />,
      tone: 'ink',
    },
    replay: {
      label: t.replay.title,
      sub: t.mainMenu.bento.replaySub,
      icon: <PlayIcon className="h-6 w-6" />,
      tone: 'ink',
    },
    tutorial: {
      label: t.mainMenu.tutorial,
      sub: t.mainMenu.encyclopediaDesc,
      icon: <OpenBookIcon className="h-6 w-6" />,
      tone: 'ink',
    },
    changelog: {
      label: t.mainMenu.changelog,
      sub: APP_VERSION,
      icon: <ClipboardIcon className="h-6 w-6" />,
      tone: 'ink',
    },
    settings: {
      label: t.mainMenu.settings,
      sub: t.settings.general,
      icon: <GearIcon className="h-6 w-6" />,
      tone: 'ink',
    },
  };

  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  const moveFocus = (next: number) => {
    const total = HOME_ENTRY_SCENES.length;
    const idx = ((next % total) + total) % total;
    setFocus(idx);
    rowRefs.current[idx]?.querySelector('button')?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      moveFocus(focus + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      moveFocus(focus - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      moveFocus(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      moveFocus(HOME_ENTRY_SCENES.length - 1);
    }
  };

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col">
      {/* 標頭：糖果標籤 + 粗虛線 + 入口數 */}
      <div className="flex shrink-0 items-center gap-3 px-1 pb-2.5 pt-1">
        <span className="arc-banner">
          <span className="arc-label !text-[var(--cn-sky-deep)]">{t.mainMenu.modules}</span>
        </span>
        <span className="h-[3px] flex-1 rounded-full bg-[var(--cn-line-soft)]" />
        <span className="rounded-full border-2 border-[var(--cn-line-soft)] bg-[var(--cn-card)] px-2.5 py-0.5 font-mono text-[10.5px] font-extrabold tabular-nums text-[var(--cn-ink-3)]">
          {t.mainMenu.entriesCount.replace('{count}', String(HOME_ENTRY_SCENES.length))}
        </span>
      </div>

      {/* bento 入口牆 */}
      <div className={HOME_GRID_CLASS} onKeyDown={handleKeyDown}>
        {HOME_ENTRY_SCENES.map((scene, i) => {
          const row = rows[scene];
          return (
            <div
              key={scene}
              className={`${HOME_SPAN_CLASS[HOME_ENTRY_SPAN[scene]]} min-h-0`}
              ref={(el) => {
                rowRefs.current[i] = el;
              }}
            >
              <MenuHomeCard
                index={i}
                label={row.label}
                sub={row.sub}
                tag={row.tag}
                tone={row.tone}
                size={homeEntrySize(scene)}
                icon={row.icon}
                focused={focus === i}
                onSelect={() => setScene(scene)}
                onFocus={() => setFocus(i)}
              />
            </div>
          );
        })}
      </div>
    </main>
  );
}

export default MenuHomeGrid;
