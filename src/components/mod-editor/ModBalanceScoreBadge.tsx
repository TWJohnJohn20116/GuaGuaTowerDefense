/**
 * Mod 平衡評分徽章（列表 / 詳情用）
 */
import { useMemo } from 'react';
import type { Mod } from '@/types/game';
import { useTranslation } from '@/i18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';
import { analyzeModBalance } from './modBalanceAnalysis';
import { ChartIcon } from '@/components/ui/Icons';

function scoreStyle(score: number, m: ReturnType<typeof useTranslation>['t']['modEditorExt']) {
  if (score >= 70) return { color: 'text-[var(--arc-vital)]', bg: 'bg-[rgba(53,224,138,0.12)]', border: 'border-[rgba(53,224,138,0.38)]', label: m.balBadgeEasy };
  if (score >= 45) return { color: 'text-[var(--arc-caution)]', bg: 'bg-[rgba(255,182,39,0.12)]', border: 'border-[rgba(255,182,39,0.38)]', label: m.balBadgeMedium };
  return { color: 'text-[var(--arc-alert)]', bg: 'bg-[rgba(255,61,113,0.12)]', border: 'border-[rgba(255,61,113,0.38)]', label: m.balBadgeHard };
}

interface ModBalanceScoreBadgeProps {
  mod: Mod;
  size?: 'sm' | 'md';
  className?: string;
}

export function ModBalanceScoreBadge({ mod, size = 'sm', className = '' }: ModBalanceScoreBadgeProps) {
  const { t } = useTranslation();
  const m = t.modEditorExt;
  const analysis = useMemo(
    () => analyzeModBalance(
      mod.content.towers ?? [],
      mod.content.enemies ?? [],
      mod.content.waves ?? [],
      m,
    ),
    [mod, m],
  );

  const hasContent =
    (mod.content.towers?.length ?? 0) > 0 ||
    (mod.content.enemies?.length ?? 0) > 0 ||
    (mod.content.waves?.length ?? 0) > 0;

  if (!hasContent) return null;

  const style = scoreStyle(analysis.score, m);
  const pad = size === 'sm' ? 'px-2 py-1 text-[9px]' : 'px-3 py-1.5 text-[10px]';

  return (
    <span
      className={`inline-flex items-center gap-1  border font-mono uppercase tracking-[0.08em] ${pad} ${style.bg} ${style.border} ${style.color} ${className}`}
      title={fillTemplate(m.balBadgeTitle, { score: String(analysis.score), label: style.label })}
    >
      <ChartIcon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {analysis.score}
    </span>
  );
}
