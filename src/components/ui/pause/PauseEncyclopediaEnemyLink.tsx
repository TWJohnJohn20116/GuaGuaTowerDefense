/**
 * 暫停介面 · 敵人百科連結（圖鑑用，可直接開啟詳情）
 */

import type { EnemyType, TowerType, StatusEffectType } from '@/types/game';
import type { PlayerSkillId } from '@/data/playerSkillData';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n';
import { OpenBookIcon } from '@/components/ui/Icons';
import { IconBtn } from '@/components/hl';
import { playUiHover } from '@/services/audioService';
import { COUNTER_KEY_TO_TOWER } from './pauseNextWaveHints';

const iconBtnClass =
 'inline-flex items-center justify-center w-6 h-6 border border-[var(--arc-line-strong)] bg-[var(--arc-deck-2)] text-[var(--arc-ink-2)] hover:text-[var(--arc-cyan)] hover:bg-[var(--arc-deck-3)] hover:border-[var(--arc-cyan-edge)] transition-colors flex-shrink-0';

function PauseEncyclopediaIconButton({
 title,
 onClick,
 className = '',
}: {
 title: string;
 onClick: () => void;
 className?: string;
}) {
 return (
 <IconBtn
 label={title}
 onClick={onClick}
 onMouseEnter={() => playUiHover()}
 className={`${iconBtnClass} ${className}`}
 >
 <OpenBookIcon className="w-3.5 h-3.5"/>
 </IconBtn>
 );
}

export function PauseEncyclopediaEnemyLink({
 enemyType,
 className = '',
}: {
 enemyType: EnemyType;
 className?: string;
}) {
 const { t } = useTranslation();
 const open = useGameStore((s) => s.openPauseEncyclopedia);
 return (
 <PauseEncyclopediaIconButton
 title={t.game.pauseEncLookupEnemy}
 onClick={() => open({ tab: 'enemies', itemId: enemyType })}
 className={className}
 />
 );
}

export function PauseEncyclopediaTowerLink({
 towerType,
 towerKey,
 className = '',
}: {
 towerType?: TowerType | null;
 towerKey?: string;
 className?: string;
}) {
 const { t } = useTranslation();
 const open = useGameStore((s) => s.openPauseEncyclopedia);
 const resolved = towerType ?? (towerKey ? COUNTER_KEY_TO_TOWER[towerKey] : undefined);
 if (!resolved) return null;
 return (
 <PauseEncyclopediaIconButton
 title={t.game.pauseEncLookupTower}
 onClick={() => open({ tab: 'towers', itemId: resolved })}
 className={className}
 />
 );
}

export function PauseEncyclopediaSkillLink({
 skillId,
 className = '',
}: {
 skillId: PlayerSkillId;
 className?: string;
}) {
 const { t } = useTranslation();
 const open = useGameStore((s) => s.openPauseEncyclopedia);
 return (
 <PauseEncyclopediaIconButton
 title={t.game.pauseEncLookupSkill}
 onClick={() => open({ tab: 'skills', itemId: skillId })}
 className={className}
 />
 );
}

export function PauseEncyclopediaEffectLink({
 effectType,
 className = '',
}: {
 effectType: StatusEffectType;
 className?: string;
}) {
 const { t } = useTranslation();
 const open = useGameStore((s) => s.openPauseEncyclopedia);
 return (
 <PauseEncyclopediaIconButton
 title={t.game.pauseEncLookupEffect}
 onClick={() => open({ tab: 'effects', itemId: effectType })}
 className={className}
 />
 );
}

export default PauseEncyclopediaEnemyLink;
