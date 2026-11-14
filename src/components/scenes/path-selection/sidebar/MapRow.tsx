/**
 * 地圖側欄 · 列表項目（CANDY POP）
 *
 * 一行一列：編號圓牌 + 名稱 + 右側數據（路徑長度、難度刻度）。
 * 選中時不再於列內展開預覽——主區已有大張預覽，列內再畫一個 canvas
 * 會讓清單在點選瞬間被推歪，也讓同一張圖被畫兩次。
 */

import { memo } from 'react';
import { useTranslation } from '@/i18n';
import type { PathConfig } from '@/types/game';
import { RailItem } from '@/components/hl';
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
  /** 1 起算的編號 */
  index: number;
}

function MapRowComponent({ map, selected, onClick, index }: MapRowProps) {
  const { t } = useTranslation();
  const c = t.pathSelection.campaign;
  const meta = getDifficultyMeta(map.difficulty);
  const difficultyLabel = getPathDifficultyLabel(map.difficulty, t);
  const isLocked = !!map.isLocked;
  const hiddenHint = map.type === 'advanced' ? getHiddenMapBrowseHint(map.key) : null;

  return (
    <div>
      <RailItem
        index={index}
        active={selected}
        onClick={isLocked ? undefined : onClick}
        label={
          <span className={isLocked ? 'text-[var(--cn-ink-4)]' : undefined}>{map.name}</span>
        }
        right={
          <span className="flex shrink-0 items-center gap-1.5">
            {map.type === 'mod' && map.modName && (
              <span
                className="max-w-[52px] truncate rounded-[var(--cn-r-pill)] border-2 border-[var(--cn-line-soft)] px-1.5 font-mono text-[9px] font-extrabold leading-[14px] text-[var(--cn-ink-4)]"
                title={map.modName}
              >
                mod
              </span>
            )}
            {isHiddenCampaignMap(map.key) && (
              <span className="rounded-[var(--cn-r-pill)] border-2 border-[var(--cn-sun)] bg-[var(--cn-sun-soft)] px-1.5 font-mono text-[9px] font-extrabold leading-[14px] text-[var(--cn-sun-deep)]">
                9
              </span>
            )}
            <span
              className={`font-mono text-[10px] font-extrabold tabular-nums ${isLocked ? 'text-[var(--cn-ink-4)]' : meta.text}`}
              title={c.difficultyTitle.replace('{difficulty}', difficultyLabel)}
            >
              {meta.stars}/5
            </span>
          </span>
        }
      />

      {hiddenHint && (
        <p className="border-b border-[var(--cn-line-soft)] px-3 pb-2 text-[10px] font-semibold leading-relaxed text-[var(--cn-sun-deep)]">
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
