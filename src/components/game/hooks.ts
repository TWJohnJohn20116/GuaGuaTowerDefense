import { useCallback } from 'react';
import { useModStore } from '@/store/modStore';
import { getTowerData } from '@/store/gameStoreUtils';
import type { TowerType, TowerData } from '@/types/game';

/**
 * 取得塔資料的 hook（含 mod 支援）
 *
 * 這裡原本自己重寫了一份「基礎塔 + mod 塔」的查找與欄位映射，
 * 但那份映射只抄了 20 幾個欄位，漏掉 flameEffect / laserEffect / instantHit /
 * moneyGeneration / windEffect 等旗標——也就是說透過這個 hook 拿到的 mod 塔
 * 會少掉特效資訊（漂浮面板、多選面板、暫停排行、畫布預覽都受影響）。
 *
 * 現在直接委派給 store 層唯一的 getTowerData（含 mods 引用變更即失效的快取），
 * hook 只負責「mods 變了就換一個新函式」這件事。
 */
export const useGetTowerData = () => {
  const mods = useModStore((s) => s.mods);

  return useCallback(
    (towerType: TowerType | string): TowerData | null => {
      // mods 只作為失效鍵：mod 清單換了，這個 callback 就重建
      void mods;
      return getTowerData(towerType);
    },
    [mods],
  );
};
