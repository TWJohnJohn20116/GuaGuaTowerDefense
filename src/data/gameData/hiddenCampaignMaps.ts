/** 第 9 章戰役專用隱藏地圖 ID */
const HIDDEN_CAMPAIGN_MAP_IDS = ['spiral', 'river', 'fortress'] as const;

type HiddenCampaignMapId = (typeof HIDDEN_CAMPAIGN_MAP_IDS)[number];

/** 隱藏地圖 ↔ 戰役關卡對應 */
const HIDDEN_MAP_CAMPAIGN_LEVEL: Record<HiddenCampaignMapId, string> = {
  spiral: 'ch9_lv3',
  river: 'ch9_lv4',
  fortress: 'ch9_lv5',
};

/** 進階模式列表說明 */
const HIDDEN_MAP_BROWSE_HINT: Record<HiddenCampaignMapId, string> = {
  spiral: '戰役 9-3「螺旋迷陣」通關後解鎖劇情體驗',
  river: '戰役 9-4「河流阻截」通關後解鎖劇情體驗',
  fortress: '戰役 9-5「要塞攻防」通關後解鎖劇情體驗',
};

export function isHiddenCampaignMap(mapId: string): mapId is HiddenCampaignMapId {
  return (HIDDEN_CAMPAIGN_MAP_IDS as readonly string[]).includes(mapId);
}

export function getHiddenMapBrowseHint(mapId: string): string | null {
  if (!isHiddenCampaignMap(mapId)) return null;
  return HIDDEN_MAP_BROWSE_HINT[mapId];
}

/** 驗證隱藏地圖是否已註冊至 PATHS */