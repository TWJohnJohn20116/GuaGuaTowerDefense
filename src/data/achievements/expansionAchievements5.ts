/**
 * 第五批擴充成就：終極/極限挑戰、城市文化、深度收藏
 * Expansion Achievements 5: Apex Challenges, Cultural, Deep Collection
 */

import type { Achievement } from '@/types/achievement';
import React from 'react';
import {
  TowerIcon, ShieldIcon, ShieldLockIcon, SwordsIcon, SwordIcon,
  CrosshairIcon, TargetIcon, ExplosionIcon, BombIcon, ZapIcon,
  FlameIcon, SnowflakeIcon, LightningIcon, TornadoIcon,
  StarIcon, MedalIcon, TrophyIcon, CrownIcon, SparklesIcon,
  ChartIcon, BrainIcon, EyeIcon,
  HeartIcon, BrokenHeartIcon, SkullIcon,
  PaletteIcon, GiftIcon, CalendarIcon, ClockIcon, TimerIcon,
  CoinIcon, MoneyBagIcon, ShopIcon,
  PuzzleIcon, MagicIcon, LinkIcon2,
  RainbowIcon, FlowerIcon, CloverIcon,
  RobotIcon, AlienMonsterIcon, DragonIcon,
  GamepadIcon, DiceIcon, CrystalBallIcon,
  OpenBookIcon, BooksIcon, MapIcon,
  GraduationCapIcon,
} from '@/components/ui/Icons';

// =====================================================================
// QQ. 終極挑戰 (Apex Battles) - 真正的極限
// =====================================================================
export const apexBattleAchievements: Achievement[] = [
  { id: 'apex_kill_2k_solo_game', name: '單局殲滅 2000', description: '單局擊殺 2,000 個敵人', icon: React.createElement(SwordsIcon, { className: 'w-8 h-8 text-rose-500' }), category: 'challenge', rarity: 'epic', conditions: [{ type: 'custom', target: 2000 }], rewards: [{ type: 'points', value: 70 }], order: 530 },
  { id: 'apex_kill_10k_solo_game', name: '單局萬人斬', description: '單局擊殺 10,000 個敵人', icon: React.createElement(SkullIcon, { className: 'w-8 h-8 text-fuchsia-500' }), category: 'legendary', rarity: 'legendary', conditions: [{ type: 'custom', target: 10000 }], rewards: [{ type: 'points', value: 250 }, { type: 'title', value: '萬人斬主' }], order: 531 },
  { id: 'apex_no_tower_sold_clear', name: '無賣通關', description: '通關時未賣出任何塔（困難以上）', icon: React.createElement(ShieldLockIcon, { className: 'w-8 h-8 text-emerald-400' }), category: 'challenge', rarity: 'rare', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 30 }], order: 532 },
  { id: 'apex_only_lv1_clear', name: '一級獨尊', description: '所有塔都維持在 Lv1 通關普通難度', icon: React.createElement(TowerIcon, { className: 'w-8 h-8 text-blue-400' }), category: 'challenge', rarity: 'epic', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 60 }, { type: 'title', value: '初心者大師' }], order: 533 },
  { id: 'apex_solo_tower_clear', name: '單塔守城', description: '僅用 1 座塔通關困難難度', icon: React.createElement(TowerIcon, { className: 'w-8 h-8 text-rose-400' }), category: 'legendary', rarity: 'legendary', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 250 }, { type: 'title', value: '單塔主義者' }], prerequisite: ['minimalist'], order: 534 },
  { id: 'apex_blind_clear', name: '盲挑戰', description: '完成從未通關過的地圖（首次嘗試直接通關）', icon: React.createElement(EyeIcon, { className: 'w-8 h-8 text-purple-400' }), category: 'challenge', rarity: 'rare', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 30 }], order: 535 },
  { id: 'apex_speed_endless_50', name: '極速無盡 50', description: '在 30 分鐘內完成無盡 50 波', icon: React.createElement(ZapIcon, { className: 'w-8 h-8 text-yellow-400' }), category: 'speedrun', rarity: 'epic', conditions: [{ type: 'custom', target: 50 }], rewards: [{ type: 'points', value: 70 }, { type: 'title', value: '極速無盡' }], order: 536 },
  { id: 'apex_perfect_endless_100', name: '完美無盡 100', description: '在無盡模式中無傷完成 100 波', icon: React.createElement(SparklesIcon, { className: 'w-8 h-8 text-emerald-400' }), category: 'legendary', rarity: 'legendary', conditions: [{ type: 'custom', target: 100 }], rewards: [{ type: 'points', value: 250 }, { type: 'title', value: '完美無盡' }], order: 537 },
  { id: 'apex_double_speed_clear', name: '雙倍速通關', description: '以 2 倍速通關困難難度', icon: React.createElement(ClockIcon, { className: 'w-8 h-8 text-cyan-400' }), category: 'speedrun', rarity: 'rare', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 30 }], order: 538 },
  { id: 'apex_quick_finish', name: '十波速通', description: '在 5 分鐘內通關 10 波關卡', icon: React.createElement(TimerIcon, { className: 'w-8 h-8 text-cyan-400' }), category: 'speedrun', rarity: 'uncommon', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 20 }], order: 539 },
];

