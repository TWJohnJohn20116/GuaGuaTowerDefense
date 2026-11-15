/**
 * CustomSelect 樣式配置：尺寸 / 風格 / 強調色
 * 從 CustomSelect.tsx 拆出，避免主檔過大（單檔 < 888 行規範）
 */

export type SelectSize = 'sm' | 'md' | 'lg';
export type SelectVariant = 'default' | 'compact' | 'minimal' | 'glass' | 'filled';
export type AccentToken =
  | 'primary' | 'cyan' | 'rose' | 'emerald' | 'amber' | 'purple' | 'white';

// ── 尺寸 ──────────────────────────────────────────────────
export interface SizeStyle {
  trigger: string;
  option: string;
  optIcon: string;
  chevron: string;
  check: string;
  richLabel: string;
}

export const SIZE: Record<SelectSize, SizeStyle> = {
  sm: {
    trigger: 'px-2.5 py-1.5 text-[11px] min-w-[110px] gap-1.5 ',
    option: 'px-2.5 py-2 gap-2 text-[11px]',
    optIcon: 'text-sm',
    chevron: 'w-3 h-3',
    check: 'w-3.5 h-3.5',
    richLabel: 'text-[10px]',
  },
  md: {
    trigger: 'px-3 py-2 text-sm min-w-[130px] gap-2 ',
    option: 'px-3 py-2.5 gap-3 text-sm',
    optIcon: 'text-base',
    chevron: 'w-3.5 h-3.5',
    check: 'w-4 h-4',
    richLabel: 'text-[11px]',
  },
  lg: {
    trigger: 'px-4 py-2.5 text-base min-w-[150px] gap-2.5 ',
    option: 'px-4 py-3 gap-3 text-base',
    optIcon: 'text-lg',
    chevron: 'w-4 h-4',
    check: 'w-5 h-5',
    richLabel: 'text-xs',
  },
};

// ── 風格（控制觸發按鈕與面板背景／邊框）────────────────────
interface VariantStyle {
  trigger: string;
  triggerClosed: string;
  triggerOpen: string;
  menu: string;
}

export const VARIANT: Record<SelectVariant, VariantStyle> = {
  default: {
    trigger: 'border-2 bg-nordic-surface/80 text-nordic-text',
    triggerClosed: 'border-nordic-border/50 hover:border-nordic-border',
    triggerOpen: 'border-nordic-primary  shadow-nordic-primary/20',
    menu: 'bg-nordic-surface/95 border-2 border-nordic-border/50',
  },
  compact: {
    trigger: 'border bg-nordic-surface/70 text-nordic-text',
    triggerClosed: 'border-nordic-border/40 hover:border-nordic-border/70',
    triggerOpen: 'border-nordic-primary/80  shadow-nordic-primary/15',
    menu: 'bg-nordic-surface/95 border border-nordic-border/40',
  },
  minimal: {
    trigger: 'border border-transparent bg-transparent text-nordic-text',
    triggerClosed: 'hover:bg-[var(--arc-deck-2)]',
    triggerOpen: 'bg-[var(--arc-deck-2)] border-[var(--cn-line-soft)]',
    menu: 'bg-[var(--arc-deck)]/95 border-[3px] border-[var(--cn-line-soft)]',
  },
  glass: {
    trigger: 'border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-deck-2)] hover:bg-[var(--arc-deck-3)] text-[var(--arc-ink)]/85',
    triggerClosed: '',
    triggerOpen: 'border-[var(--arc-line-hot)] bg-[var(--arc-deck-3)]',
    menu: 'bg-[var(--arc-deck)]/95 border-[3px] border-[var(--cn-line-soft)]',
  },
  filled: {
    trigger: 'border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)] text-[var(--arc-ink)]',
    triggerClosed: 'hover:border-[var(--arc-line-strong)]',
    triggerOpen: 'border-[rgba(111,140,255,0.38)]  shadow-cyan-500/10',
    menu: 'bg-[var(--arc-deck-2)]/[0.97] border-[3px] border-[var(--cn-line-soft)]',
  },
};

// ── 強調色（控制選中項高亮、勾選徽章、網格卡邊框）──────────
export interface AccentStyle {
  text: string;
  ring: string;
  badge: string;
  rowBg: string;
  glow: string;
  glowSoft: string;
}

export const ACCENT: Record<AccentToken, AccentStyle> = {
  primary: {
    // 用主題的「強調色文字」角色，而不是固定亮橘：亮橘在奶油底只有 2.67:1
    text: 'text-[var(--cn-accent-text)]',
    ring: 'border-nordic-primary/60',
    badge: 'bg-nordic-primary',
    rowBg: 'rgba(96, 165, 250, 0.18)',
    glow: 'rgba(96, 165, 250, 0.4)',
    glowSoft: 'rgba(96, 165, 250, 0.12)',
  },
  cyan: {
    text: 'text-[var(--arc-reach)]',
    ring: 'border-[rgba(111,140,255,0.38)]',
    badge: 'bg-[var(--cn-sky)]',
    rowBg: 'rgba(34, 211, 238, 0.16)',
    glow: 'rgba(6, 182, 212, 0.4)',
    glowSoft: 'rgba(6, 182, 212, 0.12)',
  },
  rose: {
    text: 'text-[var(--arc-alarm)]',
    ring: 'border-[rgba(255,61,113,0.38)]',
    badge: 'bg-[var(--cn-alert)]',
    rowBg: 'rgba(244, 63, 94, 0.16)',
    glow: 'rgba(244, 63, 94, 0.4)',
    glowSoft: 'rgba(244, 63, 94, 0.12)',
  },
  emerald: {
    text: 'text-[var(--arc-vital)]',
    ring: 'border-[rgba(56,224,143,0.38)]',
    badge: 'bg-[var(--cn-mint)]',
    rowBg: 'rgba(16, 185, 129, 0.16)',
    glow: 'rgba(16, 185, 129, 0.4)',
    glowSoft: 'rgba(16, 185, 129, 0.12)',
  },
  amber: {
    text: 'text-[var(--arc-caution)]',
    ring: 'border-[rgba(255,182,39,0.38)]',
    badge: 'bg-[var(--cn-sun)]',
    rowBg: 'rgba(245, 158, 11, 0.16)',
    glow: 'rgba(245, 158, 11, 0.4)',
    glowSoft: 'rgba(245, 158, 11, 0.12)',
  },
  purple: {
    text: 'text-[var(--arc-ink-2)]',
    ring: 'border-[var(--arc-line-strong)]',
    badge: 'bg-[var(--cn-grape)]',
    rowBg: 'rgba(168, 85, 247, 0.16)',
    glow: 'rgba(168, 85, 247, 0.4)',
    glowSoft: 'rgba(168, 85, 247, 0.12)',
  },
  white: {
    text: 'text-[var(--arc-ink)]',
    ring: 'border-[var(--cn-line-soft)]',
    badge: 'bg-[var(--arc-ink)]',
    rowBg: 'rgba(255, 255, 255, 0.12)',
    glow: 'rgba(255, 255, 255, 0.25)',
    glowSoft: 'rgba(255, 255, 255, 0.1)',
  },
};

export const VARIANT_DEFAULT_ACCENT: Record<SelectVariant, AccentToken> = {
  default: 'primary',
  compact: 'primary',
  minimal: 'primary',
  glass: 'white',
  filled: 'cyan',
};

export const HIGHLIGHT_BG = 'rgba(255, 255, 255, 0.07)';
export const TRANSPARENT_BG = 'rgba(0, 0, 0, 0)';
