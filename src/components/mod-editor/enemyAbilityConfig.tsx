/**
 * 敵人能力機制設定（對齊遊戲內 10 種真實能力）
 */
import type { CustomEnemyData } from '@/types/game';
import type { ReactNode } from 'react';
import type { Translations } from '@/i18n';
import {
  ShieldIcon, GhostIcon, HealIcon, BombIcon, LightningIcon,
  SnowflakeIcon, AlienIcon, TargetIcon, WindIcon, EyeIcon, EmpIcon, AegisIcon,
} from '@/components/ui/Icons';
import { buildEnemyAbilityLabels } from './modEditorEnemyI18n';

export interface EnemyAbilityDef {
  id: string;
  name: string;
  desc: string;
  icon: ReactNode;
  defaults: Partial<CustomEnemyData>;
  fields: {
    key: keyof CustomEnemyData;
    label: string;
    step?: number;
    min?: number;
    max?: number;
  }[];
}

const ABILITY_ICONS: Record<string, ReactNode> = {
  stealth: <EyeIcon className="h-4 w-4" />,
  phase: <GhostIcon className="h-4 w-4" />,
  shield: <ShieldIcon className="h-4 w-4" />,
  armored: <TargetIcon className="h-4 w-4" />,
  berserk: <LightningIcon className="h-4 w-4" />,
  healing: <HealIcon className="h-4 w-4" />,
  spawning: <AlienIcon className="h-4 w-4" />,
  explode: <BombIcon className="h-4 w-4" />,
  teleport: <SnowflakeIcon className="h-4 w-4" />,
  flying: <WindIcon className="h-4 w-4" />,
  jam: <EmpIcon className="h-4 w-4" />,
  escort: <AegisIcon className="h-4 w-4" />,
};

const ABILITY_DEFAULTS: Record<string, Partial<CustomEnemyData>> = {
  stealth: { stealthDuration: 3000, stealthCooldown: 5000 },
  phase: { phaseDuration: 2000, phaseCooldown: 4000 },
  shield: { shieldAmount: 80, shieldRegen: 2 },
  armored: { armorValue: 5 },
  berserk: { berserkThreshold: 0.3, berserkSpeedBoost: 2 },
  healing: { healRadius: 80, healAmount: 5 },
  spawning: { spawnOnDeath: { type: 'normal', count: 3 } },
  explode: { explosionRadius: 60, explosionDamage: 15 },
  teleport: { teleportDistance: 2, teleportCooldown: 8000 },
  flying: {},
  jam: { jamRadius: 120, jamFireRateMult: 0.55 },
  escort: { escortRadius: 110, escortArmor: 6 },
};

export function getEnemyGameAbilities(m: Translations['modEditorExt']): EnemyAbilityDef[] {
  return buildEnemyAbilityLabels(m).map((spec) => ({
    ...spec,
    icon: ABILITY_ICONS[spec.id] ?? null,
    defaults: ABILITY_DEFAULTS[spec.id] ?? {},
  }));
}

export function applyEnemyAbility(
  enemy: CustomEnemyData,
  abilityId: string,
  m: Translations['modEditorExt'],
): CustomEnemyData {
  const defs = getEnemyGameAbilities(m);
  if (!abilityId) {
    const cleared = { ...enemy, ability: undefined };
    defs.forEach((def) => {
      def.fields.forEach((f) => delete (cleared as Record<string, unknown>)[f.key as string]);
    });
    delete cleared.shieldAmount;
    delete cleared.spawnOnDeath;
    return cleared;
  }
  const def = defs.find((a) => a.id === abilityId);
  if (!def) return { ...enemy, ability: abilityId };
  return { ...enemy, ability: abilityId, ...def.defaults };
}

export function getAbilityDef(
  abilityId: string | undefined,
  m: Translations['modEditorExt'],
): EnemyAbilityDef | undefined {
  if (!abilityId) return undefined;
  return getEnemyGameAbilities(m).find((a) => a.id === abilityId);
}
