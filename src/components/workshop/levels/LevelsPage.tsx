/**
 * 關卡頁 — 關卡清單 ＋ 地圖工作台
 *
 * 地圖工作台由 map 線提供（真實渲染）；這一頁只負責選關卡與增刪。
 */
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '@/i18n';
import { useWorkshopStore } from '@/store/workshopStore';
import { createDefaultLevel } from '@/workshop/levels/defaults';
import { MapWorkbench } from '@/components/workshop/map/MapWorkbench';
import { Btn, Deck, Empty, Num, SegHead } from '@/components/hl';
import { PlusIcon, TrashIcon, MapIcon } from '@/components/ui/Icons';

interface LevelsPageProps {
  projectId: string;
}

export function LevelsPage({ projectId }: LevelsPageProps) {
  const { t } = useTranslation();
  const s = t.studio.levels;
  const project = useWorkshopStore((state) => state.getProject(projectId));
  const addLevel = useWorkshopStore((state) => state.addLevel);
  const updateLevel = useWorkshopStore((state) => state.updateLevel);
  const deleteLevel = useWorkshopStore((state) => state.deleteLevel);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const levels = useMemo(() => project?.levels ?? [], [project]);

  useEffect(() => {
    if (levels.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !levels.some((level) => level.id === selectedId)) {
      setSelectedId(levels[0].id);
    }
  }, [levels, selectedId]);

  if (!project) return <Empty title={t.studio.playtest.noProject} />;

  return (
    <div className="flex min-h-0 flex-1">
      <aside className="flex w-[214px] shrink-0 flex-col border-r border-[var(--cn-line-soft)]">
        <div className="flex items-center gap-1.5 border-b border-[var(--cn-line-soft)] p-2">
          <Btn
            size="sm"
            variant="signal"
            icon={<PlusIcon className="h-3.5 w-3.5" />}
            onClick={() => {
              const level = createDefaultLevel(`${project.name} ${levels.length + 1}`);
              addLevel(projectId, level);
              setSelectedId(level.id);
            }}
          >
            {s.newLevel}
          </Btn>
          <Num value={String(levels.length).padStart(2, '0')} size="sm" tone="muted" className="ml-auto" />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {levels.length === 0 ? (
            <p className="p-2 text-center font-mono text-[10.5px] text-[var(--cn-ink-3)]">{s.noLevels}</p>
          ) : (
            levels.map((level) => (
              <button
                key={level.id}
                type="button"
                onClick={() => setSelectedId(level.id)}
                className={`mb-1 flex w-full items-center gap-2 border px-2 py-1.5 text-left transition-colors ${
                  level.id === selectedId
                    ? 'border-[var(--cn-line-mid)] bg-[var(--cn-card)] text-[var(--cn-ink)]'
                    : 'border-transparent text-[var(--cn-ink-2)] hover:bg-[var(--cn-card-2)]'
                }`}
              >
                <MapIcon className="h-3.5 w-3.5 shrink-0 text-[var(--cn-ink-3)]" />
                <span className="min-w-0 flex-1 truncate text-[12px]">{level.name}</span>
              </button>
            ))
          )}
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex h-10 shrink-0 items-center gap-2 border-b border-[var(--cn-line-soft)] px-3">
          <SegHead
            label={s.map}
            className="min-w-0 flex-1"
            right={
              selectedId ? (
                <span className="font-mono text-[10px] text-[var(--cn-ink-3)]">
                  {s.waves} {String(levels.find((level) => level.id === selectedId)?.waves.length ?? 0)}
                </span>
              ) : undefined
            }
          />
          {selectedId && (
            <>
              <Btn
                size="sm"
                variant="line"
                onClick={() => {
                  const level = levels.find((item) => item.id === selectedId);
                  if (level) updateLevel(projectId, level.id, { name: level.name });
                }}
              >
                {t.studio.common.apply}
              </Btn>
              <Btn
                size="sm"
                variant="ghost"
                icon={<TrashIcon className="h-3.5 w-3.5" />}
                onClick={() => {
                  if (!selectedId) return;
                  if (!window.confirm(t.studio.common.confirmDelete)) return;
                  deleteLevel(projectId, selectedId);
                }}
              >
                {t.studio.common.delete}
              </Btn>
            </>
          )}
        </div>

        <div className="min-h-0 flex-1">
          {selectedId ? (
            <MapWorkbench projectId={projectId} levelId={selectedId} />
          ) : (
            <Deck tone="sunken" className="m-3 p-4">
              <Empty title={s.noLevels} />
            </Deck>
          )}
        </div>
      </div>
    </div>
  );
}
