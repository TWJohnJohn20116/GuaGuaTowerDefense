/**
 * 暫停圖鑑 · 底部抽屜（覆蓋整個遮罩，不嵌在內容區） */

import { motion } from 'framer-motion';
import type { EncyclopediaDeepLink } from '@/store/gameStoreTypes';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n';
import { BackButton } from '@/components/ui/BackButton';
import { BooksIcon, GearIcon, OpenBookIcon } from '@/components/ui/Icons';
import { getPauseEncyclopediaTabLabel, usePauseEncyclopediaCatalog } from './pauseEncyclopediaData';
import {
 PauseEncEnemyDetail,
 PauseEncTowerDetail,
 PauseEncSkillDetail,
 PauseEncEffectDetail,
} from './pauseEncyclopediaDetails/PauseEncDetails';

interface PauseEncyclopediaSheetProps {
 focus: EncyclopediaDeepLink;
 onClose: () => void;
}

export function PauseEncyclopediaSheet({ focus, onClose }: PauseEncyclopediaSheetProps) {
 const { t } = useTranslation();
 const g = t.game;
 const openEncyclopedia = useGameStore((s) => s.openEncyclopedia);
 const openSettingsFromPause = useGameStore((s) => s.openSettingsFromPause);
 const { allTowers, allEnemies, allStatusEffects } = usePauseEncyclopediaCatalog();
 const selectedEnemy = allEnemies.find((e) => e.id === focus.itemId);
 const selectedTower = allTowers.find((tw) => tw.id === focus.itemId);

 return (
 <motion.div
 key={`${focus.tab}-${focus.itemId}`}
 className="absolute inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-auto"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 >
 <motion.button
 type="button"
 aria-label={g.pauseEncCloseAria}
 className="absolute inset-0 bg-[rgba(6,7,10,0.55)]"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={onClose}
 />

 <motion.div
 role="dialog"
 aria-modal="true"
 aria-label={getPauseEncyclopediaTabLabel(focus.tab, g)}
 className="relative z-[1] w-full sm:max-w-[420px] max-h-[min(88vh,640px)] flex flex-col bg-[#14161c] border border-[var(--hl-line)] (0,0,0,0.5)] sm: sm: overflow-hidden"
 initial={{ y: '100%' }}
 animate={{ y: 0 }}
 exit={{ y: '100%' }}
 transition={{ type: 'spring', damping: 34, stiffness: 380 }}
 onClick={(ev) => ev.stopPropagation()}
 >
 <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
 <div className="w-10 h-1 bg-[var(--hl-deck-4)]"/>
 </div>

 <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--hl-line)] flex-shrink-0">
 <BackButton size="sm"variant="glass"label={g.pauseEncClose} onClick={onClose} />
 <BooksIcon className="w-4 h-4 text-[var(--hl-ink-2)] flex-shrink-0"/>
 <span className="text-xs font-bold text-[var(--hl-ink-2)] tracking-wide truncate">
 {getPauseEncyclopediaTabLabel(focus.tab, g)}
 </span>
 </div>

 <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 py-4">
 {focus.tab === 'enemies' && <PauseEncEnemyDetail enemy={selectedEnemy} />}
 {focus.tab === 'towers' && <PauseEncTowerDetail tower={selectedTower} />}
 {focus.tab === 'skills' && <PauseEncSkillDetail skillId={focus.itemId} />}
 {focus.tab === 'effects' && (
 <PauseEncEffectDetail effectType={focus.itemId} allStatusEffects={allStatusEffects} />
 )}
 </div>

 <div className="flex-shrink-0 px-4 py-3 border-t border-[var(--hl-line)] space-y-2 bg-[rgba(6,7,10,0.55)]">
 <button
 type="button"
 onClick={() => openEncyclopedia(focus)}
 className="w-full py-2.5 bg-[var(--hl-deck-2)] border border-[var(--hl-line)] text-[var(--hl-ink-2)] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[var(--hl-deck-2)] transition-colors"
 >
 <OpenBookIcon className="w-4 h-4"/>
 {g.pauseEncOpenFull}
 </button>
 <button
 type="button"
 onClick={() => openSettingsFromPause()}
 className="w-full py-2 bg-[var(--hl-deck-2)] border border-[var(--hl-line)] text-[var(--hl-ink-3)] text-[11px] font-bold flex items-center justify-center gap-2 hover:bg-[var(--hl-deck-3)] hover:text-[var(--hl-ink-2)] transition-colors"
 >
 <GearIcon className="w-3.5 h-3.5"/>
 {g.pauseEncOpenSettings}
 </button>
 </div>
 </motion.div>
 </motion.div>
 );
}

export default PauseEncyclopediaSheet;
