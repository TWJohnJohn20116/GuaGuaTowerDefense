import type { CampaignLevel } from '@/types/campaign';

export const ch11_lv3: CampaignLevel = {
  id: 'ch11_lv3',
  chapter: 11,
  level: 3,
  title: '能量重組',
  description:
    '鏡像指揮官死後第七天醒來，眼前不是家鄉，而是敵方陣營的能量實驗室。自稱「重組者」的科學家說他已被救回，代價是替對方做一件事。他本能拒絕，直到看見一段軍部內部錄影，十五年忠誠開始鬆動。',
  mapId: 'island',
  maxWaves: 6,
  specialRules: [
    '能量實驗室：地圖採用「島嶼」分流',
    '能量重組：所有塔基礎射速 +15%（重組身體效率提升）',
    '重生狀態：起始資金 1500、生命 13、塔造價 -20%',
    '不確定的選擇：擊殺敵人 +35% 金錢',
  ],
  modifiers: {
    enemyHealthMult: 1.2,
    enemyRewardMult: 1.35,
    startingMoney: 1500,
    startingHealth: 13,
    towerCostMult: 0.8,
  },
  preBattleDialogue: [
    {
      speaker: '重組者',
      text: '醒了嗎，指揮官？心跳穩定，記憶完整，看來重組成功。',
      expression: 'normal',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '你是誰？這裡是哪裡？我明明已經——',
      expression: 'surprised',
    },
    {
      speaker: '重組者',
      text: '你死了七天。我們用能量重組技術，把肉體和記憶一起拼回來。代價很簡單：替我們做一件事。',
      expression: 'normal',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '你們是敵方陣營。我寧願再死一次，也不替敵人效力。',
      expression: 'angry',
    },
    {
      speaker: '重組者',
      text: '先別急著拒絕。看一段影片，這是你們軍部三天前的內部會議錄影。',
      expression: 'serious',
    },
    {
      speaker: '???（軍部高官）',
      text: '那一千人本來就計劃犧牲。重點是讓敵方以為大勝，好讓我方搶時間建造主力武器。',
      expression: 'normal',
    },
    {
      speaker: '???（軍部高官）',
      text: '指揮官死了反而有利。政治英雄比活著的指揮官更好操作，紀念碑比活人聽話。',
      expression: 'normal',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '不可能……我為軍部效力十五年，他們把我當棄子？',
      expression: 'serious',
    },
    {
      speaker: '重組者',
      text: '你以為在保家衛國，其實只是棋子。我們這邊也一樣。兩邊都需要有人把棋盤掀翻。',
      expression: 'serious',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '我需要時間。這些話……我現在不會信，也不會立刻答應。',
      expression: 'serious',
    },
    {
      speaker: '重組者',
      text: '可以。但既然你醒了，得先測試這副身體還能不能打仗。實驗室外的敵群已經就位。',
      expression: 'normal',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '好。我就當這是「死後的體能鑑定」。',
      expression: 'serious',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '重組者',
      text: '測試結束。你的重組身體反應速度比原版快百分之十五，耐受度也更高。',
      expression: 'happy',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '剛才那些敵人……是真人嗎？',
      expression: 'serious',
    },
    {
      speaker: '重組者',
      text: '一半是能量幻影，一半是志願參與測試的死刑犯。他們用命換家人溫飽，這點我沒瞞你。',
      expression: 'normal',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '跟軍部把我當棄子一樣，都是拿人命換戰略。',
      expression: 'serious',
    },
    {
      speaker: '重組者',
      text: '我承認。但至少我會把真相攤開，讓你知情後再決定。軍部給過你這個嗎？',
      expression: 'normal',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '沒有。所以我還不能答應你，但也不會裝作什麼都沒看見。',
      expression: 'serious',
    },
  ],
  rewards: {
    coins: 1700,
    talentPoints: 14,
  },
};
