import { CampaignChapter } from '@/types/campaign';
import { ch17_lv1 } from './chapter17Levels/ch17_lv1';
import { ch17_lv2 } from './chapter17Levels/ch17_lv2';
import { ch17_lv3 } from './chapter17Levels/ch17_lv3';
import { ch17_lv4 } from './chapter17Levels/ch17_lv4';
import { ch17_lv5 } from './chapter17Levels/ch17_lv5';

export const chapter17: CampaignChapter = {
  id: 'ch17_final',
  chapterNumber: 17,
  title: '真正的結束 · 最後的夕陽',
  levels: [ch17_lv1, ch17_lv2, ch17_lv3, ch17_lv4, ch17_lv5],
};
