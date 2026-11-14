/**
 * 選塔／放塔畫布點擊：2D 與 3D 共用，避免 3D 少了多選與雙擊。
 */

type GridTowerClickKind = 'toggle_multi' | 'select_type' | 'select' | 'place' | 'clear';

export function resolveGridTowerClick(input: {
  hasTower: boolean;
  modifierSelect: boolean;
  doubleClick: boolean;
  canPlace: boolean;
}): GridTowerClickKind {
  if (input.hasTower) {
    if (input.modifierSelect) return 'toggle_multi';
    if (input.doubleClick) return 'select_type';
    return 'select';
  }
  if (input.canPlace) return 'place';
  return 'clear';
}

/** Ctrl 框選面積過小時改當成點擊，不要直接吃掉 Shift／Ctrl 點塔。 */
export function resolveMarqueeAsClick(area: number, minArea = 64): boolean {
  return area < minArea;
}
