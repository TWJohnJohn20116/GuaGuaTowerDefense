/**
 * .ggmod 打包：把工坊端的專案 + 資產整理成可下載的單一 JSON 容器。
 *
 * 為什麼驗證全部擠在打包端：.ggmod 會被傳給別人、也可能被改過再傳回來。
 * 一旦容器裡出現「依賴指向不存在的資產」或「循環依賴」，等解包端才發現時
 * 壞檔案已經落在磁碟上。所以能在寫檔前判死的一律先判死。
 *
 * 契約：packProject 永不丟例外，任何輸入都回 GgmodResult。
 * 訊息一律英文技術描述（UI 文案來自 locales，資料層不出現中文）。
 */
import {
  GGMOD_FORMAT_VERSION,
  GGMOD_MAGIC,
  isRecord,
  utf8ByteLength,
  type GgmodAssetKind,
  type GgmodAssetRef,
  type GgmodAssetSnapshot,
  type GgmodFile,
  type GgmodIssue,
  type GgmodProjectSnapshot,
  type GgmodResult,
  type GgmodSizeStats,
  type GgmodThumbnail,
} from './format';

/** 打包端看到的一筆資產：store 的 WorkshopAsset 直接餵進來即可 */
export interface PackAssetSource {
  assetId: string;
  kind: GgmodAssetKind;
  name: string;
  /** 語意化版本字串（'1.0.0'） */
  version: string;
  data: unknown;
  /**
   * 省略＝沒有依賴。
   * version 留空字串代表「呼叫端沒解析到版本」（store 端 dependsOn 只有 id），
   * 這種情況只檢查 assetId 是否存在，不做版本比對。
   */
  dependsOn?: GgmodAssetRef[];
}

/** 打包端的專案來源；除 id / name 外都有預設值，讓呼叫端不必補齊全部欄位 */
export interface PackProjectSource {
  id: string;
  name: string;
  description?: string;
  version?: string;
  author?: string;
  license?: string;
  levelIds?: string[];
  data?: unknown;
  thumbnail?: GgmodThumbnail | null;
}

export interface PackRequest {
  project: PackProjectSource;
  assets: PackAssetSource[];
  /** 產生者字串；空白或省略時用 DEFAULT_GENERATOR */
  generator?: string;
  /** 固定 createdAt（測試與可重現建置用）；省略＝取現在時間 */
  now?: string;
}

const DEFAULT_GENERATOR = 'guatd-workshop';

/**
 * 資產版本格式。
 * 為什麼要驗：AssetRef 的比對是字串相等，'1.0' 與 '1.0.0' 會被當成不同版本，
 * 允許這種值寫進封包等於埋一個「永遠版本不符」的地雷。
 */
const SEMVER_PATTERN = /^\d+\.\d+\.\d+([-+].*)?$/;

/** 縮圖 base64：只允許標準字母表與尾端補齊，且長度必為 4 的倍數 */
const BASE64_PATTERN = /^[A-Za-z0-9+/]*={0,2}$/;

/** kind 的合法值；與 WorkshopAssetKind 同步（少一個就會在打包時被擋下） */
const ASSET_KIND_NAMES: ReadonlySet<string> = new Set<string>([
  'tower',
  'enemy',
  'map',
  'ruleSet',
  'script',
  'art',
]);

/** 先佔位再算實算值：measureGgmodFile 會忽略 stats 本身，所以佔位值不影響結果 */
const ZERO_STATS: GgmodSizeStats = {
  projectBytes: 0,
  assetsBytes: 0,
  thumbnailBytes: 0,
  totalBytes: 0,
  assetCount: 0,
};

/* ------------------------------------------------------------------ 對外 API */

/**
 * 打包。成功回 GgmodFile（stats 已算好、signature 為 null 等 sign.ts 補），
 * 失敗回「全部」偵測到的問題，不丟例外。
 */
export function packProject(request: PackRequest): GgmodResult<GgmodFile> {
  try {
    return buildPacked(request);
  } catch (error) {
    // 走到這裡代表規格外輸入（例如帶 getter 的物件）。容器的承諾是「只回結果、不丟例外」。
    console.error('[ggmod] unexpected failure while packing', error);
    return {
      ok: false,
      errors: [
        {
          code: 'SCHEMA_INVALID',
          path: '$',
          message: 'pack failed: ' + describeError(error),
        },
      ],
    };
  }
}

