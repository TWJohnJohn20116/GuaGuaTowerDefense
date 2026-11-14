import { motion } from 'framer-motion';

/**
 * 統一切換開關（CANDY POP）
 *
 * 造型：墨線膠囊軌道 + 純白圓球，球不做墨線圓環。
 * 先前版本球帶 2px 墨線環，跟軌道的 3px 墨線邊框黏在一起，
 * 放大看會變成「甜甜圈貼在膠囊邊上」，讀不出是開關。
 *
 * 位移用 flex 對齊（justify-start / justify-end）＋ framer 的 layout 動畫，
 * 不用 absolute + translateX(固定像素)：軌道有 3px 邊框，手算 offset 少扣一次就會溢出。
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
  // 軌道高度 −（2 × 3px 邊框）要留給球的直徑 + 上下各 2px 呼吸
  const dims = {
    sm: { track: 'w-9 h-[24px]', ball: 'w-3 h-3' },
    md: { track: 'w-[46px] h-[28px]', ball: 'w-4 h-4' },
    lg: { track: 'w-[52px] h-[32px]', ball: 'w-5 h-5' },
  }[size];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={[
        dims.track,
        'relative flex shrink-0 items-center rounded-full border-[3px] border-[var(--cn-line)] px-[3px]',
        'transition-colors duration-150',
        enabled
          ? 'justify-end bg-[var(--cn-mint)]'
          : 'justify-start bg-[var(--cn-line-mid)]',
      ].join(' ')}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 520, damping: 34 }}
        className={`${dims.ball} shrink-0 rounded-full border border-[var(--cn-line)] bg-[var(--cn-card)] shadow-[0_2px_0_rgba(46,36,64,0.18)]`}
      />
    </button>
  );
};
