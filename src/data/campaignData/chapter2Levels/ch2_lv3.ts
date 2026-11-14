import type { CampaignLevel } from '@/types/campaign';

export const ch2_lv3: CampaignLevel = {
  id: 'ch2_lv3',
  chapter: 2,
  level: 3,
  title: '大橋保衛戰',
  description:
    '雄獅大橋連接內陸與港區，一旦失守污染將沿海岸線蔓延。出發前，指揮官從老兵口中聽到冥蛇計畫與 Lambda 的片段真相；橋面狹窄、敵人裝甲強化，但第三波起軍部增援將大幅降低建造成本。',
  mapId: 'bridge',
  maxWaves: 5,
  specialRules: [
    '戰略要地：敵人血量增加 20%',
    '橋面狹窄：塔造價提升 20%',
    '增援趕到：第 3 波起援軍降低塔造價',
    '高額獎勵：擊殺敵人金錢增加 30%',
  ],
  modifiers: {
    enemyHealthMult: 1.2,
    towerCostMult: 1.2,
    enemyRewardMult: 1.3,
  },
  preBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '出發前先轉道瓜瓜城軍醫院。葛瑞站長預約的老兵雷哥在那裡，他三十年前參與過冥蛇計畫後勤。',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '【老兵雷哥訪談】「我們運送密封冷藏的樣本到破曉之巔。主持人代號 Lambda，堅信生物能與能量結合。爆炸前他說要做最終試驗 — 我們從未找到他的遺體。」',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: 'Lambda 可能還活著，計畫核心「源頭」應該還在研究所深處。但在此之前 — 雄獅大橋必須先守住。',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '抵達大橋北端。海風夾紫霧從南方湧上，能見度極差。橋面空間有限，塔造價提高兩成，混有裝甲強化個體。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '前兩波得靠最少的塔硬撐，等增援。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '凱倫上校增援第三波抵達，之後建造成本大幅下降。港區近三萬居民已疏散七成八，擊殺懸賞提升至 1.3 倍。',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '【凱倫上校通訊】增援車隊第三波抵達。在那之前 — 整座大橋交給您。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '凱倫上校，等您來的時候，橋還會在這裡。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '為了瓜瓜，為了港區居民 — 出發！',
      expression: 'happy',
    },
  ],
  postBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '大橋守住，增援已接手後續清污，港區疏散完成。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '戰鬥末尾截獲加密訊號，發訊者自稱「源頭」：「歡迎來到擴散的陰影。」加密協定與冥蛇計畫一致。',
      expression: 'surprised',
    },
    {
      speaker: '指揮官 (你)',
      text: '「源頭」就是 Lambda — 或者延續他意志的什麼東西。訊號軌跡指向外海破曉之巔。',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '【凱倫上校通訊】我會常駐大橋。您放心往破曉之巔前進。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '研究所地下結構三十年來從未真正死去。我準備好了 — 雷哥的訪談記得歸檔，這段歷史需要被記住。',
      expression: 'serious',
    },
  ],
  rewards: {
    coins: 2200,
    talentPoints: 25,
  },
};
