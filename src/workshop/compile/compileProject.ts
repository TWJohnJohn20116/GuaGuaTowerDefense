// 工坊編譯器主入口：WorkshopProject ＋ 資產庫 → 可直接餵給 modStore 的 Mod，
// 外加 Mod 形狀裝不下的編譯設定（勝負條件／初始資源／來源快照）。
//
// 契約：
// - 純函式，不 import store／React，不產生中文（warning 一律是 studio.* i18n key）
// - 任何缺資產、壞資料都轉成 issue 並跳過該項，永不丟例外
// - mod.content 只放專案實際引用到的資產（collectProjectAssetIds 的候選集合）

import type {
  CustomEnemyData,
  CustomMapData,
  CustomTowerData,
  CustomWaveData,
  Mod,
} from '@/types/game';
import type { CustomScriptData } from '@/types/modScript';
import type {
  AssetRef,
  WorkshopAsset,
  WorkshopAssetKind,
  WorkshopAssetProvenance,
  WorkshopCompileIssue,
  WorkshopCompileOptions,
  WorkshopCompileResult,
  WorkshopCompileWarningCode,
  WorkshopCompiledLevel,
  WorkshopProject,
  WorkshopRuleSetAsset,
} from '@/types/workshop';
import { DEFAULT_WIN_CONDITIONS, mergeWinConditions } from '@/workshop/model/winsConditions';
import { runtimeAssetId } from '@/workshop/ids';
import { collectProjectAssetIds } from './assetGraph';
import { compileTower } from './compileTowers';
import { compileEnemy } from './compileEnemies';
import { compileMap } from './compileMaps';
import { compileLevelWaves } from './compileWaves';
import { compileLevelRules } from './compileRules';
import { compileScriptAsset } from './compileScripts';

/** warning key 的固定前綴；UI 直接拿 key 去 t() */
const ISSUE_KEY_PREFIX = 'studio.compile.';
const DEFAULT_GAME_VERSION = '1.2.0';
const DEFAULT_INITIAL_MONEY = 150;
const DEFAULT_BASE_HEALTH = 20;
const DEFAULT_WAVE_INTERVAL_SECONDS = 8;

type IssueExtra = Pick<WorkshopCompileIssue, 'levelId' | 'assetId' | 'params'>;

function createIssue(code: WorkshopCompileWarningCode, extra?: IssueExtra): WorkshopCompileIssue {
  const issue: WorkshopCompileIssue = { code, key: `${ISSUE_KEY_PREFIX}${code}` };
  if (extra?.levelId !== undefined) issue.levelId = extra.levelId;
  if (extra?.assetId !== undefined) issue.assetId = extra.assetId;
  if (extra?.params !== undefined) issue.params = extra.params;
  return issue;
}

/** 時間戳 → ISO 字串；壞值（NaN／缺欄位）回 epoch，避免 toISOString 丟例外 */
function toIsoString(value: number | undefined): string {
  const ms = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  const date = new Date(ms);
  return Number.isNaN(date.getTime()) ? new Date(0).toISOString() : date.toISOString();
}

function issueSignature(issue: WorkshopCompileIssue): string {
  return [
    issue.code,
    issue.levelId ?? '',
    issue.assetId ?? '',
    JSON.stringify(issue.params ?? {}),
  ].join('|');
}

/** 同一條 issue 只留第一次（不同 action 的 params 不同，所以不會被合併掉） */
function dedupeIssues(issues: readonly WorkshopCompileIssue[]): WorkshopCompileIssue[] {
  const seen = new Set<string>();
  const unique: WorkshopCompileIssue[] = [];
  for (const issue of issues) {
    const signature = issueSignature(issue);
    if (seen.has(signature)) continue;
    seen.add(signature);
    unique.push(issue);
  }
  return unique;
}