/**
 * 量測容量。
 *
 * totalBytes 用「整份檔案扣掉 stats 與 signature」來算，兩個排除都是必要的：
 * 1) stats 放總長度會自我遞迴（量自己）。
 * 2) 簽章覆蓋含 stats 的內容，若 stats 又去量簽章就是第二層自我遞迴——
 *    先簽章會讓 stats 過期、先算 stats 會讓簽章後的 canonical 變動，兩者不可能同時成立。
 * 排除 signature 之後，「簽章前後 totalBytes 不變」是可驗證的不變式，
 * unpack 才有穩定基準可以比對（unpack.ts 的 measureFile 必須與這裡一字不差）。
 */
export function measureGgmodFile(file: GgmodFile): GgmodSizeStats {
  const projectBytes = utf8ByteLength(JSON.stringify(file.project));
  const assetsBytes = utf8ByteLength(JSON.stringify(file.assets));
  const thumbnailBytes = file.thumbnail === null ? 0 : utf8ByteLength(JSON.stringify(file.thumbnail));
  const totalBytes = utf8ByteLength(
    JSON.stringify({ ...file, stats: undefined, signature: undefined }),
  );
  return {
    projectBytes,
    assetsBytes,
    thumbnailBytes,
    totalBytes,
    assetCount: file.assets.length,
  };
}

/** 下載用的單行 JSON。刻意不 pretty print：同一份資料在兩個載入端解析結果必須一致 */
export function serializeGgmod(file: GgmodFile): string {
  return JSON.stringify(file);
}

/* ------------------------------------------------------------------ 組裝 */

function buildPacked(request: PackRequest): GgmodResult<GgmodFile> {
  if (!isRecord(request)) {
    return {
      ok: false,
      errors: [{ code: 'SCHEMA_INVALID', path: '$', message: 'pack request must be an object' }],
    };
  }
  const issues: GgmodIssue[] = [];
  const projectBuild = buildProject(request.project, issues);
  const assets = buildAssets(request.assets, issues);
  if (issues.length > 0) return { ok: false, errors: issues };

  const assetIssues = findAssetIssues(assets);
  if (assetIssues.length > 0) return { ok: false, errors: assetIssues };

  const generatorValue = request.generator;
  const generator =
    typeof generatorValue === 'string' && generatorValue.trim().length > 0
      ? generatorValue
      : DEFAULT_GENERATOR;
  const createdAt = readCreatedAt(request.now, issues);
  if (issues.length > 0) return { ok: false, errors: issues };

  const draft: GgmodFile = {
    magic: GGMOD_MAGIC,
    formatVersion: GGMOD_FORMAT_VERSION,
    generator,
    createdAt,
    project: projectBuild.project,
    assets,
    thumbnail: projectBuild.thumbnail,
    stats: ZERO_STATS,
    signature: null,
  };
  return { ok: true, value: { ...draft, stats: measureGgmodFile(draft) } };
}

interface ProjectBuild {
  project: GgmodProjectSnapshot;
  thumbnail: GgmodThumbnail | null;
}

function buildProject(source: unknown, issues: GgmodIssue[]): ProjectBuild {
  if (!isRecord(source)) {
    issues.push({ code: 'SCHEMA_INVALID', path: 'project', message: 'project must be an object' });
    return {
      project: {
        id: '',
        name: '',
        description: '',
        version: '0.0.0',
        author: '',
        license: '',
        levelIds: [],
        data: null,
      },
      thumbnail: null,
    };
  }
  return {
    project: {
      id: readRequiredString(source, 'id', 'project.id', issues),
      name: readRequiredString(source, 'name', 'project.name', issues),
      description: readString(source, 'description', 'project.description', '', issues),
      // 專案版本是自由字串（工坊端就是 string），不套資產那套 semver 規則：
      // 專案版本沒有被任何 AssetRef 參照，驗太嚴只會擋下合法專案。
      version: readString(source, 'version', 'project.version', '1.0.0', issues),
      author: readString(source, 'author', 'project.author', '', issues),
      license: readString(source, 'license', 'project.license', '', issues),
      levelIds: readStringArray(source, 'levelIds', 'project.levelIds', issues),
      data: readJsonData(source, 'data', 'project.data', issues),
    },
    thumbnail: readThumbnail(source.thumbnail, 'project.thumbnail', issues),
  };
}

