/** 場景初次掛上時不要覆寫對局中的 Q；只有預設值真的變了才同步。 */
export function shouldApplyQuickPlaceDefaultSync(input: {
  previousDefault: boolean | null;
  nextDefault: boolean;
}): boolean {
  if (input.previousDefault === null) return false;
  return input.previousDefault !== input.nextDefault;
}
