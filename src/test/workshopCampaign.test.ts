/**
 * 工坊關卡的戰役入口：清單組裝
 *
 * 只驗「哪些關卡該出現在選圖」與「鎖定／完成狀態」，不驗開局流程
 * （開局會動到 PATHS 註冊與 startGame，屬整合層）。
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { useWorkshopStore } from '@/store/workshopStore';
import { useWorkshopProgressStore } from '@/store/workshopProgressStore';
import { listCampaignLevels } from '@/workshop/campaign';

function seedProjectWithMap(): { projectId: string; levelId: string } {
  const store = useWorkshopStore.getState();
  const projectId = store.createProject('戰役測試專案');
  const mapId = store.createAsset('map', '戰役測試地圖');
  const mapAsset = useWorkshopStore.getState().assets.find((asset) => asset.id === mapId);
  if (!mapAsset || mapAsset.kind !== 'map') throw new Error('地圖資產建立失敗');
  useWorkshopStore.getState().upsertAsset({
    ...mapAsset,
    data: { ...mapAsset.data, waypoints: [{ col: 0, row: 0 }, { col: 6, row: 0 }] },
  });
  const project = useWorkshopStore.getState().projects.find((item) => item.id === projectId);
  const levelId = project?.levels[0]?.id;
  if (!levelId) throw new Error('專案沒有種子關卡');
  useWorkshopStore.getState().updateLevel(projectId, levelId, { mapAssetId: mapId });
  return { projectId, levelId };
}

describe('listCampaignLevels', () => {
  beforeEach(() => {
    useWorkshopStore.setState({ projects: [], assets: [], activeProjectId: null });
    useWorkshopProgressStore.setState({ completed: {} });
  });

  it('有地圖資產的關卡會出現在清單裡', () => {
    const { projectId, levelId } = seedProjectWithMap();
    const levels = listCampaignLevels();
    expect(levels).toHaveLength(1);
    expect(levels[0].key).toBe('ws:' + projectId + ':' + levelId);
    expect(levels[0].path.waypoints.length).toBeGreaterThanOrEqual(2);
  });

  it('沒有地圖的關卡不會出現', () => {
    useWorkshopStore.getState().createProject('只有關卡沒有地圖');
    expect(listCampaignLevels()).toHaveLength(0);
  });

  it('地圖路徑點不足的關卡不會出現', () => {
    const { projectId, levelId } = seedProjectWithMap();
    const project = useWorkshopStore.getState().projects.find((item) => item.id === projectId);
    const mapAssetId = project?.levels.find((level) => level.id === levelId)?.mapAssetId;
    const mapAsset = useWorkshopStore.getState().assets.find((asset) => asset.id === mapAssetId);
    if (!mapAsset || mapAsset.kind !== 'map') throw new Error('找不到地圖');
    useWorkshopStore.getState().upsertAsset({
      ...mapAsset,
      data: { ...mapAsset.data, waypoints: [{ col: 0, row: 0 }] },
    });
    expect(listCampaignLevels()).toHaveLength(0);
  });

  it('完成狀態反映戰役進度', () => {
    const { projectId, levelId } = seedProjectWithMap();
    useWorkshopProgressStore.getState().markCompleted(projectId, levelId);
    const levels = listCampaignLevels();
    expect(levels[0].completed).toBe(true);
  });
});
