/**
 * 電磁脈衝：擊破護盾後對本體造成固定傷害
 */

export function applyEmpPulse<T extends { health: number; shield?: number }>(
  enemies: T[],
  damage: number,
  skip?: (enemy: T) => boolean,
): { enemies: T[]; stripped: number } {
  let stripped = 0;
  const next = enemies.map((enemy) => {
    if (enemy.health <= 0 || skip?.(enemy)) return enemy;
    if ((enemy.shield ?? 0) > 0) stripped += 1;
    return {
      ...enemy,
      shield: 0,
      health: Math.max(0, enemy.health - damage),
    };
  });
  return { enemies: next, stripped };
}