export function compileProject(
  project: WorkshopProject,
  assets: readonly WorkshopAsset[],
  options?: WorkshopCompileOptions,
): WorkshopCompileResult {
  const issues: WorkshopCompileIssue[] = [];

  // 同 id 兩個資產 → 執行期撞號；查表保留第一筆
  const assetById = new Map<string, WorkshopAsset>();
  const idCounts = new Map<string, number>();
  for (const asset of assets) {
    if (!assetById.has(asset.id)) assetById.set(asset.id, asset);
    idCounts.set(asset.id, (idCounts.get(asset.id) ?? 0) + 1);
  }

  const candidates = collectProjectAssetIds(project);
  const candidateSet = new Set(candidates);

  for (const [id, count] of idCounts) {
    if (count < 2 || !candidateSet.has(id)) continue;
    issues.push(
      createIssue('duplicateRuntimeId', {
        assetId: id,
        params: { runtimeId: runtimeAssetId(project.id, id) },
      }),
    );
  }

  // AssetRef 的版本快照 vs 資產實際版本
  const checkedRefs = new Set<string>();
  const checkVersion = (ref: AssetRef | null | undefined, levelId?: string): void => {
    if (!ref) return;
    const signature = `${levelId ?? ''}|${ref.assetId}|${ref.version}`;
    if (checkedRefs.has(signature)) return;
    checkedRefs.add(signature);
    const asset = assetById.get(ref.assetId);
    if (!asset || asset.version === ref.version) return;
    const extra: IssueExtra = {
      assetId: ref.assetId,
      params: { expected: ref.version, actual: asset.version },
    };
    if (levelId !== undefined) extra.levelId = levelId;
    issues.push(createIssue('assetVersionMismatch', extra));
  };

  for (const ref of project.assetRefs ?? []) checkVersion(ref);
  checkVersion(project.ruleSetRef);
  for (const level of project.levels) {
    checkVersion(level.ruleSetRef, level.id);
    for (const ref of level.towerRefs ?? []) checkVersion(ref, level.id);
    for (const ref of level.scriptRefs ?? []) checkVersion(ref, level.id);
    for (const ref of level.artRefs ?? []) checkVersion(ref, level.id);
  }

  // 專案層共用資產：缺了就 missingAsset（塔／敵人／腳本／美術都可能放這裡）
  for (const ref of project.assetRefs ?? []) {
    if (!assetById.has(ref.assetId)) {
      issues.push(createIssue('missingAsset', { assetId: ref.assetId }));
    }
  }

  const checkLevelRefs = (
    refs: readonly AssetRef[] | undefined,
    levelId: string,
    expected: WorkshopAssetKind,
  ): void => {
    for (const ref of refs ?? []) {
      const asset = assetById.get(ref.assetId);
      if (!asset) {
        issues.push(createIssue('missingAsset', { levelId, assetId: ref.assetId }));
        continue;
      }
      if (asset.kind !== expected) {
        issues.push(
          createIssue('assetKindMismatch', {
            levelId,
            assetId: ref.assetId,
            params: { expected, actual: asset.kind },
          }),
        );
      }
    }
  };

  for (const level of project.levels) {
    checkLevelRefs(level.towerRefs, level.id, 'tower');
    checkLevelRefs(level.scriptRefs, level.id, 'script');
    checkLevelRefs(level.artRefs, level.id, 'art');
  }

  const resolveRuleSet = (
    ref: AssetRef | null | undefined,
    levelId?: string,
  ): WorkshopRuleSetAsset | null => {
    if (!ref) return null;
    const asset = assetById.get(ref.assetId);
    const extra: IssueExtra = { assetId: ref.assetId };
    if (levelId !== undefined) extra.levelId = levelId;
    if (!asset) {
      issues.push(createIssue('missingAsset', extra));
      return null;
    }
    if (asset.kind !== 'ruleSet') {
      issues.push(
        createIssue('assetKindMismatch', {
          ...extra,
          params: { expected: 'ruleSet', actual: asset.kind },
        }),
      );
      return null;
    }
    return asset;
  };

  const projectRuleSet = resolveRuleSet(project.ruleSetRef);

  // 只有「明確掛在腳本欄位」的腳本才進 Mod：規則的 runScript 不支援，
  // 若把那些腳本一起塞進去，等於讓它們自己的 hook 在遊戲事件上亂跑。
  const scriptAssetIds = new Set<string>();
  for (const ref of project.assetRefs ?? []) {
    const asset = assetById.get(ref.assetId);
    if (asset && asset.kind === 'script') scriptAssetIds.add(asset.id);
  }
  for (const level of project.levels) {
    for (const ref of level.scriptRefs ?? []) {
      const asset = assetById.get(ref.assetId);
      if (asset && asset.kind === 'script') scriptAssetIds.add(asset.id);
    }
  }

  const towers: CustomTowerData[] = [];
  const enemies: CustomEnemyData[] = [];
  const maps: CustomMapData[] = [];
  const scripts: CustomScriptData[] = [];
  const provenance: WorkshopAssetProvenance[] = [];
  const enemyAssetIds = new Set<string>();

  for (const id of candidates) {
    const asset = assetById.get(id);
    if (!asset) continue;
    // 存檔被手改成壞形狀時回 issue，不讓整份編譯丟例外
    const rawData: unknown = asset.data;
    if (typeof rawData !== 'object' || rawData === null) {
      issues.push(createIssue('missingAsset', { assetId: asset.id }));
      continue;
    }
    switch (asset.kind) {
      case 'tower': {
        const compiled = compileTower(project.id, asset);
        towers.push(compiled.tower);
        provenance.push(compiled.provenance);
        break;
      }
      case 'enemy': {
        const compiled = compileEnemy(project.id, asset);
        enemies.push(compiled.enemy);
        provenance.push(compiled.provenance);
        enemyAssetIds.add(asset.id);
        break;
      }
      case 'map': {
        const compiled = compileMap(project.id, asset);
        maps.push(compiled.map);
        provenance.push(compiled.provenance);
        break;
      }
      case 'script': {
        if (!scriptAssetIds.has(asset.id)) break;
        const compiled = compileScriptAsset(project.id, asset);
        scripts.push(compiled.script);
        provenance.push(compiled.provenance);
        issues.push(...compiled.issues);
        break;
      }
      // 規則集不是 Mod 內容（規則會變成腳本），美術沒有 Mod 欄位
      case 'ruleSet':
      case 'art':
        break;
    }
  }

  const compiledLevels: WorkshopCompiledLevel[] = [];
  const waveSets: CustomWaveData[] = [];

  for (const level of project.levels) {
    const mergedConditions = mergeWinConditions(
      project.winConditions ?? DEFAULT_WIN_CONDITIONS,
      level.winConditions,
    );

    let mapId: string | null = null;
    const mapAssetId = level.mapAssetId ?? null;
    if (mapAssetId) {
      const mapAsset = assetById.get(mapAssetId);
      if (!mapAsset) {
        issues.push(createIssue('missingMap', { levelId: level.id, assetId: mapAssetId }));
      } else if (mapAsset.kind !== 'map') {
        issues.push(
          createIssue('assetKindMismatch', {
            levelId: level.id,
            assetId: mapAssetId,
            params: { expected: 'map', actual: mapAsset.kind },
          }),
        );
      } else {
        mapId = runtimeAssetId(project.id, mapAsset.id);
      }
    }

    const waveResult = compileLevelWaves(project.id, level, enemyAssetIds);
    issues.push(...waveResult.issues);
    if (waveResult.waveSet) waveSets.push(waveResult.waveSet);

    const levelRuleSet = resolveRuleSet(level.ruleSetRef, level.id);
    const ruleResult = compileLevelRules({
      projectId: project.id,
      level,
      baseRuleSet: projectRuleSet,
      levelRuleSet,
    });
    issues.push(...ruleResult.issues);
    scripts.push(...ruleResult.scripts);

    const startingResources = level.startingResources ?? {};
    const waveDelayMult = startingResources.waveDelayMult ?? 1;
    const waveInterval = mergedConditions.waveIntervalSeconds ?? DEFAULT_WAVE_INTERVAL_SECONDS;

    const allowedTowerIds: string[] = [];
    for (const ref of level.towerRefs ?? []) {
      const asset = assetById.get(ref.assetId);
      if (asset && asset.kind === 'tower') allowedTowerIds.push(runtimeAssetId(project.id, asset.id));
    }

    compiledLevels.push({
      id: level.id,
      name: level.name,
      mapId,
      waveSetId: waveResult.waveSet?.id ?? null,
      initialMoney: mergedConditions.initialMoney ?? startingResources.money ?? DEFAULT_INITIAL_MONEY,
      baseHealth: mergedConditions.baseHealth ?? startingResources.health ?? DEFAULT_BASE_HEALTH,
      waveIntervalSeconds: Math.round(waveInterval * waveDelayMult),
      winConditions: mergedConditions,
      allowedTowerIds,
    });
  }

  // 執行期 id 去重（保留第一筆：塔 → 敵人 → 地圖 → 波次 → 腳本）
  const keptIds = new Set<string>();
  const provenanceById = new Map<string, WorkshopAssetProvenance>();
  for (const entry of provenance) provenanceById.set(entry.runtimeId, entry);

  const uniqueById = <T extends { id: string }>(items: readonly T[]): T[] => {
    const kept: T[] = [];
    for (const item of items) {
      if (keptIds.has(item.id)) {
        issues.push(
          createIssue('duplicateRuntimeId', {
            assetId: provenanceById.get(item.id)?.assetId ?? item.id,
            params: { runtimeId: item.id },
          }),
        );
        continue;
      }
      keptIds.add(item.id);
      kept.push(item);
    }
    return kept;
  };

  const content: Mod['content'] = {
    towers: uniqueById(towers),
    enemies: uniqueById(enemies),
    maps: uniqueById(maps),
    waves: uniqueById(waveSets),
    scripts: uniqueById(scripts),
  };

  const mod: Mod = {
    metadata: {
      id: project.id,
      name: project.name,
      version: project.version,
      author: project.author,
      description: project.description,
      type: 'full',
      gameVersion: options?.gameVersion ?? DEFAULT_GAME_VERSION,
      createdAt: toIsoString(project.createdAt),
      updatedAt: toIsoString(project.updatedAt),
    },
    content,
    enabled: options?.enabled ?? true,
    loadOrder: options?.loadOrder ?? 0,
  };

  const finalIssues = dedupeIssues(issues);
  const warnings: string[] = [];
  for (const issue of finalIssues) {
    if (!warnings.includes(issue.key)) warnings.push(issue.key);
  }

  return {
    mod,
    warnings,
    issues: finalIssues,
    settings: {
      projectId: project.id,
      levels: compiledLevels,
      // 只列「真的編進 Mod 且對得回資產」的產物（波次與規則腳本不是資產）
      provenance: provenance.filter((entry) => keptIds.has(entry.runtimeId)),
    },
  };
}
