import { createContext, useContext } from 'react';
import { motion } from 'framer-motion';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { sectionMatches } from '@/data/devSearch';
import { Deck } from '@/components/hl';

export type Accent = 'cyan' | 'emerald' | 'purple' | 'violet' | 'amber' | 'rose' | 'white';

const accentTextMap: Record<Accent, string> = {
  cyan: 'text-[var(--arc-reach)]',
  emerald: 'text-[var(--arc-vital)]',
  purple: 'text-[var(--arc-ink-2)]',
  violet: 'text-[var(--cn-grape-deep)]',
  amber: 'text-[var(--arc-caution)]',
  rose: 'text-[var(--arc-alert)]',
  white: 'text-[var(--arc-ink-2)]',
};

// ============================================================
// 搜尋上下文 — DevPanel 提供當前搜尋字串，子層 DevSection 自行過濾
// ============================================================

interface DevSearchContextValue {
  query: string;
}

export const DevSearchContext = createContext<DevSearchContextValue>({ query: '' });
const useDevSearch = () => useContext(DevSearchContext);

// ============================================================
// 區塊群組 — 用於把多個 DevSection 收攏到一個邏輯分組底下
// ============================================================

export const DevGroup = ({ label, icon, accent = 'white', children }: {
  label: string;
  icon?: React.ReactNode;
  accent?: Accent;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2 px-1 pt-1">
      <hr className={`arc-divider flex-1`} />
      {icon && <span className={accentTextMap[accent]}>{icon}</span>}
      <span className={`text-[9px] font-black tracking-[0.3em] uppercase ${accentTextMap[accent]}`}>
        {label}
      </span>
      <hr className={`arc-divider flex-1`} />
    </div>
    <div className="space-y-3">
      {children}
    </div>
  </div>
);

// ============================================================
// 區塊容器（參考 ModManager 的卡片風格）
// ============================================================

export const DevSection = ({ title, icon, children, accent = 'white', keywords }: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  accent?: Accent;
  keywords?: string[];
}) => {
  const { query } = useDevSearch();
  if (!sectionMatches(title, keywords, query)) return null;

  return (
    <Deck className="overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[var(--cn-line-soft)] flex items-center gap-2 bg-[var(--arc-deck-2)]">
        {icon && <span className={accentTextMap[accent]}>{icon}</span>}
        <span className="text-[11px] font-extrabold tracking-widest text-[var(--arc-ink)]/85 uppercase">{title}</span>
      </div>
      <div className="p-3 space-y-2">
        {children}
      </div>
    </Deck>
  );
};

// ============================================================
// 開關
// ============================================================

