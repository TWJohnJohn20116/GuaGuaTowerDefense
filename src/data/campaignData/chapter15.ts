import { CampaignChapter } from '@/types/campaign';
import { ch15_lv1 } from './chapter15Levels/ch15_lv1';
import { ch15_lv2 } from './chapter15Levels/ch15_lv2';
import { ch15_lv3 } from './chapter15Levels/ch15_lv3';
import { ch15_lv4 } from './chapter15Levels/ch15_lv4';
import { ch15_lv5 } from './chapter15Levels/ch15_lv5';

export const chapter15: CampaignChapter = {
  id: 'ch15_third_world',
  chapterNumber: 15,
  title: '真正的開始 · 第三個瓜瓜大地',
  levels: [ch15_lv1, ch15_lv2, ch15_lv3, ch15_lv4, ch15_lv5],
};
