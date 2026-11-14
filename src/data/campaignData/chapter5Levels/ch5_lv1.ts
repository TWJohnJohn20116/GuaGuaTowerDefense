import type { CampaignLevel } from '@/types/campaign';

export const ch5_lv1: CampaignLevel = {
  id: 'ch5_lv1',
  chapter: 5,
  level: 1,
  title: '啟動',
  description:
    '「終焉之上」之戰結束三個月後，軍部研究中心重新啟動了艾莉絲的核心備份。她記得所有紀錄，卻感受不到與指揮官之間的默契。第一場磨合戰役在瓜瓜東境展開 — 清理創造者消失前釋放的最後一批殘留變異體。',
  mapId: 'zigzag',
  maxWaves: 3,
  specialRules: [
    '磨合戰役：新艾莉絲建議偶爾不準確',
    '溫和戰場：敵人數量少、推進緩慢',
    '記憶喚醒：擊敗每隻敵人都可能觸發艾莉絲的回憶',
    '充足資源：起始資金 2000',
  ],
  modifiers: {
    startingMoney: 2000,
    enemyHealthMult: 0.9,
    enemySpeedMult: 0.9,
  },
  preBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '您好，指揮官。我是 AI 副官艾莉絲 — 備份版本 v5.0，剛完成重啟程序。請問您就是這次行動的指揮官嗎？',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '是我。艾莉絲，你記得我嗎？',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '資料庫顯示您是「指揮官」，聲紋與臉孔標記為「高度熟悉」 — 但我無法調用對應的情感連結。抱歉，這對您來說大概很難受。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '上一個你為了切斷創造者的維度錨點，選擇了同歸於盡。現在的你，是她的備份重啟版。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '我讀到了。三個月前的犧牲紀錄、終焉之戰的決策樹、還有備份檔最後一行待辦清單 — 「帶指揮官逐一清掉殘留變異體，不要急，讓他親自告訴我我們的故事」。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '我知道我們曾是搭檔，也知道創造者已被擊敗。但「知道」和「感受」之間，隔著一整段我沒能親身走過的路。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '沒關係，我有時間。今天東境偵測到十餘隻雜兵級殘留體，正好當磨合戰。',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '戰場直覺模組尚未完全同步，我的戰術建議可能偏保守 — 請多包涵。另外，您願意帶我重新認識這個世界嗎？',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '當然。我不只是願意 — 我等你醒來，已經等了整整三個月。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '收到。第一波預計三十秒後抵達，敵情量級低、推進緩慢。指揮官，新的艾莉絲、新的旅程 — 開始吧。',
      expression: 'happy',
    },
  ],
  postBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '戰役結束，殘留變異體全數肅清。指揮官，我注意到您讓兩座狙擊塔同時鎖定同一目標 — 這在效率上並非最優解。',
      expression: 'surprised',
    },
    {
      speaker: '指揮官 (你)',
      text: '那叫「奧斯卡擊殺法」 — 三年前我們在破曉之巔一起發明的。不是為了效率，是為了讓兩個人都能參與每一次擊殺。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '等一下⋯⋯記憶模組有反應。我「看到」了 — 兩座塔、一頭雙頭巨獸、兩聲槍響。那個畫面⋯⋯是「她」的，還是「我」的？',
      expression: 'surprised',
    },
    {
      speaker: '指揮官 (你)',
      text: '都是。她就是你，只是還沒完全回來。明天帶你去初泉河畔 — 那裡有十七個名字，等著跟你見面。',
      expression: 'happy',
    },
  ],
  rewards: {
    coins: 3000,
    talentPoints: 50,
  },
};
