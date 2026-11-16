/** 依 {name} 佔位符組字串（i18n 不帶插值，統一在這裡處理） */
export const formatNarration = (
  template: string,
  params?: Record<string, string | number>,
): string => template.replace(/\{(\w+)\}/g, (_, key: string) => String(params?.[key] ?? ''));
