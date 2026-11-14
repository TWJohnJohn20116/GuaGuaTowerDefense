import type { IconProps } from './base';
import { f, s } from './base';

// ── 貨幣 ──────────────────────────────────────────────────────────────
/** 預設色：text-[var(--hl-caution)] */
export const CoinIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.15" />
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v10M9.5 9.5h3.5a1.5 1.5 0 0 1 0 3H10M10 12.5h3.8a1.7 1.7 0 0 1 0 3.4H9.5" />
  </svg>
);

// ── 導航 ──────────────────────────────────────────────────────────────
/** 預設色：text-[var(--hl-reach)] */
export const GamepadIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <rect x="2" y="7" width="20" height="11" rx="3" fill="currentColor" fillOpacity="0.1" />
    <rect x="2" y="7" width="20" height="11" rx="3" />
    <path d="M7 12h4M9 10v4" />
    <circle cx="15" cy="11" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="17" cy="13" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

/** 預設色：text-[var(--hl-caution)] */
export const TrophyIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M7 3h10v7a5 5 0 0 1-10 0V3z" fill="currentColor" fillOpacity="0.15" />
    <path d="M7 3h10v7a5 5 0 0 1-10 0V3z" />
    <path d="M7 7H4a2 2 0 0 0 0 4h3M17 7h3a2 2 0 0 0 0 4h-3" />
    <path d="M12 15v4M8 19h8" />
  </svg>
);

/** 預設色：text-[var(--hl-ink-2)] */
export const PaletteIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1" />
    <circle cx="12" cy="12" r="10" />
    <circle cx="8" cy="10" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="12.5" cy="7.5" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="16.5" cy="10" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="16" cy="14.5" r="1.4" fill="currentColor" stroke="none" />
    <path d="M7.5 16.5c1 1.5 3 2 4.5.5" />
  </svg>
);

/** 預設色：text-[var(--hl-caution)] */
export const ShopIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M3 9l1-6h16l1 6" />
    <path d="M3 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0" />
    <path d="M5 21V11h14v10H5z" fill="currentColor" fillOpacity="0.1" />
    <path d="M5 21V11h14v10H5z" />
    <path d="M9 21v-6h6v6" />
  </svg>
);

/** 🛒✅ 確認購買/購物車勾選 — 預設色：text-[var(--hl-vital)] */
export const CartCheckIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    <path d="M11 11l2 2 4-4" strokeWidth="2.5" />
  </svg>
);

/** 預設色：text-[var(--hl-caution)] */
export const WrenchIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" fill="currentColor" fillOpacity="0.1" />
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

/** 預設色：text-[var(--hl-reach)] */
export const BooksIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M4 19V5a2 2 0 0 1 2-2h14v16H4z" fill="currentColor" fillOpacity="0.1" />
    <path d="M4 19V5a2 2 0 0 1 2-2h14v16H4z" />
    <path d="M4 19a2 2 0 0 0 2 2h14" />
    <path d="M9 7h6M9 11h6M9 15h4" />
  </svg>
);

/** 預設色：text-[var(--hl-vital)] */
export const OpenBookIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M2 6s1-1 4-1 5 2 6 2 3-2 6-2 4 1 4 1v13s-1-1-4-1-5 2-6 2-3-2-6-2-4 1-4 1V6z" fill="currentColor" fillOpacity="0.1" />
    <path d="M2 6s1-1 4-1 5 2 6 2 3-2 6-2 4 1 4 1v13s-1-1-4-1-5 2-6 2-3-2-6-2-4 1-4 1V6z" />
    <path d="M12 7v13" />
  </svg>
);

/** 預設色：text-slate-400 */
export const ClipboardIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <rect x="8" y="2" width="8" height="4" rx="1" fill="currentColor" fillOpacity="0.2" />
    <rect x="8" y="2" width="8" height="4" rx="1" />
    <path d="M8 2H5a1 1 0 0 0-1 1v17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-3" />
    <path d="M8 10h8M8 14h6" />
  </svg>
);

/** 預設色：text-slate-400 */
export const GearIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.2" />
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

/** 預設色：text-slate-400 */
export const HomeIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M3 12L12 3l9 9" />
    <path d="M5 10v9a1 1 0 0 0 1 1h4v-5h4v5h4a1 1 0 0 0 1-1v-9" fill="currentColor" fillOpacity="0.1" />
    <path d="M5 10v9a1 1 0 0 0 1 1h4v-5h4v5h4a1 1 0 0 0 1-1v-9" />
  </svg>
);

// ── 遊戲狀態 ─────────────────────────────────────────────────────────
/** 填充 ❤️ — 預設色：text-[var(--hl-alarm)] */
export const HeartIcon = (p: IconProps) => (
  <svg {...f(p)}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

/** 填充（有裂縫） — 預設色：text-[var(--hl-alarm)] */
export const BrokenHeartIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor" fillOpacity="0.2" />
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    <path d="M12 5.67l-1.5 3 2 2-2 2 1.5 3" strokeWidth="1.5" />
  </svg>
);

/** 預設色：text-[var(--hl-reach)] */
export const WaveIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M2 12c1.5-3 3-4.5 5-4.5s3.5 3 5.5 3S16 7.5 18 7.5s2.5 1.5 4 3M2 17c1.5-3 3-4.5 5-4.5s3.5 3 5.5 3S16 12.5 18 12.5s2.5 1.5 4 3" strokeWidth="2" />
  </svg>
);

/** 預設色：text-[var(--hl-ink-2)] */
export const InfinityIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M12 12c-2-2.5-4-4-6-4a4 4 0 0 0 0 8c2 0 4-1.5 6-4zm0 0c2 2.5 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.5-6 4z" strokeWidth="2" />
  </svg>
);

/** 填充 ★ — 預設色：text-[var(--hl-caution)] */
export const StarIcon = (p: IconProps) => (
  <svg {...f(p)}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

/** 預設色：text-[var(--hl-alarm)] */
export const LockIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <rect x="5" y="11" width="14" height="11" rx="2" fill="currentColor" fillOpacity="0.15" />
    <rect x="5" y="11" width="14" height="11" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

/** 預設色：text-slate-400 */
export const BoxIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" fill="currentColor" fillOpacity="0.1" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
  </svg>
);

/** 預設色：text-slate-400 */
export const SearchIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="11" cy="11" r="8" fill="currentColor" fillOpacity="0.08" />
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);
