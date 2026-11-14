/** 放置歷史：撤銷／重做是否可用（與 store 的 index 語意對齊） */

export function canUndoPlacement(index: number): boolean {
  return index >= 0;
}

export function canRedoPlacement(index: number, historyLength: number): boolean {
  return index < historyLength - 1;
}
