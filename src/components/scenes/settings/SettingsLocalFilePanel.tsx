/**
 * 設定檔案庫 - 本機檔案瀏覽分頁
 */
import { useMemo, useState } from 'react';
import {
  DocumentIcon, FolderIcon, UploadIcon, RefreshIcon, WarningIcon,
} from '@/components/ui/Icons';
import { SearchInput } from '@/components/ui/CustomInput';
import { formatBytes } from '@/services/settingsFileDb';
import {
  browseLocalSettingsDirectory,
  browseLocalSettingsFiles,
  supportsDirectoryPicker,
  supportsOpenFilePicker,
  type LocalSettingsFileEntry,
} from '@/services/settingsLocalFileAccess';
import { SETTINGS_SECTION_LABELS } from '@/services/settingsExportSections';
import type { SettingsExportPayload } from '@/services/settingsExportService';
import { saveStoredSettingsFile } from '@/services/settingsFileDb';
import { useTranslation } from '@/i18n';
import { isSettingsPickerDismissed } from '@/i18n/settingsPickerReasons';
import { Btn } from '@/components/hl';

interface Props {
  onImport: (payload: SettingsExportPayload) => void;
  onNotify: (message: string, kind: 'success' | 'error', refreshVault?: boolean) => void;
}

function formatModified(ts: number): string {
  return new Date(ts).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function SettingsLocalFilePanel({ onImport, onNotify }: Props) {
  const { t } = useTranslation();
  const l = t.settings.localFile;
  const f = t.settings.fileManager;
  const [files, setFiles] = useState<LocalSettingsFileEntry[]>([]);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [browseLabel, setBrowseLabel] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return files;
    return files.filter(
      (f) => f.name.toLowerCase().includes(q) || f.pathLabel.toLowerCase().includes(q),
    );
  }, [files, search]);

  const selected = useMemo(
    () => filtered.find((f) => f.id === selectedId) ?? files.find((f) => f.id === selectedId) ?? null,
    [filtered, files, selectedId],
  );

  const mergeFiles = (incoming: LocalSettingsFileEntry[]) => {
    setFiles((prev) => {
      const map = new Map(prev.map((f) => [f.id, f]));
      incoming.forEach((f) => map.set(f.id, f));
      const merged = Array.from(map.values()).sort((a, b) => b.lastModified - a.lastModified);
      setSelectedId((cur) => {
        if (cur && merged.some((f) => f.id === cur)) return cur;
        return merged[0]?.id ?? null;
      });
      return merged;
    });
  };

  const handleBrowseFiles = async () => {
    setBusy(true);
    const result = await browseLocalSettingsFiles();
    setBusy(false);
    if (!result.ok) {
      if (!isSettingsPickerDismissed(result.reason)) {
        onNotify(result.reason, 'error');
      }
      return;
    }
    setBrowseLabel(l.localFilesLabel);
    mergeFiles(result.files);
    onNotify(l.loadedFiles.replace('{count}', String(result.files.length)), 'success');
  };

  const handleBrowseFolder = async () => {
    setBusy(true);
    const result = await browseLocalSettingsDirectory();
    setBusy(false);
    if (!result.ok) {
      if (!isSettingsPickerDismissed(result.reason)) onNotify(result.reason, 'error');
      return;
    }
    setBrowseLabel(l.folderBrowseLabel);
    setFiles(result.files);
    setSelectedId(result.files[0]?.id ?? null);
    onNotify(l.folderFilesFound.replace('{count}', String(result.files.length)), 'success');
  };

  const handleSaveToVault = async () => {
    if (!selected) return;
    try {
      await saveStoredSettingsFile(selected.payload, selected.name);
      onNotify(l.savedToVault, 'success', true);
    } catch {
      onNotify(l.saveToVaultFailed, 'error');
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-0 sm:flex-row">
      <div className="flex min-h-0 flex-1 flex-col border-b border-[var(--cn-line-soft)] sm:border-b-0 sm:border-r">
        <div className="flex flex-wrap items-center gap-1.5 border-b border-[var(--cn-line-soft)] px-3 py-2">
          <Btn
            variant="line"
            size="sm"
            disabled={busy}
            onClick={() => void handleBrowseFiles()}
            icon={<DocumentIcon className="h-3.5 w-3.5" />}
          >
            {l.selectFile}
          </Btn>
          {supportsDirectoryPicker() && (
            <Btn
              variant="line"
              size="sm"
              disabled={busy}
              onClick={() => void handleBrowseFolder()}
              icon={<FolderIcon className="h-3.5 w-3.5" />}
            >
              {l.selectFolder}
            </Btn>
          )}
          <Btn
            variant="ghost"
            size="sm"
            disabled={files.length === 0 || busy}
            onClick={() => { setFiles([]); setSelectedId(null); setBrowseLabel(null); }}
            title={l.clearList}
            aria-label={l.clearList}
          >
            <RefreshIcon className="h-3.5 w-3.5" />
          </Btn>
        </div>

        <div className="border-b border-[var(--cn-line-soft)] px-4 py-2">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder={l.searchPlaceholder}
            size="sm"
          />
        </div>

        {!supportsOpenFilePicker() && (
          <p className="mx-4 mt-2 flex items-center gap-1.5 text-[10px] text-[var(--arc-caution)]">
            <WarningIcon className="h-3.5 w-3.5 shrink-0" />
            {l.pickerHint}
          </p>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto">
          {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-10 text-center">
              <FolderIcon className="h-10 w-10 text-[var(--arc-ink-4)]" />
              <p className="text-xs font-bold text-[var(--arc-ink-2)]">{l.emptyTitle}</p>
              <p className="max-w-xs text-[10px] leading-relaxed text-[var(--arc-ink-4)]">
                {l.emptyHint}
              </p>
            </div>
          ) : (
            filtered.map((file) => {
              const active = file.id === selectedId;
              return (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => setSelectedId(file.id)}
                  className={`flex w-full items-start gap-3 border-b border-[var(--cn-line-soft)] px-4 py-3 text-left transition-colors ${
                    active ? 'bg-[var(--arc-deck-2)]' : 'hover:bg-[var(--arc-deck-2)]'
                  }`}
                >
                  <DocumentIcon className={`mt-0.5 h-4 w-4 shrink-0 ${active ? 'text-[var(--arc-vital)]' : 'text-[var(--arc-ink-4)]'}`} />
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-xs font-bold ${active ? 'text-[var(--arc-ink)]' : 'text-[var(--arc-ink-2)]'}`}>
                      {file.name}
                    </span>
                    <span className="mt-0.5 block truncate text-[10px] text-[var(--arc-ink-4)]">
                      {file.pathLabel} · {formatBytes(file.size)} · {file.payload.sections.length} {f.sectionsUnit}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      <aside className="flex w-full flex-col gap-2.5 p-3 sm:w-[264px]">
        {selected ? (
          <>
            <h4 className="truncate text-[13px] font-medium text-[var(--arc-ink)]">{selected.name}</h4>
            <p className="font-mono text-[9.5px] tabular-nums text-[var(--arc-ink-4)]">{formatModified(selected.lastModified)}</p>
            <p className="truncate font-mono text-[9.5px] text-[var(--arc-ink-4)]">{selected.pathLabel}</p>
            {browseLabel && (
              <span className="w-fit border-[3px] border-[var(--cn-line-soft)] px-1.5 py-0.5 font-mono text-[9.5px] uppercase leading-none tracking-[0.08em] text-[var(--arc-ink-2)]">
                {browseLabel}
              </span>
            )}
            <div className="flex flex-wrap gap-1">
              {selected.payload.sections.map((s) => (
                <span
                  key={s}
                  className="border-[3px] border-[var(--cn-line-soft)] px-1.5 py-0.5 font-mono text-[9.5px] uppercase leading-none tracking-[0.08em] text-[var(--arc-ink-3)]"
                >
                  {SETTINGS_SECTION_LABELS[s]}
                </span>
              ))}
            </div>
            <div className="mt-auto flex flex-col gap-1.5 border-t border-[var(--cn-line-soft)] pt-2.5">
              <Btn variant="signal" block onClick={() => onImport(selected.payload)}>
                {l.importFile}
              </Btn>
              <Btn
                variant="line"
                block
                onClick={() => void handleSaveToVault()}
                icon={<UploadIcon className="h-3.5 w-3.5" />}
              >
                {l.saveToVault}
              </Btn>
            </div>
          </>
        ) : (
          <p className="py-6 text-center font-mono text-[10.5px] text-[var(--arc-ink-4)]">{l.selectFileHint}</p>
        )}
      </aside>
    </div>
  );
}

export default SettingsLocalFilePanel;