// =====================================================================
// RR. 戰略大師 (Strategic Master)
// =====================================================================
export const strategicMasterAchievements: Achievement[] = [
  { id: 'strat_chokepoint_master', name: '咽喉要道', description: '在敵人路徑的轉彎處集中放置 10 座塔', icon: React.createElement(TargetIcon, { className: 'w-8 h-8 text-emerald-400' }), category: 'rare', rarity: 'rare', conditions: [{ type: 'custom', target: 10 }], rewards: [{ type: 'points', value: 30 }], order: 550 },
  { id: 'strat_perimeter_defender', name: '邊境守衛', description: '在地圖邊緣放置 20 座塔通關', icon: React.createElement(ShieldIcon, { className: 'w-8 h-8 text-blue-300' }), category: 'rare', rarity: 'uncommon', conditions: [{ type: 'custom', target: 20 }], rewards: [{ type: 'points', value: 20 }], order: 551 },
  { id: 'strat_funnel_master', name: '漏斗陣型', description: '在路徑出口處集中 8 座塔擊殺 500 敵人', icon: React.createElement(CrosshairIcon, { className: 'w-8 h-8 text-red-300' }), category: 'rare', rarity: 'rare', conditions: [{ type: 'custom', target: 500 }], rewards: [{ type: 'points', value: 30 }, { type: 'title', value: '漏斗陣型' }], order: 552 },
  { id: 'strat_overkill', name: '過度殺戮', description: '單發攻擊造成超過 10 倍敵人生命值的傷害', icon: React.createElement(BombIcon, { className: 'w-8 h-8 text-orange-500' }), category: 'rare', rarity: 'uncommon', conditions: [{ type: 'custom', target: 10 }], rewards: [{ type: 'points', value: 20 }], order: 553 },
  { id: 'strat_speed_build', name: '極速布陣', description: '在第一波到來前建造並升級 5 座塔到 Lv3+', icon: React.createElement(SwordIcon, { className: 'w-8 h-8 text-purple-400' }), category: 'challenge', rarity: 'rare', conditions: [{ type: 'custom', target: 5 }], rewards: [{ type: 'points', value: 30 }], order: 554 },
];

// =====================================================================
// SS. 美學收藏 (Aesthetic Collection)
// =====================================================================
export const aestheticCollectionAchievements: Achievement[] = [
  { id: 'aest_rainbow_skin', name: '彩虹之心', description: '為塔裝備 7 種不同色系的皮膚', icon: React.createElement(RainbowIcon, { className: 'w-8 h-8 text-pink-400' }), category: 'collection', rarity: 'rare', conditions: [{ type: 'custom', target: 7 }], rewards: [{ type: 'points', value: 30 }], order: 560 },
  { id: 'aest_seasonal_skins', name: '四季皮膚', description: '收集四季主題的所有皮膚', icon: React.createElement(FlowerIcon, { className: 'w-8 h-8 text-emerald-300' }), category: 'collection', rarity: 'epic', conditions: [{ type: 'custom', target: 4 }], rewards: [{ type: 'points', value: 60 }, { type: 'title', value: '四季皮膚收藏家' }], order: 561 },
  { id: 'aest_rare_skin_obtained', name: '稀有發現', description: '解鎖第一個稀有級別皮膚', icon: React.createElement(CrystalBallIcon, { className: 'w-8 h-8 text-fuchsia-400' }), category: 'collection', rarity: 'rare', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 30 }], order: 562 },
  { id: 'aest_legendary_skin', name: '傳說皮膚', description: '解鎖第一個傳說級別皮膚', icon: React.createElement(CrownIcon, { className: 'w-8 h-8 text-amber-500' }), category: 'collection', rarity: 'legendary', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 100 }, { type: 'title', value: '傳說擁有者' }], order: 563 },
  { id: 'aest_full_outfit_match', name: '全套裝', description: '為同一場遊戲中所有塔裝備相同主題皮膚', icon: React.createElement(PaletteIcon, { className: 'w-8 h-8 text-rose-300' }), category: 'collection', rarity: 'rare', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 35 }, { type: 'title', value: '時尚指揮官' }], order: 564 },
];

