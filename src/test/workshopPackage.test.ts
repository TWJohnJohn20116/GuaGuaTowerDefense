/**
 * .ggmod 封裝格式行為測試（pack / unpack / sign 三支模組的對外契約）。
 *
 * 原則：
 * - 只呼叫函式並斷言回傳值、錯誤碼與副作用；不讀原始碼、不用 fs、不做 snapshot。
 * - 測試資料全部在檔內用 makeProject / makeAsset / makeRequest 就地產生，不新增 fixture 檔。
 * - 沒有 Web Crypto 的環境（jsdom 多半沒有 subtle）只略過「真簽章」那一個案例，其餘照跑。
 */
import { describe, it, expect } from 'vitest';
import {
  packProject,
  measureGgmodFile,
  serializeGgmod,
  type PackAssetSource,
  type PackProjectSource,
  type PackRequest,
} from '@/workshop/package/pack';
import {
  unpackGgmod,
  isGgmodCompatible,
  type UnpackOptions,
  type UnpackResult,
} from '@/workshop/package/unpack';
import { generateSigningKey, signGgmod, verifyGgmodSignature } from '@/workshop/package/sign';
import {
  GGMOD_FORMAT_VERSION,
  GGMOD_MAGIC,
  GGMOD_MIN_SUPPORTED,
  utf8ByteLength,
  type GgmodFile,
  type GgmodIssue,
  type GgmodResult,
  type GgmodSizeStats,
} from '@/workshop/package/format';
import type { ModSignature } from '@/types/modScript';

/* ------------------------------------------------------------------ 測試資料工廠 */

/** 固定時間：pack 的 createdAt 寫入值，讓 round-trip 可以斷言相等 */
const FIXED_NOW = '2026-01-02T03:04:05.000Z';

/** 合法的最小 base64（4 的倍數、只用標準字母表） */
const VALID_BASE64 = 'AAAA';

function makeAsset(assetId: string, overrides: Partial<PackAssetSource> = {}): PackAssetSource {
  return {
    assetId,
    kind: 'tower',
    name: 'asset-' + assetId,
    version: '1.0.0',
    data: { baseType: 'arrow', damage: 10 },
    ...overrides,
  };
}

function makeProject(overrides: Partial<PackProjectSource> = {}): PackProjectSource {
  return {
    id: 'proj-1',
    name: 'Project One',
    description: 'demo package',
    version: '1.0.0',
    author: 'tester',
    license: 'cc-by-4.0',
    levelIds: ['lvl-1', 'lvl-2'],
    data: { title: 'meta', nested: { depth: 2 } },
    thumbnail: { mediaType: 'image/png', base64: VALID_BASE64 },
    ...overrides,
  };
}

function makeRequest(overrides: Partial<PackRequest> = {}): PackRequest {
  return {
    project: makeProject(),
    assets: [makeAsset('a1'), makeAsset('a2', { kind: 'enemy' })],
    generator: 'guagua-test',
    now: FIXED_NOW,
    ...overrides,
  };
}

/* ------------------------------------------------------------------ 斷言小工具 */

/** 取失敗結果的 issues；成功時回空陣列（配合 expect(result.ok).toBe(false) 使用） */
function issuesOf<T>(result: GgmodResult<T>): GgmodIssue[] {
  return result.ok ? [] : result.errors;
}

/** 打包並要求成功；失敗就直接把 issues 丟出來（比等到 toBe(true) 紅掉訊息清楚） */
function packOk(request: PackRequest): GgmodFile {
  const result = packProject(request);
  if (!result.ok) throw new Error('packProject failed: ' + JSON.stringify(result.errors));
  return result.value;
}

/** 解包並要求成功 */
async function unpackOk(raw: string, options?: UnpackOptions): Promise<UnpackResult> {
  const result = await unpackGgmod(raw, options);
  if (!result.ok) throw new Error('unpackGgmod failed: ' + JSON.stringify(result.errors));
  return result.value;
}

/**
 * 模擬「使用者手改 JSON 檔」：轉成可任意改寫的物件再序列化回去。
 * 用 JSON.parse 是因為 GgmodFile 是介面，逐鍵複製會逼出大量斷言；這裡要的就是「陌生 JSON」。
 */
