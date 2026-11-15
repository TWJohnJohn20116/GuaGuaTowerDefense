import type React from 'react';
import { useGameStore } from '@/store/gameStore';
import { useStatsStore } from '@/store/statsStore';
import { useTranslation } from '@/i18n';
import type { HomeFocusTarget, HomeGroupId, HomeGroupScene } from '@/data/mainMenuHome';
import {
  HOME_ENTRY_GROUPS,
  HOME_GROUPS_CLASS,
  HOME_GROUP_COLS_CLASS,
  HOME_GROUP_SPAN_CLASS,
} from '@/data/mainMenuHome';
import { version as APP_VERSION } from '../../../../package.json';
import { Dot } from '@/components/hl';
import { MenuHomeCard } from './MenuHomeCard';
import {
  BooksIcon,
  ClipboardIcon,
  ChartIcon,
  GearIcon,
  OpenBookIcon,
  PaletteIcon,
  PlayIcon,
} from '@/components/ui/Icons';

/** 群組燈號：三群各一個語意色，標題列就看得出來這是哪一類 */
const GROUP_TONE: Record<HomeGroupId, 'signal' | 'vital' | 'caution'> = {
  battle: 'signal',
  collection: 'vital',
  system: 'caution',
};

/**
 * 主選單 · 三群入口帶
 *
 * 舊版是 12 欄等寬 bento 牆，11 個入口同一個量體、同一種節奏。
 * 現在拆成三群（戰鬥 5 欄／收藏 4 欄／後勤 3 欄），群與群之間用標題列與寬度切割，
 * 玩家不必讀完 11 個標籤才知道「哪幾個是進遊戲的」。
 *
 * 高頻四塊（商店／天賦／成就／統計）已升格成 Hero 環繞的快捷磚，這裡不再重複。
 */
export function MenuHomeGroups({
  focused,
  onFocus,
}: {
  focused: HomeFocusTarget;
  onFocus: (id: HomeFocusTarget) => void;
}) {
  const { t } = useTranslation();
  const setScene = useGameStore((s) => s.setScene);
  const globalStats = useStatsStore((s) => s.globalStats);
  const personalBests = useStatsStore((s) => s.personalBests);

  const rows: Record<
    HomeGroupScene,
    { label: string; sub: string; icon: React.ReactNode; tone: 'ink' }
  > = {
    statistics: {
      label: t.mainMenu.hero.quickRecords,
      sub:
        Math.round(globalStats.winRate * 100) +
        '% · ' +
        t.mainMenu.hero.quickBestWave +
        ' ' +
        personalBests.highestWave,
      icon: <ChartIcon className="h-5 w-5" />,
      tone: 'ink',
    },
    replay: {
      label: t.replay.title,
      sub: t.mainMenu.bento.replaySub,
      icon: <PlayIcon className="h-5 w-5" />,
      tone: 'ink',
    },
    tutorial: {
      label: t.mainMenu.tutorial,
      sub: t.mainMenu.hero.tutorialSub,
      icon: <OpenBookIcon className="h-5 w-5" />,
      tone: 'ink',
    },
    encyclopedia: {
      label: t.mainMenu.encyclopedia,
      sub: t.mainMenu.encyclopediaDesc,
      icon: <BooksIcon className="h-5 w-5" />,
      tone: 'ink',
    },
    skins: {
      label: t.mainMenu.skins,
      sub: t.mainMenu.skinsDesc,
      icon: <PaletteIcon className="h-5 w-5" />,
      tone: 'ink',
    },
    changelog: {
      label: t.mainMenu.changelog,
      sub: APP_VERSION,
      icon: <ClipboardIcon className="h-5 w-5" />,
      tone: 'ink',
    },
    settings: {
      label: t.mainMenu.settings,
      sub: t.mainMenu.hero.settingsSub,
      icon: <GearIcon className="h-5 w-5" />,
      tone: 'ink',
    },
  };

  return (
    <section className={HOME_GROUPS_CLASS}>
      <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-12">
        {HOME_ENTRY_GROUPS.map((group) => (
          <div
            key={group.id}
            className={['flex flex-col gap-1.5', HOME_GROUP_SPAN_CLASS[group.span]].join(' ')}
          >
            <header className="flex items-center gap-2">
              <Dot tone={GROUP_TONE[group.id]} />
              <span className="arc-label">{t.mainMenu.groups[group.id]}</span>
              <span className="h-px flex-1 bg-[var(--cn-line-soft)]" />
              <span className="font-mono text-[9.5px] font-extrabold tabular-nums text-[var(--cn-ink-4)]">
                {group.scenes.length}
              </span>
            </header>
            <div className={['grid flex-1 gap-2', HOME_GROUP_COLS_CLASS[group.span]].join(' ')}>
              {group.scenes.map((scene, i) => (
                <MenuHomeCard
                  key={scene}
                  index={i}
                  focusId={scene}
                  label={rows[scene].label}
                  sub={rows[scene].sub}
                  icon={rows[scene].icon}
                  tone={rows[scene].tone}
                  size="compact"
                  focused={focused === scene}
                  onSelect={() => setScene(scene)}
                  onFocus={() => onFocus(scene)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default MenuHomeGroups;