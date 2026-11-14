/**
 * 動畫工具庫 - 提供統一的動畫變體和工具函數
 * Animation Utilities - Provides unified animation variants and utility functions
 */

import type { Variants, Transition } from 'framer-motion';

// ============ 基礎過渡配置 ============

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 20,
};

export const smoothTransition: Transition = {
  type: 'tween',
  duration: 0.3,
  ease: 'easeOut',
};

export const bounceTransition: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 15,
};

// ============ 頁面過渡動畫 ============

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const pageSlideLeft: Variants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },
};

export const pageSlideRight: Variants = {
  initial: { opacity: 0, x: -100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 },
};

export const pageFade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// ============ 元素動畫 ============

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
};

export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
};

export const fadeInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
};

// ============ 縮放動畫 ============

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
};

export const scaleUp: Variants = {
  initial: { opacity: 0, scale: 0.5 },
  animate: { opacity: 1, scale: 1 },
};

export const popIn: Variants = {
  initial: { opacity: 0, scale: 0 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: bounceTransition 
  },
};

export const zoomIn: Variants = {
  initial: { opacity: 0, scale: 1.2 },
  animate: { opacity: 1, scale: 1 },
};

// ============ 彈窗/模態動畫 ============

export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 300 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9, 
    y: 20,
    transition: { duration: 0.2 }
  },
};

export const overlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const drawerLeft: Variants = {
  initial: { x: '-100%' },
  animate: { x: 0 },
  exit: { x: '-100%' },
};

export const drawerRight: Variants = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
};

export const drawerBottom: Variants = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
};

// ============ 列表/卡片動畫 ============

export const listContainer: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const listItem: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

export const cardHover = {
  scale: 1.02,
  y: -4,
  transition: springTransition,
};

export const cardTap = {
  scale: 0.98,
};

export const gridContainer: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
    },
  },
};

export const gridItem: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: springTransition,
  },
};

// ============ 按鈕動畫 ============

export const buttonHover = {
  scale: 1.05,
  transition: { type: 'spring', stiffness: 400, damping: 10 },
};

export const buttonTap = {
  scale: 0.95,
};

export const buttonPulse: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const buttonShake: Variants = {
  initial: { x: 0 },
  animate: {
    x: [-2, 2, -2, 2, 0],
    transition: { duration: 0.4 },
  },
};

// ============ 狀態反饋動畫 ============

export const successPop: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: { 
    scale: [0, 1.2, 1],
    opacity: 1,
    transition: { duration: 0.4 }
  },
};

export const errorShake: Variants = {
  initial: { x: 0 },
  animate: {
    x: [-10, 10, -10, 10, -5, 5, 0],
    transition: { duration: 0.5 },
  },
};

export const warningBounce: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-5, 0, -5, 0],
    transition: { duration: 0.4 },
  },
};

// ============ 載入動畫 ============

export const spinAnimation = {
  rotate: 360,
  transition: { duration: 1, repeat: Infinity, ease: 'linear' },
};

export const pulseAnimation = {
  scale: [1, 1.1, 1],
  opacity: [0.7, 1, 0.7],
  transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
};

export const dotPulse = (delay: number) => ({
  scale: [1, 1.3, 1],
  opacity: [0.5, 1, 0.5],
  transition: { duration: 0.8, repeat: Infinity, delay },
});

// ============ 特效動畫 ============

export const glowPulse = (color: string) => ({
  boxShadow: [
    `0 0 10px ${color}40`,
    `0 0 30px ${color}60`,
    `0 0 10px ${color}40`,
  ],
  transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
});

export const floatAnimation = {
  y: [-5, 5, -5],
  transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
};

export const rotateAnimation = {
  rotate: [0, 360],
  transition: { duration: 20, repeat: Infinity, ease: 'linear' },
};

export const shimmerAnimation: Variants = {
  initial: { backgroundPosition: '-200% 0' },
  animate: {
    backgroundPosition: '200% 0',
    transition: { duration: 1.5, repeat: Infinity, ease: 'linear' },
  },
};

// ============ 數字動畫 ============

export const numberCountUp = (_from: number, _to: number) => ({
  initial: { opacity: 0, scale: 0.5 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3 }
  },
});

// ============ 工具函數 ============

/**
 * 創建帶延遲的動畫變體
 */
export const withDelay = (variants: Variants, delay: number): Variants => ({
  ...variants,
  animate: {
    ...(typeof variants.animate === 'object' ? variants.animate : {}),
    transition: {
      ...(typeof variants.animate === 'object' && variants.animate && 'transition' in variants.animate 
        ? (variants.animate as Record<string, unknown>).transition as Record<string, unknown>
        : {}),
      delay,
    },
  },
});

/**
 * 創建交錯動畫的子項延遲
 */
export const staggerDelay = (index: number, baseDelay = 0.05) => ({
  transition: { delay: index * baseDelay },
});

/**
 * 創建隨機延遲
 */
export const randomDelay = (maxDelay = 0.3) => ({
  transition: { delay: Math.random() * maxDelay },
});

/**
 * 組合多個動畫變體
 */
export const combineVariants = (...variants: Variants[]): Variants => {
  return variants.reduce((acc, variant) => ({
    initial: { ...(acc.initial as object), ...(variant.initial as object) },
    animate: { ...(acc.animate as object), ...(variant.animate as object) },
    exit: { ...(acc.exit as object), ...(variant.exit as object) },
  }), { initial: {}, animate: {}, exit: {} });
};

// ============ 預設動畫配置 ============

export const defaultTransition = {
  type: 'spring',
  stiffness: 260,
  damping: 20,
};

export const fastTransition = {
  type: 'tween',
  duration: 0.15,
  ease: 'easeOut',
};

export const slowTransition = {
  type: 'tween',
  duration: 0.5,
  ease: 'easeInOut',
};
