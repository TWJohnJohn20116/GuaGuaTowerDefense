/**
 * 合體模式畫布點擊：2D / 3D 共用，避免 3D 只改選取、合體從不觸發。
 */

type FusionCanvasClick =
  | { kind: 'none' }
  | { kind: 'cancel' }
  | { kind: 'fuse'; sourceId: string; targetId: string };

export function resolveFusionCanvasClick(input: {
  fusionMode: boolean;
  fusionSourceId: string | null;
  clickedTowerId: string | null;
}): FusionCanvasClick {
  if (!input.fusionMode || !input.fusionSourceId) return { kind: 'none' };
  if (input.clickedTowerId && input.clickedTowerId !== input.fusionSourceId) {
    return { kind: 'fuse', sourceId: input.fusionSourceId, targetId: input.clickedTowerId };
  }
  if (!input.clickedTowerId) return { kind: 'cancel' };
  return { kind: 'none' };
}
