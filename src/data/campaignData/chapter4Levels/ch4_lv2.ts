import type { CampaignLevel } from '@/types/campaign';

export const ch4_lv2: CampaignLevel = {
  id: 'ch4_lv2',
  chapter: 4,
  level: 2,
  title: '碎裂的記憶',
  description:
    '瓜瓜城東區「碎裂之地」被維度裂縫切成無數碎片，過去與現在重疊在同一戰場。指揮官在裂縫另一端見到三年前的自己 — 剛打敗 Lambda、尚未退役的那個人。兩個時間線的指揮官必須並肩防守，才能關閉這道創造者刻意打開的時空實驗。',
  mapId: 'trident',
  maxWaves: 5,
  specialRules: [
    '時空扭曲：場上會隨機出現過去波次的敵人',
    '雙重指揮：「過去的指揮官」會協助防禦',
    '裂縫之眼：敵人血量增加 50%',
    '記憶碎片：擊殺懸賞翻倍',
  ],
  modifiers: {
    enemyHealthMult: 1.5,
    enemyRewardMult: 2.0,
    startingMoney: 1800,
  },
  preBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '抵達「碎裂之地」。空氣中閃爍的紫色光點是時間粒子 — 創造者在這裡撕開維度裂縫，過去、現在、未來三條時間線正在重疊。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '那些光點在重複同一套動作 ⋯ 像被卡住的錄影帶。裂縫另一端有個人影 — 等等，那是我？',
      expression: 'surprised',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '生物特徵確認：那是「三年前的您」— 剛離開迷宮、準備回瓜瓜城的那個指揮官。我來接通通訊。',
      expression: 'surprised',
    },
    {
      speaker: '指揮官（過去）',
      text: '哈囉？我聽到聲音了 ⋯ 你也是「指揮官」？你在說「未來的我」？',
      expression: 'surprised',
    },
    {
      speaker: '指揮官 (你)',
      text: '聽好 —「源頭」的預言成真了。「創造者」醒了，三年後的瓜瓜又陷入戰爭。你願意跟現在的我並肩作戰嗎？',
      expression: 'serious',
    },
    {
      speaker: '指揮官（過去）',
      text: '「創造者」⋯ 源頭臨終也提過這名字，我以為只是虛張聲勢。我的戰術終端還有 1300，可以協助你部署。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '「過去的指揮官」會在戰役中協助部署與升級。場上也會隨機出現過去波次的敵人 — 他熟悉舊套路，您熟悉舊弱點，互補是這場的關鍵。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '還有一件事 — 初泉河邊紀念碑上的十七個名字，我全部刻上去了。你的承諾，我兌現了。',
      expression: 'serious',
    },
    {
      speaker: '指揮官（過去）',
      text: '⋯ 謝謝你。雖然我們是同一個人，聽你這麼說，心裡踏實多了。艾莉絲還在嗎？',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '我在。休眠了三年，直到創造者醒來才被喚回。「過去的指揮官」— 請跟未來的自己好好配合，這場仗會非常奇怪。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '好 —「過去的我」與「現在的我」，一起守住這個維度的瓜瓜。為了瓜瓜，開戰！',
      expression: 'angry',
    },
    {
      speaker: '指揮官（過去）',
      text: '為了瓜瓜 — 開戰！',
      expression: 'angry',
    },
  ],
  postBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '時空裂縫關閉，重組敵人全數肅清。「過去的指揮官」訊號正在衰減 — 連線即將中斷。',
      expression: 'happy',
    },
    {
      speaker: '指揮官（過去）',
      text: '別讓我們救下的人白死 — 好好生活，好好愛家人，好好珍惜艾莉絲。不管結果如何，我以「能成為你」為榮。再會了。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 謝謝你，三年前的我。回家吧。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '重要發現：創造者故意打開裂縫，是在測試「您與過去的您」能否合作 — 它在採集您三年來指揮風格的變化資料。下一目標「破曉之巔」，Lambda 的能量殘留正在被重組。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: 'Lambda 復活了？每一場戰役都是它的實驗室 ⋯ 走，去見見我們的老對手。',
      expression: 'surprised',
    },
  ],
  rewards: {
    coins: 6000,
    talentPoints: 100,
  },
};