function buildAssets(source: unknown, issues: GgmodIssue[]): GgmodAssetSnapshot[] {
  if (!Array.isArray(source)) {
    issues.push({
      code: 'SCHEMA_INVALID',
      path: 'assets',
      message: 'assets must be an array (got ' + describeValue(source) + ')',
    });
    return [];
  }
  const snapshots: GgmodAssetSnapshot[] = [];
  source.forEach((item: unknown, index: number) => {
    const path = 'assets[' + index + ']';
    if (!isRecord(item)) {
      issues.push({ code: 'SCHEMA_INVALID', path, message: path + ' must be an object' });
      return;
    }
    snapshots.push({
      assetId: readRequiredString(item, 'assetId', path + '.assetId', issues),
      kind: readAssetKind(item.kind, path + '.kind', issues),
      name: readRequiredString(item, 'name', path + '.name', issues),
      version: readAssetVersion(item.version, path + '.version', issues),
      data: readJsonData(item, 'data', path + '.data', issues),
      dependsOn: readDependsOn(item.dependsOn, path + '.dependsOn', issues),
    });
  });
  return snapshots;
}

/* ------------------------------------------------------------------ 資產圖檢查 */

/**
 * 重複 / 缺資產 / 版本不符 / 循環依賴。
 * 分階段且「前一段有錯就停」：依賴圖在資料不完整時算出來的結論只會誤導人。
 */
function findAssetIssues(assets: GgmodAssetSnapshot[]): GgmodIssue[] {
  const issues: GgmodIssue[] = [];
  const byId = new Map<string, GgmodAssetSnapshot>();
  for (const asset of assets) {
    if (byId.has(asset.assetId)) {
      issues.push({
        code: 'ASSET_DUPLICATE',
        path: asset.assetId,
        message: 'asset id "' + asset.assetId + '" appears more than once in the package',
      });
      continue;
    }
    byId.set(asset.assetId, asset);
  }
  if (issues.length > 0) return issues;

  const edges = new Map<string, string[]>();
  for (const asset of assets) {
    const targets: string[] = [];
    for (const ref of asset.dependsOn) {
      const target = byId.get(ref.assetId);
      if (!target) {
        issues.push({
          code: 'ASSET_MISSING',
          path: ref.assetId,
          message: 'asset "' + asset.assetId + '" depends on missing asset "' + ref.assetId + '"',
        });
        continue;
      }
      // 空字串＝呼叫端沒解析到版本：只確認存在，不比版本。
      // 硬比會把「只帶 id 的合法依賴」全部判死（PublishPanel 就是這種呼叫端）。
      if (ref.version !== '' && target.version !== ref.version) {
        issues.push({
          code: 'ASSET_VERSION_MISMATCH',
          path: ref.assetId,
          message:
            'asset "' + asset.assetId + '" requires "' + ref.assetId + '"@' + ref.version +
            ' but the package has ' + target.version,
        });
      }
      targets.push(ref.assetId);
    }
    edges.set(asset.assetId, targets);
  }
  if (issues.length > 0) return issues;

  const cycle = findDependencyCycle([...byId.keys()], edges);
  if (cycle !== null) {
    issues.push({
      code: 'DEPENDENCY_CYCLE',
      path: cycle.join(' -> '),
      message: 'asset dependency cycle: ' + cycle.join(' -> '),
    });
  }
  return issues;
}

/**
 * DFS 三色標記：0 白（未走訪）、1 灰（走訪中）、2 黑（已完成）。
 *
 * 為什麼不用「遞迴深度上限」：灰節點被打中就是真循環，沿堆疊回推到起點即可，
 * 不需要猜深度；而深度上限在合法但很深的依賴鏈上會誤報。
 */
function findDependencyCycle(ids: string[], edges: Map<string, string[]>): string[] | null {
  const state = new Map<string, number>();
  const stack: string[] = [];

  const visit = (id: string): string[] | null => {
    const current = state.get(id) ?? 0;
    if (current === 2) return null;
    if (current === 1) {
      const start = stack.indexOf(id);
      const chain = stack.slice(start === -1 ? 0 : start);
      chain.push(id);
      return chain;
    }
    state.set(id, 1);
    stack.push(id);
    for (const next of edges.get(id) ?? []) {
      const found = visit(next);
      if (found !== null) return found;
    }
    stack.pop();
    state.set(id, 2);
    return null;
  };

  for (const id of ids) {
    const found = visit(id);
    if (found !== null) return found;
  }
  return null;
}

