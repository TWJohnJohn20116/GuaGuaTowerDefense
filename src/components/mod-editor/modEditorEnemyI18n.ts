/**
 * Mod 編輯器 · 敵人能力 / 模型 i18n 建構
 */
import type { Translations } from '@/i18n';
import type { EnemyAbilityDef } from './enemyAbilityConfig';

type M = Translations['modEditorExt'];

const MODEL_IDS = [
  'normal', 'fast', 'elite', 'speedy', 'tank', 'heavy', 'boss', 'flyer', 'healer',
  'spawner', 'shield', 'stealth', 'berserker', 'armored', 'mage', 'miniboss', 'swarm', 'ghost', 'bomber', 'jammer', 'escort',
] as const;

function modelKey(id: string, suffix: 'Name' | 'Desc') {
  return `em${id.charAt(0).toUpperCase()}${id.slice(1)}${suffix}` as keyof M;
}

export function getEnemyModelTypes(m: M) {
  return MODEL_IDS.map((id) => ({
    id,
    name: String(m[modelKey(id, 'Name')]),
    desc: String(m[modelKey(id, 'Desc')]),
    icon: '', // SVG 預覽由 EnemyPreview 負責，不再使用 emoji
  }));
}

function lbl(m: M, key: keyof M): string {
  return String(m[key]);
}

/** 由 modEditorExt 建構能力列表（圖示在 enemyAbilityConfig 合併） */
export function buildEnemyAbilityLabels(m: M): Pick<EnemyAbilityDef, 'id' | 'name' | 'desc' | 'fields'>[] {
  return [
    {
      id: 'stealth',
      name: lbl(m, 'eaStealthName'),
      desc: lbl(m, 'eaStealthDesc'),
      fields: [
        { key: 'stealthDuration', label: lbl(m, 'eaStealthDur'), step: 100, min: 500 },
        { key: 'stealthCooldown', label: lbl(m, 'eaStealthCd'), step: 100, min: 1000 },
      ],
    },
    {
      id: 'phase',
      name: lbl(m, 'eaPhaseName'),
      desc: lbl(m, 'eaPhaseDesc'),
      fields: [
        { key: 'phaseDuration', label: lbl(m, 'eaPhaseDur'), step: 100, min: 500 },
        { key: 'phaseCooldown', label: lbl(m, 'eaPhaseCd'), step: 100, min: 1000 },
      ],
    },
    {
      id: 'shield',
      name: lbl(m, 'eaShieldName'),
      desc: lbl(m, 'eaShieldDesc'),
      fields: [
        { key: 'shieldAmount', label: lbl(m, 'eaShieldAmt'), step: 5, min: 10 },
        { key: 'shieldRegen', label: lbl(m, 'eaShieldRegen'), step: 0.5, min: 0 },
      ],
    },
    {
      id: 'armored',
      name: lbl(m, 'eaArmoredName'),
      desc: lbl(m, 'eaArmoredDesc'),
      fields: [{ key: 'armorValue', label: lbl(m, 'eaArmorVal'), step: 1, min: 1 }],
    },
    {
      id: 'berserk',
      name: lbl(m, 'eaBerserkName'),
      desc: lbl(m, 'eaBerserkDesc'),
      fields: [
        { key: 'berserkThreshold', label: lbl(m, 'eaBerserkThresh'), step: 0.05, min: 0.1, max: 0.5 },
        { key: 'berserkSpeedBoost', label: lbl(m, 'eaBerserkBoost'), step: 0.1, min: 1.2 },
      ],
    },
    {
      id: 'healing',
      name: lbl(m, 'eaHealName'),
      desc: lbl(m, 'eaHealDesc'),
      fields: [
        { key: 'healRadius', label: lbl(m, 'eaHealRadius'), step: 10, min: 20 },
        { key: 'healAmount', label: lbl(m, 'eaHealAmt'), step: 1, min: 1 },
      ],
    },
    {
      id: 'spawning',
      name: lbl(m, 'eaSpawnName'),
      desc: lbl(m, 'eaSpawnDesc'),
      fields: [],
    },
    {
      id: 'explode',
      name: lbl(m, 'eaExplName'),
      desc: lbl(m, 'eaExplDesc'),
      fields: [
        { key: 'explosionRadius', label: lbl(m, 'eaExplRadius'), step: 5, min: 20 },
        { key: 'explosionDamage', label: lbl(m, 'eaExplDmg'), step: 1, min: 1 },
      ],
    },
    {
      id: 'teleport',
      name: lbl(m, 'eaTpName'),
      desc: lbl(m, 'eaTpDesc'),
      fields: [
        { key: 'teleportDistance', label: lbl(m, 'eaTpDist'), step: 1, min: 1, max: 5 },
        { key: 'teleportCooldown', label: lbl(m, 'eaTpCd'), step: 500, min: 2000 },
      ],
    },
    {
      id: 'flying',
      name: lbl(m, 'eaFlyName'),
      desc: lbl(m, 'eaFlyDesc'),
      fields: [],
    },
    {
      id: 'jam',
      name: lbl(m, 'eaJamName'),
      desc: lbl(m, 'eaJamDesc'),
      fields: [
        { key: 'jamRadius', label: lbl(m, 'eaJamRadius'), step: 10, min: 40 },
        { key: 'jamFireRateMult', label: lbl(m, 'eaJamMult'), step: 0.05, min: 0.2, max: 0.9 },
      ],
    },
    {
      id: 'escort',
      name: lbl(m, 'eaEscortName'),
      desc: lbl(m, 'eaEscortDesc'),
      fields: [
        { key: 'escortRadius', label: lbl(m, 'eaEscortRadius'), step: 10, min: 40 },
        { key: 'escortArmor', label: lbl(m, 'eaEscortArmor'), step: 1, min: 1 },
      ],
    },
  ];
}
