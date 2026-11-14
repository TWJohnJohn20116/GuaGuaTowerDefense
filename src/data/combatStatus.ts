/**
 * 戰鬥狀態：狙擊標記、中毒抗療、雷射破甲、電擊虛弱、散彈出血、電擊穿盾、弩砲定身、加農暈眩、機槍沉默、風刃恐懼、脈衝破甲、融合繼承、冰霜疊層凍結、基礎塔準星、雷射處決、狙擊追擊、機槍對空、電擊對空、弩砲釘殺、凍結碎裂、散彈追血、加農碾壓、脈衝追破、風塔對空、火焰追燃、火焰處決、毒塔追毒、機槍壓制、風刃追恐、電擊追弱、雷射追破、冰塔追凍
 */

export const SNIPER_MARK_DURATION = 2500;
export const LASER_EXPOSED_DURATION = 2200;
export const LIGHTNING_WEAKNESS_DURATION = 1800;
export const SHOTGUN_BLEED_DURATION = 2200;
export const SHOTGUN_BLEED_PER_SECOND = 10;
export const BALLISTA_ROOT_DURATION = 700;
export const CANNON_STUN_DURATION = 450;
export const MACHINE_SILENCE_DURATION = 800;
export const WIND_FEAR_DURATION = 1400;
export const PULSE_EXPOSED_DURATION = 1800;
export const FROSTBITE_DURATION = 2500;
export const FROSTBITE_STACKS_TO_FREEZE = 3;
export const FROST_FREEZE_DURATION = 700;
export const FREEZE_BLAST_DURATION = 3000;
export const POISON_HEAL_MULT = 0.35;
export const CURSE_HEAL_MULT = 0.25;
export const WEAKNESS_DAMAGE_MULT = 1.5;
export const EXPOSED_ARMOR_MULT = 0.4;
export const BASIC_MARKED_DAMAGE_MULT = 1.35;
export const SNIPER_MARKED_DAMAGE_MULT = 1.5;
export const LASER_EXECUTE_HP_RATIO = 0.3;
export const LASER_EXECUTE_DAMAGE_MULT = 1.45;
export const MACHINE_FLYER_DAMAGE_MULT = 1.35;
export const LIGHTNING_FLYER_DAMAGE_MULT = 1.28;
export const BALLISTA_ROOTED_DAMAGE_MULT = 1.4;
export const FROST_SHATTER_DAMAGE = 48;
export const SHOTGUN_BLEEDING_DAMAGE_MULT = 1.35;
export const CANNON_STUNNED_DAMAGE_MULT = 1.4;
export const PULSE_EXPOSED_DAMAGE_MULT = 1.3;
export const WIND_FLYER_DAMAGE_MULT = 1.22;
export const FLAME_BURNING_DAMAGE_MULT = 1.25;
export const FLAME_EXECUTE_HP_RATIO = 0.4;
export const FLAME_EXECUTE_DAMAGE_MULT = 1.4;
export const POISON_TOXIN_DAMAGE_MULT = 1.2;
export const MACHINE_SILENCED_DAMAGE_MULT = 1.18;
export const WIND_FEARED_DAMAGE_MULT = 1.26;
export const LIGHTNING_WEAKENED_DAMAGE_MULT = 1.16;
export const LASER_EXPOSED_DAMAGE_MULT = 1.22;
export const FROST_FROZEN_DAMAGE_MULT = 1.28;

export interface CombatEffectLike {
  type: string;
  duration: number;
  startTime: number;
  value?: number;
  stacks?: number;
}

export interface TowerHitDamageOpts {
  ignoreArmor?: boolean;
  ignoreShield?: boolean;
}

function isActive(effect: CombatEffectLike, now: number): boolean {
  return now - effect.startTime < effect.duration;
}

function refreshEffect(
  effects: CombatEffectLike[],
  type: string,
  duration: number,
  now: number,
  value?: number,
): void {
  const existing = effects.find((effect) => effect.type === type);
  if (existing) {
    existing.startTime = now;
    existing.duration = duration;
    if (value !== undefined) existing.value = value;
    return;
  }
  effects.push({
    type,
    duration,
    startTime: now,
    ...(value !== undefined ? { value } : {}),
  });
}

export function applySniperMark(
  effects: CombatEffectLike[],
  towerType: string | undefined,
  now: number,
): void {
  if (towerType !== 'sniper' && towerType !== 'demolisher') return;
  refreshEffect(effects, 'marked', SNIPER_MARK_DURATION, now);
}

export function applyLaserExposed(
  effects: CombatEffectLike[],
  towerType: string | undefined,
  now: number,
): void {
  if (towerType !== 'laser') return;
  refreshEffect(effects, 'exposed', LASER_EXPOSED_DURATION, now);
}