/* ------------------------------------------------------------------ 深拷貝 */

type CloneOutcome = { ok: true; value: unknown } | { ok: false; issue: GgmodIssue };

/**
 * 深拷貝成「純 JSON 快照」。
 *
 * 為什麼先試 JSON 再退 structuredClone：封包最終會被序列化成 JSON，
 * 用 JSON 走一遍等於先替解包端驗證「這份 data 真的寫得進去」。
 * 只有 JSON 表達不了的東西（Map／Set／Date／undefined 欄位）才交給 structuredClone，
 * 因為那個 fallback 會保留結構，仍可序列化。
 *
 * 循環參考無論如何都不放行：JSON 化會直接爆掉，structuredClone 卻會默默成功，
 * 兩者行為不一致的話同一份資料在瀏覽器與 Node 會得到不同結果。
 */
function cloneForSnapshot(input: unknown, path: string): CloneOutcome {
  let text: string | undefined;
  try {
    text = JSON.stringify(input);
  } catch (error) {
    if (isCycleError(error)) {
      return {
        ok: false,
        issue: {
          code: 'DEPENDENCY_CYCLE',
          path,
          message: path + ' contains a circular reference and cannot be serialized as JSON',
        },
      };
    }
    return structuredFallback(input, path, error);
  }
  if (typeof text === 'string') {
    const parsed: unknown = JSON.parse(text);
    return { ok: true, value: parsed };
  }
  return structuredFallback(input, path, undefined);
}

function structuredFallback(input: unknown, path: string, cause: unknown): CloneOutcome {
  const structured = (globalThis as { structuredClone?: (value: unknown) => unknown }).structuredClone;
  if (typeof structured === 'function') {
    try {
      return { ok: true, value: structured(input) };
    } catch (error) {
      return {
        ok: false,
        issue: {
          code: 'SCHEMA_INVALID',
          path,
          message: path + ' cannot be deep-copied: ' + describeError(error),
        },
      };
    }
  }
  return {
    ok: false,
    issue: {
      code: 'SCHEMA_INVALID',
      path,
      message: path + ' is not JSON-serializable: ' + describeCause(cause),
    },
  };
}

/** JSON.stringify 對循環參考的典型錯誤是 TypeError: Converting circular structure to JSON */
function isCycleError(error: unknown): boolean {
  if (!(error instanceof TypeError)) return false;
  return /circular|cyclic/i.test(error.message);
}

/* ------------------------------------------------------------------ 欄位讀取 */

function readRequiredString(
  source: Record<string, unknown>,
  key: string,
  path: string,
  issues: GgmodIssue[],
): string {
  const value = source[key];
  if (typeof value !== 'string' || value.trim().length === 0) {
    issues.push({
      code: 'SCHEMA_INVALID',
      path,
      message: path + ' must be a non-empty string (got ' + describeValue(value) + ')',
    });
    return '';
  }
  return value;
}

function readString(
  source: Record<string, unknown>,
  key: string,
  path: string,
  fallback: string,
  issues: GgmodIssue[],
): string {
  const value = source[key];
  if (value === undefined) return fallback;
  if (typeof value !== 'string') {
    issues.push({
      code: 'SCHEMA_INVALID',
      path,
      message: path + ' must be a string (got ' + describeValue(value) + ')',
    });
    return fallback;
  }
  return value;
}

function readStringArray(
  source: Record<string, unknown>,
  key: string,
  path: string,
  issues: GgmodIssue[],
): string[] {
  const value = source[key];
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    issues.push({
      code: 'SCHEMA_INVALID',
      path,
      message: path + ' must be an array of strings (got ' + describeValue(value) + ')',
    });
    return [];
  }
  const out: string[] = [];
  value.forEach((item: unknown, index: number) => {
    if (typeof item !== 'string') {
      issues.push({
        code: 'SCHEMA_INVALID',
        path: path + '[' + index + ']',
        message: path + '[' + index + '] must be a string',
      });
      return;
    }
    out.push(item);
  });
  return out;
}

function readAssetVersion(value: unknown, path: string, issues: GgmodIssue[]): string {
  if (typeof value === 'string' && SEMVER_PATTERN.test(value)) return value;
  issues.push({
    code: 'SCHEMA_INVALID',
    path,
    message: path + ' must be a semver string such as "1.0.0" (got ' + describeValue(value) + ')',
  });
  // 佔位值：有任何 issue 時呼叫端會整批退掉，這個值不會被寫進檔案
  return '0.0.0';
}

