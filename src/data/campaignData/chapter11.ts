import { CampaignChapter } from '@/types/campaign';
import { ch11_lv1 } from './chapter11Levels/ch11_lv1';
import { ch11_lv2 } from './chapter11Levels/ch11_lv2';
import { ch11_lv3 } from './chapter11Levels/ch11_lv3';
import { ch11_lv4 } from './chapter11Levels/ch11_lv4';
import { ch11_lv5 } from './chapter11Levels/ch11_lv5';

export const chapter11: CampaignChapter = {
  id: 'ch11_mirror_origin',
  chapterNumber: 11,
  title: '外傳 · 鏡像指揮官：失敗的歲月',
  levels: [ch11_lv1, ch11_lv2, ch11_lv3, ch11_lv4, ch11_lv5],
};
