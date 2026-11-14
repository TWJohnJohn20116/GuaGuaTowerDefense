import type { IconProps } from './base';
import { s } from './base';

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
