/**
 * Mod 管理器 · 批次操作列 — HARDLINE 帶狀（h-9）
 */
import { useTranslation } from '@/i18n';
import { Btn, Num } from '@/components/hl';
import { CheckIcon, XIcon } from '@/components/ui/Icons';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';

interface ModManagerBatchBarProps {
  selectedCount: number;
  filteredTotal: number;
  onEnableSelected: () => void;
  onDisableSelected: () => void;
  onEnableFiltered: () => void;
  onDisableFiltered: () => void;
  onClearSelection: () => void;
}

export function ModManagerBatchBar({
  selectedCount,
  filteredTotal,
  onEnableSelected,
  onDisableSelected,
  onEnableFiltered,
  onDisableFiltered,
  onClearSelection,
}: ModManagerBatchBarProps) {
  const { t } = useTranslation();
  const b = t.modManager.batch;

  return (
    <div className="flex h-9 shrink-0 items-center gap-2 border-b border-[var(--cn-line-soft)] bg-[var(--arc-deck)] px-3">
      <span className="arc-label shrink-0">batch</span>

      {selectedCount > 0 ? (
        <>
          <Num
            value={fillTemplate(b.selectedCount, { count: String(selectedCount) })}
            size="sm"
            className="shrink-0 font-mono tabular-nums"
          />
          <span className="h-4 w-px shrink-0 bg-[var(--arc-line)]" aria-hidden="true" />
          <Btn size="sm" variant="line" onClick={onEnableSelected} icon={<CheckIcon className="h-3 w-3" />}>
            {b.enableSelected}
          </Btn>
          <Btn size="sm" variant="line" onClick={onDisableSelected} icon={<XIcon className="h-3 w-3" />}>
            {b.disableSelected}
          </Btn>
          <Btn size="sm" variant="ghost" onClick={onClearSelection}>
            {b.clearSelection}
          </Btn>
        </>
      ) : (
        <>
          <Num
            value={fillTemplate(b.filteredCount, { count: String(filteredTotal) })}
            size="sm"
            className="shrink-0 font-mono tabular-nums"
          />
          <span className="h-4 w-px shrink-0 bg-[var(--arc-line)]" aria-hidden="true" />
          <Btn size="sm" variant="line" onClick={onEnableFiltered} disabled={filteredTotal === 0}>
            {b.enableFiltered}
          </Btn>
          <Btn size="sm" variant="line" onClick={onDisableFiltered} disabled={filteredTotal === 0}>
            {b.disableFiltered}
          </Btn>
        </>
      )}

      <span className="ml-auto truncate font-mono text-[9.5px] uppercase tracking-[0.1em] text-[var(--arc-ink-4)]">
        {b.ctrlHint}
      </span>
    </div>
  );
}

export default ModManagerBatchBar;