// =====================================================================
// TT. 經濟極致 (Economy Extremes)
// =====================================================================
export const economyExtremesAchievements: Achievement[] = [
  { id: 'eco_money_500k_in_game', name: '單場 50 萬', description: '單場累積金錢達 500,000', icon: React.createElement(CoinIcon, { className: 'w-8 h-8 text-amber-400' }), category: 'economy', rarity: 'rare', conditions: [{ type: 'custom', target: 500000 }], rewards: [{ type: 'points', value: 35 }], order: 570 },
  { id: 'eco_money_999999', name: '九九九九九', description: '單場金錢達到 999,999', icon: React.createElement(MoneyBagIcon, { className: 'w-8 h-8 text-yellow-500' }), category: 'hidden', rarity: 'epic', conditions: [{ type: 'custom', target: 999999 }], rewards: [{ type: 'points', value: 60 }, { type: 'title', value: '九九九' }], hidden: true, order: 571 },
  { id: 'eco_spend_all_no_money', name: '一無所有', description: '單場結束時金錢剩餘 0', icon: React.createElement(BrokenHeartIcon, { className: 'w-8 h-8 text-slate-400' }), category: 'hidden', rarity: 'common', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 10 }], hidden: true, order: 572 },
  { id: 'eco_shop_marathon', name: '購物狂', description: '在商店累計購買 50 個項目', icon: React.createElement(ShopIcon, { className: 'w-8 h-8 text-emerald-300' }), category: 'economy', rarity: 'uncommon', conditions: [{ type: 'custom', target: 50 }], rewards: [{ type: 'points', value: 25 }], order: 573 },
  { id: 'eco_no_money_tower_win', name: '無金錢塔通關', description: '不建造任何金錢塔通關困難難度', icon: React.createElement(MoneyBagIcon, { className: 'w-8 h-8 text-orange-400' }), category: 'challenge', rarity: 'rare', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 30 }], order: 574 },
];

// =====================================================================
// UU. 完美主義 (Perfectionism)
// =====================================================================
export const perfectionismAchievements: Achievement[] = [
  { id: 'perfect_no_skill_use', name: '禁慾通關', description: '完全不使用主動技能通關普通難度', icon: React.createElement(BrainIcon, { className: 'w-8 h-8 text-emerald-400' }), category: 'challenge', rarity: 'uncommon', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 20 }], order: 580 },
  { id: 'perfect_no_skill_hard', name: '純粹防守', description: '完全不使用主動技能通關困難難度', icon: React.createElement(BrainIcon, { className: 'w-8 h-8 text-cyan-400' }), category: 'challenge', rarity: 'rare', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 35 }], order: 581 },
  { id: 'perfect_no_pause', name: '不停止', description: '通關困難難度不暫停', icon: React.createElement(ClockIcon, { className: 'w-8 h-8 text-blue-300' }), category: 'challenge', rarity: 'rare', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 30 }], order: 582 },
  { id: 'perfect_streak_no_dmg_50', name: '完美 50 場', description: '累計完成 50 場無傷通關', icon: React.createElement(ShieldIcon, { className: 'w-8 h-8 text-emerald-400' }), category: 'noDamage', rarity: 'epic', conditions: [{ type: 'custom', target: 50 }], rewards: [{ type: 'points', value: 70 }, { type: 'title', value: '完美主義者' }], order: 583 },
  { id: 'perfect_streak_no_dmg_200', name: '完美 200 場', description: '累計完成 200 場無傷通關', icon: React.createElement(SparklesIcon, { className: 'w-8 h-8 text-pink-400' }), category: 'noDamage', rarity: 'legendary', conditions: [{ type: 'custom', target: 200 }], rewards: [{ type: 'points', value: 250 }, { type: 'title', value: '完美宗師' }], order: 584 },
];

