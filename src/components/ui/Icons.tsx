import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

/** 通用線條底座（stroke = currentColor） */
const s = (p: IconProps) => ({
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
const f = (p: IconProps) => ({
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'currentColor',
  stroke: 'none',
  ...p,
});

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

// ── 塔類型 ───────────────────────────────────────────────────────────
/** 預設色：text-[var(--hl-reach)] */
export const ShieldIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M12 2L4 5v6c0 5.25 3.5 10.15 8 11.35C17.5 21.15 21 16.25 21 11V5l-9-3z" fill="currentColor" fillOpacity="0.15" />
    <path d="M12 2L4 5v6c0 5.25 3.5 10.15 8 11.35C17.5 21.15 21 16.25 21 11V5l-9-3z" />
  </svg>
);

/** 預設色：text-[var(--hl-vital)] */
export const TargetIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
  </svg>
);

/** 填充爆炸 — 預設色：text-[var(--hl-caution)] */
export const ExplosionIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M12 2l2.4 7.4L22 7l-5.4 5.6L19 21l-7-4.8L5 21l2.4-8.4L2 7l7.6 2.4L12 2z" fill="currentColor" fillOpacity="0.2" />
    <path d="M12 2l2.4 7.4L22 7l-5.4 5.6L19 21l-7-4.8L5 21l2.4-8.4L2 7l7.6 2.4L12 2z" />
  </svg>
);

/** 預設色：text-[var(--hl-reach)] */
export const SnowflakeIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07" strokeWidth="2" />
    <path d="M12 6l-2-2M12 6l2-2M12 18l-2 2M12 18l2 2M6 12l-2 2M6 12l-2-2M18 12l2 2M18 12l2-2" />
  </svg>
);

/** 預設色：text-[var(--hl-reach)] */
export const WindIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M4 8h12a3 3 0 1 0-2.5-5" strokeWidth="2" />
    <path d="M4 12h14a4 4 0 1 1-3.5 7" strokeWidth="2" />
    <path d="M4 16h8a2.5 2.5 0 1 0-2-4" strokeWidth="2" />
  </svg>
);

/** 預設色：text-slate-400 */
export const SkullIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M12 3a7 7 0 0 0-7 7c0 3.5 2 5 2 7h10c0-2 2-3.5 2-7a7 7 0 0 0-7-7z" fill="currentColor" fillOpacity="0.15" />
    <path d="M12 3a7 7 0 0 0-7 7c0 3.5 2 5 2 7h10c0-2 2-3.5 2-7a7 7 0 0 0-7-7z" />
    <path d="M9 17v2a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-2" />
    <circle cx="9.5" cy="10.5" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="14.5" cy="10.5" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

/** 預設色：text-[var(--hl-ink-2)] */
export const CrystalBallIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="11" r="8" fill="currentColor" fillOpacity="0.1" />
    <circle cx="12" cy="11" r="8" />
    <path d="M7 20h10M9 22h6" />
    <path d="M9 8.5a3 3 0 0 1 1.5-1" strokeWidth="2" />
  </svg>
);

/** 填充閃電 — 預設色：text-[var(--hl-caution)] */
export const LightningIcon = (p: IconProps) => (
  <svg {...f(p)}>
    <path d="M13 2L4.5 13.5H11L10 22l9-12h-6.5L13 2z" />
  </svg>
);

/** 鏈式閃電（連鎖彈跳）— 預設色：text-[var(--hl-reach)] */
export const ChainLightningIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M2 14l4.5-1.5L4 8l6 2.5L8 5l6 2.5" />
    <path d="M14 7.5l3 1.5-1.5 4 5-2" strokeOpacity="0.8" />
    <circle cx="6.5" cy="12.5" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="10" cy="10.5" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="17" cy="9" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);

/** 醫療愛心（聖光治療）— 預設色：text-[var(--hl-vital)] */
export const HealIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor" fillOpacity="0.15" />
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    <line x1="12" y1="9.5" x2="12" y2="14.5" strokeWidth="2" />
    <line x1="9.5" y1="12" x2="14.5" y2="12" strokeWidth="2" />
  </svg>
);

/** 聖盾結界（六角結界盾 + 內部光核） — 預設色：text-[var(--hl-reach)] */
export const AegisIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M12 2 L20 6.5 V13 C20 17.5 16.5 20.8 12 22 C7.5 20.8 4 17.5 4 13 V6.5 Z" fill="currentColor" fillOpacity="0.12" />
    <path d="M12 2 L20 6.5 V13 C20 17.5 16.5 20.8 12 22 C7.5 20.8 4 17.5 4 13 V6.5 Z" />
    <path d="M12 6 L16 8.3 V12.5 C16 15 14.2 16.9 12 17.8 C9.8 16.9 8 15 8 12.5 V8.3 Z" strokeWidth="1.4" />
    <circle cx="12" cy="11.6" r="1.6" fill="currentColor" stroke="none" />
  </svg>
);

/** 傳送陷阱（雙端傳送門 + 回溯箭頭） — 預設色：text-[var(--hl-ink-2)] */
export const WarpIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <ellipse cx="6.5" cy="7" rx="3.5" ry="5" fill="currentColor" fillOpacity="0.15" />
    <ellipse cx="6.5" cy="7" rx="3.5" ry="5" />
    <ellipse cx="17.5" cy="17" rx="3.5" ry="5" fill="currentColor" fillOpacity="0.15" />
    <ellipse cx="17.5" cy="17" rx="3.5" ry="5" />
    <path d="M10.5 9.5 C13 11.5 14.5 13 14.2 15" strokeDasharray="2.4 2" />
    <path d="M12.6 13.2 L14.2 15.2 L16.2 13.8" strokeWidth="1.5" />
  </svg>
);

/** 電磁脈衝（盾面裂痕 + 電弧） — 預設色：text-[var(--hl-reach)] */
export const EmpIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M12 3l7 4v5c0 5-3 8-7 9-4-1-7-4-7-9V7z" fill="currentColor" fillOpacity="0.12" />
    <path d="M12 3l7 4v5c0 5-3 8-7 9-4-1-7-4-7-9V7z" />
    <path d="M10 8l2.5 3.5h-2.5L14 17l-1-4h3z" fill="currentColor" fillOpacity="0.25" />
    <path d="M10 8l2.5 3.5h-2.5L14 17l-1-4h3z" />
  </svg>
);

/** 填充火焰 — 預設色：text-[var(--hl-caution)] */
export const FlameIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" fill="currentColor" fillOpacity="0.2" />
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

/** 隕石/流星 — 預設色：text-[var(--hl-caution)] */
export const MeteorIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M3 3l4.5 4.5M3.5 8l2.5 2.5M8 3.5l2.5 2.5" strokeOpacity="0.65" />
    <circle cx="15" cy="15" r="5.5" fill="currentColor" fillOpacity="0.2" />
    <circle cx="15" cy="15" r="5.5" />
    <circle cx="13.4" cy="13.9" r="1" fill="currentColor" stroke="none" fillOpacity="0.5" />
    <circle cx="16.6" cy="16.1" r="0.8" fill="currentColor" stroke="none" fillOpacity="0.5" />
  </svg>
);

/** 預設色：text-teal-400 */
export const TornadoIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M21 4H3M18 8H6M15 12H9M13 16h-2M12 20h0" strokeWidth="2.5" />
  </svg>
);

// ── 操作/工具 ────────────────────────────────────────────────────────
/** 預設色：text-[var(--hl-vital)] */
export const PinIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" fill="currentColor" fillOpacity="0.15" />
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" fill="currentColor" fillOpacity="0.3" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

/** 預設色：text-[var(--hl-vital)] */
export const RobotIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <rect x="3" y="8" width="18" height="12" rx="2" fill="currentColor" fillOpacity="0.1" />
    <rect x="3" y="8" width="18" height="12" rx="2" />
    <rect x="9" y="3" width="6" height="5" rx="1" />
    <path d="M12 3v5" />
    <circle cx="9" cy="14" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="15" cy="14" r="1.5" fill="currentColor" stroke="none" />
    <path d="M9 18h6" />
    <path d="M3 12h-1a1 1 0 0 0 0 2h1M21 12h1a1 1 0 0 0 0 2h-1" />
  </svg>
);

/** 預設色：text-[var(--hl-reach)] */
export const ScalesIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M12 3v18M5 21h14" />
    <path d="M6 8l-4 6h8L6 8zM18 8l-4 6h8l-4-6z" fill="currentColor" fillOpacity="0.15" />
    <path d="M6 8l-4 6h8L6 8zM18 8l-4 6h8l-4-6z" />
  </svg>
);

/** 預設色：text-[var(--hl-alarm)] */
export const SwordsIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
    <path d="M13 19l6-6" />
    <path d="M16 16l4 4" />
    <path d="M19 21l2-2" />
    <path d="M9.5 6.5L11 8l-3 3-1.5-1.5" />
    <path d="M3 3l4.5 4.5M8 3h3l-4.5 4.5" />
  </svg>
);

/** 填充 ↑ — 預設色：text-[var(--hl-reach)] */
export const UpArrowIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M12 19V5M5 12l7-7 7 7" strokeWidth="2.5" />
  </svg>
);

