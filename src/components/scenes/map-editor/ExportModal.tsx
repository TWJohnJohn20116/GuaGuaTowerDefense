/**
 * 地圖編輯器 · 匯出地圖模態框 — HARDLINE Modal
 */

import { useTranslation } from '@/i18n';
import { SceneModal } from '@/components/ui/SceneModal';
import { Btn, SegHead } from '@/components/hl';

interface ExportModalProps {
  open: boolean;
  code: string;
  onClose: () => void;
}

export function ExportModal({ open, code, onClose }: ExportModalProps) {
  const { t } = useTranslation();
  if (!open) return null;

  const copy = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <SceneModal
      onClose={onClose}
      maxWidth="max-w-2xl"
      maxHeight="max-h-[80vh]"
      padding="p-4"
      panelClassName="arc-cut-tl flex flex-col gap-3 arc-panel p-4"
      zIndex="z-50"
      position="absolute"
    >
      <SegHead label={t.mapEditor.exportTitle} />
      <p className="arc-micro -mt-1">{t.mapEditor.exportHint}</p>

      <pre className="max-h-[46vh] overflow-auto arc-panel arc-panel--sunken p-2.5 font-mono text-[11.5px] leading-relaxed text-[var(--arc-ink-2)]">
        <code>{code}</code>
      </pre>

      <div className="flex items-center justify-end gap-1.5">
        <Btn size="sm" variant="ghost" onClick={onClose}>
          {t.common.close}
        </Btn>
        <Btn size="sm" variant="signal" onClick={copy}>
          {t.mapEditor.copyCode}
        </Btn>
      </div>
    </SceneModal>
  );
}

export default ExportModal;
