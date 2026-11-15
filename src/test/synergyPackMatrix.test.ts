/**
 * 鄰塔協同的參數化行為測試
 *
 * 原本是 8 支 synergyPack2..9.test.ts：同一套骨架複製 8 次（id 唯一、名稱、
 * 配方查詢、正交相鄰生效、圖鑑／放置預覽、成就目標對齊），每支只差 3 組塔配對。
 * 收斂成 it.each 之後，新增一批協同只要往 SYNERGY_CASES 加 3 筆。
 */

import { describe, it, expect } from 'vitest';
import {
  TOWER_SYNERGIES,
  findSynergyRecipe,
  getSynergyModsForTower,
  getEncyclopediaSynergiesForTower,
  previewPlacementSynergies,
} from '@/data/towerSynergyData';
import { ALL_ACHIEVEMENTS } from '@/data/achievementData';
import type { TowerType } from '@/types/game';

/** 配方定義與生效後的 mods 都有這四個倍率，矩陣只需要它們 */
type SynergyBonus = {
  fireRateMult: number;
  damageMult: number;
  rangeMult: number;
  incomeMult: number;
};

interface TowerPos {
  id: string;
  type: TowerType;
  col: number;
  row: number;
}

interface SynergyCase {
  id: string;
  name: string;
  pair: [TowerType, TowerType];
  /** 生效後必須 > 1 的那個倍率 */
  mod: (bonus: SynergyBonus) => number;
  /** 少數配方兩側塔都要吃到加成 */
  both?: boolean;
  /** 正交相鄰的兩座塔（col/row 相鄰） */
  adjacent: [TowerPos, TowerPos];
  /** 圖鑑：[塔, 應列出的夥伴] */
  encyclopedia: [TowerType, TowerType];
  /** 放置預覽：新放的塔 + 既有的鄰塔 */
  preview?: { placing: TowerPos; neighbor: TowerPos };
}

const tower = (id: string, type: TowerType, col: number, row: number): TowerPos => ({ id, type, col, row });

