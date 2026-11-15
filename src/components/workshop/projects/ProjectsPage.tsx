/**
 * 專案頁 — 工坊首頁：卡片、範本、複製／刪除、進入各頁
 */
import { useMemo, useState } from 'react';
import { useTranslation } from '@/i18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';
import { useWorkshopStore } from '@/store/workshopStore';
import { Btn, Deck, Empty, Input, Num, SegHead } from '@/components/hl';
import { PlusIcon, CopyIcon, TrashIcon, PlayIcon, MapIcon } from '@/components/ui/Icons';

export type StudioPage = 'projects' | 'levels' | 'content' | 'rules' | 'assets' | 'playtest' | 'publish';

interface ProjectsPageProps {
  onNavigate: (page: StudioPage) => void;
  /** 建立範本專案（由 shell 注入，避免這一頁依賴 playtest／map 實作） */
  onCreateTemplate: (kind: 'basic' | 'boss' | 'swarm') => void;
}

export function ProjectsPage({ onNavigate, onCreateTemplate }: ProjectsPageProps) {
  const { t } = useTranslation();
  const s = t.studio;
  const projects = useWorkshopStore((state) => state.projects);
  const activeProjectId = useWorkshopStore((state) => state.activeProjectId);
  const createProject = useWorkshopStore((state) => state.createProject);
  const duplicateProject = useWorkshopStore((state) => state.duplicateProject);
  const deleteProject = useWorkshopStore((state) => state.deleteProject);
  const setActiveProject = useWorkshopStore((state) => state.setActiveProject);

  const [name, setName] = useState('');

  const sorted = useMemo(
    () => [...projects].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0)),
    [projects],
  );

  const open = (id: string) => {
    setActiveProject(id);
    onNavigate('levels');
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={s.dashboard.projectName}
          className="h-8 w-56 text-[12px]"
        />
        <Btn
          size="sm"
          variant="signal"
          icon={<PlusIcon className="h-3.5 w-3.5" />}
          onClick={() => {
            const id = createProject(name.trim() || s.dashboard.newProject);
            setName('');
            setActiveProject(id);
          }}
        >
          {s.dashboard.newProject}
        </Btn>
        <span className="arc-label ml-2">{s.dashboard.template}</span>
        <Btn size="sm" variant="line" onClick={() => onCreateTemplate('basic')}>{s.dashboard.templateBasic}</Btn>
        <Btn size="sm" variant="line" onClick={() => onCreateTemplate('boss')}>{s.dashboard.templateBoss}</Btn>
        <Btn size="sm" variant="line" onClick={() => onCreateTemplate('swarm')}>{s.dashboard.templateSwarm}</Btn>
      </div>

      <SegHead label={s.nav.projects} right={<Num value={String(sorted.length).padStart(2, '0')} size="sm" tone="muted" />} />

      {sorted.length === 0 ? (
        <Empty title={s.dashboard.noProjects} hint={s.dashboard.noProjectsHint} />
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-y-auto md:grid-cols-2 xl:grid-cols-3">
          {sorted.map((project) => {
            const active = project.id === activeProjectId;
            return (
              <Deck key={project.id} tone={active ? 'plain' : 'sunken'} className="flex flex-col gap-2 p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold text-[var(--cn-ink)]">{project.name}</div>
                    <div className="truncate font-mono text-[10px] text-[var(--cn-ink-3)]">
                      v{project.version} · {project.author || '—'}
                    </div>
                  </div>
                  {active && (
                    <span className="shrink-0 border border-[var(--cn-line-mid)] px-1.5 py-0.5 font-mono text-[9px] text-[var(--cn-ink-2)]">
                      {s.common.apply}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 font-mono text-[10px] text-[var(--cn-ink-3)]">
                  <span>{fillTemplate(s.dashboard.levelsCount, { count: String(project.levels?.length ?? 0) })}</span>
                  <span>·</span>
                  <span>{fillTemplate(s.dashboard.assetsCount, { count: String(project.assets?.length ?? 0) })}</span>
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-1.5">
                  <Btn size="sm" variant="signal" icon={<PlayIcon className="h-3.5 w-3.5" />} onClick={() => open(project.id)}>
                    {s.dashboard.open}
                  </Btn>
                  <Btn size="sm" variant="line" icon={<MapIcon className="h-3.5 w-3.5" />} onClick={() => { setActiveProject(project.id); onNavigate('playtest'); }}>
                    {s.dashboard.playtest}
                  </Btn>
                  <Btn size="sm" variant="line" icon={<CopyIcon className="h-3.5 w-3.5" />} onClick={() => duplicateProject(project.id)}>
                    {s.common.duplicate}
                  </Btn>
                  <Btn
                    size="sm"
                    variant="ghost"
                    icon={<TrashIcon className="h-3.5 w-3.5" />}
                    onClick={() => {
                      if (!window.confirm(s.common.confirmDelete)) return;
                      deleteProject(project.id);
                    }}
                  >
                    {s.common.delete}
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
