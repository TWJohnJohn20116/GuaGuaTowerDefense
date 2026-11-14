import { CampaignChapter } from '@/types/campaign';
import { ch14_lv1 } from './chapter14Levels/ch14_lv1';
import { ch14_lv2 } from './chapter14Levels/ch14_lv2';
import { ch14_lv3 } from './chapter14Levels/ch14_lv3';
import { ch14_lv4 } from './chapter14Levels/ch14_lv4';
import { ch14_lv5 } from './chapter14Levels/ch14_lv5';

export const chapter14: CampaignChapter = {
  id: 'ch14_reorganizer',
  chapterNumber: 14,
  title: '外傳 · 重組者：他從哪來',
  levels: [ch14_lv1, ch14_lv2, ch14_lv3, ch14_lv4, ch14_lv5],
};
