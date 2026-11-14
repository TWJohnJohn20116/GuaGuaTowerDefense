import type { CampaignLevel } from '@/types/campaign';

export const ch2_lv2: CampaignLevel = {
  id: 'ch2_lv2',
  chapter: 2,
  level: 2,
  title: '雙線突圍',
  description:
    'U 形山谷兩側峭壁已被能量輻射污染，風從南方將紫霧推入谷底。研究中心傳回北境補給站錄音的分析結果 — 變異體也會隨能量強度進化，必須在敵人完全適應之前突圍。通關後，冰凍塔科技將正式下放。',
  mapId: 'u_shape',
  maxWaves: 4,
  specialRules: [
    '能量輻射：敵人移動速度提升 30%',
    '基地缺糧：起始資金減少 200',
    '速戰要求：拖延越久敵人越強',
    '勝利獎勵：獲得冰凍塔藍圖',
  ],
  modifiers: {
    startingMoney: 300,
    enemySpeedMult: 1.3,
    enemyRewardMult: 1.2,
  },
  preBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '抵達 U 形山谷北口。風向南方，能量霧氣沿谷底快速積聚，敵人移動速度比上次高 30%，且會隨輻射強化。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '補給站救援耗了不少物資，這場又得精打細算？',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '起始資金僅標準的六成。不過通關後冰凍塔原型將立即下放 — 低溫能量場可讓敵人減速四成以上。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '終於有控場手段了。錄音分析結果呢？',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '研究中心剛傳回，內容令人不安。那段「金屬撞擊聲」解碼後是一段座標，指向破曉之巔的舊能量研究所。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '三十年前因「神秘爆炸」封鎖的設施，訊號編碼用的是軍部秘密協定「冥蛇計畫」 — 相關紀錄在爆炸後被銷毀。',
      expression: 'surprised',
    },
    {
      speaker: '指揮官 (你)',
      text: '三十年前的加密協定？有人把計畫藏起來，現在又放出訊號引我們去？',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '拖延越久敵人越強，不宜久戰。建議先穩住正面入口，中央高地部署狙擊塔，等敵人分流後再調整火力。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '有目標就好辦。所有單位準備突圍 — 今天必須拿下冰凍塔藍圖！',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '收到。第一波預計從正面入口推進。指揮官 — 開戰！',
      expression: 'serious',
    },
  ],
  postBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '突圍成功。冰凍塔授權已下放，下一場即可部署。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '從錄音到能量訊號，整件事的節奏太精緻了 — 對手像是在演一場戲，把破曉之巔當邀請函。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '葛瑞站長傳來訊息：他在醫院認識了一位參與過冥蛇計畫後勤的老兵雷哥，願意接受您的訪問。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '污染正在往海岸線推進。下一個目標：雄獅大橋。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '那是連接內陸與港區的咽喉。失守的話，整個港區都會暴露在擴散的陰影下。',
      expression: 'serious',
    },
  ],
  rewards: {
    coins: 1800,
    talentPoints: 20,
    unlockTower: ['frost'],
  },
};
