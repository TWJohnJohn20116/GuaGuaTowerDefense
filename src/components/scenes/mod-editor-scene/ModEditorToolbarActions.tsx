/**
 * Mod 編輯器 · 工具列操作鈕 — HARDLINE 帶狀內按鈕
 *
 * 只放小按鈕：size="sm"、variant="line"，圖示 14px，分組之間 1px 垂直線。
 * 儲存是唯一的訊號色元素。
 */
import { useTranslation } from '@/i18n';
import { Btn } from '@/components/hl';
import {
  ChartIcon,
  SaveActionIcon,
  DownloadIcon,
  UploadIcon,
} from '@/components/ui/Icons';

export interface ModEditorToolbarActionsProps {
  showPreview: boolean;
  onTogglePreview: () => void;
  onSave: () => void;
  onExport: () => void;
  onImport: () => void;
}

export function ModEditorToolbarActions({
  showPreview,
  onTogglePreview,
  onSave,
  onExport,
  onImport,
}: ModEditorToolbarActionsProps) {
  const { t } = useTranslation();
  const m = t.modEditorExt;

  return (
    <div className="flex items-center gap-2">
      <Btn
        size="sm"
        variant="line"
        onClick={onTogglePreview}
        aria-pressed={showPreview}
        icon={<ChartIcon className="h-3.5 w-3.5" />}
      >
        {showPreview ? m.hideAnalysis : m.showAnalysis}
      </Btn>

      <span className="h-5 w-px bg-[var(--arc-line)]" aria-hidden="true" />

      <Btn
        size="sm"
        variant="signal"
        onClick={onSave}
        icon={<SaveActionIcon className="h-3.5 w-3.5" />}
      >
        {m.saveChanges}
      </Btn>

      <Btn
        size="sm"
        variant="line"
        onClick={onImport}
        icon={<UploadIcon className="h-3.5 w-3.5" />}
      >
        {m.importBtn}
      </Btn>

      <Btn
        size="sm"
        variant="line"
        onClick={onExport}
        icon={<DownloadIcon className="h-3.5 w-3.5" />}
      >
        {m.exportBtn}
      </Btn>
    </div>
  );
}
