import { CampaignChapter } from '@/types/campaign';
import { ch12_lv1 } from './chapter12Levels/ch12_lv1';
import { ch12_lv2 } from './chapter12Levels/ch12_lv2';
import { ch12_lv3 } from './chapter12Levels/ch12_lv3';
import { ch12_lv4 } from './chapter12Levels/ch12_lv4';
import { ch12_lv5 } from './chapter12Levels/ch12_lv5';

export const chapter12: CampaignChapter = {
  id: 'ch12_mia_home',
  chapterNumber: 12,
  title: '外傳 · 米雅：我們的家鄉',
  levels: [ch12_lv1, ch12_lv2, ch12_lv3, ch12_lv4, ch12_lv5],
};
