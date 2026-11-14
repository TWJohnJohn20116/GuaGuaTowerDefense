// 遊戲迴圈共享型別與跨函式旗標
import type { GameStore } from '../gameStoreTypes';

export type GetState = () => GameStore;
export type SetState = (
  partial: Partial<GameStore> | ((state: GameStore) => Partial<GameStore>)
) => void;

/**
 * 跨函式共享的暫存旗標
 * 主要供教學模式降速判定使用：
 *   - hasNewProjectilesThisFrame：當幀是否有任何塔發射新子彈
 *   - enemyInRange：當幀是否有任何塔的射程內有敵人
 *
 * 用可變物件而非個別 export 變數是為了在 ES module 中能夠跨模組共享值
 * （ES module 的 export 變數是唯讀 binding，無法在外部修改）。
 */
export const loopFlags = {
  hasNewProjectilesThisFrame: false,
  enemyInRange: false,
};
