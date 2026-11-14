import type { CampaignLevel } from '@/types/campaign';

export const ch1_tutorial: CampaignLevel = {
  id: 'ch1_tutorial',
  chapter: 1,
  level: 1,
  title: '基礎訓練',
  description:
    '新任指揮官抵達瓜瓜防衛站，窗外即是傳說中的初泉河。在未知威脅逼近邊境之際，軍部要求您先完成戰術模擬，並與隨行 AI 副官艾莉絲建立默契。這場訓練不計生死，卻將決定您能否守住這片大地。',
  mapId: 'zigzag',
  maxWaves: 1,
  preBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，歡迎來到前線基地「瓜瓜防衛站」。我是您的隨行 AI 副官 — 艾莉絲。從今天起，我會駐在您的戰術終端，協助每一場決策。',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '基地位於瓜瓜大地西北丘陵，距邊境防線僅十二公里。窗外那片青草地再往前，就是「初泉河」 — 瓜瓜歷史上第一次擊退入侵者的聖地。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '初泉河⋯⋯祖父的軍事檔案裡寫過這條河。沒想到我上任的第一天，就站在這個位置。',
      expression: 'surprised',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '您的家族在瓜瓜防衛軍中有超過三代的服役紀錄。軍部選擇您，並非偶然 — 邊境最近出現的異常讀數，需要一位能承擔責任的指揮官。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '異常讀數？訓練簡報裡沒提到這個。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '情報仍在分級中。但依照規定，所有新任指揮官必須先通過戰術模擬 — 在真正的威脅到來之前，您得先證明自己握得住這套系統。',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '請先觀察戰場地形。發亮的格子是「可建造區」，防禦塔只能部署在這些位置。',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '中央曲折的線條是敵人行軍路線。模擬機器人會沿此路徑從西側進場，朝「家園基地」推進。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '任務很單純 — 在敵人觸及基地前，把他們全部攔截下來。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '正確。每漏過一個敵人都會扣除家園生命值，歸零即判定失敗。點選可建造格、從工具列選塔、支付金幣即可完成部署。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '金幣來自擊敗敵人與場景獎勵。本場訓練提供充足起始資金，請放心嘗試不同佈陣方式。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '升級和技能呢？',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '點選已建造的塔可開啟升級選單，強化射程與火力。彎道內側的塔通常收益最高。危急時，螢幕底部的圓形圖示是主動技能 — 冷卻結束前請謹慎使用。',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '本場僅有一波模擬敵軍，速度慢、血量低、不會反擊。目標是讓您熟悉「部署 → 升級 → 擊退」的基本循環。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '模擬再完美，也不等於真實戰場。但我會把每一步都當成實戰來打。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '這正是我需要的態度。我負責資料與建議，最終決定權永遠在您手上 — 一位好指揮官，靠的是判斷，不是演算法。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '很好，艾莉絲。模擬開始 — 讓邊境看看，軍部這次沒有選錯人。',
      expression: 'serious',
    },
  ],
  postBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '模擬結束。零漏網、零失誤 — 系統評定「優異」。過去三年新任指揮官中，您的完成速度排名第一。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '贏得太輕鬆了。模擬機器人不會閃避、不會反擊 — 跟真實戰場差太遠。',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '您的直覺沒錯。邊境哨站三小時前觸發紅色警戒 — 大量無法分類的生物訊號正朝防線推進。資料庫裡沒有任何匹配項。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯⋯也就是說，下一場就是實彈。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '是的。基地工坊備好了五百枚金幣與五點才能點數作為補給。請在天賦樹中優先投資攻擊強化或金錢加成 — 您很快就會需要它們。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '收到。初泉河見證過瓜瓜的第一次勝利 — 這次，換我們守在這裡。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，無論前線多險惡，我都會與您並肩。覺醒的時刻到了 — 我們出發吧。',
      expression: 'happy',
    },
  ],
  rewards: {
    coins: 500,
    talentPoints: 5,
  },
};
