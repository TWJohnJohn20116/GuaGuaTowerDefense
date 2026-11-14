/**
 * Mod 編輯器 · 設定分頁 — HARDLINE 表單
 *
 * 欄位一律：mono 10px 標籤在上、控件在下，間距一致（gap-3），控件方角 1px 線。
 */
import type React from 'react';
import type { ModType } from '@/types/game';
import { useTranslation } from '@/i18n';
import { PaletteIcon } from '@/components/ui/Icons';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { renderModIcon } from '@/components/ui/ModIcon';
import { SegHead, Field } from '@/components/hl';

interface ModEditorSettingsTabProps {
  modName: string;
  modDescription: string;
  modAuthor: string;
  modVersion: string;
  modType: ModType;
  modIcon: string;
  onModNameChange: (v: string) => void;
  onModDescriptionChange: (v: string) => void;
  onModAuthorChange: (v: string) => void;
  onModVersionChange: (v: string) => void;
  onModTypeChange: (v: ModType) => void;
  onOpenIconEditor: () => void;
}

function L({ children }: { children: React.ReactNode }) {
  return <span className="hl-label block">{children}</span>;
}

export function ModEditorSettingsTab({
  modName,
  modDescription,
  modAuthor,
  modVersion,
  modType,
  modIcon,
  onModNameChange,
  onModDescriptionChange,
  onModAuthorChange,
  onModVersionChange,
  onModTypeChange,
  onOpenIconEditor,
}: ModEditorSettingsTabProps) {
  const { t } = useTranslation();
  const m = t.modEditorExt;

  return (
    <div className="mx-auto w-full max-w-[720px] px-4 py-4">
      <SegHead label={m.modBasicSettings} className="mb-3" />

      <div className="flex flex-col gap-3">
        {/* 圖示 + 名稱 */}
        <div className="flex gap-3">
          <div className="flex shrink-0 flex-col gap-1.5">
            <L>{m.modIconLabel}</L>
            <button
              type="button"
              onClick={onOpenIconEditor}
              className="group relative flex h-[88px] w-[88px] flex-col items-center justify-center overflow-hidden border border-[var(--hl-line)] bg-[var(--hl-void-2)] text-4xl transition-colors hover:border-[var(--hl-signal)]"
            >
              {modIcon ? (
                renderModIcon(modIcon, <PaletteIcon className="h-7 w-7 text-[var(--hl-ink-4)]" />, 'h-[88px] w-[88px] text-4xl')
              ) : (
                <PaletteIcon className="h-7 w-7 text-[var(--hl-ink-4)]" />
              )}
              <span className="absolute inset-x-0 bottom-0 bg-[var(--hl-void)] py-0.5 text-center font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--hl-ink-2)] opacity-0 transition-opacity group-hover:opacity-100">
                {m.editIcon}
              </span>
            </button>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <L>{m.modNameLabel}</L>
              <input
                value={modName}
                onChange={(e) => onModNameChange(e.target.value)}
                className="hl-input h-8 text-[12px]"
                placeholder={m.modNamePh}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <L>{m.versionLabel}</L>
                <input
                  value={modVersion}
                  onChange={(e) => onModVersionChange(e.target.value)}
                  className="hl-input h-8 font-mono text-[12px] tabular-nums"
                  placeholder="1.0.0"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <L>{m.authorLabel}</L>
                <input
                  value={modAuthor}
                  onChange={(e) => onModAuthorChange(e.target.value)}
                  className="hl-input h-8 text-[12px]"
                  placeholder={m.authorPh}
                />
              </div>
              <div className="relative z-40 flex flex-col gap-1.5">
                <L>{m.modTypeLabel}</L>
                <CustomSelect
                  value={modType}
                  onChange={(v) => onModTypeChange(v as ModType)}
                  options={[
                    { value: 'full', label: m.typeFull },
                    { value: 'tower', label: m.typeTowerPack },
                    { value: 'enemy', label: m.typeEnemyPack },
                    { value: 'map', label: m.typeMapPack },
                    { value: 'wave', label: m.typeWavePack },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 描述 */}
        <div className="flex flex-col gap-1.5">
          <L>{m.modDescLabel}</L>
          <textarea
            value={modDescription}
            onChange={(e) => onModDescriptionChange(e.target.value)}
            className="h-24 w-full resize-none border border-[var(--hl-line)] bg-[var(--hl-void-2)] px-2.5 py-2 text-[12px] leading-relaxed text-[var(--hl-ink-2)] outline-none transition-colors placeholder:text-[var(--hl-ink-4)] focus:border-[var(--hl-signal)]"
            placeholder={m.modDescPh}
          />
        </div>

        {/* 唯讀摘要 */}
        <div className="border border-[var(--hl-line)] bg-[var(--hl-deck)] px-3">
          <Field label={m.modTypeLabel}>
            <span className="font-mono text-[11px] text-[var(--hl-ink-2)]">{modType}</span>
          </Field>
          <Field label={m.versionLabel}>
            <span className="font-mono text-[11px] tabular-nums text-[var(--hl-ink-2)]">v{modVersion}</span>
          </Field>
        </div>
      </div>
    </div>
  );
}
