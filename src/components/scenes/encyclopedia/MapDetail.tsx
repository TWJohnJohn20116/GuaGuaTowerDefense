/**
 * 圖鑑 · 地圖詳情（HARDLINE 詳情欄）
 *
 * 336–376px 單欄：預覽圖、數值格、路徑分段、難度複雜度計量。
 */
import { SegHead, StatCell, Meter } from '@/components/hl';
import { StarIcon, MapIcon, PinIcon, RefreshIcon, ConstructionIcon, TargetIcon } from '@/components/ui/Icons';
import type { MapInfo } from './EncyclopediaTypes';
import { EncyclopediaSourceLinks } from './EncyclopediaSourceLinks';
import { EncyclopediaModEditorLink } from './EncyclopediaModEditorLink';
import { EncyclopediaModWaveLink } from './EncyclopediaModWaveLink';
import MapPreview from '@/components/ui/MapPreview';
import { useTranslation } from '@/i18n';

interface MapDetailProps {
  selectedMap: MapInfo | undefined;
  onOpenFile?: (path: string) => void;
}

/** 分段色只用來分辨路段，不是主題色 */
const SEGMENT_COLORS = ['#fbbf24', '#6fa8ff', '#ff4b3e', '#38e08f', '#a78bfa', '#ffb627', '#2dd4bf', '#f472b6'];

const panel = 'border border-[var(--hl-line)] bg-[var(--hl-deck)] p-2.5';

