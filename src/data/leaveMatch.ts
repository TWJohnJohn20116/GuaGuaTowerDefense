type LeaveMatchFromHud = 'blocked' | 'reset_match';

/** HUD 離開對局：教學中擋住；否則必須 resetGame，不能只切主選單。 */
export function resolveLeaveMatchFromHud(input: {
  tutorialActive: boolean;
}): LeaveMatchFromHud {
  if (input.tutorialActive) return 'blocked';
  return 'reset_match';
}
