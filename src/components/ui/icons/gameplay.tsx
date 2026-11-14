import type { IconProps } from './base';
import { f, s } from './base';

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
