/**
 * 戰術協議池的參數化行為測試
 *
 * 原本是 8 支 protocolPack2..9.test.ts：同一套骨架複製 8 次（id 唯一、名稱、
 * 真實效果、自動戰鬥偏好、成就目標對齊），每支只差 3 個協議 id。收斂成
 * it.each 之後，新增一批協議只要往 PROTOCOL_CASES／STRATEGY_CASES 各加 3 筆，
 * 不必再開一個新檔案。
 */

import { describe, it, expect } from 'vitest';
import {
  TACTICAL_PROTOCOLS,
  applyInstantGrant,
  getProtocolWaveMods,
  pickProtocolForStrategy,
} from '@/data/tacticalProtocolData';
import { ALL_ACHIEVEMENTS } from '@/data/achievementData';

type Mods = ReturnType<typeof getProtocolWaveMods>;
type Grant = ReturnType<typeof applyInstantGrant>;
type Strategy = 'economy' | 'defensive' | 'aggressive';

interface ProtocolCase {
  id: string;
  name: string;
  /** 進池後必須真的改到戰鬥／經濟數值；方向由 cmp 決定 */
  mod?: { read: (mods: Mods) => number; cmp: 'gt' | 'lt'; value: number };
  /** 即時給付型協議看 applyInstantGrant 的結果 */
  grant?: { read: (grant: Grant) => number; value: number };
}

interface StrategyCase {
  strategy: Strategy;
  rivals: string[];
  expected: string;
}

const PROTOCOL_CASES: ProtocolCase[] = [
  // 第二批：戰地後送、深凍、暴擊風暴
  { id: 'medevac', name: '戰地後送', grant: { read: (g) => g.health, value: 8 } },
  { id: 'deep_freeze', name: '深凍協議', mod: { read: (m) => m.enemySlow, cmp: 'gt', value: 0.4 } },
  { id: 'crit_storm', name: '暴擊風暴', mod: { read: (m) => m.critChanceAdd, cmp: 'gt', value: 0.15 } },
  // 第三批：掠奪令、特急許可、戰場搜刮
  { id: 'plunder', name: '掠奪令', mod: { read: (m) => m.enemyRewardMult, cmp: 'gt', value: 1.4 } },
  { id: 'express_permit', name: '特急許可', grant: { read: (g) => g.nextTowerDiscount, value: 0.45 } },
  { id: 'scavenge', name: '戰場搜刮', mod: { read: (m) => m.waveClearBonus, cmp: 'gt', value: 120 } },
  // 第四批：殺傷區、野戰醫院、粉碎協議
  { id: 'kill_zone', name: '殺傷區', mod: { read: (m) => m.damageMult, cmp: 'gt', value: 1.15 } },
  { id: 'field_hospital', name: '野戰醫院', grant: { read: (g) => g.health, value: 16 } },
  { id: 'shatter', name: '粉碎協議', mod: { read: (m) => m.enemyHealthMult, cmp: 'lt', value: 0.82 } },
  // 第五批：鑄幣廠、鐵幕、獵頭協議
  { id: 'mint', name: '鑄幣廠', mod: { read: (m) => m.incomeMult, cmp: 'gt', value: 1.3 } },
  { id: 'iron_curtain', name: '鐵幕', mod: { read: (m) => m.leakDamageMult, cmp: 'lt', value: 0.45 } },
  { id: 'headhunter', name: '獵頭協議', mod: { read: (m) => m.critChanceAdd, cmp: 'gt', value: 0.24 } },
  // 第六批：屯積、冰河期、準星協議
  { id: 'stockpile', name: '屯積協議', mod: { read: (m) => m.waveClearBonus, cmp: 'gt', value: 220 } },
  { id: 'ice_age', name: '冰河期', mod: { read: (m) => m.enemySlow, cmp: 'gt', value: 0.58 } },
  { id: 'bullseye', name: '準星協議', mod: { read: (m) => m.critChanceAdd, cmp: 'gt', value: 0.3 } },
  // 第七批：發薪日、超視、淘汰協議
  { id: 'payday', name: '發薪日', grant: { read: (g) => g.money, value: 170 } },
  { id: 'overwatch', name: '超視協議', mod: { read: (m) => m.rangeMult, cmp: 'gt', value: 1.28 } },
  { id: 'culling', name: '淘汰協議', mod: { read: (m) => m.enemyHealthMult, cmp: 'lt', value: 0.72 } },
  // 第八批：橫財、遠眺、處決協議
  { id: 'windfall', name: '橫財', grant: { read: (g) => g.money, value: 220 } },
  { id: 'longshot', name: '遠眺協議', mod: { read: (m) => m.rangeMult, cmp: 'gt', value: 1.35 } },
  { id: 'execute', name: '處決協議', mod: { read: (m) => m.enemyHealthMult, cmp: 'lt', value: 0.65 } },
  // 第九批：大運、冰川、清算協議
  { id: 'haul', name: '大運', grant: { read: (g) => g.money, value: 260 } },
  { id: 'glacier', name: '冰川協議', mod: { read: (m) => m.enemySlow, cmp: 'gt', value: 0.7 } },
  { id: 'purge', name: '清算協議', mod: { read: (m) => m.enemyHealthMult, cmp: 'lt', value: 0.58 } },
];