export function applyLightningWeakness(
  effects: CombatEffectLike[],
  towerType: string | undefined,
  now: number,
): void {
  if (towerType !== 'lightning' && towerType !== 'storm') return;
  refreshEffect(effects, 'weakness', LIGHTNING_WEAKNESS_DURATION, now);
}

export function applyShotgunBleed(
  effects: CombatEffectLike[],
  towerType: string | undefined,
  now: number,
): void {
  if (towerType !== 'shotgun') return;
  refreshEffect(effects, 'bleed', SHOTGUN_BLEED_DURATION, now, SHOTGUN_BLEED_PER_SECOND);
}

export function applyBallistaRoot(
  effects: CombatEffectLike[],
  towerType: string | undefined,
  now: number,
): void {
  if (towerType !== 'ballista') return;
  refreshEffect(effects, 'root', BALLISTA_ROOT_DURATION, now);
}

export function applyCannonStun(
  effects: CombatEffectLike[],
  towerType: string | undefined,
  now: number,
): void {
  if (towerType !== 'cannon' && towerType !== 'demolisher') return;
  refreshEffect(effects, 'stun', CANNON_STUN_DURATION, now);
}

/** 機槍壓制射擊：命中刷新沉默，關掉干擾／治療／護航光環 */
export function applyMachineSilence(
  effects: CombatEffectLike[],
  towerType: string | undefined,
  now: number,
): void {
  if (towerType !== 'machine') return;
  refreshEffect(effects, 'silence', MACHINE_SILENCE_DURATION, now);
}

/** 風刃命中附加恐懼，擊退後仍半速奔跑 */
export function applyWindFear(
  effects: CombatEffectLike[],
  towerType: string | undefined,
  now: number,
): void {
  if (towerType !== 'wind' && towerType !== 'tempest') return;
  refreshEffect(effects, 'fear', WIND_FEAR_DURATION, now);
}

/** 脈衝環命中附加破甲，範圍內裝甲一起被削 */
export function applyPulseExposed(
  effects: CombatEffectLike[],
  towerType: string | undefined,
  now: number,
): void {
  if (towerType !== 'pulse' && towerType !== 'tempest') return;
  refreshEffect(effects, 'exposed', PULSE_EXPOSED_DURATION, now);
}

/** 冰彈疊冰霜咬傷，第三發轉凍結 */
export function applyFrostbite(
  effects: CombatEffectLike[],
  towerType: string | undefined,
  now: number,
): void {
  if (towerType !== 'frost' && towerType !== 'storm') return;
  const existing = effects.find((effect) => effect.type === 'frostbite');
  const live = existing && isActive(existing, now) ? existing : undefined;
  const stacks = (live?.stacks ?? 0) + 1;
  if (stacks >= FROSTBITE_STACKS_TO_FREEZE) {
    if (existing) {
      const idx = effects.indexOf(existing);
      if (idx >= 0) effects.splice(idx, 1);
    }
    refreshEffect(effects, 'freeze', FROST_FREEZE_DURATION, now);
    return;
  }
  if (live) {
    live.startTime = now;
    live.duration = FROSTBITE_DURATION;
    live.stacks = stacks;
    return;
  }
  if (existing) {
    existing.startTime = now;
    existing.duration = FROSTBITE_DURATION;
    existing.stacks = 1;
    return;
  }
  effects.push({
    type: 'frostbite',
    duration: FROSTBITE_DURATION,
    startTime: now,
    stacks: 1,
  });
}

/** 冰凍爆發：真正凍結，不覆蓋既有減速 */
export function applyFreezeBlast(effects: CombatEffectLike[], now: number): void {
  refreshEffect(effects, 'freeze', FREEZE_BLAST_DURATION, now);
}

/** 電擊穿盾；毒系命中無視護盾與裝甲，直接打血 */
export function getTowerHitDamageOpts(towerType: string | undefined): TowerHitDamageOpts {
  if (towerType === 'lightning' || towerType === 'storm') {
    return { ignoreShield: true };
  }
  if (towerType === 'poison' || towerType === 'plague') {
    return { ignoreShield: true, ignoreArmor: true };
  }
  return {};
}

/** 燃燒中護盾不再回復；無效果時為 1 */
export function getShieldRegenMult(effects: CombatEffectLike[] | undefined, now: number): number {
  if (!effects) return 1;
  for (const effect of effects) {
    if (effect.type === 'burn' && isActive(effect, now)) return 0;
  }
  return 1;
}

