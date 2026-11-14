import { CampaignChapter } from '@/types/campaign';
import { ch6_lv1 } from './chapter6Levels/ch6_lv1';
import { ch6_lv2 } from './chapter6Levels/ch6_lv2';
import { ch6_lv3 } from './chapter6Levels/ch6_lv3';
import { ch6_lv4 } from './chapter6Levels/ch6_lv4';
import { ch6_lv5 } from './chapter6Levels/ch6_lv5';

export const chapter6: CampaignChapter = {
  id: 'ch6_rift',
  chapterNumber: 6,
  title: '裂縫：永久和平之後',
  levels: [ch6_lv1, ch6_lv2, ch6_lv3, ch6_lv4, ch6_lv5],
};
