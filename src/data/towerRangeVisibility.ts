/** 2D／3D 共用：設定關掉「顯示射程」時不畫射程圈。 */
export function shouldShowTowerRangeRing(showTowerRange: boolean, range: number): boolean {
  return showTowerRange && range > 0;
}
