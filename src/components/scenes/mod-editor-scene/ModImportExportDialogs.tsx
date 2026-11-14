/**
 * Mod 編輯器 · 匯入 / 匯出對話框（含拖放與合併模式）— HARDLINE Modal
 */
import { useRef, useState, useCallback } from 'react';
import type React from 'react';
import type { ModValidationResult, Mod } from '@/types/game';
import { useTranslation } from '@/i18n';
import { SceneModal } from '@/components/ui/SceneModal';
import { ModValidationPanel } from '@/components/mod-editor/ModValidationPanel';
import { ModDiffPreview } from '@/components/mod-editor/ModDiffPreview';
import { CustomCheckbox } from '@/components/ui/CustomCheckbox';
import { Btn, Chip, Deck, Num, SegHead } from '@/components/hl';
import {
  DownloadIcon, UploadIcon, XIcon, CopyIcon, WarningIcon,
  TowerIcon, AlienIcon, MapIcon, WaveIcon, FolderIcon,
} from '@/components/ui/Icons';
import type { ImportMergeMode } from './modEditorImportMerge';

interface ExportSelection {
  towers: boolean;
  enemies: boolean;
  maps: boolean;
  waves: boolean;
}

interface ModImportExportDialogsProps {
  showExport: boolean;
  showImport: boolean;
  exportSelection: ExportSelection;
  towersCount: number;
  enemiesCount: number;
  mapsCount: number;
  wavesCount: number;
  modName: string;
  importJson: string;
  importFileName: string;
  importError: string;
  importPreview: ModValidationResult | null;
  importMergeMode: ImportMergeMode;
  hasIdConflict: boolean;
  draftMod?: Mod | null;
  onCloseExport: () => void;
  onCloseImport: () => void;
  onExportSelectionChange: (sel: ExportSelection) => void;
  onCopyExport: () => void;
  onDownloadExport: () => void;
  onImportJsonChange: (json: string) => void;
  onImportFileLoad: (fileName: string, content: string) => void;
  onImportMergeModeChange: (mode: ImportMergeMode) => void;
  onImportConfirm: () => void;
}

/** 對話框標題列：mono 標籤 + 1px 線 + 關閉方塊 */
function DialogHead({
  label,
  onClose,
}: {
  label: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="arc-label whitespace-nowrap">{label}</span>
      <span className="h-px flex-1 bg-[var(--arc-line)]" />
      <button
        type="button"
        onClick={onClose}
        className="flex h-6 w-6 items-center justify-center border-[3px] border-[var(--cn-line-soft)] text-[var(--arc-ink-3)] transition-colors hover:border-[var(--arc-line-hot)] hover:text-[var(--arc-ink)]"
      >
        <XIcon className="h-3 w-3" />
      </button>
    </div>
  );
}

