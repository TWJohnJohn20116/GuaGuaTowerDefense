/**
 * 地圖工作台
 *
 * 契約：頁面級元件的 props 一律是 { projectId, levelId? }，資料自己從 workshopStore 讀，
 * 不由上層傳資料進來。地圖草稿落在「關卡 → mapAssetId → 地圖資產」這條線上。
 *
 * 渲染重用：
 *  - 2D 走 MapOverlayCanvas，底層直接呼叫遊戲本體的 drawGrid（真實渲染，含主題場地色）
 *  - 3D 直接掛 GameScene3D。它沒有 props、資料全部來自 useGameStore，因此這裡用
 *    「暫時把草稿寫進 gameStore、離開時還原」的鏡像做法；還原包在 try/finally 裡，
 *    即使寫入或還原中途拋錯，也不會把玩家的世界狀態留在鏡像版本上。
 */
import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Btn, Deck, TopBar } from '@/components/hl';
import { useTranslation } from '@/i18n';
import { PATHS } from '@/data/gameData';
import { useGameStore } from '@/store/gameStore';
import { useWorkshopStore } from '@/store/workshopStore';
import {
  addPreviewTower,
  addWaypoint,
  blockedPathConflicts,
  clearBlocked,
  clearPreviewTowers,
  draftSignature,
  expandPathCells,
  movePreviewTower,
  moveWaypoint,
  paintBlocked,
  readMapDraft,
  removePreviewTower,
  removeWaypoint,
  serializeDraft,
  toTileGrid,
  validateDraft,
  type DraftOpResult,
  type GridPoint,
  type MapDraft,
  type MapIssueCode,
} from '@/workshop/map/editModel';
import { MapInspector, type SaveState } from './MapInspector';
import { MapOverlayCanvas } from './MapOverlayCanvas';
import { MapToolbar, type MapTool } from './MapToolbar';
import { useMapPlayback } from './useMapPlayback';

const GameScene3D = lazy(() => import('@/components/scenes/game-scene/three/GameScene3D'));

const PATH_KEYS = Object.keys(PATHS);
/** GameScene3D 從 PATHS[selectedPath] 取環境與特效設定，鏡像時必須給一個真實存在的 key */
const MIRROR_PATH_KEY = PATH_KEYS.includes('zigzag') ? 'zigzag' : PATH_KEYS[0] ?? '';

export interface MapWorkbenchProps {
  projectId: string;
  levelId?: string;
}

/** 資產 id 容錯讀取：asset 形狀由 foundation 線定義，這裡只認 id */
const assetIdOf = (value: unknown): string | null => {
  if (!value || typeof value !== 'object') return null;
  const rec = value as Record<string, unknown>;
  return typeof rec.id === 'string' ? rec.id : null;
};

interface AssetWriteResult {
  ok: boolean;
  reason?: string;
}