function isAssetKind(value: string): value is GgmodAssetKind {
  return ASSET_KIND_NAMES.has(value);
}

function readAssetKind(value: unknown, path: string, issues: GgmodIssue[]): GgmodAssetKind {
  if (typeof value === 'string' && isAssetKind(value)) return value;
  issues.push({
    code: 'SCHEMA_INVALID',
    path,
    message: path + ' must be one of tower|enemy|map|ruleSet|script|art (got ' + describeValue(value) + ')',
  });
  return 'art';
}

function readDependsOn(value: unknown, path: string, issues: GgmodIssue[]): GgmodAssetRef[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    issues.push({
      code: 'SCHEMA_INVALID',
      path,
      message: path + ' must be an array of { assetId, version }',
    });
    return [];
  }
  const refs: GgmodAssetRef[] = [];
  value.forEach((item: unknown, index: number) => {
    const refPath = path + '[' + index + ']';
    if (!isRecord(item)) {
      issues.push({ code: 'SCHEMA_INVALID', path: refPath, message: refPath + ' must be an object' });
      return;
    }
    const assetId = item.assetId;
    if (typeof assetId !== 'string' || assetId.trim().length === 0) {
      issues.push({
        code: 'SCHEMA_INVALID',
        path: refPath + '.assetId',
        message: refPath + '.assetId must be a non-empty string',
      });
      return;
    }
    const version = item.version;
    // 空字串是合法值（＝呼叫端沒解析到版本），所以這裡只擋型別
    if (typeof version !== 'string') {
      issues.push({
        code: 'SCHEMA_INVALID',
        path: refPath + '.version',
        message: refPath + '.version must be a string ("" means unresolved)',
      });
      return;
    }
    refs.push({ assetId, version });
  });
  return refs;
}

function readJsonData(
  source: Record<string, unknown>,
  key: string,
  path: string,
  issues: GgmodIssue[],
): unknown {
  const raw = source[key];
  if (raw === undefined) return null;
  const cloned = cloneForSnapshot(raw, path);
  if (!cloned.ok) {
    issues.push(cloned.issue);
    return null;
  }
  return cloned.value;
}

function readThumbnail(value: unknown, path: string, issues: GgmodIssue[]): GgmodThumbnail | null {
  if (value === undefined || value === null) return null;
  if (!isRecord(value)) {
    issues.push({
      code: 'THUMBNAIL_INVALID',
      path,
      message: path + ' must be an object { mediaType, base64 } or null',
    });
    return null;
  }
  const mediaType = value.mediaType;
  const base64 = value.base64;
  if (typeof mediaType !== 'string' || mediaType.trim().length === 0) {
    issues.push({
      code: 'THUMBNAIL_INVALID',
      path: path + '.mediaType',
      message: path + '.mediaType must be a non-empty string such as "image/png"',
    });
    return null;
  }
  if (typeof base64 !== 'string' || !isBase64(base64)) {
    issues.push({
      code: 'THUMBNAIL_INVALID',
      path: path + '.base64',
      message: path + '.base64 must be standard base64 (A-Za-z0-9+/, padding =, length multiple of 4)',
    });
    return null;
  }
  return { mediaType, base64 };
}

/**
 * base64 檢查。
 * 空字串不算合法：縮圖存在卻零位元組，UI 端會拿到一張永遠讀不出來的圖，
 * 不如在這裡就讓它變成 THUMBNAIL_INVALID。
 */
function isBase64(value: string): boolean {
  if (value.length === 0) return false;
  return value.length % 4 === 0 && BASE64_PATTERN.test(value);
}

function readCreatedAt(value: unknown, issues: GgmodIssue[]): string {
  if (value === undefined) return new Date().toISOString();
  if (typeof value !== 'string' || value.trim().length === 0) {
    issues.push({
      code: 'SCHEMA_INVALID',
      path: 'createdAt',
      message: 'now must be an ISO 8601 string (got ' + describeValue(value) + ')',
    });
    return new Date().toISOString();
  }
  return value;
}

/* ------------------------------------------------------------------ 訊息小工具 */

function describeValue(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return 'array(' + value.length + ')';
  return 'object';
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function describeCause(cause: unknown): string {
  return cause === undefined ? 'value is not representable in JSON' : describeError(cause);
}
