/**
 * 暫停圖鑑 · 敵人詳情（條列數值、技能、天賦）
 */

import type { StatusEffectType } from '@/types/game';
import type { PlayerSkillId } from '@/data/playerSkillData';
import { PLAYER_SKILL_BY_ID } from '@/data/playerSkillData';
import { STATUS_EFFECTS } from '@/data/gameData';
import EnemyPreview from '@/components/ui/EnemyPreview';
import TowerPreview from '@/components/ui/TowerPreview';
import { SCENE_TYPOGRAPHY } from '@/components/ui/SceneTypography';
import {
 HeartIcon, LightningIcon, TargetIcon, TowerIcon,
} from '@/components/ui/Icons';
import type { UnifiedEnemy, UnifiedTower } from '@/components/scenes/encyclopedia/EncyclopediaTypes';
import {
 getAbilityKey, getEnemyCounterTowers, getEncyclopediaTowerSpecials,
} from '@/components/scenes/encyclopedia/EncyclopediaTypes';
import { getPlayerSkillIcon } from '@/components/scenes/encyclopedia/EncyclopediaIcons';
import { getStatusEffectIcon } from '@/components/scenes/encyclopedia/EncyclopediaIcons';
import { TowerSynergyList } from '@/components/scenes/encyclopedia/TowerSynergyList';
import { useTranslation } from '@/i18n';
import type { Translations } from '@/i18n';
import { getPlayerSkillName, getPlayerSkillDesc } from '@/i18n/playerSkillLabels';

function towerCategoryLabel(g: Translations['game'], category: string): string {
 if (category === 'basic') return g.pauseEncCategoryBasic;
 if (category === 'special') return g.pauseEncCategorySpecial;
 return 'MOD';
}

function StatPill({
 label,
 value,
 tone = 'text-[var(--hl-ink)]/85',
}: {
 label: string;
 value: string | number;
 tone?: string;
}) {
 return (
 <div className="bg-[rgba(6,7,10,0.55)] border border-[var(--hl-line)] px-3 py-2 text-center">
 <div className={`${SCENE_TYPOGRAPHY.microMuted} uppercase tracking-wider`}>{label}</div>
 <div className={`text-sm font-bold font-mono ${tone}`}>{value}</div>
 </div>
 );
}

function SectionBlock({
 title,
 icon,
 children,
}: {
 title: string;
 icon?: React.ReactNode;
 children: React.ReactNode;
}) {
 return (
 <section className="border border-[var(--hl-line)] bg-[rgba(6,7,10,0.55)] p-3 space-y-2">
 <div className={`${SCENE_TYPOGRAPHY.microLabel} text-[var(--hl-ink)]/45 flex items-center gap-1.5`}>
 {icon}
 {title}
 </div>
 {children}
 </section>
 );
}

export function PauseEncEnemyDetail({ enemy }: { enemy: UnifiedEnemy | undefined }) {
 const { t } = useTranslation();
 const g = t.game;
 const e = t.encyclopedia;
 if (!enemy) {
 return <EmptyHint text={g.pauseEncEnemyNotFound} />;
 }

 const counters = getEnemyCounterTowers(enemy).slice(0, 4);
 const abilityKey = getAbilityKey(enemy.ability);

 return (
 <div className="space-y-3">
 <header className="flex items-center gap-3">
 <div
 className="w-14 h-14 border border-[var(--hl-line)] flex items-center justify-center flex-shrink-0"
 style={{ backgroundColor: `${enemy.color}22` }}
 >
 <EnemyPreview enemyId={enemy.id} color={enemy.color} size={40} />
 </div>
 <div className="min-w-0 flex-1">
 <h3 className="text-lg font-bold text-[var(--hl-ink)] truncate">{enemy.name}</h3>
 <p className="text-[11px] text-[var(--hl-ink-3)] leading-snug line-clamp-2">{enemy.description}</p>
 </div>
 </header>

 <div className="grid grid-cols-4 gap-2">
 <StatPill label={g.pauseEncStatHealth} value={enemy.health} tone="text-[var(--hl-alarm)]"/>
 <StatPill label={g.pauseEncStatSpeed} value={`${enemy.speed}x`} tone="text-[var(--hl-reach)]"/>
 <StatPill label={g.pauseEncStatReward} value={`$${enemy.reward}`} tone="text-[var(--hl-caution)]"/>
 <StatPill label={g.pauseEncStatSize} value={`${enemy.size}px`} tone="text-[var(--hl-vital)]"/>
 </div>

 {enemy.ability && (
 <SectionBlock title={e.detailSpecialAbility} icon={<LightningIcon className="w-3 h-3 text-[var(--hl-ink-2)]"/>}>
 <p className="text-xs text-[var(--hl-ink-2)] leading-relaxed">
 {abilityKey ? e.abilities[abilityKey] : enemy.ability}
 </p>
 </SectionBlock>
 )}

 <SectionBlock title={e.detailRecommendedCounters} icon={<TowerIcon className="w-3 h-3 text-[var(--hl-reach)]"/>}>
 <div className="space-y-1.5">
 {counters.map((c) => (
 <div
 key={`${c.towerKey}-${c.reasonKey}`}
 className="flex items-center gap-2 text-[11px] bg-[rgba(6,7,10,0.55)] border border-[var(--hl-line)] px-2.5 py-1.5"
 >
 <span className="font-bold text-[var(--hl-reach)] flex-shrink-0">{t.towers.types[c.towerKey]}</span>
 <span className="text-[var(--hl-ink-3)] truncate">{e.counterReasons[c.reasonKey]}</span>
 </div>
 ))}
 </div>
 </SectionBlock>
 </div>
 );
}

