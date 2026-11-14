import { CampaignChapter } from '@/types/campaign';
import { ch9_lv1 } from './chapter9Levels/ch9_lv1';
import { ch9_lv2 } from './chapter9Levels/ch9_lv2';
import { ch9_lv3 } from './chapter9Levels/ch9_lv3';
import { ch9_lv4 } from './chapter9Levels/ch9_lv4';
import { ch9_lv5 } from './chapter9Levels/ch9_lv5';

export const chapter9: CampaignChapter = {
  id: 'ch9_alice_origin',
  chapterNumber: 9,
  title: '外傳 · 艾莉絲：從 0 到 1',
  levels: [ch9_lv1, ch9_lv2, ch9_lv3, ch9_lv4, ch9_lv5],
};
