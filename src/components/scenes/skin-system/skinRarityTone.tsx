/**
 * 皮膚稀有度 · HARDLINE 資料色
 *
 * 稀有度只用「mono 10px 文字標籤 + 資料色」表達，不做彩虹漸層、不做發光邊框。
 * 標籤文字沿用 SKIN_RARITY_CONFIG 的既有文案。
 */
import { SKIN_RARITY_CONFIG } from '@/types/skin';
import type { SkinRarity } from '@/types/skin';

const SKIN_RARITY_TONE: Record<SkinRarity, { label: string; className: string }> = {
  common: { label: SKIN_RARITY_CONFIG.common.label, className: 'text-[var(--hl-ink-3)]' },
  uncommon: { label: SKIN_RARITY_CONFIG.uncommon.label, className: 'text-[var(--hl-ink-2)]' },
  rare: { label: SKIN_RARITY_CONFIG.rare.label, className: 'text-[var(--hl-reach)]' },
  epic: { label: SKIN_RARITY_CONFIG.epic.label, className: 'text-[var(--hl-caution)]' },
  legendary: { label: SKIN_RARITY_CONFIG.legendary.label, className: 'text-[var(--hl-signal)]' },
};

/** 稀有度文字標籤：mono 10px、uppercase、資料色。 */
export function RarityLabel({
  rarity,
  className = '',
}: {
  rarity: SkinRarity;
  className?: string;
}) {
  const tone = SKIN_RARITY_TONE[rarity];
  return (
    <span
      className={['font-mono text-[10px] uppercase tracking-[0.08em]', tone.className, className].join(' ')}
    >
      {tone.label}
    </span>
  );
}
