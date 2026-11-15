/**
 * 2D / 3D 視圖切換（棋盤語彙）
 *
 * 位置由 Sidebar 決定（狀態帶左端第一格），不再浮在戰場左上角。
 * 3D 態只用 accent 邊框與 accent 膜，不發光。
 */

import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n';

// 立方體圖標（3D 視圖）
const CubeIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

// 平面網格圖標（2D 視圖）
const GridFlatIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="0" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <line x1="15" y1="3" x2="15" y2="21" />
  </svg>
);

interface ViewModeToggleProps {
  mode: '2d' | '3d';
  onToggle: () => void;
}

export function ViewModeToggle({ mode, onToggle }: ViewModeToggleProps) {
  const { t } = useTranslation();
  const is3d = mode === '3d';
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`pointer-events-auto inline-flex h-8 items-center gap-1.5 rounded-[10px] border-[2px] px-2.5 transition-colors duration-100 ${
        is3d
          ? 'border-[var(--cn-line)] bg-[var(--cn-sun-soft)] text-[var(--cn-ink)]'
          : 'border-[var(--cn-line-soft)] bg-[var(--cn-card)] text-[var(--cn-ink-2)] hover:border-[var(--cn-line)] hover:text-[var(--cn-ink)]'
      }`}
      title={t.game.toggleViewHint}
    >
      <motion.span
        key={mode}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="inline-flex"
      >
        {is3d ? <GridFlatIcon className="h-3.5 w-3.5" /> : <CubeIcon className="h-3.5 w-3.5" />}
      </motion.span>
      <span className="font-mono text-[9.5px] uppercase tracking-[0.08em]">
        {is3d ? t.game.view2dLabel : t.game.view3dLabel}
      </span>
    </button>
  );
}
