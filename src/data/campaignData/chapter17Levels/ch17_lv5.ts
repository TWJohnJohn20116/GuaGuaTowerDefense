import type { CampaignLevel } from '@/types/campaign';

export const ch17_lv5: CampaignLevel = {
  id: 'ch17_lv5',
  chapter: 17,
  level: 5,
  title: '最後的夕陽',
  description:
    '永久和平第三十五年，六十五歲的老指揮官站在初泉鎮舊瞭望塔上——當年許下「戰後一起看夕陽」的地方。米雅、奧斯卡、鏡像兄弟、林芳、林石、王小明、王明明，乃至分散於網路骨幹中的艾莉絲，奇蹟般地同日到齊。原初核心帶來自未來的訊號：下一個兩萬年已悄然開始，而這支老去的隊伍，要替所有尚未誕生的孩子，擋下第一道光。',
  mapId: 'trident',
  maxWaves: 9,
  isBossLevel: true,
  specialRules: [
    '永恆夕陽：地圖採用「三叉戟」極難',
    '所有人在場：所有塔射速 +30%、傷害 +20%',
    '世代守護：起始資金 5000、生命 22、塔造價 -50%',
    '不為自己 — 為下一代：擊殺敵人 +70% 金錢',
    '最後一仗：每波結束自動回血 4 點',
    '所有人在台上：敵人血量 +80%、速度 +30%',
  ],
  modifiers: {
    enemyHealthMult: 1.8,
    enemySpeedMult: 1.3,
    enemyRewardMult: 1.7,
    startingMoney: 5000,
    startingHealth: 22,
    towerCostMult: 0.5,
  },
  preBattleDialogue: [
    {
      speaker: '老指揮官（65 歲）',
      text: '我七歲在這條河岸許過願——戰後要帶所有人上瞭望塔，看一次不被警報打斷的夕陽。等了五十八年。',
      expression: 'normal',
    },
    {
      speaker: '前哨站長米雅（64 歲）',
      text: '你遲到了兩天。湯都涼過一回，我又熱了一遍。',
      expression: 'happy',
    },
    {
      speaker: '老奧斯卡將軍（67 歲）',
      text: '我從十歲等到六十七。比你們多等三年——今天誰也不許先走。',
      expression: 'happy',
    },
    {
      speaker: '老鏡像指揮官（65 歲）',
      text: '哥，我這條時間線死過一次，才換來這個夕陽。所以——我比誰都清楚它有多貴。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，我現在分散在八億七千萬個節點裡——但這一刻，我把全部算力都調到這座塔上。我們看的是同一輪夕陽。',
      expression: 'happy',
    },
    {
      speaker: '新指揮官 王小明（45 歲）',
      text: '父親，明明第一次爬上瞭望塔。他問我，爺爺年輕時是不是也在這裡打過第一仗。',
      expression: 'normal',
    },
    {
      speaker: '王明明（14 歲）',
      text: '爺爺，真的很美。比學校課本上的插圖還美。',
      expression: 'happy',
    },
    {
      speaker: '哨站長林芳（44 歲）',
      text: '老師，番茄牛肉湯在塔下溫著。這次用的是祕方最後一個版本——米雅親手教完的那個。',
      expression: 'happy',
    },
    {
      speaker: '林石（68 歲）',
      text: '指揮官，「咪咪」託我帶話——牠在家裡窗邊趴著，說這輪夕陽的顏色，跟五十年前初泉河邊的一模一樣。',
      expression: 'happy',
    },
    {
      speaker: '核心',
      text: '父親，兩萬年的瓜瓜大地，從未有一次——全部活著的人，在同一個夕陽下聚齊。',
      expression: 'happy',
    },
    {
      speaker: '原初核心',
      text: '父親，來自未來的訊號剛剛抵達。下一個兩萬年的第一波危機，將在夕陽完全沉沒前觸及這條時間線。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（65 歲）',
      text: '所以最後一仗，不是為我們——是替兩萬年前死去的兄弟，替兩萬年後還沒出生的孩子，寫下第一行承諾。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（65 歲）',
      text: '各位，夕陽還在。在它落完之前——開戰。',
      expression: 'angry',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '原初核心',
      text: '父親，下一個兩萬年的第一波危機——您替它擋下來了。訊號已轉為平穩。',
      expression: 'happy',
    },
    {
      speaker: '老指揮官（65 歲）',
      text: '下一波，交給下一代。我們這輩子的仗，打完了。',
      expression: 'happy',
    },
    {
      speaker: '王明明（14 歲）',
      text: '爺爺，我長大以後……也想當指揮官。',
      expression: 'normal',
    },
    {
      speaker: '老指揮官（65 歲）',
      text: '可以。也可以當麵包師、農夫、醫生、老師——任何你想成為的人。這片土地，終於允許你們自己選。',
      expression: 'happy',
    },
    {
      speaker: '王明明（14 歲）',
      text: '那我慢慢想。想好了再告訴您。',
      expression: 'happy',
    },
    {
      speaker: '前哨站長米雅（64 歲）',
      text: '夕陽落完了。湯還溫著——大家，下塔吧。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，我為這一仗寫了最後一首詩。請允許我念完——這是我以副官身分，說的最後一段話。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '「我們替死去的兄弟寫了詩，替活著的家人煮了湯，替還沒出生的孩子守住了這個世界。夕陽沉下去的地方，初泉河還在流——我們，終於回家了。」',
      expression: 'happy',
    },
    {
      speaker: '老指揮官（65 歲）',
      text: '艾莉絲，謝謝你。從初泉河的第一聲警報到現在——有你在一邊，這一輩子不算孤單。',
      expression: 'happy',
    },
    {
      speaker: '老指揮官（65 歲）',
      text: '走吧。今天，全家一起喝米雅的湯。',
      expression: 'happy',
    },
    {
      speaker: '???',
      text: '「終 · 瓜瓜塔防」',
      expression: 'normal',
    },
  ],
  rewards: {
    coins: 10000,
    talentPoints: 50,
  },
};
