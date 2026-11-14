/**
 * 圖鑑 · 地圖詳情（HARDLINE 詳情欄）
 *
 * 336–376px 單欄：預覽圖、數值格、路徑分段、難度複雜度計量。
 */
import { Deck, Num, SegHead, StatCell, Meter } from '@/components/hl';
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
const SEGMENT_COLORS = ['#fbbf24', '#6f8cff', '#ff4b3e', '#35e08a', '#a78bfa', '#ffa62b', '#2dd4bf', '#f472b6'];

const panel = 'p-2.5';

export default function MapDetail({ selectedMap, onOpenFile }: MapDetailProps) {
  const { t } = useTranslation();

  if (!selectedMap) {
    return (
      <div className="flex min-h-[260px] h-full items-center justify-center px-4 text-center">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-[var(--arc-ink-4)]">
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
      <div className="flex flex-col gap-2 border-b border-[var(--cn-line-soft)] pb-3">
        <div className="flex items-center gap-2">
          <h3 className="arc-title min-w-0 flex-1 truncate text-[17px] font-semibold leading-tight tracking-[-0.01em] text-[var(--arc-ink)]">
            {selectedMap.name}
          </h3>
          {selectedMap.isModContent && (
            <span className="shrink-0 border border-[var(--arc-gold-edge)] px-1.5 py-0.5 font-mono text-[9.5px] uppercase leading-none tracking-[0.08em] text-[var(--arc-gold)]">
              mod
            </span>
          )}
        </div>
        <Deck tone="sunken" className="flex justify-center overflow-hidden p-2">
          <MapPreview map={selectedMap} width={gridCols * cellSize} height={gridRows * cellSize} />
        </Deck>
      </div>

      {selectedMap.isModContent && (
        <Deck className={`${panel} flex flex-col gap-1.5`}>
          <span className="arc-label">{t.encyclopedia.fromMod}</span>
          <span className="truncate text-[12px] text-[var(--arc-ink)]">{selectedMap.modName}</span>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <EncyclopediaModEditorLink modId={selectedMap.modId} contentTab="maps" itemId={selectedMap.id} />
            <EncyclopediaModWaveLink modId={selectedMap.modId} />
          </div>
        </Deck>
      )}

      <p className="text-[12px] leading-relaxed text-[var(--arc-ink-2)]">{selectedMap.description}</p>

      {/* 數值 */}
      <div className="flex flex-col gap-2">
        <SegHead label="stats" />
        <div className="grid grid-cols-2 gap-2">
          <Deck className={panel}>
            <StatCell
              label={<span className="flex items-center gap-1"><StarIcon className="h-3 w-3" />{t.encyclopedia.detailDifficulty}</span>}
              value={selectedMap.difficulty}
              tone="caution"
            />
          </Deck>
          <Deck className={panel}>
            <StatCell
              label={<span className="flex items-center gap-1"><PinIcon className="h-3 w-3" />{t.encyclopedia.pathPointsLabel}</span>}
              value={selectedMap.waypoints.length}
              tone="reach"
            />
          </Deck>
          <Deck className={panel}>
            <StatCell
              label={<span className="flex items-center gap-1"><MapIcon className="h-3 w-3" />{t.encyclopedia.detailMapSize}</span>}
              value={`${gridCols}x${gridRows}`}
              tone="vital"
            />
          </Deck>
          {hasSegments && (
            <Deck className={panel}>
              <StatCell
                label={<span className="flex items-center gap-1"><RefreshIcon className="h-3 w-3" />{t.encyclopedia.detailForks}</span>}
                value={forkCount}
                tone="signal"
              />
            </Deck>
          )}
        </div>
      </div>

      {/* 路徑分段 */}
      {hasSegments && (
        <div className="flex flex-col gap-2">
          <SegHead
            label={t.encyclopedia.detailPathSegments}
            right={<Num value={selectedMap.segments!.length} tone="muted" size="sm" className="font-mono tabular-nums" />}
          />
          {selectedMap.segments!.map((seg, idx) => {
            const color = SEGMENT_COLORS[idx % SEGMENT_COLORS.length];
            const isFork = seg.next.length > 1;
            const isEnd = seg.next.length === 0;
            return (
              <div key={seg.id} className="flex items-center gap-2 border-[3px] border-[var(--cn-line-soft)] px-2.5 py-2">
                <span className="h-2 w-2 shrink-0" style={{ backgroundColor: color }} />
                <span className="w-10 shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--arc-ink-3)]">
                  {seg.id}
                </span>
                <Num
                  value={seg.waypoints.length}
                  unit={t.encyclopedia.detailPointsUnit}
                  tone="ink"
                  size="sm"
                  className="min-w-0 flex-1 font-mono tabular-nums"
                />
                {isFork && (
                  <span className="flex shrink-0 items-center gap-1 border border-[var(--arc-reach)] px-1.5 py-0.5 font-mono text-[9px] uppercase leading-none tracking-[0.08em] text-[var(--arc-reach)]">
                    <RefreshIcon className="h-2.5 w-2.5" />
                    {t.encyclopedia.detailSegmentFork}
                  </span>
                )}
                {isEnd && (
                  <span className="flex shrink-0 items-center gap-1 border border-[var(--arc-alert)] px-1.5 py-0.5 font-mono text-[9px] uppercase leading-none tracking-[0.08em] text-[var(--arc-alert)]">
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
          right={<span className="font-mono text-[9.5px] text-[var(--arc-ink-2)]">{complexityLabel}</span>}
        />
        <Meter value={complexityPct} max={100} tone="reach" />
        <div className="flex items-center gap-1.5 text-[var(--arc-ink-4)]">
          <ConstructionIcon className="h-3 w-3" />
          <Num value={Math.round(complexityPct)} unit="%" tone="muted" size="sm" className="font-mono tabular-nums" />
        </div>
      </div>

      {onOpenFile && (
        <div className="border-t border-[var(--cn-line-soft)] pt-3">
          <EncyclopediaSourceLinks tab="maps" itemId={selectedMap.id} onOpenFile={onOpenFile} />
        </div>
      )}
    </div>
  );
}
