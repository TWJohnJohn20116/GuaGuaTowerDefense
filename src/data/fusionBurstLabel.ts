const FALLBACK = '融合';

/** 合體爆開字：翻譯缺漏時仍用繁中，絕不退回英文 FUSION。 */
export function fusionBurstText(label?: string | null): string {
  const trimmed = label?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : FALLBACK;
}
