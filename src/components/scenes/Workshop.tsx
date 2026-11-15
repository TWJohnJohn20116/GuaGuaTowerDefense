/**
 * 創意工坊（重設計版）— 專案 / 關卡 / 內容 / 規則 / 資產 / 試玩 / 發佈
 *
 * 外殼只負責：左軌導覽、當前專案、頁面裝配。每一頁自己讀寫 workshopStore，
 * 不從外殼傳資料（唯一傳的是 projectId / levelId）。
 */
import { useMemo, useState } from 'react';
import { SceneShell } from '@/components/ui/SceneShell';
import { Num, Rail, RailItem, TopBar, Btn } from '@/components/hl';
import { WrenchIcon } from '@/components/ui/Icons';
import { useTranslation } from '@/i18n';
import { useEffect, useState } from 'react';
import { useWorkshopStore } from '@/store/workshopStore';
import { writeBackup } from '@/workshop/backup';
import { ProjectsPage, type StudioPage } from '@/components/workshop/projects/ProjectsPage';
import { AssetsPage } from '@/components/workshop/assets/AssetsPage';
import { LevelsPage } from '@/components/workshop/levels/LevelsPage';
import { ContentPage } from '@/components/workshop/content/ContentPage';
import { GraphPage } from '@/components/workshop/graph/GraphPage';
import PlaytestStage from '@/components/workshop/playtest/PlaytestStage';
import BalancePanel from '@/components/workshop/playtest/BalancePanel';
import { PublishPanel } from '@/components/workshop/publish/PublishPanel';

export default function Workshop() {
  const { t } = useTranslation();
  const s = t.studio;
  const [page, setPage] = useState<StudioPage>('projects');
  const [playtestLevelId, setPlaytestLevelId] = useState<string | null>(null);
  const projects = useWorkshopStore((state) => state.projects);
  const activeProjectId = useWorkshopStore((state) => state.activeProjectId);
  const setActiveProject = useWorkshopStore((state) => state.setActiveProject);
  const createProject = useWorkshopStore((state) => state.createProject);

  // 自動備份：store 每次變動都試寫（writeBackup 內部節流 20 秒、只留 3 份）
  useEffect(() => {
    const unsubscribe = useWorkshopStore.subscribe((state) => {
      writeBackup(state.projects, state.assets);
    });
    return unsubscribe;
  }, []);

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) ?? null,
    [projects, activeProjectId],
  );

  const pages: { id: StudioPage; label: string }[] = [
    { id: 'projects', label: s.nav.projects },
    { id: 'levels', label: s.nav.levels },
    { id: 'content', label: s.nav.content },
    { id: 'rules', label: s.nav.rules },
    { id: 'assets', label: s.nav.assets },
    { id: 'playtest', label: s.nav.playtest },
    { id: 'publish', label: s.nav.publish },
  ];

  const needsProject = page !== 'projects' && page !== 'assets';
  const missingProject = needsProject && !activeProject;

  useEffect(() => {
    setPlaytestLevelId(activeProject?.levels[0]?.id ?? null);
  }, [activeProject?.id]);

  const createTemplate = (kind: 'basic' | 'boss' | 'swarm') => {
    const name =
      kind === 'boss' ? s.dashboard.templateBoss : kind === 'swarm' ? s.dashboard.templateSwarm : s.dashboard.templateBasic;
    const id = createProject(name);
    setActiveProject(id);
    setPage('levels');
  };

  return (
    <SceneShell scrollable={false}>
      <div className="flex h-full w-full flex-col">
        <TopBar
          title={s.title}
          meta={s.subtitle}
          glyph={<WrenchIcon className="h-4 w-4" />}
          back={{ to: 'mainMenu' }}
          right={
            <div className="flex items-center gap-2">
              {activeProject && (
                <span className="max-w-[240px] truncate font-mono text-[10.5px] text-[var(--cn-ink-2)]">
                  {activeProject.name} · v{activeProject.version}
                </span>
              )}
              <Num value={String(projects.length).padStart(2, '0')} tone="muted" size="sm" />
            </div>
          }
        />

        <div className="flex min-h-0 flex-1">
          <Rail
            label={s.title}
            foot={
              <div className="flex items-center justify-between">
                <span className="arc-label">{s.nav.projects}</span>
                <Num value={String(projects.length).padStart(2, '0')} tone="ink" size="sm" />
              </div>
            }
          >
            {pages.map((item, index) => (
              <RailItem
                key={item.id}
                index={index + 1}
                label={item.label}
                active={page === item.id}
                onClick={() => setPage(item.id)}
              />
            ))}
          </Rail>

          <main className="flex min-h-0 min-w-0 flex-1 flex-col">
            {missingProject ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                <p className="text-[13px] text-[var(--cn-ink-2)]">{s.playtest.noProject}</p>
                <Btn size="sm" variant="signal" onClick={() => setPage('projects')}>
                  {s.nav.projects}
                </Btn>
              </div>
            ) : (
              <>
                {page === 'projects' && <ProjectsPage onNavigate={setPage} onCreateTemplate={createTemplate} />}
                {page === 'assets' && <AssetsPage />}
                {page === 'levels' && activeProject && <LevelsPage projectId={activeProject.id} />}
                {page === 'content' && activeProject && <ContentPage projectId={activeProject.id} />}
                {page === 'rules' && activeProject && <GraphPage projectId={activeProject.id} />}
                {page === 'playtest' && activeProject && (
                  <div className="flex min-h-0 flex-1 flex-col gap-2 p-3 lg:flex-row">
                    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="arc-label">{s.playtest.level}</span>
                        <select
                          value={playtestLevelId ?? ''}
                          onChange={(event) => setPlaytestLevelId(event.target.value || null)}
                          className="h-7 w-56 border border-[var(--cn-line)] bg-[var(--cn-card)] px-1.5 font-mono text-[11.5px] text-[var(--cn-ink)]"
                        >
                          {activeProject.levels.map((level) => (
                            <option key={level.id} value={level.id}>{level.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="min-h-0 flex-1">
                        <PlaytestStage projectId={activeProject.id} levelId={playtestLevelId ?? undefined} />
                      </div>
                    </div>
                    <aside className="w-full shrink-0 lg:w-[320px]">
                      <BalancePanel projectId={activeProject.id} levelId={playtestLevelId ?? undefined} />
                    </aside>
                  </div>
                )}
                {page === 'publish' && activeProject && <PublishPanel projectId={activeProject.id} />}
              </>
            )}
          </main>
        </div>
      </div>
    </SceneShell>
  );
}