function tamper(file: GgmodFile): Record<string, unknown> {
  const parsed: Record<string, unknown> = JSON.parse(serializeGgmod(file));
  return parsed;
}

/** 只改宣告的 stats（內容不動），用來驗容量容差 */
function serializeWithStats(file: GgmodFile, patch: Partial<GgmodSizeStats>): string {
  return JSON.stringify({ ...file, stats: { ...file.stats, ...patch } });
}

/**
 * 補上（或換掉）簽章區塊。
 * totalBytes 不計 stats 也不計 signature（見 measureGgmodFile），所以補簽不會讓容量
 * 統計過期，這裡不必重算——只換簽章欄位再序列化。
 */
function serializeSigned(file: GgmodFile, signature: ModSignature | null): string {
  return JSON.stringify({ ...file, signature });
}

const FAKE_SIGNATURE: ModSignature = {
  alg: 'ECDSA-P256-SHA256',
  publicKeySpkiB64: VALID_BASE64,
  valueB64: VALID_BASE64,
};

/** 需要注入驗簽的測試共用形狀（避免各處重抄一次函式型別） */
type VerifyFn = NonNullable<UnpackOptions['verifySignature']>;

const verifyValid: VerifyFn = async () => ({ status: 'valid', fingerprint: 'fp' });
const verifyError: VerifyFn = async () => ({ status: 'error', error: 'boom' });
const verifyThrows: VerifyFn = async () => {
  throw new Error('boom');
};

/** requireSignature 的選項物件獨立宣告：型別是模組對外契約，測試端要真的標成型別 */
const requireSigned: UnpackOptions = { requireSignature: true };

const STAT_KEYS = ['projectBytes', 'assetsBytes', 'thumbnailBytes', 'totalBytes', 'assetCount'] as const;

/* ------------------------------------------------------------------ A. round-trip */

describe('A. pack → serializeGgmod → unpackGgmod round-trip', () => {
  it('stats 五項與 pack 端一致，project 欄位（含 license / levelIds）與 assets 內容等值', async () => {
    const request = makeRequest({
      assets: [
        makeAsset('a1'),
        makeAsset('a2', {
          kind: 'enemy',
          dependsOn: [{ assetId: 'a1', version: '1.0.0' }],
        }),
      ],
    });
    const packed = packOk(request);
    const unpacked = await unpackOk(serializeGgmod(packed));

    expect(unpacked.file.magic).toBe(GGMOD_MAGIC);
    expect(unpacked.file.formatVersion).toBe(GGMOD_FORMAT_VERSION);
    expect(unpacked.file.generator).toBe('guagua-test');
    expect(unpacked.file.createdAt).toBe(FIXED_NOW);
    expect(unpacked.file.signature).toBeNull();
    expect(unpacked.signatureStatus).toBe('unsigned');

    // 五項逐一比對：整包 toEqual 之外再單項確認，避免某一項漂移被其他項掩蓋
    for (const key of STAT_KEYS) {
      expect(unpacked.file.stats[key]).toBe(packed.stats[key]);
    }
    expect(unpacked.file.stats).toEqual(packed.stats);
    // unpack 回填的是「實算值」，所以必然等於對它自己重新量測的結果
    expect(unpacked.file.stats).toEqual(measureGgmodFile(unpacked.file));

    expect(unpacked.file.project).toEqual(packed.project);
    expect(unpacked.file.project.license).toBe('cc-by-4.0');
    expect(unpacked.file.project.levelIds).toEqual(['lvl-1', 'lvl-2']);
    expect(unpacked.file.project.data).toEqual({ title: 'meta', nested: { depth: 2 } });

    expect(unpacked.file.assets).toEqual(packed.assets);
    expect(unpacked.file.assets).toHaveLength(2);
    expect(unpacked.file.assets[1].dependsOn).toEqual([{ assetId: 'a1', version: '1.0.0' }]);
    expect(unpacked.file.thumbnail).toEqual({ mediaType: 'image/png', base64: VALID_BASE64 });
  });
});

/* ------------------------------------------------------------------ B. 深拷貝 */