/** 預設色：text-[var(--hl-reach)] */
export const ConstructionIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <rect x="2" y="16" width="20" height="3" rx="1" fill="currentColor" fillOpacity="0.15" />
    <rect x="2" y="16" width="20" height="3" rx="1" />
    <rect x="8" y="3" width="8" height="13" rx="1" fill="currentColor" fillOpacity="0.1" />
    <rect x="8" y="3" width="8" height="13" rx="1" />
    <path d="M8 7h8M8 11h8" />
  </svg>
);

/** 預設色：text-nordic-muted */
export const EditIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" fill="currentColor" fillOpacity="0.1" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

/** 預設色：text-slate-400 */
export const SkipForwardIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <polygon points="5 4 15 12 5 20 5 4" fill="currentColor" fillOpacity="0.15" />
    <polygon points="5 4 15 12 5 20 5 4" />
    <line x1="19" y1="5" x2="19" y2="19" />
  </svg>
);

/** 預設色：text-[var(--hl-caution)] */
export const HourglassIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M5 4h14M5 20h14M17 4v3l-5 5 5 5v3M7 4v3l5 5-5 5v3" />
    <path d="M7 7h10M7 17h10" fill="currentColor" fillOpacity="0.15" />
  </svg>
);

/** 填充 ▶ — 預設色：text-[var(--hl-vital)] */
export const PlayIcon = (p: IconProps) => (
  <svg {...f(p)}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

/** 預設色：text-[var(--hl-caution)] */
export const PauseIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <rect x="6" y="4" width="4" height="16" fill="currentColor" fillOpacity="0.2" />
    <rect x="14" y="4" width="4" height="16" fill="currentColor" fillOpacity="0.2" />
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);

/** 預設色：text-[var(--hl-alarm)] */
export const DoorExitIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

/** 預設色：text-[var(--hl-reach)] */
export const RefreshIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

/** 預設色：text-[var(--hl-vital)] */
export const PlusIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2.5" />
    <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2.5" />
  </svg>
);

/** 預設色：text-[var(--hl-alarm)] */
export const CrossIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" />
    <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" />
  </svg>
);

/** 填充 ✓ — 預設色：text-[var(--hl-vital)] */
export const CheckIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <polyline points="20 6 9 17 4 12" strokeWidth="2.5" />
  </svg>
);

/** 預設色：text-[var(--hl-caution)] */
export const WarningIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="currentColor" fillOpacity="0.1" />
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

/** 預設色：text-[var(--hl-alarm)] */
export const TrashIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" fill="currentColor" fillOpacity="0.1" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

/** 預設色：text-[var(--hl-caution)] */
export const LightbulbIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M9 18h6M10 22h4" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" fill="currentColor" fillOpacity="0.1" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
  </svg>
);

// ── 統計/覆蓋層 ──────────────────────────────────────────────────────
/** 預設色：text-[var(--hl-vital)] */
export const CelebrationIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76z" fill="currentColor" fillOpacity="0.1" />
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76z" />
    <path d="M9 12l2 2 4-4" strokeWidth="2" />
  </svg>
);

/** 填充閃耀 — 預設色：text-[var(--hl-caution)] */
export const SparklesIcon = (p: IconProps) => (
  <svg {...f(p)} viewBox="0 0 24 24">
    <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" fill="currentColor" />
    <path d="M4 14l1.2 3.6h3.8l-3 2.4 1.2 3.6-3-2.4-3 2.4 1.2-3.6-3-2.4h3.8z" fill="currentColor" opacity="0.5" />
    <path d="M17 8l0.9 2.7h2.9l-2.3 1.8 0.9 2.7-2.3-1.8-2.3 1.8 0.9-2.7-2.3-1.8h2.9z" fill="currentColor" opacity="0.5" />
  </svg>
);

/** 預設色：text-[var(--hl-reach)] */
export const TowerIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M6 20V4h12v16M6 20h12" />
    <path d="M6 4V2M10 4V2M14 4V2M18 4V2" />
    <path d="M9 9h6M9 14h6" />
    <rect x="9" y="16" width="6" height="4" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

/** 預設色：text-[var(--hl-vital)] */
export const MapIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" fill="currentColor" fillOpacity="0.1" />
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </svg>
);

/** 預設色：text-[var(--hl-vital)] */
export const ChartIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <line x1="18" y1="20" x2="18" y2="10" strokeWidth="3" />
    <line x1="12" y1="20" x2="12" y2="4" strokeWidth="3" />
    <line x1="6" y1="20" x2="6" y2="14" strokeWidth="3" />
    <line x1="2" y1="20" x2="22" y2="20" />
  </svg>
);

/** 預設色：text-[var(--hl-caution)] */
export const NotepadIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M11 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" fill="currentColor" fillOpacity="0.15" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

/** 預設色：text-[var(--hl-alarm)] */
export const AlienIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <ellipse cx="12" cy="11" rx="8" ry="7" fill="currentColor" fillOpacity="0.1" />
    <ellipse cx="12" cy="11" rx="8" ry="7" />
    <path d="M8 11c0 2.5 1.5 4 4 4s4-1.5 4-4" />
    <circle cx="9" cy="9" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="15" cy="9" r="1.5" fill="currentColor" stroke="none" />
    <path d="M12 18v4M8 21l4-3 4 3" />
  </svg>
);

// ── 設定 ─────────────────────────────────────────────────────────────
/** 預設色：text-[var(--hl-reach)] */
export const GlobeIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.08" />
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

/** 預設色：text-slate-300 */
export const MonitorIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <rect x="2" y="3" width="20" height="14" rx="2" fill="currentColor" fillOpacity="0.1" />
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

/** 預設色：text-[var(--hl-reach)] */
export const SpeakerIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fillOpacity="0.15" />
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

/** 預設色：text-[var(--hl-caution)] */
export const BellIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" fill="currentColor" fillOpacity="0.1" />
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

/** 預設色：text-[var(--hl-ink-2)] */
export const MusicNoteIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" fill="currentColor" fillOpacity="0.3" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" fill="currentColor" fillOpacity="0.3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

/** 預設色：text-[var(--hl-ink-2)] */
export const MusicNotesIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" fill="currentColor" fillOpacity="0.3" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" fill="currentColor" fillOpacity="0.3" />
    <circle cx="18" cy="16" r="3" />
    <path d="M9 9l12-2" />
  </svg>
);

/** 預設色：text-slate-400 */
export const SlidersIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);

/** 預設色：text-slate-400 */
export const MouseIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <rect x="5" y="2" width="14" height="20" rx="7" fill="currentColor" fillOpacity="0.08" />
    <rect x="5" y="2" width="14" height="20" rx="7" />
    <line x1="12" y1="2" x2="12" y2="10" />
  </svg>
);

/** 預設色：text-slate-400 */
export const PointerIcon = (p: IconProps) => (
  <svg {...f(p)}>
    <path d="M4 4l7.07 17 2.51-7.39L21 11.07z" />
  </svg>
);

// ── 其他 ─────────────────────────────────────────────────────────────
export const UndoIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M3 7v6h6" />
    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
  </svg>
);

export const RedoIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M21 7v6h-6" />
    <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
  </svg>
);

/** 預設色：text-[var(--hl-caution)] */
export const TimerIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="13" r="8" fill="currentColor" fillOpacity="0.08" />
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2 2" />
    <path d="M9 3h6M12 1v2" />
  </svg>
);

/** 預設色：text-[var(--hl-vital)] */
export const BrainIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.1-4.79A3 3 0 0 1 3.5 8.5a3 3 0 0 1 3-3A2.5 2.5 0 0 1 9.5 2z" fill="currentColor" fillOpacity="0.1" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.1-4.79A3 3 0 0 0 20.5 8.5a3 3 0 0 0-3-3A2.5 2.5 0 0 0 14.5 2z" fill="currentColor" fillOpacity="0.1" />
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.1-4.79A3 3 0 0 1 3.5 8.5a3 3 0 0 1 3-3A2.5 2.5 0 0 1 9.5 2z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.1-4.79A3 3 0 0 0 20.5 8.5a3 3 0 0 0-3-3A2.5 2.5 0 0 0 14.5 2z" />
  </svg>
);

/** 💾 儲存操作 — 預設色：text-nordic-primary */
export const SaveActionIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" fill="currentColor" fillOpacity="0.1" />
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <path d="M17 21v-8H7v8" fill="currentColor" fillOpacity="0.05" />
    <path d="M17 21v-8H7v8" />
    <path d="M7 3v5h8" />
    <circle cx="12" cy="17" r="1.5" fill="currentColor" />
  </svg>
);

export const NextMapIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" fill="currentColor" fillOpacity="0.1" />
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <polyline points="14 10 17 13 14 16" />
    <line x1="9" y1="13" x2="17" y2="13" />
  </svg>
);

export const CrownIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M2 19l2-9 5 6 3-12 3 12 5-6 2 9H2z" fill="currentColor" fillOpacity="0.15" />
    <path d="M2 19l2-9 5 6 3-12 3 12 5-6 2 9H2z" />
  </svg>
);

/** 預設色：text-[var(--hl-reach)] */
export const DiceIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <rect x="2" y="2" width="20" height="20" rx="3" fill="currentColor" fillOpacity="0.1" />
    <rect x="2" y="2" width="20" height="20" rx="3" />
    <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="16" cy="8" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="8" cy="16" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="16" cy="16" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

