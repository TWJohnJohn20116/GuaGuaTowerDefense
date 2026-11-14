function fillToken(template: string, token: string, value: string | number): string {
  return template.split(`{${token}}`).join(String(value));
}

export function formatCampaignFailChapter(template: string, chapterNumber: number): string {
  return fillToken(template, 'n', chapterNumber);
}

export function formatCampaignFailStopped(template: string, wave: number): string {
  return fillToken(template, 'wave', wave);
}

export function formatCampaignFailBest(template: string, stars: number): string {
  return fillToken(template, 'stars', stars);
}

export function formatCampaignFailRetryHint(template: string, actionLabel: string): string {
  return fillToken(template, 'action', actionLabel);
}
