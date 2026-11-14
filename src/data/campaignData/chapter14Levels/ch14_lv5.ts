import type { CampaignLevel } from '@/types/campaign';

export const ch14_lv5: CampaignLevel = {
  id: 'ch14_lv5',
  chapter: 14,
  level: 5,
  title: '公開，或一起被埋',
  description:
    '兩個瓜瓜大地融合後第三年。五十四歲的林石退休住在初泉鎮，夢見父母說「不為你驕傲，但我們愛你」。他決定公開靈魂重組的全部研究，腐敗派卻派人在公開前滅口——這是他為敵方陣營寫下的最後一戰。',
  mapId: 'maze',
  maxWaves: 8,
  isBossLevel: true,
  specialRules: [
    '退休守密：地圖採用「迷宮」極難分流',
    '老科學家不死：起始資金 2200、生命 16、塔造價 -25%',
    '腐敗派最後一搏：敵人血量 +50%、速度 +20%',
    '為了真理：擊殺敵人 +50% 金錢',
    '研究永不被埋：每波結束自動回血 2 點',
  ],
  modifiers: {
    enemyHealthMult: 1.5,
    enemySpeedMult: 1.2,
    enemyRewardMult: 1.5,
    startingMoney: 2200,
    startingHealth: 16,
    towerCostMult: 0.75,
  },
  preBattleDialogue: [
    {
      speaker: '重組者',
      text: '夢裡，媽媽和爸爸說：不為你驕傲，但我們愛你。我聽懂了。',
      expression: 'happy',
    },
    {
      speaker: '重組者',
      text: '從今天起，靈魂重組的全部研究——公開給兩個世界。誰都別想獨吞。',
      expression: 'serious',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '林博士，我代表新軍部向您道歉。三十二年前那批動員，是不可饒恕的錯誤。',
      expression: 'serious',
    },
    {
      speaker: '重組者',
      text: '我不需要道歉，我需要制度。徵兵要家屬同意、名單要公開、事後要追蹤。',
      expression: 'serious',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '三條我都可以保證。但公開研究之前，您得先活過今晚。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '偵測到腐敗派高層派出約兩百人，目標是在公開前滅口。距離到達：八分鐘。',
      expression: 'angry',
    },
    {
      speaker: '重組者',
      text: '他們怕的不是技術，是「所有人都能知情」。',
      expression: 'serious',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '您退休了，我也退役了。但這一仗，得替下一代打完。',
      expression: 'serious',
    },
    {
      speaker: '重組者',
      text: '好。兩個被軍部用過的人，最後並肩守一次真理——這倒挺諷刺的。',
      expression: 'normal',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '為了兩個世界永遠擁有靈魂重組的選擇權，開戰！',
      expression: 'angry',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '重組者',
      text: '公開完畢。今晚起，全大陸都能看到完整研究——附帶三條倫理底線。',
      expression: 'happy',
    },
    {
      speaker: '重組者',
      text: '第一，僅限自然死亡、意外死亡、戰場陣亡。第二，須家屬與死者生前雙重同意。第三，軍部不得單獨執行，須民間倫理委員會與研究者聯署。',
      expression: 'serious',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '我以新世界指揮官身分接受。這三條，從今天起永久生效。',
      expression: 'happy',
    },
    {
      speaker: '重組者',
      text: '還有一件事。三十二年前第一次重組失敗的貓——咪咪，我保留了她的靈魂副本。',
      expression: 'happy',
    },
    {
      speaker: '重組者',
      text: '現在技術完整了。我想讓她回來，這次連「記得我」一起回來。',
      expression: 'happy',
    },
    {
      speaker: '鏡像指揮官（年輕版）',
      text: '去吧。您欠自己的，比欠這個世界還多。',
      expression: 'happy',
    },
    {
      speaker: '重組者',
      text: '媽媽、爸爸，一輩子的研究終於有用。敵方陣營的「重組者」——從這裡畢業了。',
      expression: 'happy',
    },
  ],
  rewards: {
    coins: 3500,
    talentPoints: 25,
  },
};
