/**
 * Mod 編輯器 · 頂部標題列 — HARDLINE TopBar
 */
import { TopBar } from '@/components/hl';
import { PaletteIcon } from '@/components/ui/Icons';
import { ModEditorToolbar } from '@/components/scenes/mod-editor-scene/ModEditorToolbar';
import type { GameScene } from '@/types/game';

interface ModEditorHeaderProps {
  title: string;
  subtitle: string;
  showPreview: boolean;
  onTogglePreview: () => void;
  onSave: () => void;
  onExport: () => void;
  onImport: () => void;
  backTo?: GameScene;
}

export function ModEditorHeader({
  title,
  subtitle,
  showPreview,
  onTogglePreview,
  onSave,
  onExport,
  onImport,
  backTo = 'mainMenu',
}: ModEditorHeaderProps) {
  return (
    <TopBar
      title={title}
      meta={subtitle}
      glyph={<PaletteIcon className="h-3.5 w-3.5" />}
      back={{ to: backTo }}
      right={
        <ModEditorToolbar
          showPreview={showPreview}
          onTogglePreview={onTogglePreview}
          onSave={onSave}
          onExport={onExport}
          onImport={onImport}
        />
      }
    />
  );
}
