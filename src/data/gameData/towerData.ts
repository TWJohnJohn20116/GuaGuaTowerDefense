import type { TowerData, TowerType } from '@/types/game';

// 塔数据
// 注意: range 使用格子單位，實際像素距離 = range * tileSize
export const TOWER_DATA: Record<TowerType, TowerData> = {
  basic: {
    name: '基礎塔',
    damage: 25,
    range: 4,      // 4 格射程
    fireRate: 1.0,
    cost: 100,
    color: '#6496ff',
    projectileColor: '#78aaff',
    highlightColor: '#96c8ff',
    projectileSpeed: 0.003,
    projectileSize: 7,
    critChance: 0.1,
    critMultiplier: 1.5,
    description: '基礎防禦塔，攻擊速度和傷害均衡；打被狙擊標記的敵人傷害 ×1.35'
  },
  sniper: {
    name: '狙擊塔',
    damage: 100,
    range: 6.5,    // 6.5 格射程
    fireRate: 0.5,
    cost: 200,
    color: '#ff6464',
    projectileColor: '#ff7878',
    highlightColor: '#ff9696',
    projectileSpeed: 0.007,
    projectileSize: 5,
    critChance: 0.2,
    critMultiplier: 2.5,
    description: '遠程狙擊塔，射程遠但攻速慢；命中會標記，打被標記的敵人傷害 ×1.5'
  },
  cannon: {
    name: '加農炮塔',
    damage: 65,
    range: 3.25,   // 3.25 格射程
    fireRate: 0.8,
    cost: 150,
    color: '#ff9632',
    projectileColor: '#ffaa46',
    highlightColor: '#ffc864',
    projectileSpeed: 0.0025,
    projectileSize: 14,
    splash: true,
    splashRadius: 1.5,  // 1.5 格濺射半徑
    description: '範圍傷害塔，濺射命中會短暫暈眩；打正在暈眩的敵人傷害 ×1.4'
  },
  machine: {
    name: '機槍塔',
    damage: 13,
    range: 3.5,    // 3.5 格射程
    fireRate: 2.5,
    cost: 120,
    color: '#96ff64',
    projectileColor: '#aaff78',
    highlightColor: '#c8ff96',
    projectileSpeed: 0.005,
    projectileSize: 4,
    description: '高攻速機槍塔，命中會短暫沉默；打正在沉默的敵人傷害 ×1.18，對飛行敵人傷害提升 35%'
  },
  ballista: {
    name: '弩炮塔',
    damage: 70,
    range: 5,      // 5 格射程
    fireRate: 0.5,
    cost: 170,
    color: '#d2a24c',
    projectileColor: '#e8c476',
    highlightColor: '#f0d898',
    projectileSpeed: 0.006,
    projectileSize: 9,
    critChance: 0.15,
    critMultiplier: 2.0,
    description: '弩炮塔，發射貫穿直線上所有敵人的重型弩矢；命中會定身，打被定身的敵人傷害 ×1.4'
  },
  shotgun: {
    name: '散彈塔',
    damage: 28,
    range: 2.5,    // 短射程
    fireRate: 0.6,
    cost: 180,
    color: '#a0a0a0',
    projectileColor: '#d0d0d0',
    highlightColor: '#e0e0e0',
    projectileSpeed: 0.004,
    projectileSize: 4,
    critChance: 0.15,
    critMultiplier: 1.5,
    description: '散彈塔，射程短但一次發射多發穿透彈；命中會流血，打正在流血的敵人傷害 ×1.35'
  },
  frost: {
    name: '冰凍塔',
    damage: 20,
    range: 3.75,   // 3.75 格射程
    fireRate: 1.2,
    cost: 180,
    color: '#64c8ff',
    projectileColor: '#44ddff',
    highlightColor: '#b4e6ff',
    projectileSpeed: 0.003,
    projectileSize: 10,
    slowEffect: true,
    slowAmount: 0.5,
    slowDuration: 2000,
    description: '冰凍塔，攻擊減緩敵人移動速度 50%；連打三下會凍結，打正在凍結的敵人傷害 ×1.28，解凍時碎裂造成傷害'
  },
  poison: {
    name: '毒塔',
    damage: 12,
    range: 4,      // 4 格射程
    fireRate: 1.0,
    cost: 160,
    color: '#96ff32',
    projectileColor: '#b4ff64',
    highlightColor: '#c8ff96',
    projectileSpeed: 0.0025,
    projectileSize: 8,
    poisonEffect: true,
    poisonDamage: 6,
    poisonDuration: 3000,
    description: '毒塔，命中無視裝甲與護盾；打正在中毒的敵人傷害 ×1.2'
  },
  laser: {
    name: '雷射塔',
    damage: 125,
    range: 7.25,   // 7.25 格射程
    fireRate: 0.6,
    cost: 250,
    color: '#ff32ff',
    projectileColor: '#ff64ff',
    highlightColor: '#ff96ff',
    projectileSpeed: 0,
    projectileSize: 0,
    instantHit: true,
    laserEffect: true,
    description: '雷射塔，遠程高傷害；打已被破甲的敵人傷害 ×1.22，血量低於 30% 時處決加傷'
  },
  lightning: {
    name: '電擊塔',
    damage: 40,
    range: 4.5,    // 4.5 格射程
    fireRate: 1.0,
    cost: 220,
    color: '#ffff64',
    projectileColor: '#ffff96',
    highlightColor: '#ffffc8',
    projectileSpeed: 0,
    projectileSize: 0,
    instantHit: true,
    lightningEffect: true,
    chainCount: 3,
    chainDamageReduction: 0.7,
    description: '電擊塔，連鎖攻擊多個敵人；打正在虛弱的敵人傷害 ×1.16，對飛行敵人傷害提升 28%'
  },
  flame: {
    name: '火焰塔',
    damage: 0,
    damagePerSecond: 25,
    range: 3.5,    // 3.5 格射程
    cost: 200,
    color: '#ff6432',
    projectileColor: '#ff9650',
    highlightColor: '#ffc864',
    projectileSpeed: 0,
    projectileSize: 0,
    flameEffect: true,
    description: '火焰塔，噴射無視裝甲；點燃後噴流傷害 ×1.25，血量低於 40% 時處決加傷'
  },
  money: {
    name: '錢塔',
    damage: 0,
    range: 0,
    fireRate: 0,
    cost: 200,
    color: '#ffd700',
    projectileColor: '#ffec8b',
    highlightColor: '#fff8dc',
    projectileSpeed: 0,
    projectileSize: 0,
    moneyGeneration: true,
    moneyPerSecond: 10,
    description: '錢塔，每秒自動產生 $10 金幣；光環內擊殺額外 +30% 賞金'
  },
  wind: {
    name: '風塔',
    damage: 5,
    range: 3.5,
    fireRate: 0.6,
    cost: 225,
    color: '#a8d8ea',
    projectileColor: '#e0f7fa',
    highlightColor: '#b2ebf2',
    windEffect: true,
    windKnockbackDistance: 2.5,
    description: '風塔，風刃擊退並附加恐懼；打正在恐懼的敵人傷害 ×1.26，對飛行敵人傷害提升 22%'
  },
  pulse: {
    name: '脈衝塔',
    damage: 35,
    range: 3.0,
    fireRate: 0.8,
    cost: 260,
    color: '#00ffff',
    projectileColor: '#80ffff',
    highlightColor: '#ccffff',
    projectileSpeed: 0,
    projectileSize: 0,
    pulseEffect: true,
    critChance: 0.1,
    critMultiplier: 2.0,
    description: '脈衝塔，能量環命中會短暫破甲；打已被破甲的敵人傷害 ×1.3'
  },

  // ===== 融合塔（由兩座塔合體產生，可再升級 / 有技能）=====
  // 暴風塔 = 冰凍 + 電擊：範圍減速 + 連鎖閃電
  storm: {
    name: '暴風塔',
    damage: 55,
    range: 4.75,
    fireRate: 1.1,
    cost: 400,
    color: '#7ad7ff',
    projectileColor: '#bff0ff',
    highlightColor: '#e0fbff',
    projectileSpeed: 0,
    projectileSize: 0,
    instantHit: true,
    lightningEffect: true,
    chainCount: 4,
    chainDamageReduction: 0.72,
    slowEffect: true,
    slowAmount: 0.45,
    slowDuration: 1800,
    critChance: 0.15,
    critMultiplier: 2.2,
    description: '暴風塔，由冰凍與電擊合體而成，雷擊連鎖減速、附加虛弱並穿盾；打正在虛弱的敵人傷害 ×1.16，打正在凍結的敵人傷害 ×1.28，解凍碎裂，對飛行加傷'
  },
  // 瘟疫塔 = 毒 + 火焰：毒霧持續 + 燃燒 DoT 疊加
  plague: {
    name: '瘟疫塔',
    damage: 0,
    damagePerSecond: 45,
    range: 3.75,
    cost: 360,
    color: '#9bdb3a',
    projectileColor: '#c8f57a',
    highlightColor: '#dcffa0',
    projectileSpeed: 0,
    projectileSize: 0,
    flameEffect: true,
    poisonEffect: true,
    poisonDamage: 8,
    poisonDuration: 3500,
    critChance: 0.1,
    critMultiplier: 1.8,
    description: '瘟疫塔，由毒與火焰合體而成，噴射同時施加灼燒與劇毒；點燃後 ×1.25，追毒 ×1.2，血量低於 40% 處決'
  },
  // 攻城塔 = 加農炮 + 狙擊：遠程重型濺射
  demolisher: {
    name: '攻城塔',
    damage: 95,
    range: 6.0,
    fireRate: 0.7,
    cost: 350,
    color: '#ff8a4c',
    projectileColor: '#ffb06a',
    highlightColor: '#ffd28c',
    projectileSpeed: 0.0032,
    projectileSize: 16,
    splash: true,
    splashRadius: 1.75,
    critChance: 0.2,
    critMultiplier: 2.4,
    description: '攻城塔，由加農炮與狙擊合體而成，遠程濺射同時暈眩並標記整群；打被標記的敵人傷害 ×1.5，打正在暈眩的敵人傷害 ×1.4'
  },
  // 颶風塔 = 風 + 脈衝：大範圍擊退 + 全域脈衝爆發
  tempest: {
    name: '颶風塔',
    damage: 45,
    range: 3.25,
    fireRate: 0.9,
    cost: 485,
    color: '#5fe6d8',
    projectileColor: '#a8f5ec',
    highlightColor: '#d6fff9',
    projectileSpeed: 0,
    projectileSize: 0,
    pulseEffect: true,
    windEffect: true,
    windKnockbackDistance: 3.5,
    critChance: 0.12,
    critMultiplier: 2.0,
    description: '颶風塔，由風與脈衝合體而成，能量環破甲並附加恐懼；打已被破甲的敵人傷害 ×1.3，打正在恐懼的敵人傷害 ×1.26，對飛行加傷 22%'
  }
};
