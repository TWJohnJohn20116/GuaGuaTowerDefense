/**
 * 設定 - 匯出 / 匯入備份（HARDLINE）
 */

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { SectionGroup } from '@/components/ui';
import { useTranslation } from '@/i18n';
import { DownloadIcon, UploadIcon, CheckIcon, WarningIcon, FolderIcon } from '@/components/ui/Icons';
import { Btn, Dot } from '@/components/hl';
import { SettingsExportDialog } from './SettingsExportDialog';
import { SettingsImportDialog } from './SettingsImportDialog';
import { SettingsFileManagerDialog } from './SettingsFileManagerDialog';
import { isSettingsPickerDismissed } from '@/i18n/settingsPickerReasons';
import {
  triggerSettingsImportPicker,
  type SettingsExportPayload,
  type SettingsImportResult,
} from '@/services/settingsExportService';

type StatusKind = 'idle' | 'success' | 'error';

export function SettingsBackupPanel() {
  const { t } = useTranslation();
  const b = t.settings.backup;
  const [exportOpen, setExportOpen] = useState(false);
  const [vaultOpen, setVaultOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importPayload, setImportPayload] = useState<SettingsExportPayload | null>(null);
  const [status, setStatus] = useState<{ kind: StatusKind; message: string }>({
    kind: 'idle',
    message: '',
  });

  const showStatus = (result: SettingsImportResult | { ok: true; message?: string }) => {
    if (result.ok) {
      setStatus({ kind: 'success', message: 'message' in result && result.message ? result.message : b.opSuccess });
    } else if (!isSettingsPickerDismissed(result.reason)) {
      setStatus({ kind: 'error', message: result.reason ?? b.opFailed });
    } else {
      return;
    }
    window.setTimeout(() => setStatus({ kind: 'idle', message: '' }), 3200);
  };

  const handleImportFromDevice = async () => {
    const result = await triggerSettingsImportPicker('pick');
    if (!result.ok) {
      showStatus(result);
      return;
    }
    if ('payload' in result) {
      setImportPayload(result.payload);
      setImportOpen(true);
    }
  };

  return (
    <>
      <SectionGroup
        title={b.title}
        description={b.description}
        icon={<FolderIcon className="h-3.5 w-3.5" />}
        badge={b.badge}
        columns={1}
      >
        <div className="flex flex-col gap-2.5 p-3">
          <p className="text-[11px] leading-relaxed text-[var(--arc-ink-3)]">{b.hint}</p>

          <div className="flex flex-wrap items-stretch gap-1.5">
            <Btn
              size="sm"
              variant="quiet"
              onClick={() => setExportOpen(true)}
              icon={<DownloadIcon className="h-3.5 w-3.5" />}
            >
              {b.exportBtn}
            </Btn>
            <Btn
              size="sm"
              variant="line"
              onClick={() => void handleImportFromDevice()}
              icon={<UploadIcon className="h-3.5 w-3.5" />}
            >
              {b.importBtn}
            </Btn>
            <Btn
              size="sm"
              variant="ghost"
              onClick={() => setVaultOpen(true)}
              icon={<FolderIcon className="h-3.5 w-3.5" />}
            >
              {b.vaultBtn}
            </Btn>
          </div>

          <AnimatePresence>
            {status.kind !== 'idle' && status.message && (
              <div
                className={`flex items-center gap-2 border px-2.5 py-2 ${
                  status.kind === 'success'
                    ? 'border-[var(--cn-line-soft)] bg-[var(--arc-void-2)]'
                    : 'border-[var(--cn-line-soft)] bg-[var(--arc-void-2)]'
                }`}
              >
                <Dot tone={status.kind === 'success' ? 'vital' : 'alarm'} />
                {status.kind === 'success' ? (
                  <CheckIcon className="h-3.5 w-3.5 shrink-0 text-[var(--arc-vital)]" />
                ) : (
                  <WarningIcon className="h-3.5 w-3.5 shrink-0 text-[var(--arc-alert)]" />
                )}
                <span
                  className={`min-w-0 flex-1 text-[11px] leading-snug ${
                    status.kind === 'success' ? 'text-[var(--arc-vital)]' : 'text-[var(--arc-alert)]'
                  }`}
                >
                  {status.message}
                </span>
              </div>
            )}
          </AnimatePresence>
        </div>
      </SectionGroup>

      <SettingsExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        onDone={(ok, message) => {
          if (ok) showStatus({ ok: true, message: message ?? t.settings.exportDialog.exportedMessage });
          else if (message) showStatus({ ok: false, reason: message });
        }}
      />

      <SettingsFileManagerDialog
        open={vaultOpen}
        onClose={() => setVaultOpen(false)}
        onDone={showStatus}
      />

      {importPayload && (
        <SettingsImportDialog
          open={importOpen}
          payload={importPayload}
          onClose={() => {
            setImportOpen(false);
            setImportPayload(null);
          }}
          onDone={(result) => {
            showStatus(result);
            if (result.ok) {
              setImportOpen(false);
              setImportPayload(null);
            }
          }}
        />
      )}
    </>
  );
}

export default SettingsBackupPanel;