const STRATEGY_CASES: StrategyCase[] = [
  { strategy: 'defensive', rivals: ['bounty', 'deep_freeze', 'crit_storm'], expected: 'deep_freeze' },
  { strategy: 'defensive', rivals: ['bounty', 'medevac', 'crit_storm'], expected: 'medevac' },
  { strategy: 'aggressive', rivals: ['bounty', 'deep_freeze', 'crit_storm'], expected: 'crit_storm' },
  { strategy: 'economy', rivals: ['bounty', 'plunder', 'salvage_rights'], expected: 'plunder' },
  { strategy: 'economy', rivals: ['rush_permit', 'express_permit', 'bounty'], expected: 'express_permit' },
  { strategy: 'economy', rivals: ['salvage_rights', 'scavenge', 'bounty'], expected: 'scavenge' },
  { strategy: 'aggressive', rivals: ['salvo', 'kill_zone', 'weakness_scan'], expected: 'kill_zone' },
  { strategy: 'aggressive', rivals: ['weakness_scan', 'shatter', 'salvo'], expected: 'shatter' },
  { strategy: 'defensive', rivals: ['medevac', 'field_hospital', 'salvo'], expected: 'field_hospital' },
  { strategy: 'economy', rivals: ['bounty', 'mint', 'salvo'], expected: 'mint' },
  { strategy: 'defensive', rivals: ['field_hospital', 'iron_curtain', 'salvo'], expected: 'iron_curtain' },
  { strategy: 'aggressive', rivals: ['salvo', 'headhunter', 'bounty'], expected: 'headhunter' },
  { strategy: 'economy', rivals: ['bounty', 'stockpile', 'salvo'], expected: 'stockpile' },
  { strategy: 'defensive', rivals: ['field_hospital', 'ice_age', 'salvo'], expected: 'ice_age' },
  { strategy: 'aggressive', rivals: ['salvo', 'bullseye', 'bounty'], expected: 'bullseye' },
  { strategy: 'economy', rivals: ['bounty', 'payday', 'salvo'], expected: 'payday' },
  { strategy: 'defensive', rivals: ['field_hospital', 'overwatch', 'salvo'], expected: 'overwatch' },
  { strategy: 'aggressive', rivals: ['salvo', 'culling', 'bounty'], expected: 'culling' },
  { strategy: 'economy', rivals: ['bounty', 'windfall', 'salvo'], expected: 'windfall' },
  { strategy: 'defensive', rivals: ['field_hospital', 'longshot', 'salvo'], expected: 'longshot' },
  { strategy: 'aggressive', rivals: ['salvo', 'execute', 'bounty'], expected: 'execute' },
  { strategy: 'economy', rivals: ['bounty', 'haul', 'salvo'], expected: 'haul' },
  { strategy: 'defensive', rivals: ['field_hospital', 'glacier', 'salvo'], expected: 'glacier' },
  { strategy: 'aggressive', rivals: ['salvo', 'purge', 'bounty'], expected: 'purge' },
];

const findProtocol = (id: string) => TACTICAL_PROTOCOLS.find((p) => p.id === id);

describe('戰術協議池', () => {
  it('池內 id 唯一', () => {
    const ids = TACTICAL_PROTOCOLS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(PROTOCOL_CASES)('$id 進池後名稱、描述與真實效果都成立', (entry) => {
    const protocol = findProtocol(entry.id);
    expect(protocol, entry.id).toBeDefined();
    expect(protocol!.name).toBe(entry.name);
    expect(protocol!.description.length, entry.id).toBeGreaterThan(0);

    if (entry.mod) {
      const value = entry.mod.read(getProtocolWaveMods(protocol!));
      if (entry.mod.cmp === 'gt') {
        expect(value, entry.id).toBeGreaterThan(entry.mod.value);
      } else {
        expect(value, entry.id).toBeLessThan(entry.mod.value);
      }
    }

    if (entry.grant) {
      expect(entry.grant.read(applyInstantGrant(protocol!)), entry.id).toBeGreaterThan(entry.grant.value);
    }
  });

  it.each(STRATEGY_CASES)('自動戰鬥在 $strategy 策略下優先選 $expected', ({ strategy, rivals, expected }) => {
    const offers = rivals.map((id) => {
      const protocol = findProtocol(id);
      expect(protocol, id).toBeDefined();
      return protocol!;
    });
    expect(pickProtocolForStrategy(offers, strategy).id).toBe(expected);
  });

  it('成就目標跟著協議池大小走', () => {
    const poolSize = TACTICAL_PROTOCOLS.length;
    expect(poolSize).toBeGreaterThanOrEqual(39);
    for (const id of ['protocol_variety', 'tactic_protocol_all']) {
      const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === id);
      expect(achievement, id).toBeDefined();
      expect(achievement!.conditions[0].target).toBe(poolSize);
      expect(achievement!.description).toContain(String(poolSize));
    }
  });

  it('沒有協議時 wave mods 是中性值', () => {
    expect(getProtocolWaveMods(null).damageMult).toBe(1);
    expect(getProtocolWaveMods(null).incomeMult).toBe(1);
  });
});