function calcDps(tower: UnifiedTower) {
 if (tower.damagePerSecond) return tower.damagePerSecond;
 if (tower.damage && tower.fireRate) return Math.round(tower.damage * tower.fireRate * 10) / 10;
 return tower.damage || 0;
}

export function PauseEncTowerDetail({ tower }: { tower: UnifiedTower | undefined }) {
 const { t } = useTranslation();
 const g = t.game;
 const e = t.encyclopedia;
 if (!tower) {
 return <EmptyHint text={g.pauseEncTowerNotFound} />;
 }

 const specials = getEncyclopediaTowerSpecials(tower);
 const dps = calcDps(tower);

 return (
 <div className="space-y-3">
 <header className="flex items-center gap-3">
 <div className="w-14 h-14 border border-[var(--hl-line)] bg-[rgba(6,7,10,0.55)] flex items-center justify-center flex-shrink-0">
 <TowerPreview towerId={tower.id} color={tower.isModContent ? tower.color : undefined} size={44} />
 </div>
 <div className="min-w-0 flex-1">
 <h3 className="text-lg font-bold text-[var(--hl-ink)] truncate">{tower.name}</h3>
 <p className="text-[11px] text-[var(--hl-ink-3)] leading-snug line-clamp-2">{tower.description}</p>
 </div>
 </header>

 <div className="grid grid-cols-3 gap-2">
 <StatPill label={g.pauseEncStatDamage} value={tower.damage ?? '-'} tone="text-[var(--hl-alarm)]"/>
 <StatPill label={e.detailDps} value={dps} tone="text-[var(--hl-caution)]"/>
 <StatPill label={g.pauseEncStatRange} value={tower.range} tone="text-[var(--hl-reach)]"/>
 <StatPill label={g.pauseEncStatFireRate} value={tower.fireRate ? `${tower.fireRate}/s` : '-'} />
 <StatPill label={g.pauseEncStatCost} value={`$${tower.cost}`} tone="text-[var(--hl-caution)]"/>
 <StatPill label={g.pauseEncStatCategory} value={towerCategoryLabel(g, tower.category)} />
 </div>

 {(specials.flagEffects.length > 0 || specials.identities.length > 0) && (
 <SectionBlock title={e.detailSpecialEffects} icon={<TargetIcon className="w-3 h-3 text-[var(--hl-reach)]"/>}>
 <div className="flex flex-wrap gap-1.5">
 {specials.flagEffects.map((fx) => {
 const effectName =
 fx.key === 'splash' ? e.effects.splash :
 fx.key === 'slow' ? e.effects.slow :
 fx.key === 'poison' ? e.effects.poison :
 fx.key === 'chain' ? e.effects.chain :
 fx.key === 'flame' ? e.effects.flame :
 e.knockback;
 return (
 <span
 key={fx.key}
 className="text-[10px] px-2 py-1 bg-[var(--hl-deck-2)] border border-[var(--hl-line)] text-[var(--hl-ink)]/65"
 >
 {effectName}
 {fx.rawValue !== '' ? ` · ${fx.rawValue}` : ''}
 </span>
 );
 })}
 {specials.identities.map((pill) => (
 <span
 key={pill.label}
 className="text-[10px] px-2 py-1 bg-[var(--hl-deck-2)] border border-[var(--hl-line)] text-[var(--hl-ink)]/65"
 >
 {pill.label} · {pill.current}
 </span>
 ))}
 </div>
 </SectionBlock>
 )}

 {!tower.isModContent && <TowerSynergyList towerType={tower.id} compact />}
 </div>
 );
}