const SYNERGY_CASES: SynergyCase[] = [
  // 第二批：破風校準、脈衝雷網、攻城連線
  {
    id: 'wind_snipe', name: '破風校準', pair: ['wind', 'sniper'], mod: (m) => m.rangeMult, both: true,
    adjacent: [tower('w', 'wind', 2, 2), tower('s', 'sniper', 3, 2)],
    encyclopedia: ['wind', 'sniper'],
    preview: { placing: tower('s', 'sniper', 3, 2), neighbor: tower('w', 'wind', 2, 2) },
  },
  {
    id: 'pulse_bolt', name: '脈衝雷網', pair: ['pulse', 'lightning'], mod: (m) => m.damageMult,
    adjacent: [tower('p', 'pulse', 4, 4), tower('l', 'lightning', 4, 5)],
    encyclopedia: ['pulse', 'lightning'],
  },
  {
    id: 'siege_line', name: '攻城連線', pair: ['ballista', 'cannon'], mod: (m) => m.damageMult,
    adjacent: [tower('b', 'ballista', 6, 6), tower('c', 'cannon', 7, 6)],
    encyclopedia: ['ballista', 'cannon'],
  },
  // 第三批：雙準連線、燃爆砲火、風脈共振
  {
    id: 'beam_snipe', name: '雙準連線', pair: ['laser', 'sniper'], mod: (m) => m.rangeMult,
    adjacent: [tower('l', 'laser', 2, 2), tower('s', 'sniper', 3, 2)],
    encyclopedia: ['laser', 'sniper'],
    preview: { placing: tower('s', 'sniper', 3, 2), neighbor: tower('l', 'laser', 2, 2) },
  },
  {
    id: 'blaze_cannon', name: '燃爆砲火', pair: ['flame', 'cannon'], mod: (m) => m.damageMult,
    adjacent: [tower('f', 'flame', 4, 4), tower('c', 'cannon', 4, 5)],
    encyclopedia: ['flame', 'cannon'],
  },
  {
    id: 'gale_pulse', name: '風脈共振', pair: ['wind', 'pulse'], mod: (m) => m.fireRateMult,
    adjacent: [tower('w', 'wind', 6, 6), tower('p', 'pulse', 7, 6)],
    encyclopedia: ['wind', 'pulse'],
  },
  // 第四批：寒霜散彈、脈衝金庫、弩準連線
  {
    id: 'chill_shot', name: '寒霜散彈', pair: ['frost', 'shotgun'], mod: (m) => m.damageMult,
    adjacent: [tower('f', 'frost', 2, 2), tower('g', 'shotgun', 3, 2)],
    encyclopedia: ['frost', 'shotgun'],
    preview: { placing: tower('g', 'shotgun', 3, 2), neighbor: tower('f', 'frost', 2, 2) },
  },
  {
    id: 'pulse_vault', name: '脈衝金庫', pair: ['money', 'pulse'], mod: (m) => m.incomeMult,
    adjacent: [tower('m', 'money', 4, 4), tower('p', 'pulse', 4, 5)],
    encyclopedia: ['money', 'pulse'],
  },
  {
    id: 'siege_snipe', name: '弩準連線', pair: ['ballista', 'sniper'], mod: (m) => m.rangeMult,
    adjacent: [tower('b', 'ballista', 6, 6), tower('s', 'sniper', 7, 6)],
    encyclopedia: ['ballista', 'sniper'],
  },
  // 第五批：雷光連線、彈幕火網、霜風夾擊
  {
    id: 'volt_beam', name: '雷光連線', pair: ['laser', 'lightning'], mod: (m) => m.damageMult,
    adjacent: [tower('l', 'laser', 2, 2), tower('n', 'lightning', 3, 2)],
    encyclopedia: ['laser', 'lightning'],
  },
  {
    id: 'spray_line', name: '彈幕火網', pair: ['shotgun', 'machine'], mod: (m) => m.fireRateMult,
    adjacent: [tower('g', 'shotgun', 4, 4), tower('m', 'machine', 4, 5)],
    encyclopedia: ['shotgun', 'machine'],
    preview: { placing: tower('m', 'machine', 4, 5), neighbor: tower('g', 'shotgun', 4, 4) },
  },
  {
    id: 'frost_gale', name: '霜風夾擊', pair: ['frost', 'wind'], mod: (m) => m.rangeMult,
    adjacent: [tower('f', 'frost', 6, 6), tower('w', 'wind', 7, 6)],
    encyclopedia: ['frost', 'wind'],
  },
  // 第六批：燃機火網、脈衝砲擊、毒雷連線
  {
    id: 'ember_spray', name: '燃機火網', pair: ['flame', 'machine'], mod: (m) => m.fireRateMult,
    adjacent: [tower('f', 'flame', 2, 2), tower('m', 'machine', 3, 2)],
    encyclopedia: ['flame', 'machine'],
    preview: { placing: tower('m', 'machine', 3, 2), neighbor: tower('f', 'flame', 2, 2) },
  },
  {
    id: 'pulse_cannon', name: '脈衝砲擊', pair: ['pulse', 'cannon'], mod: (m) => m.damageMult,
    adjacent: [tower('p', 'pulse', 4, 4), tower('c', 'cannon', 4, 5)],
    encyclopedia: ['pulse', 'cannon'],
  },
  {
    id: 'toxic_bolt', name: '毒雷連線', pair: ['poison', 'lightning'], mod: (m) => m.damageMult,
    adjacent: [tower('o', 'poison', 6, 6), tower('l', 'lightning', 7, 6)],
    encyclopedia: ['poison', 'lightning'],
  },
  // 第七批：毒霧散彈、攻城烈焰、基砲連線
  {
    id: 'toxic_shot', name: '毒霧散彈', pair: ['poison', 'shotgun'], mod: (m) => m.damageMult,
    adjacent: [tower('o', 'poison', 2, 2), tower('g', 'shotgun', 3, 2)],
    encyclopedia: ['poison', 'shotgun'],
  },
  {
    id: 'siege_flame', name: '攻城烈焰', pair: ['ballista', 'flame'], mod: (m) => m.damageMult,
    adjacent: [tower('b', 'ballista', 4, 4), tower('f', 'flame', 4, 5)],
    encyclopedia: ['ballista', 'flame'],
  },
  {
    id: 'base_cannon', name: '基砲連線', pair: ['basic', 'cannon'], mod: (m) => m.fireRateMult,
    adjacent: [tower('a', 'basic', 6, 6), tower('c', 'cannon', 7, 6)],
    encyclopedia: ['basic', 'cannon'],
    preview: { placing: tower('c', 'cannon', 7, 6), neighbor: tower('a', 'basic', 6, 6) },
  },
  // 第八批：雷散連線、燃脈連線、機砲火網
  {
    id: 'volt_spray', name: '雷散連線', pair: ['lightning', 'shotgun'], mod: (m) => m.damageMult,
    adjacent: [tower('l', 'lightning', 2, 2), tower('g', 'shotgun', 3, 2)],
    encyclopedia: ['lightning', 'shotgun'],
  },
  {
    id: 'ember_pulse', name: '燃脈連線', pair: ['flame', 'pulse'], mod: (m) => m.fireRateMult,
    adjacent: [tower('f', 'flame', 4, 4), tower('p', 'pulse', 4, 5)],
    encyclopedia: ['flame', 'pulse'],
  },
  {
    id: 'mill_cannon', name: '機砲火網', pair: ['machine', 'cannon'], mod: (m) => m.damageMult,
    adjacent: [tower('m', 'machine', 6, 6), tower('c', 'cannon', 7, 6)],
    encyclopedia: ['machine', 'cannon'],
    preview: { placing: tower('c', 'cannon', 7, 6), neighbor: tower('m', 'machine', 6, 6) },
  },
  // 第九批：毒脈連線、焰束連線、砲庫連線
  {
    id: 'toxic_pulse', name: '毒脈連線', pair: ['poison', 'pulse'], mod: (m) => m.damageMult,
    adjacent: [tower('o', 'poison', 2, 2), tower('p', 'pulse', 3, 2)],
    encyclopedia: ['poison', 'pulse'],
  },
  {
    id: 'beam_flame', name: '焰束連線', pair: ['laser', 'flame'], mod: (m) => m.damageMult,
    adjacent: [tower('l', 'laser', 4, 4), tower('f', 'flame', 4, 5)],
    encyclopedia: ['laser', 'flame'],
  },
  {
    id: 'vault_cannon', name: '砲庫連線', pair: ['money', 'cannon'], mod: (m) => m.incomeMult,
    adjacent: [tower('m', 'money', 6, 6), tower('c', 'cannon', 7, 6)],
    encyclopedia: ['money', 'cannon'],
    preview: { placing: tower('c', 'cannon', 7, 6), neighbor: tower('m', 'money', 6, 6) },
  },
];

