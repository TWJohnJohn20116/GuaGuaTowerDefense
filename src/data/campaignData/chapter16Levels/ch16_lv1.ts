import type { CampaignLevel } from '@/types/campaign';

export const ch16_lv1: CampaignLevel = {
  id: 'ch16_lv1',
  chapter: 16,
  level: 1,
  title: '夢中的另一個我',
  description:
    '退休後的老指揮官，某夜被兩個核心拉進一場「不是夢的夢」。他看見十八歲那年沒去軍校的自己——留在初泉鎮開麵包店，結婚、生子，過著他從未選擇的平凡人生。但平行時間線也有危機：麵包店遭人縱火，鎮上少年與縱火犯在長廊對峙，另一個他手忙腳亂，不知該先救店還是救人。',
  mapId: 'corridor',
  maxWaves: 4,
  specialRules: [
    '夢境麵包店：地圖採用「長廊」街道',
    '麵包香味：所有塔射速 +5%',
    '平凡英雄：起始資金 1100、生命 12',
    '為麵包店而戰：擊殺敵人 +30% 金錢',
  ],
  modifiers: {
    enemyHealthMult: 0.95,
    enemyRewardMult: 1.3,
    startingMoney: 1100,
    startingHealth: 12,
  },
  preBattleDialogue: [
    {
      speaker: '老指揮官（52 歲）',
      text: '⋯ 艾莉絲，我剛才「看見」另一個自己。他穿圍裙，手上有麵粉，完全不像指揮官。',
      expression: 'surprised',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '⋯ 指揮官，那不是普通夢境。兩個核心用您腦中的記憶碎片，投影出一條平行時間線。',
      expression: 'normal',
    },
    {
      speaker: '老指揮官（52 歲）',
      text: '⋯ 平行時間線？意思是——十八歲那年，我若沒去軍校，就會變成那樣？',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '⋯ 是的。那條線上的您開了「初泉麵包坊」，娶了花匠，有兩個孩子，三十年沒碰過槍。',
      expression: 'happy',
    },
    {
      speaker: '老指揮官（52 歲）',
      text: '⋯ 我活了半輩子戰場，卻在夢裡看見自己揉麵團。說不上羨慕，只是……很陌生。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '⋯ 但「麵包師您」此刻正面臨危機。有人縱火，鎮上少年堵在長廊兩端，局勢隨時失控。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（52 歲）',
      text: '⋯ 他沒受過軍事訓練，連防線該怎麼拉都不知道。另一個我，會不會就這樣失去一切？',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '⋯ 兩個核心已開啟跨時間線通道。您可以在這邊指揮，替他守住麵包坊與街道。',
      expression: 'normal',
    },
    {
      speaker: '老指揮官（52 歲）',
      text: '⋯ 好。這一仗不為軍功，只為讓「沒當軍人的我」還有家可回。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '⋯ 通道穩定。指揮官，請下令——初泉長廊，開戰。',
      expression: 'serious',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '麵包師指揮官',
      text: '⋯ 奇怪，店門口的障礙怎麼自己排好了？我明明只會排麵包架啊。',
      expression: 'surprised',
    },
    {
      speaker: '老指揮官（52 歲）',
      text: '⋯ 麵包師，聽得到嗎？我是另一條時間線的你。剛才那一仗，是我替你打的。',
      expression: 'normal',
    },
    {
      speaker: '麵包師指揮官',
      text: '⋯ 這聲音……怎麼像照鏡子？你說「另一條時間線」是什麼意思？',
      expression: 'surprised',
    },
    {
      speaker: '老指揮官（52 歲）',
      text: '⋯ 你十八歲留下開店，我十八歲去了軍校。我們是同一人，只是選了不同的路。',
      expression: 'normal',
    },
    {
      speaker: '麵包師指揮官',
      text: '⋯ 那你為什麼幫我？你那邊一定也很忙吧。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（52 歲）',
      text: '⋯ 因為平行時間線上的你，也是我的家人。麵包店還在，這就夠了。',
      expression: 'happy',
    },
  ],
  rewards: {
    coins: 1300,
    talentPoints: 9,
  },
};