export function MapWorkbench({ projectId, levelId }: MapWorkbenchProps) {
  const { t } = useTranslation();
  const s = t.studio.map;

  const projects = useWorkshopStore((state) => state.projects);
  const assets = useWorkshopStore((state) => state.assets);

  const project = useMemo(() => projects.find((item) => item.id === projectId) ?? null, [projects, projectId]);

  const level = useMemo(() => {
    const store = useWorkshopStore.getState();
    if (levelId) return store.getLevel(projectId, levelId);
    // 沒指定關卡時退回專案的第一個關卡；一個關卡都沒有就進「草稿模式」
    const first = project?.levels?.[0];
    return first ?? null;
    // projects / assets 變動時重算；getState() 只取當下最新值，不訂閱（避免 selector 每次回傳新物件）
  }, [project, projectId, levelId, projects, assets]);

  const seed = useMemo(() => {
    const mapAssetId = level?.mapAssetId;
    const asset = mapAssetId ? assets.find((item) => assetIdOf(item) === mapAssetId) ?? null : null;
    return readMapDraft(asset ?? level);
  }, [level, assets]);

  const [draft, setDraft] = useState<MapDraft>(seed);
  const [tool, setTool] = useState<MapTool>('waypoint');
  const [selectedWaypoint, setSelectedWaypoint] = useState<number | null>(null);
  const [selectedTowerId, setSelectedTowerId] = useState<string | null>(null);
  const [selectedTowerType, setSelectedTowerType] = useState('basic');
  const [showGrid, setShowGrid] = useState(true);
  const [showCoords, setShowCoords] = useState(true);
  const [showArrows, setShowArrows] = useState(true);
  const [view, setView] = useState<'2d' | '3d'>('2d');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [notice, setNotice] = useState<MapIssueCode | null>(null);

  const signature = draftSignature(draft);
  const playback = useMapPlayback(draft);

  // 切換關卡 / 專案時把草稿換成該關卡的內容（draft 是編輯草稿，不是世界狀態，用 state 是刻意的）
  useEffect(() => {
    setDraft(seed);
    setSelectedWaypoint(null);
    setSelectedTowerId(null);
    setSaveState(level ? 'idle' : 'scratch');
  }, [seed, level]);

  const noticeTimer = useRef<number>(0);
  useEffect(() => {
    if (!notice) return;
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), 2400);
    return () => window.clearTimeout(noticeTimer.current);
  }, [notice]);

  const issueText = useCallback(
    (code: MapIssueCode): string => {
      switch (code) {
        case 'tooFewWaypoints':
          return s.issue.tooFewWaypoints;
        case 'outOfBounds':
          return s.issue.outOfBounds;
        case 'duplicateWaypoint':
          return s.issue.duplicateWaypoint;
        case 'pathBroken':
          return s.issue.pathBroken;
        case 'blockedOnPath':
          return s.issue.blockedOnPath;
        case 'towerOnPath':
          return s.issue.towerOnPath;
        case 'towerOnBlocked':
          return s.issue.towerOnBlocked;
        case 'towerOverlap':
          return s.issue.towerOverlap;
        default:
          return s.issue.unknown;
      }
    },
    [s],
  );

  /** 所有草稿操作都走這裡：被拒絕時保留原草稿，只把原因顯示出來 */
  const applyOp = useCallback((op: (current: MapDraft) => DraftOpResult) => {
    setDraft((current) => {
      const result = op(current);
      if (result.changed) return result.draft;
      if (result.issue) setNotice(result.issue.code);
      return current;
    });
  }, []);

  const handleAddWaypoint = useCallback(
    (point: GridPoint) => {
      setDraft((current) => {
        // 插在最近的路徑點後面：雙擊地圖中央時是「把新轉角插進路線」，而不是硬拉到尾端
        let insertAt = current.waypoints.length;
        let best = Number.POSITIVE_INFINITY;
        current.waypoints.forEach((w, index) => {
          const dist = Math.abs(w.col - point.col) + Math.abs(w.row - point.row);
          if (dist < best) {
            best = dist;
            insertAt = index + 1;
          }
        });
        const result = addWaypoint(current, point, insertAt);
        if (!result.changed && result.issue) setNotice(result.issue.code);
        return result.changed ? result.draft : current;
      });
    },
    [],
  );

  const handleMoveWaypoint = useCallback((index: number, to: GridPoint) => {
    applyOp((current) => moveWaypoint(current, index, to));
  }, [applyOp]);

  const handleRemoveWaypoint = useCallback((index: number) => {
    applyOp((current) => {
      const result = removeWaypoint(current, index);
      if (result.changed) setSelectedWaypoint(null);
      return result;
    });
  }, [applyOp]);

  const handlePaintBlocked = useCallback(
    (point: GridPoint, blocked: boolean) => {
      applyOp((current) => paintBlocked(current, [point], blocked));
    },
    [applyOp],
  );

  /**
   * 擺塔／移塔共用一個入口：
   * 已經選了一顆預覽塔時，點空格是「移動那一顆」（移動失敗就把原因顯示出來）；
   * 沒選塔時才是新增。這樣移動不需要額外的拖曳模式，也不會不小心多放一顆。
   */
  const handlePlaceTower = useCallback(
    (point: GridPoint) => {
      applyOp((current) => {
        if (selectedTowerId) {
          const moved = movePreviewTower(current, selectedTowerId, point);
          if (moved.changed) return moved;
          if (moved.issue) setNotice(moved.issue.code);
          return current;
        }
        return addPreviewTower(
          current,
          point,
          selectedTowerType,
          'pt-' + point.col + '-' + point.row + '-' + Date.now().toString(36),
        );
      });
    },
    [applyOp, selectedTowerId, selectedTowerType],
  );

  const handleRemoveTower = useCallback((id: string) => {
    applyOp((current) => {
      const result = removePreviewTower(current, id);
      if (result.changed) setSelectedTowerId(null);
      return result;
    });
  }, [applyOp]);

  // Delete / Backspace 刪除選中的路徑點或預覽塔
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Delete' && event.key !== 'Backspace') return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (selectedTowerId) {
        event.preventDefault();
        handleRemoveTower(selectedTowerId);
        return;
      }
      if (selectedWaypoint !== null) {
        event.preventDefault();
        handleRemoveWaypoint(selectedWaypoint);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedTowerId, selectedWaypoint, handleRemoveTower, handleRemoveWaypoint]);

  // ===== 3D 鏡像：寫入 → 還原一律 try/finally =====
  useEffect(() => {
    if (view !== '3d') return;
    const snapshot = {
      grid: useGameStore.getState().grid,
      selectedPath: useGameStore.getState().selectedPath,
    };
    try {
      useGameStore.setState({ grid: toTileGrid(draft), selectedPath: MIRROR_PATH_KEY });
    } catch (error) {
      console.error('[workshop-map] 3D 鏡像寫入失敗', error);
    }
    return () => {
      try {
        useGameStore.setState({ grid: snapshot.grid, selectedPath: snapshot.selectedPath });
      } finally {
        // 還原沒有後續步驟，finally 只用來保證「即使 setState 拋錯也不會再往下做別的寫入」
      }
    };
    // draft 逐欄列舉會讓 deps 每按一鍵就變；signature 已涵蓋內容，故以它為依賴
  }, [view, signature, draft]);

  const conflicts = useMemo(() => blockedPathConflicts(draft), [draft]);
  const issues = useMemo(() => validateDraft(draft), [draft]);
  const cellCount = useMemo(() => expandPathCells(draft.waypoints).length, [draft]);

  const upsertMapAsset = useCallback(
    (payload: Record<string, unknown>): AssetWriteResult => {
      const store = useWorkshopStore.getState();
      // foundation 線的 WorkshopAsset 型別尚未落地；這裡只保留一個結構邊界，
      // 好讓工作台不會因為別人改欄位名就整頁編不過（不是 any，也不是放寬型別）。
      const write = store.upsertAsset as unknown as (asset: Record<string, unknown>) => AssetWriteResult;
      try {
        return write(payload);
      } catch (error) {
        console.error('[workshop-map] upsertAsset 失敗', error);
        return { ok: false, reason: 'exception' };
      }
    },
    [],
  );

  /**
   * 關卡還沒有地圖資產（mapAssetId 為 null/undefined）時，自動建立一份預設地圖並寫回關卡。
   *
   * 為什麼要自動而不是丟 Empty：新專案的關卡一開始一定沒有地圖，若這裡留白，
   * 使用者一打開地圖頁就是一片空白，還得先自己想辦法生資產。
   * ensuredRef 保證同一關卡只嘗試一次，避免 upsert → projects 變動 → effect 重跑 的迴圈。
   * 失敗時只把狀態設成 error，草稿仍留在本地可以繼續編輯（不空白、不崩潰）。
   */
  const ensuredLevelRef = useRef<string | null>(null);
  useEffect(() => {
    if (!level) return;
    if (level.mapAssetId) return;
    if (ensuredLevelRef.current === level.id) return;
    ensuredLevelRef.current = level.id;

    const assetId = 'map-' + level.id;
    const result = upsertMapAsset({
      id: assetId,
      kind: 'map',
      name: level.name,
      ...serializeDraft(seed),
    });
    if (!result.ok) {
      setSaveState('error');
      return;
    }
    try {
      useWorkshopStore.getState().updateLevel(projectId, level.id, { mapAssetId: assetId });
    } catch (error) {
      console.error('[workshop-map] 自動建立地圖資產後寫回關卡失敗', error);
      setSaveState('error');
    }
  }, [level, seed, projectId, upsertMapAsset]);

  const handleSave = useCallback(() => {
    if (!level) {
      setSaveState('scratch');
      return;
    }
    const assetId = level.mapAssetId ?? 'map-' + level.id;
    const payload: Record<string, unknown> = {
      id: assetId,
      kind: 'map',
      name: level.name,
      ...serializeDraft(draft),
    };
    const result = upsertMapAsset(payload);
    if (!result.ok) {
      setSaveState('error');
      return;
    }
    const store = useWorkshopStore.getState();
    try {
      store.updateLevel(projectId, level.id, { mapAssetId: assetId });
      setSaveState('saved');
    } catch (error) {
      console.error('[workshop-map] updateLevel 失敗', error);
      setSaveState('error');
    }
  }, [draft, level, projectId, upsertMapAsset]);

  const handleSelectTowerType = useCallback((type: string) => {
    setSelectedTowerType(type);
    setTool('tower');
  }, []);

  const canSave = Boolean(level) && issues.length === 0;

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-3">
      <TopBar
        title={level?.name ?? s.title}
        meta={project?.name ?? s.metaFallback}
        back={false}
        right={
          <>
            <span className="arc-micro hidden md:inline">{s.cellUnitHint}</span>
            <Btn size="sm" variant="signal" onClick={handleSave} disabled={!canSave}>
              {s.panel.saveButton}
            </Btn>
          </>
        }
      />

      <MapToolbar
        tool={tool}
        onToolChange={setTool}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid((prev) => !prev)}
        showCoords={showCoords}
        onToggleCoords={() => setShowCoords((prev) => !prev)}
        showArrows={showArrows}
        onToggleArrows={() => setShowArrows((prev) => !prev)}
        view={view}
        onToggleView={() => setView((prev) => (prev === '2d' ? '3d' : '2d'))}
        playing={playback.playing}
        onTogglePlay={playback.toggle}
        onResetPlayback={playback.reset}
        progress={playback.progress}
        speed={playback.speed}
        onSpeedChange={playback.setSpeed}
        disabled={cellCount === 0}
      />

      {notice && (
        <div className="flex items-center gap-2 rounded-[12px] border-[3px] border-[var(--cn-alert)] bg-[var(--cn-alert-soft)] px-3 py-1.5">
          <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--cn-alert)]" />
          <span className="text-[12px] font-extrabold text-[var(--cn-alarm-text)]">{issueText(notice)}</span>
        </div>
      )}

      <div className="flex min-h-0 flex-1 gap-3">
        <div className="relative min-w-0 flex-1 overflow-hidden rounded-[var(--cn-r-lg)] border-[3px] border-[var(--cn-line)] bg-[var(--cn-card)]">
          {view === '2d' ? (
            <MapOverlayCanvas
              draft={draft}
              tool={tool}
              selectedWaypoint={selectedWaypoint}
              selectedTowerId={selectedTowerId}
              selectedTowerType={selectedTowerType}
              showGrid={showGrid}
              showCoords={showCoords}
              showArrows={showArrows}
              runner={playback.runners[0] ?? null}
              onAddWaypoint={handleAddWaypoint}
              onMoveWaypoint={handleMoveWaypoint}
              onRemoveWaypoint={handleRemoveWaypoint}
              onSelectWaypoint={setSelectedWaypoint}
              onPaintBlocked={handlePaintBlocked}
              onPlaceTower={handlePlaceTower}
              onSelectTower={setSelectedTowerId}
              onRemoveTower={handleRemoveTower}
            />
          ) : (
            <div className="absolute inset-0">
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center">
                    <span className="arc-micro">{s.view3dLoading}</span>
                  </div>
                }
              >
                <GameScene3D />
              </Suspense>
              <Deck className="pointer-events-none absolute inset-x-3 bottom-3 z-20 bg-[var(--cn-sun-soft)] px-3 py-2">
                <span className="text-[11.5px] font-extrabold leading-snug text-[var(--cn-ink-2)]">
                  {s.view3dHint}
                </span>
              </Deck>
            </div>
          )}
        </div>

        <MapInspector
          draft={draft}
          selectedWaypoint={selectedWaypoint}
          selectedTowerId={selectedTowerId}
          selectedTowerType={selectedTowerType}
          onSelectTowerType={handleSelectTowerType}
          onSelectWaypoint={setSelectedWaypoint}
          onRemoveWaypoint={handleRemoveWaypoint}
          onRemoveTower={handleRemoveTower}
          onClearBlocked={() => applyOp((current) => clearBlocked(current))}
          onClearTowers={() => applyOp((current) => clearPreviewTowers(current))}
          onSelectTower={setSelectedTowerId}
          issues={issues}
          conflicts={conflicts}
          cellCount={cellCount}
          canSave={canSave}
          saveState={level ? saveState : 'scratch'}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}

export default MapWorkbench;
