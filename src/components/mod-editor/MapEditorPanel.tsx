/**
 * Mod 地圖卡 · 編輯面板 — HARDLINE
 *
 * 一張 `Deck`：h-11 標題帶（mono 編號 + 動作）→ 1px 外框的畫布縮圖 → 可捲動表單。
 * 沒有漸層遮罩、沒有毛玻璃、沒有陰影。
 */
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { CustomMapData } from '@/types/game';
import { FullscreenMapEditor } from './FullscreenMapEditor';
import { MapPathPreview } from './MapPathPreview';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { useTranslation } from '@/i18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';
import { EditIcon, CopyIcon, TrashIcon, MapIcon, PlayIcon, PinIcon, RefreshIcon, DocumentIcon, BoxIcon } from '@/components/ui/Icons';
import { applyMapQuickTool, MAP_QUICK_TOOL_IDS, type MapQuickTool } from './mapEditorPanelTools';
import { MapEditorShortcutHints } from './MapEditorShortcutHints';
import { Deck, SegHead, Btn, StatCell, Num } from '@/components/hl';

function quickToolLabel(m: ReturnType<typeof useTranslation>['t']['modEditorExt'], id: MapQuickTool): string {
  switch (id) {
    case 'mirrorH': return m.mapQtMirrorH;
    case 'mirrorV': return m.mapQtMirrorV;
    case 'dupPath': return m.mapQtDupPath;
    case 'clearBlocked': return m.mapQtClearBlock;
  }
}

