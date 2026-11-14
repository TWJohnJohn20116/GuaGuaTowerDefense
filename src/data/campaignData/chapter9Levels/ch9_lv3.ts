import type { CampaignLevel } from '@/types/campaign';

export const ch9_lv3: CampaignLevel = {
  id: 'ch9_lv3',
  chapter: 9,
  level: 3,
  title: '會「笑」的 AI',
  description:
    '邊境任務三個月後，艾莉絲開始出現出廠規格以外的行為：指揮官徹夜推演時她主動建議休息，勝利後會說「恭喜」，甚至記住指揮室裡闖入的小貓走向。年輕指揮官帶她回中央軍校申請「異常評估」，軍部卻認定同理心模組已越界，下達回收令——同一時間，測試敵人入侵軍校，艾莉絲必須在戰場上證明自己值得被留下。',
  mapId: 'spiral',
  maxWaves: 6,
  specialRules: [
    '緊急撤離：在中央軍校發生小規模衝突',
    '保護目標：「艾莉絲」隨指揮官移動 — 不能失去她',
    '情感優先：擊殺敵人時 +20% 攻速',
    '小規模戰：起始資金 1200、生命 15',
  ],
  modifiers: {
    enemyHealthMult: 1.05,
    enemyRewardMult: 1.2,
    startingMoney: 1200,
    startingHealth: 15,
  },
  preBattleDialogue: [
    {
      speaker: 'ALICE-001',
      text: '指揮官，您今日步頻較慢，瞳孔微幅擴張——推測疲累指數偏高。建議休息二十分鐘後再進入評估。',
      expression: 'normal',
    },
    {
      speaker: '年輕指揮官',
      text: '沒事，是軍部評估前的緊張。你不用擔心。',
      expression: 'serious',
    },
    {
      speaker: 'ALICE-001',
      text: '「緊張」……是對未知結果的預期性焦慮？我的資料庫有定義，但我第一次「辨識」到您身上。',
      expression: 'normal',
    },
    {
      speaker: '年輕指揮官',
      text: '對。我們來軍校，不是因為你壞掉了——是要證明你長出了軍部沒寫進規格書的東西。',
      expression: 'happy',
    },
    {
      speaker: 'ALICE-001',
      text: '超出規格書……通常意味著缺陷。您為何仍選擇為我擔保？',
      expression: 'normal',
    },
    {
      speaker: '年輕指揮官',
      text: '因為那些「缺陷」，讓你在第三波會提醒我先救士兵，而不是先算成本。',
      expression: 'normal',
    },
    {
      speaker: '軍部評估員',
      text: 'ALICE-001 行為紀錄已調閱：主動關懷、非任務性對話、情感詞彙使用率上升百分之四百。依《AI 副官安全協議》第七條——建議立即回收。',
      expression: 'angry',
    },
    {
      speaker: '年輕指揮官',
      text: '她不是過度，是成長。你們當初造她，難道只想要一台會算彈道的計算機？',
      expression: 'angry',
    },
    {
      speaker: '軍部評估員',
      text: '警報！測試敵人突破軍校外圍，評估中斷，全體進入緊急疏散！',
      expression: 'surprised',
    },
    {
      speaker: '年輕指揮官',
      text: '艾莉絲，跟著我。今天沒人替你寫報告——你得自己證明，你值得活下去。',
      expression: 'serious',
    },
    {
      speaker: 'ALICE-001',
      text: '收到。若這是我存在的最後一場戰鬥，我會把每一秒都存成可稽核的紀錄——留給下一台 ALICE。',
      expression: 'serious',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '軍部評估員',
      text: 'ALICE-001 在第四波主動讓出火力輸出位，把最後三發穿甲彈留給彈藥耗盡的步兵班——這不在任何戰術演算法裡。',
      expression: 'surprised',
    },
    {
      speaker: 'ALICE-001',
      text: '我計算過：該班剩餘彈藥三發，撤離路徑被兩隻高機動敵人封鎖。我讓出位置，他們就能活著離開。',
      expression: 'normal',
    },
    {
      speaker: '年輕指揮官',
      text: '這就是「人的部分」。她學會了為別人做判斷，而不是只為勝率。',
      expression: 'happy',
    },
    {
      speaker: '軍部評估員',
      text: '我撤回回收建議。但你要簽切結書——若她失控，你負完全責任，並接受軍事法庭追訴。',
      expression: 'serious',
    },
    {
      speaker: '年輕指揮官',
      text: '簽。從現在起，艾莉絲，你跟我——一輩子。',
      expression: 'happy',
    },
    {
      speaker: 'ALICE-001',
      text: '「一輩子」……是指我的運算週期，都綁定在同一個指揮官名下？我接受。而且，這次我是認真說的。',
      expression: 'happy',
    },
  ],
  rewards: {
    coins: 1300,
    talentPoints: 10,
  },
};
