/**
 * 圖鑑共用 SVG 圖示映射
 * - StatusEffect → SVG 元件（取代原本的 emoji 字串圖示）
 * - PlayerSkill 效果類型 → SVG 元件
 */

import type { SVGProps } from 'react';
import type { StatusEffectType } from '@/types/game';
import type { PlayerSkill } from '@/data/playerSkillData';
import {
  FootprintsIcon, SkullIcon, FlameIcon, SnowflakeIcon, LightningIcon,
  BloodIcon, BrokenHeartIcon, TargetIcon, EyeIcon, GhostIcon, TreeIcon,
  SkullCrossbonesIcon, ShieldIcon, HeartPurpleIcon, RunIcon, DemonIcon,
  ShieldLockIcon, SwirlIcon, XIcon, BoneIcon, TornadoIcon, CrystalBallIcon,
  SparklesIcon, CoinIcon, SwordsIcon, MeteorIcon, ChainLightningIcon, HealIcon, AegisIcon, WarpIcon, EmpIcon,
} from '@/components/ui/Icons';

type IconComp = (p: SVGProps<SVGSVGElement> & { className?: string; style?: React.CSSProperties }) => JSX.Element;

// 狀態效果 SVG 圖示對應
const STATUS_EFFECT_ICONS: Record<StatusEffectType, IconComp> = {
  slow: FootprintsIcon,
  poison: SkullIcon,
  burn: FlameIcon,
  freeze: SnowflakeIcon,
  stun: LightningIcon,
  bleed: BloodIcon,
  weakness: BrokenHeartIcon,
  marked: TargetIcon,
  exposed: EyeIcon,
  fear: GhostIcon,
  root: TreeIcon,
  curse: SkullCrossbonesIcon,
  shield: ShieldIcon,
  regen: HeartPurpleIcon,
  haste: RunIcon,
  berserk: DemonIcon,
  immune: ShieldLockIcon,
  confuse: SwirlIcon,
  silence: XIcon,
  petrify: BoneIcon,
  wind: TornadoIcon,
  frostbite: CrystalBallIcon,
};

// 取得對應 SVG 元件（找不到時回傳 SparklesIcon）
export function getStatusEffectIcon(effect: StatusEffectType): IconComp {
  return STATUS_EFFECT_ICONS[effect] || SparklesIcon;
}

// 玩家主動技能 SVG 圖示對應
export const PLAYER_SKILL_ICONS: Record<PlayerSkill['effectKey'], IconComp> = {
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

export function getPlayerSkillIcon(effectKey: PlayerSkill['effectKey']): IconComp {
  return PLAYER_SKILL_ICONS[effectKey] || SparklesIcon;
}
