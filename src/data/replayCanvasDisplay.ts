/** 回放畫布：血條跟對局同一把「顯示血條」開關。 */
export function shouldDrawReplayEnemyHealthBar(input: {
  hpRatio: number;
  showHealthBars: boolean;
}): boolean {
  return input.showHealthBars && input.hpRatio < 1;
}
