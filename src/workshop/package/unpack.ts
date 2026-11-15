/**
 * .ggmod 解包：把一段 JSON 字串還原成 GgmodFile，並做「格式相容 → 結構 → 資產完整性
 * → 容量一致 → 簽章狀態」五段檢查。
 *
 * 為什麼不 import sign.ts：sign.ts 反過來 import 本檔的型別，兩邊互相 import 會形成循環；
 * 而且「用哪把公鑰、信不信任那個指紋」是呼叫端的政策，不是格式的一部分。
 * 所以這裡用注入的 verifySignature，把驗簽留給 sign.ts / PublishPanel 決定。
 *
 * 契約：unpackGgmod 永不丟例外（含 verifySignature 自己拋錯），任何輸入都回 GgmodResult。
 * 訊息一律英文技術描述（UI 文案來自 locales，資料層不出現中文）。
 */
import type { ModSignature } from '@/types/modScript';
import {
  GGMOD_FORMAT_VERSION,
  GGMOD_MAGIC,
  GGMOD_MIN_SUPPORTED,
  isRecord,
  utf8ByteLength,
  type GgmodAssetKind,
  type GgmodAssetRef,
  type GgmodAssetSnapshot,
  type GgmodErrorCode,
  type GgmodFile,
  type GgmodIssue,
  type GgmodProjectSnapshot,
  type GgmodResult,
  type GgmodSizeStats,
  type GgmodThumbnail,
} from './format';

/** 簽章狀態。刻意不另開 export：呼叫端只會讀結果，不需要為這個聯集命名 */
type SignatureStatus = 'unsigned' | 'valid' | 'invalid' | 'error';

export interface UnpackOptions {
  /** true＝沒有簽章就整體失敗（SIGNATURE_REQUIRED） */
  requireSignature?: boolean;
  /**
   * 驗簽注入點。sign.ts 的 verifyGgmodSignature 形狀完全吻合，可直接傳進來；
   * 拋錯或回 'error' 只反映在 signatureStatus，不算結構錯誤。
   */
  verifySignature?: (file: GgmodFile) => Promise<{
    status: SignatureStatus;
    fingerprint?: string;
    error?: string;
  }>;
}

export interface UnpackResult {
  /** stats 已用實算值回填（宣告值只拿來比對，不留下來當真相） */
  file: GgmodFile;
  signatureStatus: SignatureStatus;
  fingerprint?: string;
  signatureError?: string;
}

/** 版本相容：落在 [GGMOD_MIN_SUPPORTED, GGMOD_FORMAT_VERSION] 之間才敢讀 */
export function isGgmodCompatible(formatVersion: number): boolean {
  return (
    Number.isInteger(formatVersion) &&
    formatVersion >= GGMOD_MIN_SUPPORTED &&
    formatVersion <= GGMOD_FORMAT_VERSION
  );
}

/**
 * 容量比對容許的位元組誤差。
 * 為什麼不是 0：不同 JS 引擎對同一個字串的 UTF-8 計數一致，但封包可能被
 * 中間工具重排鍵順序或補空白；±2 讓「本質同一份」的檔案不會被誤判成篡改，
 * 同時仍擋得住真的少了一段資料的檔案。
 */
const STATS_TOLERANCE_BYTES = 2;

/** kind 的合法值；與 WorkshopAssetKind 同步 */
const ASSET_KIND_NAMES: ReadonlySet<string> = new Set<string>([
  'tower',
  'enemy',
  'map',
  'ruleSet',
  'script',
  'art',
]);

const SEMVER_PATTERN = /^\d+\.\d+\.\d+([-+].*)?$/;
const BASE64_PATTERN = /^[A-Za-z0-9+/]*={0,2}$/;

/* ------------------------------------------------------------------ 對外 API */

export async function unpackGgmod(
  raw: string,
  options: UnpackOptions = {},
): Promise<GgmodResult<UnpackResult>> {
  try {
    return await unpackInternal(raw, options);
  } catch (error) {
    // 走到這裡代表規格外輸入（例如被 Proxy 包過的 options）。
    // 解包的承諾是「只回結果、不丟例外」——UI 端沒有 try/catch 這種東西。
    console.error('[ggmod] unexpected failure while unpacking', error);
    return {
      ok: false,
      errors: [
        { code: 'SCHEMA_INVALID', path: '$', message: 'unpack failed: ' + describeError(error) },
      ],
    };
  }
}

