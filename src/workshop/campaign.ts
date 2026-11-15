/**
 * 工坊關卡的「戰役入口」
 *
 * 目的：讓玩家不必進工坊，也能從選圖畫面玩到工坊關卡。
 * 與試玩的差別只有一個：**不隔離**——統計、成就、回放、戰役進度全部照常寫入。
 *
 * 為什麼要經過 resolvePlaytestSetup：引擎整條路徑只認 PATHS[key] 與 WAVE_CONFIGS，
 * 工坊的地圖與波次必須先註冊進去；那支函式已經處理好 key 前綴（ws:）與註冊，
 * 這裡只負責「不開試玩模式」地把它跑起來。
 */
import { useGameStore } from '@/store/gameStore';
import { startCustomBgm, stopCustomBgm } from '@/services/audioService';
import { PATHS } from '@/data/gameData';
import { setActiveMapTheme } from '@/utils/themeBoard';
import { useWorkshopStore } from '@/store/workshopStore';
import { useWorkshopProgressStore } from '@/store/workshopProgressStore';
import { resolveLevelLocks } from '@/workshop/progress';
import { resolvePlaytestSetup } from '@/workshop/playtest/projectSource';
import type { PathConfig } from '@/types/game';
import type { WorkshopLevel, WorkshopMapAsset, WorkshopProject } from '@/types/workshop';

export interface CampaignLevel {
  /** 選圖清單用的 key：ws:projectId:levelId（與註冊進 PATHS 的 key 相同） */
  key: string;
  projectId: string;
  levelId: string;
  projectName: string;
  levelName: string;
  /** 給選圖清單算路徑統計用（不註冊，只做顯示） */
  path: PathConfig;
  locked: boolean;
  completed: boolean;
}

/** 這一關目前是不是正在以戰役身分進行（通關時用來寫進度） */
let activeCampaign: { projectId: string; levelId: string } | null = null;

function parseKey(key: string): { projectId: string; levelId: string } | null {
  if (!key.startsWith('ws:')) return null;
  const rest = key.slice(3);
  const split = rest.lastIndexOf(':');
  if (split <= 0) return null;
  return { projectId: rest.slice(0, split), levelId: rest.slice(split + 1) };
}

/** 關卡 → 顯示用 PathConfig（不註冊；正式開局時才由 resolvePlaytestSetup 註冊） */
function toPathConfig(mapAsset: WorkshopMapAsset, level: WorkshopLevel): PathConfig {
  const data = mapAsset.data;
  const waypoints = Array.isArray(data.waypoints) ? data.waypoints : [];
  return {
    name: level.name || mapAsset.name,
    description: mapAsset.description ?? '',
    difficulty: data.difficulty || 'medium',
    category: 'advanced',
    waypoints,
    ...(data.segments && data.segments.length > 0 ? { segments: data.segments } : {}),
    ...(data.startSegmentId ? { startSegmentId: data.startSegmentId } : {}),
    ...(data.blockedAreas && data.blockedAreas.length > 0 ? { blockedAreas: data.blockedAreas } : {}),
  };
}

function isPlayable(config: PathConfig): boolean {
  if (config.waypoints.length >= 2) return true;
  return (config.segments ?? []).some((segment) => segment.waypoints.length >= 2);
}

/**
 * 列出可從選圖進入的工坊關卡
 *
 * 只收「有地圖資產、地圖可玩」的關卡；鎖定狀態照工坊的解鎖規則算，
 * 這樣玩家不能從選圖繞過前置關卡。
 */
export function listCampaignLevels(): CampaignLevel[] {
  const { projects, assets } = useWorkshopStore.getState();
  const completedByProject = useWorkshopProgressStore.getState().completed;
  const levels: CampaignLevel[] = [];

  for (const project of projects as WorkshopProject[]) {
    const completedIds = completedByProject[project.id] ?? [];
    const locks = resolveLevelLocks(project, completedIds);
    for (const level of project.levels) {
      if (!level.mapAssetId) continue;
      const mapAsset = assets.find(
        (asset): asset is WorkshopMapAsset => asset.kind === 'map' && asset.id === level.mapAssetId,
      );
      if (!mapAsset) continue;
      const path = toPathConfig(mapAsset, level);
      if (!isPlayable(path)) continue;
      levels.push({
        key: 'ws:' + project.id + ':' + level.id,
        projectId: project.id,
        levelId: level.id,
        projectName: project.name,
        levelName: level.name,
        path,
        locked: locks.get(level.id)?.locked === true,
        completed: completedIds.includes(level.id),
      });
    }
  }

  return levels;
}

/**
 * 以「正式局」啟動工坊關卡
 *
 * 回傳 false＝這一關解析不出可用地圖（例如地圖資產被刪）。
 * 注意：這裡刻意不呼叫 setPlaytestMode(true)，統計與成就才會真的寫入。
 */
export async function startCampaignLevel(key: string): Promise<boolean> {
  const parsed = parseKey(key);
  if (!parsed) return false;
  const setup = resolvePlaytestSetup(parsed.projectId, parsed.levelId);
  if (!setup) return false;

  const game = useGameStore.getState();
  if (game.isPlaytest) game.exitPlaytest();
  game.setPlaytestMode(false);

  activeCampaign = { projectId: parsed.projectId, levelId: parsed.levelId };
  setActiveMapTheme(PATHS[setup.pathName]?.theme ?? null);
  await useGameStore.getState().startGame(
    setup.pathName,
    setup.difficulty,
    false,
    setup.maxWaves,
    undefined,
    setup.customWaveSetId,
  );
  if (setup.bgmDataUrl) startCustomBgm(setup.bgmDataUrl);
  return true;
}

/** 通關時把戰役進度寫回工坊（由 setVictory 呼叫；沒有進行中的工坊關卡就什麼都不做） */
export function markCampaignVictoryIfAny(): void {
  if (!activeCampaign) return;
  useWorkshopProgressStore
    .getState()
    .markCompleted(activeCampaign.projectId, activeCampaign.levelId);
  activeCampaign = null;
  stopCustomBgm();
}

/** 離開戰役關卡（回主選單等）時清掉標記，避免下一次別的地圖通關誤記 */
export function clearActiveCampaign(): void {
  activeCampaign = null;
}
