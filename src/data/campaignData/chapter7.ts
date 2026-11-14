import { CampaignChapter } from '@/types/campaign';
import { ch7_lv1 } from './chapter7Levels/ch7_lv1';
import { ch7_lv2 } from './chapter7Levels/ch7_lv2';
import { ch7_lv3 } from './chapter7Levels/ch7_lv3';
import { ch7_lv4 } from './chapter7Levels/ch7_lv4';
import { ch7_lv5 } from './chapter7Levels/ch7_lv5';

export const chapter7: CampaignChapter = {
  id: 'ch7_unification',
  chapterNumber: 7,
  title: '合一：兩個世界之後',
  levels: [ch7_lv1, ch7_lv2, ch7_lv3, ch7_lv4, ch7_lv5],
};