describe('B. 打包後不與來源共享參考', () => {
  it('改動來源 project.data / asset.data（含第二層）不影響已打包內容，且參考不同', () => {
    const projectData = { title: 'meta', nested: { depth: 2 } };
    const assetData = { baseType: 'arrow', nested: { damage: 10 } };
    const request = makeRequest({
      project: makeProject({ data: projectData }),
      assets: [makeAsset('a1', { data: assetData })],
    });
    const packed = packOk(request);

    expect(packed.project.data).not.toBe(projectData);
    expect(packed.assets[0].data).not.toBe(assetData);

    // 第一層與第二層一起改：只要有任何一層被共享，下面的 toEqual 就會紅
    projectData.title = 'changed';
    projectData.nested.depth = 99;
    assetData.baseType = 'cannon';
    assetData.nested.damage = 999;

    expect(packed.project.data).toEqual({ title: 'meta', nested: { depth: 2 } });
    expect(packed.assets[0].data).toEqual({ baseType: 'arrow', nested: { damage: 10 } });

    // 序列化出來的檔案內容也必須是打包當下的快照
    const roundTrip = JSON.parse(serializeGgmod(packed));
    expect(roundTrip.project.data).toEqual({ title: 'meta', nested: { depth: 2 } });
    expect(roundTrip.assets[0].data).toEqual({ baseType: 'arrow', nested: { damage: 10 } });
  });
});

/* ------------------------------------------------------------------ C. 缺資產 */

describe('C. dependsOn 指向不存在的資產', () => {
  it("回 ok:false、ASSET_MISSING，path 是被依賴的 id（'ghost'）", () => {
    const result = packProject(
      makeRequest({
        assets: [
          makeAsset('a1'),
          makeAsset('a2', { dependsOn: [{ assetId: 'ghost', version: '1.0.0' }] }),
        ],
      }),
    );

    expect(result.ok).toBe(false);
    const missing = issuesOf(result).find((issue) => issue.code === 'ASSET_MISSING');
    expect(missing).toBeDefined();
    expect(missing?.path).toBe('ghost');
    expect(missing?.message).toContain('ghost');
  });
});

/* ------------------------------------------------------------------ D. 版本比對 */

