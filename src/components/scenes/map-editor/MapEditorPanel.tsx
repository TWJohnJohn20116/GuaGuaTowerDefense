/**
 * 地圖編輯器 · 右側詳情欄 — HARDLINE 336px
 *
 * 每一段都是 SegHead（mono 標籤 + 1px 線）＋ 密集列；不做卡片堆疊，不加陰影。
 */

import type { GridPosition, MapCategory, PathSegment } from '@/types/game';
import type React from 'react';
import { useTranslation } from '@/i18n';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { CustomInput } from '@/components/ui/CustomInput';
import { XIcon } from '@/components/ui/Icons';
import { SegHead, Chip, Btn, Num, Empty } from '@/components/hl';

interface MapEditorPanelProps {
  mapCategory: MapCategory;
  onMapCategoryChange: (c: MapCategory) => void;
  segments: PathSegment[];
  activeSegmentId: string | null;
  onActiveSegmentChange: (id: string | null) => void;
  onAddSegment: () => void;
  onRemoveSegment: (id: string) => void;
  onUpdateSegmentNext: (segId: string, targetId: string, add: boolean) => void;
  mapName: string;
  onMapNameChange: (v: string) => void;
  mapDescription: string;
  onMapDescriptionChange: (v: string) => void;
  difficulty: string;
  onDifficultyChange: (v: string) => void;
  onLoadTemplate: (name: string) => void;
  waypoints: GridPosition[];
  onRemoveWaypoint: (index: number) => void;
}

function Section({
  title,
  right,
  children,
}: {
  title: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-[var(--cn-line-soft)] px-3 py-2.5">
      <SegHead label={title} right={right} className="mb-2" />
      {children}
    </section>
  );
}

function SegmentsSection({
  segments,
  activeSegmentId,
  onActiveSegmentChange,
  onAddSegment,
  onRemoveSegment,
  onUpdateSegmentNext,
}: Pick<
  MapEditorPanelProps,
  'segments' | 'activeSegmentId' | 'onActiveSegmentChange' | 'onAddSegment' | 'onRemoveSegment' | 'onUpdateSegmentNext'
>) {
  const { t } = useTranslation();
  const activeSegment = segments.find((s) => s.id === activeSegmentId);

  return (
    <Section
      title={t.mapEditorExt.segmentManagement}
      right={
        <Btn size="sm" variant="line" onClick={onAddSegment}>
          {t.mapEditorExt.addNew}
        </Btn>
      }
    >
      <div className="flex max-h-40 flex-col overflow-y-auto border-[3px] border-[var(--cn-line-soft)]">
        {segments.map((seg, i) => {
          const isActive = activeSegmentId === seg.id;
          return (
            <div
              key={seg.id}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') onActiveSegmentChange(seg.id); }}
              onClick={() => onActiveSegmentChange(seg.id)}
              className={[
                'relative flex cursor-pointer items-center gap-2 border-b border-[var(--cn-line-soft)] px-2 py-1.5 last:border-b-0 transition-colors',
                isActive ? 'bg-[var(--arc-deck-2)]' : 'hover:bg-[var(--arc-deck-2)]',
              ].join(' ')}
            >
              <span
                className={[
                  'absolute left-0 top-0 h-full w-[2px]',
                  isActive ? 'bg-[var(--arc-gold)]' : 'bg-transparent',
                ].join(' ')}
              />
              <span className={['w-4 shrink-0 font-mono text-[9.5px]', isActive ? 'text-[var(--arc-gold)]' : 'text-[var(--arc-ink-4)]'].join(' ')}>
                {i === 0 ? 'S' : String(i).padStart(2, '0')}
              </span>
              <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-[var(--arc-ink-2)]">{seg.id}</span>
              <Num
                value={seg.waypoints.length}
                unit="pt"
                tone="muted"
                size="sm"
                className="shrink-0 font-mono tabular-nums"
              />
              <button
                type="button"
                className="shrink-0 px-0.5 text-[var(--arc-ink-4)] transition-colors hover:text-[var(--arc-alert)]"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveSegment(seg.id);
                }}
              >
                <XIcon className="h-3 w-3" />
              </button>
            </div>
          );
        })}
        {segments.length === 0 && (
          <p className="px-2 py-2 text-center text-[10.5px] text-[var(--arc-ink-4)]">
            {t.mapEditorExt.clickAddFirstSegment}
          </p>
        )}
      </div>

      {activeSegment && (
        <div className="mt-2 border-t border-[var(--cn-line-soft)] pt-2">
          <p className="arc-label mb-1.5">{t.mapEditorExt.nextSegmentFork}</p>
          <div className="flex flex-wrap gap-1">
            {segments
              .filter((s) => s.id !== activeSegmentId)
              .map((s) => (
                <Chip
                  key={s.id}
                  active={activeSegment.next.includes(s.id)}
                  onClick={() =>
                    onUpdateSegmentNext(activeSegmentId!, s.id, !activeSegment.next.includes(s.id))
                  }
                >
                  {s.id}
                </Chip>
              ))}
            {segments.length <= 1 && (
              <p className="text-[10.5px] text-[var(--arc-ink-4)]">{t.mapEditorExt.needMultipleSegments}</p>
            )}
          </div>
        </div>
      )}
    </Section>
  );
}