export default function MapDetail({ selectedMap, onOpenFile }: MapDetailProps) {
  const { t } = useTranslation();

  if (!selectedMap) {
    return (
      <div className="flex min-h-[260px] h-full items-center justify-center px-4 text-center">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-[var(--hl-ink-4)]">
          {t.encyclopedia.selectMapHint}
        </span>
      </div>
    );
  }

  const gridRows = 11;
  const gridCols = 15;
  const cellSize = 18;
  const hasSegments = selectedMap.segments && selectedMap.segments.length > 0;
  const forkCount = hasSegments ? selectedMap.segments!.filter(s => s.next.length > 1).length : 0;

  const complexityPct = Math.min(100, hasSegments ? (forkCount + 1) * 25 : selectedMap.waypoints.length * 5);
  const complexityLabel = hasSegments
    ? (forkCount >= 3 ? t.encyclopedia.detailComplexityVeryHigh : forkCount >= 2 ? t.encyclopedia.detailComplexityHigh : t.encyclopedia.detailComplexityMedium)
    : selectedMap.waypoints.length > 10
      ? t.encyclopedia.detailComplexityHigh
      : selectedMap.waypoints.length > 5
        ? t.encyclopedia.detailComplexityMedium
        : t.encyclopedia.detailComplexityLow;

  return (
    <div className="flex flex-col gap-4">
      {/* Hero */}
      <div className="flex flex-col gap-2 border-b border-[var(--hl-line)] pb-3">
        <div className="flex items-center gap-2">
          <h3 className="min-w-0 flex-1 truncate text-[17px] font-semibold leading-tight tracking-[-0.01em] text-[var(--hl-ink)]">
            {selectedMap.name}
          </h3>
          {selectedMap.isModContent && (
            <span className="shrink-0 border border-[var(--hl-signal-edge)] px-1.5 py-0.5 font-mono text-[9.5px] uppercase leading-none tracking-[0.08em] text-[var(--hl-signal)]">
              mod
            </span>
          )}
        </div>
        <div className="flex justify-center overflow-hidden border border-[var(--hl-line)] bg-[var(--hl-void-2)] p-2">
          <MapPreview map={selectedMap} width={gridCols * cellSize} height={gridRows * cellSize} />
        </div>
      </div>

      {selectedMap.isModContent && (
        <div className={`${panel} flex flex-col gap-1.5`}>
          <span className="hl-label">{t.encyclopedia.fromMod}</span>
          <span className="truncate text-[12px] text-[var(--hl-ink)]">{selectedMap.modName}</span>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <EncyclopediaModEditorLink modId={selectedMap.modId} contentTab="maps" itemId={selectedMap.id} />
            <EncyclopediaModWaveLink modId={selectedMap.modId} />
          </div>
        </div>
      )}

      <p className="text-[12px] leading-relaxed text-[var(--hl-ink-2)]">{selectedMap.description}</p>

      {/* 數值 */}
      <div className="flex flex-col gap-2">
        <SegHead label="stats" />
        <div className="grid grid-cols-2 gap-2">
          <div className={panel}>
            <StatCell
              label={<span className="flex items-center gap-1"><StarIcon className="h-3 w-3" />{t.encyclopedia.detailDifficulty}</span>}
              value={selectedMap.difficulty}
              tone="caution"
            />
          </div>
          <div className={panel}>
            <StatCell
              label={<span className="flex items-center gap-1"><PinIcon className="h-3 w-3" />{t.encyclopedia.pathPointsLabel}</span>}
              value={selectedMap.waypoints.length}
              tone="reach"
            />
          </div>
          <div className={panel}>
            <StatCell
              label={<span className="flex items-center gap-1"><MapIcon className="h-3 w-3" />{t.encyclopedia.detailMapSize}</span>}
              value={`${gridCols}x${gridRows}`}
              tone="vital"
            />
          </div>
          {hasSegments && (
            <div className={panel}>
              <StatCell
                label={<span className="flex items-center gap-1"><RefreshIcon className="h-3 w-3" />{t.encyclopedia.detailForks}</span>}
                value={forkCount}
                tone="signal"
              />
            </div>
          )}
        </div>
      </div>

      {/* 路徑分段 */}
      {hasSegments && (
        <div className="flex flex-col gap-2">
          <SegHead
            label={t.encyclopedia.detailPathSegments}
            right={<span className="font-mono text-[9.5px] tabular-nums text-[var(--hl-ink-4)]">{selectedMap.segments!.length}</span>}
          />
          {selectedMap.segments!.map((seg, idx) => {
            const color = SEGMENT_COLORS[idx % SEGMENT_COLORS.length];
            const isFork = seg.next.length > 1;
            const isEnd = seg.next.length === 0;
            return (
              <div key={seg.id} className="flex items-center gap-2 border border-[var(--hl-line)] px-2.5 py-2">
                <span className="h-2 w-2 shrink-0" style={{ backgroundColor: color }} />
                <span className="w-10 shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--hl-ink-3)]">
                  {seg.id}
                </span>
                <span className="min-w-0 flex-1 font-mono text-[11px] tabular-nums text-[var(--hl-ink-2)]">
                  {seg.waypoints.length} {t.encyclopedia.detailPointsUnit}
                </span>
                {isFork && (
                  <span className="flex shrink-0 items-center gap-1 border border-[var(--hl-reach)] px-1.5 py-0.5 font-mono text-[9px] uppercase leading-none tracking-[0.08em] text-[var(--hl-reach)]">
                    <RefreshIcon className="h-2.5 w-2.5" />
                    {t.encyclopedia.detailSegmentFork}
                  </span>
                )}
                {isEnd && (
                  <span className="flex shrink-0 items-center gap-1 border border-[var(--hl-alarm)] px-1.5 py-0.5 font-mono text-[9px] uppercase leading-none tracking-[0.08em] text-[var(--hl-alarm)]">
                    <TargetIcon className="h-2.5 w-2.5" />
                    {t.encyclopedia.detailSegmentEnd}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 路徑複雜度 */}
      <div className="flex flex-col gap-2">
        <SegHead
          label={t.encyclopedia.detailPathComplexity}
          right={<span className="font-mono text-[9.5px] text-[var(--hl-ink-2)]">{complexityLabel}</span>}
        />
        <Meter value={complexityPct} max={100} tone="reach" />
        <div className="flex items-center gap-1.5 text-[var(--hl-ink-4)]">
          <ConstructionIcon className="h-3 w-3" />
          <span className="font-mono text-[9.5px] tabular-nums">
            {Math.round(complexityPct)}%
          </span>
        </div>
      </div>

      {onOpenFile && (
        <div className="border-t border-[var(--hl-line)] pt-3">
          <EncyclopediaSourceLinks tab="maps" itemId={selectedMap.id} onOpenFile={onOpenFile} />
        </div>
      )}
    </div>
  );
}