describe('鄰塔協同', () => {
  it('池內 id 唯一', () => {
    const ids = TOWER_SYNERGIES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(SYNERGY_CASES)('$id 有真實配方、描述與加成倍率', (entry) => {
    const recipe = TOWER_SYNERGIES.find((s) => s.id === entry.id);
    expect(recipe, entry.id).toBeDefined();
    expect(recipe!.name).toBe(entry.name);
    expect(recipe!.description.length, entry.id).toBeGreaterThan(0);
    expect(findSynergyRecipe(entry.pair[0], entry.pair[1])?.id).toBe(entry.id);
    expect(entry.mod(recipe!), entry.id).toBeGreaterThan(1);
  });

  it.each(SYNERGY_CASES)('$id 在正交相鄰時真的生效', (entry) => {
    const [a, b] = entry.adjacent;
    expect(entry.mod(getSynergyModsForTower(a, [a, b])), entry.id).toBeGreaterThan(1);
    if (entry.both) {
      expect(entry.mod(getSynergyModsForTower(b, [a, b])), entry.id).toBeGreaterThan(1);
    }
  });

  it.each(SYNERGY_CASES)('$id 出現在圖鑑與放置預覽', (entry) => {
    const [towerType, partnerType] = entry.encyclopedia;
    expect(
      getEncyclopediaSynergiesForTower(towerType).some((s) => s.partnerType === partnerType),
      entry.id,
    ).toBe(true);

    if (entry.preview) {
      const previews = previewPlacementSynergies(
        entry.preview.placing.type,
        entry.preview.placing.col,
        entry.preview.placing.row,
        [entry.preview.neighbor],
      );
      expect(previews.map((p) => p.name)).toContain(entry.name);
    }
  });

  it('圖鑑成就目標跟著協同池大小走', () => {
    const poolSize = TOWER_SYNERGIES.length;
    expect(poolSize).toBeGreaterThanOrEqual(32);
    const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === 'synergy_catalog');
    expect(achievement).toBeDefined();
    expect(achievement!.conditions[0].target).toBe(poolSize);
    expect(achievement!.description).toContain(String(poolSize));
  });
});
