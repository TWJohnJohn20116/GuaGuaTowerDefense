import { useMemo, useRef, useState } from 'react';
import type React from 'react';
import { useGameStore } from '@/store/gameStore';
import { useShopStore } from '@/store/shopStore';
import { useTalentStore } from '@/store/talentStore';
import { useAchievementStore } from '@/store/achievementStore';
import { getCatalogAchievements } from '@/store/achievementStoreCheck';
import type { HomeEntryScene } from '@/data/mainMenuHome';
import { HOME_ENTRY_SCENES } from '@/data/mainMenuHome';
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
 * 12 個模組排成卡片牆（2 / 3 欄），一張卡就是一個入口。
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
    statistics: {
      label: t.encyclopedia.statsOverview,
      sub: t.encyclopedia.statsOverviewDesc,
      icon: <ChartIcon className="h-6 w-6" />,
      tone: 'ink',
    },
    workshop: {
      label: t.mainMenu.workshop,
      sub: t.mainMenu.workshopDesc,
      icon: <WrenchIcon className="h-6 w-6" />,
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
    <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 p-4">
      {/* 標頭 */}
      <div className="flex shrink-0 items-center gap-3 px-1">
        <span className="arc-title text-[18px]">選單</span>
        <span className="h-[3px] flex-1 rounded-full bg-[var(--cn-line-soft)]" />
        <span className="rounded-full bg-[var(--cn-card-2)] px-2.5 py-0.5 text-[11px] font-extrabold text-[var(--cn-ink-3)]">
          {String(HOME_ENTRY_SCENES.length)} 個入口
        </span>
      </div>

      {/* 卡片牆 */}
      <div
        className="grid min-h-0 flex-1 auto-rows-min grid-cols-2 content-start gap-3 overflow-y-auto p-1 xl:grid-cols-3"
        onKeyDown={handleKeyDown}
      >
        {HOME_ENTRY_SCENES.map((scene, i) => {
          const row = rows[scene];
          return (
            <div
              key={scene}
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
