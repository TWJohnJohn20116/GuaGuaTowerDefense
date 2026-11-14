import type { CampaignLevel } from '@/types/campaign';

export const ch3_lv3: CampaignLevel = {
  id: 'ch3_lv3',
  chapter: 3,
  level: 3,
  title: '三方圍剿',
  description:
    '三叉戟路口三條路徑同時湧出敵軍，Lambda 企圖以分散戰術拖垮防線。補給吃緊、精英單位混雜其中，指揮官必須在三線之間做出取捨。戰後從精英單位身上截獲加密晶片，「黑曜石」要塞的座標終於浮出水面。',
  mapId: 'trident',
  maxWaves: 5,
  specialRules: [
    '三線作戰：敵人從三條路徑同時推進',
    '緊張補給：塔造價提升 30%',
    '超額懸賞：擊殺金錢增加 50%',
    '混合敵軍：每波混入精英單位',
  ],
  modifiers: {
    towerCostMult: 1.3,
    enemyRewardMult: 1.5,
    enemyHealthMult: 1.25,
  },
  preBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，前方是極為罕見的三叉戟路口。左、中、右三條路徑都有敵軍集結，最終全部匯流至我方基地。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '三個方向同時進攻 — 這不是隨機污染，是精心策畫的戰爭。',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: 'Lambda 在套用古典的「分散注意力」戰術。三百年前的彎月之戰，敵方也是用三線推進瓦解防線 — 他顯然讀過我們的軍史。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '他不只是生物學家，還是個熟讀戰術的對手。艾莉絲，給我分配方案。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '中路距基地最近，建議優先封鎖；兩翼較長，可用控場塔拖延。本場塔造價提升 30%，但擊殺懸賞加成 50% — 每波還會混入深紅晶體覆身的精英單位，血量多 25%，請優先擊殺。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '又是緊張補給 ⋯ 不過懸賞也算補償。奧斯卡少將還在線上嗎？',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '【奧斯卡少將通訊】指揮官，我在。破曉之巔那一仗我看完了 — 你的指揮已足以寫進軍部史冊。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '少將，若今天我陣亡 — 請把雷哥老先生的訪談歸檔，並在初泉河紀念碑上，加上 Lambda 女兒的名字。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '【奧斯卡少將通訊】⋯ 你連敵人的女兒都要紀念？我答應。但你不會陣亡 — 瓜瓜需要你回家。通話結束。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '收到。三線作戰，三線勝利 — 讓 Lambda 見識什麼叫真正的戰術指揮！',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '為了瓜瓜，為了我們守護的一切 — 所有單位，戰鬥開始！',
      expression: 'angry',
    },
  ],
  postBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '三條路徑均已肅清。我從精英單位身上截獲一枚加密晶片 — 部分解碼顯示，Lambda 將核心藏在代號「黑曜石」的地下要塞，七十年前廢棄的軍用迷宮深處。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '迷宮 ⋯ 視野最差、地形最複雜的地方。能量讀數呢？',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '迷宮深處有極強能量場，Lambda 本人很可能就在那裡。但內部干擾會嚴重影響我的通訊 — 進入之後，您可能要獨自面對最後一段路。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '⋯ 艾莉絲，你會回來的吧？',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '我會盡力。整理裝備 — 這場戰爭，快要見到終局了。',
      expression: 'normal',
    },
  ],
  rewards: {
    coins: 3500,
    talentPoints: 50,
  },
};
