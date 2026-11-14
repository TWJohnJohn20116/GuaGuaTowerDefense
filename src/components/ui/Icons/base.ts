import type { SVGProps } from 'react';

/** 所有 icon 共用：svg 屬性 + 可選 className */
export type IconProps = SVGProps<SVGSVGElement> & { className?: string };

/** 通用線條底座（stroke = currentColor） */
export const s = (p: IconProps) => ({
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...p,
});

/** 填充底座（fill = currentColor） */
export const f = (p: IconProps) => ({
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'currentColor',
  stroke: 'none',
  ...p,
});