// =====================================================================
// VV. 城市文化 (Cultural)
// =====================================================================
export const culturalAchievements: Achievement[] = [
  { id: 'culture_party_player', name: '派對玩家', description: '在午夜跨年時刻遊戲', icon: React.createElement(GiftIcon, { className: 'w-8 h-8 text-pink-400' }), category: 'hidden', rarity: 'rare', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 30 }, { type: 'title', value: '跨年戰士' }], hidden: true, secret: true, order: 590 },
  { id: 'culture_mothers_day', name: '母親節溫情', description: '在母親節遊戲', icon: React.createElement(HeartIcon, { className: 'w-8 h-8 text-rose-300' }), category: 'hidden', rarity: 'uncommon', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 20 }], hidden: true, secret: true, order: 591 },
  { id: 'culture_fathers_day', name: '父親節敬意', description: '在父親節遊戲', icon: React.createElement(StarIcon, { className: 'w-8 h-8 text-blue-400' }), category: 'hidden', rarity: 'uncommon', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 20 }], hidden: true, secret: true, order: 592 },
  { id: 'culture_independence', name: '建國紀念', description: '在 10 月 10 日遊戲', icon: React.createElement(MedalIcon, { className: 'w-8 h-8 text-amber-300' }), category: 'hidden', rarity: 'uncommon', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 20 }], hidden: true, secret: true, order: 593 },
  { id: 'culture_april_fools', name: '愚人之選', description: '在 4 月 1 日遊戲', icon: React.createElement(CloverIcon, { className: 'w-8 h-8 text-emerald-400' }), category: 'hidden', rarity: 'rare', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 30 }, { type: 'title', value: '愚人節玩家' }], hidden: true, secret: true, order: 594 },
];

// =====================================================================
// WW. 智慧之路 (Wisdom Path)
// =====================================================================
export const wisdomPathAchievements: Achievement[] = [
  { id: 'wis_quick_tutorial', name: '速習者', description: '在 10 分鐘內完成所有訓練', icon: React.createElement(GraduationCapIcon, { className: 'w-8 h-8 text-emerald-300' }), category: 'progress', rarity: 'uncommon', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 25 }], order: 600 },
  { id: 'wis_review_all_replays', name: '反省精神', description: '重看自己的回放 20 次', icon: React.createElement(EyeIcon, { className: 'w-8 h-8 text-violet-300' }), category: 'collection', rarity: 'uncommon', conditions: [{ type: 'custom', target: 20 }], rewards: [{ type: 'points', value: 20 }], order: 601 },
  { id: 'wis_compare_towers', name: '比較大師', description: '在圖鑑館比較不同塔 30 次', icon: React.createElement(ChartIcon, { className: 'w-8 h-8 text-cyan-400' }), category: 'collection', rarity: 'common', conditions: [{ type: 'custom', target: 30 }], rewards: [{ type: 'points', value: 15 }], order: 602 },
  { id: 'wis_strategy_thinker', name: '戰略思考者', description: '在統計頁面查看不同統計 50 次', icon: React.createElement(BrainIcon, { className: 'w-8 h-8 text-blue-400' }), category: 'collection', rarity: 'uncommon', conditions: [{ type: 'custom', target: 50 }], rewards: [{ type: 'points', value: 25 }], order: 603 },
];

// =====================================================================
// XX. 怪物獵人 (Monster Hunter)
// =====================================================================
export const monsterHunterAchievements: Achievement[] = [
  { id: 'mon_dragon_slayer', name: '屠龍勇士', description: '擊殺 50 個龍類敵人', icon: React.createElement(DragonIcon, { className: 'w-8 h-8 text-red-500' }), category: 'enemy', rarity: 'rare', conditions: [{ type: 'custom', target: 50 }], rewards: [{ type: 'points', value: 30 }, { type: 'title', value: '屠龍勇士' }], order: 610 },
  { id: 'mon_dragon_master', name: '龍族剋星', description: '擊殺 200 個龍類敵人', icon: React.createElement(DragonIcon, { className: 'w-8 h-8 text-orange-500' }), category: 'enemy', rarity: 'epic', conditions: [{ type: 'custom', target: 200 }], rewards: [{ type: 'points', value: 60 }, { type: 'title', value: '龍族剋星' }], order: 611 },
  { id: 'mon_machine_destroyer', name: '機械破壞者', description: '擊殺 500 個機械敵人', icon: React.createElement(RobotIcon, { className: 'w-8 h-8 text-slate-400' }), category: 'enemy', rarity: 'rare', conditions: [{ type: 'custom', target: 500 }], rewards: [{ type: 'points', value: 30 }], order: 612 },
  { id: 'mon_alien_exterminator', name: '異星滅絕者', description: '擊殺 1,000 個異星敵人', icon: React.createElement(AlienMonsterIcon, { className: 'w-8 h-8 text-emerald-500' }), category: 'enemy', rarity: 'epic', conditions: [{ type: 'custom', target: 1000 }], rewards: [{ type: 'points', value: 60 }, { type: 'title', value: '異星滅絕者' }], order: 613 },
  { id: 'mon_flying_hunter', name: '飛行剋星', description: '擊殺 500 個飛行類敵人', icon: React.createElement(TornadoIcon, { className: 'w-8 h-8 text-sky-400' }), category: 'enemy', rarity: 'uncommon', conditions: [{ type: 'custom', target: 500 }], rewards: [{ type: 'points', value: 25 }], order: 614 },
];

