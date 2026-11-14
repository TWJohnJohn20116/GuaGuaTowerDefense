/**
 * Mod 編輯器 · 嵌入模式頂部列 — HARDLINE 帶狀（h-11）
 */
import { useTranslation } from '@/i18n';
import { renderModIcon } from '@/components/ui/ModIcon';
import { PaletteIcon } from '@/components/ui/Icons';
import { Num } from '@/components/hl';
import { ModEditorToolbarActions } from '@/components/scenes/mod-editor-scene/ModEditorToolbarActions';

interface ModEditorEmbeddedBarProps {
  modName: string;
  modVersion: string;
  modIcon: string;
  showPreview: boolean;
  onTogglePreview: () => void;
  onSave: () => void;
  onExport: () => void;
  onImport: () => void;
}

export function ModEditorEmbeddedBar({
  modName,
  modVersion,
  modIcon,
  showPreview,
  onTogglePreview,
  onSave,
  onExport,
  onImport,
}: ModEditorEmbeddedBarProps) {
  const { t } = useTranslation();
  const m = t.modEditorExt;

  return (
    <div className="flex h-11 shrink-0 items-center gap-2.5 border-b border-[var(--cn-line-soft)] bg-[var(--arc-void)] px-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center border-[3px] border-[var(--cn-line-soft)] text-[var(--arc-ink-3)]">
        {modIcon ? (
          renderModIcon(modIcon, <PaletteIcon className="h-3.5 w-3.5" />, 'h-3.5 w-3.5')
        ) : (
          <PaletteIcon className="h-3.5 w-3.5" />
        )}
      </span>

      <span className="arc-label shrink-0">mod</span>
      <span className="min-w-0 truncate text-[12.5px] font-medium text-[var(--arc-ink)]">
        {modName || m.unnamedMod}
      </span>
      <Num
        value={`v${modVersion}`}
        tone="muted"
        size="sm"
        className="shrink-0 border-[3px] border-[var(--cn-line-soft)] px-1.5 py-0.5 font-mono tabular-nums uppercase tracking-[0.08em]"
      />

      <div className="ml-auto shrink-0">
        <ModEditorToolbarActions
          showPreview={showPreview}
          onTogglePreview={onTogglePreview}
          onSave={onSave}
          onExport={onExport}
          onImport={onImport}
        />
      </div>
    </div>
  );
}
