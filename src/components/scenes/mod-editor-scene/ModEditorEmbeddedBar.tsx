/**
 * Mod 編輯器 · 嵌入模式頂部列 — HARDLINE 帶狀（h-11）
 */
import { useTranslation } from '@/i18n';
import { renderModIcon } from '@/components/ui/ModIcon';
import { PaletteIcon } from '@/components/ui/Icons';
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
    <div className="flex h-11 shrink-0 items-center gap-2.5 border-b border-[var(--hl-line)] bg-[var(--hl-void)] px-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-[var(--hl-line)] text-[var(--hl-ink-3)]">
        {modIcon ? (
          renderModIcon(modIcon, <PaletteIcon className="h-3.5 w-3.5" />, 'h-3.5 w-3.5')
        ) : (
          <PaletteIcon className="h-3.5 w-3.5" />
        )}
      </span>

      <span className="hl-label shrink-0">mod</span>
      <span className="min-w-0 truncate text-[12.5px] font-medium text-[var(--hl-ink)]">
        {modName || m.unnamedMod}
      </span>
      <span className="shrink-0 border border-[var(--hl-line)] px-1.5 py-0.5 font-mono text-[9.5px] tabular-nums uppercase tracking-[0.08em] text-[var(--hl-ink-3)]">
        v{modVersion}
      </span>

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
