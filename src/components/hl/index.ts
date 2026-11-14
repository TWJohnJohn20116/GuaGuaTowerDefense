/**
 * ARCADE HUD 設計語言 · 入口
 *
 * 用法：
 *   import { Deck, Btn, TopBar, Rail, Meter, SegHead } from '@/components/hl';
 *
 * 規則（硬性）：
 *   1. 形狀語言是斜切（arc-cut-sm）＋小圓角（2–4px），沒有大圓角膠囊。
 *   2. 深度靠「立體鍵厚邊 + 硬陰影 + 內高光」，不用柔霧陰影。
 *   3. 金色 = 行動/收益；青色 = 能量/資訊；紅色 = 警報。其餘色只表達資料狀態。
 *   4. 數值一律 <Num> / .arc-num（粗等寬、自發光）；標籤一律 .arc-label。
 */

export * from './surface';
export * from './controls';
export * from './layout';
export * from './data';
