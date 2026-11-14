import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  formatCampaignFailBest,
  formatCampaignFailChapter,
  formatCampaignFailRetryHint,
  formatCampaignFailStopped,
} from '@/data/campaignFailCopy';
import { zhTW } from '@/i18n/locales/zh-TW';

describe('campaign fail panel copy', () => {
  it('fills chapter, wave, stars and retry button label into templates', () => {
    expect(formatCampaignFailChapter('第 {n} 章', 2)).toBe('第 2 章');
    expect(formatCampaignFailStopped('止步於第 {wave} 波', 7)).toBe('止步於第 7 波');
    expect(formatCampaignFailBest('本關最佳紀錄：{stars} 星', 3)).toBe('本關最佳紀錄：3 星');
    expect(formatCampaignFailRetryHint('使用下方「{action}」直接再戰', '重試本關')).toBe(
      '使用下方「重試本關」直接再戰',
    );
  });

  it('uses Traditional Chinese templates and the same retry button label', () => {
    expect(zhTW.game?.campaignFailTitle).toBe('戰役失敗');
    expect(zhTW.game?.campaignFailChapter).toBe('第 {n} 章');
    expect(zhTW.game?.campaignFailStopped).toMatch(/\{wave\}/);
    expect(zhTW.game?.campaignFailBest).toMatch(/\{stars\}/);
    expect(zhTW.game?.campaignFailRetryHint).toMatch(/\{action\}/);
    expect(zhTW.game?.retryCampaignLevel).toBe('重試本關');
  });

  it('wires helpers and translation keys into the campaign fail panel', () => {
    const src = readFileSync(
      resolve(__dirname, '../components/scenes/campaign-end/GameOverCampaignPanel.tsx'),
      'utf8',
    );
    expect(src).toMatch(/formatCampaignFailRetryHint/);
    expect(src).toMatch(/campaignFailTitle/);
    expect(src).toMatch(/retryCampaignLevel/);
    expect(src).not.toMatch(/戰役失敗/);
    expect(src).not.toMatch(/止步於第 \{wave\}/);
  });
});
