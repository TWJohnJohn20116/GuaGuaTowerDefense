import type { CampaignLevel } from '@/types/campaign';

export const ch9_lv1: CampaignLevel = {
  id: 'ch9_lv1',
  chapter: 9,
  level: 1,
  title: '啟動日',
  description:
    '時間倒回七年前，神經戰場實驗室。剛從軍校畢業的年輕指揮官領走代號 ALICE 的實驗型副官——全名 Adaptive Learning Intelligence for Combat Engagement，戰鬥模擬數據滿載，實戰經驗卻是零。第一次開機演習中，她連友軍與敵軍都分不清，小型測試瞬間變成混戰。指揮官只能一邊佈防一邊教她：戰場上，什麼才值得被保護。',
  mapId: 'straight',
  maxWaves: 4,
  specialRules: [
    '訓練模式：地圖採用「直線」最簡單路線',
    '新手 AI：所有塔射速 -15%（AI 還在學）',
    '雙倍學習：擊殺敵人 +50% 金錢（AI 收集數據）',
    '小規模測試：起始資金 800、生命 12',
  ],
  modifiers: {
    enemyHealthMult: 0.9,
    enemyRewardMult: 1.5,
    startingMoney: 800,
    startingHealth: 12,
  },
  preBattleDialogue: [
    {
      speaker: '年輕指揮官',
      text: '開機程式，上線。ALICE-001，自我介紹。',
      expression: 'normal',
    },
    {
      speaker: 'ALICE-001',
      text: '系統……啟動。序號 ALICE-001。核心模組：戰術推演、資源分配、威脅辨識。我……是誰？',
      expression: 'normal',
    },
    {
      speaker: '年輕指揮官',
      text: '你是實驗型 AI 副官，我是你的指揮官。從今天起，你的戰場數據由我審核。',
      expression: 'normal',
    },
    {
      speaker: 'ALICE-001',
      text: '「指揮官」……是命令來源？我的倫理模組顯示：應服從最高優先級指令。',
      expression: 'normal',
    },
    {
      speaker: '年輕指揮官',
      text: '服從是底線，不是全部。如果你發現我的判斷有誤，可以先提醒我——這叫「確認後執行」。',
      expression: 'happy',
    },
    {
      speaker: 'ALICE-001',
      text: '「確認後執行」……不在出廠預設流程裡。正在建立新子程序。',
      expression: 'normal',
    },
    {
      speaker: '年輕指揮官',
      text: '很好。軍部選我配對你，不是因為我成績最好，而是因為我願意教——AI 副官計畫需要的，從來不只是演算法。',
      expression: 'normal',
    },
    {
      speaker: 'ALICE-001',
      text: '警報。偵測到不明移動物，熱源特徵與資料庫不符。威脅等級……無法判定。',
      expression: 'surprised',
    },
    {
      speaker: '年輕指揮官',
      text: '那是測試敵人。紅色標記的是敵軍，藍色是我方單位——記住，顏色比速度更重要。',
      expression: 'serious',
    },
    {
      speaker: 'ALICE-001',
      text: '收到。但我的辨識模組回報：部分目標在移動軌跡上重疊。我該……先打誰？',
      expression: 'surprised',
    },
    {
      speaker: '年輕指揮官',
      text: '看著我佈塔。記下三個問題：這是什麼敵人、用什麼塔、放在哪裡——演習結束後，你要能自己回答。',
      expression: 'normal',
    },
    {
      speaker: 'ALICE-001',
      text: '開始學習。附註：我的射速協同目前僅有模擬數據，實戰精度可能下降約百分之十五。',
      expression: 'normal',
    },
    {
      speaker: '年輕指揮官',
      text: '沒關係。今天不追求完美，只追求——別把友軍當成靶子。',
      expression: 'happy',
    },
    {
      speaker: 'ALICE-001',
      text: '……這句話，已寫入我的第一條實戰備忘。',
      expression: 'normal',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '年輕指揮官',
      text: '第一場演習結束。ALICE，匯報你學到了什麼。',
      expression: 'normal',
    },
    {
      speaker: 'ALICE-001',
      text: '高速敵人需優先減速；高耐久目標適用穿透傷害；直線路徑上，交叉火力覆蓋率提升百分之二十三。',
      expression: 'normal',
    },
    {
      speaker: '年輕指揮官',
      text: '戰術部分合格。但還缺「人」的部分——你剛才差點把補給車當成敵人。',
      expression: 'normal',
    },
    {
      speaker: 'ALICE-001',
      text: '「人的部分」……不在戰鬥模擬資料庫的索引裡。請定義。',
      expression: 'normal',
    },
    {
      speaker: '年輕指揮官',
      text: '比方說，剛才那場戰鬥——你覺得好玩嗎？',
      expression: 'happy',
    },
    {
      speaker: 'ALICE-001',
      text: '「好玩」……是情緒詞彙，我沒有對應模組。但我記錄到：當防線穩住時，您的語調下降了零點三個八度。',
      expression: 'normal',
    },
    {
      speaker: '年輕指揮官',
      text: '那就是「鬆了口氣」。慢慢來，我會教您怎麼讀懂這些。我們還有很多年要一起打仗。',
      expression: 'happy',
    },
    {
      speaker: 'ALICE-001',
      text: '收到。附註：我尚未命名。您要繼續叫我 ALICE-001，還是……',
      expression: 'normal',
    },
    {
      speaker: '年輕指揮官',
      text: '叫艾莉絲吧。從零開始的 AI，值得一個名字——而不只是序號。',
      expression: 'happy',
    },
  ],
  rewards: {
    coins: 800,
    talentPoints: 6,
  },
};
