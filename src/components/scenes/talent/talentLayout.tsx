/**
 * 天賦樹版面配置
 * 集中管理節點座標、類別圖示與標籤色
 *
 * HARDLINE：類別色只用文字標籤的資料色（經濟=警示黃、攻擊=危險紅、
 * 防禦=資訊藍、輔助=成功綠），節點本體只用訊號色，不用彩虹。
 */

import type React from 'react';
import { CoinIcon, SwordsIcon, ShieldIcon, WrenchIcon } from '@/components/ui/Icons';
import type { Translations } from '@/i18n';
import type { TalentCategory } from '@/store/talentStore';

interface CategoryStyle {
  /** 標籤文字用的資料色 class */
  color: string;
}

export const CATEGORY_STYLES: Record<TalentCategory, CategoryStyle> = {
  economy: { color: 'text-[var(--hl-caution)]' },
  offense: { color: 'text-[var(--hl-alarm)]' },
  defense: { color: 'text-[var(--hl-reach)]' },
  utility: { color: 'text-[var(--hl-vital)]' },
};

export const CATEGORY_LIST: TalentCategory[] = ['economy', 'offense', 'defense', 'utility'];

export const getCategoryLabel = (category: TalentCategory, t: Translations): string => {
  switch (category) {
    case 'economy': return t.talent.catEconomy;
    case 'offense': return t.talent.catOffense;
    case 'defense': return t.talent.catDefense;
    case 'utility': return t.talent.catUtility;
  }
};

export const getCategoryIcon = (category: TalentCategory, className = 'w-5 h-5'): React.ReactNode => {
  switch (category) {
    case 'economy':
      return <CoinIcon className={className} />;
    case 'offense':
      return <SwordsIcon className={className} />;
    case 'defense':
      return <ShieldIcon className={className} />;
    case 'utility':
      return <WrenchIcon className={className} />;
  }
};

/**
 * 節點在畫布上的座標（以畫面中心為原點）
 * X 方向：經濟分支由左到右展開，meta_coin_bonus 為終點
 * Y 方向：上半（經濟/工藝）、中間（防禦）、下半（攻擊）
 */
export const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  // 起點
  economy_starting_money: { x: -550, y: 0 },

  // 經濟分支
  economy_bounty_hunter: { x: -300, y: -220 },
  economy_greed: { x: -50, y: -300 },
  economy_first_blood: { x: 200, y: -380 },
  economy_starter_kit: { x: -800, y: -160 },

  // 工藝/降價分支
  utility_cheaper_towers: { x: -50, y: -160 },
  utility_mastery: { x: 200, y: -160 },

  // 防禦分支
  defense_extra_life: { x: -300, y: 0 },
  defense_armor: { x: -50, y: 0 },
  defense_iron_will: { x: 200, y: 0 },
  defense_keystone_fortress: { x: 450, y: 0 },

  // 範圍/混合
  utility_range: { x: 200, y: 80 },

  // 攻擊/傷害分支
  offense_damage: { x: -300, y: 220 },
  offense_sniper: { x: -50, y: 160 },
  offense_boss_slayer: { x: 200, y: 160 },

  // 攻擊/攻速分支
  offense_attack_speed: { x: -50, y: 300 },
  offense_overload: { x: 200, y: 300 },

  // 暴擊分支
  offense_critical_strike: { x: -300, y: 440 },
  offense_critical_focus: { x: -50, y: 440 },

  // 終極匯聚
  meta_coin_bonus: { x: 700, y: -80 },
  meta_grand_loot: { x: 950, y: -80 },

  // 攻擊專精延伸（狂戰士終極）
  offense_frenzy: { x: 450, y: 380 },
  offense_keystone_berserker: { x: 700, y: 300 },
};

/** 為了確保拖曳時看得到全部節點，計算邊界範圍 */
export const CANVAS_BOUNDS = (() => {
  const xs = Object.values(NODE_POSITIONS).map((p) => p.x);
  const ys = Object.values(NODE_POSITIONS).map((p) => p.y);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
})();
