/**
 * 地圖側欄 · 列表項目（HARDLINE）
 *
 * 一行一列：mono 編號 + 名稱 + 右側資料（路徑長度／轉角／難度刻度）。
 * 用 RailItem，選中只有左緣 2px 訊號條，沒有縮圖、沒有縮放動畫。
 */

import { memo, useMemo } from 'react';
import { useTranslation } from '@/i18n';
import type { PathConfig } from '@/types/game';
import { RailItem } from '@/components/hl';
import { PathPreview } from '../PathPreview';
import { calculatePathStats } from '../utils';
import { getDifficultyMeta, getPathDifficultyLabel } from './difficulty';
import { isHiddenCampaignMap, getHiddenMapBrowseHint } from '@/data/gameData/hiddenCampaignMaps';

export interface MapItemData {
  key: string;
  path: PathConfig;
  name: string;
  difficulty: string;
  description?: string;
  type: 'advanced' | 'mod';
  modName?: string;
  isLocked?: boolean;
}

interface MapRowProps {
  map: MapItemData;
  selected: boolean;
  onClick: () => void;
  /** 1 起算的 mono 編號 */
  index: number;
  /** 選中時在主區預覽用（縮圖不再進側欄） */
  showPreview?: boolean;
}

function MapRowComponent({ map, selected, onClick, index, showPreview = false }: MapRowProps) {
  const { t } = useTranslation();
  const c = t.pathSelection.campaign;
  const meta = getDifficultyMeta(map.difficulty);
  const difficultyLabel = getPathDifficultyLabel(map.difficulty, t);
  const stats = useMemo(
    () => calculatePathStats(map.path.waypoints, map.path.segments),
    [map.path],
  );
  const isLocked = !!map.isLocked;
  const hiddenHint = map.type === 'advanced' ? getHiddenMapBrowseHint(map.key) : null;

  return (
    <div>
      <RailItem
        index={index}
        active={selected}
        onClick={isLocked ? undefined : onClick}
        label={
          <span className={isLocked ? 'text-[var(--hl-ink-4)]' : undefined}>{map.name}</span>
        }
        right={
          <span className="flex shrink-0 items-center gap-1.5">
            {map.type === 'mod' && map.modName && (
              <span className="max-w-[52px] truncate border border-[var(--hl-line)] px-1 font-mono text-[9px] leading-[14px] text-[var(--hl-ink-4)]">
                mod
              </span>
            )}
            {isHiddenCampaignMap(map.key) && (
              <span className="border border-[var(--hl-caution)]/40 px-1 font-mono text-[9px] leading-[14px] text-[var(--hl-caution)]">
                9
              </span>
            )}
            <span
              className={`font-mono text-[10px] tabular-nums ${isLocked ? 'text-[var(--hl-ink-4)]' : meta.text}`}
              title={c.difficultyTitle.replace('{difficulty}', difficultyLabel)}
            >
              {meta.stars}/5
            </span>
          </span>
        }
      />

      {(selected || showPreview) && !isLocked && (
        <div className="border-b border-[var(--hl-line)] bg-[var(--hl-void-2)] px-2 py-2">
          <div className="flex items-center justify-between pb-1.5">
            <span className="hl-label">{c.pathLengthTitle}</span>
            <span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-2)]">
              {stats.length}
              <span className="ml-2 text-[var(--hl-ink-4)]">{c.turnCountTitle}</span>
              <span className="ml-1">{stats.turns}</span>
            </span>
          </div>
          <PathPreview pathConfig={map.path} size="small" className="w-full border border-[var(--hl-line)]" />
        </div>
      )}

      {hiddenHint && (
        <p className="border-b border-[var(--hl-line)] px-3 pb-2 text-[10px] leading-relaxed text-[var(--hl-caution)]/80">
          {hiddenHint}
        </p>
      )}
    </div>
  );
}

export const MapRow = memo(MapRowComponent, (prev, next) => {
  return (
    prev.map.key === next.map.key &&
    prev.map.isLocked === next.map.isLocked &&
    prev.selected === next.selected &&
    prev.index === next.index
  );
});

export default MapRow;
