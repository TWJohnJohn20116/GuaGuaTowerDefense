/**
 * 對局中途狀態：開新局或回主選單都要清掉，不能把上一場的疊層帶過來。
 */

export function getMatchSessionReset() {
  return {
    fusionMode: false,
    fusionSourceId: null,
    fusionFundsShort: null,
    fusionAnimations: [] as [],
    hoverPoint: null,
    showTacticalView: false,
    shakeIntensity: 0,
  };
}
