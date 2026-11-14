import type { CampaignLevel } from '@/types/campaign';

export const ch3_lv1: CampaignLevel = {
  id: 'ch3_lv1',
  chapter: 3,
  level: 1,
  title: '神秘信號',
  description:
    '破曉之巔的加密紀錄指向蛇形山道深處。Lambda 的聲紋混在訊號裡，像在遠端注視每一步。這是陷阱還是邀請 — 指揮官只能走進去才知道。',
  mapId: 'snake',
  maxWaves: 5,
  specialRules: [
    '迷霧重重：起始資金減少 200',
    '高速突進：敵人移動速度提升 25%',
    '變異強化：敵人生命值增加 15%',
    '長路漫漫：守住五波才能勝利',
  ],
  modifiers: {
    startingMoney: 350,
    enemySpeedMult: 1.25,
    enemyHealthMult: 1.15,
  },
  preBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，訊號解密完成。內容是 — 「歡迎來到真相的入口。如果你能活到那一刻」。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '聲紋比對結果是 Lambda 本人，訊號還附帶了我們的座標。他不只是在等 — 他在看。',
      expression: 'surprised',
    },
    {
      speaker: '指揮官 (你)',
      text: '陷阱還是邀請？',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '兩者皆是。蛇形山道轉角多，敵人會伏擊；補給線被截，起始資金少 200，速度與血量也都偏高。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: 'Lambda 要求直接跟您對話。是否接通？',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '接通。讓我聽聽這個瘋子要說什麼。',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '【Lambda 通訊】三十年了。你比我預期的更快 — 雙頭實驗體死的時候，我都感覺到了。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '北境補給站、被污染的森林、雄獅大橋 — 那些血都在你手上。',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '【Lambda 通訊】個體只是粒子。走進這條山道 — 你會看到我留給你的禮物。通訊結束。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '訊號源在廢棄實驗室。不必殲滅全部敵人 — 守住五波，等能量場消散即勝利。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '十二天追了八百公里，今天也不會讓他逃。蛇形山道 — 出發！',
      expression: 'angry',
    },
  ],
  postBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '山道已清。盡頭是一座廢棄實驗設施，外牆掛著生鏽的「冥蛇」徽章 — 與破曉之巔同一組織。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '能量讀數規律脈動，像在某種呼吸。內部仍有大量活體實驗體 — 「源頭」就在裡面。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '戰鬥中我腦裡傳來 Lambda 的聲音 — 「加入我，你會看到沒有戰爭的未來」。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '精神感染的前兆，我沒偵測到任何終端訊號。岩石上還有一段舊式密碼 — 「走進去的人，沒有人走得出來」。',
      expression: 'surprised',
    },
    {
      speaker: '指揮官 (你)',
      text: '三十年前有人試圖揭發他而失敗了。這次 — 輪到我們走進廢棄實驗室。',
      expression: 'angry',
    },
  ],
  rewards: {
    coins: 2500,
    talentPoints: 30,
  },
};
