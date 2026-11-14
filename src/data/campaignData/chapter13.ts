import { CampaignChapter } from '@/types/campaign';
import { ch13_lv1 } from './chapter13Levels/ch13_lv1';
import { ch13_lv2 } from './chapter13Levels/ch13_lv2';
import { ch13_lv3 } from './chapter13Levels/ch13_lv3';
import { ch13_lv4 } from './chapter13Levels/ch13_lv4';
import { ch13_lv5 } from './chapter13Levels/ch13_lv5';

export const chapter13: CampaignChapter = {
  id: 'ch13_next_gen',
  chapterNumber: 13,
  title: '下一代 · 二十年後',
  levels: [ch13_lv1, ch13_lv2, ch13_lv3, ch13_lv4, ch13_lv5],
};
