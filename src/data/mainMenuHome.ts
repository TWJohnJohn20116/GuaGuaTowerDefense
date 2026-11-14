export const HOME_RAIL_CLASS = 'w-full lg:w-[320px] shrink-0 flex flex-col justify-between gap-8';
export const HOME_GRID_CLASS = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2';

/** 右欄等寬入口，不含左欄的選圖主行動 */
export const HOME_ENTRY_SCENES = [
  'dailyChallenge',
  'mutatorChallenge',
  'shop',
  'talentTree',
  'encyclopedia',
  'skins',
  'achievements',
  'statistics',
  'workshop',
  'replay',
  'memorial',
  'tutorial',
  'changelog',
  'settings',
] as const;

export type HomeEntryScene = (typeof HOME_ENTRY_SCENES)[number];
