import { motion } from 'framer-motion';

/**
 * 統一切換開關（CANDY POP）
 *
 * 圓潤軌道 + 圓形滑塊，開啟時是薄荷綠（＝允許）。與 hl 的 `Toggle` 同一組語意，
 * 只是這個版本吃 framer-motion 做滑塊位移，供設定頁與暫停面板沿用。
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
  // onX 必須扣掉 3px 邊框：軌道 w-11（44px）扣左右各 3px 只剩 38px 內容寬，
  // 滑塊連邊框是 20px，所以位移上限是 18；寫 22 會讓滑塊凸出軌道右緣。
  const dims = {
    sm: { track: 'w-8 h-[18px]', ball: 'w-3 h-3', onX: 8, offX: 3 },
    md: { track: 'w-11 h-[24px]', ball: 'w-4 h-4', onX: 16, offX: 3 },
    lg: { track: 'w-12 h-[28px]', ball: 'w-5 h-5', onX: 16, offX: 3 },
  }[size];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`${dims.track} relative flex-shrink-0 rounded-full border-[3px] transition-colors duration-150 ${
        enabled
          ? 'border-[var(--cn-line)] bg-[var(--cn-mint)]'
          : 'border-[var(--cn-line-mid)] bg-[var(--cn-card-2)]'
      }`}
    >
      <motion.span
        className={`${dims.ball} absolute top-1/2 rounded-full border-2 border-[var(--cn-line)] bg-[var(--cn-card)]`}
        style={{ y: '-50%' }}
        animate={{ x: enabled ? dims.onX : dims.offX }}
        transition={{ duration: 0.14, ease: [0.34, 1.56, 0.64, 1] }}
      />
    </button>
  );
};
