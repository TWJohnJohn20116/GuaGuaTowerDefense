/**
 * Mod 平衡 AI · 分類建議列表
 *
 * 分類只靠「1px 外框 + 左緣 2px 資料色條」區分，不用底色漸層。
 */
import { LightbulbIcon } from '@/components/ui/Icons';
import {
  groupBalanceSuggestions,
  attachCategoryLabels,
  type BalanceSuggestionItem,
} from './modBalanceSuggestionUtils';
import type { Translations } from '@/i18n';

interface ModBalanceSuggestionGroupsProps {
  items: BalanceSuggestionItem[];
  m: Translations['modEditorExt'];
}

const CATEGORY_ACCENT: Record<string, { frame: string; bar: string }> = {
  difficulty: { frame: 'border-[rgba(255,75,62,0.38)]', bar: 'bg-[var(--hl-alarm)]' },
  economy: { frame: 'border-[rgba(255,182,39,0.38)]', bar: 'bg-[var(--hl-caution)]' },
  waves: { frame: 'border-[var(--hl-line-strong)]', bar: 'bg-[var(--hl-ink-3)]' },
  counters: { frame: 'border-[rgba(111,168,255,0.38)]', bar: 'bg-[var(--hl-reach)]' },
  general: { frame: 'border-[var(--hl-line)]', bar: 'bg-[var(--hl-ink-4)]' },
};

export function ModBalanceSuggestionGroups({ items, m }: ModBalanceSuggestionGroupsProps) {
  const groups = attachCategoryLabels(groupBalanceSuggestions(items), m);
  if (groups.length === 0) return null;

  return (
    <div className="space-y-2">
      {groups.map((group) => {
        const accent = CATEGORY_ACCENT[group.category] ?? CATEGORY_ACCENT.general;
        return (
          <div key={group.category} className={`border bg-[var(--hl-void-2)] ${accent.frame}`}>
            <div className="flex items-center gap-2 border-b border-[var(--hl-line)] px-2 py-1.5">
              <span className={`h-2.5 w-[2px] flex-shrink-0 ${accent.bar}`} aria-hidden="true" />
              <span className="hl-label">{group.label}</span>
              <span className="h-px flex-1 bg-[var(--hl-line)]" aria-hidden="true" />
              <span className="font-mono text-[10px] tabular-nums leading-none text-[var(--hl-ink-4)]">
                {String(group.items.length).padStart(2, '0')}
              </span>
            </div>
            <ul className="divide-y divide-[var(--hl-line)]">
              {group.items.map((tip) => (
                <li key={tip} className="flex items-start gap-2 px-2 py-1.5">
                  <LightbulbIcon className="mt-0.5 h-3 w-3 flex-shrink-0 text-[var(--hl-caution)]" />
                  <span className="min-w-0 text-[11px] leading-relaxed text-[var(--hl-ink-2)]">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
