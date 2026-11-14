/**
 * 統一返回按鈕 — HARDLINE
 *
 * 外觀只有一種：方框、1px 線、mono 小字、hover 轉訊號色。
 * 場景不准自己畫箭頭。
 */

import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n';
import type { GameScene } from '@/types/game';
import { playUiHover } from '@/services/audioService';

interface BackButtonProps {
  to?: GameScene;
  label?: string;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  /** 相容參數：HARDLINE 只有一種返回外觀 */
  variant?: 'default' | 'ghost' | 'outline' | 'glass';
  className?: string;
}

export function BackButton({
  to,
  label,
  onClick,
  size = 'md',
  className = '',
}: BackButtonProps) {
  const { t } = useTranslation();
  const setScene = useGameStore((s) => s.setScene);
  const goBackScene = useGameStore((s) => s.goBackScene);

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    if (to) {
      setScene(to);
    } else {
      goBackScene();
    }
  };

  const sizeClasses = {
    sm: 'h-7 px-2 text-[9.5px] gap-1.5',
    md: 'h-9 px-2.5 text-[10px] gap-2',
    lg: 'h-10 px-3 text-[10.5px] gap-2',
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => playUiHover()}
      className={[
        'inline-flex items-center border border-[var(--hl-line-strong)] bg-transparent',
        'font-mono uppercase tracking-[0.12em] text-[var(--hl-ink-2)]',
        'transition-colors duration-150 hover:border-[var(--hl-signal)] hover:text-[var(--hl-signal)]',
        'active:translate-y-px',
        sizeClasses[size],
        className,
      ].join(' ')}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        aria-hidden="true"
      >
        <path d="M15 5 8 12l7 7" />
      </svg>
      <span>{label || t.common.back}</span>
    </button>
  );
}

export default BackButton;
