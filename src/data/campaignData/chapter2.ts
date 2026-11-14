import { CampaignChapter } from '@/types/campaign';
import { ch2_lv1 } from './chapter2Levels/ch2_lv1';
import { ch2_lv2 } from './chapter2Levels/ch2_lv2';
import { ch2_lv3 } from './chapter2Levels/ch2_lv3';
import { ch2_lv4 } from './chapter2Levels/ch2_lv4';

export const chapter2: CampaignChapter = {
  id: 'ch2_contamination',
  chapterNumber: 2,
  title: '污染：擴散的陰影',
  levels: [ch2_lv1, ch2_lv2, ch2_lv3, ch2_lv4],
};