describe('D. 資產版本比對', () => {
  it("ref.version 非空且與包內版本不同 → ASSET_VERSION_MISMATCH，path 為 assetId（'a1'）", () => {
    const result = packProject(
      makeRequest({
        assets: [
          makeAsset('a1', { version: '1.0.0' }),
          makeAsset('a2', { dependsOn: [{ assetId: 'a1', version: '2.0.0' }] }),
        ],
      }),
    );

    expect(result.ok).toBe(false);
    const mismatch = issuesOf(result).find((issue) => issue.code === 'ASSET_VERSION_MISMATCH');
    expect(mismatch).toBeDefined();
    expect(mismatch?.path).toBe('a1');
    expect(mismatch?.message).toContain('2.0.0');
    expect(issuesOf(result).map((issue) => issue.code)).toEqual(['ASSET_VERSION_MISMATCH']);
  });

  it('ref.version 為空字串且資產存在 → 必須成功，且空版本原樣保留（pack 與 unpack 都放行）', async () => {
    const result = packProject(
      makeRequest({
        assets: [
          makeAsset('a1'),
          makeAsset('a2', { dependsOn: [{ assetId: 'a1', version: '' }] }),
        ],
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.assets[1].dependsOn).toEqual([{ assetId: 'a1', version: '' }]);

    const unpacked = await unpackOk(serializeGgmod(result.value));
    expect(unpacked.file.assets[1].dependsOn).toEqual([{ assetId: 'a1', version: '' }]);
  });
});

/* ------------------------------------------------------------------ E. 重複資產 */

describe('E. 重複資產', () => {
  it("同 assetId 兩筆 → ASSET_DUPLICATE，path 為該 id（'dup'）", () => {
    const result = packProject(
      makeRequest({ assets: [makeAsset('dup'), makeAsset('dup', { name: 'second' })] }),
    );

    expect(result.ok).toBe(false);
    const duplicate = issuesOf(result).find((issue) => issue.code === 'ASSET_DUPLICATE');
    expect(duplicate).toBeDefined();
    expect(duplicate?.path).toBe('dup');
  });
});

/* ------------------------------------------------------------------ F. 循環依賴 */

describe('F. 資產循環依賴', () => {
  it("A→B→C→A → DEPENDENCY_CYCLE，path 含 '->' 與三個 id，且不丟例外", () => {
    const request = makeRequest({
      assets: [
        makeAsset('a', { dependsOn: [{ assetId: 'b', version: '1.0.0' }] }),
        makeAsset('b', { dependsOn: [{ assetId: 'c', version: '1.0.0' }] }),
        makeAsset('c', { dependsOn: [{ assetId: 'a', version: '1.0.0' }] }),
      ],
    });

    expect(() => packProject(request)).not.toThrow();

    const result = packProject(request);
    expect(result.ok).toBe(false);
    const cycle = issuesOf(result).find((issue) => issue.code === 'DEPENDENCY_CYCLE');
    expect(cycle).toBeDefined();

    const chain = cycle?.path ?? '';
    expect(chain).toContain('->');
    expect(chain).toContain('a');
    expect(chain).toContain('b');
    expect(chain).toContain('c');
    expect(chain.split('->')).toHaveLength(4);
  });
});

/* ------------------------------------------------------------------ G. 循環參考 */

describe('G. data 內含循環參考', () => {
  it('物件自指 → DEPENDENCY_CYCLE（path 指到該 data 欄位），且不丟例外', () => {
    const circular: Record<string, unknown> = { label: 'loop' };
    circular.self = circular;

    const request = makeRequest({ project: makeProject({ data: circular }) });

    expect(() => packProject(request)).not.toThrow();

    const result = packProject(request);
    expect(result.ok).toBe(false);
    expect(issuesOf(result).map((issue) => issue.code)).toContain('DEPENDENCY_CYCLE');
    expect(issuesOf(result)[0].path).toBe('project.data');
  });
});

/* ------------------------------------------------------------------ H. 欄位型別 */

describe('H. 版本與欄位型別', () => {
  it("asset.version = 'v1'（非 semver）→ SCHEMA_INVALID，path assets[0].version", () => {
    const result = packProject(makeRequest({ assets: [makeAsset('a1', { version: 'v1' })] }));

    expect(result.ok).toBe(false);
    expect(issuesOf(result).map((issue) => issue.code)).toEqual(['SCHEMA_INVALID']);
    expect(issuesOf(result)[0].path).toBe('assets[0].version');
  });

  it('asset.version = 1（數字，只有從外部 JSON 匯入才會出現）→ SCHEMA_INVALID，path assets[0].version', () => {
    // 型別層擋掉了 number，所以刻意從 JSON 走進來：模擬匯入他人封包／壞資料的實際路徑
    const request: PackRequest = JSON.parse(
      JSON.stringify({
        project: makeProject(),
        assets: [
          { assetId: 'a1', kind: 'tower', name: 'asset-a1', version: 1, data: { baseType: 'arrow' } },
        ],
        now: FIXED_NOW,
      }),
    );

    const result = packProject(request);
    expect(result.ok).toBe(false);
    expect(issuesOf(result).map((issue) => issue.code)).toEqual(['SCHEMA_INVALID']);
    expect(issuesOf(result)[0].path).toBe('assets[0].version');
  });

  it("project.id 空字串 → SCHEMA_INVALID，path 'project.id'", () => {
    const result = packProject(makeRequest({ project: makeProject({ id: '' }) }));

    expect(result.ok).toBe(false);
    const invalid = issuesOf(result).find((issue) => issue.path === 'project.id');
    expect(invalid).toBeDefined();
    expect(invalid?.code).toBe('SCHEMA_INVALID');
  });
});

/* ------------------------------------------------------------------ I. 縮圖 */

describe('I. 縮圖 base64', () => {
  it("長度 3（非 4 的倍數）→ THUMBNAIL_INVALID，path 'project.thumbnail.base64'", () => {
    const result = packProject(
      makeRequest({ project: makeProject({ thumbnail: { mediaType: 'image/png', base64: 'AAA' } }) }),
    );

    expect(result.ok).toBe(false);
    const invalid = issuesOf(result).find((issue) => issue.code === 'THUMBNAIL_INVALID');
    expect(invalid).toBeDefined();
    expect(invalid?.path).toBe('project.thumbnail.base64');
  });

  it("含 '-'（非標準字母表）→ THUMBNAIL_INVALID，path 同上", () => {
    const result = packProject(
      makeRequest({ project: makeProject({ thumbnail: { mediaType: 'image/png', base64: 'AA-A' } }) }),
    );

    expect(result.ok).toBe(false);
    const invalid = issuesOf(result).find((issue) => issue.code === 'THUMBNAIL_INVALID');
    expect(invalid).toBeDefined();
    expect(invalid?.path).toBe('project.thumbnail.base64');
  });

  it('合法 base64（AAAA）→ 成功，且 unpack 後 thumbnail 等值', async () => {
    const packed = packOk(makeRequest());
    const unpacked = await unpackOk(serializeGgmod(packed));

    expect(unpacked.file.thumbnail).toEqual({ mediaType: 'image/png', base64: VALID_BASE64 });
    expect(unpacked.file.stats.thumbnailBytes).toBe(measureGgmodFile(unpacked.file).thumbnailBytes);
    expect(unpacked.file.stats.thumbnailBytes).toBeGreaterThan(0);
  });
});

/* ------------------------------------------------------------------ J. unpack 錯誤路徑 */

describe('J. unpackGgmod 的錯誤路徑', () => {
  it("非 JSON（含空字串）→ NOT_JSON", async () => {
    const broken = await unpackGgmod('{ this is not json');
    expect(broken.ok).toBe(false);
    expect(issuesOf(broken).map((issue) => issue.code)).toEqual(['NOT_JSON']);

    const empty = await unpackGgmod('');
    expect(empty.ok).toBe(false);
    expect(issuesOf(empty).map((issue) => issue.code)).toEqual(['NOT_JSON']);
  });

  it("magic 錯 → MAGIC_MISMATCH，message 含實際拿到的值（'not-a-ggmod'）", async () => {
    const parcel = tamper(packOk(makeRequest()));
    parcel.magic = 'not-a-ggmod';

    const result = await unpackGgmod(JSON.stringify(parcel));
    expect(result.ok).toBe(false);
    expect(issuesOf(result).map((issue) => issue.code)).toEqual(['MAGIC_MISMATCH']);
    expect(issuesOf(result)[0].path).toBe('magic');
    expect(issuesOf(result)[0].message).toContain('not-a-ggmod');
  });

  it("formatVersion 9（高於本版）→ VERSION_UNSUPPORTED，message 含 '9' 與支援範圍", async () => {
    const parcel = tamper(packOk(makeRequest()));
    parcel.formatVersion = 9;

    const result = await unpackGgmod(JSON.stringify(parcel));
    expect(result.ok).toBe(false);
    expect(issuesOf(result).map((issue) => issue.code)).toEqual(['VERSION_UNSUPPORTED']);
    expect(issuesOf(result)[0].message).toContain('9');
    expect(issuesOf(result)[0].message).toContain(
      GGMOD_MIN_SUPPORTED + '..' + GGMOD_FORMAT_VERSION,
    );
  });

  it("缺 stats → SCHEMA_INVALID，path 'stats'", async () => {
    const parcel = tamper(packOk(makeRequest()));
    delete parcel.stats;

    const result = await unpackGgmod(JSON.stringify(parcel));
    expect(result.ok).toBe(false);
    const invalid = issuesOf(result).find((issue) => issue.path === 'stats');
    expect(invalid).toBeDefined();
    expect(invalid?.code).toBe('SCHEMA_INVALID');
  });

  it("stats.totalBytes 宣告值差 5 bytes → SIZE_MISMATCH，path 'stats.totalBytes'", async () => {
    const packed = packOk(makeRequest());
    const raw = serializeWithStats(packed, { totalBytes: packed.stats.totalBytes + 5 });

    const result = await unpackGgmod(raw);
    expect(result.ok).toBe(false);
    const mismatch = issuesOf(result).find((issue) => issue.code === 'SIZE_MISMATCH');
    expect(mismatch).toBeDefined();
    expect(mismatch?.path).toBe('stats.totalBytes');
    expect(mismatch?.message).toContain(String(packed.stats.totalBytes));
  });

  it('stats.totalBytes 差 2 bytes（容差內）→ 成功，且 stats 以實算值回填', async () => {
    const packed = packOk(makeRequest());
    const raw = serializeWithStats(packed, { totalBytes: packed.stats.totalBytes + 2 });

    const result = await unpackGgmod(raw);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // 宣告值只拿來比對，不會留下來當真相：回填值等於原本（實算）值
    expect(result.value.file.stats.totalBytes).toBe(packed.stats.totalBytes);
    expect(result.value.file.stats).toEqual(measureGgmodFile(result.value.file));
  });
});

/* ------------------------------------------------------------------ K. 簽章狀態 */

describe('K. 簽章狀態（注入 verifier）', () => {
  it("signature 為 null → signatureStatus 'unsigned'（不給 verifySignature 也一樣）", async () => {
    const packed = packOk(makeRequest());
    let calls = 0;
    const verifySpy: VerifyFn = async () => {
      calls += 1;
      return { status: 'valid', fingerprint: 'fp' };
    };

    const withoutVerifier = await unpackGgmod(serializeGgmod(packed));
    expect(withoutVerifier.ok).toBe(true);
    if (!withoutVerifier.ok) return;
    expect(withoutVerifier.value.signatureStatus).toBe('unsigned');
    expect(withoutVerifier.value.fingerprint).toBeUndefined();

    // 未簽章就是未簽章：即使注入了 verifier 也不該被呼叫（不是「驗失敗」）
    const withVerifier = await unpackGgmod(serializeGgmod(packed), { verifySignature: verifySpy });
    expect(withVerifier.ok).toBe(true);
    if (!withVerifier.ok) return;
    expect(withVerifier.value.signatureStatus).toBe('unsigned');
    expect(calls).toBe(0);
  });

  it("verifier 回 valid → signatureStatus 'valid' 且 fingerprint 透傳", async () => {
    const raw = serializeSigned(packOk(makeRequest()), FAKE_SIGNATURE);
    const result = await unpackGgmod(raw, { verifySignature: verifyValid });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.signatureStatus).toBe('valid');
    expect(result.value.fingerprint).toBe('fp');
    expect(result.value.file.signature).toEqual(FAKE_SIGNATURE);
  });

  it("verifier 回 error → signatureStatus 'error'、signatureError 'boom'，但整體仍 ok:true", async () => {
    const raw = serializeSigned(packOk(makeRequest()), FAKE_SIGNATURE);
    const result = await unpackGgmod(raw, { verifySignature: verifyError });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.signatureStatus).toBe('error');
    expect(result.value.signatureError).toBe('boom');
  });

  it('verifier 拋錯 → signatureStatus error、ok:true，且 unpack 自己不丟例外', async () => {
    const raw = serializeSigned(packOk(makeRequest()), FAKE_SIGNATURE);

    await expect(unpackGgmod(raw, { verifySignature: verifyThrows })).resolves.toMatchObject({
      ok: true,
    });

    const result = await unpackGgmod(raw, { verifySignature: verifyThrows });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.signatureStatus).toBe('error');
    expect(result.value.signatureError).toContain('boom');
  });

  it("requireSignature:true 且未簽章 → ok:false，errors[0].code 為 'SIGNATURE_REQUIRED'", async () => {
    const packed = packOk(makeRequest());
    const result = await unpackGgmod(serializeGgmod(packed), requireSigned);

    expect(result.ok).toBe(false);
    expect(issuesOf(result)[0].code).toBe('SIGNATURE_REQUIRED');
    expect(issuesOf(result)[0].path).toBe('signature');
  });

  it('requireSignature:true 且已簽章（未注入 verifier）→ ok:true', async () => {
    const raw = serializeSigned(packOk(makeRequest()), FAKE_SIGNATURE);
    const result = await unpackGgmod(raw, requireSigned);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // 模組文件明訂：有簽章但呼叫端沒注入 verifier 只能回 'unsigned'，不算結構錯誤
    expect(result.value.signatureStatus).toBe('unsigned');
    expect(result.value.file.signature).toEqual(FAKE_SIGNATURE);
  });
});

