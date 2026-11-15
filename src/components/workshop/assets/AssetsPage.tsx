/**
 * 資產庫 — 六類資產的瀏覽、建立、編輯、刪除（被引用時阻擋）
 */
import { useMemo, useState } from 'react';
import { useTranslation } from '@/i18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';
import { useWorkshopStore } from '@/store/workshopStore';
import type { WorkshopAssetKind } from '@/types/workshop';
import { Btn, Empty, Input, Num, SegHead } from '@/components/hl';
import { PlusIcon, TrashIcon } from '@/components/ui/Icons';
import { AssetEditorPanel } from './AssetEditorPanel';

const KINDS: WorkshopAssetKind[] = ['tower', 'enemy', 'map', 'ruleSet', 'script', 'art'];

export function AssetsPage() {
  const { t } = useTranslation();
  const s = t.studio.assets;
  const projects = useWorkshopStore((state) => state.projects);
  const listAssets = useWorkshopStore((state) => state.listAssets);
  const createAsset = useWorkshopStore((state) => state.createAsset);
  const deleteAsset = useWorkshopStore((state) => state.deleteAsset);

  const [kind, setKind] = useState<WorkshopAssetKind>('tower');
  const [name, setName] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const assets = listAssets(kind);

  const usage = useMemo(() => {
    const map = new Map<string, number>();
    for (const project of projects) {
      for (const ref of project.assetRefs ?? []) {
        map.set(ref.assetId, (map.get(ref.assetId) ?? 0) + 1);
      }
    }
    return map;
  }, [projects]);

  const kindLabel: Record<WorkshopAssetKind, string> = {
    tower: s.towers,
    enemy: s.enemies,
    map: s.maps,
    ruleSet: s.ruleSets,
    script: s.scripts,
    art: s.art,
  };

  const activeId = selectedId && assets.some((asset) => asset.id === selectedId) ? selectedId : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {KINDS.map((item) => (
          <Btn
            key={item}
            size="sm"
            variant={kind === item ? 'signal' : 'line'}
            onClick={() => {
              setKind(item);
              setSelectedId(null);
            }}
          >
            {kindLabel[item]}
          </Btn>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={s.newAsset}
          className="h-8 w-56 text-[12px]"
        />
        <Btn
          size="sm"
          variant="signal"
          icon={<PlusIcon className="h-3.5 w-3.5" />}
          onClick={() => {
            const id = createAsset(kind, name.trim() || kindLabel[kind]);
            setName('');
            setMessage(null);
            setSelectedId(id);
          }}
        >
          {s.newAsset}
        </Btn>
        {message && <span className="font-mono text-[10.5px] text-[var(--cn-alert-deep)]">{message}</span>}
      </div>

      <div className="flex min-h-0 flex-1 gap-2">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
          <SegHead label={kindLabel[kind]} right={<Num value={String(assets.length).padStart(2, '0')} size="sm" tone="muted" />} />
          {assets.length === 0 ? (
            <Empty title={s.empty} />
          ) : (
            <div className="grid min-h-0 grid-cols-1 content-start gap-2 overflow-y-auto md:grid-cols-2 xl:grid-cols-3">
              {assets.map((asset) => {
                const used = usage.get(asset.id) ?? 0;
                const active = asset.id === activeId;
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => setSelectedId(asset.id)}
                    className={`flex flex-col gap-1.5 border p-2.5 text-left transition-colors ${
                      active
                        ? 'border-[var(--cn-signal-text)] bg-[var(--cn-card)]'
                        : 'border-[var(--cn-line-soft)] bg-[var(--cn-card-2)] hover:border-[var(--cn-line)]'
                    }`}
                  >
                    <span className="truncate text-[12.5px] font-semibold text-[var(--cn-ink)]">{asset.name}</span>
                    <span className="flex items-center gap-2 font-mono text-[10px] text-[var(--cn-ink-3)]">
                      <span>v{asset.version}</span>
                      <span>·</span>
                      <span>{fillTemplate(s.usedBy, { count: String(used) })}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <aside className="flex w-[360px] shrink-0 flex-col border border-[var(--cn-line-soft)] bg-[var(--cn-card-2)]">
          {activeId ? (
            <>
              <div className="flex items-center justify-between border-b border-[var(--cn-line-soft)] px-2.5 py-1.5">
                <span className="arc-label">{s.editor.title}</span>
                <Btn
                  size="sm"
                  variant="ghost"
                  icon={<TrashIcon className="h-3.5 w-3.5" />}
                  onClick={() => {
                    const result = deleteAsset(activeId);
                    setMessage(result.ok ? null : fillTemplate(s.cannotDelete, { reason: result.reason ?? '' }));
                    if (result.ok) setSelectedId(null);
                  }}
                >
                  {t.studio.common.delete}
                </Btn>
              </div>
              <div className="min-h-0 flex-1">
                <AssetEditorPanel assetId={activeId} />
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center p-4">
              <Empty title={s.editor.empty} />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
