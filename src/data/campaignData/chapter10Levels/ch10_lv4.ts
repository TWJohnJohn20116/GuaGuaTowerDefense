import type { CampaignLevel } from '@/types/campaign';

export const ch10_lv4: CampaignLevel = {
  id: 'ch10_lv4',
  chapter: 10,
  level: 4,
  title: '不可能的決定',
  description:
    '隔天清晨，迷霧深處的真正核心現身——一座會同時殺傷全員的能量陷阱。奧斯卡列出撤退與犧牲兩案，隊員陳浩卻提出第三條路：五人合力拆解陷阱。這個選擇，將改寫他往後三十年的軍旅人生。',
  mapId: 'cross',
  maxWaves: 7,
  specialRules: [
    '雙線困境：地圖採用「十字交叉」',
    '誘餌之路：起始資金 1700、生命 14、塔造價 -10%',
    '緊急狀況：敵人血量 +25%、速度 +15%',
    '情義抉擇：擊殺敵人 +40% 金錢',
  ],
  modifiers: {
    enemyHealthMult: 1.25,
    enemySpeedMult: 1.15,
    enemyRewardMult: 1.4,
    startingMoney: 1700,
    startingHealth: 14,
    towerCostMult: 0.9,
  },
  preBattleDialogue: [
    {
      speaker: '少校奧斯卡',
      text: '各位，我整夜沒睡。有兩個方案，還有一個你們可能不會喜歡的。',
      expression: 'serious',
    },
    {
      speaker: '少校奧斯卡',
      text: 'A 案：全員撤退，任務失敗，迷霧繼續存在，未來還會有人送命。',
      expression: 'serious',
    },
    {
      speaker: '少校奧斯卡',
      text: 'B 案：派一個人引開陷阱，其他四人活著回去——那個人是我，隊長最後離開。',
      expression: 'serious',
    },
    {
      speaker: '小隊員陳浩',
      text: '少校，B 案等於送您去死。',
      expression: 'serious',
    },
    {
      speaker: '少校奧斯卡',
      text: '是。隊長的責任。',
      expression: 'serious',
    },
    {
      speaker: '小隊員王森',
      text: '我們不接受。',
      expression: 'angry',
    },
    {
      speaker: '小隊員林志',
      text: '換我去吧，我最年輕，沒有家累。',
      expression: 'serious',
    },
    {
      speaker: '少校奧斯卡',
      text: '林志，你阿嬤等著你回家。我不會讓你去。',
      expression: 'serious',
    },
    {
      speaker: '小隊員陳浩',
      text: '等等——還有 C 案！五人同時進攻，把能量陷阱拆掉！',
      expression: 'surprised',
    },
    {
      speaker: '少校奧斯卡',
      text: '五人都會進入危險區，而且不確定拆得掉。',
      expression: 'serious',
    },
    {
      speaker: '小隊員陳浩',
      text: '五個都活，總比一個獨自死機會高——對吧？',
      expression: 'serious',
    },
    {
      speaker: '少校奧斯卡',
      text: '好，C 案。但第一個進去的還是我。',
      expression: 'serious',
    },
    {
      speaker: '少校奧斯卡',
      text: '出發！',
      expression: 'angry',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '少校奧斯卡',
      text: '能量陷阱拆掉了！',
      expression: 'happy',
    },
    {
      speaker: '小隊員陳浩',
      text: '少校，五個都活著！',
      expression: 'happy',
    },
    {
      speaker: '少校奧斯卡',
      text: '你肩膀中彈了——',
      expression: 'serious',
    },
    {
      speaker: '小隊員陳浩',
      text: '皮肉傷。您的肩膀也中彈了，少校。',
      expression: 'serious',
    },
    {
      speaker: '小隊員王森',
      text: '等等，後面有動靜——第二波來了！',
      expression: 'angry',
    },
    {
      speaker: '少校奧斯卡',
      text: '陷阱拆了，迷霧本身還沒散！全員撤退！',
      expression: 'angry',
    },
  ],
  rewards: {
    coins: 1900,
    talentPoints: 13,
  },
};
