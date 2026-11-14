/**
 * 圖鑑 · 地圖卡片（HARDLINE）
 *
 * 卡片＝Deck；hover 只換線色，不位移、不放大、不加陰影。
 */
import MapPreview from '@/components/ui/MapPreview';
import { Deck, Num } from '@/components/hl';
import type { MapInfo } from './EncyclopediaTypes';
import { playUiHover } from '@/services/audioService';

interface EncyclopediaMapCardLabels {
  viewDetails: string;
  builtInMap: string;
  pathPoints: string;
  forkSegments: string;
  source: string;
  mod: string;
  builtIn: string;
}

interface EncyclopediaMapCardProps {
  map: MapInfo;
  labels: EncyclopediaMapCardLabels;
  onClick: () => void;
}

export function EncyclopediaMapCard({ map, labels, onClick }: EncyclopediaMapCardProps) {
  const segmentCount = map.segments ? map.segments.length : 1;
  const sourceLabel = map.isModContent ? labels.mod : labels.builtIn;

  return (
    <Deck
      as="article"
      className="group flex cursor-pointer flex-col transition-colors duration-150 hover:border-[var(--arc-line-hot)]"
    >
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => playUiHover()}
        className="flex w-full flex-col text-left"
      >
        {/* 縮圖 */}
        <div className="relative flex h-[150px] items-center justify-center overflow-hidden border-b border-[var(--cn-line-soft)] bg-[var(--arc-void-2)]">
          <MapPreview map={map} width={330} height={240} className="opacity-55 transition-opacity duration-150 group-hover:opacity-80" />
          <span className="absolute right-2 top-2 flex gap-1">
            {map.isModContent && (
              <span className="border border-[var(--arc-gold-edge)] bg-[var(--arc-void)] px-1.5 py-0.5 font-mono text-[9px] uppercase leading-none tracking-[0.08em] text-[var(--arc-gold)]">
                mod
              </span>
            )}
            <span className="border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void)] px-1.5 py-0.5 font-mono text-[9px] uppercase leading-none tracking-[0.08em] text-[var(--arc-ink-2)]">
              {map.difficulty}
            </span>
          </span>
        </div>

        {/* 內容 */}
        <div className="flex flex-col gap-2 p-3">
          <h3 className="arc-title truncate text-[13.5px] font-medium leading-tight text-[var(--arc-ink)]">{map.name}</h3>
          <p className="line-clamp-2 text-[10.5px] leading-snug text-[var(--arc-ink-3)]">
            {map.description || labels.builtInMap}
          </p>

          <div className="mt-1 grid grid-cols-3 gap-0 border-t border-[var(--cn-line-soft)] pt-2">
            <CardStat label={labels.pathPoints} value={map.waypoints.length} />
            <CardStat label={labels.forkSegments} value={segmentCount} className="border-l border-[var(--cn-line-soft)] pl-2" />
            <CardStat label={labels.source} value={sourceLabel} className="border-l border-[var(--cn-line-soft)] pl-2" />
          </div>
        </div>
      </button>
    </Deck>
  );
}

function CardStat({
  label,
  value,
  className = '',
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`flex min-w-0 flex-col gap-1 ${className}`}>
      <span className="arc-label truncate">{label}</span>
      <Num value={value} tone="ink" size="sm" className="truncate leading-none" />
    </span>
  );
}
export default EncyclopediaMapCard;
