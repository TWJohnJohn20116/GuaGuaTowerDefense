import type { AutoBattleRule } from '@/types/autobattle';

/**
 * 預設規則：全部 source='preset'，玩家可停用／複製成自己的規則。
 * note 一律存 i18n key，UI 直接顯示。
 */
export const DEFAULT_AUTO_BATTLE_RULES: AutoBattleRule[] = [
  {
    id: 'preset.no-early-sell',
    enabled: true,
    hardness: 'hard',
    when: { maxWave: 2 },
    then: { type: 'veto', kinds: ['sell'] },
    note: 'content.autoBattle.rule.noEarlySell',
    source: 'preset',
  },
  {
    id: 'preset.no-fusion-when-bleeding',
    enabled: true,
    hardness: 'hard',
    when: { maxHealthRatio: 0.35 },
    then: { type: 'veto', kinds: ['fusion'] },
    note: 'content.autoBattle.rule.noFusionWhenBleeding',
    source: 'preset',
  },
  {
    id: 'preset.no-skip-on-boss',
    enabled: true,
    hardness: 'hard',
    when: { enemyHasAbility: 'miniboss' },
    then: { type: 'veto', kinds: ['skip'] },
    note: 'content.autoBattle.rule.noSkipOnBoss',
    source: 'preset',
  },
  {
    id: 'preset.emergency-place',
    enabled: true,
    hardness: 'hard',
    when: { maxHealthRatio: 0.5, minEnemyCount: 5 },
    then: { type: 'force', kinds: ['place'] },
    note: 'content.autoBattle.rule.emergencyPlace',
    source: 'preset',
  },
  {
    id: 'preset.no-sell-mid-wave',
    enabled: true,
    hardness: 'soft',
    when: { minEnemyCount: 4 },
    then: { type: 'bonus', kinds: ['sell'], amount: -0.06 },
    note: 'content.autoBattle.rule.noSellMidWave',
    source: 'preset',
  },
  {
    id: 'preset.upgrade-late',
    enabled: true,
    hardness: 'soft',
    when: { minWave: 8 },
    then: { type: 'bonus', kinds: ['upgrade'], amount: 0.05 },
    note: 'content.autoBattle.rule.upgradeLate',
    source: 'preset',
  },
  {
    id: 'preset.skill-on-boss',
    enabled: true,
    hardness: 'soft',
    when: { enemyHasAbility: 'miniboss' },
    then: { type: 'bonus', kinds: ['skill', 'playerSkill'], amount: 0.08 },
    note: 'content.autoBattle.rule.skillOnBoss',
    source: 'preset',
  },
  {
    id: 'preset.counter-flying',
    enabled: true,
    hardness: 'soft',
    when: { enemyHasAbility: 'flying' },
    then: { type: 'weight', factor: 'typeMatch', multiplier: 1.3 },
    note: 'content.autoBattle.rule.counterFlying',
    source: 'preset',
  },
  {
    id: 'preset.counter-armor',
    enabled: true,
    hardness: 'soft',
    when: { enemyHasAbility: 'armored' },
    then: { type: 'weight', factor: 'typeMatch', multiplier: 1.25 },
    note: 'content.autoBattle.rule.counterArmor',
    source: 'preset',
  },
  {
    id: 'preset.speed-up-when-rich',
    enabled: true,
    hardness: 'soft',
    when: { minMoney: 1200 },
    then: { type: 'weight', factor: 'tempo', multiplier: 1.2 },
    note: 'content.autoBattle.rule.rushWhenRich',
    source: 'preset',
  },
];