export function PauseEncSkillDetail({ skillId }: { skillId: string }) {
 const { t } = useTranslation();
 const g = t.game;
 const skill = PLAYER_SKILL_BY_ID[skillId as PlayerSkillId];
 if (!skill) {
 return <EmptyHint text={g.pauseEncSkillNotFound} />;
 }

 const Icon = getPlayerSkillIcon(skill.effectKey);

 return (
 <div className="space-y-3">
 <header className="flex items-center gap-3">
 <div
 className="w-14 h-14 border border-[var(--hl-line)] flex items-center justify-center flex-shrink-0"
 style={{ backgroundColor: `${skill.iconColor}22` }}
 >
 <Icon className="w-7 h-7"style={{ color: skill.iconColor } as React.CSSProperties} />
 </div>
 <div className="min-w-0 flex-1">
 <h3 className="text-lg font-bold text-[var(--hl-ink)] truncate">{getPlayerSkillName(skill, t)}</h3>
 <p className="text-[11px] text-[var(--hl-ink-3)] leading-snug">{getPlayerSkillDesc(skill, t)}</p>
 </div>
 </header>

 <div className="grid grid-cols-2 gap-2">
 <StatPill label={g.pauseEncStatCooldown} value={`${skill.cooldown / 1000}s`} tone="text-[var(--hl-reach)]"/>
 <StatPill
 label={g.pauseEncStatDuration}
 value={skill.duration ? `${skill.duration / 1000}s` : g.pauseEncInstant}
 tone="text-[var(--hl-vital)]"
 />
 <StatPill label={g.pauseEncStatHotkey} value={skill.hotkey} />
 <StatPill label={g.pauseEncStatType} value={g.pauseEncActiveSkill} />
 </div>
 </div>
 );
}

export function PauseEncEffectDetail({
 effectType,
 allStatusEffects,
}: {
 effectType: string;
 allStatusEffects: StatusEffectType[];
}) {
 const { t } = useTranslation();
 const g = t.game;
 const e = t.encyclopedia;
 const resolved = allStatusEffects.includes(effectType as StatusEffectType)
 ? (effectType as StatusEffectType)
 : null;

 if (!resolved) {
 return <EmptyHint text={g.pauseEncEffectNotFound} />;
 }

 const effect = STATUS_EFFECTS[resolved];
 const EffectIcon = getStatusEffectIcon(resolved);
 const extraDesc = (e.statusDescriptions as Record<string, string>)[resolved] ?? '';

 return (
 <div className="space-y-3">
 <header className="flex items-center gap-3">
 <div
 className="w-14 h-14 border flex items-center justify-center flex-shrink-0"
 style={{
 backgroundColor: `${effect.color}22`,
 borderColor: `${effect.color}55`,
 }}
 >
 <EffectIcon className="w-7 h-7"style={{ color: effect.color } as React.CSSProperties} />
 </div>
 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-2">
 <h3 className="text-lg font-bold text-[var(--hl-ink)] truncate">{effect.name}</h3>
 <span className={`text-[9px] px-1.5 py-0.5 border flex-shrink-0 ${
 effect.isDebuff
 ? 'text-[var(--hl-alarm)] border-[var(--hl-line)] bg-[var(--hl-deck-2)]'
 : 'text-[var(--hl-vital)] border-[var(--hl-line)] bg-[var(--hl-deck-2)]'
 }`}>
 {effect.isDebuff ? e.detailDebuff : e.detailBuff}
 </span>
 </div>
 <p className="text-[11px] text-[var(--hl-ink-3)] leading-snug">{effect.description}</p>
 </div>
 </header>

 {extraDesc && (
 <SectionBlock title={g.pauseEncDetailDesc} icon={<HeartIcon className="w-3 h-3 text-[var(--hl-alarm)]"/>}>
 <p className="text-xs text-[var(--hl-ink-2)] leading-relaxed">{extraDesc}</p>
 </SectionBlock>
 )}

 <div className="grid grid-cols-2 gap-2">
 <StatPill
 label={g.pauseEncStatType}
 value={effect.isDebuff ? e.detailDebuff : e.detailBuff}
 tone={effect.isDebuff ? 'text-[var(--hl-alarm)]' : 'text-[var(--hl-vital)]'}
 />
 <StatPill
 label={e.detailStackable}
 value={effect.canStack
 ? g.pauseEncStackYesMax.replace('{max}', String(effect.maxStacks))
 : e.no}
 />
 </div>
 </div>
 );
}

function EmptyHint({ text }: { text: string }) {
 return (
 <div className={`flex items-center justify-center py-12 ${SCENE_TYPOGRAPHY.microMuted} uppercase`}>
 {text}
 </div>
 );
}
