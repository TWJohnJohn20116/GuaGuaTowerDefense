/**
 * Mod 版本差異 · 視覺化條狀對比
 *
 * 只用 1px 線與方塊：當前值＝實色塊，基準值＝1px 垂直刻線。
 */
import { useMemo } from 'react';
import type { Mod } from '@/types/game';
import { useTranslation } from '@/i18n';

function sectionCounts(mod: Mod) {
  return {
    towers: mod.content.towers?.length ?? 0,
    enemies: mod.content.enemies?.length ?? 0,
    maps: mod.content.maps?.length ?? 0,
    waves: mod.content.waves?.reduce((s, ws) => s + ws.waves.length, 0) ?? 0,
  };
}

const FILL = {
  reach: 'bg-[var(--arc-reach)]',
  alarm: 'bg-[var(--arc-alert)]',
  vital: 'bg-[var(--arc-vital)]',
  caution: 'bg-[var(--arc-caution)]',
} as const;

type FillTone = keyof typeof FILL;

interface ModDiffVisualBarsProps {
  draft: Mod;
  baseline: Mod | null;
  className?: string;
}

export function ModDiffVisualBars({ draft, baseline, className = '' }: ModDiffVisualBarsProps) {
  const { t } = useTranslation();
  const m = t.modEditorExt;

  const rows = useMemo(() => {
    const cur = sectionCounts(draft);
    const base = baseline ? sectionCounts(baseline) : null;
    return [
      { key: 'towers', label: m.tabTowers, cur: cur.towers, base: base?.towers ?? 0, tone: 'reach' as FillTone },
      { key: 'enemies', label: m.tabEnemies, cur: cur.enemies, base: base?.enemies ?? 0, tone: 'alarm' as FillTone },
      { key: 'maps', label: m.tabMaps, cur: cur.maps, base: base?.maps ?? 0, tone: 'vital' as FillTone },
      { key: 'waves', label: m.tabWaves, cur: cur.waves, base: base?.waves ?? 0, tone: 'caution' as FillTone },
    ];
  }, [draft, baseline, m.tabTowers, m.tabEnemies, m.tabMaps, m.tabWaves]);

  const maxVal = Math.max(...rows.map((r) => Math.max(r.cur, r.base)), 1);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 bg-[var(--arc-ink-2)]" aria-hidden="true" />
          <span className="arc-label">{m.diffVisualDraft}</span>
        </span>
        {baseline && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-px bg-[var(--arc-line-hot)]" aria-hidden="true" />
            <span className="arc-label">{m.diffVisualBaseline}</span>
          </span>
        )}
      </div>

      {rows.map((row) => {
        const delta = baseline ? row.cur - row.base : 0;
        const curW = (row.cur / maxVal) * 100;
        const baseW = baseline ? (row.base / maxVal) * 100 : 0;
        return (
          <div key={row.key} className="space-y-1">
            <div className="flex items-baseline justify-between gap-3">
              <span className="arc-label">{row.label}</span>
              <span className="font-mono text-[11px] tabular-nums font-semibold leading-none text-[var(--arc-ink)]">
                {row.cur}
                {baseline && (
                  <span
                    className={
                      delta > 0
                        ? 'text-[var(--arc-vital)]'
                        : delta < 0
                          ? 'text-[var(--arc-alert)]'
                          : 'text-[var(--arc-ink-4)]'
                    }
                  >
                    {delta > 0 ? ` (+${delta})` : delta < 0 ? ` (${delta})` : ''}
                  </span>
                )}
              </span>
            </div>
            <div className="relative h-2 border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)]">
              {baseline && baseW > 0 && (
                <span
                  className="absolute inset-y-0 w-px bg-[var(--arc-line-hot)]"
                  style={{ left: `${baseW}%` }}
                  aria-hidden="true"
                />
              )}
              <span
                className={`absolute inset-y-0 left-0 transition-all ${FILL[row.tone]}`}
                style={{ width: `${curW}%` }}
                aria-hidden="true"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
