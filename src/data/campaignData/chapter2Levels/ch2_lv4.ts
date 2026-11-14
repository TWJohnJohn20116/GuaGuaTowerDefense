import type { CampaignLevel } from '@/types/campaign';

export const ch2_lv4: CampaignLevel = {
  id: 'ch2_lv4',
  chapter: 2,
  level: 4,
  title: '破曉之巔',
  description:
    '舊能量研究所坐落在外海島嶼破曉之巔。船隻靠近時海面沸騰，一頭從未有紀錄的雙頭變異獸浮出，守衛著研究所入口。這是污染的守門人，還是「源頭」放出的試金石？指揮官，您與 Lambda 真正的第一次正面交鋒，就在這裡。',
  mapId: 'island',
  maxWaves: 4,
  isBossLevel: true,
  specialRules: [
    '海上突襲：敵人生命值增加 60%',
    '雙頭巨獸：最後一波出現雙頭首領',
    '研究所支援：起始資金增加 300',
    '極限挑戰：守住四波即可勝利',
  ],
  modifiers: {
    enemyHealthMult: 1.6,
    startingMoney: 800,
    towerCostMult: 0.9,
  },
  preBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '船隻靠近破曉之巔外海。偵測到大型生物訊號 — 體型至少二十倍，資料庫無匹配。海面溫度異常偏高 18 度。',
      expression: 'surprised',
    },
    {
      speaker: '指揮官 (你)',
      text: '又是巨獸之戰？給我看影像。',
      expression: 'surprised',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '全新物種 — 雙頭變異獸。左頭近戰衝撞，右頭遠程能量彈，兩顆頭顱以能量神經索同步。島嶼下方有管線直通海床深處。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '精巧的雙武器系統，幾乎可確定是人造產物。Lambda 三十年來一直在「設計」這些怪物。',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '腦波顯示基礎意識存在，但主導權可能不在牠手上。舊倉庫補給到位，起始資金多 300，塔造價略降一成。',
      expression: 'normal',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '海上環境使敵人血量提升 60%。前三波清雜兵累積資金，第四波才是雙頭首領戰 — 建議先集火右頭，打掉遠程威脅再轉左頭。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: 'Lambda 還活著嗎？',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '我不確定。但他像是在等 — 等一個能走到這座島的指揮官。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '那就讓他等到了。不管牠是什麼 — 今天就把這頭怪物埋在這座島上。所有單位，戰鬥準備！',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '收到，指揮官。為了瓜瓜，為了所有被污染的子民 — 我們開戰！',
      expression: 'angry',
    },
  ],
  postBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '雙頭變異獸生命徵象消失，研究所入口能量場已消散。您集火右頭的決定完全扭轉了戰局。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '斷氣前兩顆頭顱對視了一眼，像在告別。Lambda 把同一個體切割再嫁接 — 自己的兩個頭顱被迫互相殘殺。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '研究所內偵測到未啟動軍用模組 — 火焰塔完整藍圖已下載。設施隸屬秘密組織「冥蛇」，研究生物與不穩定能量的結合。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '【Lambda 錄像】「軍部要關閉冥蛇計畫。新物種還沒誕生 — 我會把自己變成第一個樣本。」',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '「源頭」不是他創造的東西 — 「源頭」就是 Lambda 本人。一個把自己變成實驗體的瘋子。',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '紀錄被深度加密，我已標記三條線索：神秘信號、廢棄實驗室、迷宮深淵。第三章的敵人都是 Lambda 親自設計的最高級實驗體。',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '來吧，Lambda。讓我看看，你三十年的瘋狂是否值得我整個瓜瓜為你獻祭。',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '火焰塔藍圖已寄送至戰術終端。短暫休整後 — 我們前往下一個目的地。',
      expression: 'normal',
    },
  ],
  rewards: {
    coins: 4500,
    talentPoints: 80,
    unlockTower: ['flame'],
  },
};
