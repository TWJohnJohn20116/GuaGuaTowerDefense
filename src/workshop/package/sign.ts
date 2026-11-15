/**
 * .ggmod 簽章
 *
 * 目的：讓「這個封裝檔有沒有被別人改過」可被驗證。誠實邊界與 mod-script 相同——
 * 驗簽只證明「內容與某把私鑰簽的一致」；除非玩家把那把公鑰釘進信任清單，
 * 否則它只防篡改、不證明作者身分。
 *
 * 為什麼借用 mod-script/signing.ts：
 * 1) 簽章演算法、公鑰格式（SPKI base64）、指紋算法必須與既有 mod 完全一致，
 *    否則同一個金鑰在兩套流程裡指紋不同，信任清單會錯亂。
 * 2) canonical 序列化（鍵排序、略過 signature）是「簽章與驗簽必須同一份實作」
 *    的東西，自己再抄一份只會漂移。這裡刻意重用 canonicalizeMod／verifyModSignature，
 *    而不是重寫 crypto 或第二套 canonical 規則。
 */
import type { Mod } from '@/types/game';
import type { ModSignature } from '@/types/modScript';
import {
  bytesToBase64,
  canonicalizeMod,
  keyFingerprint,
  verifyModSignature,
} from '@/mod-script/signing';
import type { GgmodFile, GgmodResult } from './format';

/** 本機簽章金鑰只落在 localStorage；換機即失效（不假裝是雲端身分） */
const GGMOD_SIGNING_KEY_STORAGE = 'ggmod.signing.key.v1';
const TRUST_STORAGE_KEY = 'ggmod.trusted.fingerprints.v1';

export interface GgmodSigningKey {
  publicKeySpkiB64: string;
  /** PKCS#8 base64；只存在本機，不進封裝檔 */
  privateKeyPkcs8B64: string;
  fingerprint: string;
}

export interface GgmodSignatureReport {
  status: 'unsigned' | 'valid' | 'invalid' | 'error';
  fingerprint?: string;
  error?: string;
}

/* ------------------------------------------------------------------ 共用小工具 */

/** WebCrypto 的 BufferSource 不接受 SharedArrayBuffer 後備，一律複製成獨立 ArrayBuffer */
function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.length);
  copy.set(bytes);
  return copy.buffer;
}

function base64ToBytes(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), (ch) => ch.charCodeAt(0));
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function signatureFailure(message: string): GgmodResult<GgmodFile> {
  // 錯誤訊息保持英文技術描述：UI 文案一律走 locales，資料層不出現中文
  return { ok: false, errors: [{ code: 'SIGNATURE_INVALID', message }] };
}

/* ------------------------------------------------------------------ canonical */

/**
 * 封裝檔的 canonical 位元組。
 *
 * canonicalizeMod 的實作只做「物件鍵遞迴排序 + 略過 signature 鍵」，與 Mod 的欄位
 * 無關，所以可以安全地套在 GgmodFile 上；簽章與驗簽兩端因此共用同一份規則。
 * 這裡的型別轉換是刻意的最小手段：只為了借用函式，不改動任何資料。
 */
function canonicalGgmod(file: GgmodFile): string {
  return canonicalizeMod(file as unknown as Mod);
}

/* ------------------------------------------------------------------ 金鑰 */

/** 產生一把 P-256 金鑰；環境沒有 Web Crypto 時回錯誤而不是丟例外 */
export async function generateSigningKey(): Promise<GgmodResult<GgmodSigningKey>> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) return { ok: false, errors: [{ code: 'SIGNATURE_INVALID', message: 'Web Crypto is unavailable in this environment' }] };
  try {
    const pair = await subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
    const spki = await subtle.exportKey('spki', pair.publicKey);
    const pkcs8 = await subtle.exportKey('pkcs8', pair.privateKey);
    const publicKeySpkiB64 = bytesToBase64(new Uint8Array(spki));
    return {
      ok: true,
      value: {
        publicKeySpkiB64,
        privateKeyPkcs8B64: bytesToBase64(new Uint8Array(pkcs8)),
        fingerprint: await keyFingerprint(publicKeySpkiB64),
      },
    };
  } catch (error) {
    return { ok: false, errors: [{ code: 'SIGNATURE_INVALID', message: describeError(error) }] };
  }
}

function readStorage(key: string): string | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, value);
  } catch {
    // 私密模式／額度滿：金鑰留在模組快取，本次工作階段仍可簽章
  }
}

