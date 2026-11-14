import { CampaignChapter } from '@/types/campaign';
import { ch10_lv1 } from './chapter10Levels/ch10_lv1';
import { ch10_lv2 } from './chapter10Levels/ch10_lv2';
import { ch10_lv3 } from './chapter10Levels/ch10_lv3';
import { ch10_lv4 } from './chapter10Levels/ch10_lv4';
import { ch10_lv5 } from './chapter10Levels/ch10_lv5';

export const chapter10: CampaignChapter = {
  id: 'ch10_oscar_origin',
  chapterNumber: 10,
  title: '外傳 · 奧斯卡將軍：南方迷霧',
  levels: [ch10_lv1, ch10_lv2, ch10_lv3, ch10_lv4, ch10_lv5],
};