/* ------------------------------------------------------------------ 主流程 */

async function unpackInternal(
  raw: string,
  options: UnpackOptions,
): Promise<GgmodResult<UnpackResult>> {
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    return failIssue('NOT_JSON', '$', 'input must be a non-empty JSON string');
  }
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return failIssue('NOT_JSON', '$', 'content is not valid JSON: ' + describeError(error));
  }
  if (!isRecord(parsed)) {
    return failIssue('SCHEMA_INVALID', '$', 'root of the package must be a JSON object');
  }

  const magic = parsed.magic;
  if (magic !== GGMOD_MAGIC) {
    // 訊息一定要寫出實際值：使用者最常見的錯誤是選到別的 .json 檔
    return failIssue(
      'MAGIC_MISMATCH',
      'magic',
      'magic must be "' + GGMOD_MAGIC + '" (got ' + describeValue(magic) + ')',
    );
  }

  const rawVersion = parsed.formatVersion;
  if (typeof rawVersion !== 'number' || !Number.isInteger(rawVersion)) {
    return failIssue(
      'SCHEMA_INVALID',
      'formatVersion',
      'formatVersion must be an integer (got ' + describeValue(rawVersion) + ')',
    );
  }
  if (!isGgmodCompatible(rawVersion)) {
    return failIssue(
      'VERSION_UNSUPPORTED',
      'formatVersion',
      'unsupported formatVersion ' + rawVersion + ' (supported ' + GGMOD_MIN_SUPPORTED + '..' +
        GGMOD_FORMAT_VERSION + ', this build writes ' + GGMOD_FORMAT_VERSION + ')',
    );
  }
  const formatVersion = rawVersion;

  const issues: GgmodIssue[] = [];
  const generator = readString(parsed, 'generator', 'generator', '', issues);
  const createdAt = readString(parsed, 'createdAt', 'createdAt', '', issues);
  const project = readProject(parsed.project, issues);
  const assets = readAssets(parsed.assets, issues);
  const thumbnail = readThumbnail(parsed.thumbnail, 'thumbnail', issues);
  const declaredStats = readStats(parsed.stats, issues);
  const signature = readSignature(parsed.signature, issues);
  if (issues.length > 0 || declaredStats === null) {
    if (issues.length === 0) {
      issues.push({
        code: 'SCHEMA_INVALID',
        path: 'stats',
        message: 'stats is required to verify package integrity',
      });
    }
    return { ok: false, errors: issues };
  }

  const assetIssues = checkAssetIntegrity(assets);
  if (assetIssues.length > 0) return { ok: false, errors: assetIssues };

  const draft: GgmodFile = {
    magic: GGMOD_MAGIC,
    formatVersion,
    generator,
    createdAt,
    project,
    assets,
    thumbnail,
    stats: declaredStats,
    signature,
  };
  const actualStats = measureFile(draft);
  const statsIssues = compareStats(declaredStats, actualStats);
  if (statsIssues.length > 0) return { ok: false, errors: statsIssues };

  const file: GgmodFile = { ...draft, stats: actualStats };

  const signatureOutcome = await resolveSignature(file, options);
  if (options.requireSignature === true && file.signature === null) {
    return failIssue(
      'SIGNATURE_REQUIRED',
      'signature',
      'this package is unsigned but the caller requires a signature',
    );
  }

  const result: UnpackResult = { file, signatureStatus: signatureOutcome.status };
  if (signatureOutcome.fingerprint !== undefined) result.fingerprint = signatureOutcome.fingerprint;
  if (signatureOutcome.error !== undefined) result.signatureError = signatureOutcome.error;
  return { ok: true, value: result };
}

/* ------------------------------------------------------------------ 簽章 */

interface SignatureOutcome {
  status: SignatureStatus;
  fingerprint?: string;
  error?: string;
}

/**
 * 簽章狀態。
 *
 * 兩種「沒有結論」的情況刻意分開處理：
 * - signature 為 null：真的是未簽章 → 'unsigned'。
 * - 有簽章但呼叫端沒注入 verifier：也只能回 'unsigned'（本檔不碰 crypto），
 *   但 requireSignature 的判定看的是「檔案有沒有簽章區塊」，所以已簽章的檔案
 *   不會因為呼叫端忘記傳 verifier 就被判死。
 */
