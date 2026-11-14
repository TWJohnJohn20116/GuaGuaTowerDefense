/**
 * Mod 驗證結果面板
 */
import type { ModValidationResult } from '@/types/game';
import { CheckIcon, WarningIcon, XIcon } from '@/components/ui/Icons';
import { useTranslation } from '@/i18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';

interface ModValidationPanelProps {
  result: ModValidationResult;
  className?: string;
}

export function ModValidationPanel({ result, className = '' }: ModValidationPanelProps) {
  const { t } = useTranslation();
  const m = t.modEditorExt;

  if (result.valid && result.warnings.length === 0) {
    return (
      <div
        className={`flex items-center gap-2 border border-[rgba(53,224,138,0.38)] bg-[rgba(53,224,138,0.06)] px-2.5 py-2 ${className}`}
      >
        <CheckIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--arc-vital)]" />
        <span className="arc-label text-[var(--arc-vital)]">{m.allNormal}</span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {result.errors.length > 0 && (
        <div className="border border-[rgba(255,61,113,0.38)] bg-[rgba(255,61,113,0.06)]">
          <div className="flex items-center gap-2 border-b border-[rgba(255,61,113,0.24)] px-2.5 py-1.5">
            <XIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--arc-alert)]" />
            <span className="arc-label text-[var(--arc-alert)]">
              {fillTemplate(m.valErrorsTitle, { count: result.errors.length })}
            </span>
          </div>
          <ul className="divide-y divide-[var(--arc-line)]">
            {result.errors.map((err) => (
              <li
                key={err}
                className="flex items-start gap-2 px-2.5 py-1.5 text-[11px] leading-relaxed text-[var(--arc-ink-2)]"
              >
                <span className="mt-[5px] h-1.5 w-1.5 flex-shrink-0 bg-[var(--arc-alert)]" aria-hidden="true" />
                <span className="min-w-0">{err}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.warnings.length > 0 && (
        <div className="border border-[rgba(255,182,39,0.38)] bg-[rgba(255,182,39,0.06)]">
          <div className="flex items-center gap-2 border-b border-[rgba(255,182,39,0.24)] px-2.5 py-1.5">
            <WarningIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--arc-caution)]" />
            <span className="arc-label text-[var(--arc-caution)]">
              {m.suggestions}
              <span className="ml-1.5 font-mono tabular-nums text-[var(--arc-caution)]">
                {result.warnings.length}
              </span>
            </span>
          </div>
          <ul className="divide-y divide-[var(--arc-line)]">
            {result.warnings.map((warn) => (
              <li
                key={warn}
                className="flex items-start gap-2 px-2.5 py-1.5 text-[11px] leading-relaxed text-[var(--arc-ink-2)]"
              >
                <span className="mt-[5px] h-1.5 w-1.5 flex-shrink-0 bg-[var(--arc-caution)]" aria-hidden="true" />
                <span className="min-w-0">{warn}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.valid && result.warnings.length > 0 && (
        <div className="flex items-center gap-2 border border-[rgba(53,224,138,0.38)] bg-[rgba(53,224,138,0.06)] px-2.5 py-1.5">
          <CheckIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--arc-vital)]" />
          <span className="text-[11px] leading-snug text-[var(--arc-vital)]">{m.valSaveWithWarnings}</span>
        </div>
      )}
    </div>
  );
}
