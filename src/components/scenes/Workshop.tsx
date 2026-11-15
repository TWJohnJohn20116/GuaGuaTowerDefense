/**
 * 創意工坊（重設計版）— 專案 / 關卡 / 內容 / 規則 / 資產 / 試玩 / 發佈
 *
 * 外殼只負責：左軌導覽、當前專案、頁面裝配。每一頁自己讀寫 workshopStore，
 * 不從外殼傳資料（唯一傳的是 projectId / levelId）。
 */
import { useEffect, useMemo, useState } from 'react';
import { SceneShell } from '@/components/ui/SceneShell';
import { Num, Rail, RailItem, TopBar, Btn, Deck } from '@/components/hl';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { WrenchIcon, FolderIcon, MapIcon, NotepadIcon, PuzzleIcon, PackageIcon, BoxIcon, PlayIcon, UploadIcon } from '@/components/ui/Icons';
import { useTranslation } from '@/i18n';
import { useWorkshopStore } from '@/store/workshopStore';
import { writeBackup } from '@/workshop/backup';
import { resolveLevelLocks, type LevelLockState } from '@/workshop/progress';
import { useWorkshopProgressStore } from '@/store/workshopProgressStore';
import { useGameStore } from '@/store/gameStore';
import { ProjectsPage, type StudioPage } from '@/components/workshop/projects/ProjectsPage';
import { AssetsPage } from '@/components/workshop/assets/AssetsPage';
import { ModelsPage } from '@/components/workshop/models/ModelsPage';
import { LevelsPage } from '@/components/workshop/levels/LevelsPage';
import { ContentPage } from '@/components/workshop/content/ContentPage';
import { GraphPage } from '@/components/workshop/graph/GraphPage';
import PlaytestStage from '@/components/workshop/playtest/PlaytestStage';
import BalancePanel from '@/components/workshop/playtest/BalancePanel';
import { PublishPanel } from '@/components/workshop/publish/PublishPanel';

/** localStorage 的鍵：只存「側欄是否收合」這個版面偏好 */
const RAIL_COLLAPSED_KEY = 'guagua.workshop.railCollapsed';