/** 預設色：text-[var(--hl-reach)] */
export const PuzzleIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M19.5 12h-1a1.5 1.5 0 0 1 0-3h1V6a1 1 0 0 0-1-1h-3v1a1.5 1.5 0 0 1-3 0V5H9a1 1 0 0 0-1 1v3h1a1.5 1.5 0 0 1 0 3H8v4a1 1 0 0 0 1 1h3v-1a1.5 1.5 0 0 1 3 0v1h3a1 1 0 0 0 1-1v-3h-1.5z" fill="currentColor" fillOpacity="0.1" />
    <path d="M19.5 12h-1a1.5 1.5 0 0 1 0-3h1V6a1 1 0 0 0-1-1h-3v1a1.5 1.5 0 0 1-3 0V5H9a1 1 0 0 0-1 1v3h1a1.5 1.5 0 0 1 0 3H8v4a1 1 0 0 0 1 1h3v-1a1.5 1.5 0 0 1 3 0v1h3a1 1 0 0 0 1-1v-3h-1.5z" />
  </svg>
);

/** 金牌 — 預設色：text-[var(--hl-caution)] */
export const MedalIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="14" r="7" fill="currentColor" fillOpacity="0.15" />
    <circle cx="12" cy="14" r="7" />
    <path d="M8.5 4l-2 6h11l-2-6" fill="currentColor" fillOpacity="0.1" />
    <path d="M8.5 4l-2 6h11l-2-6" />
    <polygon points="12 9.5 13.2 12.3 16.2 12.5 14 14.5 14.7 17.5 12 16 9.3 17.5 10 14.5 7.8 12.5 10.8 12.3 12 9.5" fill="currentColor" stroke="none" />
  </svg>
);

/** 緞帶勳章 — 預設色：text-[var(--hl-ink-2)] */
export const RibbonMedalIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="8" r="5" fill="currentColor" fillOpacity="0.15" />
    <circle cx="12" cy="8" r="5" />
    <path d="M8.5 12.5L6 22l6-3 6 3-2.5-9.5" fill="currentColor" fillOpacity="0.1" />
    <path d="M8.5 12.5L6 22l6-3 6 3-2.5-9.5" />
  </svg>
);

/** 禮物 — 預設色：text-[var(--hl-ink-2)] */
export const GiftIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <rect x="3" y="9" width="18" height="12" rx="1" fill="currentColor" fillOpacity="0.1" />
    <rect x="3" y="9" width="18" height="12" rx="1" />
    <path d="M21 9H3V6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v3z" />
    <path d="M12 5v16M8 5a2 2 0 0 1 0-4c2 0 4 4 4 4s-2 4-4 4a2 2 0 0 1 0-4" />
    <path d="M16 5a2 2 0 0 0 0-4c-2 0-4 4-4 4s2 4 4 4a2 2 0 0 0 0-4" />
  </svg>
);

/** 錢袋 — 預設色：text-[var(--hl-caution)] */
export const MoneyBagIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M12 2c-1 0-3 1-3 3s2 3 3 3 3-1 3-3-2-3-3-3z" fill="currentColor" fillOpacity="0.2" />
    <path d="M12 2c-1 0-3 1-3 3s2 3 3 3 3-1 3-3-2-3-3-3z" />
    <path d="M19 14c0 4.42-3.13 8-7 8s-7-3.58-7-8c0-3.87 2.58-7.1 6-7.78V8h2v-.78c3.42.68 6 3.91 6 6.78z" fill="currentColor" fillOpacity="0.15" />
    <path d="M19 14c0 4.42-3.13 8-7 8s-7-3.58-7-8c0-3.87 2.58-7.1 6-7.78V8h2v-.78c3.42.68 6 3.91 6 6.78z" />
    <path d="M12 11v6M10 12.5h3a1 1 0 0 1 0 2h-2a1 1 0 0 0 0 2h3" />
  </svg>
);

/** 下載/匯入 — 預設色：text-[var(--hl-reach)] */
export const DownloadIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

/** 資料夾 — 預設色：text-[var(--hl-caution)] */
export const FolderIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z" fill="currentColor" fillOpacity="0.15" />
    <path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z" />
  </svg>
);

/** 包裹/Mod — 預設色：text-[var(--hl-reach)] */
export const PackageIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M16.5 9.4L7.5 4.21" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" fill="currentColor" fillOpacity="0.1" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

/** 向下箭頭/折疊 — 預設色：text-slate-400 */
export const ChevronDownIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <polyline points="6 9 12 15 18 9" strokeWidth="2.5" />
  </svg>
);

/** 向上箭頭/展開 — 預設色：text-slate-400 */
export const ChevronUpIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <polyline points="6 15 12 9 18 15" strokeWidth="2.5" />
  </svg>
);

/** 向右箭頭/前進 — 預設色：text-slate-400 */
export const ChevronRightIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <polyline points="9 6 15 12 9 18" strokeWidth="2.5" />
  </svg>
);

/** 向左箭頭/後退 — 預設色：text-slate-400 */
export const ChevronLeftIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <polyline points="15 6 9 12 15 18" strokeWidth="2.5" />
  </svg>
);

/** 劍（傷害） — 預設色：text-[var(--hl-alarm)] */
export const SwordIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M14.5 2L20 7.5l-14 14.5-4-4L14.5 2z" fill="currentColor" fillOpacity="0.1" />
    <path d="M14.5 2L20 7.5l-14 14.5-4-4L14.5 2z" />
    <path d="M3 21l4-4" />
    <path d="M12 8l-4 4" />
  </svg>
);

/** 水波（波次） — 預設色：text-[var(--hl-reach)] */
export const WaterWaveIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M2 7c1.5-3 3-4 5-4s3.5 3 5.5 3S16 3 18 3s2.5 1 4 4" strokeWidth="2" />
    <path d="M2 12c1.5-3 3-4 5-4s3.5 3 5.5 3S16 8 18 8s2.5 1 4 4" strokeWidth="2" />
    <path d="M2 17c1.5-3 3-4 5-4s3.5 3 5.5 3S16 13 18 13s2.5 1 4 4" strokeWidth="2" />
  </svg>
);

/** 問號 — 預設色：text-slate-400 */
export const QuestionMarkIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.08" />
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" />
  </svg>
);

/** 勾選方框 — 預設色：text-[var(--hl-vital)] */
export const CheckSquareIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" fillOpacity="0.1" />
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <polyline points="8 12 11 15 16 9" strokeWidth="2.5" />
  </svg>
);

/** 空方框 — 預設色：text-slate-400 */
export const EmptySquareIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
);

/** 建造/施工塔 — 預設色：text-[var(--hl-reach)] */
export const TowerBuildIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M6 22V4h3V2h6v2h3v18" />
    <path d="M6 12h12M6 7h12M10 22v-4h4v4" />
    <path d="M4 22h16" />
  </svg>
);

/** 文件/文章 — 預設色：text-slate-300 */
export const DocumentIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="currentColor" fillOpacity="0.1" />
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="16" y2="17" />
  </svg>
);

/** 📋 複製 */
export const CopyIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

/** 📤 匯入/上傳 */
export const UploadIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

/** 🎯 選擇/準心（精簡） — 預設色：text-[var(--hl-vital)] */
export const CrosshairIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="2" x2="12" y2="6" strokeWidth="2" />
    <line x1="12" y1="18" x2="12" y2="22" strokeWidth="2" />
    <line x1="2" y1="12" x2="6" y2="12" strokeWidth="2" />
    <line x1="18" y1="12" x2="22" y2="12" strokeWidth="2" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

/** ♾️ 無限模式（使用 InfinityIcon 的別名） */
export const EndlessIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M12 12c-2-2.5-4-4-6-4a4 4 0 0 0 0 8c2 0 4-1.5 6-4zm0 0c2 2.5 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.5-6 4z" strokeWidth="2.5" />
  </svg>
);

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

// ── 成就專用圖標 ───────────────────────────────────────────────────────
export const BuildTowerIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="currentColor" fillOpacity="0.1" />
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

export const UpgradeTowerIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <polyline points="13 2 13 9 20 9" />
    <path d="M22 22 12 12" />
    <path d="M12 22 22 12" />
  </svg>
);

export const KillEnemyIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export const CoinsIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h1v4" />
    <path d="M16.71 13.88a6 6 0 1 1-5.3-7.76" />
  </svg>
);

export const ShieldLockIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" fillOpacity="0.1" />
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <rect x="9" y="10" width="6" height="5" rx="1" />
    <path d="M10 10V8a2 2 0 0 1 4 0v2" />
  </svg>
);

export const DangerIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="currentColor" fillOpacity="0.1" />
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);



export const MagicIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

export const SettingsIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.2" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

/** 📑 模板 — 預設色：text-nordic-primary */
export const TemplateIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <rect x="3" y="3" width="18" height="6" rx="2" fill="currentColor" fillOpacity="0.1" />
    <rect x="3" y="3" width="18" height="6" rx="2" />
    <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" fillOpacity="0.1" />
    <rect x="3" y="13" width="8" height="8" rx="2" />
    <rect x="13" y="13" width="8" height="8" rx="2" />
  </svg>
);

/** 🌈 彩虹 — 預設色：text-rainbow */
export const RainbowIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M2 18c2-3 4-5 8-5s6 2 8 5" strokeWidth="2" />
    <path d="M4 14c2-3 4-5 8-5s6 2 8 5" strokeWidth="2" />
    <path d="M6 10c2-3 4-4 8-4s6 1 8 4" strokeWidth="2" />
    <path d="M8 6c2-2 4-3 8-3s6 1 8 3" strokeWidth="2" />
  </svg>
);

