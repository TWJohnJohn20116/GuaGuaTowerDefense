/**
 * 設定 - 匯入選項對話框（HARDLINE Modal）
 */
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { UploadIcon } from '@/components/ui/Icons';
import { SceneModal } from '@/components/ui/SceneModal';
import {
  createImportSelectionFromPayload,
  type SettingsExportSelection,
} from '@/services/settingsExportSections';
import {
  importSettingsPayload,
  type SettingsExportPayload,
  type SettingsImportResult,
} from '@/services/settingsExportService';
import {
  SettingsSectionChecklist,
  countAvailableSelected,
} from './SettingsSectionChecklist';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { useTranslation } from '@/i18n';
import { Btn, Deck, Dot, Field } from '@/components/hl';

interface Props {
  open: boolean;
  payload: SettingsExportPayload;
  onClose: () => void;
  onDone?: (result: SettingsImportResult) => void;
}

function formatExportDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function SettingsImportDialog({ open, payload, onClose, onDone }: Props) {
  const { t } = useTranslation();
  const d = t.settings.importDialog;

  const availableSections = useMemo(
    () => payload.sections,
    [payload],
  );

  const [selection, setSelection] = useState<SettingsExportSelection>(() =>
    createImportSelectionFromPayload(payload),
  );
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<'success' | 'fail' | null>(null);

  useEffect(() => {
    if (open && payload) {
      setSelection(createImportSelectionFromPayload(payload));
      setResult(null);
      setBusy(false);
    }
  }, [open, payload]);

  const selectedCount = useMemo(
    () => countAvailableSelected(availableSections, selection),
    [availableSections, selection],
  );

  const handleImport = () => {
    if (selectedCount === 0) return;
    setBusy(true);
    setResult(null);
    const res = importSettingsPayload(payload, selection);
    setBusy(false);
    if (res.ok) {
      setResult('success');
      onDone?.(res);
      window.setTimeout(onClose, 900);
    } else {
      setResult('fail');
      onDone?.(res);
    }
  };

  const canImport = selectedCount > 0 && !busy;

  return (
    <ModalPortal>
      <AnimatePresence>
        {open && (
          <SceneModal onClose={onClose} maxWidth="max-w-lg" zIndex="z-[100001]" variant="solid" panelClassName="p-0">
            <Deck notch tone="bare" className="flex max-h-[80vh] flex-col border-0">
              <div className="flex items-center gap-2.5 border-b border-[var(--hl-line)] px-4 py-3">
                <span className="flex h-6 w-6 items-center justify-center border border-[var(--hl-line)] text-[var(--hl-ink-2)]">
                  <UploadIcon className="h-3.5 w-3.5" />
                </span>
                <span className="hl-label text-[var(--hl-ink-2)]">{d.title}</span>
                <span className="h-px flex-1 bg-[var(--hl-line)]" />
                <span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-4)]">
                  {String(selectedCount).padStart(2, '0')}
                </span>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
                <div className="mb-2.5 flex flex-col gap-1 border border-[var(--hl-line)] bg-[var(--hl-void-2)] px-2.5 py-2">
                  <span className="hl-label">{d.backupInfo}</span>
                  <Field label={d.exportedAt}>
                    <span className="font-mono text-[11px] tabular-nums text-[var(--hl-ink-2)]">
                      {formatExportDate(payload.exportedAt)}
                    </span>
                  </Field>
                  <span className="font-mono text-[10px] text-[var(--hl-ink-3)]">
                    {d.versionSections
                      .replace('{version}', payload.appVersion)
                      .replace('{count}', String(payload.sections.length))}
                  </span>
                </div>

                <p className="mb-2 font-mono text-[10px] leading-relaxed text-[var(--hl-caution)]">
                  {d.selectHint}
                </p>

                <SettingsSectionChecklist
                  availableSections={availableSections}
                  selection={selection}
                  onSelectionChange={setSelection}
                />

                {result === 'success' && (
                  <p className="mt-2.5 flex items-center gap-1.5 font-mono text-[10.5px] text-[var(--hl-vital)]">
                    <Dot tone="vital" /> {d.importSuccess}
                  </p>
                )}
                {result === 'fail' && (
                  <p className="mt-2.5 flex items-center gap-1.5 font-mono text-[10.5px] text-[var(--hl-alarm)]">
                    <Dot tone="alarm" /> {d.importFailed}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5 border-t border-[var(--hl-line)] p-3">
                <Btn
                  variant="signal"
                  block
                  disabled={!canImport}
                  onClick={handleImport}
                  icon={<UploadIcon className="h-3.5 w-3.5" />}
                >
                  {busy ? d.importing : d.confirmImport}
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

export default SettingsImportDialog;
