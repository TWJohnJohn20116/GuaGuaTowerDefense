/**
 * Mod 草稿 vs 已安裝版本差異對比
 */
import { useMemo } from 'react';
import type { Mod, CustomTowerData, CustomEnemyData, CustomMapData, CustomWaveData } from '@/types/game';
import { DocumentIcon } from '@/components/ui/Icons';
import { useTranslation } from '@/i18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';
import { ModDiffVisualBars } from '@/components/mod-editor/ModDiffVisualBars';
import { Deck, SegHead } from '@/components/hl';

function countDiff<T extends { id: string; name: string }>(
  current: T[],
  baseline: T[],
): { added: T[]; removed: T[]; changed: string[] } {
  const baseMap = new Map(baseline.map((x) => [x.id, x]));
  const curMap = new Map(current.map((x) => [x.id, x]));
  const added = current.filter((x) => !baseMap.has(x.id));
  const removed = baseline.filter((x) => !curMap.has(x.id));
  const changed: string[] = [];
  current.forEach((x) => {
    const b = baseMap.get(x.id);
    if (b && JSON.stringify(b) !== JSON.stringify(x)) changed.push(x.name);
  });
  return { added, removed, changed };
}

interface ModDiffPreviewProps {
  draft: Mod;
  baseline: Mod | null;
  className?: string;
}

export function ModDiffPreview({ draft, baseline, className = '' }: ModDiffPreviewProps) {
  const { t } = useTranslation();
  const m = t.modEditorExt;

  const diff = useMemo(() => {
    if (!baseline) return null;
    return {
      meta: {
        name: draft.metadata.name !== baseline.metadata.name,
        version: draft.metadata.version !== baseline.metadata.version,
        description: draft.metadata.description !== baseline.metadata.description,
      },
      towers: countDiff(draft.content.towers ?? [], baseline.content.towers ?? []),
      enemies: countDiff(draft.content.enemies ?? [], baseline.content.enemies ?? []),
      maps: countDiff(draft.content.maps ?? [], baseline.content.maps ?? []),
      waves: countDiff(draft.content.waves ?? [], baseline.content.waves ?? []),
    };
  }, [draft, baseline]);

  if (!diff) {
    return (
      <Deck
        tone="sunken"
        className={`px-2.5 py-2 text-[11px] leading-snug text-[var(--hl-ink-3)] ${className}`}
      >
        {m.diffSaveToCompare}
      </Deck>
    );
  }

  const hasMeta = diff.meta.name || diff.meta.version || diff.meta.description;
  const sections = [
    { label: m.tabTowers, d: diff.towers },
    { label: m.tabEnemies, d: diff.enemies },
    { label: m.tabMaps, d: diff.maps },
    { label: m.tabWaves, d: diff.waves },
  ];

  const hasAny = hasMeta || sections.some((s) => s.d.added.length || s.d.removed.length || s.d.changed.length);
  if (!hasAny) {
    return (
      <div
        className={`flex items-center gap-2 border border-[rgba(56,224,143,0.38)] bg-[rgba(56,224,143,0.06)] px-2.5 py-2 ${className}`}
      >
        <span className="h-1.5 w-1.5 flex-shrink-0 bg-[var(--hl-vital)]" aria-hidden="true" />
        <span className="text-[11px] leading-snug text-[var(--hl-vital)]">{m.diffSameAsInstalled}</span>
      </div>
    );
  }

  return (
    <Deck tone="sunken" className={`space-y-2 p-2.5 ${className}`}>
      <SegHead
        label={
          <span className="flex items-center gap-1.5">
            <DocumentIcon className="h-3 w-3" />
            {m.diffVersionTitle}
          </span>
        }
      />

      <ModDiffVisualBars draft={draft} baseline={baseline} />

      {hasMeta && (
        <p className="flex items-start gap-2 border-t border-[var(--hl-line)] pt-2 text-[11px] leading-relaxed text-[var(--hl-caution)]">
          <span className="mt-[5px] h-1.5 w-1.5 flex-shrink-0 bg-[var(--hl-caution)]" aria-hidden="true" />
          <span className="min-w-0">
            {m.diffMetaChanged}
            {diff.meta.name && m.diffMetaName}
            {diff.meta.version && m.diffMetaVersion}
            {diff.meta.description && m.diffMetaDesc}
          </span>
        </p>
      )}

      {sections.map(({ label, d }) => {
        if (!d.added.length && !d.removed.length && !d.changed.length) return null;
        return (
          <div key={label} className="space-y-1 border-t border-[var(--hl-line)] pt-2">
            <span className="hl-label text-[var(--hl-ink-2)]">{label}</span>
            {d.added.length > 0 && (
              <p className="flex items-start gap-2 text-[11px] leading-relaxed text-[var(--hl-ink-2)]">
                <span className="mt-[5px] h-1.5 w-1.5 flex-shrink-0 bg-[var(--hl-vital)]" aria-hidden="true" />
                <span className="min-w-0">
                  {fillTemplate(m.diffAdded, { names: d.added.map((x) => x.name).join('、') })}
                </span>
              </p>
            )}
            {d.removed.length > 0 && (
              <p className="flex items-start gap-2 text-[11px] leading-relaxed text-[var(--hl-ink-2)]">
                <span className="mt-[5px] h-1.5 w-1.5 flex-shrink-0 bg-[var(--hl-alarm)]" aria-hidden="true" />
                <span className="min-w-0">
                  {fillTemplate(m.diffRemoved, { names: d.removed.map((x) => x.name).join('、') })}
                </span>
              </p>
            )}
            {d.changed.length > 0 && (
              <p className="flex items-start gap-2 text-[11px] leading-relaxed text-[var(--hl-ink-2)]">
                <span className="mt-[5px] h-1.5 w-1.5 flex-shrink-0 bg-[var(--hl-caution)]" aria-hidden="true" />
                <span className="min-w-0">
                  {fillTemplate(m.diffChanged, { names: d.changed.join('、') })}
                </span>
              </p>
            )}
          </div>
        );
      })}
    </Deck>
  );
}

export function buildModFromDraft(
  meta: { id: string; name: string; description: string; version: string; author: string; type: Mod['metadata']['type']; icon: string },
  content: { towers: CustomTowerData[]; enemies: CustomEnemyData[]; maps: CustomMapData[]; waves: CustomWaveData[] },
  customTag: string,
): Mod {
  return {
    metadata: {
      id: meta.id,
      name: meta.name,
      version: meta.version,
      author: meta.author,
      description: meta.description,
      type: meta.type,
      icon: meta.icon,
      gameVersion: '2.3.0',
      tags: [customTag],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    },
    content: {
      towers: content.towers.length ? content.towers : undefined,
      enemies: content.enemies.length ? content.enemies : undefined,
      maps: content.maps.length ? content.maps : undefined,
      waves: content.waves.length ? content.waves : undefined,
    },
    enabled: false,
    loadOrder: 999,
  };
}
