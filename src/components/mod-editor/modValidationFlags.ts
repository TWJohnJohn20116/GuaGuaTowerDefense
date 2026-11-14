/**
 * Mod 驗證 · 項目高亮輔助
 */
import type { ModValidationFlag, ModValidationResult } from '@/types/game';
import type { ContentTab } from '@/components/scenes/mod-editor-scene/ModEditorContentPanel';

export function getItemValidationLevel(
  flags: ModValidationFlag[] | undefined,
  tab: ContentTab,
  index: number,
): 'error' | 'warning' | null {
  if (!flags?.length) return null;
  if (flags.some((f) => f.tab === tab && f.index === index && f.level === 'error')) return 'error';
  if (flags.some((f) => f.tab === tab && f.index === index && f.level === 'warning')) return 'warning';
  return null;
}

export function countTabValidation(
  flags: ModValidationFlag[] | undefined,
  tab: ContentTab,
): { errors: number; warnings: number } {
  if (!flags?.length) return { errors: 0, warnings: 0 };
  return flags.reduce(
    (acc, f) => {
      if (f.tab !== tab) return acc;
      if (f.level === 'error') acc.errors += 1;
      else acc.warnings += 1;
      return acc;
    },
    { errors: 0, warnings: 0 },
  );
}

/** 驗證狀態標記：HARDLINE 用左緣 2px 線，不用 ring／光暈。 */
export function validationRingClass(level: 'error' | 'warning' | null): string {
  if (level === 'error') return 'border-l-2 border-l-[var(--hl-alarm)]';
  if (level === 'warning') return 'border-l-2 border-l-[var(--hl-caution)]';
  return '';
}

export function hasValidationFlags(result: ModValidationResult): boolean {
  return (result.flags?.length ?? 0) > 0;
}
