/**
 * 設定 - 本機檔案庫管理員（匯入 / 刪除 / 重新命名）· HARDLINE Modal
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  CrossIcon, FolderIcon, UploadIcon, RefreshIcon, TrashIcon,
  CheckIcon, WarningIcon, DocumentIcon, PencilIcon,
} from '@/components/ui/Icons';
import { SceneModal } from '@/components/ui/SceneModal';
import { SearchInput } from '@/components/ui/CustomInput';
import {
  deleteStoredSettingsFile,
  estimatePayloadSize,
  formatBytes,
  listStoredSettingsFiles,
  renameStoredSettingsFile,
  type StoredSettingsFile,
} from '@/services/settingsFileDb';
import {
  triggerSettingsImportPicker,
  type SettingsExportPayload,
  type SettingsImportResult,
} from '@/services/settingsExportService';
import { SETTINGS_SECTION_LABELS } from '@/services/settingsExportSections';
import { SettingsImportDialog } from './SettingsImportDialog';
import { SettingsLocalFilePanel } from './SettingsLocalFilePanel';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { useTranslation } from '@/i18n';
import { isSettingsPickerDismissed } from '@/i18n/settingsPickerReasons';
import { Btn, Chip, Deck, Dot } from '@/components/hl';

type FileManagerTab = 'vault' | 'local';

interface Props {
  open: boolean;
  onClose: () => void;
  onDone?: (result: SettingsImportResult) => void;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function SettingsFileManagerDialog({ open, onClose, onDone }: Props) {
  const { t } = useTranslation();
  const f = t.settings.fileManager;
  const b = t.settings.backup;
  const [activeTab, setActiveTab] = useState<FileManagerTab>('vault');
  const [files, setFiles] = useState<StoredSettingsFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importPayload, setImportPayload] = useState<SettingsExportPayload | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listStoredSettingsFiles();
      setFiles(rows);
      setSelectedId((prev) => {
        if (rows.length === 0) return null;
        if (prev && rows.some((r) => r.id === prev)) return prev;
        return rows[0].id;
      });
    } catch {
      setStatus({ kind: 'error', message: f.readVaultFailed });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      void refresh();
      setImportOpen(false);
      setImportPayload(null);
      setRenaming(false);
      setStatus(null);
    }
  }, [open, refresh]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return files;
    return files.filter((item) => item.name.toLowerCase().includes(q));
  }, [files, search]);

  const selected = useMemo(
    () => filtered.find((item) => item.id === selectedId) ?? files.find((item) => item.id === selectedId) ?? null,
    [filtered, files, selectedId],
  );

  const showStatus = (result: SettingsImportResult) => {
    if (result.ok) {
      setStatus({ kind: 'success', message: b.opSuccess });
    } else if (!isSettingsPickerDismissed(result.reason)) {
      setStatus({ kind: 'error', message: result.reason ?? b.opFailed });
    }
    onDone?.(result);
    window.setTimeout(() => setStatus(null), 2800);
  };

  const handleImportSelected = () => {
    if (!selected) return;
    openImportDialog(selected.payload);
  };

  const openImportDialog = (payload: SettingsExportPayload) => {
    setImportPayload(payload);
    setImportOpen(true);
  };

  const notifyPanel = (message: string, kind: 'success' | 'error', refreshVault = false) => {
    setStatus({ kind, message });
    if (refreshVault) void refresh();
    window.setTimeout(() => setStatus(null), 2800);
  };

  const handleImportDone = (result: SettingsImportResult) => {
    showStatus(result);
    if (result.ok) {
      setImportOpen(false);
      setImportPayload(null);
      window.setTimeout(onClose, 700);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    await deleteStoredSettingsFile(selected.id);
    setSelectedId(null);
    await refresh();
    setStatus({ kind: 'success', message: f.deletedBackup });
  };

  const handleAddFromDevice = async () => {
    const result = await triggerSettingsImportPicker('vault');
    showStatus(result);
    if (result.ok) await refresh();
  };

  const startRename = () => {
    if (!selected) return;
    setRenameValue(selected.name);
    setRenaming(true);
  };

  const submitRename = async () => {
    if (!selected) return;
    await renameStoredSettingsFile(selected.id, renameValue);
    setRenaming(false);
    await refresh();
    setStatus({ kind: 'success', message: f.renamed });
  };

  return (
    <ModalPortal>
      <AnimatePresence>
        {open && (
          <SceneModal
            onClose={onClose}
            maxWidth="max-w-3xl"
            maxHeight="h-[min(640px,90vh)]"
            zIndex="z-[100000]"
            variant="solid"
            panelClassName="p-0"
          >
            <Deck notch tone="bare" className="flex min-h-0 flex-col border-0">
              {/* 標題列 */}
              <div className="flex items-center gap-2.5 border-b border-[var(--hl-line)] px-4 py-2.5">
                <span className="flex h-6 w-6 items-center justify-center border border-[var(--hl-line)] text-[var(--hl-ink-2)]">
                  <FolderIcon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <div className="truncate text-[13.5px] font-medium text-[var(--hl-ink)]">{f.title}</div>
                  <div className="mt-0.5 truncate font-mono text-[9.5px] uppercase tracking-[0.08em] text-[var(--hl-ink-4)]">
                    {activeTab === 'vault' ? f.vaultDesc : f.localDesc}
                  </div>
                </div>
                <span className="h-px flex-1 bg-[var(--hl-line)]" />
                <Btn variant="ghost" size="sm" onClick={onClose} aria-label={t.common.cancel}>
                  <CrossIcon className="h-3.5 w-3.5" />
                </Btn>
              </div>

              {/* 分頁 */}
              <div className="flex items-center gap-1.5 border-b border-[var(--hl-line)] px-4 py-2">
                <Chip active={activeTab === 'vault'} onClick={() => setActiveTab('vault')}>
                  {f.tabVault}
                </Chip>
                <Chip active={activeTab === 'local'} onClick={() => setActiveTab('local')}>
                  {f.tabLocal}
                </Chip>
              </div>

              {activeTab === 'vault' && (
                <div className="flex items-center gap-1.5 border-b border-[var(--hl-line)] px-4 py-2">
                  <div className="min-w-0 flex-1">
                    <SearchInput
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onClear={() => setSearch('')}
                      placeholder={f.searchBackup}
                      size="sm"
                    />
                  </div>
                  <Btn
                    variant="ghost"
                    size="sm"
                    onClick={() => void refresh()}
                    title={f.refresh}
                    aria-label={f.refresh}
                  >
                    <RefreshIcon className="h-3.5 w-3.5" />
                  </Btn>
                  <Btn
                    variant="line"
                    size="sm"
                    onClick={() => void handleAddFromDevice()}
                    icon={<UploadIcon className="h-3.5 w-3.5" />}
                  >
                    {f.addFromDevice}
                  </Btn>
                </div>
              )}

              {activeTab === 'vault' ? (
                <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
                  <div className="min-h-0 flex-1 overflow-y-auto border-b border-[var(--hl-line)] sm:border-b-0 sm:border-r">
                    {loading ? (
                      <div className="flex items-center gap-2 p-4">
                        <Dot tone="signal" pulse />
                        <span className="font-mono text-[10.5px] text-[var(--hl-ink-3)]">{f.loading}</span>
                      </div>
                    ) : filtered.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
                        <FolderIcon className="h-8 w-8 text-[var(--hl-ink-4)]" />
                        <span className="hl-label">empty</span>
                        <span className="text-[11.5px] text-[var(--hl-ink-2)]">{f.noBackups}</span>
                        <span className="text-[10px] text-[var(--hl-ink-3)]">{f.noBackupsHint}</span>
                      </div>
                    ) : (
                      filtered.map((file) => {
                        const active = file.id === selectedId;
                        const size = formatBytes(estimatePayloadSize(file.payload));
                        return (
                          <button
                            key={file.id}
                            type="button"
                            onClick={() => { setSelectedId(file.id); setRenaming(false); }}
                            className={`flex w-full items-start gap-2.5 border-b border-[var(--hl-line)] px-3 py-2.5 text-left transition-colors duration-150 last:border-b-0 ${
                              active ? 'bg-[var(--hl-signal-veil)]' : 'hover:bg-[var(--hl-deck-2)]'
                            }`}
                          >
                            <span
                              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center ${
                                active ? 'text-[var(--hl-signal)]' : 'text-[var(--hl-ink-4)]'
                              }`}
                            >
                              <DocumentIcon className="h-3.5 w-3.5" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span
                                className={`block truncate text-[12px] ${
                                  active ? 'font-medium text-[var(--hl-ink)]' : 'text-[var(--hl-ink-2)]'
                                }`}
                              >
                                {file.name}
                              </span>
                              <span className="mt-0.5 block truncate font-mono text-[9.5px] tabular-nums text-[var(--hl-ink-4)]">
                                {formatDate(file.updatedAt)} · {size} · {file.payload.sections.length} {f.sectionsUnit}
                              </span>
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>

                  <aside className="flex w-full flex-col gap-2.5 p-3 sm:w-[264px]">
                    {selected ? (
                      <>
                        {renaming ? (
                          <div className="flex flex-col gap-1.5">
                            <input
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              className="h-9 border border-[var(--hl-line-strong)] bg-[var(--hl-void-2)] px-2.5 font-mono text-[11.5px] text-[var(--hl-ink)] outline-none focus:border-[var(--hl-signal)]"
                            />
                            <div className="flex gap-1.5">
                              <Btn variant="signal" size="sm" block onClick={() => void submitRename()}>
                                {f.save}
                              </Btn>
                              <Btn variant="ghost" size="sm" block onClick={() => setRenaming(false)}>
                                {t.common.cancel}
                              </Btn>
                            </div>
                          </div>
                        ) : (
                          <>
                            <h4 className="truncate text-[13px] font-medium text-[var(--hl-ink)]">{selected.name}</h4>
                            <p className="font-mono text-[9.5px] tabular-nums text-[var(--hl-ink-4)]">
                              {formatDate(selected.updatedAt)}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {selected.payload.sections.map((s) => (
                                <span
                                  key={s}
                                  className="border border-[var(--hl-line)] px-1.5 py-0.5 font-mono text-[9.5px] uppercase leading-none tracking-[0.08em] text-[var(--hl-ink-3)]"
                                >
                                  {SETTINGS_SECTION_LABELS[s]}
                                </span>
                              ))}
                            </div>
                          </>
                        )}

                        {!renaming && (
                          <div className="mt-auto flex flex-col gap-1.5 border-t border-[var(--hl-line)] pt-2.5">
                            <Btn variant="signal" block onClick={handleImportSelected}>
                              {f.importBackup}
                            </Btn>
                            <div className="flex gap-1.5">
                              <Btn
                                variant="line"
                                size="sm"
                                block
                                onClick={startRename}
                                icon={<PencilIcon className="h-3 w-3" />}
                              >
                                {f.rename}
                              </Btn>
                              <Btn
                                variant="danger"
                                size="sm"
                                block
                                onClick={() => void handleDelete()}
                                icon={<TrashIcon className="h-3 w-3" />}
                              >
                                {f.delete}
                              </Btn>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="py-6 text-center font-mono text-[10.5px] text-[var(--hl-ink-4)]">
                        {f.selectBackupHint}
                      </p>
                    )}
                  </aside>
                </div>
              ) : (
                <SettingsLocalFilePanel
                  onImport={openImportDialog}
                  onNotify={(message, kind, refreshVault) => notifyPanel(message, kind, refreshVault)}
                />
              )}

              {status && (
                <div className="flex items-center gap-2 border-t border-[var(--hl-line)] px-4 py-2">
                  <Dot tone={status.kind === 'success' ? 'vital' : 'alarm'} />
                  {status.kind === 'success' ? (
                    <CheckIcon className="h-3.5 w-3.5 shrink-0 text-[var(--hl-vital)]" />
                  ) : (
                    <WarningIcon className="h-3.5 w-3.5 shrink-0 text-[var(--hl-alarm)]" />
                  )}
                  <span
                    className={`min-w-0 flex-1 truncate text-[11px] ${
                      status.kind === 'success' ? 'text-[var(--hl-vital)]' : 'text-[var(--hl-alarm)]'
                    }`}
                  >
                    {status.message}
                  </span>
                </div>
              )}
            </Deck>
          </SceneModal>
        )}
      </AnimatePresence>

      {importPayload && (
        <SettingsImportDialog
          open={importOpen}
          payload={importPayload}
          onClose={() => {
            setImportOpen(false);
            setImportPayload(null);
          }}
          onDone={handleImportDone}
        />
      )}
    </ModalPortal>
  );
}

export default SettingsFileManagerDialog;
