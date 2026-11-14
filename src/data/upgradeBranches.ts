import type { TowerType, TowerUpgradeBranches } from '@/types/game';

// 基礎塔（非融合）的升級分支定義
const BASE_UPGRADE_BRANCHES: Omit<Record<TowerType, TowerUpgradeBranches>, 'storm' | 'plague' | 'demolisher' | 'tempest'> = {
  basic: {
    pathA: {
      name: '疾風路線',
      description: '專注於攻擊速度',
      icon: '⚡',
      level2: {
        name: '快速射擊',
        description: '攻擊速度+30%',
        icon: '💨',
        fireRateMultiplier: 1.3,
      },
      level3: {
        name: '疾風連射',
        description: '攻擊速度+50%，傷害+20%',
        icon: '🌪️',
        fireRateMultiplier: 1.5,
        damageMultiplier: 1.2,
      },
    },
    pathB: {
      name: '重擊路線',
      description: '專注於單發傷害',
      icon: '💥',
      level2: {
        name: '強化彈藥',
        description: '傷害+40%',
        icon: '🎯',
        damageMultiplier: 1.4,
      },
      level3: {
        name: '穿甲彈',
        description: '傷害+80%，射程+15%',
        icon: '💀',
        damageMultiplier: 1.8,
        rangeMultiplier: 1.15,
      },
    },
  },

  sniper: {
    pathA: {
      name: '神射手路線',
      description: '極致的射程與傷害',
      icon: '🎯',
      level2: {
        name: '精準瞄準',
        description: '射程+25%，傷害+20%',
        icon: '👁️',
        rangeMultiplier: 1.25,
        damageMultiplier: 1.2,
      },
      level3: {
        name: '致命一擊',
        description: '射程+40%，傷害+60%',
        icon: '☠️',
        rangeMultiplier: 1.4,
        damageMultiplier: 1.6,
      },
    },
    pathB: {
      name: '刺客路線',
      description: '更快的連續射擊',
      icon: '🗡️',
      level2: {
        name: '快速裝填',
        description: '攻速+40%',
        icon: '⏱️',
        fireRateMultiplier: 1.4,
      },
      level3: {
        name: '連環狙殺',
        description: '攻速+70%，傷害+25%',
        icon: '⚔️',
        fireRateMultiplier: 1.7,
        damageMultiplier: 1.25,
      },
    },
  },

  cannon: {
    pathA: {
      name: '炮兵路線',
      description: '更大的爆炸範圍',
      icon: '💣',
      level2: {
        name: '擴散彈',
        description: '爆炸範圍+40%',
        icon: '🔥',
        splashRadiusMultiplier: 1.4,
      },
      level3: {
        name: '集束炸彈',
        description: '爆炸範圍+70%，傷害+30%',
        icon: '🌋',
        splashRadiusMultiplier: 1.7,
        damageMultiplier: 1.3,
      },
    },
    pathB: {
      name: '破壞路線',
      description: '更高的單體傷害',
      icon: '⚒️',
      level2: {
        name: '穿甲彈頭',
        description: '傷害+50%',
        icon: '🔨',
        damageMultiplier: 1.5,
      },
      level3: {
        name: '毀滅砲彈',
        description: '傷害+100%，攻速+20%',
        icon: '💥',
        damageMultiplier: 2.0,
        fireRateMultiplier: 1.2,
      },
    },
  },

  machine: {
    pathA: {
      name: '火神路線',
      description: '極致的射擊速度',
      icon: '🔫',
      level2: {
        name: '加特林',
        description: '攻速+40%',
        icon: '⚡',
        fireRateMultiplier: 1.4,
      },
      level3: {
        name: '火神砲',
        description: '攻速+80%，射程+10%',
        icon: '🌪️',
        fireRateMultiplier: 1.8,
        rangeMultiplier: 1.1,
      },
    },
    pathB: {
      name: '重機槍路線',
      description: '更高的單發傷害',
      icon: '🎖️',
      level2: {
        name: '大口徑',
        description: '傷害+50%',
        icon: '💪',
        damageMultiplier: 1.5,
      },
      level3: {
        name: '重型機槍',
        description: '傷害+100%，攻速+20%',
        icon: '🏋️',
        damageMultiplier: 2.0,
        fireRateMultiplier: 1.2,
      },
    },
  },

  shotgun: {
    pathA: {
      name: '霰彈路線',
      description: '更廣的攻擊範圍',
      icon: '💥',
      level2: {
        name: '擴散彈',
        description: '射程+20%',
        icon: '🌊',
        rangeMultiplier: 1.2,
      },
      level3: {
        name: '破片飛濺',
        description: '射程+40%，傷害+20%',
        icon: '✨',
        rangeMultiplier: 1.4,
        damageMultiplier: 1.2,
      },
    },
    pathB: {
      name: '重管路線',
      description: '極致的近戰傷害',
      icon: '🔥',
      level2: {
        name: '加長槍管',
        description: '傷害+40%',
        icon: '🧨',
        damageMultiplier: 1.4,
      },
      level3: {
        name: '雙管齊發',
        description: '傷害+80%，攻速+20%',
        icon: '☠️',
        damageMultiplier: 1.8,
        fireRateMultiplier: 1.2,
      },
    },
  },

  ballista: {
    pathA: {
      name: '勁弩路線',
      description: '更遠的貫穿射程',
      icon: '🏹',
      level2: {
        name: '強化弓臂',
        description: '射程+25%，傷害+15%',
        icon: '🎯',
        rangeMultiplier: 1.25,
        damageMultiplier: 1.15,
      },
      level3: {
        name: '破城弩',
        description: '射程+45%，傷害+50%',
        icon: '🏰',
        rangeMultiplier: 1.45,
        damageMultiplier: 1.5,
      },
    },
    pathB: {
      name: '連弩路線',
      description: '更快的裝填速度',
      icon: '⚙️',
      level2: {
        name: '快速絞盤',
        description: '攻速+35%',
        icon: '⏱️',
        fireRateMultiplier: 1.35,
      },
      level3: {
        name: '連發弩機',
        description: '攻速+60%，傷害+30%',
        icon: '⚔️',
        fireRateMultiplier: 1.6,
        damageMultiplier: 1.3,
      },
    },
  },

  frost: {
    pathA: {
      name: '暴風雪路線',
      description: '更強的減速效果',
      icon: '❄️',
      level2: {
        name: '寒冰之力',
        description: '減速效果+30%',
        icon: '🌨️',
        slowAmountMultiplier: 1.3,
      },
      level3: {
        name: '極地風暴',
        description: '減速效果+60%，射程+20%',
        icon: '🌀',
        slowAmountMultiplier: 1.6,
        rangeMultiplier: 1.2,
      },
    },
    pathB: {
      name: '冰晶路線',
      description: '寒冷的傷害',
      icon: '💎',
      level2: {
        name: '冰刺',
        description: '傷害+60%',
        icon: '🔷',
        damageMultiplier: 1.6,
      },
      level3: {
        name: '絕對零度',
        description: '傷害+120%，減速+20%',
        icon: '💠',
        damageMultiplier: 2.2,
        slowAmountMultiplier: 1.2,
      },
    },
  },

  poison: {
    pathA: {
      name: '瘟疫路線',
      description: '更強的持續毒傷',
      icon: '☣️',
      level2: {
        name: '劇毒',
        description: '毒傷+50%',
        icon: '🧪',
        poisonDamageMultiplier: 1.5,
      },
      level3: {
        name: '致死瘟疫',
        description: '毒傷+100%，射程+15%',
        icon: '💀',
        poisonDamageMultiplier: 2.0,
        rangeMultiplier: 1.15,
      },
    },
    pathB: {
      name: '毒刺路線',
      description: '更高的直接傷害',
      icon: '🦂',
      level2: {
        name: '毒牙',
        description: '傷害+70%',
        icon: '🐍',
        damageMultiplier: 1.7,
      },
      level3: {
        name: '致命毒液',
        description: '傷害+140%，攻速+25%',
        icon: '🕷️',
        damageMultiplier: 2.4,
        fireRateMultiplier: 1.25,
      },
    },
  },

  laser: {
    pathA: {
      name: '死光路線',
      description: '極致的毀滅力量',
      icon: '🔴',
      level2: {
        name: '增幅光束',
        description: '傷害+40%，射程+15%',
        icon: '⭕',
        damageMultiplier: 1.4,
        rangeMultiplier: 1.15,
      },
      level3: {
        name: '毀滅射線',
        description: '傷害+100%，射程+30%',
        icon: '💫',
        damageMultiplier: 2.0,
        rangeMultiplier: 1.3,
      },
    },
    pathB: {
      name: '脈衝路線',
      description: '更快的充能速度',
      icon: '💜',
      level2: {
        name: '快速充能',
        description: '攻速+50%',
        icon: '⚡',
        fireRateMultiplier: 1.5,
      },
      level3: {
        name: '脈衝雷射',
        description: '攻速+90%，傷害+30%',
        icon: '🔮',
        fireRateMultiplier: 1.9,
        damageMultiplier: 1.3,
      },
    },
  },

  lightning: {
    pathA: {
      name: '風暴路線',
      description: '更多的連鎖目標',
      icon: '⛈️',
      level2: {
        name: '電弧擴展',
        description: '連鎖目標+2',
        icon: '🌩️',
        chainCountBonus: 2,
      },
      level3: {
        name: '雷霆風暴',
        description: '連鎖目標+4，傷害+30%',
        icon: '🌪️',
        chainCountBonus: 4,
        damageMultiplier: 1.3,
      },
    },
    pathB: {
      name: '雷擊路線',
      description: '更強的電擊傷害',
      icon: '⚡',
      level2: {
        name: '高壓電擊',
        description: '傷害+50%',
        icon: '💛',
        damageMultiplier: 1.5,
      },
      level3: {
        name: '雷神之怒',
        description: '傷害+100%，連鎖+1',
        icon: '🔱',
        damageMultiplier: 2.0,
        chainCountBonus: 1,
      },
    },
  },

  money: {
    pathA: {
      name: '投資路線',
      description: '更高的金幣產出',
      icon: '💎',
      level2: {
        name: '金幣加速',
        description: '產金速度+30%',
        icon: '💰',
        damageMultiplier: 1.3,
      },
      level3: {
        name: '黃金礦脈',
        description: '產金速度+80%',
        icon: '🏦',
        damageMultiplier: 1.8,
      },
    },
    pathB: {
      name: '利息路線',
      description: '累積金幣獲得額外產出',
      icon: '📈',
      level2: {
        name: '複利效果',
        description: '產金速度+20%，射程+20%',
        icon: '💹',
        damageMultiplier: 1.2,
        rangeMultiplier: 1.2,
      },
      level3: {
        name: '金融帝國',
        description: '產金速度+50%，射程+40%',
        icon: '🏰',
        damageMultiplier: 1.5,
        rangeMultiplier: 1.4,
      },
    },
  },
  wind: {
    pathA: {
      name: '狂風路線',
      description: '更強的擊退距離',
      icon: '🌪️',
      level2: {
        name: '強風',
        description: '傷害+30%，射程+15%',
        icon: '💨',
        damageMultiplier: 1.3,
        rangeMultiplier: 1.15,
      },
      level3: {
        name: '龍捲風',
        description: '傷害+70%，射程+30%',
        icon: '🌀',
        damageMultiplier: 1.7,
        rangeMultiplier: 1.3,
      },
    },
    pathB: {
      name: '疾風路線',
      description: '更快的攻擊頻率',
      icon: '🍃',
      level2: {
        name: '連續風刃',
        description: '攻速+40%',
        icon: '🌬️',
        fireRateMultiplier: 1.4,
      },
      level3: {
        name: '暴風驟雨',
        description: '攻速+80%，傷害+30%',
        icon: '⛈️',
        fireRateMultiplier: 1.8,
        damageMultiplier: 1.3,
      },
    },
  },
  flame: {
    pathA: {
      name: '地獄火路線',
      description: '更強的燃燒傷害',
      icon: '🔥',
      level2: {
        name: '烈焰強化',
        description: '傷害+40%',
        icon: '🌶️',
        damageMultiplier: 1.4,
      },
      level3: {
        name: '地獄烈焰',
        description: '傷害+90%，射程+15%',
        icon: '👹',
        damageMultiplier: 1.9,
        rangeMultiplier: 1.15,
      },
    },
    pathB: {
      name: '野火路線',
      description: '更大的燃燒範圍',
      icon: '🌋',
      level2: {
        name: '範圍擴大',
        description: '射程+30%',
        icon: '🔶',
        rangeMultiplier: 1.3,
      },
      level3: {
        name: '野火燎原',
        description: '射程+50%，傷害+40%',
        icon: '🌅',
        rangeMultiplier: 1.5,
        damageMultiplier: 1.4,
      },
    },
  },
  pulse: {
    pathA: {
      name: '過載共振',
      description: '強化單次脈衝的傷害與暴擊',
      icon: '💥',
      level2: {
        name: '能量增幅',
        description: '提升 30% 傷害，增加 10% 暴擊率',
        icon: '⚡',
        damageMultiplier: 1.3,
      },
      level3: {
        name: '毀滅震波',
        description: '提升 40% 傷害，大幅提升暴擊傷害',
        icon: '💥',
        damageMultiplier: 1.4,
      },
    },
    pathB: {
      name: '廣域頻率',
      description: '擴大影響範圍並提升釋放頻率',
      icon: '📡',
      level2: {
        name: '引力擴張',
        description: '提升 25% 射程範圍',
        icon: '🌀',
        rangeMultiplier: 1.25,
      },
      level3: {
        name: '高頻震盪',
        description: '提升 50% 攻擊速度',
        icon: '⏳',
        fireRateMultiplier: 1.5,
      },
    },
  },
};

