import { beforeEach, describe, expect, it } from 'vitest';
import { useWorkshopStore } from '@/store/workshopStore';
import { compileProject } from '@/workshop/compile/compileProject';
import { exportProjectFile, parseProjectFile } from '@/workshop/projectFile';
import { createDefaultLevel } from '@/workshop/levels/defaults';
import type { WorkshopMapData } from '@/types/workshop';

/** 資料路徑煙霧測試：建專案 → 建關卡／資產 → 編譯 → 匯出／匯入 */
describe('studio smoke（資料路徑）', () => {
  beforeEach(() => {
    useWorkshopStore.setState({ projects: [], assets: [], activeProjectId: null, activeLevelId: null });
  });

  it('專案 → 關卡 → 編譯出可用的 Mod 形狀', () => {
    const state = useWorkshopStore.getState();
    const projectId = state.createProject('煙霧測試');
    const level = createDefaultLevel('第一關');
    state.addLevel(projectId, level);

    const mapId = state.createAsset('map', '測試地圖');
    const mapAsset = useWorkshopStore.getState().getAsset(mapId);
    if (mapAsset && mapAsset.kind === 'map') {
      const data = mapAsset.data as WorkshopMapData;
      useWorkshopStore.getState().upsertAsset({
        ...mapAsset,
        data: {
          ...data,
          waypoints: [
            { col: 0, row: 5 },
            { col: 14, row: 5 },
          ],
        },
      });
    }
    useWorkshopStore.getState().updateLevel(projectId, level.id, { mapAssetId: mapId });

    const project = useWorkshopStore.getState().getProject(projectId);
    expect(project).toBeTruthy();
    const compiled = compileProject(project!, useWorkshopStore.getState().assets);
    expect(compiled.mod.content.waves?.length).toBeGreaterThan(0);
    expect(compiled.settings.levels[0]?.waveSetId).toBeTruthy();
    expect(compiled.mod.content.maps?.length).toBeGreaterThan(0);
  });

  it('專案檔匯出 → 解析可還原同一個專案與引用資產', () => {
    const state = useWorkshopStore.getState();
    const projectId = state.createProject('存檔測試');
    state.addLevel(projectId, createDefaultLevel('關卡 A'));
    const towerId = state.createAsset('tower', '測試塔');
    const project = useWorkshopStore.getState().getProject(projectId)!;
    useWorkshopStore.getState().updateProject(projectId, {
      assetRefs: [{ assetId: towerId, version: '1.0.0' }],
    });

    const json = exportProjectFile(useWorkshopStore.getState().getProject(projectId)!, useWorkshopStore.getState().assets);
    const parsed = parseProjectFile(json);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.file.project.id).toBe(projectId);
    expect(parsed.file.project.levels).toHaveLength(1);
    expect(parsed.file.assets.some((asset) => asset.id === towerId)).toBe(true);
  });

  it('壞掉的專案檔會被擋下（不是靜默接受）', () => {
    expect(parseProjectFile('not json').ok).toBe(false);
    expect(parseProjectFile(JSON.stringify({ magic: 'nope' })).ok).toBe(false);
  });
});