export function ModImportExportDialogs({
  showExport,
  showImport,
  exportSelection,
  towersCount,
  enemiesCount,
  mapsCount,
  wavesCount,
  importJson,
  importFileName,
  importError,
  importPreview,
  importMergeMode,
  hasIdConflict,
  draftMod = null,
  onCloseExport,
  onCloseImport,
  onExportSelectionChange,
  onCopyExport,
  onDownloadExport,
  onImportJsonChange,
  onImportFileLoad,
  onImportMergeModeChange,
  onImportConfirm,
}: ModImportExportDialogsProps) {
  const { t } = useTranslation();
  const m = t.modEditorExt;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const importParsedMod = (() => {
    if (!importJson.trim()) return null;
    try {
      const parsed = JSON.parse(importJson) as Mod;
      if (!parsed.metadata || !parsed.content) return null;
      return parsed;
    } catch {
      return null;
    }
  })();

  const readFile = useCallback((file: File) => {
    if (!file.name.endsWith('.json') && file.type !== 'application/json') return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onImportFileLoad(file.name, ev.target?.result as string);
    };
    reader.readAsText(file);
  }, [onImportFileLoad]);

  const exportDisabled = !exportSelection.towers && !exportSelection.enemies
    && !exportSelection.maps && !exportSelection.waves;

  const exportRows = [
    { key: 'towers' as const, icon: <TowerIcon className="h-3.5 w-3.5" />, tone: 'text-[var(--arc-reach)]', count: towersCount, label: m.exportTowers.replace('{count}', String(towersCount)) },
    { key: 'enemies' as const, icon: <AlienIcon className="h-3.5 w-3.5" />, tone: 'text-[var(--arc-alert)]', count: enemiesCount, label: m.exportEnemies.replace('{count}', String(enemiesCount)) },
    { key: 'maps' as const, icon: <MapIcon className="h-3.5 w-3.5" />, tone: 'text-[var(--arc-vital)]', count: mapsCount, label: m.exportMaps.replace('{count}', String(mapsCount)) },
    { key: 'waves' as const, icon: <WaveIcon className="h-3.5 w-3.5" />, tone: 'text-[var(--arc-ink-2)]', count: wavesCount, label: `${m.tabWaves} (${wavesCount})` },
  ];

  return (
    <>
      {showExport && (
        <SceneModal
          onClose={onCloseExport}
          maxWidth="max-w-md"
          padding="p-4"
          zIndex="z-[100000]"
          variant="solid"
          panelClassName="arc-cut-tl flex flex-col gap-3 arc-panel p-4"
        >
          <DialogHead label={m.exportConfirmTitle} onClose={onCloseExport} />

          <SegHead label={m.exportSelectHint} />

          <Deck tone="sunken" className="px-3">
            {exportRows.map(({ key, icon, tone, count, label }) => (
              <label
                key={key}
                className="flex cursor-pointer items-center justify-between gap-3 border-b border-[var(--cn-line-soft)] py-2 last:border-b-0"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className={count > 0 ? tone : 'text-[var(--arc-ink-4)]'}>{icon}</span>
                  <span className={`truncate text-[11.5px] ${count > 0 ? 'text-[var(--arc-ink-2)]' : 'text-[var(--arc-ink-4)]'}`}>
                    {label}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <Num value={String(count).padStart(2, '0')} size="sm" tone="muted" />
                  <CustomCheckbox
                    checked={exportSelection[key]}
                    onChange={(val) => onExportSelectionChange({ ...exportSelection, [key]: val })}
                    disabled={count === 0}
                    color="var(--arc-gold)"
                  />
                </span>
              </label>
            ))}
          </Deck>

          <div className="flex items-center justify-end gap-1.5">
            <Btn size="sm" variant="ghost" onClick={onCloseExport}>
              {m.cancel}
            </Btn>
            <Btn
              size="sm"
              variant="line"
              onClick={onCopyExport}
              disabled={exportDisabled}
              icon={<CopyIcon className="h-3.5 w-3.5" />}
            >
              {m.copyJson}
            </Btn>
            <Btn
              size="sm"
              variant="signal"
              onClick={onDownloadExport}
              disabled={exportDisabled}
              icon={<DownloadIcon className="h-3.5 w-3.5" />}
            >
              {m.downloadFile}
            </Btn>
          </div>
        </SceneModal>
      )}

      {showImport && (
        <SceneModal
          onClose={onCloseImport}
          maxWidth="max-w-2xl"
          maxHeight="max-h-[86vh]"
          padding="p-4"
          zIndex="z-[100000]"
          variant="solid"
          panelClassName="arc-cut-tl flex flex-col gap-3 overflow-y-auto arc-panel p-4"
        >
          <DialogHead label={m.importTitle} onClose={onCloseImport} />
          <p className="arc-micro -mt-1">{m.importOverlayHint}</p>

          {/* 合併模式 */}
          <div className="flex items-center gap-1.5">
            <span className="arc-label shrink-0">mode</span>
            <span className="h-4 w-px bg-[var(--arc-line)]" aria-hidden="true" />
            {(['replace', 'merge'] as ImportMergeMode[]).map((mode) => (
              <Chip key={mode} active={importMergeMode === mode} onClick={() => onImportMergeModeChange(mode)}>
                {mode === 'replace' ? m.modImportReplace : m.modImportMerge}
              </Chip>
            ))}
          </div>

          {hasIdConflict && (
            <div className="flex items-start gap-1.5 border border-[rgba(255,182,39,0.38)] bg-[rgba(255,182,39,0.12)] px-2 py-1.5 text-[10.5px] text-[var(--arc-caution)]">
              <WarningIcon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
              {m.modImportIdConflict}
            </div>
          )}

          <input type="file" accept=".json,application/json" ref={fileInputRef} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f); }} />
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') fileInputRef.current?.click(); }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) readFile(f);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={[
              'flex w-full cursor-pointer flex-col items-center gap-2 border border-dashed px-4 py-6 transition-colors',
              dragOver
                ? 'border-[var(--arc-gold)] bg-[var(--arc-gold-veil)]'
                : 'border-[var(--cn-line-soft)] bg-[var(--arc-void-2)] hover:border-[var(--arc-line-hot)]',
            ].join(' ')}
          >
            <FolderIcon className="h-6 w-6 text-[var(--arc-ink-4)]" />
            {importFileName ? (
              <span className="text-center">
                <span className="block truncate text-[12px] text-[var(--arc-ink)]">{importFileName}</span>
                <span className="mt-0.5 block font-mono text-[9.5px] uppercase tracking-[0.08em] text-[var(--arc-ink-4)]">
                  {m.importClickChange}
                </span>
              </span>
            ) : (
              <span className="text-center">
                <span className="block text-[12px] text-[var(--arc-ink-2)]">{m.importSelectJson}</span>
                <span className="mt-0.5 block font-mono text-[9.5px] uppercase tracking-[0.08em] text-[var(--arc-ink-4)]">
                  {m.importDragDrop}
                </span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="h-px flex-1 bg-[var(--arc-line)]" />
            <span className="arc-label">{m.importOrPaste}</span>
            <span className="h-px flex-1 bg-[var(--arc-line)]" />
          </div>

          <textarea
            value={importJson}
            onChange={(e) => onImportJsonChange(e.target.value)}
            spellCheck={false}
            className="h-40 w-full resize-none arc-panel arc-panel--sunken p-2.5 font-mono text-[11.5px] leading-relaxed text-[var(--arc-ink-2)] outline-none transition-colors placeholder:text-[var(--arc-ink-4)] focus:border-[var(--arc-gold)]"
            placeholder={m.importJsonPh}
          />

          {importPreview && (
            <div className="flex flex-col gap-2">
              <ModValidationPanel result={importPreview} />
              {importParsedMod && draftMod && (
                <div>
                  <SegHead label={m.importDiffTitle} className="mb-1.5" />
                  <ModDiffPreview draft={importParsedMod} baseline={draftMod} />
                </div>
              )}
            </div>
          )}

          {importError && (
            <div className="flex items-start gap-1.5 border border-[rgba(255,61,113,0.38)] bg-[rgba(255,61,113,0.12)] px-2 py-1.5 font-mono text-[10.5px] leading-relaxed text-[var(--arc-alert)] whitespace-pre-wrap">
              <WarningIcon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" /> {importError}
            </div>
          )}

          <div className="flex items-center justify-end gap-1.5">
            <Btn size="sm" variant="ghost" onClick={onCloseImport}>
              {m.cancel}
            </Btn>
            <Btn
              size="sm"
              variant="signal"
              onClick={onImportConfirm}
              disabled={!importJson.trim()}
              icon={<UploadIcon className="h-3.5 w-3.5" />}
            >
              {m.importConfirmBtn}
            </Btn>
          </div>
        </SceneModal>
      )}
    </>
  );
}