// =====================================================================
// YY. 純極端 (Pure Extreme)
// =====================================================================
export const pureExtremeAchievements: Achievement[] = [
  { id: 'pure_basic_only_nightmare', name: '基礎噩夢', description: '僅用基礎塔通關噩夢難度', icon: React.createElement(TowerIcon, { className: 'w-8 h-8 text-blue-500' }), category: 'legendary', rarity: 'legendary', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 300 }, { type: 'title', value: '基礎噩夢' }], order: 620 },
  { id: 'pure_sniper_only_hard', name: '神槍之主', description: '僅用狙擊塔通關困難難度', icon: React.createElement(CrosshairIcon, { className: 'w-8 h-8 text-red-500' }), category: 'legendary', rarity: 'epic', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 70 }, { type: 'title', value: '神槍之主' }], order: 621 },
  { id: 'pure_cannon_only_hard', name: '炮王', description: '僅用加農炮塔通關困難難度', icon: React.createElement(BombIcon, { className: 'w-8 h-8 text-orange-500' }), category: 'legendary', rarity: 'epic', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 70 }, { type: 'title', value: '炮王' }], order: 622 },
  { id: 'pure_flame_only_hard', name: '焰之御者', description: '僅用火焰塔通關困難難度', icon: React.createElement(FlameIcon, { className: 'w-8 h-8 text-orange-500' }), category: 'legendary', rarity: 'epic', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 70 }, { type: 'title', value: '焰之御者' }], order: 623 },
  { id: 'pure_frost_only_hard', name: '冰之主', description: '僅用冰霜塔通關困難難度', icon: React.createElement(SnowflakeIcon, { className: 'w-8 h-8 text-cyan-400' }), category: 'legendary', rarity: 'epic', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 70 }, { type: 'title', value: '冰之主' }], order: 624 },
  { id: 'pure_lightning_only_hard', name: '雷神', description: '僅用閃電塔通關困難難度', icon: React.createElement(LightningIcon, { className: 'w-8 h-8 text-yellow-400' }), category: 'legendary', rarity: 'epic', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 70 }, { type: 'title', value: '雷神' }], order: 625 },
];

// =====================================================================
// ZZ. 隱秘成就 (Cryptic Hidden)
// =====================================================================
export const crypticHiddenAchievements: Achievement[] = [
  { id: 'cryptic_total_reset', name: '重新開始', description: '完全重置遊戲存檔後再次通關第一關', icon: React.createElement(MedalIcon, { className: 'w-8 h-8 text-emerald-300' }), category: 'hidden', rarity: 'rare', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 30 }], hidden: true, secret: true, order: 630 },
  { id: 'cryptic_self_destruct', name: '自我毀滅', description: '在一場遊戲中賣出 50 座塔', icon: React.createElement(SkullIcon, { className: 'w-8 h-8 text-rose-500' }), category: 'hidden', rarity: 'uncommon', conditions: [{ type: 'tower_sells', target: 50 }], rewards: [{ type: 'points', value: 25 }], hidden: true, order: 631 },
  { id: 'cryptic_zen_master', name: '禪之心', description: '在不操作的情況下度過 30 秒（敵人來襲時）', icon: React.createElement(BrainIcon, { className: 'w-8 h-8 text-emerald-300' }), category: 'hidden', rarity: 'common', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 10 }], hidden: true, secret: true, order: 632 },
  { id: 'cryptic_settings_loop', name: '設定迷', description: '進入設定再返回 50 次', icon: React.createElement(PuzzleIcon, { className: 'w-8 h-8 text-purple-400' }), category: 'hidden', rarity: 'common', conditions: [{ type: 'custom', target: 50 }], rewards: [{ type: 'points', value: 10 }], hidden: true, secret: true, order: 633 },
  { id: 'cryptic_credit_viewer', name: '製作群粉絲', description: '觀看製作群名單', icon: React.createElement(BooksIcon, { className: 'w-8 h-8 text-violet-300' }), category: 'hidden', rarity: 'rare', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 30 }, { type: 'title', value: '幕後英雄' }], hidden: true, secret: true, order: 634 },
];

