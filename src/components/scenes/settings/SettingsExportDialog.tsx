/**
 * 設定 - 匯出選項對話框（HARDLINE Modal）
 *
 * 遮罩 + 置中 Deck；按鈕直向全寬，主行動用 signal。
 */
import { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { DownloadIcon, FolderIcon } from '@/components/ui/Icons';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { SceneModal } from '@/components/ui/SceneModal';
import {
  countSelectedSections,
  createDefaultExportSelection,
  type SettingsExportSelection,
} from '@/services/settingsExportSections';
import { exportSettings } from '@/services/settingsExportService';
import { SettingsSectionChecklist } from './SettingsSectionChecklist';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { useTranslation } from '@/i18n';
import { Btn, Deck, Dot } from '@/components/hl';

interface Props {
  open: boolean;
  onClose: () => void;
  onDone?: (ok: boolean, message?: string) => void;
}

export function SettingsExportDialog({ open, onClose, onDone }: Props) {
  const { t } = useTranslation();
  const d = t.settings.exportDialog;

  const [selection, setSelection] = useState<SettingsExportSelection>(createDefaultExportSelection);
  const [download, setDownload] = useState(true);
  const [saveToVault, setSaveToVault] = useState(true);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<'success' | 'fail' | null>(null);

  const selectedCount = useMemo(() => countSelectedSections(selection), [selection]);

  const handleExport = async () => {
    if (selectedCount === 0 || (!download && !saveToVault)) return;
    setBusy(true);
    setResult(null);
    const res = await exportSettings({
      selection,
      download,
      saveToVault,
    });
    setBusy(false);
    if (res.ok) {
      setResult('success');
      onDone?.(true, d.exportedMessage);
      window.setTimeout(onClose, 900);
    } else {
      setResult('fail');
      onDone?.(false, res.reason);
    }
  };

  const canExport = selectedCount > 0 && (download || saveToVault) && !busy;

  return (
    <ModalPortal>
      <AnimatePresence>
        {open && (
          <SceneModal onClose={onClose} maxWidth="max-w-lg" zIndex="z-[100000]" variant="solid" panelClassName="p-0">
            <Deck notch tone="bare" className="flex max-h-[80vh] flex-col border-0">
              <div className="flex items-center gap-2.5 border-b border-[var(--cn-line-soft)] px-4 py-3">
                <span className="flex h-6 w-6 items-center justify-center border-[3px] border-[var(--cn-line-soft)] text-[var(--arc-ink-2)]">
                  <DownloadIcon className="h-3.5 w-3.5" />
                </span>
                <span className="arc-label text-[var(--arc-ink-2)]">{d.title}</span>
                <span className="h-px flex-1 bg-[var(--arc-line)]" />
                <span className="font-mono text-[10px] tabular-nums text-[var(--arc-ink-4)]">
                  {String(selectedCount).padStart(2, '0')}
                </span>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
                <SettingsSectionChecklist
                  selection={selection}
                  onSelectionChange={setSelection}
                />

                <div className="mt-3 flex flex-col gap-1.5 border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)] p-2.5">
                  <span className="arc-label">{d.destination}</span>

                  <label className="flex items-center justify-between gap-3 border-[3px] border-[var(--cn-line-soft)] px-2.5 py-2">
                    <span className="flex items-center gap-1.5 text-[11.5px] text-[var(--arc-ink-2)]">
                      <DownloadIcon className="h-3.5 w-3.5 text-[var(--arc-ink-3)]" />
                      {d.downloadJson}
                    </span>
                    <ToggleSwitch enabled={download} onToggle={() => setDownload((v) => !v)} size="sm" />
                  </label>

                  <label className="flex items-center justify-between gap-3 border-[3px] border-[var(--cn-line-soft)] px-2.5 py-2">
                    <span className="flex items-center gap-1.5 text-[11.5px] text-[var(--arc-ink-2)]">
                      <FolderIcon className="h-3.5 w-3.5 text-[var(--arc-ink-3)]" />
                      {d.saveToVault}
                    </span>
                    <ToggleSwitch enabled={saveToVault} onToggle={() => setSaveToVault((v) => !v)} size="sm" />
                  </label>
                </div>

                {result === 'success' && (
                  <p className="mt-2.5 flex items-center gap-1.5 font-mono text-[10.5px] text-[var(--arc-vital)]">
                    <Dot tone="vital" /> {d.exportSuccess}
                  </p>
                )}
                {result === 'fail' && (
                  <p className="mt-2.5 flex items-center gap-1.5 font-mono text-[10.5px] text-[var(--arc-alert)]">
                    <Dot tone="alarm" /> {d.exportFailed}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5 border-t border-[var(--cn-line-soft)] p-3">
                <Btn
                  variant="signal"
                  block
                  disabled={!canExport}
                  onClick={handleExport}
                  icon={<DownloadIcon className="h-3.5 w-3.5" />}
                >
                  {busy ? d.exporting : d.confirmExport}
                </Btn>
                <Btn variant="ghost" block onClick={onClose}>
                  {t.common.cancel}
                </Btn>
              </div>
            </Deck>
          </SceneModal>
        )}
      </AnimatePresence>
    </ModalPortal>
  );
}

export default SettingsExportDialog;