/* ------------------------------------------------------------------ L. 版本相容 */

describe('L. isGgmodCompatible', () => {
  it('本版相容；低於最小支援或高於本版都不相容', () => {
    expect(isGgmodCompatible(GGMOD_FORMAT_VERSION)).toBe(true);
    expect(isGgmodCompatible(GGMOD_MIN_SUPPORTED)).toBe(true);
    expect(isGgmodCompatible(GGMOD_MIN_SUPPORTED - 1)).toBe(false);
    expect(isGgmodCompatible(GGMOD_FORMAT_VERSION + 1)).toBe(false);
    // 目前常數是 1，所以上面等於 1 → true、0 → false、2 → false
    expect(GGMOD_FORMAT_VERSION).toBe(1);
    expect(isGgmodCompatible(1.5)).toBe(false);
  });
});

/* ------------------------------------------------------------------ M. 量測工具 */

describe('M. utf8ByteLength 與 measureGgmodFile', () => {
  it("utf8ByteLength('塔') 為 3 bytes，ASCII 為 1 byte", () => {
    expect(utf8ByteLength('塔')).toBe(3);
    expect(utf8ByteLength('abc')).toBe(3);
    expect(utf8ByteLength('')).toBe(0);
  });

  it('measureGgmodFile：assetCount 等於 assets 長度，縮圖為 null 時 thumbnailBytes 為 0', () => {
    const file = packOk(
      makeRequest({
        project: makeProject({ thumbnail: null }),
        assets: [makeAsset('a1'), makeAsset('a2'), makeAsset('a3')],
      }),
    );

    expect(file.thumbnail).toBeNull();
    const stats = measureGgmodFile(file);
    expect(stats.assetCount).toBe(3);
    expect(stats.assetCount).toBe(file.assets.length);
    expect(stats.thumbnailBytes).toBe(0);
    expect(stats.totalBytes).toBeGreaterThan(0);
    expect(stats.totalBytes).toBeGreaterThanOrEqual(stats.projectBytes + stats.assetsBytes);
    // 量測是純函式：同一份檔案量兩次結果相同
    expect(measureGgmodFile(file)).toEqual(stats);
  });
});

