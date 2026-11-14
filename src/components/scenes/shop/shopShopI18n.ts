/**
 * 商店 · 塔定位 / 特性 / 屬性 i18n 解析
 */
import type { Translations } from '@/i18n';
import type { TowerType, TowerData } from '@/types/game';
import type { PlayerSkill } from '@/data/playerSkillData';
import type { StatCell, TraitTag } from './shopData';

type S = Translations['shop'];

const ROLE_MAP: Record<TowerType, keyof S> = {
  basic: 'roleBasic', sniper: 'roleSniper', cannon: 'roleCannon', ballista: 'roleBallista',
  machine: 'roleMachine', shotgun: 'roleShotgun', frost: 'roleFrost', poison: 'rolePoison',
  laser: 'roleLaser', lightning: 'roleLightning', flame: 'roleFlame', money: 'roleMoney',
  wind: 'roleWind', pulse: 'rolePulse',
  storm: 'roleLightning', plague: 'rolePoison', demolisher: 'roleCannon', tempest: 'rolePulse',
};

export function getTowerRoleLabel(m: S, towerId: TowerType): string {
  const key = ROLE_MAP[towerId];
  return key ? String(m[key]) : '';
}

export function getTowerTraitsI18n(m: S, data: TowerData): TraitTag[] {
  const traits: TraitTag[] = [];
  if (data.instantHit) traits.push({ label: String(m.traitInstantHit), color: '#a5f3fc' });
  if (data.splash) traits.push({ label: String(m.traitSplash), color: '#fb923c' });
  if (data.slowEffect) traits.push({ label: String(m.traitSlow), color: '#7dd3fc' });
  if (data.poisonEffect) traits.push({ label: String(m.traitPoison), color: '#86efac' });
  if (data.laserEffect) traits.push({ label: String(m.traitLaser), color: '#d8b4fe' });
  if (data.lightningEffect) traits.push({ label: String(m.traitLightning), color: '#fde047' });
  if (data.flameEffect) traits.push({ label: String(m.traitFlame), color: '#fca5a5' });
  if (data.moneyGeneration) traits.push({ label: String(m.traitMoney), color: '#fde68a' });
  if (data.windEffect) traits.push({ label: String(m.traitWind), color: '#5eead4' });
  if (data.pulseEffect) traits.push({ label: String(m.traitPulse), color: '#67e8f9' });
  if ((data.critChance ?? 0) > 0) traits.push({ label: String(m.traitCrit), color: '#fdba74' });
  return traits;
}

export function getTowerStatsI18n(m: S, data: TowerData): StatCell[] {
  const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));
  return [
    {
      label: String(m.statDamage),
      value: data.damage > 0 ? fmt(data.damage) : data.damagePerSecond ? `${fmt(data.damagePerSecond)}/s` : '—',
      color: '#fda4af',
    },
    { label: String(m.statRange), value: data.range > 0 ? fmt(data.range) : '—', color: '#93c5fd' },
    { label: String(m.statFireRate), value: data.fireRate ? `${fmt(data.fireRate)}/s` : '—', color: '#6ee7b7' },
  ];
}

export function getSkillStatsI18n(m: S, skill: PlayerSkill): StatCell[] {
  return [
    { label: String(m.statCooldown), value: `${skill.cooldown / 1000}s`, color: '#67e8f9' },
    { label: String(m.statDuration), value: skill.duration ? `${skill.duration / 1000}s` : String(m.statInstant), color: '#6ee7b7' },
    { label: String(m.statHotkey), value: `⇧${skill.hotkey}`, color: '#d8b4fe' },
  ];
}