// =====================================================================
// AAA. 細微觀察 (Subtle Observation)
// =====================================================================
export const subtleObservationAchievements: Achievement[] = [
  { id: 'subtle_easter_egg_1', name: '彩蛋發現者', description: '發現遊戲中的隱藏彩蛋', icon: React.createElement(GiftIcon, { className: 'w-8 h-8 text-pink-400' }), category: 'hidden', rarity: 'rare', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 30 }], hidden: true, secret: true, order: 640 },
  { id: 'subtle_5_easter_eggs', name: '彩蛋獵人', description: '發現 5 個隱藏彩蛋', icon: React.createElement(MagicIcon, { className: 'w-8 h-8 text-fuchsia-400' }), category: 'hidden', rarity: 'epic', conditions: [{ type: 'custom', target: 5 }], rewards: [{ type: 'points', value: 60 }, { type: 'title', value: '彩蛋獵人' }], hidden: true, order: 641 },
  { id: 'subtle_curious_player', name: '好奇心爆棚', description: '點擊背景元素 100 次', icon: React.createElement(EyeIcon, { className: 'w-8 h-8 text-violet-400' }), category: 'hidden', rarity: 'common', conditions: [{ type: 'custom', target: 100 }], rewards: [{ type: 'points', value: 10 }], hidden: true, order: 642 },
  { id: 'subtle_master_explorer', name: '深度探索者', description: '使用過所有遊戲功能至少一次', icon: React.createElement(MapIcon, { className: 'w-8 h-8 text-cyan-400' }), category: 'collection', rarity: 'epic', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 70 }, { type: 'title', value: '深度探索者' }], order: 643 },
];

// =====================================================================
// BBB. 紀念碑與英雄 (Memorial & Heroes)
// =====================================================================
export const memorialHeroAchievements: Achievement[] = [
  { id: 'mem_first_visit', name: '初訪紀念碑', description: '第一次造訪紀念碑', icon: React.createElement(FlowerIcon, { className: 'w-8 h-8 text-rose-300' }), category: 'progress', rarity: 'common', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 5 }], order: 650 },
  { id: 'mem_read_all', name: '永誌不忘', description: '閱讀紀念碑上所有英雄事蹟', icon: React.createElement(HeartIcon, { className: 'w-8 h-8 text-rose-400' }), category: 'collection', rarity: 'rare', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 30 }, { type: 'title', value: '永誌不忘' }], order: 651 },
];

// =====================================================================
// CCC. 戰術協議 (Tactical Protocol)
// =====================================================================
export const tacticalProtocolAchievements: Achievement[] = [
  { id: 'protocol_first', name: '第一份協議', description: '選擇第一次戰術協議', icon: React.createElement(TargetIcon, { className: 'w-8 h-8 text-cyan-400' }), category: 'progress', rarity: 'common', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 5 }], order: 660 },
  { id: 'protocol_ten', name: '前線指揮官', description: '累計選擇 10 次戰術協議', icon: React.createElement(TargetIcon, { className: 'w-8 h-8 text-cyan-300' }), category: 'progress', rarity: 'uncommon', conditions: [{ type: 'custom', target: 10 }], rewards: [{ type: 'points', value: 20 }], order: 661 },
  { id: 'protocol_fifty', name: '協議大師', description: '累計選擇 50 次戰術協議', icon: React.createElement(MedalIcon, { className: 'w-8 h-8 text-amber-400' }), category: 'milestone', rarity: 'rare', conditions: [{ type: 'custom', target: 50 }], rewards: [{ type: 'points', value: 40 }, { type: 'title', value: '協議大師' }], order: 662 },
  { id: 'protocol_variety', name: '全能調度', description: '選擇過全部 39 種戰術協議', icon: React.createElement(SparklesIcon, { className: 'w-8 h-8 text-violet-400' }), category: 'collection', rarity: 'epic', conditions: [{ type: 'custom', target: 39 }], rewards: [{ type: 'points', value: 80 }, { type: 'title', value: '全能調度' }], order: 663 },
];

// =====================================================================
// CCC-2. 鄰塔協同 (Tower Synergy)
// =====================================================================
export const adjacencySynergyAchievements: Achievement[] = [
  { id: 'synergy_first', name: '鄰塔共鳴', description: '首次觸發鄰塔協同', icon: React.createElement(LinkIcon2, { className: 'w-8 h-8 text-cyan-400' }), category: 'progress', rarity: 'common', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 5 }], order: 664 },
  { id: 'synergy_three', name: '陣型師', description: '同一場同時維持 3 種不同協同', icon: React.createElement(LinkIcon2, { className: 'w-8 h-8 text-cyan-300' }), category: 'challenge', rarity: 'rare', conditions: [{ type: 'custom', target: 3 }], rewards: [{ type: 'points', value: 35 }, { type: 'title', value: '陣型師' }], order: 665 },
  { id: 'synergy_catalog', name: '協同圖鑑', description: '累計觸發全部 32 種鄰塔協同', icon: React.createElement(SparklesIcon, { className: 'w-8 h-8 text-violet-300' }), category: 'collection', rarity: 'epic', conditions: [{ type: 'custom', target: 32 }], rewards: [{ type: 'points', value: 80 }, { type: 'title', value: '協同圖鑑' }], order: 666 },
];

