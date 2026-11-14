export type GameEndClaimView = 'claim' | 'claimed' | 'open';

/** 結算快照不會跟著 store 更新；領完要用即時 claimed 把按鈕換成已領取。 */
export function resolveGameEndClaimView(input: {
  snapshotClaimable: boolean;
  liveClaimed: boolean;
}): GameEndClaimView {
  if (input.liveClaimed) return input.snapshotClaimable ? 'claimed' : 'open';
  return input.snapshotClaimable ? 'claim' : 'open';
}
