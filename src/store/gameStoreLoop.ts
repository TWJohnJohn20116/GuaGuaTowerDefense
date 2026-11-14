// 遊戲迴圈：敵人移動、塔攻擊、投射物更新、敵人移除
// 本檔案已拆分至 ./gameLoop/ 目錄，僅作為向後相容的 re-export
export { createLoopActions, loopFlags } from './gameLoop';
export type { GetState, SetState } from './gameLoop';