function parseStoredKey(raw: string): GgmodSigningKey | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null;
    const record = parsed as Record<string, unknown>;
    const pk = record.publicKeySpkiB64;
    const sk = record.privateKeyPkcs8B64;
    const fp = record.fingerprint;
    if (typeof pk !== 'string' || typeof sk !== 'string' || typeof fp !== 'string') return null;
    if (!pk || !sk || !fp) return null;
    return { publicKeySpkiB64: pk, privateKeyPkcs8B64: sk, fingerprint: fp };
  } catch {
    return null;
  }
}

/** 模組級快取：只快取金鑰，不承載世界狀態（重複 parse localStorage 沒有意義） */
let cachedSigningKey: GgmodSigningKey | null = null;

/** 取本機簽章金鑰；沒有就產生一把並落地。回 null 代表環境不支援 Web Crypto */
export async function loadSigningKey(): Promise<GgmodSigningKey | null> {
  if (cachedSigningKey) return cachedSigningKey;
  const stored = readStorage(GGMOD_SIGNING_KEY_STORAGE);
  if (stored) {
    const parsed = parseStoredKey(stored);
    if (parsed) {
      cachedSigningKey = parsed;
      return parsed;
    }
  }
  const created = await generateSigningKey();
  if (!created.ok) return null;
  cachedSigningKey = created.value;
  writeStorage(GGMOD_SIGNING_KEY_STORAGE, JSON.stringify(created.value));
  return created.value;
}

/** 換一把新金鑰（舊簽章會變成「指紋不同」，這是刻意的） */
export async function rotateSigningKey(): Promise<GgmodSigningKey | null> {
  cachedSigningKey = null;
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(GGMOD_SIGNING_KEY_STORAGE);
  } catch {
    // 同上：清不掉就算了，快取已重置
  }
  return loadSigningKey();
}

/* ------------------------------------------------------------------ 簽章／驗簽 */

/** 對整份封裝檔簽章（含 assets 與 stats，但不含 signature 本身） */
export async function signGgmod(file: GgmodFile, key: GgmodSigningKey): Promise<GgmodResult<GgmodFile>> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) return signatureFailure('Web Crypto is unavailable in this environment');
  try {
    const privateKey = await subtle.importKey(
      'pkcs8',
      toArrayBuffer(base64ToBytes(key.privateKeyPkcs8B64)),
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign'],
    );
    const canonical = new TextEncoder().encode(canonicalGgmod(file));
    const signed = await subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privateKey, toArrayBuffer(canonical));
    const signature: ModSignature = {
      alg: 'ECDSA-P256-SHA256',
      publicKeySpkiB64: key.publicKeySpkiB64,
      valueB64: bytesToBase64(new Uint8Array(signed)),
    };
    // stats 不計 signature（見 pack.measureGgmodFile），所以簽章不會讓容量統計過期
    return { ok: true, value: { ...file, signature } };
  } catch (error) {
    return signatureFailure(describeError(error));
  }
}

/**
 * 驗簽。未簽章與「有簽章但驗不過」必須可區分——前者是玩家的選擇，後者是警訊。
 * 驗證本身完全交給 mod-script 的 verifyModSignature（同一份 canonical 規則）。
 */
export async function verifyGgmodSignature(file: GgmodFile): Promise<GgmodSignatureReport> {
  if (!file.signature) return { status: 'unsigned' };
  const result = await verifyModSignature(file as unknown as Mod);
  return { status: result.status, fingerprint: result.fingerprint, error: result.error };
}

/**
 * 已存簽章的公鑰指紋（UI 顯示／信任比對用）。
 * 專案存的是「上次匯出時的簽章」，這裡只算指紋，不假裝它等同於對目前內容的驗簽結果。
 */
export async function signatureFingerprint(signature: ModSignature | null): Promise<string | null> {
  if (!signature) return null;
  return keyFingerprint(signature.publicKeySpkiB64);
}

/* ------------------------------------------------------------------ 信任清單 */

function readTrusted(): string[] {
  const raw = readStorage(TRUST_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
}

export function isFingerprintTrusted(fingerprint: string): boolean {
  if (!fingerprint) return false;
  return readTrusted().includes(fingerprint);
}

export function setFingerprintTrusted(fingerprint: string, trusted: boolean): void {
  if (!fingerprint) return;
  const current = readTrusted().filter((item) => item !== fingerprint);
  if (trusted) current.push(fingerprint);
  writeStorage(TRUST_STORAGE_KEY, JSON.stringify(current));
}
