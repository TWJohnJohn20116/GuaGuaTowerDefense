/** 塔面板鎖定鈕提示：已鎖定時顯示解除，否則顯示鎖定。 */
export function getTowerLockTitle(locked: boolean, lockLabel: string, unlockLabel: string): string {
  return locked ? unlockLabel : lockLabel;
}