async function resolveSignature(
  file: GgmodFile,
  options: UnpackOptions,
): Promise<SignatureOutcome> {
  if (file.signature === null) return { status: 'unsigned' };
  const verify = options.verifySignature;
  if (typeof verify !== 'function') return { status: 'unsigned' };
  try {
    const report: unknown = await verify(file);
    if (!isRecord(report)) {
      return { status: 'error', error: 'verifySignature returned an unexpected shape' };
    }
    // 先取成區域常數再窄化：索引簽章上的屬性窄化在跨敘述時不一定成立
    const statusValue = report.status;
    if (!isSignatureStatus(statusValue)) {
      return { status: 'error', error: 'verifySignature returned an unexpected shape' };
    }
    const outcome: SignatureOutcome = { status: statusValue };
    if (typeof report.fingerprint === 'string') outcome.fingerprint = report.fingerprint;
    if (typeof report.error === 'string') outcome.error = report.error;
    return outcome;
  } catch (error) {
    // 驗簽環境壞掉（沒有 WebCrypto、金鑰匯入失敗）不是封包的問題
    return { status: 'error', error: describeError(error) };
  }
}

function isSignatureStatus(value: unknown): value is SignatureStatus {
  return value === 'unsigned' || value === 'valid' || value === 'invalid' || value === 'error';
}

/* ------------------------------------------------------------------ 容量 */

/**
 * 重算容量。
 *
 * 刻意與 pack.ts 的 measureGgmodFile 一字不差（含排除 stats 與 signature 兩個欄位）：
 * 兩邊只要有一邊改了算法，round-trip 立刻紅在 SIZE_MISMATCH，等於自帶偵測。
 * 為什麼要排除 signature：簽章覆蓋含 stats 的內容，stats 若再量簽章就永遠對不上
 * （簽章前後 totalBytes 必須相同，否則已簽章的封包一律被判 SIZE_MISMATCH）。
 * 不 import pack.ts 是為了維持 unpack → format 的單向依賴（解包路徑不該拉進打包器）。
 */
function measureFile(file: GgmodFile): GgmodSizeStats {
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

function compareStats(declared: GgmodSizeStats, actual: GgmodSizeStats): GgmodIssue[] {
  const issues: GgmodIssue[] = [];
  const byteKeys = ['projectBytes', 'assetsBytes', 'thumbnailBytes', 'totalBytes'] as const;
  for (const key of byteKeys) {
    const delta = declared[key] - actual[key];
    if (Math.abs(delta) > STATS_TOLERANCE_BYTES) {
      issues.push({
        code: 'SIZE_MISMATCH',
        path: 'stats.' + key,
        message:
          'stats.' + key + ' declares ' + declared[key] + ' bytes but the package measures ' +
          actual[key] + ' bytes (diff ' + delta + ', tolerance +/-' + STATS_TOLERANCE_BYTES + ')',
      });
    }
  }
  // 筆數不是位元組，沒有容差可言：少一個資產就是少一個資產
  if (declared.assetCount !== actual.assetCount) {
    issues.push({
      code: 'SIZE_MISMATCH',
      path: 'stats.assetCount',
      message:
        'stats.assetCount declares ' + declared.assetCount + ' but the package contains ' +
        actual.assetCount + ' assets',
    });
  }
  return issues;
}

/* ------------------------------------------------------------------ 資產完整性 */

/**
 * 重複 / 缺資產 / 版本不符 / 循環依賴。
 * 這是「包內自洽」檢查，不要求外部資產：封包必須能離線載入，缺依賴就是壞包。
 */
function checkAssetIntegrity(assets: GgmodAssetSnapshot[]): GgmodIssue[] {
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
      // 空字串＝沒帶版本（只知道 id）；只驗存在性，不比版本（與 pack 端同一條規則）
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

/** DFS 三色標記（0 白 / 1 灰 / 2 黑）；灰節點被打中＝循環，沿堆疊回推鏈路 */
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

/* ------------------------------------------------------------------ 欄位讀取 */

function readProject(source: unknown, issues: GgmodIssue[]): GgmodProjectSnapshot {
  if (!isRecord(source)) {
    issues.push({ code: 'SCHEMA_INVALID', path: 'project', message: 'project must be an object' });
    return {
      id: '',
      name: '',
      description: '',
      version: '0.0.0',
      author: '',
      license: '',
      levelIds: [],
      data: null,
    };
  }
  return {
    id: readRequiredString(source, 'id', 'project.id', issues),
    name: readRequiredString(source, 'name', 'project.name', issues),
    description: readString(source, 'description', 'project.description', '', issues),
    version: readString(source, 'version', 'project.version', '0.0.0', issues),
    author: readString(source, 'author', 'project.author', '', issues),
    license: readString(source, 'license', 'project.license', '', issues),
    levelIds: readStringArray(source, 'levelIds', 'project.levelIds', issues),
    data: readRawData(source, 'data'),
  };
}

/**
 * 解包端的資產讀取。
 * 與 pack 端不同：這裡的 data 來自 JSON.parse，本來就是全新的純值物件，
 * 不再深拷貝一次（多一次遍歷只是浪費，而且不會改變任何語意）。
 */
function readAssets(source: unknown, issues: GgmodIssue[]): GgmodAssetSnapshot[] {
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
      data: readRawData(item, 'data'),
      dependsOn: readDependsOn(item.dependsOn, path + '.dependsOn', issues),
    });
  });
  return snapshots;
}

