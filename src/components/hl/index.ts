/**
 * HARDLINE 設計語言 · 入口
 *
 * 用法：
 *   import { Deck, Btn, TopBar, Rail, Meter, SegHead } from '@/components/hl';
 *
 * 規則（硬性）：
 *   1. 圓角只有 0。唯一例外是切角，方向只有「左上」與「右下」。
 *   2. 不用陰影、不用 、不用漸層背景。
 *   3. 強調色只有 --hl-signal 一種；其他顏色只能用來表達資料狀態。
 *   4. 數值一律 <Num> 或 font-mono，標籤一律 .hl-label。
 */

export * from './surface';
export * from './controls';
export * from './layout';
export * from './data';
