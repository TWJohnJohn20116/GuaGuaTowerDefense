import { CampaignChapter } from '@/types/campaign';
import { ch4_lv1 } from './chapter4Levels/ch4_lv1';
import { ch4_lv2 } from './chapter4Levels/ch4_lv2';
import { ch4_lv3 } from './chapter4Levels/ch4_lv3';
import { ch4_lv4 } from './chapter4Levels/ch4_lv4';
import { ch4_lv5 } from './chapter4Levels/ch4_lv5';

export const chapter4: CampaignChapter = {
  id: 'ch4_creator',
  chapterNumber: 4,
  title: '創造者：永恆之戰',
  levels: [ch4_lv1, ch4_lv2, ch4_lv3, ch4_lv4, ch4_lv5],
};
