import type { CampaignLevel } from '@/types/campaign';

export const ch17_lv1: CampaignLevel = {
  id: 'ch17_lv1',
  chapter: 17,
  level: 1,
  title: '真正的退休',
  description:
    '永久和平第三十年，六十歲的老指揮官卸下軍部高級顧問職銜。瓜瓜大地放假一天，初泉鎮鑼鼓喧天。慶典進行中，王明明就讀的小學突遭「孩童級」能量殘響襲擊——規模不大，對九歲孩子卻是滅頂之災。老指揮官的謝幕之戰，不為旗幟，只為孫子。',
  mapId: 'straight',
  maxWaves: 4,
  specialRules: [
    '退休慶祝：地圖採用「直線」最簡單路線',
    '老兵餘溫：所有塔射速 +5%',
    '為孫子而戰：起始資金 1500、生命 14',
    '雙倍快樂：擊殺敵人 +30% 金錢',
  ],
  modifiers: {
    enemyHealthMult: 0.9,
    enemyRewardMult: 1.3,
    startingMoney: 1500,
    startingHealth: 14,
  },
  preBattleDialogue: [
    {
      speaker: '老指揮官（60 歲）',
      text: '三十年了。從初泉河的第一發警報，到今天的鑼鼓聲——我原本以為，退休這天只需要簽字。',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，慶典現場一切正常。但我偵測到初泉小學方向有低頻能量殘響，強度約為您當年第一場實戰的百分之十二。',
      expression: 'serious',
    },
    {
      speaker: '王明明（9 歲）',
      text: '爺爺！學校裡有東西在動！老師說要撤，可是低年級走不動！',
      expression: 'angry',
    },
    {
      speaker: '老指揮官（60 歲）',
      text: '明明，退到我身後。爺爺今天退休，但手還沒生鏽。',
      expression: 'serious',
    },
    {
      speaker: '王明明（9 歲）',
      text: '您不是說……以後只下棋、不打仗了嗎？',
      expression: 'normal',
    },
    {
      speaker: '老指揮官（60 歲）',
      text: '退休的意思，是把劍收回鞘裡——不是扔掉。家人需要時，劍還是要出來的。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '殘響源頭判定為 Lambda 紀元遺留的微型變異體，專挑無武裝目標。對成人幾乎無害，對孩童是致命威脅。',
      expression: 'serious',
    },
    {
      speaker: '老指揮官（60 歲）',
      text: '艾莉絲，啟動「老兵餘溫」戰術協議。這一仗不報軍部，不計戰功——只計能不能讓明明放學回家吃飯。',
      expression: 'serious',
    },
    {
      speaker: '王明明（9 歲）',
      text: '爺爺……您打了一輩子仗，最後一場卻是為我？',
      expression: 'normal',
    },
    {
      speaker: '老指揮官（60 歲）',
      text: '不。最後一場，是為了證明——我們守了三十年，值得讓你們這代不必再怕這種東西。',
      expression: 'happy',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '王明明（9 歲）',
      text: '爺爺，那些東西……全不見了。同學們都沒事。',
      expression: 'happy',
    },
    {
      speaker: '老指揮官（60 歲）',
      text: '很好。記住今天——不是記得爺爺打了仗，是記得這片土地，終於輪到你們安心長大。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，軍部詢問是否需派支援。我代您回覆：「已處置完畢，不必驚動。」',
      expression: 'normal',
    },
    {
      speaker: '老指揮官（60 歲）',
      text: '就這樣回。我的謝幕，不需要鑼鼓——有明明牽著手回家，就夠了。',
      expression: 'happy',
    },
  ],
  rewards: {
    coins: 1700,
    talentPoints: 12,
  },
};