export default function Workshop() {
  const { t } = useTranslation();
  const s = t.studio;
  const [page, setPage] = useState<StudioPage>('projects');
  const [playtestLevelId, setPlaytestLevelId] = useState<string | null>(null);
  // 側欄收合是「版面偏好」不是世界資料，所以放 localStorage，不進 workshopStore。
  // 沒有存過偏好時：窄版（<1024px）預設收合——236px 的側欄在手機上會把主區擠成一條縫。
  const [railCollapsed, setRailCollapsed] = useState<boolean>(() => {
    try {
      const stored = window.localStorage.getItem(RAIL_COLLAPSED_KEY);
      if (stored === '1') return true;
      if (stored === '0') return false;
    } catch {
      // 私密模式讀不到 localStorage：直接走下面的視口判斷
    }
    return window.matchMedia('(max-width: 1023px)').matches;
  });

  const toggleRail = () => {
    setRailCollapsed((previous) => {
      const next = !previous;
      try {
        window.localStorage.setItem(RAIL_COLLAPSED_KEY, next ? '1' : '0');
      } catch {
        // 私密模式或配額不足：收合狀態只在這次工作階段有效，不影響功能
      }
      return next;
    });
  };
  const projects = useWorkshopStore((state) => state.projects);
  const activeProjectId = useWorkshopStore((state) => state.activeProjectId);
  const setActiveProject = useWorkshopStore((state) => state.setActiveProject);
  const createProject = useWorkshopStore((state) => state.createProject);
  const completedIds = useWorkshopProgressStore((state) =>
    activeProjectId ? state.completed[activeProjectId] ?? [] : [],
  );
  const markCompleted = useWorkshopProgressStore((state) => state.markCompleted);
  const isVictory = useGameStore((state) => state.isVictory);
  const isPlaytest = useGameStore((state) => state.isPlaytest);

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

  const pages: { id: StudioPage; label: string; icon: React.ReactNode }[] = [
    { id: 'projects', label: s.nav.projects, icon: <FolderIcon className="h-4 w-4" /> },
    { id: 'levels', label: s.nav.levels, icon: <MapIcon className="h-4 w-4" /> },
    { id: 'content', label: s.nav.content, icon: <NotepadIcon className="h-4 w-4" /> },
    { id: 'rules', label: s.nav.rules, icon: <PuzzleIcon className="h-4 w-4" /> },
    { id: 'assets', label: s.nav.assets, icon: <PackageIcon className="h-4 w-4" /> },
    { id: 'models', label: s.nav.models, icon: <BoxIcon className="h-4 w-4" /> },
    { id: 'playtest', label: s.nav.playtest, icon: <PlayIcon className="h-4 w-4" /> },
    { id: 'publish', label: s.nav.publish, icon: <UploadIcon className="h-4 w-4" /> },
  ];

  const needsProject = page !== 'projects' && page !== 'assets' && page !== 'models';
  const missingProject = needsProject && !activeProject;

  useEffect(() => {
    setPlaytestLevelId(activeProject?.levels[0]?.id ?? null);
  }, [activeProject?.id]);

  const locks = useMemo(
    () => (activeProject ? resolveLevelLocks(activeProject, completedIds) : new Map<string, LevelLockState>()),
    [activeProject, completedIds],
  );
  const selectedLock = playtestLevelId ? locks.get(playtestLevelId) ?? null : null;
  const progressPct =
    activeProject && activeProject.levels.length > 0
      ? Math.round((completedIds.length / activeProject.levels.length) * 100)
      : 0;

  // 臨時局勝利 = 這一關完成（解鎖規則就是靠這份清單）
  useEffect(() => {
    if (isVictory && isPlaytest && activeProject && playtestLevelId) {
      markCompleted(activeProject.id, playtestLevelId);
    }
  }, [isVictory, isPlaytest, activeProject, playtestLevelId, markCompleted]);

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
            className="my-2"
            collapsed={railCollapsed}
            onToggleCollapsed={toggleRail}
            collapseLabel={s.nav.collapse}
            expandLabel={s.nav.expand}
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
                icon={item.icon}
                label={item.label}
                compact={railCollapsed}
                active={page === item.id}
                onClick={() => setPage(item.id)}
              />
            ))}
          </Rail>

          {/* 窄版（手機）時整頁比視口高：外殼不滾動，所以主區自己滾，否則下半部直接被切掉 */}
          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto xl:overflow-hidden">
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
                {page === 'assets' && <AssetsPage onNavigate={setPage} />}
                {page === 'models' && <ModelsPage />}
                {page === 'levels' && activeProject && <LevelsPage projectId={activeProject.id} />}
                {page === 'content' && activeProject && <ContentPage projectId={activeProject.id} />}
                {page === 'rules' && activeProject && <GraphPage projectId={activeProject.id} />}
                {page === 'playtest' && activeProject && (
                  <div className="flex min-h-0 flex-1 flex-col gap-2 p-3 lg:flex-row">
                    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="arc-label">{s.playtest.level}</span>
                        <CustomSelect
                          value={playtestLevelId ?? ''}
                          onChange={(value) => setPlaytestLevelId(value || null)}
                          options={activeProject.levels.map((level) => {
                            const lock = locks.get(level.id);
                            const done = completedIds.includes(level.id);
                            return {
                              value: level.id,
                              label: level.name + (done ? ' ✓' : '') + (lock?.locked ? '（未解鎖）' : ''),
                              disabled: lock?.locked === true,
                            };
                          })}
                          size="sm"
                          className="w-56"
                        />
                        <span className="ml-auto font-mono text-[10.5px] text-[var(--cn-ink-3)]">
                          {s.progress.completed} {completedIds.length}/{activeProject.levels.length}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden bg-[var(--cn-line-soft)]">
                        <div
                          className="h-full bg-[var(--cn-signal-text)] transition-[width]"
                          style={{ width: progressPct + '%' }}
                        />
                      </div>
                      <div className="min-h-0 flex-1">
                        {selectedLock?.locked ? (
                          <Deck className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
                            <span className="text-[13px] font-semibold text-[var(--cn-ink)]">{s.progress.locked}</span>
                            <span className="font-mono text-[11px] text-[var(--cn-ink-3)]">
                              {s.progress.requires} {selectedLock.missing.join('、')}
                            </span>
                            <Btn
                              size="sm"
                              variant="line"
                              onClick={() => {
                                const target = activeProject.levels.find((level) => selectedLock.missing.includes(level.name));
                                if (target) setPlaytestLevelId(target.id);
                              }}
                            >
                              {s.progress.gotoRequired}
                            </Btn>
                          </Deck>
                        ) : (
                          <PlaytestStage projectId={activeProject.id} levelId={playtestLevelId ?? undefined} />
                        )}
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
