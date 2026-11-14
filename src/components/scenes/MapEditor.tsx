/**
 * 地圖編輯器 · 主入口 — HARDLINE Console
 *
 *  ┌────────────────────────────────────────────────────────┐
 *  │ TopBar 52px  +  h-11 工具列帶                           │
 *  ├──────────────┬──────────────────────────┬──────────────┤
 *  │ Rail 212px   │ 畫布（1px 外框 + 深底）   │ 詳情 336px   │
 *  │ 分類 / 路段  │                          │              │
 *  └──────────────┴──────────────────────────┴──────────────┘
 *  ExportModal — 點「匯出」時顯示
 */

import { SceneShell } from '@/components/ui/SceneShell';
import { Num, Rail, RailItem } from '@/components/hl';
import { useTranslation } from '@/i18n';
import type { MapCategory } from '@/types/game';
import {
  MapEditorCanvas,
  MapEditorToolbar,
  MapEditorPanel,
  ExportModal,
  useMapEditorState,
} from './map-editor';

export default function MapEditor({ embedded = false }: { embedded?: boolean }) {
  const s = useMapEditorState();
  const { t } = useTranslation();

  const categoryRows: { id: MapCategory; label: string }[] = [
    { id: 'normal', label: t.mapEditorExt.normalMap },
    { id: 'advanced', label: t.mapEditorExt.advancedMap },
  ];

  return (
    <SceneShell scrollable={false} showGrid={false}>
      <div className="relative z-10 flex h-full w-full flex-col bg-[var(--arc-void)]">
        <MapEditorToolbar
          embedded={embedded}
          editMode={s.editMode}
          onEditModeChange={s.setEditMode}
          onUndo={s.undoLastPoint}
          onClear={s.clearPath}
          onExport={s.exportMap}
          canExport={s.waypoints.length >= 2}
        />

        <div className="flex min-h-0 flex-1">
          {/* 左軌：分類 + 路段 */}
          <Rail
            label={t.mapEditorExt.mapCategory}
            foot={
              <div className="flex items-center justify-between">
                <span className="arc-label">{t.mapEditor.waypointList}</span>
                <Num value={String(s.waypoints.length).padStart(2, '0')} tone="reach" size="sm" className="font-mono tabular-nums" />
              </div>
            }
          >
            {categoryRows.map((row, i) => (
              <RailItem
                key={row.id}
                index={i + 1}
                label={row.label}
                active={s.mapCategory === row.id}
                onClick={() => s.setMapCategory(row.id)}
              />
            ))}

            {s.mapCategory === 'advanced' && (
              <>
                <div className="px-3 pb-1 pt-3">
                  <span className="arc-label">{t.mapEditorExt.segmentManagement}</span>
                </div>
                {s.segments.map((seg, i) => (
                  <RailItem
                    key={seg.id}
                    index={String(i + 1)}
                    label={seg.id}
                    active={s.activeSegmentId === seg.id}
                    onClick={() => s.setActiveSegmentId(seg.id)}
                    right={
                      <span className="font-mono text-[9.5px] tabular-nums text-[var(--arc-ink-4)]">
                        {seg.waypoints.length}
                      </span>
                    }
                  />
                ))}
              </>
            )}
          </Rail>

          {/* 畫布：1px 外框、內部深底、不加陰影 */}
          <main className="min-w-0 flex-1 bg-[var(--arc-void-2)] p-3">
            <div className="h-full w-full overflow-hidden border border-[var(--arc-line-strong)] bg-[var(--arc-void-2)]">
              <MapEditorCanvas
                waypoints={s.waypoints}
                setWaypoints={s.setWaypoints}
                editMode={s.editMode}
              />
            </div>
          </main>

          <MapEditorPanel
            mapCategory={s.mapCategory}
            onMapCategoryChange={s.setMapCategory}
            segments={s.segments}
            activeSegmentId={s.activeSegmentId}
            onActiveSegmentChange={s.setActiveSegmentId}
            onAddSegment={s.addSegment}
            onRemoveSegment={s.removeSegment}
            onUpdateSegmentNext={s.updateSegmentNext}
            mapName={s.mapName}
            onMapNameChange={s.setMapName}
            mapDescription={s.mapDescription}
            onMapDescriptionChange={s.setMapDescription}
            difficulty={s.difficulty}
            onDifficultyChange={s.setDifficulty}
            onLoadTemplate={s.loadTemplate}
            waypoints={s.waypoints}
            onRemoveWaypoint={s.removeWaypoint}
          />
        </div>

        <ExportModal
          open={s.showExportModal}
          code={s.exportedCode}
          onClose={() => s.setShowExportModal(false)}
        />
      </div>
    </SceneShell>
  );
}
