import type { CampaignLevel } from '@/types/campaign';

export const ch14_lv2: CampaignLevel = {
  id: 'ch14_lv2',
  chapter: 14,
  level: 2,
  title: '拒絕軍部的科學家',
  description:
    '十五年後，二十一歲的林石已是鏡像世界知名的能量重組科學家。他的研究能把瀕死細胞重新編排，但經費始終不足。軍部資助方上門，條件是讓治療服務「指定對象」——林石聽出了武器化的味道。',
  mapId: 'corridor',
  maxWaves: 5,
  specialRules: [
    '研究室攻防：地圖採用「長廊」實驗室走道',
    '科學家不是戰士：所有塔射速 +5%、傷害 -10%',
    '青年研究員：起始資金 1100、生命 12',
    '智慧之戰：擊殺敵人 +30% 金錢',
  ],
  modifiers: {
    enemyHealthMult: 1.0,
    enemyRewardMult: 1.3,
    startingMoney: 1100,
    startingHealth: 12,
  },
  preBattleDialogue: [
    {
      speaker: '青年林石（21 歲）',
      text: '軍部資助方？聽說你們的條件從來不便宜。',
      expression: 'serious',
    },
    {
      speaker: '軍部代表',
      text: '林博士，您的能量重組技術可以拯救戰場傷兵。我們希望您同步研發……更具戰略價值的應用。',
      expression: 'normal',
    },
    {
      speaker: '青年林石（21 歲）',
      text: '直說吧。你們要武器，我只要治療。',
      expression: 'serious',
    },
    {
      speaker: '軍部代表',
      text: '那我們換個說法：您繼續做治療，但治療對象由我們指定。這樣就不算武器了吧？',
      expression: 'normal',
    },
    {
      speaker: '青年林石（21 歲）',
      text: '指定誰能活、誰不能活，跟武器沒兩樣。',
      expression: 'serious',
    },
    {
      speaker: '軍部代表',
      text: '林博士，沒有軍部，您的實驗室撐不過這個冬天。',
      expression: 'normal',
    },
    {
      speaker: '青年林石（21 歲）',
      text: '我父母也是被軍部「帶走」的。他們說會回來，結果再也沒有。',
      expression: 'serious',
    },
    {
      speaker: '軍部代表',
      text: '那是上一代的事。現在的軍部需要您這樣的人才——',
      expression: 'normal',
    },
    {
      speaker: '青年林石（21 歲）',
      text: '外面那些人是「保護」還是「監控」？實驗室自動防禦，啟動！',
      expression: 'angry',
    },
    {
      speaker: '軍部代表',
      text: '林博士！公開拒絕軍部，後果您想清楚！',
      expression: 'angry',
    },
    {
      speaker: '青年林石（21 歲）',
      text: '想清楚了。從今天起，我的研究費自己籌，治療對象我自己選。',
      expression: 'serious',
    },
  ],
  postBattleDialogue: [
    {
      speaker: '軍部代表',
      text: '您擋住我們的人，等於正式與軍部決裂。',
      expression: 'serious',
    },
    {
      speaker: '青年林石（21 歲）',
      text: '我父母被徵走後就沒回來。這個決裂，我早就在心裡做過一次了。',
      expression: 'serious',
    },
    {
      speaker: '軍部代表',
      text: '民間募資能撐多久？您會後悔的。',
      expression: 'normal',
    },
    {
      speaker: '青年林石（21 歲）',
      text: '後悔也比把技術交給會拿人當消耗品的人好。',
      expression: 'serious',
    },
    {
      speaker: '軍部代表',
      text: '……祝您好運，林博士。',
      expression: 'normal',
    },
    {
      speaker: '青年林石（21 歲）',
      text: '我會需要的。但這條路，我選了就不回頭。',
      expression: 'serious',
    },
  ],
  rewards: {
    coins: 1200,
    talentPoints: 8,
  },
};