// 獲取指定塔的升級分支
export const getTowerUpgradeBranches = (towerType: TowerType): TowerUpgradeBranches => {
  return TOWER_UPGRADE_BRANCHES[towerType];
};

// 計算升級後的屬性加成
export const getUpgradeBonus = (
  towerType: TowerType,
  path: 'A' | 'B',
  level: number
): {
  damageMultiplier: number;
  rangeMultiplier: number;
  fireRateMultiplier: number;
  splashRadiusMultiplier: number;
  slowAmountMultiplier: number;
  poisonDamageMultiplier: number;
  chainCountBonus: number;
} => {
  const branches = TOWER_UPGRADE_BRANCHES[towerType];
  const selectedPath = path === 'A' ? branches.pathA : branches.pathB;
  
  let result = {
    damageMultiplier: 1,
    rangeMultiplier: 1,
    fireRateMultiplier: 1,
    splashRadiusMultiplier: 1,
    slowAmountMultiplier: 1,
    poisonDamageMultiplier: 1,
    chainCountBonus: 0,
  };

  // 累積等級2的加成
  if (level >= 2) {
    const l2 = selectedPath.level2;
    result.damageMultiplier *= l2.damageMultiplier || 1;
    result.rangeMultiplier *= l2.rangeMultiplier || 1;
    result.fireRateMultiplier *= l2.fireRateMultiplier || 1;
    result.splashRadiusMultiplier *= l2.splashRadiusMultiplier || 1;
    result.slowAmountMultiplier *= l2.slowAmountMultiplier || 1;
    result.poisonDamageMultiplier *= l2.poisonDamageMultiplier || 1;
    result.chainCountBonus += l2.chainCountBonus || 0;
  }

  // 累積等級3的加成
  if (level >= 3) {
    const l3 = selectedPath.level3;
    result.damageMultiplier *= l3.damageMultiplier || 1;
    result.rangeMultiplier *= l3.rangeMultiplier || 1;
    result.fireRateMultiplier *= l3.fireRateMultiplier || 1;
    result.splashRadiusMultiplier *= l3.splashRadiusMultiplier || 1;
    result.slowAmountMultiplier *= l3.slowAmountMultiplier || 1;
    result.poisonDamageMultiplier *= l3.poisonDamageMultiplier || 1;
    result.chainCountBonus += l3.chainCountBonus || 0;
  }

  return result;
};

