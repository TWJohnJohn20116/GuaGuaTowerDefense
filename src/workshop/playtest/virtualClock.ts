/**
 * 虛擬時鐘
 *
 * 為什麼需要它：引擎有一批計時是「牆上時鐘」——狀態效果到期（updateEnemies）、
 * 塔冷卻（updateTowers）、彈體（updateProjectiles）、技能冷卻、生成時間，全部讀 Date.now()。
 * 無畫面模擬會用幾百毫秒的牆上時間跑完好幾分鐘的戰局；如果不接管 Date.now()，
 * 那些持續 3 秒的減速／中毒在模擬時間裡等於「永久生效」，平衡結果會整個失真。
 *
 * 作法：只在**同一個同步區塊**內換掉 Date.now，塊結束立刻還原。
 * 區塊是同步的，中間不會插進 React render 或音樂服務，所以不會波及到本局以外的程式碼。
 * 也不要改 generateId：它用 Math.random()，不吃時間，換時鐘不會撞 id。
 */

/** 同步區塊內接管 Date.now；離開區塊必定還原（finally） */
export function withVirtualClock<T>(now: () => number, body: () => T): T {
  const realNow = Date.now;
  Date.now = now;
  try {
    return body();
  } finally {
    Date.now = realNow;
  }
}
