export interface PauseBuildViewState {
  isPaused: boolean;
  buildWhilePaused: boolean;
  pauseMenuOpen: boolean;
  isGameOver: boolean;
}

/** 全畫面暫停選單：設定關閉時一定出現；設定開啟時只在玩家按「選單」後出現 */
export function shouldShowFullPauseOverlay(state: PauseBuildViewState): boolean {
  if (!state.isPaused || state.isGameOver) return false;
  if (!state.buildWhilePaused) return true;
  return state.pauseMenuOpen;
}

/** 精簡暫停條：時間停住、戰場仍可操作 */
export function shouldShowPauseBuildHud(state: PauseBuildViewState): boolean {
  return state.isPaused && state.buildWhilePaused && !state.pauseMenuOpen && !state.isGameOver;
}
