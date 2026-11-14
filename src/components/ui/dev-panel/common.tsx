import { createContext, useContext } from 'react';
import { motion } from 'framer-motion';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { sectionMatches } from '@/data/devSearch';

export type Accent = 'cyan' | 'emerald' | 'purple' | 'violet' | 'amber' | 'rose' | 'white';

const accentTextMap: Record<Accent, string> = {
  cyan: 'text-[var(--hl-reach)]',
  emerald: 'text-[var(--hl-vital)]',
  purple: 'text-[var(--hl-ink-2)]',
  violet: 'text-violet-300',
  amber: 'text-[var(--hl-caution)]',
  rose: 'text-[var(--hl-alarm)]',
  white: 'text-[var(--hl-ink-2)]',
};

// ============================================================
// 搜尋上下文 — DevPanel 提供當前搜尋字串，子層 DevSection 自行過濾
// ============================================================

interface DevSearchContextValue {
  query: string;
}

export const DevSearchContext = createContext<DevSearchContextValue>({ query: '' });
export const useDevSearch = () => useContext(DevSearchContext);

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
      <div className={`h-px flex-1 bg-[var(--hl-deck-2)] from-transparent  to-transparent`} />
      {icon && <span className={accentTextMap[accent]}>{icon}</span>}
      <span className={`text-[9px] font-black tracking-[0.3em] uppercase ${accentTextMap[accent]}`}>
        {label}
      </span>
      <div className={`h-px flex-1 bg-[var(--hl-deck-2)] from-transparent  to-transparent`} />
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
    <div className="bg-[#0e1015]/60   border border-[var(--hl-line)] shadow-[0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[var(--hl-line)] flex items-center gap-2 bg-[var(--hl-deck-2)]">
        {icon && <span className={accentTextMap[accent]}>{icon}</span>}
        <span className="text-[11px] font-extrabold tracking-widest text-[var(--hl-ink)]/85 uppercase">{title}</span>
      </div>
      <div className="p-3 space-y-2">
        {children}
      </div>
    </div>
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
    cyan: 'bg-[rgba(111,168,255,0.12)] text-[var(--hl-reach)]/90 border-[rgba(111,168,255,0.38)]',
    emerald: 'bg-[rgba(56,224,143,0.12)] text-[var(--hl-vital)]/90 border-[rgba(56,224,143,0.38)]',
    purple: 'bg-purple-500/15 text-[var(--hl-ink-2)]/90 border-[var(--hl-line-strong)]',
    violet: 'bg-violet-500/15 text-violet-200/90 border-violet-400/40',
    amber: 'bg-[rgba(255,182,39,0.12)] text-[var(--hl-caution)]/90 border-[rgba(255,182,39,0.38)]',
    rose: 'bg-[rgba(255,75,62,0.12)] text-[var(--hl-alarm)]/90 border-[rgba(255,75,62,0.38)]',
  };

  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-full flex items-center gap-2.5 px-3 py-2  transition-all border ${
        value
          ? accentMap[accent]
          : 'bg-[var(--hl-deck-2)] border-[var(--hl-line)] text-[var(--hl-ink-3)] hover:bg-[var(--hl-deck-2)] hover:text-[var(--hl-ink)]'
      }`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="flex-1 text-left text-[11px] font-bold tracking-widest uppercase">{label}</span>
      <div className={`w-9 h-5  transition-colors relative flex-shrink-0 ${
        value ? 'bg-[var(--hl-deck-4)]' : 'bg-[var(--hl-deck-3)]'
      }`}>
        <div
          className="w-3.5 h-3.5  bg-[var(--hl-ink)] absolute top-0.5 "
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
    default: 'bg-[var(--hl-deck-2)] hover:bg-[var(--hl-deck-3)] text-[var(--hl-ink-2)] border-[var(--hl-line)]',
    primary: 'bg-[rgba(111,168,255,0.12)] hover:bg-[rgba(111,168,255,0.12)] text-[var(--hl-reach)]/90 border-[rgba(111,168,255,0.38)]',
    success: 'bg-[rgba(56,224,143,0.12)] hover:bg-[rgba(56,224,143,0.12)] text-[var(--hl-vital)]/90 border-[rgba(56,224,143,0.38)]',
    warning: 'bg-[rgba(255,182,39,0.12)] hover:bg-[rgba(255,182,39,0.12)] text-[var(--hl-caution)]/90 border-[rgba(255,182,39,0.38)]',
    danger: 'bg-[rgba(255,75,62,0.12)] hover:bg-[rgba(255,75,62,0.12)] text-[var(--hl-alarm)]/90 border-[rgba(255,75,62,0.38)]',
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
          ? 'bg-[var(--hl-deck-2)] border-[var(--hl-line)] text-[var(--hl-ink-4)] cursor-not-allowed'
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
      {label && <span className="text-[10px] font-bold tracking-widest text-[var(--hl-ink-3)] uppercase flex-shrink-0">{label}</span>}
      <div className="flex items-center bg-black/30 border border-[var(--hl-line)]  overflow-hidden flex-1">
        <button
          type="button"
          onClick={() => onChange(clamp(value - step))}
          className="px-2.5 py-1.5 text-[var(--hl-ink-4)] hover:bg-[var(--hl-deck-3)] hover:text-[var(--hl-ink)] transition-colors text-sm font-bold"
        >
          −
        </button>
        <input
          type="number"
          className="flex-1 min-w-0 bg-transparent text-center text-[var(--hl-ink)] text-xs font-mono font-bold px-1 py-1.5 focus:outline-none"
          value={value}
          onChange={(e) => onChange(clamp(Number(e.target.value) || 0))}
          min={min}
          max={max}
          step={step}
        />
        {suffix && <span className="px-2 text-[10px] text-[var(--hl-ink-4)] font-mono">{suffix}</span>}
        <button
          type="button"
          onClick={() => onChange(clamp(value + step))}
          className="px-2.5 py-1.5 text-[var(--hl-ink-4)] hover:bg-[var(--hl-deck-3)] hover:text-[var(--hl-ink)] transition-colors text-sm font-bold"
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
    {label && <span className="text-[10px] font-bold tracking-widest text-[var(--hl-ink-3)] uppercase flex-shrink-0">{label}</span>}
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
    white: 'text-[var(--hl-ink)]',
    cyan: 'text-[var(--hl-reach)]/90',
    emerald: 'text-[var(--hl-vital)]/90',
    amber: 'text-[var(--hl-caution)]/90',
    rose: 'text-[var(--hl-alarm)]/90',
    purple: 'text-[var(--hl-ink-2)]/90',
    violet: 'text-violet-300/90',
  };

  return (
    <div className="flex items-center justify-between text-[11px] font-bold tracking-widest uppercase">
      <span className="text-[var(--hl-ink-4)]">{label}</span>
      <span className={`font-mono ${colorMap[color]}`}>{value}</span>
    </div>
  );
};
