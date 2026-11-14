import type { CampaignLevel } from '@/types/campaign';

export const ch11_lv4: CampaignLevel = {
  id: 'ch11_lv4',
  chapter: 11,
  level: 4,
  title: '動搖',
  description:
    '兩個月後，鏡像指揮官既沒答應也沒拒絕。直到透過敵方偵察網看見家鄉現況——死後第三個月被軍部改為能量武器試驗區，家人被迫遷移，初泉河水變了顏色。動搖變成憤怒，他決定親眼確認後再做選擇。',
  mapId: 'bridge',
  maxWaves: 7,
  specialRules: [
    '家鄉之痛：地圖採用「橋樑」分流',
    '怒火填膺：所有塔射速 +20%、傷害 +10%',
    '尋仇之戰：起始資金 1700、生命 13、塔造價 -20%',
    '徹底覺醒：擊殺敵人 +50% 金錢',
  ],
  modifiers: {
    enemyHealthMult: 1.3,
    enemySpeedMult: 1.15,
    enemyRewardMult: 1.5,
    startingMoney: 1700,
    startingHealth: 13,
    towerCostMult: 0.8,
  },
  preBattleDialogue: [
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '重組者，我透過偵察網看到了家鄉。那裡變成能量武器試驗區了。',
      expression: 'angry',
    },
    {
      speaker: '重組者',
      text: '是。我兩個月前就知道，沒告訴你是怕你衝動送命。',
      expression: 'normal',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '我媽呢？還有艾莉絲——她怎麼樣了？',
      expression: 'angry',
    },
    {
      speaker: '重組者',
      text: '你母親被遷到南方，簽了同意書，不知道拒絕的後果。艾莉絲被軍部關機，理由是你死了，副官沒用了。',
      expression: 'serious',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '十五年……說關就關？她不是在等命令，她是在等我回來。',
      expression: 'angry',
    },
    {
      speaker: '重組者',
      text: '那你決定了嗎？',
      expression: 'normal',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '還沒。但我要親手打進試驗區，親眼看家鄉變成什麼樣子。看完才能決定站哪一邊。',
      expression: 'serious',
    },
    {
      speaker: '重組者',
      text: '那是軍方管制區。你踏進去，就等於正式與舊陣營決裂。',
      expression: 'serious',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '我知道。派你的人退後，這一段我自己走。',
      expression: 'serious',
    },
    {
      speaker: '重組者',
      text: '你會碰上以前的兄弟，他們會開槍。',
      expression: 'serious',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '那就讓他們開。我已經死過一次了，不差再挨一槍。',
      expression: 'angry',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '我看到了。家鄉焦黑，初泉河變成酸性綠，我爬過的瞭望塔只剩地基。',
      expression: 'serious',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '還有兩個士兵在慶祝，說指揮官死了，終於能拆掉這個破地方。',
      expression: 'angry',
    },
    {
      speaker: '重組者',
      text: '你殺了他們嗎？',
      expression: 'normal',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '沒有。他們只是執行命令的人。該負責的是下命令的那一方。',
      expression: 'serious',
    },
    {
      speaker: '重組者',
      text: '那你現在決定了？',
      expression: 'normal',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '我換陣營。但條件是兩邊都不能再把人當棋子——我幫你掀我這邊的棋盤，你也得掀你那邊的。',
      expression: 'serious',
    },
    {
      speaker: '重組者',
      text: '接受。從今天起，鏡像指揮官，你正式加入。',
      expression: 'normal',
    },
  ],
  rewards: {
    coins: 2000,
    talentPoints: 16,
  },
};