// =====================================================================
// DDD. 命運與運氣 (Fate & Luck)
// =====================================================================
export const fateLuckAchievements: Achievement[] = [
  { id: 'luck_lucky_streak', name: '幸運連發', description: '連續 5 場遊戲都觸發暴擊機率事件', icon: React.createElement(DiceIcon, { className: 'w-8 h-8 text-emerald-400' }), category: 'hidden', rarity: 'uncommon', conditions: [{ type: 'custom', target: 5 }], rewards: [{ type: 'points', value: 20 }], hidden: true, order: 670 },
  { id: 'luck_critical_master', name: '暴擊狂', description: '單場觸發 200 次暴擊', icon: React.createElement(ZapIcon, { className: 'w-8 h-8 text-yellow-400' }), category: 'tower', rarity: 'rare', conditions: [{ type: 'custom', target: 200 }], rewards: [{ type: 'points', value: 30 }], order: 671 },
  { id: 'luck_jackpot', name: '頭獎中獎', description: '在開發者面板中觸發 1% 機率事件', icon: React.createElement(SparklesIcon, { className: 'w-8 h-8 text-amber-400' }), category: 'hidden', rarity: 'legendary', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 200 }, { type: 'title', value: '頭獎中獎' }], hidden: true, secret: true, order: 672 },
];

// =====================================================================
// EEE. 集大成 (Final Compilation)
// =====================================================================
export const finalCompilationAchievements: Achievement[] = [
  { id: 'final_200_achievements', name: '兩百榮譽', description: '解鎖 200 個成就', icon: React.createElement(MedalIcon, { className: 'w-8 h-8 text-amber-400' }), category: 'milestone', rarity: 'legendary', conditions: [{ type: 'custom', target: 200 }], rewards: [{ type: 'points', value: 200 }, { type: 'title', value: '兩百榮譽' }], order: 700 },
  { id: 'final_300_achievements', name: '三百榮譽', description: '解鎖 300 個成就', icon: React.createElement(CrownIcon, { className: 'w-8 h-8 text-amber-500' }), category: 'milestone', rarity: 'legendary', conditions: [{ type: 'custom', target: 300 }], rewards: [{ type: 'points', value: 300 }, { type: 'title', value: '三百榮譽' }], order: 701 },
  { id: 'final_400_achievements', name: '四百榮譽', description: '解鎖 400 個成就', icon: React.createElement(TrophyIcon, { className: 'w-8 h-8 text-rose-500' }), category: 'milestone', rarity: 'legendary', conditions: [{ type: 'custom', target: 400 }], rewards: [{ type: 'points', value: 400 }, { type: 'title', value: '四百榮譽' }], order: 702 },
  { id: 'final_all_achievements', name: '全成就', description: '解鎖所有成就', icon: React.createElement(CrownIcon, { className: 'w-8 h-8 text-pink-500' }), category: 'legendary', rarity: 'legendary', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 1000 }, { type: 'title', value: '完美收藏者' }], order: 703 },
  { id: 'final_perfectionist', name: '究極完美主義', description: '所有成就達到 3 星評價', icon: React.createElement(SparklesIcon, { className: 'w-8 h-8 text-pink-400' }), category: 'legendary', rarity: 'legendary', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 500 }, { type: 'title', value: '究極完美主義' }], order: 704 },
  { id: 'final_legendary_total', name: '傳說殿堂', description: '解鎖所有傳說級成就', icon: React.createElement(CrownIcon, { className: 'w-8 h-8 text-fuchsia-500' }), category: 'legendary', rarity: 'legendary', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 500 }, { type: 'title', value: '傳說殿堂' }], order: 705 },
  { id: 'final_legendary_hunter', name: '傳說獵人', description: '解鎖 50 個傳說級成就', icon: React.createElement(StarIcon, { className: 'w-8 h-8 text-amber-500' }), category: 'legendary', rarity: 'legendary', conditions: [{ type: 'custom', target: 50 }], rewards: [{ type: 'points', value: 400 }, { type: 'title', value: '傳說獵人' }], order: 706 },
  { id: 'final_secret_finder', name: '秘密發現者', description: '解鎖 30 個秘密成就', icon: React.createElement(CrystalBallIcon, { className: 'w-8 h-8 text-violet-500' }), category: 'hidden', rarity: 'legendary', conditions: [{ type: 'custom', target: 30 }], rewards: [{ type: 'points', value: 300 }, { type: 'title', value: '秘密發現者' }], order: 707 },
  { id: 'final_500_unlocked', name: '五百完成者', description: '解鎖 500 個成就', icon: React.createElement(SparklesIcon, { className: 'w-8 h-8 text-pink-500' }), category: 'legendary', rarity: 'legendary', conditions: [{ type: 'custom', target: 500 }], rewards: [{ type: 'points', value: 500 }, { type: 'title', value: '五百完成者' }], order: 708 },
];

