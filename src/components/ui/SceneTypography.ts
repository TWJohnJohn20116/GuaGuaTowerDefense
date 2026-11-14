/**
 * SceneTypography — HARDLINE 文字層級
 *
 * 全系統只有三種角色：標籤（mono 小字）、內文（sans）、數值（mono 等寬）。
 * 不再用 9–11px 全大寫寬間距當裝飾。
 */

export const SCENE_TYPOGRAPHY = {
  /** 主標題、區塊標題 */
  title: 'text-[13.5px] font-semibold text-[var(--hl-ink)]',
  /** 區段小標 */
  section: 'font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--hl-ink-3)]',
  /** 區段小標（大寫，保留鍵名） */
  sectionUpper: 'font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--hl-ink-3)]',
  /** 卡片標籤、欄位名 */
  label: 'font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--hl-ink-3)]',
  /** 副文 */
  caption: 'text-[11px] text-[var(--hl-ink-3)]',
  /** 次要說明、日期 */
  captionMuted: 'text-[10.5px] text-[var(--hl-ink-4)]',
  /** 內文、列表副文 */
  body: 'text-[12.5px] leading-relaxed text-[var(--hl-ink-2)]',
  /** 數值（一般） */
  value: 'font-mono tabular-nums font-semibold text-[var(--hl-ink)]',
  /** 數值（次要） */
  valueMuted: 'font-mono tabular-nums text-[var(--hl-ink-2)]',
  /** 空狀態 */
  empty: 'text-[11.5px] text-[var(--hl-ink-3)]',
  /** Tab 說明（未選） */
  tabDescIdle: 'text-[10.5px] text-[var(--hl-ink-4)]',
  /** Tab 說明（已選） */
  tabDescActive: 'text-[10.5px] text-[var(--hl-ink-2)]',
  /** 按鈕文字 */
  button: 'text-[11.5px] font-medium text-[var(--hl-ink-2)] hover:text-[var(--hl-ink)]',
  /** 提示、鍵盤說明 */
  hint: 'font-mono text-[10px] text-[var(--hl-ink-4)]',
  /** 篩選按鈕（未選） */
  filterIdle: 'text-[11px] text-[var(--hl-ink-2)]',
  /** 篩選按鈕（已選） */
  filterActive: 'text-[11px] font-semibold text-[var(--hl-signal)]',
  /** 區塊小標 */
  sectionTitle: 'font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--hl-ink-3)]',
  /** 微型標籤 */
  micro: 'text-[11px]',
  /** 欄位標籤 */
  microLabel: 'font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--hl-ink-3)]',
  /** 次要說明 */
  microMuted: 'text-[10.5px] text-[var(--hl-ink-4)]',
} as const;
