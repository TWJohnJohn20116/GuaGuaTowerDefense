export type VictoryMedalId =
  | 'perfectDefense'
  | 'hunter'
  | 'architect'
  | 'maxUpgrade'
  | 'destroyer'
  | 'ironWall';

/** 結算獎章：銅牆鐵壁看剩餘生命是否仍 ≥ 開局生命，不再誤用 100 HP。 */
export function resolveVictoryMedalIds(input: {
  stars: number;
  health: number;
  startingHealth: number;
  totalKills: number;
  towerCount: number;
  maxLevelReached: number;
  totalDamage: number;
}): VictoryMedalId[] {
  const medals: VictoryMedalId[] = [];
  if (input.stars === 3) medals.push('perfectDefense');
  if (input.totalKills >= 100) medals.push('hunter');
  if (input.towerCount >= 10) medals.push('architect');
  if (input.maxLevelReached >= 5) medals.push('maxUpgrade');
  if (input.totalDamage >= 10000) medals.push('destroyer');
  if (input.startingHealth > 0 && input.health >= input.startingHealth) medals.push('ironWall');
  return medals;
}
