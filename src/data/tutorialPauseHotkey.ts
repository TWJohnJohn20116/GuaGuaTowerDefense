export type TutorialHotkeyGate = 'pause_and_advance' | 'block';

/** 教學中熱鍵預設全擋；暫停步驟例外放行暫停鍵（空白鍵仍是循環速度，不可當暫停）。 */
export function resolveTutorialHotkeyGate(input: {
  stepAction?: string;
  keyCode: string;
  pauseKeyCode: string;
}): TutorialHotkeyGate {
  if (input.stepAction === 'pause_game' && input.keyCode === input.pauseKeyCode) {
    return 'pause_and_advance';
  }
  return 'block';
}
