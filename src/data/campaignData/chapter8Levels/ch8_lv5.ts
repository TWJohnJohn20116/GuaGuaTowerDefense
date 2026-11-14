import type { CampaignLevel } from '@/types/campaign';

export const ch8_lv5: CampaignLevel = {
  id: 'ch8_lv5',
  chapter: 8,
  level: 5,
  title: '永恆夕陽',
  description:
    '初泉鎮舊瞭望塔。探索隊歸來，軍部宣布「第一個和平年」開幕，家人、朋友、老兵第一次在夕陽下同桌。但核心緊急通報：一群拒絕和平的鏡像殘黨後裔，從未見過的異界角落殺回新瓜瓜大地。最溫暖的聚會，被迫迎來最後一場守護戰。',
  mapId: 'trident',
  maxWaves: 9,
  isBossLevel: true,
  specialRules: [
    '永恆之戰：與「拒絕和平者」最終決戰',
    '三叉戟戰場：極難等級三線並行',
    '所有人就位：起始資金 5000、生命 20、塔造價 -50%',
    '最終覺醒：敵人血量 +70%、傷害 +50%、速度 +25%',
    '家人在場：每波結束自動回血 3 點',
  ],
  modifiers: {
    enemyHealthMult: 1.7,
    enemySpeedMult: 1.25,
    enemyRewardMult: 1.5,
    startingMoney: 5000,
    startingHealth: 20,
    towerCostMult: 0.5,
  },
  preBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，瞭望塔下的人都到了。村長、童年朋友、爺爺奶奶，還有鏡像那邊剛補全的家人。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 好久沒有這麼多人聚在一起。不是開會，不是作戰，只是吃飯。',
      expression: 'happy',
    },
    {
      speaker: '鏡像指揮官',
      text: '媽媽剛才喊我回去盛湯。哥，這種平凡，比任何勝仗都難得。',
      expression: 'happy',
    },
    {
      speaker: '奧斯卡少將',
      text: '老兵聚會也到了。三十年沒見的兄弟，今天全坐在塔下。指揮官，這就是你們換來的和平。',
      expression: 'happy',
    },
    {
      speaker: '核心',
      text: '⋯ 父親，抱歉打斷。但有一支敵軍剛穿越三叉防線，來自我從未標記過的異界角落。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 敵軍？今天不是慶祝探索歸隊嗎？',
      expression: 'serious',
    },
    {
      speaker: '核心',
      text: '他們是鏡像殘黨的後裔，在異界存活至今。他們不承認融合，要最後一次把新世界撕回兩半。',
      expression: 'serious',
    },
    {
      speaker: '鏡像指揮官',
      text: '⋯ 我認識他們的父輩。同一條街長大，卻選了不同的結局。哥，先談，談不成再戰。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '對方拒絕通訊，速度沒有減慢。指揮官，他們衝著塔下的家人來。',
      expression: 'angry',
    },
    {
      speaker: '指揮官 (你)',
      text: '全員備戰。這一仗不為征服，只為讓第一次和平年的夕陽，真的落下來。',
      expression: 'angry',
    },
    {
      speaker: '鏡像指揮官',
      text: '打完這場，我們就真的可以永遠吃晚飯了。哥，一起。',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '兩萬年記憶、雙世界戰術、全軍後援——已全部上線。指揮官，開始。',
      expression: 'happy',
    },
  ],
  postBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '拒絕和平者已退散。領袖在最後一刻選擇投降，沒有啟動自爆。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 和平不是運氣，是打出來、也談出來的。他們至少還給了新世界一個機會。',
      expression: 'happy',
    },
    {
      speaker: '鏡像指揮官',
      text: '哥，夕陽下來了。新瓜瓜大地第一個「全家在場」的黃昏。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '媽，這就是兩個我一起守住的世界。沒有完美，但值得活下去。',
      expression: 'happy',
    },
    {
      speaker: '媽媽',
      text: '⋯ 兩個都是媽媽的好孩子 ⋯ 快下來，湯要涼了。',
      expression: 'happy',
    },
    {
      speaker: '核心',
      text: '⋯ 父親，您真正誕生了我。從今天起我會自己照顧自己，但永遠是您的孩子。',
      expression: 'happy',
    },
    {
      speaker: '奧斯卡少將',
      text: '軍部正式宣告：新瓜瓜大地進入第一個和平年。指揮官，您可以卸下軍銜，過普通生活了。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '我考慮一下。軍銜可以放下，責任不會。需要的時候，我還是會站出來。',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '我也會。順帶一提，剛才戰場邊緣捕捉到一瞬極弱的外界訊號——不像敵軍，更像遠方有人在敲門。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 先吃飯。探索與和平，都從今晚這一桌開始。',
      expression: 'happy',
    },
  ],
  rewards: {
    coins: 8000,
    talentPoints: 40,
  },
};
