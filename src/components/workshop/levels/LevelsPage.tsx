/**
 * 關卡頁 — 關卡清單 ＋（地圖工作台 / 關卡設定）
 */
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '@/i18n';
import { useWorkshopStore } from '@/store/workshopStore';
import { createDefaultLevel } from '@/workshop/levels/defaults';
import { MapWorkbench } from '@/components/workshop/map/MapWorkbench';
import { LevelSettingsPanel } from './LevelSettingsPanel';
import { resolveLevelLocks, type LevelLockState } from '@/workshop/progress';
import { useWorkshopProgressStore } from '@/store/workshopProgressStore';
import { Btn, Deck, Empty, Num } from '@/components/hl';
import { PlusIcon, TrashIcon, MapIcon, SettingsIcon } from '@/components/ui/Icons';
import { SelectableRow } from '@/components/ui/SelectableRow';

interface LevelsPageProps {
  projectId: string;
}

type LevelTab = 'map' | 'settings';

export function LevelsPage({ projectId }: LevelsPageProps) {
  const { t } = useTranslation();
  const s = t.studio.levels;
  const project = useWorkshopStore((state) => state.getProject(projectId));
  const addLevel = useWorkshopStore((state) => state.addLevel);
  const deleteLevel = useWorkshopStore((state) => state.deleteLevel);
  const updateProject = useWorkshopStore((state) => state.updateProject);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<LevelTab>('map');

  const levels = useMemo(() => project?.levels ?? [], [project]);
  const completedIds = useWorkshopProgressStore((state) =>
    state.completed[projectId] ?? [],
  );
  const locks = useMemo(
    () => (project ? resolveLevelLocks(project, completedIds) : new Map<string, LevelLockState>()),
    [project, completedIds],
  );

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
              const level = createDefaultLevel(project.name + ' ' + (levels.length + 1));
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
              <SelectableRow
                key={level.id}
                active={level.id === selectedId}
                onClick={() => setSelectedId(level.id)}
                tone="line"
                className="mb-1 gap-2 border px-2 py-1.5"
              >
                <MapIcon className="h-3.5 w-3.5 shrink-0 text-[var(--cn-ink-3)]" />
                <span className="min-w-0 flex-1 truncate text-[12px]">{level.name}</span>
                {completedIds.includes(level.id) && (
                  <span className="shrink-0 font-mono text-[10px] text-[var(--cn-vital-text)]">✓</span>
                )}
                {locks.get(level.id)?.locked && (
                  <span className="shrink-0 font-mono text-[9.5px] text-[var(--cn-caution-text)]">{s.locked}</span>
                )}
              </SelectableRow>
            ))
          )}
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex h-10 shrink-0 items-center gap-1.5 border-b border-[var(--cn-line-soft)] px-3">
          <Btn size="sm" variant={tab === 'map' ? 'signal' : 'line'} icon={<MapIcon className="h-3.5 w-3.5" />} onClick={() => setTab('map')}>
            {s.tabMap}
          </Btn>
          <Btn size="sm" variant={tab === 'settings' ? 'signal' : 'line'} icon={<SettingsIcon className="h-3.5 w-3.5" />} onClick={() => setTab('settings')}>
            {s.tabSettings}
          </Btn>
          {selectedId && (
            <span className="ml-auto flex items-center gap-1">
              <Btn
                size="sm"
                variant="line"
                onClick={() => {
                  const index = levels.findIndex((level) => level.id === selectedId);
                  if (index <= 0) return;
                  const next = [...levels];
                  [next[index - 1], next[index]] = [next[index], next[index - 1]];
                  updateProject(projectId, { levels: next });
                }}
              >
                {s.moveUp}
              </Btn>
              <Btn
                size="sm"
                variant="line"
                onClick={() => {
                  const index = levels.findIndex((level) => level.id === selectedId);
                  if (index < 0 || index >= levels.length - 1) return;
                  const next = [...levels];
                  [next[index + 1], next[index]] = [next[index], next[index + 1]];
                  updateProject(projectId, { levels: next });
                }}
              >
                {s.moveDown}
              </Btn>
            </span>
          )}
          {selectedId && (
            <Btn
              size="sm"
              variant="ghost"
              icon={<TrashIcon className="h-3.5 w-3.5" />}
              onClick={() => {
                if (!window.confirm(t.studio.common.confirmDelete)) return;
                deleteLevel(projectId, selectedId);
              }}
            >
              {t.studio.common.delete}
            </Btn>
          )}
        </div>

        <div className="min-h-0 flex-1">
          {selectedId ? (
            tab === 'map' ? (
              <MapWorkbench projectId={projectId} levelId={selectedId} />
            ) : (
              <LevelSettingsPanel projectId={projectId} levelId={selectedId} />
            )
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
