/** 塔血條：受傷才顯示，並跟「顯示血條」設定走。 */

export function shouldShowTowerHealthBar(
  health: number,
  maxHealth: number,
  showHealthBars: boolean,
): boolean {
  if (!showHealthBars || maxHealth <= 0) return false;
  return health < maxHealth;
}