/** 🏰 城堡 — 預設色：text-[var(--hl-caution)] */
export const CastleIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M4 22V10l4-6h8l4 6v12H4z" fill="currentColor" fillOpacity="0.1" />
    <path d="M4 22V10l4-6h8l4 6v12H4z" />
    <path d="M2 10h20" />
    <path d="M6 22V14M10 22V16M14 22V16M18 22V14" />
    <path d="M8 6V4M16 6V4" />
    <path d="M6 2h4v4H6zM14 2h4v4h-4z" />
  </svg>
);

/** 🗼 塔 — 預設色：text-[var(--hl-reach)] */
export const TowerIcon2 = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M6 22V8l6-6 6 6v14H6z" fill="currentColor" fillOpacity="0.15" />
    <path d="M6 22V8l6-6 6 6v14H6z" />
    <path d="M12 2v6M6 14h12M9 18h6" />
    <rect x="8" y="10" width="2" height="2" />
    <rect x="11" y="10" width="2" height="2" />
    <rect x="14" y="10" width="2" height="2" />
  </svg>
);

/** 👾 外星人/敵人 — 預設色：text-[var(--hl-vital)] */
export const AlienMonsterIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M12 4c-4 0-7 3-7 7 0 2 1 4 3 5v4h8v-4c2-1 3-3 3-5 0-4-3-7-7-7z" fill="currentColor" fillOpacity="0.15" />
    <path d="M12 4c-4 0-7 3-7 7 0 2 1 4 3 5v4h8v-4c2-1 3-3 3-5 0-4-3-7-7-7z" />
    <circle cx="9" cy="10" r="1" fill="currentColor" />
    <circle cx="15" cy="10" r="1" fill="currentColor" />
    <path d="M8 14h8" />
    <path d="M10 17l2 3 2-3" />
  </svg>
);

/** 🗺️ 地圖 — 預設色：text-[var(--hl-caution)] */
export const MapPinIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="currentColor" fillOpacity="0.15" />
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" fill="currentColor" />
  </svg>
);

/** 📦 箱子 — 預設色：text-[var(--hl-caution)] */
export const PackageBoxIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" fillOpacity="0.15" />
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 7v10c0 1 2 2 10 2s10-1 10-2V7" />
    <path d="M12 22V12M2 7l10 5 10-5" />
  </svg>
);

/** 🏗️ 建造 — 預設色：text-[var(--hl-caution)] */
export const BuildIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" fill="currentColor" fillOpacity="0.15" />
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

/** ▶️ 播放 — 預設色：text-[var(--hl-vital)] */
export const Play2Icon = (p: IconProps) => (
  <svg {...s(p)}>
    <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" fillOpacity="0.2" />
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

/** ⏩ 快轉 — 預設色：text-[var(--hl-vital)] */
export const FastForwardIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <polygon points="5 4 15 12 5 20 5 4" fill="currentColor" fillOpacity="0.2" />
    <polygon points="5 4 15 12 5 20 5 4" />
    <polygon points="13 4 23 12 13 20 13 4" fill="currentColor" fillOpacity="0.2" />
    <polygon points="13 4 23 12 13 20 13 4" />
  </svg>
);

/** ⏪ 倒帶 — 預設色：text-[var(--hl-caution)] */
export const RewindIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <polygon points="19 4 9 12 19 20 19 4" fill="currentColor" fillOpacity="0.2" />
    <polygon points="19 4 9 12 19 20 19 4" />
    <polygon points="11 4 1 12 11 20 11 4" fill="currentColor" fillOpacity="0.2" />
    <polygon points="11 4 1 12 11 20 11 4" />
  </svg>
);

/** ⏸️ 暫停 — 預設色：text-[var(--hl-caution)] */
export const Pause2Icon = (p: IconProps) => (
  <svg {...s(p)}>
    <rect x="6" y="4" width="4" height="16" fill="currentColor" fillOpacity="0.2" />
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" fill="currentColor" fillOpacity="0.2" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);

/** ⬆️ 向上 — 預設色：text-[var(--hl-vital)] */
export const UpIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

/** 🏆 獎杯 — 預設色：text-[var(--hl-caution)] */
export const Trophy2Icon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M6 9H4a2 2 0 0 1-2-2V4c0-.6.4-1 1-1h4" />
    <path d="M18 9h2a2 2 0 0 0 2-2V4c0-.6-.4-1-1-1h-4" />
    <path d="M6 1v4M18 1v4" />
    <path d="M12 16v-7l-2 2" />
    <path d="M12 16v-7l2 2" />
    <path d="M4 22h16" />
  </svg>
);

/** 📍 圖釘 — 預設色：text-[var(--hl-alarm)] */
export const PinIcon2 = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="currentColor" fillOpacity="0.15" />
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

/** 💰 金幣 — 預設色：text-[var(--hl-caution)] */
export const MoneyIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.15" />
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

/** ⚔️ 劍交叉 — 預設色：text-[var(--hl-alarm)] */
export const SwordsCrossIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M15 3l4 4-8 8-4-4 8-8z" fill="currentColor" fillOpacity="0.15" />
    <path d="M15 3l4 4-8 8-4-4 8-8z" />
    <path d="M9 21l-4-4 8-8 4 4-8 8z" fill="currentColor" fillOpacity="0.15" />
    <path d="M9 21l-4-4 8-8 4 4-8 8z" />
  </svg>
);

/** ✨ 閃光 — 預設色：text-[var(--hl-caution)] */
export const Sparkle2Icon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M12 3v18M3 12h18" strokeWidth="2.5" />
    <path d="M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" strokeWidth="2" />
  </svg>
);

/** 📈 圖表上升 — 預設色：text-[var(--hl-vital)] */
export const ChartUpIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M23 6l-9.5 9.5-5-5L1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

/** 📊 圖表 — 預設色：text-[var(--hl-reach)] */
export const ChartIcon2 = (p: IconProps) => (
  <svg {...s(p)}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

/** 🛡️ 盾牌 — 預設色：text-[var(--hl-reach)] */
export const Shield2Icon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" fillOpacity="0.15" />
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

/** 🏗️ 建造 — 預設色：text-[var(--hl-caution)] */
export const Construction2Icon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M2 22h20" />
    <path d="M12 2v10" />
    <path d="M6 12h12" />
    <path d="M6 6h12v6H6z" fill="currentColor" fillOpacity="0.15" />
    <path d="M6 6h12v6H6z" />
    <path d="M4 22v-6h16v6" />
  </svg>
);

/** 👑 皇冠 — 預設色：text-[var(--hl-caution)] */
export const Crown2Icon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M2 17l3-7 5 4 2-6 2 6 5-4 3 7H2z" fill="currentColor" fillOpacity="0.15" />
    <path d="M2 17l3-7 5 4 2-6 2 6 5-4 3 7H2z" />
    <line x1="2" y1="22" x2="22" y2="22" />
  </svg>
);

/** 🎯 目標 — 預設色：text-[var(--hl-alarm)] */
export const Target2Icon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1" />
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

/** 🧩 拼圖 — 預設色：text-[var(--hl-ink-2)] */
export const PuzzleIcon2 = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.228-.968-.452-.12-.184-.176-.408-.164-.644.011-.236.076-.455.19-.646a2.1 2.1 0 0 1 .57-.454c.178-.088.388-.112.61-.069.222.043.424.143.595.297.17.154.306.348.401.571.095.223.135.468.117.722-.018.254-.087.503-.204.734-.117.231-.278.436-.476.608-.199.172-.424.295-.665.365-.241.07-.497.086-.753.045a1.11 1.11 0 0 1-.657-.227c-.175-.103-.327-.237-.45-.4a1.47 1.47 0 0 1-.285-.591c-.062-.232-.077-.478-.045-.724.032-.245.114-.482.242-.699.128-.217.297-.405.499-.555.202-.15.435-.248.686-.289.25-.04.507-.01.752.09.245.1.467.247.656.434.19.188.336.42.434.685.098.266.138.553.118.84-.02.288-.096.567-.227.822-.13.256-.308.482-.525.668-.217.186-.466.33-.735.427a1.47 1.47 0 0 1-.76.153 1.09 1.09 0 0 1-.626-.17c-.2-.108-.377-.248-.52-.415a2.1 2.1 0 0 1-.33-.608c-.093-.244-.137-.504-.13-.766.007-.261.05-.517.126-.757.076-.24.185-.463.322-.658.137-.195.3-.37.48-.518.181-.148.383-.27.598-.361.215-.091.443-.15.672-.174a1.2 1.2 0 0 1 .602.067z" />
  </svg>
);

/** 🎖️ 獎牌 — 預設色：text-[var(--hl-caution)] */
export const MedalIcon2 = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M12 2l3 7h7l-5.5 5 2 7.5L12 16l-6.5 5.5 2-7.5L2 9h7l3-7z" fill="currentColor" fillOpacity="0.15" />
    <path d="M12 2l3 7h7l-5.5 5 2 7.5L12 16l-6.5 5.5 2-7.5L2 9h7l3-7z" />
  </svg>
);

/** 🎵 音符 — 預設色：text-[var(--hl-ink-2)] */
export const MusicNoteIcon2 = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" fill="currentColor" fillOpacity="0.2" />
    <circle cx="18" cy="16" r="3" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

/** 🎼 樂譜 — 預設色：text-[var(--hl-reach)] */
export const MusicNotesIcon2 = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M9 18V5l12-2v13" />
    <path d="M9 9v10M21 7v10" />
    <circle cx="6" cy="18" r="2" fill="currentColor" fillOpacity="0.2" />
    <circle cx="18" cy="16" r="2" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