/* ------------------------------------------------------------------ 簽章（真 WebCrypto） */

describe('簽章 round-trip（真 WebCrypto）', () => {
  it('generateSigningKey → signGgmod → verifyGgmodSignature 為 valid 且 fingerprint 一致；改欄位後 invalid', async () => {
    // jsdom／部分 CI runner 沒有 WebCrypto：略過而不是假紅（模組本身會回 SIGNATURE_INVALID）
    if (!globalThis.crypto?.subtle) return;

    const keyResult = await generateSigningKey();
    // 有 crypto 但不支援 P-256 的環境同樣略過：這是環境限制，不是封包問題
    if (!keyResult.ok) return;

    const file = packOk(makeRequest());

    // 未簽章 ≠ 簽章無效：空簽章回 'unsigned'，不是 'invalid'
    const unsignedReport = await verifyGgmodSignature(file);
    expect(unsignedReport.status).toBe('unsigned');

    const signedResult = await signGgmod(file, keyResult.value);
    expect(signedResult.ok).toBe(true);
    if (!signedResult.ok) return;
    const signed = signedResult.value;
    expect(signed.signature).not.toBeNull();

    const report = await verifyGgmodSignature(signed);
    expect(report.status).toBe('valid');
    expect(report.fingerprint).toBe(keyResult.value.fingerprint);

    // 動一個欄位（project.name）就必須驗不過
    const tampered: GgmodFile = {
      ...signed,
      project: { ...signed.project, name: signed.project.name + ' tampered' },
    };
    const tamperedReport = await verifyGgmodSignature(tampered);
    expect(tamperedReport.status).toBe('invalid');
    expect(tamperedReport.fingerprint).toBe(keyResult.value.fingerprint);
  });

  it('已簽章封包能通過 unpack 的容量一致性檢查（stats 不計 signature 的回歸）', async () => {
    if (!globalThis.crypto?.subtle) return;
    const keyResult = await generateSigningKey();
    if (!keyResult.ok) return;

    const file = packOk(makeRequest());
    const signedResult = await signGgmod(file, keyResult.value);
    expect(signedResult.ok).toBe(true);
    if (!signedResult.ok) return;

    // 簽章前後 stats 必須完全相同；只要多算了簽章區塊，unpack 就會對每份已簽章封包報 SIZE_MISMATCH
    expect(signedResult.value.stats).toEqual(file.stats);

    const unpacked = await unpackGgmod(serializeGgmod(signedResult.value), { verifySignature: verifyGgmodSignature });
    expect(unpacked.ok).toBe(true);
    if (!unpacked.ok) return;
    expect(unpacked.value.signatureStatus).toBe('valid');
    expect(unpacked.value.fingerprint).toBe(keyResult.value.fingerprint);
  });
});