// =====================================================================
// FFF. 補強系列 (Supplementary)
// =====================================================================
export const supplementaryAchievements: Achievement[] = [
  { id: 'supp_easy_master', name: '簡單通才', description: '在簡單難度下通關 20 張地圖', icon: React.createElement(ShieldIcon, { className: 'w-8 h-8 text-emerald-300' }), category: 'progress', rarity: 'common', conditions: [{ type: 'custom', target: 20 }], rewards: [{ type: 'points', value: 15 }], order: 720 },
  { id: 'supp_normal_master', name: '普通通才', description: '在普通難度下通關 20 張地圖', icon: React.createElement(ShieldIcon, { className: 'w-8 h-8 text-cyan-400' }), category: 'progress', rarity: 'uncommon', conditions: [{ type: 'custom', target: 20 }], rewards: [{ type: 'points', value: 25 }], order: 721 },
  { id: 'supp_hard_master', name: '困難通才', description: '在困難難度下通關 20 張地圖', icon: React.createElement(ShieldIcon, { className: 'w-8 h-8 text-rose-400' }), category: 'progress', rarity: 'rare', conditions: [{ type: 'custom', target: 20 }], rewards: [{ type: 'points', value: 40 }], order: 722 },
  { id: 'supp_nightmare_master', name: '噩夢通才', description: '在噩夢難度下通關 10 張地圖', icon: React.createElement(SkullIcon, { className: 'w-8 h-8 text-purple-500' }), category: 'challenge', rarity: 'epic', conditions: [{ type: 'custom', target: 10 }], rewards: [{ type: 'points', value: 80 }, { type: 'title', value: '噩夢通才' }], order: 723 },
  { id: 'supp_impossible_master', name: '極限通才', description: '在極限難度下通關 5 張地圖', icon: React.createElement(CrownIcon, { className: 'w-8 h-8 text-red-600' }), category: 'legendary', rarity: 'legendary', conditions: [{ type: 'custom', target: 5 }], rewards: [{ type: 'points', value: 200 }, { type: 'title', value: '極限通才' }], order: 724 },
  { id: 'supp_custom_difficulty', name: '自訂難度', description: '使用自訂難度通關 10 場', icon: React.createElement(GamepadIcon, { className: 'w-8 h-8 text-violet-400' }), category: 'challenge', rarity: 'uncommon', conditions: [{ type: 'custom', target: 10 }], rewards: [{ type: 'points', value: 25 }], order: 725 },
  { id: 'supp_no_loss_streak_3', name: '初步連勝', description: '連續 3 場遊戲不敗', icon: React.createElement(TrophyIcon, { className: 'w-8 h-8 text-amber-300' }), category: 'progress', rarity: 'common', conditions: [{ type: 'custom', target: 3 }], rewards: [{ type: 'points', value: 10 }], order: 726 },
  { id: 'supp_open_book', name: '開卷有益', description: '在圖鑑館停留累計 10 分鐘', icon: React.createElement(OpenBookIcon, { className: 'w-8 h-8 text-blue-300' }), category: 'collection', rarity: 'common', conditions: [{ type: 'custom', target: 600 }], rewards: [{ type: 'points', value: 10 }], hidden: true, order: 727 },
  { id: 'supp_evening_player', name: '黃昏戰士', description: '在 17 點到 19 點之間遊玩', icon: React.createElement(CalendarIcon, { className: 'w-8 h-8 text-orange-400' }), category: 'hidden', rarity: 'common', conditions: [{ type: 'custom', target: 1 }], rewards: [{ type: 'points', value: 10 }], hidden: true, order: 728 },
  { id: 'supp_total_explosion', name: '爆炸宗師', description: '單場觸發 200 次爆炸效果', icon: React.createElement(ExplosionIcon, { className: 'w-8 h-8 text-orange-500' }), category: 'tower', rarity: 'rare', conditions: [{ type: 'custom', target: 200 }], rewards: [{ type: 'points', value: 30 }], order: 729 },
];
