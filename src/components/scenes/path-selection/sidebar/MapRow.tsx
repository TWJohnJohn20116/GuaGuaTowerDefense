/**
 * 地圖側欄 · 列表項目（CANDY POP 帳本列）
 *
 * 這裡刻意不用 RailItem：那顆是「卡片」，一列一張卡會讓 39 張地圖看起來
 * 像一堆漂浮的 pill，且選中的鵝黃底與主區唯一的珊瑚強調色打架。
 *
 * 改成帳本列：等寬序號、左緣 3px 訊號條、列間細線、右側兩個固定寬欄位
 * （路徑長度、難度刻度）——數字縱向對齊，眼睛可以沿著欄位往下掃。
 */

import { memo, useMemo } from 'react';
import { useTranslation } from '@/i18n';
import type { PathConfig } from '@/types/game';
import { playUiHover } from '@/services/audioService';
import { calculatePathStats } from '../utils';
import { getDifficultyMeta, getPathDifficultyLabel } from './difficulty';
import { isHiddenCampaignMap, getHiddenMapBrowseHint } from '@/data/gameData/hiddenCampaignMaps';

export interface MapItemData {
  key: string;
  path: PathConfig;
  name: string;
  difficulty: string;
  description?: string;
  type: 'advanced' | 'mod' | 'workshop';
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
  const stats = useMemo(
    () => calculatePathStats(map.path.waypoints, map.path.segments),
    [map.path],
  );

  return (
    <div className="border-b border-[var(--cn-line-soft)] last:border-b-0">
      <button
        type="button"
        aria-current={selected ? 'true' : undefined}
        disabled={isLocked}
        onClick={onClick}
        onMouseEnter={() => playUiHover()}
        title={c.difficultyTitle.replace('{difficulty}', difficultyLabel)}
        className={[
          'relative flex w-full items-center gap-2 py-[7px] pl-[10px] pr-2 text-left',
          'transition-colors duration-[120ms]',
          selected ? 'bg-[var(--cn-coral-soft)]' : 'hover:bg-[var(--cn-card-2)]',
          isLocked ? 'cursor-not-allowed opacity-50' : '',
        ].join(' ')}
      >
        {/* 左緣訊號條：選中才亮，其餘保持透明以維持文字水平基準 */}
        <span
          aria-hidden="true"
          className={`absolute left-0 top-0 h-full w-[3px] ${
            selected ? 'bg-[var(--cn-coral)]' : 'bg-transparent'
          }`}
        />

        <span className="w-[18px] shrink-0 font-mono text-[10px] font-extrabold tabular-nums text-[var(--cn-ink-4)]">
          {String(index).padStart(2, '0')}
        </span>

        <span
          className={[
            'min-w-0 flex-1 truncate text-[13px] leading-tight',
            selected ? 'font-black text-[var(--cn-ink)]' : 'font-bold text-[var(--cn-ink-2)]',
          ].join(' ')}
        >
          {map.name}
        </span>

        {map.type === 'mod' && map.modName && (
          <span
            className="shrink-0 rounded-[4px] border border-[var(--cn-line-mid)] px-1 font-mono text-[8.5px] font-extrabold uppercase leading-[13px] tracking-[0.04em] text-[var(--cn-ink-4)]"
            title={map.modName}
          >
            mod
          </span>
        )}

        {isHiddenCampaignMap(map.key) && (
          <span
            className="shrink-0 rounded-[4px] border border-[var(--cn-sun)] bg-[var(--cn-sun-soft)] px-1 font-mono text-[8.5px] font-extrabold leading-[13px] text-[var(--cn-caution-text)]"
            title={c.levelLocked}
          >
            9
          </span>
        )}

        <span className="w-[22px] shrink-0 text-right font-mono text-[10px] tabular-nums text-[var(--cn-ink-4)]">
          {stats.length}
        </span>

        <span
          className={`w-[26px] shrink-0 text-right font-mono text-[10px] font-extrabold tabular-nums ${
            isLocked ? 'text-[var(--cn-ink-4)]' : meta.text
          }`}
        >
          {meta.stars}/5
        </span>
      </button>

      {hiddenHint && (
        <p className="border-t border-dashed border-[var(--cn-line-soft)] px-3 py-1.5 text-[10px] font-semibold leading-relaxed text-[var(--cn-caution-text)]">
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