/** 回傳治療倍率；未中毒／詛咒時為 1 */
export function getIncomingHealMult(effects: CombatEffectLike[] | undefined, now: number): number {
  if (!effects) return 1;
  let mult = 1;
  for (const effect of effects) {
    if (!isActive(effect, now)) continue;
    if (effect.type === 'poison') mult = Math.min(mult, POISON_HEAL_MULT);
    if (effect.type === 'curse') mult = Math.min(mult, CURSE_HEAL_MULT);
  }
  return mult;
}

/** 虛弱：受到傷害倍率；無效果時為 1 */
export function getDamageTakenMult(effects: CombatEffectLike[] | undefined, now: number): number {
  if (!effects) return 1;
  for (const effect of effects) {
    if (effect.type === 'weakness' && isActive(effect, now)) return WEAKNESS_DAMAGE_MULT;
  }
  return 1;
}

/** 基礎塔／狙擊／攻城打被標記的敵人加傷；其他塔或無標記時為 1 */
export function getFocusFireMult(
  effects: CombatEffectLike[] | undefined,
  now: number,
  towerType: string | undefined,
): number {
  const markedBonus = towerType === 'basic'
    ? BASIC_MARKED_DAMAGE_MULT
    : (towerType === 'sniper' || towerType === 'demolisher')
      ? SNIPER_MARKED_DAMAGE_MULT
      : 0;
  if (!markedBonus) return 1;
  if (!effects) return 1;
  for (const effect of effects) {
    if (effect.type === 'marked' && isActive(effect, now)) return markedBonus;
  }
  return 1;
}

/** 雷射／火焰／瘟疫對殘血目標處決加傷；其他塔或血量高於閾值時為 1 */
export function getExecuteMult(towerType: string | undefined, healthRatio: number): number {
  if (!(healthRatio >= 0)) return 1;
  if (towerType === 'laser') {
    if (healthRatio > LASER_EXECUTE_HP_RATIO) return 1;
    return LASER_EXECUTE_DAMAGE_MULT;
  }
  if (towerType === 'flame' || towerType === 'plague') {
    if (healthRatio > FLAME_EXECUTE_HP_RATIO) return 1;
    return FLAME_EXECUTE_DAMAGE_MULT;
  }
  return 1;
}

/** 機槍／電擊／風塔對飛行敵人加傷；其他塔或非飛行時為 1 */
export function getAntiAirMult(towerType: string | undefined, enemyType: string | undefined): number {
  if (enemyType !== 'flyer') return 1;
  if (towerType === 'machine') return MACHINE_FLYER_DAMAGE_MULT;
  if (towerType === 'lightning' || towerType === 'storm') return LIGHTNING_FLYER_DAMAGE_MULT;
  if (towerType === 'wind' || towerType === 'tempest') return WIND_FLYER_DAMAGE_MULT;
  return 1;
}

/** 弩砲打被定身的敵人加傷；其他塔、無定身或已過期時為 1 */
export function getPinnedMult(
  towerType: string | undefined,
  effects: CombatEffectLike[] | undefined,
  now: number,
): number {
  if (towerType !== 'ballista') return 1;
  if (!effects) return 1;
  for (const effect of effects) {
    if (effect.type === 'root' && isActive(effect, now)) return BALLISTA_ROOTED_DAMAGE_MULT;
  }
  return 1;
}

/** 凍結剛過期時造成碎裂傷害；仍凍結、無凍結或其他控場時為 0 */
export function getFreezeShatterDamage(effects: CombatEffectLike[] | undefined, now: number): number {
  if (!effects) return 0;
  for (const effect of effects) {
    if (effect.type === 'freeze' && !isActive(effect, now)) return FROST_SHATTER_DAMAGE;
  }
  return 0;
}

/** 散彈打正在流血的敵人加傷；其他塔、無流血或已過期時為 1 */
export function getBleedHuntMult(
  towerType: string | undefined,
  effects: CombatEffectLike[] | undefined,
  now: number,
): number {
  if (towerType !== 'shotgun') return 1;
  if (!effects) return 1;
  for (const effect of effects) {
    if (effect.type === 'bleed' && isActive(effect, now)) return SHOTGUN_BLEEDING_DAMAGE_MULT;
  }
  return 1;
}

/** 加農／攻城打被暈眩的敵人加傷；其他塔、無暈眩或已過期時為 1 */
export function getStunCrushMult(
  towerType: string | undefined,
  effects: CombatEffectLike[] | undefined,
  now: number,
): number {
  if (towerType !== 'cannon' && towerType !== 'demolisher') return 1;
  if (!effects) return 1;
  for (const effect of effects) {
    if (effect.type === 'stun' && isActive(effect, now)) return CANNON_STUNNED_DAMAGE_MULT;
  }
  return 1;
}

