/**
 * 塔特殊效果定義與解析（Mod 編輯器共用）
 */
import type { CustomTowerData } from '@/types/game';
import {
  ExplosionIcon, SnowflakeIcon, SkullIcon, LightningIcon,
  ZapIcon, FlameIcon, WindIcon, CoinIcon,
} from '@/components/ui/Icons';

export type TowerEffectId =
  | 'splash' | 'slow' | 'poison' | 'chain'
  | 'laser' | 'flame' | 'wind' | 'money';

const SPECIAL_MODEL_TYPES = new Set([
  'laser', 'lightning', 'flame', 'wind', 'money', 'frost', 'poison', 'pulse',
]);

export function resolveTowerPreviewEffects(tower: CustomTowerData) {
  const model = tower.modelType || 'basic';
  return {
    splash: !!tower.splash,
    splashRadius: tower.splashRadius,
    slowEffect: !!(tower.slowEffect || model === 'frost'),
    poisonEffect: !!(tower.poisonEffect || model === 'poison'),
    lightningEffect: !!(tower.lightningEffect || model === 'lightning'),
    chainCount: tower.chainCount ?? (model === 'lightning' ? 3 : undefined),
    laserEffect: !!(tower.laserEffect || model === 'laser'),
    flameEffect: !!(tower.flameEffect || model === 'flame'),
    windEffect: !!(tower.windEffect || model === 'wind'),
    moneyGeneration: !!(tower.moneyGeneration || model === 'money'),
  };
}

export function getTowerEffectIds(tower: CustomTowerData): TowerEffectId[] {
  const fx = resolveTowerPreviewEffects(tower);
  const ids: TowerEffectId[] = [];
  if (fx.splash) ids.push('splash');
  if (fx.slowEffect) ids.push('slow');
  if (fx.poisonEffect) ids.push('poison');
  if (fx.lightningEffect) ids.push('chain');
  if (fx.laserEffect) ids.push('laser');
  if (fx.flameEffect) ids.push('flame');
  if (fx.windEffect) ids.push('wind');
  if (fx.moneyGeneration) ids.push('money');
  return ids;
}

export function towerHasEffectPreview(tower: CustomTowerData): boolean {
  const fx = resolveTowerPreviewEffects(tower);
  if (fx.splash || fx.slowEffect || fx.poisonEffect || fx.lightningEffect) return true;
  if (fx.laserEffect || fx.flameEffect || fx.windEffect || fx.moneyGeneration) return true;
  return SPECIAL_MODEL_TYPES.has(tower.modelType || '');
}

const EFFECT_STYLE: Record<TowerEffectId, { border: string; bg: string; text: string }> = {
  splash: { border: 'border-[rgba(255,182,39,0.38)]', bg: 'bg-[rgba(255,182,39,0.12)]', text: 'text-[var(--arc-caution)]' },
  slow: { border: 'border-[rgba(111,140,255,0.38)]', bg: 'bg-[rgba(111,140,255,0.12)]', text: 'text-[var(--arc-reach)]' },
  poison: { border: 'border-[rgba(53,224,138,0.38)]', bg: 'bg-[rgba(53,224,138,0.12)]', text: 'text-[var(--arc-vital)]' },
  chain: { border: 'border-[rgba(255,182,39,0.38)]', bg: 'bg-[rgba(255,182,39,0.12)]', text: 'text-[var(--arc-caution)]' },
  laser: { border: 'border-[var(--arc-line-strong)]', bg: 'bg-[var(--arc-deck-2)]', text: 'text-[var(--arc-ink-2)]' },
  flame: { border: 'border-[rgba(255,61,113,0.38)]', bg: 'bg-[rgba(255,61,113,0.12)]', text: 'text-[var(--arc-alert)]' },
  wind: { border: 'border-[rgba(111,140,255,0.38)]', bg: 'bg-[rgba(111,140,255,0.12)]', text: 'text-[var(--arc-reach)]' },
  money: { border: 'border-[rgba(255,182,39,0.38)]', bg: 'bg-[rgba(255,182,39,0.12)]', text: 'text-[var(--arc-caution)]' },
};

export function getTowerEffectStyle(id: TowerEffectId) {
  return EFFECT_STYLE[id];
}

export function getTowerEffectIcon(id: TowerEffectId, className = 'h-3 w-3') {
  const props = { className };
  switch (id) {
    case 'splash': return <ExplosionIcon {...props} />;
    case 'slow': return <SnowflakeIcon {...props} />;
    case 'poison': return <SkullIcon {...props} />;
    case 'chain': return <LightningIcon {...props} />;
    case 'laser': return <ZapIcon {...props} />;
    case 'flame': return <FlameIcon {...props} />;
    case 'wind': return <WindIcon {...props} />;
    case 'money': return <CoinIcon {...props} />;
    default: return null;
  }
}

type TowerEffectShortKey =
  | 'fxShortSplash' | 'fxShortSlow' | 'fxShortPoison' | 'fxShortChain'
  | 'fxShortLaser' | 'fxShortFlame' | 'fxShortWind' | 'fxShortMoney';

const EFFECT_SHORT_KEY: Record<TowerEffectId, TowerEffectShortKey> = {
  splash: 'fxShortSplash',
  slow: 'fxShortSlow',
  poison: 'fxShortPoison',
  chain: 'fxShortChain',
  laser: 'fxShortLaser',
  flame: 'fxShortFlame',
  wind: 'fxShortWind',
  money: 'fxShortMoney',
};
export function getTowerEffectShortLabel(
  id: TowerEffectId,
  m: Record<string, string>,
): string {
  const key = EFFECT_SHORT_KEY[id];
  const raw = m[key];
  return typeof raw === 'string' ? raw : TOWER_EFFECT_SHORT[id];
}

/** 簡短標籤（無 i18n 時後備） */
const TOWER_EFFECT_SHORT: Record<TowerEffectId, string> = {
  splash: '範圍',
  slow: '減速',
  poison: '毒素',
  chain: '連鎖',
  laser: '雷射',
  flame: '火焰',
  wind: '風刃',
  money: '產金',
};
