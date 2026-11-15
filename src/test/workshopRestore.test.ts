import { describe, expect, it } from 'vitest';
import { restoreFromGgmod } from '@/workshop/package/restore';
import type { GgmodFile } from '@/workshop/package/format';

function makeFile(overrides: Partial<GgmodFile> = {}): GgmodFile {
  return {
    magic: 'ggmod',
    formatVersion: 1,
    generator: 'test',
    createdAt: '2026-11-15T00:00:00.000Z',
    project: {
      id: 'p1',
      name: '作品',
      description: 'd',
      version: '1.2.0',
      author: 'me',
      license: 'cc-by-4.0',
      levelIds: ['l1'],
      data: {
        levels: [{ id: 'l1', name: '第一關', waves: [], winConditions: { surviveWaves: 5 } }],
        winConditions: { surviveWaves: 10 },
        ruleSetRef: { assetId: 'a2', version: '1.0.0' },
        assetRefs: [{ assetId: 'a1', version: '1.0.0' }],
        progress: ['l1', 'ghost'],
      },
    },
    assets: [
      {
        assetId: 'a1',
        kind: 'tower',
        name: '塔',
        version: '1.0.0',
        data: { damage: 5 },
        dependsOn: [{ assetId: 'a2', version: '1.0.0' }],
      },
    ],
    thumbnail: null,
    stats: { projectBytes: 0, assetsBytes: 0, thumbnailBytes: 0, totalBytes: 0, assetCount: 1 },
    signature: null,
    ...overrides,
  };
}

describe('ggmod restore', () => {
  it('還原關卡、資產與引用', () => {
    const payload = restoreFromGgmod(makeFile(), 'new-id');
    expect(payload.project.id).toBe('new-id');
    expect(payload.project.levels).toHaveLength(1);
    expect(payload.project.levels[0].name).toBe('第一關');
    expect(payload.project.assetRefs).toEqual([{ assetId: 'a1', version: '1.0.0' }]);
    expect(payload.project.ruleSetRef?.assetId).toBe('a2');
    expect(payload.assets[0].id).toBe('a1');
    expect(payload.assets[0].dependsOn).toEqual(['a2']);
  });

  it('進度只保留真的存在的關卡', () => {
    const payload = restoreFromGgmod(makeFile(), 'x');
    expect(payload.completedLevels).toEqual(['l1']);
  });

  it('未知授權回退成 all-rights-reserved，壞資料不炸', () => {
    const file = makeFile();
    const broken = { ...file, project: { ...file.project, license: 'weird', data: null } } as GgmodFile;
    const payload = restoreFromGgmod(broken, 'x');
    expect(payload.project.license).toBe('all-rights-reserved');
    expect(payload.project.levels).toEqual([]);
  });
});
