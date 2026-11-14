import { useMemo, useRef, useState } from 'react';
import type React from 'react';
import { useGameStore } from '@/store/gameStore';
import { useShopStore } from '@/store/shopStore';
import { useTalentStore } from '@/store/talentStore';
import { useAchievementStore } from '@/store/achievementStore';
import { useDailyChallengeStore } from '@/store/dailyChallengeStore';
import { useMutatorChallengeStore } from '@/store/mutatorChallengeStore';
import { getCatalogAchievements } from '@/store/achievementStoreCheck';
import { MUTATOR_CHALLENGES } from '@/data/mutatorChallengeData';
import type { HomeEntryScene } from '@/data/mainMenuHome';
import { HOME_ENTRY_SCENES } from '@/data/mainMenuHome';
import { version as APP_VERSION } from '../../../../package.json';
import { useTranslation } from '@/i18n';
import { MenuHomeCard } from './MenuHomeCard';
import {
  TrophyIcon, PaletteIcon, ShopIcon, WrenchIcon,
  BooksIcon, TreeIcon, FlowerIcon, ChartIcon,
  FlameIcon, DangerIcon, OpenBookIcon, ClipboardIcon, GearIcon, PlayIcon,
} from '@/components/ui/Icons';

/**
 * 主選單 · 目錄（右欄）
 *
 * 這是一張表，不是卡片牆：14 列固定節奏，一列一列往下掃。
 * ↑↓ 換列、Enter 進入，滑鼠與鍵盤共用同一組焦點樣式。
 */
export function MenuHomeGrid() {
  const { t } = useTranslation();
  const setScene = useGameStore((s) => s.setScene);
  const coins = useShopStore((s) => s.coins);
  const talentPoints = useTalentStore((s) => s.talentPoints);
  const playerAchievements = useAchievementStore((s) => s.playerAchievements);
  const todayChallenge = useDailyChallengeStore((s) => s.todayChallenge);
  const currentStreak = useDailyChallengeStore((s) => s.currentStreak);
  const mutatorCompleted = useMutatorChallengeStore((s) => s.totalCompleted);
  const [focus, setFocus] = useState(0);

  const catalog = useMemo(() => getCatalogAchievements(), []);
  const catalogIds = useMemo(() => new Set(catalog.map((a) => a.id)), [catalog]);
  const unlockedCount = Object.values(playerAchievements).filter(
    (a) => catalogIds.has(a.id) && (a.status === 'completed' || a.status === 'claimed'),
  ).length;
  const claimableCount = Object.values(playerAchievements).filter(
    (a) => catalogIds.has(a.id) && a.status === 'completed',
  ).length;

  const dailySub = todayChallenge?.completed
    ? t.dailyChallenge.completedTag
    : currentStreak > 0
      ? t.mainMenu.bento.streakPendingWith.replace('{count}', String(currentStreak))
      : t.mainMenu.bento.streakPending;

  const rows: Record<
    HomeEntryScene,
    {
      label: string;
      sub: string;
      icon: React.ReactNode;
      tag?: string;
      tone?: 'signal' | 'vital' | 'caution';
    }
  > = {
    dailyChallenge: {
      label: t.dailyChallenge.title,
      sub: dailySub,
      icon: <FlameIcon className="h-4 w-4" />,
      tag: todayChallenge?.completed ? 'done' : 'today',
      tone: todayChallenge?.completed ? 'vital' : 'caution',
    },
    mutatorChallenge: {
      label: t.mutatorChallenge.title,
      sub: t.mainMenu.bento.mutatorProgress
        .replace('{done}', String(mutatorCompleted))
        .replace('{total}', String(MUTATOR_CHALLENGES.length)),
      icon: <DangerIcon className="h-4 w-4" />,
    },
    shop: {
      label: t.mainMenu.shop,
      sub: `${t.mainMenu.coinsUnit} ${coins.toLocaleString()}`,
      icon: <ShopIcon className="h-4 w-4" />,
    },
    talentTree: {
      label: t.mainMenu.talentTree,
      sub: `${talentPoints} ${t.mainMenu.points}`,
      icon: <TreeIcon className="h-4 w-4" />,
      tag: talentPoints > 0 ? 'ready' : undefined,
      tone: 'signal',
    },
    encyclopedia: {
      label: t.mainMenu.encyclopedia,
      sub: t.mainMenu.encyclopediaDesc,
      icon: <BooksIcon className="h-4 w-4" />,
    },
    skins: {
      label: t.mainMenu.skins,
      sub: t.mainMenu.skinsDesc,
      icon: <PaletteIcon className="h-4 w-4" />,
    },
    achievements: {
      label: t.mainMenu.achievements,
      sub:
        claimableCount > 0
          ? t.mainMenu.bento.claimableCount.replace('{count}', String(claimableCount))
          : `${unlockedCount}/${catalog.length}`,
      icon: <TrophyIcon className="h-4 w-4" />,
      tag: claimableCount > 0 ? 'claim' : undefined,
      tone: 'signal',
    },
    statistics: {
      label: t.encyclopedia.statsOverview,
      sub: t.encyclopedia.statsOverviewDesc,
      icon: <ChartIcon className="h-4 w-4" />,
    },
    workshop: {
      label: t.mainMenu.workshop,
      sub: t.mainMenu.workshopDesc,
      icon: <WrenchIcon className="h-4 w-4" />,
    },
    replay: {
      label: t.replay.title,
      sub: t.mainMenu.bento.replaySub,
      icon: <PlayIcon className="h-4 w-4" />,
    },
    memorial: {
      label: t.memorial.title,
      sub: t.mainMenu.bento.memorialSub,
      icon: <FlowerIcon className="h-4 w-4" />,
    },
    tutorial: {
      label: t.mainMenu.tutorial,
      sub: t.mainMenu.encyclopediaDesc,
      icon: <OpenBookIcon className="h-4 w-4" />,
    },
    changelog: {
      label: t.mainMenu.changelog,
      sub: APP_VERSION,
      icon: <ClipboardIcon className="h-4 w-4" />,
    },
    settings: {
      label: t.mainMenu.settings,
      sub: t.settings.general,
      icon: <GearIcon className="h-4 w-4" />,
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
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveFocus(focus + 1);
    } else if (e.key === 'ArrowUp') {
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
    <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--hl-void)]">
      {/* 表頭 */}
      <div className="flex h-10 shrink-0 items-center gap-3 border-b border-[var(--hl-line)] px-4">
        <span className="hl-label">index</span>
        <span className="h-px flex-1 bg-[var(--hl-line)]" />
        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--hl-ink-4)]">
          ↑↓ select · enter open
        </span>
        <span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-4)]">
          {String(HOME_ENTRY_SCENES.length).padStart(2, '0')} entries
        </span>
      </div>

      {/* 目錄列 */}
      <div className="min-h-0 flex-1 overflow-y-auto" onKeyDown={handleKeyDown}>
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
