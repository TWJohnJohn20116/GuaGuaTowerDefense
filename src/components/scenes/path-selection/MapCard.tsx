/**
 * 選圖 · 地圖卡（卡牌牆的一格）
 *
 * 一張卡只回答三個問題：這是哪張圖（縮圖＋名稱）、多難（原生難度刻度）、多長（長度／轉折）。
 * 「這局怎麼打」全部留到簡報層——卡面上不放難度選擇與出擊鍵，
 * 否則四十張卡就會長出四十組無效的控制項。
 */

import { memo, useMemo } from 'react';
import { useTranslation } from '@/i18n';
import { Segments } from '@/components/hl';
import { playUiHover } from '@/services/audioService';
import { isHiddenCampaignMap, getHiddenMapBrowseHint } from '@/data/gameData/hiddenCampaignMaps';
import { calculatePathStats } from './utils';
import { getMapDifficultyLabel, getMapDifficultyMeta } from './difficultyMeta';
import { MapThumb } from './MapThumb';
import type { MapItemData } from './mapLibrary';

interface MapCardProps {
  map: MapItemData;
  /** 1 起算的顯示序號 */
  index: number;
  /** 是否為目前開啟中的那張（關層後回到牆上仍看得出剛才看哪張） */
  active: boolean;
  onOpen: (key: string) => void;
}

function MapCardComponent({ map, index, active, onOpen }: MapCardProps) {
  const { t } = useTranslation();
  const c = t.pathSelection.campaign;
  const meta = getMapDifficultyMeta(map.difficulty);
  const difficultyLabel = getMapDifficultyLabel(map.difficulty, t);
  const locked = !!map.isLocked;
  const hiddenHint = map.type === 'advanced' ? getHiddenMapBrowseHint(map.key) : null;
  const stats = useMemo(
    () => calculatePathStats(map.path.waypoints, map.path.segments),
    [map.path],
  );

  return (
    <button
      type="button"
      disabled={locked}
      aria-haspopup="dialog"
      aria-current={active ? 'true' : undefined}
      onClick={() => onOpen(map.key)}
      onMouseEnter={() => playUiHover()}
      title={locked ? c.levelLocked : c.difficultyTitle.replace('{difficulty}', difficultyLabel)}
      className={[
        'group relative flex w-full flex-col overflow-hidden text-left',
        'rounded-[var(--cn-r-lg)] border-[3px]',
        'transition-[transform,border-color,box-shadow,background-color] duration-[160ms]',
        active
          ? 'border-[var(--cn-coral)] bg-[var(--cn-card)] shadow-[0_6px_0_var(--cn-coral-deep)]'
          : 'border-[var(--cn-line)] bg-[var(--cn-card)] shadow-[0_5px_0_-1px_rgba(46,36,64,0.18)]',
        locked
          ? 'cursor-not-allowed opacity-60'
          : 'hover:-translate-y-0.5 hover:shadow-[0_8px_0_-1px_rgba(46,36,64,0.22)] active:translate-y-0.5 active:shadow-none',
      ].join(' ')}
    >
      {/* 縮圖：卡面的主要視覺，不畫場地色，只畫路線形狀 */}
      <div className="relative aspect-[16/9] w-full overflow-hidden border-b-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card-2)]">
        <MapThumb
          path={map.path}
          tone={active ? 'signal' : 'ink'}
          className="absolute inset-0 p-2 sm:p-2.5"
        />

        <span className="absolute left-2 top-2 rounded-[var(--cn-r-pill)] border-2 border-[var(--cn-line-soft)] bg-[var(--cn-card)] px-2 py-[1px] text-[10px] font-extrabold leading-[15px] text-[var(--cn-ink-2)]">
          {difficultyLabel}
        </span>

        <span className="absolute right-2 top-2 font-mono text-[10px] font-extrabold tabular-nums text-[var(--cn-ink-4)]">
          {String(index).padStart(2, '0')}
        </span>

        {isHiddenCampaignMap(map.key) && (
          <span
            className="absolute bottom-2 left-2 rounded-[4px] border-2 border-[var(--cn-sun)] bg-[var(--cn-sun-soft)] px-1.5 text-[9px] font-extrabold leading-[15px] text-[var(--cn-caution-text)]"
            title={c.levelLocked}
          >
            9
          </span>
        )}

        {locked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-[var(--cn-r-pill)] border-2 border-[var(--cn-line)] bg-[var(--cn-card)] px-2.5 py-1 text-[11px] font-extrabold text-[var(--cn-ink-2)]">
              {c.locked}
            </span>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-1.5 px-3 py-2.5">
        <span className="truncate text-[13px] font-black leading-tight text-[var(--cn-ink)] sm:text-[14px]">
          {map.name}
        </span>

        {map.type === 'mod' && map.modName && (
          <span className="truncate font-mono text-[9px] font-extrabold uppercase tracking-[0.06em] text-[var(--cn-ink-4)]">
            {map.modName}
          </span>
        )}
        {map.type === 'workshop' && map.modName && (
          <span className="truncate text-[10px] font-bold text-[var(--cn-ink-4)]">{map.modName}</span>
        )}

        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1.5">
            <Segments total={5} filled={meta.stars} size="sm" tone={meta.tone} />
            <span
              className={`hidden shrink-0 font-mono text-[10px] font-extrabold tabular-nums min-[420px]:inline ${meta.text}`}
            >
              {meta.stars}/5
            </span>
          </span>
          <span className="hidden shrink-0 font-mono text-[10px] font-bold tabular-nums text-[var(--cn-ink-4)] min-[420px]:inline">
            {stats.length} · {stats.turns}
          </span>
        </div>
      </div>

      {hiddenHint && (
        <p className="border-t-2 border-dashed border-[var(--cn-line-soft)] px-3 py-1.5 text-[10px] font-semibold leading-relaxed text-[var(--cn-caution-text)]">
          {hiddenHint}
        </p>
      )}
    </button>
  );
}

/** 只有「哪張卡、是否作用中、序號」會改變外觀；onOpen 由父層以 useCallback 穩定 */
export const MapCard = memo(MapCardComponent, (prev, next) => {
  return (
    prev.map.key === next.map.key &&
    prev.map.isLocked === next.map.isLocked &&
    prev.active === next.active &&
    prev.index === next.index &&
    prev.map.difficulty === next.map.difficulty &&
    prev.map.name === next.map.name
  );
});

export default MapCard;
