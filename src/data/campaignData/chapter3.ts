import { CampaignChapter } from '@/types/campaign';
import { ch3_lv1 } from './chapter3Levels/ch3_lv1';
import { ch3_lv2 } from './chapter3Levels/ch3_lv2';
import { ch3_lv3 } from './chapter3Levels/ch3_lv3';
import { ch3_lv4 } from './chapter3Levels/ch3_lv4';
import { ch3_lv5 } from './chapter3Levels/ch3_lv5';

export const chapter3: CampaignChapter = {
  id: 'ch3_origin',
  chapterNumber: 3,
  title: '真相：源頭之戰',
  levels: [ch3_lv1, ch3_lv2, ch3_lv3, ch3_lv4, ch3_lv5],
};
