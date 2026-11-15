/**
 * 主題對比的純函式與需求表（WCAG 2.1）
 *
 * 這裡是「任何文字都要看得清楚」的唯一判準：themeData.test.ts 會對 12 套主題
 * 逐條跑 TEXT_CONTRAST_REQUIREMENTS，門檻沒過就是 CI 紅燈。
 */

import type { ThemeColors, ThemeDefinition } from './themeData';

function parseHex(hex: string): [number, number, number] | null {
  const s = hex.trim().replace('#', '');
  if (s.length === 3) {
    return [0, 1, 2].map((i) => parseInt(s[i] + s[i], 16)) as [number, number, number];
  }
  if (s.length !== 6 || /[^0-9a-fA-F]/.test(s)) return null;
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16)) as [number, number, number];
}

function channelLuminance(value: number): number {
  const v = value / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/** WCAG 相對亮度；色票只允許 #rgb / #rrggbb，rgba 用於裝飾不參與檢查 */
function relativeLuminance(hex: string): number | null {
  const rgb = parseHex(hex);
  if (!rgb) return null;
  const [r, g, b] = rgb;
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

/** 兩色的對比比值（1–21）；任一色解析失敗回 0 */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  if (la === null || lb === null) return 0;
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

interface ContrastRequirement {
  /** 給測試訊息用的名稱 */
  name: string;
  foreground: keyof ThemeColors;
  background: keyof ThemeColors;
  min: number;
}

/** 文字與「按鈕字」的硬門檻：小字 4.5、標題與正文主力 6–7 */
export const TEXT_CONTRAST_REQUIREMENTS: readonly ContrastRequirement[] = [
  { name: '正文墨／紙底', foreground: 'ink', background: 'paper', min: 7 },
  { name: '次階墨／紙底', foreground: 'ink2', background: 'paper', min: 4.5 },
  { name: '三階墨／紙底', foreground: 'ink3', background: 'paper', min: 4.5 },
  { name: '四階墨（說明字）／紙底', foreground: 'ink4', background: 'paper', min: 4.5 },
  { name: '正文墨／卡片', foreground: 'ink', background: 'card', min: 7 },
  { name: '三階墨／卡片', foreground: 'ink3', background: 'card', min: 4.5 },
  { name: '正文墨／紙底第二階', foreground: 'ink', background: 'paper2', min: 6 },
  { name: '次階墨／卡片第二階', foreground: 'ink2', background: 'card2', min: 4.5 },
  { name: '正文墨／強調淺階徽章', foreground: 'ink', background: 'primarySoft', min: 4.5 },
  { name: '次階墨／強調淺階徽章', foreground: 'ink2', background: 'primarySoft', min: 4.5 },
  { name: '主要按鈕字／主要按鈕底', foreground: 'onCta', background: 'cta', min: 4.5 },
  { name: '強調色文字／紙底', foreground: 'accentText', background: 'paper', min: 4.5 },
  { name: '強調色文字／卡片', foreground: 'accentText', background: 'card', min: 4.5 },
];

interface ContrastResult {
  name: string;
  ratio: number;
  min: number;
  ok: boolean;
}

export function themeContrastReport(theme: ThemeDefinition): ContrastResult[] {
  return TEXT_CONTRAST_REQUIREMENTS.map((req) => {
    const ratio = contrastRatio(theme.colors[req.foreground], theme.colors[req.background]);
    return { name: req.name, ratio, min: req.min, ok: ratio >= req.min };
  });
}

/** 回傳不合格的敘述；空陣列代表這套主題可以上線 */
export function findContrastFailures(theme: ThemeDefinition): string[] {
  return themeContrastReport(theme)
    .filter((r) => !r.ok)
    .map((r) => theme.id + ' ' + r.name + ' 只有 ' + r.ratio.toFixed(2) + ':1（要求 ' + r.min + ':1）');
}
