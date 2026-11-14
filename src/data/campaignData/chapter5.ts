import { CampaignChapter } from '@/types/campaign';
import { ch5_lv1 } from './chapter5Levels/ch5_lv1';
import { ch5_lv2 } from './chapter5Levels/ch5_lv2';
import { ch5_lv3 } from './chapter5Levels/ch5_lv3';
import { ch5_lv4 } from './chapter5Levels/ch5_lv4';

export const chapter5: CampaignChapter = {
  id: 'ch5_reboot',
  chapterNumber: 5,
  title: '重啟：三個月後',
  levels: [ch5_lv1, ch5_lv2, ch5_lv3, ch5_lv4],
};
