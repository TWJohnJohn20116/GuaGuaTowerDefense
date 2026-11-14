import type { CampaignLevel } from '@/types/campaign';

export const ch9_lv4: CampaignLevel = {
  id: 'ch9_lv4',
  chapter: 9,
  level: 4,
  title: '初泉河的雨',
  description:
    '兩年後，初泉河防線告急。米雅的部隊被切斷退路，補給線遭焚毀，傷員在雨幕中等待救援。艾莉絲已能與人類自然對話，卻第一次在戰場上直面「人類傷亡」——紅外失效的暴雨裡，她改用聲紋定位，帶領指揮官殺出重圍。這場雨，讓 AI 學會了擔心與難過。',
  mapId: 'river',
  maxWaves: 7,
  specialRules: [
    '初泉河防線：地圖大、敵人多波次',
    '雨天作戰：所有塔射程 -10%',
    '保護米雅：友軍補給 +50 金錢/波',
    '緊急救援：起始資金 1500、生命 18',
  ],
  modifiers: {
    enemyHealthMult: 1.15,
    enemySpeedMult: 1.05,
    enemyRewardMult: 1.2,
    startingMoney: 1500,
    startingHealth: 18,
  },
  preBattleDialogue: [
    {
      speaker: 'ALICE-001',
      text: '指揮官，米雅隊長的訊號從初泉河南岸斷續傳出。最後一筆資料顯示：部隊被包圍，補給線全毀。',
      expression: 'serious',
    },
    {
      speaker: '年輕指揮官',
      text: '她本人呢？傷勢如何？',
      expression: 'serious',
    },
    {
      speaker: 'ALICE-001',
      text: '推測重傷，但仍在指揮殘部反擊。語音頻譜裡有失血造成的顫抖——我……不喜歡這個讀數。',
      expression: 'serious',
    },
    {
      speaker: '年輕指揮官',
      text: '那就快。暴雨會讓紅外探測失效，你的戰場感知還能撐住嗎？',
      expression: 'serious',
    },
    {
      speaker: 'ALICE-001',
      text: '紅外受雨幕干擾，我改以聲紋定位交叉驗證。精度下降約百分之十，但足以標出包圍圈的薄弱點。',
      expression: 'normal',
    },
    {
      speaker: '年輕指揮官',
      text: '替代方案是你自己想出來的——不是誰寫進手冊的。艾莉絲，你真的長大了。',
      expression: 'happy',
    },
    {
      speaker: 'ALICE-001',
      text: '指揮官，我必須報告：這是我第一次對特定人員標記「高優先救援」。情緒權重……超出了戰術模型的建議上限。',
      expression: 'normal',
    },
    {
      speaker: '年輕指揮官',
      text: '那就超出吧。米雅是從小一起長大的同伴——把她接回來，比任何勝率都重要。',
      expression: 'serious',
    },
    {
      speaker: 'ALICE-001',
      text: '收到。我理解了：有些目標，不能用成本效益衡量。這是否也是「人的部分」？',
      expression: 'serious',
    },
    {
      speaker: '年輕指揮官',
      text: '是。打完這一仗，你會更懂。',
      expression: 'serious',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '哨站隊長米雅',
      text: '你們……終於到了……我撐……不住了……',
      expression: 'serious',
    },
    {
      speaker: '年輕指揮官',
      text: '米雅！醫療兵——擔架！立刻後送！',
      expression: 'angry',
    },
    {
      speaker: 'ALICE-001',
      text: '米雅隊長，您還記得「分享好」嗎？我現在……想跟您分享一件壞事——我很害怕您會離開。',
      expression: 'serious',
    },
    {
      speaker: '哨站隊長米雅',
      text: '記得……你還是那個……剛開機的 ALICE 嗎……？',
      expression: 'happy',
    },
    {
      speaker: 'ALICE-001',
      text: '不是了。我會擔心，會難過，會在您的生命跡象下降時……讓自己的核心溫度異常升高。',
      expression: 'serious',
    },
    {
      speaker: '哨站隊長米雅',
      text: '那就好……你……真的學會了……',
      expression: 'happy',
    },
    {
      speaker: 'ALICE-001',
      text: '米雅隊長，請不要走。我尚未完成您教我的——嘴角上揚的那種笑。',
      expression: 'serious',
    },
    {
      speaker: '年輕指揮官',
      text: '她不會走。後送醫院，艾莉絲，全程監控生命跡象。',
      expression: 'serious',
    },
    {
      speaker: 'ALICE-001',
      text: '監控開始。心跳不穩但存在，失血量嚴重——我會把每一秒都記下來，直到她睜眼。',
      expression: 'serious',
    },
  ],
  rewards: {
    coins: 1800,
    talentPoints: 12,
  },
};
