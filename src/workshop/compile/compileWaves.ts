// 關卡波次 → CustomWaveData，並把敵人 id 改寫成執行期 id。
//
// enemies[].type 有兩種可能：內建 EnemyType，或本次編譯的敵人資產 id。
// 判定順序固定：先比對資產 id（改寫），再比對內建清單（原樣），
// 都不是就回 missingAsset 並丟掉那個 group；整波 group 全被丟掉時保留空波，
// 讓關卡波數不會因為一個壞 group 而少一波。

import type { CustomWaveData, WaveConfig } from '@/types/game';
import type {
  WorkshopCompileIssue,
  WorkshopCompileWarningCode,
  WorkshopLevel,
} from '@/types/workshop';
import { runtimeAssetId } from '@/workshop/ids';
import { isBuiltinEnemyType } from './compileEnemies';

interface WaveCompileResult {
  waveSet: CustomWaveData | null;
  issues: WorkshopCompileIssue[];
}

function createIssue(
  code: WorkshopCompileWarningCode,
  extra: Pick<WorkshopCompileIssue, 'levelId' | 'assetId'> = {},
): WorkshopCompileIssue {
  const issue: WorkshopCompileIssue = { code, key: `studio.compile.${code}` };
  if (extra.levelId !== undefined) issue.levelId = extra.levelId;
  if (extra.assetId !== undefined) issue.assetId = extra.assetId;
  return issue;
}

export function compileLevelWaves(
  projectId: string,
  level: WorkshopLevel,
  enemyAssetIds: ReadonlySet<string>,
): WaveCompileResult {
  const issues: WorkshopCompileIssue[] = [];
  const sourceWaves = level.waves ?? [];
  if (sourceWaves.length === 0) {
    issues.push(createIssue('emptyWaves', { levelId: level.id }));
    return { waveSet: null, issues };
  }

  const compiled: WaveConfig[] = [];
  for (const wave of sourceWaves) {
    const groups: WaveConfig['enemies'] = [];
    for (const group of wave.enemies ?? []) {
      if (enemyAssetIds.has(group.type)) {
        groups.push({ ...group, type: runtimeAssetId(projectId, group.type) });
        continue;
      }
      if (isBuiltinEnemyType(group.type)) {
        groups.push({ ...group });
        continue;
      }
      issues.push(createIssue('missingAsset', { levelId: level.id, assetId: group.type }));
    }
    // 原本有敵人卻一個都對不上：留空波（波數不變）並回報
    if (groups.length === 0 && (wave.enemies ?? []).length > 0) {
      issues.push(createIssue('invalidWaveGroup', { levelId: level.id }));
    }
    compiled.push({ enemies: groups, reward: wave.reward });
  }

  return {
    waveSet: {
      id: runtimeAssetId(projectId, `waves.${level.id}`),
      modId: projectId,
      name: level.name,
      description: level.description ?? '',
      waves: compiled,
    },
    issues,
  };
}
