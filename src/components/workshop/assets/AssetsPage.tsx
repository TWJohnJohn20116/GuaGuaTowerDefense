/**
 * 資產庫 — 六類資產的瀏覽、建立、刪除（被引用時阻擋）
 */
import { useMemo, useState } from 'react';
import { useTranslation } from '@/i18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';
import { useWorkshopStore } from '@/store/workshopStore';
import type { WorkshopAssetKind } from '@/types/workshop';
import { Btn, Deck, Empty, Input, Num, SegHead } from '@/components/hl';
import { PlusIcon, TrashIcon } from '@/components/ui/Icons';

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

  const assets = listAssets(kind);

  const usage = useMemo(() => {
    const map = new Map<string, number>();
    for (const project of projects) {
      for (const ref of project.assets ?? []) {
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

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {KINDS.map((item) => (
          <Btn key={item} size="sm" variant={kind === item ? 'signal' : 'line'} onClick={() => setKind(item)}>
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
            createAsset(kind, name.trim() || kindLabel[kind]);
            setName('');
            setMessage(null);
          }}
        >
          {s.newAsset}
        </Btn>
        {message && <span className="font-mono text-[10.5px] text-[var(--cn-alert-deep)]">{message}</span>}
      </div>

      <SegHead label={kindLabel[kind]} right={<Num value={String(assets.length).padStart(2, '0')} size="sm" tone="muted" />} />

      {assets.length === 0 ? (
        <Empty title={s.empty} />
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-y-auto md:grid-cols-2 xl:grid-cols-3">
          {assets.map((asset) => {
            const used = usage.get(asset.id) ?? 0;
            return (
              <Deck key={asset.id} tone="sunken" className="flex flex-col gap-1.5 p-2.5">
                <div className="truncate text-[12.5px] font-semibold text-[var(--cn-ink)]">{asset.name}</div>
                <div className="flex items-center gap-2 font-mono text-[10px] text-[var(--cn-ink-3)]">
                  <span>v{asset.version}</span>
                  <span>·</span>
                  <span>{fillTemplate(s.usedBy, { count: String(used) })}</span>
                  {(asset.dependsOn?.length ?? 0) > 0 && (
                    <>
                      <span>·</span>
                      <span>{fillTemplate(s.dependsOn, { count: String(asset.dependsOn?.length ?? 0) })}</span>
                    </>
                  )}
                </div>
                <div className="mt-auto">
                  <Btn
                    size="sm"
                    variant="ghost"
                    icon={<TrashIcon className="h-3.5 w-3.5" />}
                    onClick={() => {
                      const result = deleteAsset(asset.id);
                      setMessage(result.ok ? null : fillTemplate(s.cannotDelete, { reason: result.reason ?? '' }));
                    }}
                  >
                    {t.studio.common.delete}
                  </Btn>
                </div>
              </Deck>
            );
          })}
        </div>
      )}
    </div>
  );
}
