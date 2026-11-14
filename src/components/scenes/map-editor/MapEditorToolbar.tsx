/**
 * 地圖編輯器 · 頂列 + 工具列帶 — HARDLINE
 *
 * TopBar（返回 + 標題 + 匯出）→ h-11 帶狀：編輯模式｜復原/清除。
 * 分組之間 1px 垂直線；模式按鈕 `Btn size="sm" variant="line"`，選中換訊號線。
 */

import { useTranslation } from '@/i18n';
import { TopBar, Btn } from '@/components/hl';
import { MapIcon, UndoIcon, TrashIcon, DownloadIcon } from '@/components/ui/Icons';
import type { EditMode } from './types';

interface MapEditorToolbarProps {
  embedded?: boolean;
  editMode: EditMode;
  onEditModeChange: (m: EditMode) => void;
  onUndo: () => void;
  onClear: () => void;
  onExport: () => void;
  canExport: boolean;
}

const MODES: EditMode[] = ['path', 'start', 'end', 'erase'];

export function MapEditorToolbar({
  embedded = false,
  editMode,
  onEditModeChange,
  onUndo,
  onClear,
  onExport,
  canExport,
}: MapEditorToolbarProps) {
  const { t } = useTranslation();

  const modeLabel: Record<EditMode, string> = {
    path: t.mapEditor.addWaypoint,
    start: t.mapEditor.setStart,
    end: t.mapEditor.setEnd,
    erase: t.mapEditor.deletePoint,
  };

  return (
    <>
      <TopBar
        title={t.mapEditor.title}
        meta="map editor"
        glyph={<MapIcon className="h-3.5 w-3.5" />}
        back={embedded ? false : { to: 'mainMenu' }}
        right={
          <Btn
            size="sm"
            variant="signal"
            onClick={onExport}
            disabled={!canExport}
            icon={<DownloadIcon className="h-3.5 w-3.5" />}
          >
            {t.mapEditor.exportCode}
          </Btn>
        }
      />

      <div className="flex h-11 shrink-0 items-center gap-2.5 border-b border-[var(--hl-line)] bg-[var(--hl-void)] px-3">
        <span className="hl-label shrink-0">{t.mapEditor.editMode}</span>

        <div className="flex items-center gap-1">
          {MODES.map((mode) => (
            <Btn
              key={mode}
              size="sm"
              variant="line"
              onClick={() => onEditModeChange(mode)}
              className={
                editMode === mode
                  ? 'border-[var(--hl-signal)] text-[var(--hl-signal)]'
                  : undefined
              }
              aria-pressed={editMode === mode}
            >
              {modeLabel[mode]}
            </Btn>
          ))}
        </div>

        <span className="h-5 w-px shrink-0 bg-[var(--hl-line)]" aria-hidden="true" />

        <Btn size="sm" variant="line" onClick={onUndo} icon={<UndoIcon className="h-3.5 w-3.5" />}>
          {t.common.undo}
        </Btn>
        <Btn size="sm" variant="line" onClick={onClear} icon={<TrashIcon className="h-3.5 w-3.5" />}>
          {t.common.clear}
        </Btn>
      </div>
    </>
  );
}

export default MapEditorToolbar;
