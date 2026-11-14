/**
 * 暫停戰況 · 技能冷卻 */

import { useEffect, useMemo, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useShopStore } from '@/store/shopStore';
import { PLAYER_SKILLS, type PlayerSkill } from '@/data/playerSkillData';
import type { SVGProps } from 'react';
import { useTranslation } from '@/i18n';
import type { Translations } from '@/i18n';
import { getPlayerSkillName, getPlayerSkillDesc } from '@/i18n/playerSkillLabels';
import { SCENE_TYPOGRAPHY } from '@/components/ui/SceneTypography';
import {
 LightningIcon, SnowflakeIcon, CoinIcon, SwordsIcon, MeteorIcon,
 ChainLightningIcon, HealIcon, AegisIcon, WarpIcon, EmpIcon, SparklesIcon,
} from '@/components/ui/Icons';
import { PauseEncyclopediaSkillLink } from './PauseEncyclopediaEnemyLink';
import { PauseSectionShell } from './PauseSectionShell';

type SkillIconComp = (p: SVGProps<SVGSVGElement> & { className?: string }) => JSX.Element;

const ICON_BY_EFFECT: Record<PlayerSkill['effectKey'], SkillIconComp> = {
 lightning: LightningIcon,
 freeze: SnowflakeIcon,
 cash: CoinIcon,
 inspire: SwordsIcon,
 meteor: MeteorIcon,
 chain: ChainLightningIcon,
 heal: HealIcon,
 aegis: AegisIcon,
 warp: WarpIcon,
 emp: EmpIcon,
};

function formatCooldownMs(ms: number, g: Translations['game']): string {
 if (ms <= 0) return g.pauseSkillReady;
 const sec = Math.ceil(ms / 1000);
 if (sec < 60) return g.pauseSkillSeconds.replace('{sec}', String(sec));
 const min = Math.floor(sec / 60);
 const rem = sec % 60;
 return rem > 0 ? `${min}:${String(rem).padStart(2, '0')}` : g.pauseSkillMinutes.replace('{min}', String(min));
}

function formatDurationMs(ms: number, g: Translations['game']): string {
 if (ms <= 0) return '';
 const sec = Math.ceil(ms / 1000);
 return sec < 60
 ? g.pauseSkillSeconds.replace('{sec}', String(sec))
 : g.pauseSkillMinutes.replace('{min}', String(Math.floor(sec / 60)));
}

