import type { TowerDrawParams } from '../TowerModels';
import { sticker } from './nordicShared';

/** 藍色基礎塔：Lv1 單管 → Lv2 卡箍瞄具 → Lv3 雙管 → Lv4 側甲 → Lv5 核心護罩。 */
export const drawBasicTowerNordic = (p: TowerDrawParams): void => {
  if (!sticker.begin(p)) return;
  const { ctx, color, highlight } = p;
  const lv = sticker.level(p);
  sticker.rect(ctx, -28, -23, 47, 46, sticker.tint(color), 12);
  if (lv >= 2) sticker.rect(ctx, -32, -18, 9, 36, '#fff8ef', 4);

  const count = lv >= 3 ? 2 : 1;
  for (let i = 0; i < count; i += 1) {
    const y = count === 1 ? -6 : -11 + i * 14;
    const height = count === 1 ? 12 : 8;
    sticker.rect(ctx, -1, y, 61, height, color, 3);
    sticker.rect(ctx, 51, y - 3, 13, height + 6, '#fff8ef', 4);
  }
  if (lv >= 4) {
    sticker.rect(ctx, -13, -31, 31, 10, '#ffffff', 4);
    sticker.rect(ctx, -13, 21, 31, 10, '#ffffff', 4);
  }
  if (lv >= 5) {
    sticker.rect(ctx, 10, -18, 35, 5, highlight, 2);
    sticker.rect(ctx, 10, 13, 35, 5, highlight, 2);
    sticker.hex(ctx, -7, 0, 18, '#ffffff');
    sticker.circle(ctx, -7, 0, 6, color);
  } else {
    sticker.hub(ctx);
  }
  if (lv >= 2) sticker.rect(ctx, 1, -21, 22, 6, highlight, 3);
  if (sticker.detail(p)) {
    for (let i = 0; i < 3; i += 1) sticker.line(ctx, -22, -9 + i * 6, -15, -9 + i * 6, undefined, 2);
    if (lv >= 4) {
      sticker.line(ctx, -6, -27, 8, -27, undefined, 2);
      sticker.line(ctx, -6, 27, 8, 27, undefined, 2);
    }
  }
  ctx.restore();
};
