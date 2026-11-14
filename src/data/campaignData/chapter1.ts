import { CampaignChapter } from '@/types/campaign';
import { ch1_tutorial } from './chapter1Levels/ch1_tutorial';
import { ch1_lv1 } from './chapter1Levels/ch1_lv1';
import { ch1_lv2 } from './chapter1Levels/ch1_lv2';
import { ch1_lv3 } from './chapter1Levels/ch1_lv3';

export const chapter1: CampaignChapter = {
  id: 'ch1_awakening',
  chapterNumber: 1,
  title: '覺醒：未知的威脅',
  levels: [ch1_tutorial, ch1_lv1, ch1_lv2, ch1_lv3],
};