export const DevToggle = ({ icon, label, value, onChange, accent = 'cyan' }: {
  icon?: React.ReactNode;
  label: string;
  value: boolean;
  onChange: () => void;
  accent?: 'cyan' | 'emerald' | 'purple' | 'violet' | 'amber' | 'rose';
}) => {
  const accentMap = {
    cyan: 'bg-[rgba(111,140,255,0.12)] text-[var(--arc-reach)]/90 border-[rgba(111,140,255,0.38)]',
    emerald: 'bg-[rgba(56,224,143,0.12)] text-[var(--arc-vital)]/90 border-[rgba(56,224,143,0.38)]',
    purple: 'bg-[var(--cn-grape-soft)] text-[var(--arc-ink-2)]/90 border-[var(--arc-line-strong)]',
    violet: 'bg-[var(--cn-grape-soft)] text-[var(--cn-grape-deep)] border-[var(--cn-grape)]/40',
    amber: 'bg-[rgba(255,182,39,0.12)] text-[var(--arc-caution)]/90 border-[rgba(255,182,39,0.38)]',
    rose: 'bg-[rgba(255,61,113,0.12)] text-[var(--arc-alert)]/90 border-[rgba(255,61,113,0.38)]',
  };

  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-full flex items-center gap-2.5 px-3 py-2  transition-all border ${
        value
          ? accentMap[accent]
          : 'bg-[var(--arc-deck-2)] border-[var(--cn-line-soft)] text-[var(--arc-ink-3)] hover:bg-[var(--arc-deck-2)] hover:text-[var(--arc-ink)]'
      }`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="flex-1 text-left text-[11px] font-bold tracking-widest uppercase">{label}</span>
      <div className={`w-9 h-5  transition-colors relative flex-shrink-0 ${
        value ? 'bg-[var(--arc-deck-3)]' : 'bg-[var(--arc-deck-3)]'
      }`}>
        <div
          className="w-3.5 h-3.5  bg-[var(--arc-ink)] absolute top-0.5 "
          style={{ transform: `translateX(${value ? 18 : 4}px)`, transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </div>
    </button>
  );
};

// ============================================================
// 動作按鈕
// ============================================================

export const DevButton = ({ icon, label, onClick, variant = 'default', disabled, title }: {
  icon?: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'danger' | 'warning' | 'success';
  disabled?: boolean;
  title?: string;
}) => {
  const variantMap = {
    default: 'bg-[var(--arc-deck-2)] hover:bg-[var(--arc-deck-3)] text-[var(--arc-ink-2)] border-[var(--cn-line-soft)]',
    primary: 'bg-[rgba(111,140,255,0.12)] hover:bg-[rgba(111,140,255,0.12)] text-[var(--arc-reach)]/90 border-[rgba(111,140,255,0.38)]',
    success: 'bg-[rgba(56,224,143,0.12)] hover:bg-[rgba(56,224,143,0.12)] text-[var(--arc-vital)]/90 border-[rgba(56,224,143,0.38)]',
    warning: 'bg-[rgba(255,182,39,0.12)] hover:bg-[rgba(255,182,39,0.12)] text-[var(--arc-caution)]/90 border-[rgba(255,182,39,0.38)]',
    danger: 'bg-[rgba(255,61,113,0.12)] hover:bg-[rgba(255,61,113,0.12)] text-[var(--arc-alert)]/90 border-[rgba(255,61,113,0.38)]',
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      whileTap={disabled ? {} : { scale: 0.97 }}
      className={`w-full flex items-center justify-center gap-2 px-3 py-2  border text-[11px] font-bold tracking-widest uppercase transition-all ${
        disabled
          ? 'bg-[var(--arc-deck-2)] border-[var(--cn-line-soft)] text-[var(--arc-ink-4)] cursor-not-allowed'
          : variantMap[variant]
      }`}
    >
      {icon}
      <span>{label}</span>
    </motion.button>
  );
};

// ============================================================
// 數字輸入框（含 ± 微調與快速鍵）
// ============================================================

export const DevNumberInput = ({ label, value, onChange, min, max, step = 1, suffix }: {
  label?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) => {
  const clamp = (v: number) => {
    let next = v;
    if (typeof min === 'number') next = Math.max(min, next);
    if (typeof max === 'number') next = Math.min(max, next);
    return next;
  };

  return (
    <div className="flex items-center gap-2">
      {label && (
        <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--arc-ink-4)]">
          {label}
        </span>
      )}
      {/* 原生 input 重畫：1px 細框、5px 圓角、加減鍵獨立 hover，數字用等寬字 */}
      <div className="flex min-w-0 flex-1 items-center overflow-hidden rounded-[5px] border border-[var(--arc-line)] bg-[var(--arc-deck-2)]">
        <button
          type="button"
          onClick={() => onChange(clamp(value - step))}
          aria-label="減"
          className="flex h-7 w-7 shrink-0 items-center justify-center text-[13px] font-bold text-[var(--arc-ink-4)] transition-colors hover:bg-[var(--arc-deck-3)] hover:text-[var(--arc-ink)]"
        >
          −
        </button>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(clamp(Number(e.target.value) || 0))}
          min={min}
          max={max}
          step={step}
          className="min-w-0 flex-1 appearance-none bg-transparent px-1 text-center font-mono text-[11px] font-bold text-[var(--arc-ink)] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        {suffix && (
          <span className="shrink-0 pr-1 font-mono text-[9px] text-[var(--arc-ink-4)]">{suffix}</span>
        )}
        <button
          type="button"
          onClick={() => onChange(clamp(value + step))}
          aria-label="加"
          className="flex h-7 w-7 shrink-0 items-center justify-center text-[13px] font-bold text-[var(--arc-ink-4)] transition-colors hover:bg-[var(--arc-deck-3)] hover:text-[var(--arc-ink)]"
        >
          +
        </button>
      </div>
    </div>
  );
};

// ============================================================
// Select
// ============================================================

export const DevSelect = <T extends string,>({ label, value, onChange, options }: {
  label?: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) => (
  <div className="flex items-center gap-2">
    {label && <span className="text-[10px] font-bold tracking-widest text-[var(--arc-ink-3)] uppercase flex-shrink-0">{label}</span>}
    <CustomSelect<T>
      value={value}
      onChange={onChange}
      options={options}
      variant="filled"
      size="sm"
      position="inline"
      className="flex-1"
    />
  </div>
);

// ============================================================
// 資訊顯示行
// ============================================================

export const DevInfoRow = ({ label, value, color = 'white' }: {
  label: string;
  value: React.ReactNode;
  color?: 'white' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'purple' | 'violet';
}) => {
  const colorMap = {
    white: 'text-[var(--arc-ink)]',
    cyan: 'text-[var(--arc-reach)]/90',
    emerald: 'text-[var(--arc-vital)]/90',
    amber: 'text-[var(--arc-caution)]/90',
    rose: 'text-[var(--arc-alert)]/90',
    purple: 'text-[var(--arc-ink-2)]/90',
    violet: 'text-[var(--cn-grape-deep)]',
  };

  return (
    <div className="flex items-center justify-between text-[11px] font-bold tracking-widest uppercase">
      <span className="text-[var(--arc-ink-4)]">{label}</span>
      <span className={`font-mono ${colorMap[color]}`}>{value}</span>
    </div>
  );
};