// ===== 融合塔升級分支 =====
export const FUSION_UPGRADE_BRANCHES: Record<'storm' | 'plague' | 'demolisher' | 'tempest', TowerUpgradeBranches> = {
  storm: {
    pathA: {
      name: '極地雷暴',
      description: '強化連鎖與減速',
      icon: '🌩️',
      level2: {
        name: '霜電增幅',
        description: '傷害+30%，減速+10%',
        icon: '❄️',
        damageMultiplier: 1.3,
        slowAmountMultiplier: 1.1,
      },
      level3: {
        name: '暴風核心',
        description: '連鎖+2，傷害+50%，射程+15%',
        icon: '🌪️',
        damageMultiplier: 1.5,
        rangeMultiplier: 1.15,
        chainCountBonus: 2,
      },
    },
    pathB: {
      name: '連鎖樞紐',
      description: '專注於連鎖打擊',
      icon: '🔗',
      level2: {
        name: '導電強化',
        description: '連鎖+1，攻速+20%',
        icon: '⚡',
        fireRateMultiplier: 1.2,
        chainCountBonus: 1,
      },
      level3: {
        name: '全域雷網',
        description: '連鎖+3，傷害+40%',
        icon: '🌐',
        damageMultiplier: 1.4,
        chainCountBonus: 3,
      },
    },
  },
  plague: {
    pathA: {
      name: '腐蝕之路',
      description: '強化劇毒',
      icon: '🧪',
      level2: {
        name: '劇毒濃縮',
        description: '毒傷+40%，灼燒+20%',
        icon: '☠️',
        poisonDamageMultiplier: 1.4,
        damageMultiplier: 1.2,
      },
      level3: {
        name: '腐朽領域',
        description: '毒傷+60%，射程+15%，攻速+20%',
        icon: '🦠',
        poisonDamageMultiplier: 1.6,
        rangeMultiplier: 1.15,
        fireRateMultiplier: 1.2,
      },
    },
    pathB: {
      name: '焚燼之炎',
      description: '強化灼燒',
      icon: '🔥',
      level2: {
        name: '烈焰催化',
        description: '灼燒+50%，攻速+15%',
        icon: '💥',
        damageMultiplier: 1.5,
        fireRateMultiplier: 1.15,
      },
      level3: {
        name: '煉獄焚化',
        description: '灼燒+80%，射程+20%',
        icon: '🌋',
        damageMultiplier: 1.8,
        rangeMultiplier: 1.2,
      },
    },
  },
  demolisher: {
    pathA: {
      name: '重砲路線',
      description: '專注於濺射',
      icon: '💣',
      level2: {
        name: '高爆彈藥',
        description: '濺射半徑+30%，傷害+20%',
        icon: '🧨',
        splashRadiusMultiplier: 1.3,
        damageMultiplier: 1.2,
      },
      level3: {
        name: '毀滅轟炸',
        description: '濺射半徑+50%，傷害+60%',
        icon: '☄️',
        splashRadiusMultiplier: 1.5,
        damageMultiplier: 1.6,
      },
    },
    pathB: {
      name: '精準路線',
      description: '專注於射程與單發',
      icon: '🎯',
      level2: {
        name: '長程校準',
        description: '射程+25%，傷害+20%',
        icon: '👁️',
        rangeMultiplier: 1.25,
        damageMultiplier: 1.2,
      },
      level3: {
        name: '狙擊重砲',
        description: '射程+40%，傷害+70%，暴擊+10%',
        icon: '💀',
        rangeMultiplier: 1.4,
        damageMultiplier: 1.7,
      },
    },
  },
  tempest: {
    pathA: {
      name: '颶風路線',
      description: '專注於擊退',
      icon: '🌀',
      level2: {
        name: '強風推進',
        description: '擊退距離+40%，傷害+15%',
        icon: '🌬️',
        damageMultiplier: 1.15,
        rangeMultiplier: 1.1,
      },
      level3: {
        name: '颶風之眼',
        description: '擊退距離+60%，射程+20%',
        icon: '🌀',
        rangeMultiplier: 1.2,
        damageMultiplier: 1.3,
      },
    },
    pathB: {
      name: '脈衝路線',
      description: '專注於範圍爆發',
      icon: '💠',
      level2: {
        name: '能量增幅',
        description: '傷害+35%，攻速+15%',
        icon: '⚡',
        damageMultiplier: 1.35,
        fireRateMultiplier: 1.15,
      },
      level3: {
        name: '共振爆發',
        description: '傷害+70%，攻速+30%',
        icon: '🌟',
        damageMultiplier: 1.7,
        fireRateMultiplier: 1.3,
      },
    },
  },
};

// 總表：基礎分支 + 融合塔分支
export const TOWER_UPGRADE_BRANCHES: Record<TowerType, TowerUpgradeBranches> = {
  ...BASE_UPGRADE_BRANCHES,
  ...FUSION_UPGRADE_BRANCHES,
};
