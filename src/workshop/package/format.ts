/**
 * .ggmod 容器格式（型別 + 常數 + 兩個純工具）
 *
 * 為什麼格式定義要獨立一支：pack / unpack / sign 與測試都需要同一組形狀與常數，
 * 但只要其中一邊 import 另一邊，就會變成「打包器依賴解包器」這種沒必要的耦合。
 * 所以本檔只借用 workshop / modScript 的型別（import type，執行期不存在），
 * 不碰 React、store、檔案 I/O。
 *
 * 版本語意（與 src/types/workshop.ts 對齊）：資產版本是語意化字串（'1.0.0'）不是數字，
 * 因為工坊端 AssetRef.version 已經是字串，兩邊不一致會在比較時永遠不相等。
 */

import type { WorkshopAssetKind } from '@/types/workshop';

/** 寫在 JSON 第一欄的簽名；只讀開頭幾個 bytes 就能判斷這是不是 .ggmod */
export const GGMOD_MAGIC = 'ggmod';

/** 這支程式寫出的格式版本。升版只加不改，舊欄位語意不動，舊讀者才不會讀到一半改變解釋 */
export const GGMOD_FORMAT_VERSION = 1;

/** 這支程式還願意讀的最舊版本（低於它就代表欄位語意已經對不上） */
export const GGMOD_MIN_SUPPORTED = 1;

/** 下載用的副檔名，含前導點，呼叫端直接接在檔名後面 */
export const GGMOD_EXTENSION = '.ggmod';

/**
 * 資產種類。
 * 為什麼是別名而不是另定一套聯集：kind 的真相在 src/types/workshop.ts，
 * 這裡再抄一份就會出現「兩邊少一個成員卻沒人發現」的漂移。
 */
export type GgmodAssetKind = WorkshopAssetKind;

/** 資產引用：只記 id 與版本，不夾帶內容，避免同一份資料在檔案裡出現兩次 */
export interface GgmodAssetRef {
  assetId: string;
  /** 語意化版本字串（'1.0.0'）；空字串＝呼叫端沒解析到版本，只做存在性檢查 */
  version: string;
}

/** 封包內的一筆資產快照（data 是深拷貝後的 JSON 內容，與來源物件不共享參考） */
export interface GgmodAssetSnapshot {
  assetId: string;
  kind: GgmodAssetKind;
  name: string;
  version: string;
  data: unknown;
  dependsOn: GgmodAssetRef[];
}

/** 專案本體（不含資產）：識別資訊 + 授權 + 關卡清單 + 專案自訂資料 */
export interface GgmodProjectSnapshot {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  /**
   * 授權條款。工坊端是封閉聯集（WorkshopLicense），這裡刻意開成 string：
   * 封包可能來自更新或更舊的版本，格式層不該因為多了一個授權值就整包讀不進來。
   */
  license: string;
  levelIds: string[];
  data: unknown;
}

/** 縮圖：base64 直接嵌在 JSON 裡，容器才能維持「一行 JSON、單一檔案」的性質 */
export interface GgmodThumbnail {
  mediaType: string;
  base64: string;
}

/** 容量統計。前四項單位是 UTF-8 bytes，assetCount 是筆數（不是 bytes） */
export interface GgmodSizeStats {
  projectBytes: number;
  assetsBytes: number;
  thumbnailBytes: number;
  totalBytes: number;
  assetCount: number;
}

/** 容器本體。signature 為 null 代表「未簽章」，不是「簽章無效」 */
export interface GgmodFile {
  /** 必須是字面值 GGMOD_MAGIC；用 typeof 讓寫出端少一次抄錯字串的機會 */
  magic: typeof GGMOD_MAGIC;
  formatVersion: number;
  /** 產生這個檔案的程式（名稱／版本皆可），純供除錯與問題回報 */
  generator: string;
  /** ISO 8601 字串；pack 寫入，unpack 只驗「是不是字串」，不驗曆法正確性 */
  createdAt: string;
  project: GgmodProjectSnapshot;
  assets: GgmodAssetSnapshot[];
  thumbnail: GgmodThumbnail | null;
  stats: GgmodSizeStats;
  signature: import('@/types/modScript').ModSignature | null;
}

/**
 * 錯誤碼：一支碼對一個「使用者要採取不同行動」的原因。
 * UI 用 code 去查 i18n 文案，所以 code 的語意必須穩定；message 只放英文技術細節。
 */
export type GgmodErrorCode =
  | 'NOT_JSON'
  | 'MAGIC_MISMATCH'
  | 'VERSION_UNSUPPORTED'
  | 'SCHEMA_INVALID'
  | 'ASSET_MISSING'
  | 'ASSET_DUPLICATE'
  | 'ASSET_VERSION_MISMATCH'
  | 'DEPENDENCY_CYCLE'
  | 'THUMBNAIL_INVALID'
  | 'SIGNATURE_INVALID'
  | 'SIZE_MISMATCH'
  | 'SIGNATURE_REQUIRED';

/** 單一問題。path 走 JSON 路徑慣例：project.id、assets[2].version、stats.totalBytes */
export interface GgmodIssue {
  code: GgmodErrorCode;
  path?: string;
  /** 一律英文技術描述：UI 文案來自 locales，資料層不出現中文 */
  message: string;
}

/** 結果型：成功帶值、失敗帶「全部」問題；呼叫端不必 try/catch */
export type GgmodResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: GgmodIssue[] };

/** 模組級快取：measure 一次會呼叫 4 次，每次重建 encoder 只是白配記憶體 */
let utf8Encoder: TextEncoder | null = null;

/**
 * UTF-8 位元組長度。
 * 為什麼不用 Buffer.byteLength：這三支模組要同時在瀏覽器與 jsdom 跑，
 * Buffer 只有 Node 有；TextEncoder 兩邊都是標準 API。
 */
export function utf8ByteLength(text: string): number {
  if (utf8Encoder === null) utf8Encoder = new TextEncoder();
  return utf8Encoder.encode(text).length;
}

/**
 * 乾淨的物件守衛：排除陣列與 null。
 * JSON 解析後的形狀判斷到處都要用，集中一支才不會每個檔各寫一份（還寫得不一樣）。
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
