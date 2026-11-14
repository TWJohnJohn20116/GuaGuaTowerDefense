/**
 * 血條顏色（純函式）
 *
 * 2D canvas、3D 敵人 InstancedMesh、3D 塔血條共用同一組門檻與色票。
 * 之前 2D 用 0.5、3D 用 0.55，同一場戰鬥切換視圖時變色時機不一致。
 */

const HEALTHY = 0x4ade80;
const HURT = 0xfacc15;
const CRITICAL = 0xef4444;

/** 3D 用（InstancedMesh 逐實例顏色） */
export const healthBarColorHex = (ratio: number): number =>
  ratio > 0.5 ? HEALTHY : ratio > 0.25 ? HURT : CRITICAL;

/** 2D canvas 用（fillStyle 直接吃 CSS 字串，回傳常數字串不產生配置） */
export const healthBarColorCss = (ratio: number): string =>
  ratio > 0.5 ? '#4ade80' : ratio > 0.25 ? '#facc15' : '#ef4444';
