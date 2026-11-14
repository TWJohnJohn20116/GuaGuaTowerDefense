import type { IconProps } from './base';
import { f, s } from './base';
import { InfinityIcon } from './ui-basic';

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
