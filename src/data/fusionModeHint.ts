/**
 * 合體提示條文案：錢不夠時沿用升級那套「需要資金」，不要靜默失敗。
 */

export function resolveFusionModeHint(input: {
  fundsShort: number | null;
  modeHint: string;
  needFunds: string;
}): string {
  if (input.fundsShort == null) return input.modeHint;
  return input.needFunds.replace('{cost}', String(input.fundsShort));
}
