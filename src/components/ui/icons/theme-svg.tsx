import type { IconProps } from './base';
import { f, s } from './base';

// ── 主題相關 SVG 組件 ─────────────────────────────────────────────────────

/** 🌙 月亮 — 預設色：text-[var(--hl-reach)] */
export const MoonIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" fillOpacity="0.15" />
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

/** ☀️ 太陽 — 預設色：text-[var(--hl-caution)] */
export const SunIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.2" />
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="1" x2="12" y2="4" />
    <line x1="12" y1="20" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
    <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
    <line x1="2" y1="12" x2="4" y2="12" />
    <line x1="20" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
    <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
  </svg>
);

/** 👁️ 眼睛 — 預設色：text-[var(--hl-reach)] */
export const EyeIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" fill="currentColor" fillOpacity="0.15" />
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" fill="currentColor" />
  </svg>
);

/** 🌲 樹 — 預設色：text-[var(--hl-vital)] */
export const TreeIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M12 2L4 12l8 10 8-10L12 2z" fill="currentColor" fillOpacity="0.15" />
    <path d="M12 2L4 12l8 10 8-10L12 2z" />
    <path d="M12 22V12" />
    <line x1="8" y1="22" x2="16" y2="22" />
  </svg>
);

/** 🌅 日出/日落 — 預設色：text-[var(--hl-caution)] */
export const SunriseIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M12 2v4M4 10h16M5 16l2-4 2 4 2-4 2 4 2-4 2 4" strokeWidth="2" />
    <path d="M17 18H7" />
    <line x1="2" y1="22" x2="22" y2="22" />
  </svg>
);

/** 💜 紫色愛心 — 預設色：text-[var(--hl-ink-2)] */
export const HeartPurpleIcon = (p: IconProps) => (
  <svg {...f(p)}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor" fillOpacity="0.15" />
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

/** 🌸 花 — 預設色：text-[var(--hl-ink-2)] */
export const FlowerIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="7" r="3" fill="currentColor" fillOpacity="0.2" />
    <circle cx="12" cy="7" r="3" />
    <circle cx="7" cy="12" r="3" fill="currentColor" fillOpacity="0.2" />
    <circle cx="7" cy="12" r="3" />
    <circle cx="12" cy="17" r="3" fill="currentColor" fillOpacity="0.2" />
    <circle cx="12" cy="17" r="3" />
    <circle cx="17" cy="12" r="3" fill="currentColor" fillOpacity="0.2" />
    <circle cx="17" cy="12" r="3" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

/** 🎄 聖誕樹 — 預設色：text-[var(--hl-vital)] */
export const ChristmasTreeIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M12 2L6 10l6 4 6-4L12 2z" fill="currentColor" fillOpacity="0.15" />
    <path d="M12 2L6 10l6 4 6-4L12 2z" />
    <path d="M12 6L8 12l4 3 4-3L12 6z" fill="currentColor" fillOpacity="0.15" />
    <path d="M12 6L8 12l4 3 4-3L12 6z" />
    <path d="M12 10L10 14l2 2 2-2L12 10z" fill="currentColor" fillOpacity="0.15" />
    <path d="M12 10L10 14l2 2 2-2L12 10z" />
    <path d="M11 18h2" />
    <path d="M10 22h4" />
  </svg>
);

/** 🎃 南瓜 — 預設色：text-[var(--hl-caution)] */
export const PumpkinIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <ellipse cx="12" cy="14" rx="9" ry="7" fill="currentColor" fillOpacity="0.15" />
    <ellipse cx="12" cy="14" rx="9" ry="7" />
    <path d="M12 7V4" />
    <path d="M9 4h6" />
    <path d="M8 14c-2 0-3-2-3-2M16 14c2 0 3-2 3-2" />
    <ellipse cx="12" cy="14" rx="5" ry="3" />
  </svg>
);

/** 🔲 方塊 — 預設色：text-slate-400 */
export const SquareIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" fillOpacity="0.1" />
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
);
