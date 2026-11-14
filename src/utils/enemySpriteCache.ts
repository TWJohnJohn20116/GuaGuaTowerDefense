import { drawEnemyModel } from '@/utils/enemyRenderer';

/**
 * 敵人本體精靈快取
 *
 * 為什麼可以快取：`drawEnemyModel` 的每個 renderer 都**不使用** `time` 參數
 * （時間只用在 spawn 縮放、隱身/相位透明度、狀態環，那些都在本體之外），
 * 所以同一種 modelType + 顏色 + 半徑，畫出來的像素永遠一樣。
 *
 * 原本每隻敵人每幀都要重跑一次路徑繪製（弧線 + 眼睛 + 高光，約 8~15 次 canvas 呼叫），
 * 加上 `shadowBlur` 光暈（Canvas2D 最貴的操作）。改成：
 *   - 首次遇到某個組合時，把模型（含光暈）烘到一張離屏 canvas
 *   - 之後每隻敵人只需要一次 drawImage
 *
 * 沒有 2D context 的環境（jsdom 測試）會回傳 null，呼叫端退回直接繪製，
 * 行為完全一致——這也是為什麼這支模組可以被單獨測試。
 */

export interface EnemySprite {
  image: CanvasImageSource;
  /** 圖片邊長（正方形，含光暈留白） */
  size: number;
  /** 圖片中心到左上角的距離 */
  half: number;
  /** 敵人本體半徑（整數像素） */
  radius: number;
}

export interface EnemySpriteOptions {
  modelType: string;
  color: string;
  radius: number;
  glowColor?: string | null;
  glowIntensity?: number;
}

/** 上限只是保險，實際組合數 = 敵人種類 × 尺寸級距，通常個位數 */
const MAX_SPRITES = 256;
const cache = new Map<string, EnemySprite | null>();
/** 環境不支援離屏 canvas 時只嘗試一次，避免每幀都撞牆 */
let offscreenUnsupported = false;

const glowPad = (glowIntensity: number): number => Math.ceil(12 * glowIntensity) + 6;

const renderSprite = (
  size: number,
  radius: number,
  opts: Required<EnemySpriteOptions>,
): EnemySprite | null => {
  if (offscreenUnsupported) return null;
  if (typeof document === 'undefined') {
    offscreenUnsupported = true;
    return null;
  }

  let ctx: CanvasRenderingContext2D | null = null;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    ctx = canvas.getContext('2d');
    if (!ctx) {
      offscreenUnsupported = true;
      return null;
    }

    const center = size / 2;
    if (opts.glowColor && opts.glowIntensity > 0) {
      ctx.shadowColor = opts.glowColor;
      ctx.shadowBlur = 12 * opts.glowIntensity;
    }
    // time 對所有 renderer 都無效，固定傳 0 即可
    drawEnemyModel(ctx, center, center, radius, opts.modelType, opts.color, 0);

    return { image: canvas, size, half: center, radius };
  } catch {
    offscreenUnsupported = true;
    ctx = null;
    return null;
  }
};

/**
 * 取得（或建立）某個組合的精靈。
 * 回傳 null 代表這個環境無法離屏繪製 → 呼叫端應退回 `drawEnemyModel`。
 */
export const getEnemySprite = (options: EnemySpriteOptions): EnemySprite | null => {
  const radius = Math.max(2, Math.round(options.radius));
  const glowIntensity = options.glowColor ? Math.max(0, options.glowIntensity ?? 0) : 0;

  const key = [
    options.modelType,
    options.color,
    radius,
    glowIntensity > 0 ? options.glowColor ?? '' : '',
    glowIntensity.toFixed(2),
  ].join('|');

  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const pad = glowIntensity > 0 ? glowPad(glowIntensity) : 2;
  const size = Math.ceil((radius + pad) * 2);

  const sprite = renderSprite(size, radius, {
    modelType: options.modelType,
    color: options.color,
    radius,
    glowColor: options.glowColor ?? null,
    glowIntensity,
  });

  cache.set(key, sprite);
  if (cache.size > MAX_SPRITES) {
    const oldest = cache.keys().next();
    if (!oldest.done) cache.delete(oldest.value);
  }

  return sprite;
};

/** 測試 / 換關卡用：清空快取（例如畫布尺寸改變導致半徑級距全變） */
export const clearEnemySpriteCache = (): void => {
  cache.clear();
};

/** 目前快取數量（除錯用） */
export const getEnemySpriteCacheSize = (): number => cache.size;
