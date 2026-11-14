import { CampaignChapter } from '@/types/campaign';
import { ch8_lv1 } from './chapter8Levels/ch8_lv1';
import { ch8_lv2 } from './chapter8Levels/ch8_lv2';
import { ch8_lv3 } from './chapter8Levels/ch8_lv3';
import { ch8_lv4 } from './chapter8Levels/ch8_lv4';
import { ch8_lv5 } from './chapter8Levels/ch8_lv5';

export const chapter8: CampaignChapter = {
  id: 'ch8_exploration',
  chapterNumber: 8,
  title: '新世界：探索與和平',
  levels: [ch8_lv1, ch8_lv2, ch8_lv3, ch8_lv4, ch8_lv5],
};
