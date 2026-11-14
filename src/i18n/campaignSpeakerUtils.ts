/** 戰役簡報對話 speaker 是否為指揮官（含 legacy 中文資料） */
export function isCampaignPlayerSpeaker(speaker: string, playerLabel: string): boolean {
  if (speaker === 'player') return true;
  if (speaker === 'ai') return false;
  if (speaker === playerLabel) return true;
  return speaker.includes('指揮官') || speaker.includes('(你)') || speaker === '你';
}