/** 🎮 遊戲 — 預設色：text-[var(--hl-reach)] */
export const GameControllerIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <rect x="2" y="6" width="20" height="12" rx="2" fill="currentColor" fillOpacity="0.15" />
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="6" cy="10" r="1" fill="currentColor" />
    <circle cx="8" cy="14" r="1" fill="currentColor" />
    <circle cx="16" cy="14" r="1" fill="currentColor" />
    <path d="M15 8h2M16 7v2" />
  </svg>
);

/** 🗡️ 匕首 — 預設色：text-slate-400 */
export const DaggerIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M16 4l-8 16 2-8 8-2-2-6z" fill="currentColor" fillOpacity="0.2" />
    <path d="M16 4l-8 16 2-8 8-2-2-6z" />
    <path d="M14 2h2v2h-2z" />
  </svg>
);

/** 💣 炸彈 — 預設色：text-slate-500 */
export const BombIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="14" r="8" fill="currentColor" fillOpacity="0.15" />
    <circle cx="12" cy="14" r="8" />
    <path d="M12 6v2M10 4h4" />
    <path d="M15 3l2 2-1 1" />
  </svg>
);

/** 💎 寶石 — 預設色：text-[var(--hl-reach)] */
export const GemIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M6 3h12l4 6-10 12L2 9l4-6z" fill="currentColor" fillOpacity="0.15" />
    <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
    <path d="M2 9h20M6 3v6l4 6M18 3v6l-4 6" />
  </svg>
);

/** 🌀 漩渦 — 預設色：text-[var(--hl-ink-2)] */
export const SwirlIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M12 3c-1.5 3-2 5-2 7s2 4 4 5c2-1 3-3 3-5s-1-4-2-7c-1 3-2 5-2 7s1 3 3 4c2-1 3-2 3-4s-1-4-2-7" strokeWidth="1.5" />
    <path d="M12 12c-1 2-1 3-1 5s1 3 2 4c2-1 2-2 2-4s0-4-1-6" strokeWidth="1.5" />
  </svg>
);

/** ⛈️ 暴風雨 — 預設色：text-slate-400 */
export const StormIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9" />
    <polyline points="13 11 9 17 15 17 11 23" />
  </svg>
);

/** 🌩️ 閃電 — 預設色：text-[var(--hl-caution)] */
export const Lightning2Icon = (p: IconProps) => (
  <svg {...s(p)}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" fillOpacity="0.2" />
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

/** 🌪️ 龍捲風 — 預設色：text-slate-400 */
export const Tornado2Icon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M4 4c0 4 2 8 4 8M8 6c0 4 2 8 4 8M12 8c0 4 2 6 4 6M16 10c0 4 2 6 4 6" strokeWidth="1.5" />
    <path d="M4 20h16" />
  </svg>
);

/** 🕷️ 蜘蛛 — 預設色：text-slate-600 */
export const SpiderIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="10" r="6" fill="currentColor" fillOpacity="0.15" />
    <circle cx="12" cy="10" r="6" />
    <path d="M6 4l1 6M18 4l-1 6M4 10l2-2M20 10l-2-2M8 6l-1 4M16 6l1 4" />
    <path d="M12 16v4" />
  </svg>
);

/** 🐍 蛇 — 預設色：text-[var(--hl-vital)] */
export const SnakeIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M4 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0M4 10c2-2 4-2 6 0s4 2 6 0M4 6c2-2 4-2 6 0s4 2 6 0" strokeWidth="1.5" />
  </svg>
);

/** 🦂 蠍子 — 預設色：text-[var(--hl-alarm)] */
export const ScorpionIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M12 4c-4 0-6 2-6 6 0 2 1 4 3 5 1 0 2 1 3 1s2-1 3-1c2-1 3-3 3-5 0-4-2-6-6-6z" fill="currentColor" fillOpacity="0.15" />
    <path d="M12 4c-4 0-6 2-6 6 0 2 1 4 3 5 1 0 2 1 3 1s2-1 3-1c2-1 3-3 3-5 0-4-2-6-6-6z" />
    <path d="M9 15l-3 6M15 15l3 6" />
  </svg>
);

/** 👹 惡魔 — 預設色：text-[var(--hl-alarm)] */
export const DemonIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M12 3c-3 0-6 3-6 7 0 3 2 5 4 6v4h4v-4c2-1 4-3 4-6 0-4-3-7-6-7z" fill="currentColor" fillOpacity="0.15" />
    <path d="M12 3c-3 0-6 3-6 7 0 3 2 5 4 6v4h4v-4c2-1 4-3 4-6 0-4-3-7-6-7z" />
    <path d="M8 9l2 2-2 2M16 9l-2 2 2 2" />
    <path d="M10 17h4" />
  </svg>
);

/** 👻 幽靈 — 預設色：text-slate-400 */
export const GhostIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M12 2c-5 0-9 4-9 9v9h18v-9c0-5-4-9-9-9z" fill="currentColor" fillOpacity="0.15" />
    <path d="M12 2c-5 0-9 4-9 9v9h18v-9c0-5-4-9-9-9z" />
    <path d="M3 20c0-3 2-5 5-5h8c3 0 5 2 5 5" />
    <circle cx="9" cy="9" r="1.5" fill="currentColor" />
    <circle cx="15" cy="9" r="1.5" fill="currentColor" />
  </svg>
);

/** 🐜 螞蟻 — 預設色：text-[var(--hl-caution)] */
export const AntIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="6" r="3" fill="currentColor" fillOpacity="0.15" />
    <circle cx="12" cy="6" r="3" />
    <ellipse cx="12" cy="12" rx="4" ry="3" fill="currentColor" fillOpacity="0.15" />
    <ellipse cx="12" cy="12" rx="4" ry="3" />
    <ellipse cx="12" cy="17" rx="3" ry="2" fill="currentColor" fillOpacity="0.15" />
    <ellipse cx="12" cy="17" rx="3" ry="2" />
  </svg>
);

/** ☠️ 死亡 — 預設色：text-slate-600 */
export const SkullCrossbonesIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M12 4c-4 0-7 3-7 7 0 3 2 5 4 6v3" fill="currentColor" fillOpacity="0.15" />
    <path d="M12 4c-4 0-7 3-7 7 0 3 2 5 4 6v3" />
    <path d="M8 11h8M8 14h8" />
    <path d="M2 22l20-6" />
    <path d="M22 22l-20-6" />
  </svg>
);

/** 🔗 鏈接 — 預設色：text-slate-400 */
export const LinkIcon2 = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

/** 🔧 工具 — 預設色：text-slate-400 */
export const Wrench2Icon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

/** 🧪 試管 — 預設色：text-[var(--hl-vital)] */
export const TestTubeIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M6 2v6l4 8a4 4 0 1 0 4 0V2" fill="currentColor" fillOpacity="0.15" />
    <path d="M6 2v6l4 8a4 4 0 1 0 4 0V2" />
    <line x1="6" y1="2" x2="18" y2="2" />
  </svg>
);

/** ☣️ 放射性 — 預設色：text-[var(--hl-vital)] */
export const RadioactiveIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="12" r="2" />
    <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z" />
    <path d="M15.7 8.3c1.47-1.48 1.47-3.87 0-5.35-1.47-1.47-3.87-1.47-5.35 0-1.47 1.47-1.47 3.87 0 5.35 1.47 1.47 3.87 1.47 5.35 0Z" />
  </svg>
);

/** 🕳️ 黑洞 — 預設色：text-[var(--hl-ink-2)] */
export const BlackHoleIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1" />
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="5" fill="currentColor" />
  </svg>
);

/** 🌿 草 — 預設色：text-[var(--hl-vital)] */
export const HerbIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M12 22v-8M8 14c-2-2-2-6 0-8M12 14c2-2 2-6 0-8M16 14c2-2 2-6 0-8" strokeWidth="1.5" />
    <path d="M12 22l-4-4M12 22l4-4" strokeWidth="1.5" />
  </svg>
);

/** 🍀 四葉草 — 預設色：text-[var(--hl-vital)] */
export const CloverIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M12 8c-2-2-2-4 0-4s4 0 4 2c0 2-2 4-4 4z" fill="currentColor" fillOpacity="0.15" />
    <path d="M12 8c-2-2-2-4 0-4s4 0 4 2c0 2-2 4-4 4z" />
    <path d="M8 12c-2 2-4 2-4 0s0-4 2-4c2 0 4 2 4 4z" fill="currentColor" fillOpacity="0.15" />
    <path d="M8 12c-2 2-4 2-4 0s0-4 2-4c2 0 4 2 4 4z" />
    <path d="M12 16c2 2 4 2 4 0s0-4-2-4c-2 0-4 2-4 4z" fill="currentColor" fillOpacity="0.15" />
    <path d="M12 16c2 2 4 2 4 0s0-4-2-4c-2 0-4 2-4 4z" />
    <path d="M16 12c2-2 2-4 0-4s-4 0-4 2c0 2 2 4 4 4z" fill="currentColor" fillOpacity="0.15" />
    <path d="M16 12c2-2 2-4 0-4s-4 0-4 2c0 2 2 4 4 4z" />
  </svg>
);

/** 🪙 金幣 — 預設色：text-[var(--hl-caution)] */
export const Coin2Icon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.15" />
    <circle cx="12" cy="12" r="10" />
    <text x="12" y="16" fontSize="8" textAnchor="middle" fill="currentColor">$</text>
  </svg>
);

