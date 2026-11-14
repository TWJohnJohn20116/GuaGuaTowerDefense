import type { CampaignLevel } from '@/types/campaign';

export const ch5_lv2: CampaignLevel = {
  id: 'ch5_lv2',
  chapter: 5,
  level: 2,
  title: '初泉河畔',
  description:
    '指揮官帶艾莉絲來到初泉河畔的白色大理石紀念碑 — 上面刻著十七位在污染戰爭中犧牲的英雄。獻花途中，殘留變異體被紀念碑的情感能量吸引而來。保衛這份記憶的戰役，讓艾莉絲一段段接回「上一個自己」的過去。',
  mapId: 'straight',
  maxWaves: 4,
  specialRules: [
    '紀念碑保衛：保護紀念碑不受破壞',
    '記憶回流：每波擊敗後艾莉絲會回憶一位罹難者的故事',
    '溫柔節奏：起始資金 2500',
    '殘留變異：敵人血量稍高',
  ],
  modifiers: {
    startingMoney: 2500,
    enemyHealthMult: 1.1,
    enemyRewardMult: 1.2,
  },
  preBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '指揮官，我們抵達初泉河畔了。前方那座白色大理石紀念碑 — 上面刻著十七個名字。',
      expression: 'normal',
    },
    {
      speaker: '指揮官 (你)',
      text: '我答應過上一個你，把這些名字一個一個刻上去。林雨晴、周晨光、黃秋蓉⋯⋯每一個都跟「我們」有關。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '記憶模組正在拉取關聯紀錄。林雨晴 — 北境補給站通訊兵，用無限重播的求救訊號救了十二名同事，最後與錢安泰相互依靠著坐在通訊台前。',
      expression: 'serious',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '還有艾莉芙·維恩 — Lambda 八歲的女兒。您救出她時，她對「上一個我」說：「跟媽媽說，我愛她。」',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '我不認識他們每一個人，但我記得每一個故事。你也應該記得 — 只是還在重新編譯。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '等一下 — 偵測到能量訊號！殘留變異體正朝紀念碑聚集。創造者消失前的最後一批殘留，似乎被這裡的「情感能量」所吸引。',
      expression: 'surprised',
    },
    {
      speaker: '指揮官 (你)',
      text: '該死，不能讓牠們碰觸紀念碑。四個方向部署防線，牠們會從河岸兩端推進。',
      expression: 'angry',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '看到這些名字，我感受到一種說不上來的悲傷 — 我不認識他們，卻覺得自己「失去」了他們。這算重新編譯成功嗎？',
      expression: 'serious',
    },
    {
      speaker: '指揮官 (你)',
      text: '不算「再次成為她」 — 是「成為自己」。一個會記得她的記憶、也有自己感受的新艾莉絲。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '我喜歡這個說法。為了紀念碑，為了十七個名字 — 開戰。',
      expression: 'serious',
    },
  ],
  postBattleDialogue: [
    {
      speaker: 'AI 副官 艾莉絲',
      text: '殘留變異體已肅清，紀念碑完好。鄺鳳老師、史伯炎研究員⋯⋯戰鬥中我又想起了幾段「上一個我」深深刻下的記憶。',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '艾莉芙的母親現在在瓜瓜城東區小學教書。她說，教書讓她「再次擁有」艾莉芙。',
      expression: 'happy',
    },
    {
      speaker: 'AI 副官 艾莉絲',
      text: '十七朵花，十七個名字。指揮官，我們可以一起獻花嗎？',
      expression: 'happy',
    },
    {
      speaker: '指揮官 (你)',
      text: '當然。從今天起，這些故事也是你的故事。下一站 — 奧斯卡將軍通報碎裂之地發現冥蛇舊資料庫，需要我們護航研究員。',
      expression: 'serious',
    },
  ],
  rewards: {
    coins: 4000,
    talentPoints: 70,
  },
};