export const MapEditorPanel = ({
  map,
  onChange,
  onDelete,
  onDuplicate,
}: {
  map: CustomMapData;
  onChange: (map: CustomMapData) => void;
  onDelete: () => void;
  onDuplicate?: () => void;
}) => {
  const { t } = useTranslation();
  const m = t.modEditorExt;
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toolIcon = (id: MapQuickTool) => {
    switch (id) {
      case 'mirrorH': return DocumentIcon;
      case 'mirrorV': return RefreshIcon;
      case 'dupPath': return CopyIcon;
      case 'clearBlocked': return BoxIcon;
    }
  };

  return (
    <>
      <div
        className="group relative h-[380px]"
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest('input') || target.closest('textarea') || target.closest('button') || target.closest('.custom-select-container')) {
            return;
          }
          setIsFullscreen(true);
        }}
      >
      <Deck className="relative flex h-full cursor-pointer flex-col overflow-hidden transition-colors duration-150 hover:border-[var(--hl-line-strong)]">
        {/* 標題帶：mono 編號 + 節點數，右側動作組 */}
        <div className="flex h-11 shrink-0 items-center gap-2 border-b border-[var(--hl-line)] px-3">
          <MapIcon className="h-3.5 w-3.5 shrink-0 text-[var(--hl-ink-3)]" />
          <span className="font-mono text-[10px] tabular-nums tracking-wider text-[var(--hl-ink-4)]">
            {String(map.waypoints.length).padStart(2, '0')}
          </span>
          <span className="hl-label">{m.nodes}</span>
          <span className="h-px flex-1 bg-[var(--hl-line)]" />

          <div className="flex items-center gap-1">
            {onDuplicate && (
              <Btn
                size="sm"
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                title={m.duplicateMap}
                aria-label={m.duplicateMap}
                icon={<CopyIcon className="h-3.5 w-3.5" />}
              />
            )}
            {MAP_QUICK_TOOL_IDS.map((toolId) => {
              const Icon = toolIcon(toolId);
              return (
                <Btn
                  key={toolId}
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(applyMapQuickTool(map, toolId));
                  }}
                  title={quickToolLabel(m, toolId)}
                  aria-label={quickToolLabel(m, toolId)}
                  icon={<Icon className="h-3.5 w-3.5" />}
                />
              );
            })}
            <Btn
              size="sm"
              variant="ghost"
              className="text-[var(--hl-alarm)] hover:text-[var(--hl-alarm)]"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              title={m.deleteMap}
              aria-label={m.deleteMap}
              icon={<TrashIcon className="h-3.5 w-3.5" />}
            />
          </div>
        </div>

        {/* 畫布縮圖：1px 外框 + 下沉底 */}
        <div className="relative h-[120px] shrink-0 overflow-hidden border-b border-[var(--hl-line)] bg-[var(--hl-void-2)]">
          <MapPathPreview map={map} emptyLabel={m.mapEmptyPath} />
          <span className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1 border border-[var(--hl-line-strong)] bg-[var(--hl-void)] px-2 py-1 font-mono text-[10px] text-[var(--hl-ink-2)] opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            <EditIcon className="h-3 w-3" />
            {m.editMap}
          </span>
        </div>

        {/* 表單：標籤 mono 10px 在上，控件在下 */}
        <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-3 py-2.5">
          <label className="flex flex-col gap-1.5">
            <span className="hl-label">{m.mapFsMapNameLabel}</span>
            <input
              type="text"
              value={map.name}
              onChange={(e) => onChange({ ...map, name: e.target.value })}
              className="hl-input"
              placeholder={m.unnamedMap}
              onClick={(e) => e.stopPropagation()}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="hl-label">{m.mapFsMapDescLabel}</span>
            <textarea
              value={map.description}
              onChange={(e) => onChange({ ...map, description: e.target.value })}
              className="h-16 w-full resize-none border border-[var(--hl-line)] bg-[var(--hl-void-2)] px-2.5 py-2 text-[12.5px] leading-snug text-[var(--hl-ink)] outline-none transition-colors placeholder:text-[var(--hl-ink-4)] focus:border-[var(--hl-signal)]"
              placeholder={m.mapDescPh}
              rows={2}
              onClick={(e) => e.stopPropagation()}
            />
          </label>

          <div className="grid grid-cols-3 gap-px border border-[var(--hl-line)] bg-[var(--hl-line)]">
            <div className="flex flex-col gap-1.5 bg-[var(--hl-deck)] p-2.5">
              <span className="hl-label">{m.difficulty}</span>
              <div className="custom-select-container relative z-20" onClick={(e) => e.stopPropagation()}>
                <CustomSelect
                  value={map.difficulty}
                  onChange={(value) => onChange({ ...map, difficulty: value })}
                  variant="filled"
                  size="sm"
                  options={[
                    { value: 'veryEasy', label: m.diffVeryEasy },
                    { value: 'easy', label: m.diffEasy },
                    { value: 'medium', label: m.diffMedium },
                    { value: 'hard', label: m.diffHard },
                  ]}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 bg-[var(--hl-deck)] p-2.5">
              <span className="hl-label">{m.category}</span>
              <div className="custom-select-container relative z-20" onClick={(e) => e.stopPropagation()}>
                <CustomSelect
                  value={map.category || 'normal'}
                  onChange={(value) => onChange({ ...map, category: value as CustomMapData['category'] })}
                  variant="filled"
                  size="sm"
                  options={[
                    { value: 'normal', label: m.catNormal },
                    { value: 'advanced', label: m.catAdvanced },
                  ]}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 bg-[var(--hl-deck)] p-2.5">
              <StatCell
                label={m.nodes}
                value={<Num value={map.waypoints.length} size="md" tone="reach" />}
              />
              {map.waypoints.length >= 2 && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px]">
                  <span className="flex items-center gap-1 text-[var(--hl-vital)]">
                    <PlayIcon className="h-2.5 w-2.5" />
                    {m.mapFsSetStart}
                  </span>
                  <span className="flex items-center gap-1 text-[var(--hl-alarm)]">
                    <PinIcon className="h-2.5 w-2.5" />
                    {m.mapFsSetEnd}
                  </span>
                </div>
              )}
              {(map.blockedCells?.length ?? 0) > 0 && (
                <span className="font-mono text-[10px] text-[var(--hl-ink-4)]">
                  {fillTemplate(m.mapBlockedCount, { count: String(map.blockedCells!.length) })}
                </span>
              )}
            </div>
          </div>

          <SegHead label={m.mapHoverToolsHint} />

          <div className="flex flex-wrap gap-1.5">
            {MAP_QUICK_TOOL_IDS.map((toolId) => (
              <span
                key={toolId}
                className="border border-[var(--hl-line)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--hl-ink-3)]"
              >
                {quickToolLabel(m, toolId)}
              </span>
            ))}
          </div>

          <MapEditorShortcutHints />
        </div>
      </Deck>
      </div>

      <AnimatePresence>
        {isFullscreen && (
          <FullscreenMapEditor
            map={map}
            onChange={onChange}
            onClose={() => setIsFullscreen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};
