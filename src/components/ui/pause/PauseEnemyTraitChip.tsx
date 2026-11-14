/**
 * 暫停介面 · 敵人特性標籤（單一狀態，滑過可看說明） */

import type { EnemyType } from '@/types/game';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n';
import { playUiHover } from '@/services/audioService';
import type { EnemyTraitTag } from './pauseEnemyTraits';

const TRAIT_TONE_CLASS: Record<EnemyTraitTag['tone'], string> = {
 armor: 'bg-[var(--arc-deck-2)] text-[var(--arc-ink-2)] border-[var(--cn-line-soft)] hover:bg-[var(--arc-deck-2)]',
 shield: 'bg-[var(--arc-deck-2)] text-[var(--arc-reach)] border-[var(--cn-line-soft)] hover:bg-[var(--arc-deck-2)]',
 special: 'bg-[var(--arc-deck-2)] text-[var(--arc-ink-2)] border-[var(--cn-line-soft)] hover:bg-[var(--arc-deck-2)]',
 debuff: 'bg-[var(--arc-deck-2)] text-[var(--arc-caution)] border-[var(--cn-line-soft)] hover:bg-[var(--arc-deck-2)]',
};

interface PauseEnemyTraitChipProps {
 tag: EnemyTraitTag;
 enemyType: EnemyType;
}

export function PauseEnemyTraitChip({ tag, enemyType }: PauseEnemyTraitChipProps) {
 const { t } = useTranslation();
 const openPauseEncyclopedia = useGameStore((s) => s.openPauseEncyclopedia);

 return (
 <button
 type="button"
 onClick={() => openPauseEncyclopedia({ tab: 'enemies', itemId: enemyType })}
 onMouseEnter={() => playUiHover()}
 className={`text-[10px] px-2 py-0.5 border font-medium inline-flex items-center gap-1 transition-colors ${TRAIT_TONE_CLASS[tag.tone]}`}
 title={t.game.pauseEncViewEnemy}
 >
 {tag.text}
 </button>
 );
}

export default PauseEnemyTraitChip;