/** 💵 鈔票 — 預設色：text-[var(--hl-vital)] */
export const BillIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <rect x="2" y="6" width="20" height="12" rx="2" fill="currentColor" fillOpacity="0.15" />
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="6" cy="12" r="2" />
    <line x1="10" y1="10" x2="18" y2="10" />
    <line x1="10" y1="14" x2="16" y2="14" />
  </svg>
);

/** 🏦 銀行 — 預設色：text-[var(--hl-caution)] */
export const BankIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M3 21h18M5 21V7l7-4 7 4v14M8 21v-6h8v6" fill="currentColor" fillOpacity="0.1" />
    <path d="M3 21h18M5 21V7l7-4 7 4v14M8 21v-6h8v6" />
  </svg>
);

/** 👤 用戶 — 預設色：text-slate-400 */
export const UserIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="currentColor" fillOpacity="0.1" />
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

/** 💨 衝刺 — 預設色：text-slate-400 */
export const DashIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
  </svg>
);

/** ⚡ 閃電 — 預設色：text-[var(--hl-caution)] */
export const ZapIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" fillOpacity="0.2" />
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

/** 🌵 仙人掌 — 預設色：text-[var(--hl-vital)] */
export const CactusIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M12 22V8M12 8c-3 0-4-2-4-2M12 8c3 0 4-2 4-2M8 12H4M20 12h-4" strokeWidth="2" />
    <path d="M12 4c0 0-3 2-3 4s3 4 3 4" strokeWidth="2" />
    <ellipse cx="12" cy="8" rx="3" ry="5" fill="currentColor" fillOpacity="0.1" strokeWidth="2" />
  </svg>
);

/** 🌻 向日葵 — 預設色：text-[var(--hl-caution)] */
export const SunflowerIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.3" />
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeWidth="2" />
  </svg>
);

/** 🐲 龍 — 預設色：text-[var(--hl-vital)] */
export const DragonIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M9 20c-3-1-6-4-4-7 1-2 3-2 4-2h4c3 0 6 2 5 5 0 2-2 3-5 4-1 0-2 1-4 0" fill="currentColor" fillOpacity="0.15" />
    <path d="M9 20c-3-1-6-4-4-7 1-2 3-2 4-2h4c3 0 6 2 5 5 0 2-2 3-5 4-1 0-2 1-4 0" />
    <path d="M18 6l-2-2M20 4l-4 2" />
  </svg>
);

/** ⏱️ 計時器 — 預設色：text-slate-400 */
export const Timer2Icon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="13" r="8" fill="currentColor" fillOpacity="0.1" />
    <circle cx="12" cy="13" r="8" />
    <polyline points="12 9 12 13 15 15" />
    <line x1="12" y1="5" x2="12" y2="3" />
  </svg>
);

/** ⌛ 沙漏 — 預設色：text-[var(--hl-caution)] */
export const Hourglass2Icon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M5 22h14M5 2h14M17 22l-5-10-5 10M7 2l5 10 5-10" strokeWidth="1.5" />
    <path d="M5 6h14" />
  </svg>
);

/** 🕰️ 時鐘 — 預設色：text-slate-400 */
export const ClockIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1" />
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

/** 📅 日曆 — 預設色：text-[var(--hl-reach)] */
export const CalendarIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <rect x="3" y="4" width="18" height="18" rx="2" fill="currentColor" fillOpacity="0.1" />
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="16" y1="2" x2="16" y2="6" />
  </svg>
);

/** ⌚ 手錶 — 預設色：text-slate-400 */
export const WatchIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.1" />
    <circle cx="12" cy="12" r="9" />
    <path d="M12 6v6l4 2" />
  </svg>
);

/** 💾 磁碟 — 預設色：text-slate-400 */
export const FloppyDiskIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M4 3h12l4 4v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" fill="currentColor" fillOpacity="0.1" />
    <path d="M4 3h12l4 4v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
    <path d="M8 10h8M8 14h8" />
  </svg>
);

/** 💻 筆電 — 預設色：text-slate-400 */
export const LaptopIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <rect x="2" y="3" width="20" height="14" rx="2" fill="currentColor" fillOpacity="0.1" />
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="2" y1="21" x2="22" y2="21" />
  </svg>
);

/** 🖥️ 螢幕 — 預設色：text-[var(--hl-reach)] */
export const Monitor2Icon = (p: IconProps) => (
  <svg {...s(p)}>
    <rect x="2" y="3" width="20" height="14" rx="2" fill="currentColor" fillOpacity="0.1" />
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

/** 📱 手機 — 預設色：text-slate-400 */
export const SmartphoneIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <rect x="5" y="2" width="14" height="20" rx="2" fill="currentColor" fillOpacity="0.1" />
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <line x1="12" y1="18" x2="12" y2="18" />
  </svg>
);

/** ☁️ 雲 — 預設色：text-slate-400 */
export const CloudIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill="currentColor" fillOpacity="0.15" />
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
  </svg>
);

/** 🌧️ 雨 — 預設色：text-[var(--hl-reach)] */
export const RainIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" fill="currentColor" fillOpacity="0.1" />
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M8 19v2M12 19v2M16 19v2" />
  </svg>
);

/** ❄️ 雪花 — 預設色：text-[var(--hl-reach)] */
export const Snowflake2Icon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07" strokeWidth="2" />
    <path d="M12 6l-1.5-1.5M12 18l-1.5 1.5M6 12l-1.5-1.5M18 12l1.5-1.5" strokeWidth="1.5" />
  </svg>
);

/** 🌨️ 小雪花 — 預設色：text-[var(--hl-reach)] */
export const SnowIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M2 12h20M12 2v20" strokeWidth="2" />
    <path d="M4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07" />
  </svg>
);

/** 🥶 冷 — 預設色：text-[var(--hl-reach)] */
export const ColdFaceIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1" />
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" />
    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" />
  </svg>
);

/** 😎 酷 — 預設色：text-[var(--hl-caution)] */
export const CoolFaceIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1" />
    <circle cx="12" cy="12" r="10" />
    <path d="M8 11l2 2 3-3" />
    <path d="M14 9l2 2" />
  </svg>
);

/** 💀 骨頭 — 預設色：text-slate-300 */
export const BoneIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M4 12h16" strokeWidth="3" />
    <path d="M6 8v8M10 8v8M14 8v8M18 8v8" strokeWidth="3" />
  </svg>
);

/** 🩸 血 — 預設色：text-[var(--hl-alarm)] */
export const BloodIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M12 22c-4 0-7-3-7-7 0-3 2-5 4-6 1-1 2-2 3-3 1 1 2 2 3 3 2 1 4 3 4 6 0 4-3 7-7 7z" fill="currentColor" fillOpacity="0.15" />
    <path d="M12 22c-4 0-7-3-7-7 0-3 2-5 4-6 1-1 2-2 3-3 1 1 2 2 3 3 2 1 4 3 4 6 0 4-3 7-7 7z" />
  </svg>
);

/** 🧬 DNA — 預設色：text-[var(--hl-ink-2)] */
export const DNAIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
    <path d="M12 5c4 0 8 3 8 7M12 19c-4 0-8-3-8-7" />
  </svg>
);

/** 🧠 腦 — 預設色：text-[var(--hl-ink-2)] */
export const BrainIcon2 = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" fill="currentColor" fillOpacity="0.15" />
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2z" />
  </svg>
);

/** 👣 腳印 — 預設色：text-[var(--hl-caution)] */
export const FootprintsIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="6" cy="6" r="2" fill="currentColor" fillOpacity="0.15" />
    <circle cx="6" cy="6" r="2" />
    <ellipse cx="6" cy="15" rx="2" ry="3" fill="currentColor" fillOpacity="0.15" />
    <ellipse cx="6" cy="15" rx="2" ry="3" />
  </svg>
);

/** 🏃 跑步 — 預設色：text-[var(--hl-caution)] */
export const RunIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="13" cy="4" r="2" fill="currentColor" fillOpacity="0.2" />
    <circle cx="13" cy="4" r="2" />
    <path d="M7 20l4-12M10 12l-3 6M16 14l2 4" />
  </svg>
);

/** 🚶 行走 — 預設色：text-slate-400 */
export const WalkIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="16" cy="5" r="2" fill="currentColor" fillOpacity="0.2" />
    <circle cx="16" cy="5" r="2" />
    <path d="M13 21l-4-10M10 11l-4 6" />
  </svg>
);

/** 🛑 停止 — 預設色：text-[var(--hl-alarm)] */
export const StopSignIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

/** ⚠️ 警告 — 預設色：text-[var(--hl-caution)] */
export const Warning2Icon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="currentColor" fillOpacity="0.15" />
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

/** ℹ️ 資訊 — 預設色：text-[var(--hl-reach)] */
export const InfoIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1" />
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="3" />
  </svg>
);

/** ❓ 問號 — 預設色：text-slate-400 */
export const QuestionIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1" />
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="3" />
  </svg>
);

