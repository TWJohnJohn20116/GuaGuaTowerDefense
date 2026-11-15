// 地圖資產 → 引擎的 CustomMapData。
//
// 這支刻意「逐欄顯式搬移」而不是整包展開 asset.data：
// - 引擎與 playtest 靠 name／description／difficulty／category／waypoints 把地圖註冊成路徑，
//   缺 category 時 PathConfig 雖然可選，但地圖選單會沒有分類可歸；
// - blockedCells 一定要保留（障礙格的真實貼圖與不可建造判定都靠它）；
// - grid 是工坊編輯器的畫布尺寸，引擎不吃，不外流。

import type { CustomMapData } from '@/types/game';
import type { WorkshopAssetProvenance, WorkshopMapAsset, WorkshopMapData } from '@/types/workshop';
import { runtimeAssetId } from '@/workshop/ids';

interface CompiledMap {
  map: CustomMapData;
  provenance: WorkshopAssetProvenance;
}

export function compileMap(projectId: string, asset: WorkshopMapAsset): CompiledMap {
  // 型別上 data 是必填，但舊存檔／半寫入的資產在 localStorage 裡可能是 undefined。
  // 這裡退成空物件而不是直接讀 data.difficulty —— 否則整個試玩與平衡面板會一起白屏。
  const data: Partial<WorkshopMapData> = asset.data ?? {};
  const id = runtimeAssetId(projectId, asset.id);

  const map: CustomMapData = {
    id,
    modId: projectId,
    name: asset.name,
    description: asset.description ?? '',
    // PathConfig 的三個必填面：difficulty／waypoints 由資產帶，category 補預設
    difficulty:
      typeof data.difficulty === 'string' && data.difficulty.length > 0 ? data.difficulty : 'normal',
    category: data.category ?? 'normal',
    // 壞掉的存檔（waypoints 不是陣列）不讓整份編譯炸掉，退成空路徑
    waypoints: Array.isArray(data.waypoints) ? data.waypoints : [],
    blockedAreas: data.blockedAreas ?? [],
  };

  // 叉路地圖（進階）才有 segments／startSegmentId；普通地圖保持 undefined
  if (data.segments) map.segments = data.segments;
  if (data.startSegmentId) map.startSegmentId = data.startSegmentId;
  if (data.thumbnail) map.thumbnail = data.thumbnail;
  if (data.theme) map.theme = data.theme;

  return {
    map,
    provenance: { runtimeId: id, assetId: asset.id, version: asset.version, kind: 'map' },
  };
}