export function PauseSkillCooldowns({ embedded = false }: { embedded?: boolean }) {
 const { t } = useTranslation();
 const g = t.game;
 const unlockedSkills = useShopStore((s) => s.unlockedPlayerSkills);
 const playerSkillStates = useGameStore((s) => s.playerSkillStates);
 const mutatorRules = useGameStore((s) => s.mutatorRules);
 const [, setTick] = useState(0);

 useEffect(() => {
 const id = setInterval(() => setTick((n) => n + 1), 200);
 return () => clearInterval(id);
 }, []);

 const skills = useMemo(
 () => PLAYER_SKILLS.filter((s) => unlockedSkills.includes(s.id)),
 [unlockedSkills],
 );

 if (skills.length === 0) {
 const empty = <div className={`text-center text-xs py-4 ${SCENE_TYPOGRAPHY.microMuted}`}>{g.pauseSkillNoUnlock}</div>;
 if (embedded) return empty;
 return null;
 }

 const now = Date.now();
 const skillsDisabled = Boolean(mutatorRules?.skillsDisabled);

 const list = (
 <div className="space-y-2">
 {skills.map((skill) => {
 const state = playerSkillStates[skill.id];
 const lastUsed = state?.lastUsedTime ?? 0;
 const activeUntil = state?.activeUntil ?? 0;
 const elapsed = lastUsed === 0 ? skill.cooldown : now - lastUsed;
 const cdRemaining = lastUsed === 0 ? 0 : Math.max(0, skill.cooldown - elapsed);
 const ready = cdRemaining <= 0 && !skillsDisabled;
 const isActive = activeUntil > now;
 const activeRemaining = isActive ? activeUntil - now : 0;
 const cdRatio = lastUsed === 0 ? 0 : Math.min(1, cdRemaining / skill.cooldown);
 const Icon = ICON_BY_EFFECT[skill.effectKey];

 return (
 <div
 key={skill.id}
 className={`flex items-center gap-3 p-2.5 border ${
 isActive
 ? 'bg-[var(--hl-deck-2)] border-[var(--hl-line)]'
 : ready
 ? 'bg-[var(--hl-deck-2)] border-[var(--hl-line)]'
 : 'bg-[rgba(6,7,10,0.55)] border-[var(--hl-line)]'
 }`}
 >
 <div
 className="w-9 h-9 flex items-center justify-center border border-[var(--hl-line)] flex-shrink-0"
 style={{ backgroundColor: `${skill.iconColor}18` }}
 >
 <Icon className="w-4 h-4"style={{ color: skill.iconColor }} />
 </div>

 <div className="flex-1 min-w-0">
 <div className="flex items-center justify-between gap-2 mb-1">
 <div className="flex items-center gap-1.5 min-w-0">
 <span className="text-[11px] font-bold text-[var(--hl-ink)]/85 truncate">
 {getPlayerSkillName(skill, t)}
              <span className="text-[var(--hl-ink-4)] font-normal ml-1.5">[{skill.hotkey}]</span>
 </span>
 <PauseEncyclopediaSkillLink skillId={skill.id} />
 </div>
 <span
 className={`text-[10px] font-bold font-mono tabular-nums flex-shrink-0 ${
 isActive
 ? 'text-[var(--hl-ink-2)]'
 : ready
 ? 'text-[var(--hl-vital)]'
 : 'text-[var(--hl-caution)]'
 }`}
 >
 {isActive
 ? g.pauseSkillActive.replace('{duration}', formatDurationMs(activeRemaining, g))
 : formatCooldownMs(cdRemaining, g)}
 </span>
 </div>
 <div className="h-1.5 bg-[var(--hl-deck-3)] overflow-hidden">
 <div
 className={`h-full transition-all ${
 isActive ? 'bg-[var(--hl-deck-2)]' : ready ? 'bg-[var(--hl-deck-2)]' : 'bg-[var(--hl-deck-2)]'
 }`}
 style={{
 width: isActive
 ? `${skill.duration ? (activeRemaining / skill.duration) * 100 : 100}%`
 : `${(1 - cdRatio) * 100}%`,
 }}
 />
 </div>
 <div className={`${SCENE_TYPOGRAPHY.microMuted} mt-1 truncate`}>{getPlayerSkillDesc(skill, t)}</div>
 </div>
 </div>
 );
 })}
 </div>
 );

 const footer = (
 <div className={`mt-2 ${SCENE_TYPOGRAPHY.microMuted} text-center`}>
 {g.pauseSkillPauseHint}
 </div>
 );

 if (embedded) {
 return (
 <>
 {skillsDisabled && (
 <div className={`mb-2 ${SCENE_TYPOGRAPHY.micro} text-[var(--hl-alarm)] font-bold px-2 py-1 bg-[var(--hl-deck-2)] border border-[var(--hl-line)] text-center`}>
 {g.pauseSkillDisabled}
 </div>
 )}
 {list}
 {footer}
 </>
 );
 }

 return (
 <PauseSectionShell
 title={g.pauseSkillStatus}
 icon={<SparklesIcon className="h-5 w-5"/>}
 accent="purple"
 action={
 skillsDisabled ? (
 <span className={` border border-[var(--hl-line)] bg-[var(--hl-deck-2)] px-2 py-0.5 ${SCENE_TYPOGRAPHY.micro} font-bold text-[var(--hl-alarm)]`}>
 {g.pauseSkillDisabled}
 </span>
 ) : undefined
 }
 >
 {list}
 {footer}
 </PauseSectionShell>
 );
}

export default PauseSkillCooldowns;