function readStats(source: unknown, issues: GgmodIssue[]): GgmodSizeStats | null {
  if (!isRecord(source)) {
    issues.push({
      code: 'SCHEMA_INVALID',
      path: 'stats',
      message: 'stats is required to verify package integrity (got ' + describeValue(source) + ')',
    });
    return null;
  }
  const before = issues.length;
  const stats: GgmodSizeStats = {
    projectBytes: readByteCount(source.projectBytes, 'stats.projectBytes', issues),
    assetsBytes: readByteCount(source.assetsBytes, 'stats.assetsBytes', issues),
    thumbnailBytes: readByteCount(source.thumbnailBytes, 'stats.thumbnailBytes', issues),
    totalBytes: readByteCount(source.totalBytes, 'stats.totalBytes', issues),
    assetCount: readByteCount(source.assetCount, 'stats.assetCount', issues),
  };
  return issues.length > before ? null : stats;
}

function readByteCount(value: unknown, path: string, issues: GgmodIssue[]): number {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 0) return value;
  issues.push({
    code: 'SCHEMA_INVALID',
    path,
    message: path + ' must be a non-negative integer (got ' + describeValue(value) + ')',
  });
  return 0;
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

function isBase64(value: string): boolean {
  if (value.length === 0) return false;
  return value.length % 4 === 0 && BASE64_PATTERN.test(value);
}

function readSignature(source: unknown, issues: GgmodIssue[]): ModSignature | null {
  if (source === undefined || source === null) return null;
  if (!isRecord(source)) {
    issues.push({
      code: 'SCHEMA_INVALID',
      path: 'signature',
      message: 'signature must be null or an object { alg, publicKeySpkiB64, valueB64 }',
    });
    return null;
  }
  const alg = source.alg;
  if (alg !== 'ECDSA-P256-SHA256') {
    issues.push({
      code: 'SCHEMA_INVALID',
      path: 'signature.alg',
      message: 'signature.alg must be "ECDSA-P256-SHA256" (got ' + describeValue(alg) + ')',
    });
    return null;
  }
  const publicKeySpkiB64 = source.publicKeySpkiB64;
  if (typeof publicKeySpkiB64 !== 'string' || publicKeySpkiB64.length === 0) {
    issues.push({
      code: 'SCHEMA_INVALID',
      path: 'signature.publicKeySpkiB64',
      message: 'signature.publicKeySpkiB64 must be a non-empty base64 string',
    });
    return null;
  }
  const valueB64 = source.valueB64;
  if (typeof valueB64 !== 'string' || valueB64.length === 0) {
    issues.push({
      code: 'SCHEMA_INVALID',
      path: 'signature.valueB64',
      message: 'signature.valueB64 must be a non-empty base64 string',
    });
    return null;
  }
  return { alg, publicKeySpkiB64, valueB64 };
}

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

function readRawData(source: Record<string, unknown>, key: string): unknown {
  const value = source[key];
  return value === undefined ? null : value;
}

/* ------------------------------------------------------------------ 訊息小工具 */

function failIssue(
  code: GgmodErrorCode,
  path: string,
  message: string,
): { ok: false; errors: GgmodIssue[] } {
  return { ok: false, errors: [{ code, path, message }] };
}

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
