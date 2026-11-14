/**
 * 每日挑戰模板資料 + 產生器
 * Daily Challenge Template Data and Generator
 */

import React from 'react';
import type { DailyChallengeTemplate } from '@/types/dailyChallenge';
import {
  FlameIcon, SnowflakeIcon, LightningIcon, ShieldIcon, TrophyIcon,
  TimerIcon, MoneyBagIcon, SparklesIcon, DangerIcon, TowerIcon,
  BuildIcon, HeartIcon, CrosshairIcon, ExplosionIcon,
  EndlessIcon, TargetIcon, RocketIcon, SwordIcon,
  GhostIcon, StarIcon, SkullIcon, ZapIcon, WindIcon, WrenchIcon, MagicIcon, EmpIcon, AegisIcon, EyeIcon, AlienIcon, RobotIcon, CrownIcon, FastForwardIcon, SpiderIcon,
} from '@/components/ui/Icons';

// ===========================================
// 挑戰模板
// ===========================================

export const DAILY_CHALLENGE_TEMPLATES: DailyChallengeTemplate[] = [
  {
    id: 'dc_flame_storm',
    name: '火力全開',
    description: '一場遊戲使用 5 座火焰塔並勝利',
    icon: React.createElement(FlameIcon, { className: 'w-8 h-8 text-orange-400' }),
    difficulty: 'easy',
    conditions: [
      { type: 'place_tower_type', target: 5, towerType: 'flame', label: '建造火焰塔' },
      { type: 'win_game', target: 1, label: '勝利一場' },
    ],
    rewards: { coins: 150, achievementPoints: 10 },
    tips: '集中升級火焰塔以快速消滅敵人。',
  },
  {
    id: 'dc_ice_and_fire',
    name: '冰與火',
    description: '一場遊戲分別建造 3 座火焰塔與 3 座冰霜塔並勝利',
    icon: React.createElement(SnowflakeIcon, { className: 'w-8 h-8 text-cyan-300' }),
    difficulty: 'medium',
    conditions: [
      { type: 'place_tower_type', target: 3, towerType: 'flame', label: '建造火焰塔' },
      { type: 'place_tower_type', target: 3, towerType: 'frost', label: '建造冰霜塔' },
      { type: 'win_game', target: 1, label: '勝利一場' },
    ],
    rewards: { coins: 250, achievementPoints: 20 },
  },
  {
    id: 'dc_speed_run',
    name: '速戰速決',
    description: '在 5 分鐘內贏得任意一場遊戲',
    icon: React.createElement(TimerIcon, { className: 'w-8 h-8 text-blue-400' }),
    difficulty: 'medium',
    conditions: [
      { type: 'win_speed', target: 300, label: '5 分鐘內勝利' },
    ],
    rewards: { coins: 200, achievementPoints: 25 },
    tips: '選擇較短的關卡與簡單難度。',
  },
  {
    id: 'dc_thrifty',
    name: '節儉勝利',
    description: '一場遊戲花費少於 800 金錢並通關',
    icon: React.createElement(MoneyBagIcon, { className: 'w-8 h-8 text-yellow-400' }),
    difficulty: 'medium',
    conditions: [
      { type: 'win_thrifty', target: 800, label: '花費少於 800' },
      { type: 'win_game', target: 1, label: '勝利一場' },
    ],
    rewards: { coins: 300, achievementPoints: 25 },
  },
  {
    id: 'dc_perfect_run',
    name: '無傷挑戰',
    description: '完成一場無傷遊戲',
    icon: React.createElement(SparklesIcon, { className: 'w-8 h-8 text-yellow-300' }),
    difficulty: 'hard',
    conditions: [
      { type: 'win_no_damage', target: 1, label: '無傷通關' },
    ],
    rewards: { coins: 500, achievementPoints: 50, talentPoints: 1 },
    tips: '優先建造高 DPS 塔，並提早佈防。',
  },
  {
    id: 'dc_boss_hunter',
    name: 'Boss 獵人',
    description: '一場遊戲擊殺 3 個 Boss',
    icon: React.createElement(DangerIcon, { className: 'w-8 h-8 text-red-500' }),
    difficulty: 'medium',
    conditions: [
      { type: 'kill_bosses', target: 3, label: '擊殺 Boss' },
    ],
    rewards: { coins: 250, achievementPoints: 25 },
  },
  {
    id: 'dc_full_hp',
    name: '滿血通關',
    description: '在生命值滿格的狀態下通關任意一關',
    icon: React.createElement(HeartIcon, { className: 'w-8 h-8 text-rose-400' }),
    difficulty: 'medium',
    conditions: [
      { type: 'win_full_hp', target: 1, label: '滿血勝利' },
    ],
    rewards: { coins: 200, achievementPoints: 20 },
  },
  {
    id: 'dc_mass_killer',
    name: '穿透敵陣',
    description: '一場遊戲擊殺 200 個敵人',
    icon: React.createElement(SwordIcon, { className: 'w-8 h-8 text-rose-400' }),
    difficulty: 'easy',
    conditions: [
      { type: 'kill_enemies', target: 200, label: '擊殺敵人' },
    ],
    rewards: { coins: 150, achievementPoints: 10 },
  },
  {
    id: 'dc_perfect_waves',
    name: '鋼鐵防線',
    description: '一場遊戲完成 5 個無傷波次',
    icon: React.createElement(ShieldIcon, { className: 'w-8 h-8 text-blue-400' }),
    difficulty: 'medium',
    conditions: [
      { type: 'perfect_waves', target: 5, label: '無傷波次' },
    ],
    rewards: { coins: 250, achievementPoints: 20 },
  },
  {
    id: 'dc_hard_complete',
    name: '困難挑戰',
    description: '在困難難度下完成任意關卡',
    icon: React.createElement(TrophyIcon, { className: 'w-8 h-8 text-amber-400' }),
    difficulty: 'hard',
    conditions: [
      { type: 'win_difficulty', target: 1, difficulty: 'hard', label: '困難難度通關' },
    ],
    rewards: { coins: 400, achievementPoints: 40, talentPoints: 1 },
  },
  {
    id: 'dc_endless_15',
    name: '無盡探險',
    description: '在無盡模式達到第 15 波',
    icon: React.createElement(EndlessIcon, { className: 'w-8 h-8 text-purple-500' }),
    difficulty: 'medium',
    conditions: [
      { type: 'reach_endless_wave', target: 15, label: '無盡模式波次' },
    ],
    rewards: { coins: 250, achievementPoints: 25 },
  },
  {
    id: 'dc_max_tower',
    name: '究極兵器',
    description: '一場遊戲讓 1 座塔升至滿級',
    icon: React.createElement(RocketIcon, { className: 'w-8 h-8 text-purple-500' }),
    difficulty: 'easy',
    conditions: [
      { type: 'tower_max_level', target: 1, label: '滿級塔' },
    ],
    rewards: { coins: 150, achievementPoints: 10 },
  },
  {
    id: 'dc_variety',
    name: '多元戰術',
    description: '一場遊戲使用 6 種以上不同的塔',
    icon: React.createElement(TowerIcon, { className: 'w-8 h-8 text-emerald-400' }),
    difficulty: 'medium',
    conditions: [
      { type: 'place_tower_variety', target: 6, label: '不同塔類型' },
      { type: 'win_game', target: 1, label: '勝利一場' },
    ],
    rewards: { coins: 250, achievementPoints: 25 },
  },
  {
    id: 'dc_quick_build',
    name: '快速建造',
    description: '一場遊戲放置 20 座塔',
    icon: React.createElement(BuildIcon, { className: 'w-8 h-8 text-amber-500' }),
    difficulty: 'easy',
    conditions: [
      { type: 'place_towers', target: 20, label: '建造塔' },
    ],
    rewards: { coins: 150, achievementPoints: 10 },
  },
  {
    id: 'dc_rich_economy',
    name: '能源充沛',
    description: '一場遊戲累積超過 5,000 金錢',
    icon: React.createElement(MoneyBagIcon, { className: 'w-8 h-8 text-yellow-500' }),
    difficulty: 'medium',
    conditions: [
      { type: 'earn_money', target: 5000, label: '累積金錢' },
    ],
    rewards: { coins: 300, achievementPoints: 20 },
  },
  {
    id: 'dc_anti_air',
    name: '防空能手',
    description: '一場遊戲擊殺 30 個飛行敵人',
    icon: React.createElement(ExplosionIcon, { className: 'w-8 h-8 text-blue-400' }),
    difficulty: 'medium',
    conditions: [
      { type: 'kill_enemy_type', target: 30, enemyType: 'flyer', label: '擊殺飛行敵人' },
    ],
    rewards: { coins: 200, achievementPoints: 20 },
  },
  {
    id: 'dc_shield_breaker',
    name: '破盾專家',
    description: '一場遊戲擊殺 20 個護盾敵人',
    icon: React.createElement(ShieldIcon, { className: 'w-8 h-8 text-blue-300' }),
    difficulty: 'medium',
    conditions: [
      { type: 'kill_enemy_type', target: 20, enemyType: 'shield', label: '擊殺護盾敵人' },
    ],
    rewards: { coins: 200, achievementPoints: 20 },
  },
  {
    id: 'dc_elite_hunter',
    name: '精英剋星',
    description: '一場遊戲擊殺 10 個精英敵人',
    icon: React.createElement(TargetIcon, { className: 'w-8 h-8 text-yellow-400' }),
    difficulty: 'hard',
    conditions: [
      { type: 'kill_enemy_type', target: 10, enemyType: 'elite', label: '擊殺精英敵人' },
    ],
    rewards: { coins: 400, achievementPoints: 40 },
  },
  {
    id: 'dc_lightning_strike',
    name: '閃電戰術',
    description: '一場遊戲使用閃電塔擊殺 50 個敵人',
    icon: React.createElement(LightningIcon, { className: 'w-8 h-8 text-yellow-400' }),
    difficulty: 'medium',
    conditions: [
      { type: 'place_tower_type', target: 1, towerType: 'lightning', label: '使用閃電塔' },
      { type: 'kill_enemies', target: 50, label: '擊殺敵人' },
    ],
    rewards: { coins: 200, achievementPoints: 20 },
  },
  {
    id: 'dc_sniper_master',
    name: '狙擊大師',
    description: '一場遊戲使用至少 4 座狙擊塔通關',
    icon: React.createElement(CrosshairIcon, { className: 'w-8 h-8 text-blue-400' }),
    difficulty: 'medium',
    conditions: [
      { type: 'place_tower_type', target: 4, towerType: 'sniper', label: '建造狙擊塔' },
      { type: 'win_game', target: 1, label: '勝利一場' },
    ],
    rewards: { coins: 200, achievementPoints: 20 },
  },
  {
    id: 'dc_fusion_rite',
    name: '合體儀式',
    description: '一場遊戲完成至少 1 次融合並勝利',
    icon: React.createElement(StarIcon, { className: 'w-8 h-8 text-violet-400' }),
    difficulty: 'medium',
    conditions: [
      { type: 'fuse_towers', target: 1, label: '融合一次' },
      { type: 'win_game', target: 1, label: '勝利一場' },
    ],
    rewards: { coins: 280, achievementPoints: 25 },
    tips: '冰+電、毒+火、炮+狙、風+脈衝，任選一對合體。',
  },
  {
    id: 'dc_ballista_wall',
    name: '弩陣防線',
    description: '一場遊戲建造 3 座弩炮塔並勝利',
    icon: React.createElement(CrosshairIcon, { className: 'w-8 h-8 text-amber-400' }),
    difficulty: 'medium',
    conditions: [
      { type: 'place_tower_type', target: 3, towerType: 'ballista', label: '建造弩炮塔' },
      { type: 'win_game', target: 1, label: '勝利一場' },
    ],
    rewards: { coins: 220, achievementPoints: 20 },
    tips: '直線與彎道出口讓弩矢貫穿吃到最多目標。',
  },
  {
    id: 'dc_ghost_banish',
    name: '驅散幽影',
    description: '一場遊戲擊殺 12 個幽靈敵人',
    icon: React.createElement(GhostIcon, { className: 'w-8 h-8 text-indigo-300' }),
    difficulty: 'medium',
    conditions: [
      { type: 'kill_enemy_type', target: 12, enemyType: 'ghost', label: '擊殺幽靈' },
    ],
    rewards: { coins: 220, achievementPoints: 20 },
    tips: '幽靈相位期間免疫傷害，等實體階段再集火，或用持續範圍壓住。',
  },
  {
    id: 'dc_nightmare_hold',
    name: '夢魘守夜',
    description: '在夢魘難度下完成任意關卡',
    icon: React.createElement(SkullIcon, { className: 'w-8 h-8 text-fuchsia-400' }),
    difficulty: 'hard',
    conditions: [
      { type: 'win_difficulty', target: 1, difficulty: 'nightmare', label: '夢魘難度通關' },
    ],
    rewards: { coins: 500, achievementPoints: 50, talentPoints: 1 },
    tips: '短關與控場塔比較穩。漏怪懲罰很重，寧可慢波。',
  },
  {
    id: 'dc_plague_pair',
    name: '疫焰前奏',
    description: '一場遊戲分別建造 2 座毒塔與 2 座火焰塔並勝利',
    icon: React.createElement(FlameIcon, { className: 'w-8 h-8 text-lime-400' }),
    difficulty: 'medium',
    conditions: [
      { type: 'place_tower_type', target: 2, towerType: 'poison', label: '建造毒塔' },
      { type: 'place_tower_type', target: 2, towerType: 'flame', label: '建造火焰塔' },
      { type: 'win_game', target: 1, label: '勝利一場' },
    ],
    rewards: { coins: 250, achievementPoints: 25 },
    tips: '這兩種塔也是瘟疫塔的合體素材，打完還能順便融合。',
  },
  {
    id: 'dc_endless_25',
    name: '裂縫深處',
    description: '在無盡模式達到第 25 波',
    icon: React.createElement(ZapIcon, { className: 'w-8 h-8 text-purple-400' }),
    difficulty: 'hard',
    conditions: [
      { type: 'reach_endless_wave', target: 25, label: '無盡模式波次' },
    ],
    rewards: { coins: 450, achievementPoints: 45, talentPoints: 1 },
    tips: '前期經濟、中期融合、後期控場。第 20 波後 Boss 會更密。',
  },
  {
    id: 'dc_storm_pair',
    name: '冰雷前奏',
    description: '一場遊戲分別建造 2 座冰霜塔與 2 座閃電塔並勝利',
    icon: React.createElement(LightningIcon, { className: 'w-8 h-8 text-sky-300' }),
    difficulty: 'medium',
    conditions: [
      { type: 'place_tower_type', target: 2, towerType: 'frost', label: '建造冰霜塔' },
      { type: 'place_tower_type', target: 2, towerType: 'lightning', label: '建造閃電塔' },
      { type: 'win_game', target: 1, label: '勝利一場' },
    ],
    rewards: { coins: 250, achievementPoints: 25 },
    tips: '這兩種塔是暴風塔的合體素材。',
  },
  {
    id: 'dc_tempest_pair',
    name: '風脈前奏',
    description: '一場遊戲分別建造 2 座風塔與 2 座脈衝塔並勝利',
    icon: React.createElement(WindIcon, { className: 'w-8 h-8 text-teal-300' }),
    difficulty: 'medium',
    conditions: [
      { type: 'place_tower_type', target: 2, towerType: 'wind', label: '建造風塔' },
      { type: 'place_tower_type', target: 2, towerType: 'pulse', label: '建造脈衝塔' },
      { type: 'win_game', target: 1, label: '勝利一場' },
    ],
    rewards: { coins: 250, achievementPoints: 25 },
    tips: '這兩種塔是颶風塔的合體素材。髮夾彎地圖最吃擊退。',
  },
  {
    id: 'dc_demo_pair',
    name: '炮狙前奏',
    description: '一場遊戲分別建造 2 座加農炮與 2 座狙擊塔並勝利',
    icon: React.createElement(CrosshairIcon, { className: 'w-8 h-8 text-orange-400' }),
    difficulty: 'medium',
    conditions: [
      { type: 'place_tower_type', target: 2, towerType: 'cannon', label: '建造加農炮' },
      { type: 'place_tower_type', target: 2, towerType: 'sniper', label: '建造狙擊塔' },
      { type: 'win_game', target: 1, label: '勝利一場' },
    ],
    rewards: { coins: 250, achievementPoints: 25 },
    tips: '這兩種塔是攻城塔的合體素材。直線與髮夾彎都能打。',
  },
  {
    id: 'dc_air_raid',
    name: '空襲預警',
    description: '使用官方波次組「空襲預警」通關一次',
    icon: React.createElement(WindIcon, { className: 'w-8 h-8 text-sky-300' }),
    difficulty: 'hard',
    conditions: [
      { type: 'win_wave_set', target: 1, waveSetId: 'official_air_raid', label: '空襲預警通關' },
    ],
    rewards: { coins: 300, achievementPoints: 30 },
    tips: '選擇路徑 → 進階地圖 → 波次組選「空襲預警」。狙擊與雷射打飛行直線。',
  },
  {
    id: 'dc_berserker_rush',
    name: '狂暴衝鋒',
    description: '使用官方波次組「狂暴衝鋒」通關一次',
    icon: React.createElement(SwordIcon, { className: 'w-8 h-8 text-red-400' }),
    difficulty: 'hard',
    conditions: [
      { type: 'win_wave_set', target: 1, waveSetId: 'official_berserker_rush', label: '狂暴衝鋒通關' },
    ],
    rewards: { coins: 300, achievementPoints: 30 },
    tips: '選擇路徑 → 進階地圖 → 波次組選「狂暴衝鋒」。殘血會加速，爆發一次斬殺。',
  },
  {
    id: 'dc_saboteur_raid',
    name: '破壞奇襲',
    description: '使用官方波次組「破壞奇襲」通關一次',
    icon: React.createElement(WrenchIcon, { className: 'w-8 h-8 text-slate-300' }),
    difficulty: 'hard',
    conditions: [
      { type: 'win_wave_set', target: 1, waveSetId: 'official_saboteur_raid', label: '破壞奇襲通關' },
    ],
    rewards: { coins: 300, achievementPoints: 30 },
    tips: '選擇路徑 → 進階地圖 → 波次組選「破壞奇襲」。塔不要擠一堆，優先擊殺破壞兵。',
  },
  {
    id: 'dc_mage_blink',
    name: '閃現突襲',
    description: '使用官方波次組「閃現突襲」通關一次',
    icon: React.createElement(MagicIcon, { className: 'w-8 h-8 text-violet-400' }),
    difficulty: 'hard',
    conditions: [
      { type: 'win_wave_set', target: 1, waveSetId: 'official_mage_blink', label: '閃現突襲通關' },
    ],
    rewards: { coins: 300, achievementPoints: 30 },
    tips: '選擇路徑 → 進階地圖 → 波次組選「閃現突襲」。彎道前後都要有塔，別只守一個瓶頸。',
  },
  {
    id: 'dc_healer_convoy',
    name: '治療車隊',
    description: '使用官方波次組「治療車隊」通關一次',
    icon: React.createElement(HeartIcon, { className: 'w-8 h-8 text-rose-400' }),
    difficulty: 'hard',
    conditions: [
      { type: 'win_wave_set', target: 1, waveSetId: 'official_healer_convoy', label: '治療車隊通關' },
    ],
    rewards: { coins: 300, achievementPoints: 30 },
    tips: '選擇路徑 → 進階地圖 → 波次組選「治療車隊」。先點治療兵，再開坦克。',
  },
  {
    id: 'dc_bomber_column',
    name: '爆破縱隊',
    description: '使用官方波次組「爆破縱隊」通關一次',
    icon: React.createElement(ExplosionIcon, { className: 'w-8 h-8 text-orange-400' }),
    difficulty: 'hard',
    conditions: [
      { type: 'win_wave_set', target: 1, waveSetId: 'official_bomber_column', label: '爆破縱隊通關' },
    ],
    rewards: { coins: 300, achievementPoints: 30 },
    tips: '選擇路徑 → 進階地圖選「螺旋」並選波次組「爆破縱隊」。塔不要擠內圈，遠距先點炸彈兵。',
  },
  {
    id: 'dc_jammer_field',
    name: '干擾壓制',
    description: '使用官方波次組「干擾壓制」通關一次',
    icon: React.createElement(EmpIcon, { className: 'w-8 h-8 text-violet-400' }),
    difficulty: 'hard',
    conditions: [
      { type: 'win_wave_set', target: 1, waveSetId: 'official_jammer_field', label: '干擾壓制通關' },
    ],
    rewards: { coins: 300, achievementPoints: 30 },
    tips: '選擇路徑 → 進階地圖 → 波次組選「干擾壓制」。塔分散佈防，狙擊優先擊殺干擾者。',
  },
  {
    id: 'dc_iron_phalanx',
    name: '鐵壁方陣',
    description: '使用官方波次組「鐵壁方陣」通關一次',
    icon: React.createElement(ShieldIcon, { className: 'w-8 h-8 text-slate-300' }),
    difficulty: 'hard',
    conditions: [
      { type: 'win_wave_set', target: 1, waveSetId: 'official_iron_phalanx', label: '鐵壁方陣通關' },
    ],
    rewards: { coins: 300, achievementPoints: 30 },
    tips: '選擇路徑 → 進階地圖選「鉗形」並選波次組「鐵壁方陣」。中央殺區破甲，上下鉗口都要有塔。',
  },
  {
    id: 'dc_escort_column',
    name: '護航縱隊',
    description: '使用官方波次組「護航縱隊」通關一次',
    icon: React.createElement(AegisIcon, { className: 'w-8 h-8 text-sky-300' }),
    difficulty: 'hard',
    conditions: [
      { type: 'win_wave_set', target: 1, waveSetId: 'official_escort_column', label: '護航縱隊通關' },
    ],
    rewards: { coins: 300, achievementPoints: 30 },
    tips: '選擇路徑 → 進階地圖選「島嶼」並選波次組「護航縱隊」。先點護航兵，再開被加裝甲的坦克。',
  },
  {
    id: 'dc_stealth_veil',
    name: '影幕潛行',
    description: '使用官方波次組「影幕潛行」通關一次',
    icon: React.createElement(EyeIcon, { className: 'w-8 h-8 text-slate-300' }),
    difficulty: 'hard',
    conditions: [
      { type: 'win_wave_set', target: 1, waveSetId: 'official_stealth_veil', label: '影幕潛行通關' },
    ],
    rewards: { coins: 300, achievementPoints: 30 },
    tips: '選擇路徑 → 進階地圖選「十字交叉」並選波次組「影幕潛行」。等現身再打，冰塔拖窗、狙擊點殺。',
  },
  {
    id: 'dc_spawner_nest',
    name: '分裂巢穴',
    description: '使用官方波次組「分裂巢穴」通關一次',
    icon: React.createElement(AlienIcon, { className: 'w-8 h-8 text-rose-400' }),
    difficulty: 'hard',
    conditions: [
      { type: 'win_wave_set', target: 1, waveSetId: 'official_spawner_nest', label: '分裂巢穴通關' },
    ],
    rewards: { coins: 300, achievementPoints: 30 },
    tips: '選擇路徑 → 進階地圖選「菱形叉路」並選波次組「分裂巢穴」。範圍塔清子體，上下線都要有覆蓋。',
  },
  {
    id: 'dc_speedy_rush',
    name: '極速衝鋒',
    description: '使用官方波次組「極速衝鋒」通關一次',
    icon: React.createElement(ZapIcon, { className: 'w-8 h-8 text-cyan-300' }),
    difficulty: 'hard',
    conditions: [
      { type: 'win_wave_set', target: 1, waveSetId: 'official_speedy_rush', label: '極速衝鋒通關' },
    ],
    rewards: { coins: 300, achievementPoints: 30 },
    tips: '選擇路徑 → 進階地圖選「Y型分叉」並選波次組「極速衝鋒」。上下線都要有塔，加農暈眩、雷射即時命中。',
  },
  {
    id: 'dc_heavy_march',
    name: '重裝碾壓',
    description: '使用官方波次組「重裝碾壓」通關一次',
    icon: React.createElement(RobotIcon, { className: 'w-8 h-8 text-indigo-300' }),
    difficulty: 'hard',
    conditions: [
      { type: 'win_wave_set', target: 1, waveSetId: 'official_heavy_march', label: '重裝碾壓通關' },
    ],
    rewards: { coins: 300, achievementPoints: 30 },
    tips: '選擇路徑 → 進階地圖選「U形」並選波次組「重裝碾壓」。捷徑與繞底都要有持續輸出，毒與火磨穿高血。',
  },
  {
    id: 'dc_elite_vanguard',
    name: '精英先鋒',
    description: '使用官方波次組「精英先鋒」通關一次',
    icon: React.createElement(SparklesIcon, { className: 'w-8 h-8 text-amber-300' }),
    difficulty: 'hard',
    conditions: [
      { type: 'win_wave_set', target: 1, waveSetId: 'official_elite_vanguard', label: '精英先鋒通關' },
    ],
    rewards: { coins: 300, achievementPoints: 30 },
    tips: '選擇路徑 → 進階地圖選「之字形」並選波次組「精英先鋒」。上下線都要有塔，風刃恐懼、脈衝破甲。',
  },
  {
    id: 'dc_miniboss_column',
    name: '先遣巨頭',
    description: '使用官方波次組「先遣巨頭」通關一次',
    icon: React.createElement(CrownIcon, { className: 'w-8 h-8 text-amber-400' }),
    difficulty: 'hard',
    conditions: [
      { type: 'win_wave_set', target: 1, waveSetId: 'official_miniboss_column', label: '先遣巨頭通關' },
    ],
    rewards: { coins: 300, achievementPoints: 30 },
    tips: '選擇路徑 → 進階地圖選「對角線」並選波次組「先遣巨頭」。寬路與陡坡都要有塔，暴風穿盾、攻城暈眩。',
  },
  {
    id: 'dc_normal_tide',
    name: '普通潮汐',
    description: '使用官方波次組「普通潮汐」通關一次',
    icon: React.createElement(TowerIcon, { className: 'w-8 h-8 text-emerald-300' }),
    difficulty: 'medium',
    conditions: [
      { type: 'win_wave_set', target: 1, waveSetId: 'official_normal_tide', label: '普通潮汐通關' },
    ],
    rewards: { coins: 250, achievementPoints: 25 },
    tips: '選擇路徑 → 進階地圖選「直線」並選波次組「普通潮汐」。上下線都要有塔，機槍壓制治療。',
  },
  {
    id: 'dc_armor_column',
    name: '裝甲縱隊',
    description: '使用官方波次組「裝甲縱隊」通關一次',
    icon: React.createElement(ShieldIcon, { className: 'w-8 h-8 text-slate-200' }),
    difficulty: 'hard',
    conditions: [
      { type: 'win_wave_set', target: 1, waveSetId: 'official_armor_column', label: '裝甲縱隊通關' },
    ],
    rewards: { coins: 300, achievementPoints: 30 },
    tips: '選擇路徑 → 進階地圖選「長廊」並選波次組「裝甲縱隊」。上下走廊都要有破甲，雷射與脈衝最有用。',
  },
  {
    id: 'dc_fast_raid',
    name: '快速突襲',
    description: '使用官方波次組「快速突襲」通關一次',
    icon: React.createElement(FastForwardIcon, { className: 'w-8 h-8 text-lime-300' }),
    difficulty: 'hard',
    conditions: [
      { type: 'win_wave_set', target: 1, waveSetId: 'official_fast_raid', label: '快速突襲通關' },
    ],
    rewards: { coins: 300, achievementPoints: 30 },
    tips: '選擇路徑 → 進階地圖選「蛇形」並選波次組「快速突襲」。直路與繞路都要有塔，風刃恐懼、機槍連打。',
  },
  {
    id: 'dc_support_web',
    name: '支援網',
    description: '使用官方波次組「支援網」通關一次',
    icon: React.createElement(HeartIcon, { className: 'w-8 h-8 text-rose-300' }),
    difficulty: 'hard',
    conditions: [
      { type: 'win_wave_set', target: 1, waveSetId: 'official_support_web', label: '支援網通關' },
    ],
    rewards: { coins: 300, achievementPoints: 30 },
    tips: '選擇路徑 → 進階地圖選「漏斗」並選波次組「支援網」。頸部點治療，冰塔關干擾，火焰繞護航。',
  },
  {
    id: 'dc_phase_raid',
    name: '相位奇襲',
    description: '使用官方波次組「相位奇襲」通關一次',
    icon: React.createElement(GhostIcon, { className: 'w-8 h-8 text-indigo-300' }),
    difficulty: 'hard',
    conditions: [
      { type: 'win_wave_set', target: 1, waveSetId: 'official_phase_raid', label: '相位奇襲通關' },
    ],
    rewards: { coins: 300, achievementPoints: 30 },
    tips: '選擇路徑 → 進階地圖選「鉤形」並選波次組「相位奇襲」。遠鉤與近路都要有覆蓋，脈衝破隱。',
  },
  {
    id: 'dc_siege_mix',
    name: '爆破拆遷',
    description: '使用官方波次組「爆破拆遷」通關一次',
    icon: React.createElement(ExplosionIcon, { className: 'w-8 h-8 text-orange-400' }),
    difficulty: 'hard',
    conditions: [
      { type: 'win_wave_set', target: 1, waveSetId: 'official_siege_mix', label: '爆破拆遷通關' },
    ],
    rewards: { coins: 300, achievementPoints: 30 },
    tips: '選擇路徑 → 進階地圖選「三線」並選波次組「爆破拆遷」。上中下三路都要有塔，加農暈炸彈。',
  },
  {
    id: 'dc_air_blink',
    name: '空閃縱隊',
    description: '使用官方波次組「空閃縱隊」通關一次',
    icon: React.createElement(WindIcon, { className: 'w-8 h-8 text-sky-300' }),
    difficulty: 'hard',
    conditions: [
      { type: 'win_wave_set', target: 1, waveSetId: 'official_air_blink', label: '空閃縱隊通關' },
    ],
    rewards: { coins: 300, achievementPoints: 30 },
    tips: '選擇路徑 → 進階地圖選「盤繞」並選波次組「空閃縱隊」。外環與內環都要有塔，狙擊打飛行。',
  },
  {
    id: 'dc_rage_wall',
    name: '狂暴鐵壁',
    description: '使用官方波次組「狂暴鐵壁」通關一次',
    icon: React.createElement(SwordIcon, { className: 'w-8 h-8 text-red-400' }),
    difficulty: 'hard',
    conditions: [
      { type: 'win_wave_set', target: 1, waveSetId: 'official_rage_wall', label: '狂暴鐵壁通關' },
    ],
    rewards: { coins: 300, achievementPoints: 30 },
    tips: '選擇路徑 → 進階地圖選「閘門」並選波次組「狂暴鐵壁」。中門與上下翼都要有塔，毒火燒殘血。',
  },
  {
    id: 'dc_nest_jam',
    name: '巢穴干擾',
    description: '使用官方波次組「巢穴干擾」通關一次',
    icon: React.createElement(AlienIcon, { className: 'w-8 h-8 text-rose-400' }),
    difficulty: 'hard',
    conditions: [
      { type: 'win_wave_set', target: 1, waveSetId: 'official_nest_jam', label: '巢穴干擾通關' },
    ],
    rewards: { coins: 300, achievementPoints: 30 },
    tips: '選擇路徑 → 進階地圖選「谷地」並選波次組「巢穴干擾」。山脊與谷底都要有塔，火焰清蟲、冰塔關干擾。',
  },
  {
    id: 'dc_tank_push',
    name: '坦克壓境',
    description: '使用官方波次組「坦克壓境」通關一次',
    icon: React.createElement(RobotIcon, { className: 'w-8 h-8 text-slate-200' }),
    difficulty: 'hard',
    conditions: [
      { type: 'win_wave_set', target: 1, waveSetId: 'official_tank_push', label: '坦克壓境通關' },
    ],
    rewards: { coins: 350, achievementPoints: 35 },
    tips: '選擇路徑 → 進階地圖選「四葉」並選波次組「坦克壓境」。四路都要有破甲，雷射處決、脈衝破甲。',
  },
  {
    id: 'dc_shadow_run',
    name: '影行突襲',
    description: '使用官方波次組「影行突襲」通關一次',
    icon: React.createElement(EyeIcon, { className: 'w-8 h-8 text-indigo-300' }),
    difficulty: 'hard',
    conditions: [
      { type: 'win_wave_set', target: 1, waveSetId: 'official_shadow_run', label: '影行突襲通關' },
    ],
    rewards: { coins: 350, achievementPoints: 35 },
    tips: '選擇路徑 → 進階地圖選「甬道」並選波次組「影行突襲」。中段放火焰燒隱身，出口上下補機槍與雷射。',
  },
  {
    id: 'dc_guard_fan',
    name: '護航扇面',
    description: '使用官方波次組「護航扇面」通關一次',
    icon: React.createElement(AegisIcon, { className: 'w-8 h-8 text-cyan-300' }),
    difficulty: 'hard',
    conditions: [
      { type: 'win_wave_set', target: 1, waveSetId: 'official_guard_fan', label: '護航扇面通關' },
    ],
    rewards: { coins: 350, achievementPoints: 35 },
    tips: '選擇路徑 → 進階地圖選「三角洲」並選波次組「護航扇面」。三路與匯流口都要有塔，機槍關護航光環。',
  },
  {
    id: 'dc_arcane_ward',
    name: '秘法結界',
    description: '使用官方波次組「秘法結界」通關一次',
    icon: React.createElement(MagicIcon, { className: 'w-8 h-8 text-violet-300' }),
    difficulty: 'hard',
    conditions: [
      { type: 'win_wave_set', target: 1, waveSetId: 'official_arcane_ward', label: '秘法結界通關' },
    ],
    rewards: { coins: 350, achievementPoints: 35 },
    tips: '選擇路徑 → 進階地圖選「稜鏡」並選波次組「秘法結界」。三路與裂口都要有塔，電擊打法師。',
  },
  {
    id: 'dc_air_bomb',
    name: '空中爆破',
    description: '使用官方波次組「空中爆破」通關一次',
    icon: React.createElement(ExplosionIcon, { className: 'w-8 h-8 text-orange-400' }),
    difficulty: 'hard',
    conditions: [
      { type: 'win_wave_set', target: 1, waveSetId: 'official_air_bomb', label: '空中爆破通關' },
    ],
    rewards: { coins: 350, achievementPoints: 35 },
    tips: '選擇路徑 → 進階地圖選「層瀑」並選波次組「空中爆破」。高台與谷底都要有塔，加農暈炸彈。',
  },
  {
    id: 'dc_iron_tide',
    name: '重盾浪潮',
    description: '使用官方波次組「重盾浪潮」通關一次',
    icon: React.createElement(ShieldIcon, { className: 'w-8 h-8 text-slate-200' }),
    difficulty: 'hard',
    conditions: [
      { type: 'win_wave_set', target: 1, waveSetId: 'official_iron_tide', label: '重盾浪潮通關' },
    ],
    rewards: { coins: 350, achievementPoints: 35 },
    tips: '選擇路徑 → 進階地圖選「錨形」並選波次組「重盾浪潮」。錨柄放脈衝破盾，兩翼補火焰與狙擊。',
  },
  {
    id: 'dc_saboteur_veil',
    name: '影襲破壞',
    description: '使用官方波次組「影襲破壞」通關一次',
    icon: React.createElement(WrenchIcon, { className: 'w-8 h-8 text-slate-200' }),
    difficulty: 'hard',
    conditions: [
      { type: 'win_wave_set', target: 1, waveSetId: 'official_saboteur_veil', label: '影襲破壞通關' },
    ],
    rewards: { coins: 300, achievementPoints: 30 },
    tips: '選擇路徑 → 進階地圖選「新月」並選波次組「影襲破壞」。外弧與內弦都要有塔，火焰燒隱身。',
  },
  {
    id: 'dc_swarm_air',
    name: '蟲空潮汐',
    description: '使用官方波次組「蟲空潮汐」通關一次',
    icon: React.createElement(SpiderIcon, { className: 'w-8 h-8 text-lime-400' }),
    difficulty: 'hard',
    conditions: [
      { type: 'win_wave_set', target: 1, waveSetId: 'official_swarm_air', label: '蟲空潮汐通關' },
    ],
    rewards: { coins: 300, achievementPoints: 30 },
    tips: '選擇路徑 → 進階地圖選「楔形」並選波次組「蟲空潮汐」。兩翼與尖端都要有範圍傷害，加農清蟲。',
  },
  {
    id: 'dc_elite_jam',
    name: '干擾先鋒',
    description: '使用官方波次組「干擾先鋒」通關一次',
    icon: React.createElement(EmpIcon, { className: 'w-8 h-8 text-violet-400' }),
    difficulty: 'hard',
    conditions: [
      { type: 'win_wave_set', target: 1, waveSetId: 'official_elite_jam', label: '干擾先鋒通關' },
    ],
    rewards: { coins: 300, achievementPoints: 30 },
    tips: '選擇路徑 → 進階地圖選「格網」並選波次組「干擾先鋒」。上下格線都要有塔，冰塔關干擾。',
  },
];

// ===========================================
// 取得指定 ID 的模板
// ===========================================
export function getDailyChallengeTemplate(id: string): DailyChallengeTemplate | undefined {
  return DAILY_CHALLENGE_TEMPLATES.find((t) => t.id === id);
}

// ===========================================
// 確定性挑戰選擇器
// 以日期字串作為 seed，使所有玩家在同一天看到同樣的挑戰
// ===========================================
export function selectDailyChallengeForDate(date: string): DailyChallengeTemplate {
  // 簡單 hash：將日期字串轉成數字
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = ((hash << 5) - hash) + date.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % DAILY_CHALLENGE_TEMPLATES.length;
  return DAILY_CHALLENGE_TEMPLATES[idx];
}

// ===========================================
// 將今天日期格式化為 YYYY-MM-DD（本地時區）
// ===========================================
export function getTodayDateString(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
