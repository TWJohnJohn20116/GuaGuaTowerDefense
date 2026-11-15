import { beforeEach, describe, expect, it } from 'vitest';
import { useWorkshopStore } from '@/store/workshopStore';
import { compileProject } from '@/workshop/compile/compileProject';
import { exportProjectFile, parseProjectFile } from '@/workshop/projectFile';
import type { WorkshopMapData } from '@/types/workshop';

/**
 * 資料路徑煙霧測試：建專案 → 改關卡／資產 → 編譯 → 匯出／匯入。
 * 註：createProject 會自帶一個起始關卡，測試直接用它，避免假設「專案一定是空的」。
 */
describe('studio smoke（資料路徑）', () => {
  beforeEach(() => {
    useWorkshopStore.setState({ projects: [], assets: [], activeProjectId: null, activeLevelId: null });
  });

  it('專案 → 關卡 → 編譯出可用的 Mod 形狀', () => {
    const state = useWorkshopStore.getState();
    const projectId = state.createProject('煙霧測試');
    const level = useWorkshopStore.getState().getProject(projectId)!.levels[0];

    useWorkshopStore.getState().updateLevel(projectId, level.id, {
      waves: [{ enemies: [{ type: 'normal', count: 3, delay: 0 }], reward: 10 }],
    });

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

    const project = useWorkshopStore.getState().getProject(projectId)!;
    const compiled = compileProject(project, useWorkshopStore.getState().assets);
    const compiledLevel = compiled.settings.levels.find((item) => item.id === level.id);
    expect(compiled.mod.content.waves?.length).toBeGreaterThan(0);
    expect(compiledLevel?.waveSetId).toBeTruthy();
    expect(compiled.mod.content.maps?.length).toBeGreaterThan(0);
  });

  it('專案檔匯出 → 解析可還原同一個專案與引用資產', () => {
    const state = useWorkshopStore.getState();
    const projectId = state.createProject('存檔測試');
    const towerId = state.createAsset('tower', '測試塔');
    const before = useWorkshopStore.getState().getProject(projectId)!;
    useWorkshopStore.getState().updateProject(projectId, {
      assetRefs: [{ assetId: towerId, version: '1.0.0' }],
    });

    const json = exportProjectFile(useWorkshopStore.getState().getProject(projectId)!, useWorkshopStore.getState().assets);
    const parsed = parseProjectFile(json);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.file.project.id).toBe(projectId);
    expect(parsed.file.project.levels).toHaveLength(before.levels.length);
    expect(parsed.file.assets.some((asset) => asset.id === towerId)).toBe(true);
  });


  it('打包 → 解包 → 還原：關卡、資產與進度都回來', async () => {
    const { packProject, serializeGgmod } = await import('@/workshop/package/pack');
    const { unpackGgmod } = await import('@/workshop/package/unpack');
    const { restoreFromGgmod } = await import('@/workshop/package/restore');

    const level = {
      id: 'l1',
      name: '第一關',
      waves: [{ enemies: [{ type: 'normal', count: 3, delay: 0 }], reward: 10 }],
      winConditions: { surviveWaves: 5 },
    };
    const packed = packProject({
      project: {
        id: 'p1',
        name: '作品',
        version: '1.0.0',
        levelIds: ['l1'],
        data: {
          levels: [level],
          progress: ['l1'],
          assetRefs: [{ assetId: 'a1', version: '1.0.0' }],
        },
      },
      assets: [
        { assetId: 'a1', kind: 'tower', name: '塔', version: '1.0.0', data: { damage: 5 }, dependsOn: [] },
      ],
    });
    expect(packed.ok).toBe(true);
    if (!packed.ok) return;

    const raw = serializeGgmod(packed.value);
    const unpacked = await unpackGgmod(raw);
    expect(unpacked.ok).toBe(true);
    if (!unpacked.ok) return;

    const payload = restoreFromGgmod(unpacked.value.file, 'restored');
    expect(payload.project.levels).toHaveLength(1);
    expect(payload.assets.map((asset) => asset.id)).toEqual(['a1']);
    expect(payload.completedLevels).toEqual(['l1']);
  });

  it('壞掉的專案檔會被擋下（不是靜默接受）', () => {
    expect(parseProjectFile('not json').ok).toBe(false);
    expect(parseProjectFile(JSON.stringify({ magic: 'nope' })).ok).toBe(false);
  });
});