/** ❌ 叉 — 預設色：text-[var(--hl-alarm)] */
export const XIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/** ✅ 勾 — 預設色：text-[var(--hl-vital)] */
export const Check2Icon = (p: IconProps) => (
  <svg {...s(p)}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/** ➕ 加 — 預設色：text-[var(--hl-vital)] */
export const Plus2Icon = (p: IconProps) => (
  <svg {...s(p)}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

/** ➖ 減 — 預設色：text-[var(--hl-alarm)] */
export const MinusIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

/** ✖️ 乘 — 預設色：text-[var(--hl-alarm)] */
export const MultiplyIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <line x1="4" y1="4" x2="20" y2="20" />
    <line x1="20" y1="4" x2="4" y2="20" />
  </svg>
);

/** ➗ 除 — 預設色：text-[var(--hl-reach)] */
export const DivideIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <line x1="4" y1="12" x2="20" y2="12" />
    <circle cx="12" cy="6" r="1.5" fill="currentColor" />
    <circle cx="12" cy="18" r="1.5" fill="currentColor" />
  </svg>
);

/** 🟢 綠點 — 預設色：text-[var(--hl-vital)] */
export const GreenDotIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="12" r="8" fill="currentColor" fillOpacity="0.2" />
    <circle cx="12" cy="12" r="8" />
  </svg>
);

/** 🔴 紅點 — 預設色：text-[var(--hl-alarm)] */
export const RedDotIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="12" r="8" fill="currentColor" fillOpacity="0.2" />
    <circle cx="12" cy="12" r="8" />
  </svg>
);

/** 🟡 黃點 — 預設色：text-[var(--hl-caution)] */
export const YellowDotIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="12" r="8" fill="currentColor" fillOpacity="0.2" />
    <circle cx="12" cy="12" r="8" />
  </svg>
);

/** 🔵 藍點 — 預設色：text-[var(--hl-reach)] */
export const BlueDotIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="12" r="8" fill="currentColor" fillOpacity="0.2" />
    <circle cx="12" cy="12" r="8" />
  </svg>
);

/** ⚫ 黑點 — 預設色：text-slate-600 */
export const BlackDotIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="12" r="8" fill="currentColor" fillOpacity="0.2" />
    <circle cx="12" cy="12" r="8" />
  </svg>
);

/** ⚪ 白點 — 預設色：text-slate-300 */
export const WhiteDotIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="12" r="8" />
  </svg>
);

/** 🟠 橙點 — 預設色：text-[var(--hl-caution)] */
export const OrangeDotIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="12" r="8" fill="currentColor" fillOpacity="0.2" />
    <circle cx="12" cy="12" r="8" />
  </svg>
);

/** 🟣 紫點 — 預設色：text-[var(--hl-ink-2)] */
export const PurpleDotIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="12" r="8" fill="currentColor" fillOpacity="0.2" />
    <circle cx="12" cy="12" r="8" />
  </svg>
);

/** 🟤 棕點 — 預設色：text-[var(--hl-caution)] */
export const BrownDotIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="12" r="8" fill="currentColor" fillOpacity="0.2" />
    <circle cx="12" cy="12" r="8" />
  </svg>
);

/** ⬜ 白方塊 — 預設色：text-slate-200 */
export const WhiteSquareIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
);

/** 🟥 紅方塊 — 預設色：text-[var(--hl-alarm)] */
export const RedSquareIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" fillOpacity="0.2" />
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
);

/** 🟧 橙方塊 — 預設色：text-[var(--hl-caution)] */
export const OrangeSquareIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" fillOpacity="0.2" />
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
);

/** 🟨 黃方塊 — 預設色：text-[var(--hl-caution)] */
export const YellowSquareIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" fillOpacity="0.2" />
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
);

/** 🟩 綠方塊 — 預設色：text-[var(--hl-vital)] */
export const GreenSquareIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" fillOpacity="0.2" />
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
);

/** 🟦 藍方塊 — 預設色：text-[var(--hl-reach)] */
export const BlueSquareIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" fillOpacity="0.2" />
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
);

/** 🟪 紫方塊 — 預設色：text-[var(--hl-ink-2)] */
export const PurpleSquareIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" fillOpacity="0.2" />
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
);

/** 🟫 棕方塊 — 預設色：text-[var(--hl-caution)] */
export const BrownSquareIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" fillOpacity="0.2" />
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
);

/** ⭕ 紅圈 — 預設色：text-[var(--hl-alarm)] */
export const RedCircleIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.2" />
    <circle cx="12" cy="12" r="10" />
  </svg>
);

/** 🔴 實心紅點 */
export const SolidRedDotIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <circle cx="12" cy="12" r="10" fill="currentColor" />
  </svg>
);

/** ⬛ 實心黑方塊 */
export const SolidBlackSquareIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" />
  </svg>
);

/** 🚀 火箭 — 預設色：text-[var(--hl-alarm)] */
export const RocketIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2l.5-.5a5.4 5.4 0 0 0 1 1.5c2.5 2.5 6.5 2.5 9.5-.5s3-7 .5-9.5a5.4 5.4 0 0 0-1.5-1l.5-.5Z" fill="currentColor" fillOpacity="0.15" />
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2l.5-.5a5.4 5.4 0 0 0 1 1.5c2.5 2.5 6.5 2.5 9.5-.5s3-7 .5-9.5a5.4 5.4 0 0 0-1.5-1l.5-.5Z" />
    <path d="M12 8l4 4" />
  </svg>
);

/** ⌨️ 鍵盤 — 預設色：text-slate-400 */
export const KeyboardIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <rect x="2" y="6" width="20" height="12" rx="2" fill="currentColor" fillOpacity="0.15" />
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M18 14h.01M10 14h4" />
  </svg>
);

/** ✏️ 鉛筆 — 預設色：text-[var(--hl-caution)] */
export const PencilIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" fill="currentColor" fillOpacity="0.15" />
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

/** 🔫 槍 — 預設色：text-slate-400 */
export const GunIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M20 7H4c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h2v4c0 1.1.9 2 2 2h2v-4h10c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z" fill="currentColor" fillOpacity="0.15" />
    <path d="M20 7H4c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h2v4c0 1.1.9 2 2 2h2v-4h10c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z" />
    <line x1="8" y1="13" x2="8" y2="17" />
  </svg>
);

/** 🎓 畢業帽 — 預設色：text-[var(--hl-ink-2)] */
export const GraduationCapIcon = (p: IconProps) => (
  <svg {...s(p)}>
    <path d="M22 10L12 5 2 10l10 5 10-5z" fill="currentColor" fillOpacity="0.15" />
    <path d="M22 10L12 5 2 10l10 5 10-5z" />
    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
    <path d="M22 10v7" />
  </svg>
);

