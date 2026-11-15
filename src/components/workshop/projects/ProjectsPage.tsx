/**
 * 專案頁 — 專案卡片、專案資訊、工作檔匯出／匯入、自動備份還原
 */
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from '@/i18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';
import { useWorkshopStore } from '@/store/workshopStore';
import { readBackups, writeBackup } from '@/workshop/backup';
import { exportProjectFile, parseProjectFile } from '@/workshop/projectFile';
import { useWorkshopProgressStore } from '@/store/workshopProgressStore';
import { Btn, Deck, Empty, IconBtn, Input, Num, SegHead } from '@/components/hl';
import { PlusIcon, CopyIcon, TrashIcon, PlayIcon, MapIcon, DownloadIcon, UploadIcon } from '@/components/ui/Icons';

export type StudioPage =
  | 'projects'
  | 'levels'
  | 'content'
  | 'rules'
  | 'assets'
  | 'models'
  | 'playtest'
  | 'publish';

interface ProjectsPageProps {
  onNavigate: (page: StudioPage) => void;
  onCreateTemplate: (kind: 'basic' | 'boss' | 'swarm') => void;
}

export function ProjectsPage({ onNavigate, onCreateTemplate }: ProjectsPageProps) {
  const { t } = useTranslation();
  const s = t.studio;
  const projects = useWorkshopStore((state) => state.projects);
  const assets = useWorkshopStore((state) => state.assets);
  const activeProjectId = useWorkshopStore((state) => state.activeProjectId);
  const createProject = useWorkshopStore((state) => state.createProject);
  const duplicateProject = useWorkshopStore((state) => state.duplicateProject);
  const deleteProject = useWorkshopStore((state) => state.deleteProject);
  const setActiveProject = useWorkshopStore((state) => state.setActiveProject);
  const updateProject = useWorkshopStore((state) => state.updateProject);
  const upsertAsset = useWorkshopStore((state) => state.upsertAsset);
  const markCompleted = useWorkshopProgressStore((state) => state.markCompleted);

  const [name, setName] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const active = projects.find((project) => project.id === activeProjectId) ?? null;
  const sorted = useMemo(() => [...projects].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0)), [projects]);
  const backups = readBackups();

  const open = (id: string) => {
    setActiveProject(id);
    onNavigate('levels');
  };

  const handleExport = (): void => {
    if (!active) return;
    const completedIds = useWorkshopProgressStore.getState().completed[active.id] ?? [];
    const json = exportProjectFile(active, assets, completedIds);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = (active.name || 'project') + '.ggproject.json';
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage(s.dashboard.exported);
  };

  const handleImport = (file: File): void => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      const parsed = parseProjectFile(reader.result);
      if (!parsed.ok) {
        setMessage(fillTemplate(s.dashboard.importFailed, { reason: parsed.reason }));
        return;
      }
      const imported = parsed.file.project;
      const state = useWorkshopStore.getState();
      const existing = state.getProject(imported.id);
      const project = existing
        ? { ...imported, id: imported.id + '_copy_' + Date.now() }
        : imported;
      for (const asset of parsed.file.assets) upsertAsset(asset);
      const createdId = createProject(project.name);
      updateProject(createdId, { ...project, id: createdId });
      for (const levelId of parsed.file.completedLevels ?? []) {
        if (project.levels.some((level) => level.id === levelId)) markCompleted(createdId, levelId);
      }
      setActiveProject(createdId);
      writeBackup(useWorkshopStore.getState().projects, useWorkshopStore.getState().assets, true);
      setMessage(s.dashboard.imported);
    };
    reader.readAsText(file);
  };

  const restore = (at: number): void => {
    const backup = backups.find((item) => item.at === at);
    if (!backup) return;
    useWorkshopStore.setState({
      projects: backup.projects,
      assets: backup.assets,
      activeProjectId: backup.projects[0]?.id ?? null,
    });
    setMessage(s.dashboard.restored);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={s.dashboard.projectName} className="h-8 w-52 text-[12px]" />
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
        {/* 三組分開：建立 ｜ 從範本 ｜ 匯出匯入 —— 舊版五顆按鈕與一個標籤平排成一長串 */}
        <span aria-hidden="true" className="h-5 w-[2px] shrink-0 rounded-full bg-[rgba(46,36,64,0.28)]" />
        <span className="arc-label shrink-0">{s.dashboard.template}</span>
        <Btn size="sm" variant="line" onClick={() => onCreateTemplate('basic')}>{s.dashboard.templateBasic}</Btn>
        <Btn size="sm" variant="line" onClick={() => onCreateTemplate('boss')}>{s.dashboard.templateBoss}</Btn>
        <Btn size="sm" variant="line" onClick={() => onCreateTemplate('swarm')}>{s.dashboard.templateSwarm}</Btn>
        <span aria-hidden="true" className="h-5 w-[2px] shrink-0 rounded-full bg-[rgba(46,36,64,0.28)]" />

        <span className="ml-auto flex items-center gap-1.5">
          <Btn size="sm" variant="line" icon={<DownloadIcon className="h-3.5 w-3.5" />} onClick={handleExport}>
            {s.dashboard.exportFile}
          </Btn>
          <Btn size="sm" variant="line" icon={<UploadIcon className="h-3.5 w-3.5" />} onClick={() => fileRef.current?.click()}>
            {s.dashboard.importFile}
          </Btn>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) handleImport(file);
              event.target.value = '';
            }}
          />
        </span>
      </div>

      {message && <div className="font-mono text-[10.5px] text-[var(--cn-ink-2)]">{message}</div>}

      {active && (
        <Deck tone="sunken" className="flex flex-wrap items-end gap-2 p-2.5">
          <label className="flex min-w-[220px] flex-1 flex-col gap-1">
            <span className="arc-label">{s.dashboard.projectName}</span>
            <Input
              value={active.name}
              onChange={(event) => updateProject(active.id, { name: event.target.value })}
              className="h-7 w-full px-1.5 text-[12px]"
            />
          </label>
          <label className="flex min-w-[280px] flex-[2] flex-col gap-1">
            <span className="arc-label">{s.dashboard.projectDescription}</span>
            <Input
              value={active.description}
              onChange={(event) => updateProject(active.id, { description: event.target.value })}
              className="h-7 w-full px-1.5 text-[12px]"
            />
          </label>
          <span className="font-mono text-[10px] text-[var(--cn-ink-3)]">
            {fillTemplate(s.dashboard.levelsCount, { count: String(active.levels.length) })}
            {' · '}
            {fillTemplate(s.dashboard.assetsCount, { count: String(active.assetRefs.length) })}
          </span>
        </Deck>
      )}

      <SegHead label={s.nav.projects} right={<Num value={String(sorted.length).padStart(2, '0')} size="sm" tone="muted" />} />

      {sorted.length === 0 ? (
        <Empty title={s.dashboard.noProjects} hint={s.dashboard.noProjectsHint} />
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-1 content-start gap-2 overflow-y-auto md:grid-cols-2 xl:grid-cols-3">
          {sorted.map((project) => {
            const isActive = project.id === activeProjectId;
            return (
              <Deck key={project.id} tone={isActive ? 'raised' : 'sunken'} className="flex flex-col gap-2 p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold text-[var(--cn-ink)]">{project.name}</div>
                    <div className="truncate font-mono text-[10px] text-[var(--cn-ink-3)]">v{project.version} · {project.author || '—'}</div>
                  </div>
                  {isActive && (
                    <span className="shrink-0 border border-[var(--cn-line-mid)] px-1.5 py-0.5 font-mono text-[9px] text-[var(--cn-ink-2)]">
                      {s.common.apply}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px] text-[var(--cn-ink-3)]">
                  <span>{fillTemplate(s.dashboard.levelsCount, { count: String(project.levels.length) })}</span>
                  <span>·</span>
                  <span>{fillTemplate(s.dashboard.assetsCount, { count: String(project.assetRefs.length) })}</span>
                </div>
                {/* 主行動吃滿寬度，其餘三個收成圖示鍵：四顆同尺寸平排看不出哪個是主要動作 */}
                <div className="mt-auto flex items-center gap-1.5">
                  <Btn size="sm" variant="signal" icon={<PlayIcon className="h-3.5 w-3.5" />} className="flex-1" onClick={() => open(project.id)}>
                    {s.dashboard.open}
                  </Btn>
                  <IconBtn label={s.dashboard.playtest} className="h-8 w-8" onClick={() => { setActiveProject(project.id); onNavigate('playtest'); }}>
                    <MapIcon className="h-3.5 w-3.5" />
                  </IconBtn>
                  <IconBtn label={s.common.duplicate} className="h-8 w-8" onClick={() => duplicateProject(project.id)}>
                    <CopyIcon className="h-3.5 w-3.5" />
                  </IconBtn>
                  <IconBtn
                    label={s.common.delete}
                    className="h-8 w-8 text-[var(--cn-alert-deep)]"
                    onClick={() => {
                      if (!window.confirm(s.common.confirmDelete)) return;
                      deleteProject(project.id);
                    }}
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </IconBtn>
                </div>
              </Deck>
            );
          })}
        </div>
      )}

      {backups.length > 0 && (
        <Deck tone="sunken" className="flex flex-wrap items-center gap-2 p-2">
          <span className="arc-label">{s.dashboard.backups}</span>
          {backups.map((backup) => (
            <Btn key={backup.at} size="sm" variant="ghost" onClick={() => restore(backup.at)}>
              {new Date(backup.at).toLocaleString()} · {backup.projects.length}
            </Btn>
          ))}
        </Deck>
      )}
    </div>
  );
}
