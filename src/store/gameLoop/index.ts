// 遊戲迴圈聚合入口：將拆分的各個 action 組合成 createLoopActions
import type { GetState, SetState } from './shared';
import { createUpdateEnemies } from './updateEnemies';
import { createUpdateTowers } from './updateTowers';
import { createUpdateProjectiles } from './updateProjectiles';
import { createRemoveEnemy } from './removeEnemy';

export type { GetState, SetState } from './shared';
export { loopFlags } from './shared';

export const createLoopActions = (get: GetState, set: SetState) => ({
  updateEnemies: createUpdateEnemies(get, set),
  updateTowers: createUpdateTowers(get, set),
  updateProjectiles: createUpdateProjectiles(get, set),
  removeEnemy: createRemoveEnemy(get, set),
});
