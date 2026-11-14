import type { IconProps } from './base';
import { s } from './base';

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