function MapInfoSection({
  mapName,
  onMapNameChange,
  mapDescription,
  onMapDescriptionChange,
  difficulty,
  onDifficultyChange,
}: Pick<
  MapEditorPanelProps,
  'mapName' | 'onMapNameChange' | 'mapDescription' | 'onMapDescriptionChange' | 'difficulty' | 'onDifficultyChange'
>) {
  const { t } = useTranslation();
  return (
    <Section title={t.mapEditor.mapInfo}>
      <div className="flex flex-col gap-2.5">
        <CustomInput
          label={t.mapEditor.mapName}
          value={mapName}
          onChange={(e) => onMapNameChange(e.target.value)}
          size="sm"
          placeholder={t.mapEditorExt.enterMapName}
        />
        <CustomInput
          label={t.mapEditor.mapDescription}
          value={mapDescription}
          onChange={(e) => onMapDescriptionChange(e.target.value)}
          size="sm"
          placeholder={t.mapEditorExt.enterMapDescription}
        />
        <div>
          <span className="arc-label mb-1 block">{t.mapEditor.difficulty}</span>
          <CustomSelect
            value={difficulty}
            onChange={onDifficultyChange}
            options={[
              { value: 'veryEasy', label: t.pathSelection.difficulty.veryEasy },
              { value: 'easy', label: t.pathSelection.difficulty.easy },
              { value: 'medium', label: t.pathSelection.difficulty.medium },
              { value: 'hard', label: t.pathSelection.difficulty.hard },
            ]}
            size="sm"
          />
        </div>
      </div>
    </Section>
  );
}

function TemplatesSection({ onLoadTemplate }: { onLoadTemplate: (name: string) => void }) {
  const { t } = useTranslation();
  return (
    <Section title={t.mapEditor.pathTemplates}>
      <div className="grid grid-cols-2 gap-1">
        {([
          ['empty', t.mapEditor.templateEmpty],
          ['straight', t.mapEditor.templateStraight],
          ['sShape', t.mapEditor.templateS],
          ['uShape', t.mapEditor.templateU],
        ] as const).map(([k, label]) => (
          <Btn key={k} size="sm" variant="line" block onClick={() => onLoadTemplate(k)}>
            {label}
          </Btn>
        ))}
      </div>
    </Section>
  );
}

function WaypointsSection({
  waypoints,
  onRemoveWaypoint,
}: Pick<MapEditorPanelProps, 'waypoints' | 'onRemoveWaypoint'>) {
  const { t } = useTranslation();
  return (
    <Section
      title={`${t.mapEditor.waypointList} (${waypoints.length})`}
      right={<Num value={String(waypoints.length).padStart(2, '0')} size="sm" tone="muted" />}
    >
      {waypoints.length === 0 ? (
        <Empty title={t.mapEditor.clickToAdd} className="py-6" />
      ) : (
        <div className="flex max-h-48 flex-col overflow-y-auto border-[3px] border-[var(--cn-line-soft)]">
          {waypoints.map((wp, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-2 border-b border-[var(--cn-line-soft)] px-2 py-1.5 last:border-b-0"
            >
              <span className="flex min-w-0 items-center gap-2 font-mono text-[11px] tabular-nums arc-num">
                <span
                  className={
                    i === 0
                      ? 'text-[var(--arc-vital)]'
                      : i === waypoints.length - 1
                        ? 'text-[var(--arc-alert)]'
                        : 'text-[var(--arc-reach)]'
                  }
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-[var(--arc-ink-2)]">
                  {wp.col}, {wp.row}
                </span>
              </span>
              <button
                type="button"
                className="shrink-0 text-[var(--arc-ink-4)] transition-colors hover:text-[var(--arc-alert)]"
                onClick={() => onRemoveWaypoint(i)}
              >
                <XIcon className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

function InstructionsSection() {
  const { t } = useTranslation();
  return (
    <Section title={t.mapEditor.instructions}>
      <ul className="flex flex-col gap-1 text-[10.5px] leading-relaxed text-[var(--arc-ink-3)]">
        {t.mapEditor.instructionList.map((item, i) => (
          <li key={i} className="flex gap-1.5">
            <span className="font-mono text-[var(--arc-ink-4)]">{String(i + 1).padStart(2, '0')}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function MapEditorPanel(props: MapEditorPanelProps) {
  const { t } = useTranslation();
  return (
    <aside className="flex w-[336px] shrink-0 flex-col overflow-hidden border-l border-[var(--cn-line-soft)] bg-[var(--arc-deck)]">
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-[var(--cn-line-soft)] px-3">
        <span className="arc-label whitespace-nowrap">{t.mapEditorExt.mapCategory}</span>
        <span className="h-px flex-1 bg-[var(--arc-line)]" />
        <div className="flex gap-1">
          <Chip
            active={props.mapCategory === 'normal'}
            onClick={() => props.onMapCategoryChange('normal' as MapCategory)}
          >
            {t.mapEditorExt.normalMap}
          </Chip>
          <Chip
            active={props.mapCategory === 'advanced'}
            onClick={() => props.onMapCategoryChange('advanced' as MapCategory)}
          >
            {t.mapEditorExt.advancedMap}
          </Chip>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {props.mapCategory === 'advanced' && (
          <SegmentsSection
            segments={props.segments}
            activeSegmentId={props.activeSegmentId}
            onActiveSegmentChange={props.onActiveSegmentChange}
            onAddSegment={props.onAddSegment}
            onRemoveSegment={props.onRemoveSegment}
            onUpdateSegmentNext={props.onUpdateSegmentNext}
          />
        )}

        <MapInfoSection
          mapName={props.mapName}
          onMapNameChange={props.onMapNameChange}
          mapDescription={props.mapDescription}
          onMapDescriptionChange={props.onMapDescriptionChange}
          difficulty={props.difficulty}
          onDifficultyChange={props.onDifficultyChange}
        />

        <TemplatesSection onLoadTemplate={props.onLoadTemplate} />

        <WaypointsSection waypoints={props.waypoints} onRemoveWaypoint={props.onRemoveWaypoint} />

        <InstructionsSection />
      </div>
    </aside>
  );
}

export default MapEditorPanel;
