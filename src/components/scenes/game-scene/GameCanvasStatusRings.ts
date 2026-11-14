import type { Enemy } from '@/types/game';

/**
 * 敵人狀態效果環
 *
 * 效能背景：壓測（7,587 隻敵人）時，這一段是 canvas 呼叫量最大的來源之一。
 * 舊寫法是「每隻敵人 × 每個狀態」各自 `save()` → `arc()` → `stroke()` → `restore()`：
 * 中毒 + 減速同時存在時，一幀就是數萬次 stroke，每次都要重建路徑與描邊狀態。
 *
 * 現在改成「先收集、後一次畫」：
 * - 依 (顏色, 線寬, 透明度, 虛線) 分組，同一組的圓弧全部塞進同一條 path，
 *   最後只 stroke 一次 → 數萬次 stroke 變成個位數。
 * - 收集階段用一次 Set 掃描取代 13 次 `effects.find()`。
 *
 * 視覺上唯一的差別：環改成在「所有敵人本體畫完之後」統一描繪，
 * 因此重疊時環會壓在敵人身軀之上（環很細且半透明，密集場景幾乎看不出來）。
 */

interface RingGroup {
  color: string;
  width: number;
  /** 1 = 不透明度不動 */
  alpha: number;
  dash: number[] | null;
  /** 扁平儲存 [x, y, r, x, y, r, ...]，避免每個環一個物件 */
  circles: number[];
}

interface StatusRingBatch {
  /** 把這隻敵人的狀態環加入批次（不立即繪製） */
  add: (enemy: Enemy, x: number, y: number, radius: number, now: number) => void;
  /** 一次畫完所有分組（會清空批次） */
  flush: (ctx: CanvasRenderingContext2D) => void;
  /** 目前累積的環數量（測試 / 除錯用） */
  readonly ringCount: number;
}

interface RingSpec {
  type: string;
  offset: number;
  color: string;
  dash?: number[];
}

/** 固定半徑差與顏色表；新增狀態只要往這裡加一列 */
const RING_SPECS: RingSpec[] = [
  { type: 'slow', offset: 3, color: '#64c8ff' },
  { type: 'frostbite', offset: 4, color: '#bae6fd', dash: [2, 2] },
  { type: 'freeze', offset: 5, color: '#e0f2fe' },
  { type: 'poison', offset: 6, color: '#96ff32' },
  { type: 'burn', offset: 8, color: '#fb923c' },
  { type: 'bleed', offset: 7, color: '#dc2626' },
  { type: 'root', offset: 4, color: '#d97706', dash: [2, 3] },
  { type: 'stun', offset: 5, color: '#facc15' },
  { type: 'silence', offset: 8, color: '#94a3b8', dash: [4, 3] },
  { type: 'fear', offset: 10, color: '#67e8f9', dash: [3, 4] },
  { type: 'marked', offset: 9, color: '#ef4444', dash: [3, 3] },
  { type: 'exposed', offset: 11, color: '#f472b6' },
  { type: 'weakness', offset: 13, color: '#a855f7' },
];

const DISPLACED_RING = { color: 'rgba(168, 216, 234, 0.6)', width: 1, dash: [4, 4] as number[] };

export const createStatusRingBatch = (): StatusRingBatch => {
  const groups = new Map<string, RingGroup>();
  let ringCount = 0;

  const groupFor = (color: string, width: number, alpha: number, dash: number[] | null): RingGroup => {
    const key = `${color}|${width}|${alpha.toFixed(2)}|${dash ? dash.join(',') : ''}`;
    let group = groups.get(key);
    if (!group) {
      group = { color, width, alpha, dash, circles: [] };
      groups.set(key, group);
    }
    return group;
  };

  const pushRing = (group: RingGroup, x: number, y: number, radius: number) => {
    group.circles.push(x, y, radius);
    ringCount += 1;
  };

  return {
    add(enemy, x, y, radius, now) {
      const effects = enemy.effects;
      const displaced = Boolean(enemy.isDisplaced);
      if (effects.length === 0 && !displaced) return;

      if (displaced) {
        pushRing(
          groupFor(DISPLACED_RING.color, DISPLACED_RING.width, 1, DISPLACED_RING.dash),
          x, y, radius + 5,
        );
      }

      if (effects.length === 0) return;

      // 一次掃描收集「有哪些狀態」，取代 13 次 effects.find()
      const present = new Set<string>();
      for (let i = 0; i < effects.length; i++) present.add(effects[i].type);

      for (const spec of RING_SPECS) {
        if (!present.has(spec.type)) continue;
        pushRing(groupFor(spec.color, 2, 1, spec.dash ?? null), x, y, radius + spec.offset);
      }

      if (present.has('berserk')) {
        // 狂暴是雙環 + 脈動透明度；同一幀所有狂暴敵人 pulse 相同 → 仍能整組批次
        const pulse = 0.5 + 0.5 * Math.sin(now * 0.012);
        pushRing(groupFor('#ff3232', 2, 0.5 + pulse * 0.4, null), x, y, radius + 4 + pulse * 2);
        pushRing(groupFor('#ff3232', 2, 0.25 + pulse * 0.2, null), x, y, radius + 8 + pulse * 3);
      }
    },

    flush(ctx) {
      for (const group of groups.values()) {
        if (group.circles.length === 0) continue;

        if (group.alpha !== 1) ctx.globalAlpha = group.alpha;
        if (group.dash) ctx.setLineDash(group.dash);
        ctx.strokeStyle = group.color;
        ctx.lineWidth = group.width;

        ctx.beginPath();
        const c = group.circles;
        for (let i = 0; i < c.length; i += 3) {
          ctx.arc(c[i], c[i + 1], c[i + 2], 0, Math.PI * 2);
        }
        ctx.stroke();

        if (group.dash) ctx.setLineDash([]);
        if (group.alpha !== 1) ctx.globalAlpha = 1;
      }

      groups.clear();
      ringCount = 0;
    },

    get ringCount() {
      return ringCount;
    },
  };
};
