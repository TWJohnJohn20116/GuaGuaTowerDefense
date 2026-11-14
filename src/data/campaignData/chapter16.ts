import { CampaignChapter } from '@/types/campaign';
import { ch16_lv1 } from './chapter16Levels/ch16_lv1';
import { ch16_lv2 } from './chapter16Levels/ch16_lv2';
import { ch16_lv3 } from './chapter16Levels/ch16_lv3';
import { ch16_lv4 } from './chapter16Levels/ch16_lv4';
import { ch16_lv5 } from './chapter16Levels/ch16_lv5';

export const chapter16: CampaignChapter = {
  id: 'ch16_parallel',
  chapterNumber: 16,
  title: '平行的我 · 沒當軍人的指揮官',
  levels: [ch16_lv1, ch16_lv2, ch16_lv3, ch16_lv4, ch16_lv5],
};
