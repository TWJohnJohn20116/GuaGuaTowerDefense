import type { Transition } from 'framer-motion';

/**
 * HUD 動效節奏（單一來源）
 *
 * 所有面板的進出場都吃這組，避免每個元件自創時長與曲線——
 * 這是「絲滑」的前提：同一種動作在任何地方都一樣快、一樣收。
 *
 * 原則：
 *   1. 進場用 spring（有重量感），退場一律短 fade（不要拖）。
 *   2. 只動 transform 與 opacity，不動 width/height/top/left（會 reflow）。
 *   3. 快速回饋（hover／按下）用 100–120ms；面板切換 180–220ms。
 */
export const EASE_OUT: [number, number, number, number] = [0.22, 0.9, 0.3, 1];

/** 面板 / 浮層進場：有重量但不拖泥帶水 */
export const SPRING_SOFT: Transition = { type: 'spring', stiffness: 420, damping: 32, mass: 0.7 };

/** 小元件（標籤、按鈕）進場：更脆更快 */
export const SPRING_SNAPPY: Transition = { type: 'spring', stiffness: 640, damping: 34, mass: 0.5 };

/** 數字與標籤換值：短淡入 */
export const FADE_FAST: Transition = { duration: 0.12, ease: EASE_OUT };

/** 退場一律比進場快 */
export const FADE_OUT: Transition = { duration: 0.09, ease: EASE_OUT };

/** 彈出：從標籤位置飛到畫面中央，帶輕微回彈（iOS 感） */
export const SPRING_POP: Transition = { type: 'spring', stiffness: 380, damping: 24, mass: 0.8 };

/** 清單逐項進場的間隔 */
export const STAGGER_STEP = 0.022;
