/**
 * 專案／關卡 → 一局試玩的啟動參數
 *
 * 這是本線唯一 import workshopStore 的地方，轉換集中在這一支：
 * 內嵌試玩與平衡模擬都只吃 PlaytestSetup，不認得工坊資料結構。
 *
 * 流程：關卡指定地圖資產 → compileMap（工坊地圖 → 引擎 CustomMapData）
 *      → 註冊進 PATHS（與 gameStore 載入 Mod 地圖時用的是同一種形狀）→ 回傳 key。
 * 為什麼要註冊：引擎整條路徑（敵人移動、自動戰鬥、畫地圖）都只認 PATHS[selectedPath]。
 * key 加 ws: 前綴，避免與官方地圖／已安裝 Mod 的地圖撞名。
 */
import { DEFAULT_PATH, PATHS, WAVE_CONFIGS } from '@/data/gameData';
import type { CustomMapData, PathConfig } from '@/types/game';
import { useWorkshopStore } from '@/store/workshopStore';
import { compileMap } from '@/workshop/compile/compileMaps';
import type { PlaytestSetup } from './types';

/** 註冊進引擎用的路徑 key（同一個專案＋關卡永遠對應同一個 key，重複試玩不會長出第二份） */
function playtestPathKey(projectId: string, levelId: string): string {
  return 'ws:' + projectId + ':' + levelId;
}

/**
 * compileMap 的輸出 → PathConfig
 *
 * 這裡的預設值是「防禦性映射」：工坊地圖資產在編輯過程中可能還沒填 category／difficulty，
 * 直接塞進 PATHS 會讓引擎拿到 undefined 而爆在奇怪的地方。
 * 等 foundation 把 compileMap 的輸出欄位補齊後，這幾個 ?? 可以移除。
 */
function toPathConfig(compiled: CustomMapData, fallbackName: string): PathConfig {
  const waypoints = Array.isArray(compiled.waypoints) ? compiled.waypoints : [];
  return {
    name: compiled.name || fallbackName,
    description: compiled.description ?? '',
    difficulty: compiled.difficulty || 'medium',
    category: compiled.category ?? 'normal',
    waypoints,
    ...(compiled.segments && compiled.segments.length > 0 ? { segments: compiled.segments } : {}),
    ...(compiled.startSegmentId ? { startSegmentId: compiled.startSegmentId } : {}),
    ...(compiled.blockedCells && compiled.blockedCells.length > 0 ? { blockedCells: compiled.blockedCells } : {}),
  };
}

/** 路徑是否可用：普通地圖要 2 個點以上，進階地圖要至少一段 2 點的路段 */
function isPlayablePath(config: PathConfig): boolean {
  if (config.waypoints.length >= 2) return true;
  const segments = config.segments ?? [];
  return segments.some((segment) => segment.waypoints.length >= 2);
}

/**
 * 解析試玩設定
 *
 * 回傳 null＝這個專案不存在（UI 顯示 noProject 空狀態）。
 * 專案存在但沒有可用地圖時，回退官方預設地圖並把 fallback 設 true，
 * 讓「試玩」從第一天就能真的跑起來，同時在畫面上誠實標示用的是哪張圖。
 */
export function resolvePlaytestSetup(projectId: string, levelId?: string): PlaytestSetup | null {
  const store = useWorkshopStore.getState();
  const project = store.getProject(projectId);
  if (!project) return null;

  const level = levelId ? store.getLevel(projectId, levelId) : project.levels[0] ?? null;
  const levelKey = level?.id ?? 'shared';

  let pathName: string | null = null;
  let mapLabel = '';

  const mapAssetId = level?.mapAssetId ?? null;
  if (mapAssetId) {
    const asset = store.getAsset(mapAssetId);
    if (asset && asset.kind === 'map') {
      const compiled = compileMap(project.id, asset);
      const config = toPathConfig(compiled.map, asset.name);
      if (isPlayablePath(config)) {
        const key = playtestPathKey(project.id, levelKey);
        PATHS[key] = config;
        pathName = key;
        mapLabel = config.name;
      }
    }
  }

  const fallback = pathName === null;
  if (!pathName) {
    pathName = DEFAULT_PATH;
    mapLabel = PATHS[DEFAULT_PATH]?.name ?? DEFAULT_PATH;
  }

  // 波數：關卡勝負條件的「守住 N 波」優先，其次關卡自己排的波次，最後才是官方 15 波
  const surviveWaves = level?.winConditions?.surviveWaves;
  const levelWaves = level?.waves.length ?? 0;
  const maxWaves = surviveWaves && surviveWaves > 0
    ? surviveWaves
    : levelWaves > 0
      ? levelWaves
      : WAVE_CONFIGS.length;

  return {
    pathName,
    // 關卡目前沒有難度欄位；難度決定起始資源與敵人倍率，先用 normal（與新建關卡預設一致）
    difficulty: 'normal',
    maxWaves,
    // 關卡自訂波次要先註冊成可選波次組（compileWaves → modStore）才吃得到；
    // 在那之前傳 undefined，引擎會依 maxWaves 走官方 WAVE_CONFIGS
    customWaveSetId: undefined,
    mapLabel,
    levelLabel: level?.name ?? (fallback ? project.name : undefined),
    fallback,
  };
}