/** 脈衝／颶風打已被破甲的敵人加傷；其他塔、無破甲或已過期時為 1 */
export function getExposedHuntMult(
  towerType: string | undefined,
  effects: CombatEffectLike[] | undefined,
  now: number,
): number {
  if (towerType !== 'pulse' && towerType !== 'tempest') return 1;
  if (!effects) return 1;
  for (const effect of effects) {
    if (effect.type === 'exposed' && isActive(effect, now)) return PULSE_EXPOSED_DAMAGE_MULT;
  }
  return 1;
}

/** 火焰／瘟疫打正在燃燒的敵人加傷；其他塔、無燃燒或已過期時為 1 */
export function getBurnHuntMult(
  towerType: string | undefined,
  effects: CombatEffectLike[] | undefined,
  now: number,
): number {
  if (towerType !== 'flame' && towerType !== 'plague') return 1;
  if (!effects) return 1;
  for (const effect of effects) {
    if (effect.type === 'burn' && isActive(effect, now)) return FLAME_BURNING_DAMAGE_MULT;
  }
  return 1;
}

/** 毒塔／瘟疫打正在中毒的敵人加傷；其他塔、無中毒或已過期時為 1 */
export function getToxinHuntMult(
  towerType: string | undefined,
  effects: CombatEffectLike[] | undefined,
  now: number,
): number {
  if (towerType !== 'poison' && towerType !== 'plague') return 1;
  if (!effects) return 1;
  for (const effect of effects) {
    if (effect.type === 'poison' && isActive(effect, now)) return POISON_TOXIN_DAMAGE_MULT;
  }
  return 1;
}

/** 機槍打正在沉默的敵人加傷；其他塔、無沉默或已過期時為 1 */
export function getSilenceHuntMult(
  towerType: string | undefined,
  effects: CombatEffectLike[] | undefined,
  now: number,
): number {
  if (towerType !== 'machine') return 1;
  if (!effects) return 1;
  for (const effect of effects) {
    if (effect.type === 'silence' && isActive(effect, now)) return MACHINE_SILENCED_DAMAGE_MULT;
  }
  return 1;
}

/** 風塔／颶風打正在恐懼的敵人加傷；其他塔、無恐懼或已過期時為 1 */
export function getFearHuntMult(
  towerType: string | undefined,
  effects: CombatEffectLike[] | undefined,
  now: number,
): number {
  if (towerType !== 'wind' && towerType !== 'tempest') return 1;
  if (!effects) return 1;
  for (const effect of effects) {
    if (effect.type === 'fear' && isActive(effect, now)) return WIND_FEARED_DAMAGE_MULT;
  }
  return 1;
}

/** 電擊／暴風打正在虛弱的敵人加傷；其他塔、無虛弱或已過期時為 1 */
export function getWeaknessHuntMult(
  towerType: string | undefined,
  effects: CombatEffectLike[] | undefined,
  now: number,
): number {
  if (towerType !== 'lightning' && towerType !== 'storm') return 1;
  if (!effects) return 1;
  for (const effect of effects) {
    if (effect.type === 'weakness' && isActive(effect, now)) return LIGHTNING_WEAKENED_DAMAGE_MULT;
  }
  return 1;
}

/** 雷射打已被破甲的敵人加傷；其他塔、無破甲或已過期時為 1 */
export function getLaserHuntMult(
  towerType: string | undefined,
  effects: CombatEffectLike[] | undefined,
  now: number,
): number {
  if (towerType !== 'laser') return 1;
  if (!effects) return 1;
  for (const effect of effects) {
    if (effect.type === 'exposed' && isActive(effect, now)) return LASER_EXPOSED_DAMAGE_MULT;
  }
  return 1;
}

/** 冰塔／暴風打正在凍結的敵人加傷；其他塔、無凍結或已過期時為 1 */
export function getFreezeHuntMult(
  towerType: string | undefined,
  effects: CombatEffectLike[] | undefined,
  now: number,
): number {
  if (towerType !== 'frost' && towerType !== 'storm') return 1;
  if (!effects) return 1;
  for (const effect of effects) {
    if (effect.type === 'freeze' && isActive(effect, now)) return FROST_FROZEN_DAMAGE_MULT;
  }
  return 1;
}

/** 破甲：裝甲殘留倍率；無效果時為 1 */
export function getArmorTakenMult(effects: CombatEffectLike[] | undefined, now: number): number {
  if (!effects) return 1;
  for (const effect of effects) {
    if (effect.type === 'exposed' && isActive(effect, now)) return EXPOSED_ARMOR_MULT;
  }
  return 1;
}
