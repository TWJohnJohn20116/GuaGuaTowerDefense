/**
 * Mod 簽章（完整性驗證）
 *
 * 目的：讓「這份 mod 有沒有被別人改過」可被驗證，作為腳本執行的第二道門檻。
 *
 * 誠實邊界：驗簽只證明「內容與某把私鑰簽的一致」。除非使用者把那把公鑰
 * 加入信任清單（fingerprint pinning），否則它只防篡改、不證明作者身分。
 */
import type { Mod } from '@/types/game';
import type { ModSignature } from '@/types/modScript';

export type ModSignatureStatus = 'unsigned' | 'valid' | 'invalid' | 'error';

export interface ModSignatureResult {
  status: ModSignatureStatus;
  /** 公鑰指紋（SHA-256 前 16 碼）；unsigned 時沒有 */
  fingerprint?: string;
  error?: string;
}

const SIGNATURE_KEY = 'signature';

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value !== null && typeof value === 'object') {
    const source = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(source).sort()) {
      if (key === SIGNATURE_KEY) continue;
      sorted[key] = sortValue(source[key]);
    }
    return sorted;
  }
  return value;
}

/**
 * 穩定序列化：物件鍵排序、略過 signature 欄位。
 * 簽章與驗簽都必須用同一份字串，否則永遠對不上。
 */
export function canonicalizeMod(mod: Mod): string {
  return JSON.stringify(sortValue(mod));
}

async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** 內容雜湊（顯示用，也用來當「這份 mod 有沒有變」的指標） */
export async function computeModHash(mod: Mod): Promise<string> {
  return sha256Hex(canonicalizeMod(mod));
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

/** 公鑰指紋：對 SPKI 位元組做 SHA-256，取前 16 碼 */
export async function keyFingerprint(publicKeySpkiB64: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', base64ToBytes(publicKeySpkiB64));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

/** 驗簽；任何環境問題（無 crypto.subtle、格式錯）都回 error 而不是丟例外 */
export async function verifyModSignature(mod: Mod): Promise<ModSignatureResult> {
  const signature: ModSignature | undefined = mod.signature;
  if (!signature) return { status: 'unsigned' };
  if (signature.alg !== 'ECDSA-P256-SHA256') {
    return { status: 'error', error: `不支援的簽章演算法：${signature.alg}` };
  }
  try {
    const subtle = globalThis.crypto?.subtle;
    if (!subtle) return { status: 'error', error: '此環境沒有 Web Crypto' };
    const key = await subtle.importKey(
      'spki',
      base64ToBytes(signature.publicKeySpkiB64),
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['verify'],
    );
    const valid = await subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      key,
      base64ToBytes(signature.valueB64),
      new TextEncoder().encode(canonicalizeMod(mod)),
    );
    const fingerprint = await keyFingerprint(signature.publicKeySpkiB64);
    return valid ? { status: 'valid', fingerprint } : { status: 'invalid', fingerprint };
  } catch (error) {
    return { status: 'error', fingerprint: undefined, error: error instanceof Error ? error.message : String(error) };
  }
}