// 主題圖標渲染組件 - 根據 icon 參數渲染對應的 SVG
export const ThemeIcon = ({ icon, className = "w-5 h-5" }: { icon: string; className?: string }) => {
  switch (icon) {
    // 主題相關
    case '🚀': return <RocketIcon className={className} />;
    case '💡': return <LightbulbIcon className={className} />;
    case '⌨️': return <KeyboardIcon className={className} />;
    case '📤': return <UploadIcon className={className} />;
    case '📥': return <DownloadIcon className={className} />;
    case '👀': return <EyeIcon className={className} />;
    case '⚙️': return <GearIcon className={className} />;
    case '📝': return <NotepadIcon className={className} />;
    case '✏️': return <PencilIcon className={className} />;
    case '🔍': return <SearchIcon className={className} />;
    case '🔫': return <GunIcon className={className} />;
    case '📖': return <OpenBookIcon className={className} />;
    case '🎓': return <GraduationCapIcon className={className} />;
    case '❤️': return <HeartIcon className={className} />;
    case '💔': return <BrokenHeartIcon className={className} />;
    case '💥': return <ExplosionIcon className={className} />;
    case '❄️': return <SnowflakeIcon className={className} />;
    case '🔥': return <FlameIcon className={className} />;
    case '⭐': return <StarIcon className={className} />;
    case '🎨': return <PaletteIcon className={className} />;
    case '🌊': return <WaterWaveIcon className={className} />;
    case '🎮': return <GamepadIcon className={className} />;
    case '🌙': return <MoonIcon className={className} />;
    case '☀️': return <SunIcon className={className} />;
    case '👁️': return <EyeIcon className={className} />;
    case '🌲': return <TreeIcon className={className} />;
    case '🌅': return <SunriseIcon className={className} />;
    case '💜': return <HeartPurpleIcon className={className} />;
    case '🌸': return <FlowerIcon className={className} />;
    case '🎄': return <ChristmasTreeIcon className={className} />;
    case '🎃': return <PumpkinIcon className={className} />;
    case '🔲': return <SquareIcon className={className} />;
    case '🌈': return <RainbowIcon className={className} />;
    case '🏰': return <CastleIcon className={className} />;
    // 遊戲相關
    case '🗼': return <TowerIcon2 className={className} />;
    case '👾': return <AlienMonsterIcon className={className} />;
    case '🗺️': return <MapPinIcon className={className} />;
    case '📦': return <PackageBoxIcon className={className} />;
    case '🏗️': return <Construction2Icon className={className} />;
    case '▶️': return <Play2Icon className={className} />;
    case '⏩': return <FastForwardIcon className={className} />;
    case '⏪': return <RewindIcon className={className} />;
    case '⏮️': return <RewindIcon className={className} />;
    case '⏭️': return <FastForwardIcon className={className} />;
    case '⏸️': return <Pause2Icon className={className} />;
    case '⏹️': return <StopSignIcon className={className} />;
    case '⬆️': return <UpIcon className={className} />;
    case '⬇️': return <UpIcon className={className} style={{ transform: 'rotate(180deg)' }} />;
    case '⬅️': return <UpIcon className={className} style={{ transform: 'rotate(-90deg)' }} />;
    case '➡️': return <UpIcon className={className} style={{ transform: 'rotate(90deg)' }} />;
    case '🏆': return <Trophy2Icon className={className} />;
    case '📍': return <PinIcon2 className={className} />;
    case '💰': return <MoneyIcon className={className} />;
    case '💵': return <BillIcon className={className} />;
    case '💴': return <MoneyIcon className={className} />;
    case '💶': return <MoneyIcon className={className} />;
    case '💷': return <MoneyIcon className={className} />;
    case '⚔️': return <SwordsCrossIcon className={className} />;
    case '✨': return <Sparkle2Icon className={className} />;
    case '📈': return <ChartUpIcon className={className} />;
    case '📊': return <ChartIcon2 className={className} />;
    case '🛡️': return <Shield2Icon className={className} />;
    case '👑': return <Crown2Icon className={className} />;
    case '🎯': return <Target2Icon className={className} />;
    case '🧩': return <PuzzleIcon2 className={className} />;
    case '🎖️': return <MedalIcon2 className={className} />;
    case '🎵': return <MusicNoteIcon2 className={className} />;
    case '🎼': return <MusicNotesIcon2 className={className} />;
    case '🗡️': return <DaggerIcon className={className} />;
    case '💣': return <BombIcon className={className} />;
    case '💎': return <GemIcon className={className} />;
    case '🌀': return <SwirlIcon className={className} />;
    case '⛈️': return <StormIcon className={className} />;
    case '⚡': return <ZapIcon className={className} />;
    case '🌩️': return <Lightning2Icon className={className} />;
    case '🌪️': return <Tornado2Icon className={className} />;
    case '🕷️': return <SpiderIcon className={className} />;
    case '🐍': return <SnakeIcon className={className} />;
    case '🦂': return <ScorpionIcon className={className} />;
    case '👹': return <DemonIcon className={className} />;
    case '👻': return <GhostIcon className={className} />;
    case '🐜': return <AntIcon className={className} />;
    case '☠️': return <SkullCrossbonesIcon className={className} />;
    case '🔗': return <LinkIcon2 className={className} />;
    case '🔧': return <Wrench2Icon className={className} />;
    case '⚒️': return <Wrench2Icon className={className} />;
    case '🔨': return <Wrench2Icon className={className} />;
    case '🧨': return <BombIcon className={className} />;
    case '🔷': return <GemIcon className={className} />;
    case '💠': return <GemIcon className={className} />;
    case '🧪': return <TestTubeIcon className={className} />;
    case '☣️': return <RadioactiveIcon className={className} />;
    case '🕳️': return <BlackHoleIcon className={className} />;
    // 自然相關
    case '🌿': return <HerbIcon className={className} />;
    case '🌱': return <HerbIcon className={className} />;
    case '🍀': return <CloverIcon className={className} />;
    case '🪙': return <Coin2Icon className={className} />;
    case '🏦': return <BankIcon className={className} />;
    case '👤': return <UserIcon className={className} />;
    case '💨': return <DashIcon className={className} />;
    case '🌵': return <CactusIcon className={className} />;
    case '🌻': return <SunflowerIcon className={className} />;
    case '🐲': return <DragonIcon className={className} />;
    // 時間相關
    case '⏱️': return <Timer2Icon className={className} />;
    case '⏲️': return <Timer2Icon className={className} />;
    case '⏳': return <Hourglass2Icon className={className} />;
    case '🕰️': return <ClockIcon className={className} />;
    case '📅': return <CalendarIcon className={className} />;
    case '⌚': return <WatchIcon className={className} />;
    // 科技相關
    case '💾': return <FloppyDiskIcon className={className} />;
    case '💻': return <LaptopIcon className={className} />;
    case '🖥️': return <Monitor2Icon className={className} />;
    case '📱': return <SmartphoneIcon className={className} />;
    // 天氣相關
    case '☁️': return <CloudIcon className={className} />;
    case '🌧️': return <RainIcon className={className} />;
    case '🌨️': return <SnowIcon className={className} />;
    case '🥶': return <ColdFaceIcon className={className} />;
    // 其他
    case '😎': return <CoolFaceIcon className={className} />;
    case '💀': return <SkullIcon className={className} />;
    case '🩸': return <BloodIcon className={className} />;
    case '🧬': return <DNAIcon className={className} />;
    case '🧠': return <BrainIcon2 className={className} />;
    case '👣': return <FootprintsIcon className={className} />;
    case '🏃': return <RunIcon className={className} />;
    case '🚶': return <WalkIcon className={className} />;
    // 符號
    case '⚠️': return <Warning2Icon className={className} />;
    case 'ℹ️': return <InfoIcon className={className} />;
    case '❓': return <QuestionIcon className={className} />;
    case '❌': return <XIcon className={className} />;
    case '✅': return <Check2Icon className={className} />;
    case '➕': return <Plus2Icon className={className} />;
    case '➖': return <MinusIcon className={className} />;
    case '✖️': return <MultiplyIcon className={className} />;
    case '➗': return <DivideIcon className={className} />;
    case '↩️': return <UndoIcon className={className} />;
    case '🔄': return <RefreshIcon className={className} />;
    // 顏色點
    case '🟢': return <GreenDotIcon className={className} />;
    case '🔴': return <RedDotIcon className={className} />;
    case '🟡': return <YellowDotIcon className={className} />;
    case '🔵': return <BlueDotIcon className={className} />;
    case '⚫': return <BlackDotIcon className={className} />;
    case '⚪': return <WhiteDotIcon className={className} />;
    case '🟠': return <OrangeDotIcon className={className} />;
    case '🟣': return <PurpleDotIcon className={className} />;
    case '🟤': return <BrownDotIcon className={className} />;
    // 方塊
    case '⬜': return <WhiteSquareIcon className={className} />;
    case '🟥': return <RedSquareIcon className={className} />;
    case '🟧': return <OrangeSquareIcon className={className} />;
    case '🟨': return <YellowSquareIcon className={className} />;
    case '🟩': return <GreenSquareIcon className={className} />;
    case '🟦': return <BlueSquareIcon className={className} />;
    case '🟪': return <PurpleSquareIcon className={className} />;
    case '🟫': return <BrownSquareIcon className={className} />;
    case '⭕': return <RedCircleIcon className={className} />;
    case '⬛': return <SolidBlackSquareIcon className={className} />;
    // 特殊
    case '🤖': return <RobotIcon className={className} />;
    case '🎒': return <PackageBoxIcon className={className} />;
    case '🛠️': return <Wrench2Icon className={className} />;
    case '🔬': return <TestTubeIcon className={className} />;
    case '🔭': return <EyeIcon className={className} />;
    case '🧭': return <EyeIcon className={className} />;
    case '🎲': return <DiceIcon className={className} />;
    case '🎰': return <DiceIcon className={className} />;
    case '🗝️': return <LockIcon className={className} />;
    case '🔑': return <LockIcon className={className} />;
    case '🪞': return <BoxIcon className={className} />;
    case '🎬': return <Monitor2Icon className={className} />;
    case '🏖️': return <SunIcon className={className} />;
    case '🌃': return <MoonIcon className={className} />;
    case '🍬': return <PackageBoxIcon className={className} />;
    case '✈️': return <PackageBoxIcon className={className} />;
    case '🐣': return <StarIcon className={className} />;
    case '🧙': return <UserIcon className={className} />;
    case '💪': return <StarIcon className={className} />;
    case '🏋️': return <StarIcon className={className} />;
    case '🧗': return <TreeIcon className={className} />;
    case '🚴': return <RunIcon className={className} />;
    case '🏊': return <WaterWaveIcon className={className} />;
    case '🎪': return <BoxIcon className={className} />;
    case '🎢': return <BoxIcon className={className} />;
    case '🎡': return <BoxIcon className={className} />;
    case '🎠': return <BoxIcon className={className} />;
    case '🏟️': return <CastleIcon className={className} />;
    case '🏛️': return <CastleIcon className={className} />;
    case '⛩️': return <CastleIcon className={className} />;
    case '⛲': return <WaterWaveIcon className={className} />;
    case '⛺': return <BoxIcon className={className} />;
    case '🗿': return <BoxIcon className={className} />;
    case '🗽': return <UserIcon className={className} />;
    case '🌋': return <FlameIcon className={className} />;
    case '🗻': return <TreeIcon className={className} />;
    case '🌁': return <CloudIcon className={className} />;
    case '🌌': return <StarIcon className={className} />;
    case '🌠': return <StarIcon className={className} />;
    case '🎇': return <Sparkle2Icon className={className} />;
    case '🎆': return <Sparkle2Icon className={className} />;
    case '🌛': return <MoonIcon className={className} />;
    case '🌜': return <MoonIcon className={className} />;
    case '🌝': return <MoonIcon className={className} />;
    case '🌚': return <MoonIcon className={className} />;
    case '🌕': return <MoonIcon className={className} />;
    case '🌖': return <MoonIcon className={className} />;
    case '🌗': return <MoonIcon className={className} />;
    case '🌘': return <MoonIcon className={className} />;
    case '🌑': return <MoonIcon className={className} />;
    case '🌒': return <MoonIcon className={className} />;
    case '🌓': return <MoonIcon className={className} />;
    case '🌔': return <MoonIcon className={className} />;
    default: return <span className={`text-lg ${className}`}>{icon}</span>;
  }
};
