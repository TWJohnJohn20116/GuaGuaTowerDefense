/**
 * 圖鑑左軌 · HARDLINE
 *
 * 10 個分頁分 3 群：群組只是一行 mono 標籤 + 結構線，不是彩色卡片。
 * 選中＝左緣 2px 訊號條（由 RailItem 提供）。
 */

import { useMemo } from 'react';
import {
  TowerIcon, AlienIcon, MapIcon, StarIcon, SparklesIcon,
  ChartIcon, LightningIcon, BooksIcon, PaletteIcon, FolderIcon,
} from '@/components/ui/Icons';
import { useTranslation } from '@/i18n';
import { RailItem } from '@/components/hl';
import type { TabType } from './EncyclopediaTypes';

type IconCmp = React.FC<{ className?: string }>;

interface SidebarTabConfig {
  id: TabType;
  label: string;
  Icon: IconCmp;
}

interface SidebarGroupConfig {
  key: 'combat' | 'tactics' | 'meta';
  label: string;
  tabs: SidebarTabConfig[];
}

interface EncyclopediaSidebarProps {
  activeTab: TabType;
  onChange: (tab: TabType) => void;
}

export function EncyclopediaSidebar({ activeTab, onChange }: EncyclopediaSidebarProps) {
  const { t } = useTranslation();
  const e = t.encyclopedia;

  const groups = useMemo<SidebarGroupConfig[]>(() => [
    {
      key: 'combat',
      label: e.sidebarGroupCombat,
      tabs: [
        { id: 'towers', label: e.towers, Icon: TowerIcon },
        { id: 'enemies', label: e.enemies, Icon: AlienIcon },
        { id: 'effects', label: e.effectsTabFull, Icon: SparklesIcon },
      ],
    },
    {
      key: 'tactics',
      label: e.sidebarGroupTactics,
      tabs: [
        { id: 'maps', label: e.maps, Icon: MapIcon },
        { id: 'difficulty', label: e.difficultyTab, Icon: StarIcon },
        { id: 'skills', label: e.skillsTab, Icon: LightningIcon },
      ],
    },
    {
      key: 'meta',
      label: e.sidebarGroupMeta,
      tabs: [
        { id: 'stats', label: e.statsTab, Icon: ChartIcon },
        { id: 'icons', label: e.iconsTab, Icon: PaletteIcon },
        { id: 'files', label: e.filesTab, Icon: FolderIcon },
      ],
    },
  ], [e]);

  // 全域編號：01…09
  let counter = 0;

  return (
    <>
      {groups.map((group) => {
        const GroupIcon: IconCmp = BooksIcon;
        return (
          <div key={group.key} className="flex flex-col">
            <div className="flex items-center gap-2 px-3 pb-1 pt-3">
              <GroupIcon className="h-2.5 w-2.5 shrink-0 text-[var(--hl-ink-4)]" />
              <span className="hl-label whitespace-nowrap">{group.label}</span>
              <span className="h-px flex-1 bg-[var(--hl-line)]" />
            </div>

            {group.tabs.map((tab) => {
              counter += 1;
              const TabIcon = tab.Icon;
              return (
                <RailItem
                  key={tab.id}
                  index={counter}
                  active={activeTab === tab.id}
                  label={
                    <span className="flex items-center gap-1.5">
                      <TabIcon className="h-3 w-3 shrink-0" />
                      <span className="truncate">{tab.label}</span>
                    </span>
                  }
                  onClick={() => onChange(tab.id)}
                />
              );
            })}
          </div>
        );
      })}
    </>
  );
}
