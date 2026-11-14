/**
 * Mod 管理器 · 匯入對話框（含驗證預覽）— HARDLINE Modal
 */
import { useMemo, useState } from 'react';
import type { Mod } from '@/types/game';
import { DownloadIcon, WarningIcon, CrossIcon } from '@/components/ui/Icons';
import { SceneModal } from '@/components/ui/SceneModal';
import { Btn, Deck, IconBtn, Num, SegHead } from '@/components/hl';
import { ModValidationPanel } from '@/components/mod-editor/ModValidationPanel';
import { ModDiffVisualBars } from '@/components/mod-editor/ModDiffVisualBars';
import { validateModContent } from '@/components/mod-editor/modValidation';
import { useModStore } from '@/store/modStore';
import { useTranslation } from '@/i18n';

interface ImportModDialogProps {
  onClose: () => void;
  onImport: (json: string) => void;
}

export function ImportModDialog({ onClose, onImport }: ImportModDialogProps) {
  const { t } = useTranslation();
  const w = t.workshop.modManagerExt;
  const m = t.modEditorExt;
  const mods = useModStore((s) => s.mods);
  const [json, setJson] = useState('');

  const parsed = useMemo(() => {
    if (!json.trim()) return null;
    try {
      const mod = JSON.parse(json) as Mod;
      if (!mod.metadata || !mod.content) return null;
      return mod;
    } catch {
      return null;
    }
  }, [json]);

  const preview = useMemo(() => {
    if (!parsed) return null;
    return validateModContent(parsed, {
      installedModIds: mods.map((mod) => mod.metadata.id),
    }, m);
  }, [parsed, mods, m]);

  const conflictMod = useMemo(() => {
    if (!parsed) return null;
    return mods.find((mod) => mod.metadata.id === parsed.metadata.id) ?? null;
  }, [parsed, mods]);

  const handleSubmit = () => {
    if (!json.trim()) return;
    onImport(json.trim());
  };

  return (
    <SceneModal
      onClose={onClose}
      maxWidth="max-w-xl"
      padding="p-4"
      zIndex="z-[200]"
      variant="solid"
      panelClassName="arc-cut-tl flex flex-col gap-3 arc-panel p-4"
    >
      <div className="flex items-center gap-2">
        <span className="arc-label">{w.importModTitle}</span>
        <span className="h-px flex-1 bg-[var(--arc-line)]" />
        <IconBtn
          label={t.common.close}
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center border-[3px] border-[var(--cn-line-soft)] text-[var(--arc-ink-3)] hover:border-[var(--arc-line-hot)] hover:text-[var(--arc-ink)]"
        >
          <CrossIcon className="h-3 w-3" />
        </IconBtn>
      </div>

      <textarea
        value={json}
        onChange={(e) => setJson(e.target.value)}
        placeholder={w.importModPh}
        spellCheck={false}
        className="h-48 w-full resize-none arc-panel arc-panel--sunken p-2.5 font-mono text-[11.5px] leading-relaxed text-[var(--arc-ink)] placeholder:text-[var(--arc-ink-4)] focus:border-[var(--arc-gold)] focus:outline-none"
      />

      {parsed && (
        <Deck tone="sunken" className="flex flex-col gap-2 p-2.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-[12.5px] font-medium text-[var(--arc-ink)]">{parsed.metadata.name}</span>
            <Num
              value={`v${parsed.metadata.version} · ${parsed.metadata.author}`}
              tone="muted"
              size="sm"
              className="shrink-0 font-mono tabular-nums"
            />
          </div>
          {preview && <ModValidationPanel result={preview} />}
          {conflictMod && (
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-1.5 border border-[rgba(255,182,39,0.38)] bg-[rgba(255,182,39,0.12)] px-2 py-1.5 text-[10.5px] text-[var(--arc-caution)]">
                <WarningIcon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                {m.modImportIdConflict}
              </div>
              <ModDiffVisualBars draft={parsed} baseline={conflictMod} />
            </div>
          )}
        </Deck>
      )}

      <div className="flex items-center gap-2">
        <SegHead label="import" className="flex-1" />
        <Btn
          variant="signal"
          onClick={handleSubmit}
          disabled={!json.trim() || (preview != null && !preview.valid)}
          icon={<DownloadIcon className="h-3.5 w-3.5" />}
        >
          {w.confirmImportMod}
        </Btn>
      </div>
    </SceneModal>
  );
}

export default ImportModDialog;
