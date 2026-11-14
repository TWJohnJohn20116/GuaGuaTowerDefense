import { motion } from 'framer-motion';

/**
 * 統一切換開關（HARDLINE）
 *
 * 方形軌道 + 方形滑塊，只走訊號色。activeColor 保留給舊呼叫端，不再改變配色。
 */
export const ToggleSwitch = ({
  enabled,
  onToggle,
  size = 'md',
  activeColor: _activeColor = 'primary',
}: {
  enabled: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
  activeColor?: 'primary' | 'orange' | 'purple' | 'green' | 'cyan' | 'blue' | 'yellow';
}) => {
  const dims = {
    sm: { track: 'w-7 h-4', ball: 'w-2.5 h-2.5', onX: 12, offX: 2 },
    md: { track: 'w-9 h-[18px]', ball: 'w-3 h-3', onX: 18, offX: 2 },
    lg: { track: 'w-11 h-[22px]', ball: 'w-4 h-4', onX: 22, offX: 2 },
  }[size];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`${dims.track} relative flex-shrink-0 border transition-colors duration-150 ${
        enabled
          ? 'border-[var(--hl-signal)] bg-[var(--hl-signal)]'
          : 'border-[var(--hl-line-strong)] bg-[var(--hl-void-2)]'
      }`}
    >
      <motion.span
        className={`${dims.ball} absolute top-1/2 ${
          enabled ? 'bg-[var(--hl-signal-ink)]' : 'bg-[var(--hl-ink-3)]'
        }`}
        style={{ y: '-50%' }}
        animate={{ x: enabled ? dims.onX : dims.offX }}
        transition={{ duration: 0.12, ease: [0.2, 0.8, 0.2, 1] }}
      />
    </button>
  );
};
