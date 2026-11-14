/**
 * 選擇卡外框 — 商店 / 突變挑戰 / 皮膚工坊共用
 *
 * 統一：玻璃底、選中 ring、主題色光暈。
 */
import type React from 'react';
import { motion } from 'framer-motion';
import { SCENE_GLASS } from '@/components/ui/SceneWorkshopLayout';

export interface SelectionCardFrameProps {
  selected: boolean;
  /** 主題色 hex，用於選中 ring 與內光 */
  accent: string;
  onClick: () => void;
  children: React.ReactNode;
  /** 最小高度，預設 172px（與商店卡一致） */
  minHeight?: number;
  /** div 模式：內含其他按鈕時使用（如收藏） */
  as?: 'button' | 'div';
  className?: string;
}

const MOTION_PROPS = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { type: 'spring' as const, stiffness: 420, damping: 28 },
};

function frameClassName(selected: boolean, className: string) {
  return `group relative flex h-full w-full flex-col  border text-left overflow-hidden transition-colors duration-300 ${
    selected ? SCENE_GLASS.selectionActive : SCENE_GLASS.selectionIdle
  } ${className}`;
}

function frameStyle(selected: boolean, accent: string, minHeight: number): React.CSSProperties {
  return {
    minHeight,
    ...(selected
      ? {
          '--tw-ring-color': `${accent}cc`,
          boxShadow: `0 0 20px ${accent}28, inset 0 0 16px ${accent}0d`,
        }
      : {}),
  } as React.CSSProperties;
}

function handleDivKeyDown(e: React.KeyboardEvent, onClick: () => void) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    onClick();
  }
}

export function SelectionCardFrame({
  selected,
  accent,
  onClick,
  children,
  minHeight = 172,
  as = 'button',
  className = '',
}: SelectionCardFrameProps) {
  const shared = {
    onClick,
    className: frameClassName(selected, className),
    style: frameStyle(selected, accent, minHeight),
  };

  if (as === 'div') {
    return (
      <motion.div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => handleDivKeyDown(e, onClick)}
        {...MOTION_PROPS}
        {...shared}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.button type="button" {...MOTION_PROPS} {...shared}>
      {children}
    </motion.button>
  );
}

export default SelectionCardFrame;
