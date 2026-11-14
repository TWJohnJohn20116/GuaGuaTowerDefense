/**
 * Mod 圖示編輯器：圖層操作的純函式層
 *
 * 從 `ModIconEditor.tsx` 拆出（TD-07）。這裡只放「給定圖層陣列 + 目標 id，回傳新陣列」
 * 這種與 React 無關的計算；元件負責 state 與事件。搬移時逐字保留原本的比較條件與
 * 邊界值（0.5～15 的縮放範圍、zIndex 交換、8px 吸附），因為那些數字直接決定手感。
 *
 * 約定：所有函式都不 mutate 傳入的陣列；不需要變動時原樣回傳同一個參照，
 * 讓 React 的 state 比較能省掉一次重繪。
 */

/** 單一圖層：位置、尺寸、旋轉、層序，加上可見性 / 鎖定 / 色相 */
export interface IconLayer {
  id: string;
  emoji: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
  opacity?: number;
  flipX?: boolean;
  flipY?: boolean;
  hidden?: boolean;
  locked?: boolean;
  hue?: number;
}

/** 一次最多幾個圖層（原本散在元件各處的魔術數字） */
export const MAX_ICON_LAYERS = 15;

/** 縮放範圍，縮放鈕、滾輪、拖曳把手共用同一組邊界 */
const MIN_ICON_SCALE = 0.5;
const MAX_ICON_SCALE = 15;

/** 吸附格線的格距（畫布按鈕寫的是 8px） */
const ICON_SNAP_STEP = 8;

/** 圖層 id：時間戳 + 隨機，同一毫秒內連續新增也不會撞號 */
export const createIconId = (): string => `icon-${Date.now()}-${Math.random()}`;

/** 下一個層序：永遠接在現有最大值之上 */
const nextZIndex = (icons: readonly IconLayer[]): number =>
  icons.length > 0 ? Math.max(...icons.map((i) => i.zIndex)) + 1 : 0;

/** 把縮放夾進可用範圍 */
export const clampIconScale = (scale: number): number =>
  Math.max(MIN_ICON_SCALE, Math.min(MAX_ICON_SCALE, scale));

/** 開啟吸附時把座標對齊格線，關閉時原樣回傳 */
export const snapIconCoordinate = (value: number, enabled: boolean): number =>
  enabled ? Math.round(value / ICON_SNAP_STEP) * ICON_SNAP_STEP : value;

/** 新增一個圖層（新圖層一律置頂） */
export const addIconLayer = (icons: readonly IconLayer[], emoji: string, id: string): IconLayer[] => [
  ...icons,
  {
    id,
    emoji,
    x: Math.floor(Math.random() * 40) - 20,
    y: Math.floor(Math.random() * 40) - 20,
    scale: 1,
    rotation: 0,
    zIndex: nextZIndex(icons),
  },
];

/**
 * 複製指定圖層，往右下偏移 10px 並置頂。
 * 已達上限或找不到來源時回傳 null（呼叫端據此決定要不要改選取狀態）。
 */
export const duplicateIconLayer = (
  icons: readonly IconLayer[],
  id: string,
  newId: string,
): IconLayer[] | null => {
  if (icons.length >= MAX_ICON_LAYERS) return null;
  const source = icons.find((i) => i.id === id);
  if (!source) return null;
  return [
    ...icons,
    {
      ...source,
      id: newId,
      x: source.x + 10,
      y: source.y + 10,
      zIndex: nextZIndex(icons),
    },
  ];
};

/** 移除一個圖層 */
export const removeIconLayer = (icons: readonly IconLayer[], id: string): IconLayer[] =>
  icons.filter((i) => i.id !== id);

/** 更新指定圖層的欄位（找不到就原樣回傳） */
export const updateIconLayer = (
  icons: readonly IconLayer[],
  id: string,
  updates: Partial<IconLayer>,
): IconLayer[] => icons.map((icon) => (icon.id === id ? { ...icon, ...updates } : icon));

/** 鍵盤微調：一次移動 dx / dy */
export const nudgeIconLayer = (
  icons: readonly IconLayer[],
  id: string,
  dx: number,
  dy: number,
): IconLayer[] =>
  icons.map((icon) => (icon.id === id ? { ...icon, x: icon.x + dx, y: icon.y + dy } : icon));

/** 往上移一層（與相鄰的上層交換 zIndex；已是最上層或找不到就原樣回傳） */
export const moveLayerUp = (icons: readonly IconLayer[], id: string): IconLayer[] => {
  const sorted = [...icons].sort((a, b) => a.zIndex - b.zIndex);
  const idx = sorted.findIndex((i) => i.id === id);
  if (idx === -1 || idx === sorted.length - 1) return icons as IconLayer[];
  const currentZ = sorted[idx].zIndex;
  const nextZ = sorted[idx + 1].zIndex;
  return icons.map((i) => {
    if (i.id === sorted[idx].id) return { ...i, zIndex: nextZ };
    if (i.id === sorted[idx + 1].id) return { ...i, zIndex: currentZ };
    return i;
  });
};

/** 往下移一層（與相鄰的下層交換 zIndex；已是最下層或找不到就原樣回傳） */
export const moveLayerDown = (icons: readonly IconLayer[], id: string): IconLayer[] => {
  const sorted = [...icons].sort((a, b) => a.zIndex - b.zIndex);
  const idx = sorted.findIndex((i) => i.id === id);
  if (idx <= 0) return icons as IconLayer[];
  const currentZ = sorted[idx].zIndex;
  const prevZ = sorted[idx - 1].zIndex;
  return icons.map((i) => {
    if (i.id === sorted[idx].id) return { ...i, zIndex: prevZ };
    if (i.id === sorted[idx - 1].id) return { ...i, zIndex: currentZ };
    return i;
  });
};

/** 移到最上層 */
export const bringToFront = (icons: readonly IconLayer[], id: string): IconLayer[] => {
  if (icons.length === 0) return icons as IconLayer[];
  const maxZ = Math.max(...icons.map((i) => i.zIndex));
  return icons.map((i) => (i.id === id ? { ...i, zIndex: maxZ + 1 } : i));
};

/** 移到最下層（允許負數層序，排序時自然落在最底） */
export const sendToBack = (icons: readonly IconLayer[], id: string): IconLayer[] => {
  if (icons.length === 0) return icons as IconLayer[];
  const minZ = Math.min(...icons.map((i) => i.zIndex));
  return icons.map((i) => (i.id === id ? { ...i, zIndex: minZ - 1 } : i));
};

/** 切換顯示 / 隱藏 */
export const toggleLayerVisibility = (icons: readonly IconLayer[], id: string): IconLayer[] =>
  icons.map((i) => (i.id === id ? { ...i, hidden: !i.hidden } : i));

/** 切換鎖定（鎖定後不可拖曳、不可滾輪縮放、不可鍵盤移動） */
export const toggleLayerLock = (icons: readonly IconLayer[], id: string): IconLayer[] =>
  icons.map((i) => (i.id === id ? { ...i, locked: !i.locked } : i));
