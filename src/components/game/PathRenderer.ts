// 路徑渲染器 - 極簡風 (無縫拼接、完美圓角、均勻網格)
import type { Tile, GridPosition } from '@/types/game';

// 判斷格子是否為路徑類型
const isPathLike = (grid: Tile[][], row: number, col: number): boolean => {
  const t = grid[row]?.[col];
  return !!t && (t.type === 'path' || t.type === 'start' || t.type === 'end' || t.type === 'fork');
};

// === 色彩配置 ===
const getSurfaceColor = (type: string): string => {
  switch (type) {
    case 'start': return '#3a4a40';
    case 'end': return '#4a3a3a';
    case 'fork': return '#383e4a'; // 移除紫色，與一般路徑顏色一致
    default: return '#383e4a';
  }
};

// === 鄰居資訊 ===
interface Neighbors {
  top: boolean; bottom: boolean; left: boolean; right: boolean;
}
const getNeighbors = (grid: Tile[][], row: number, col: number): Neighbors => ({
  top: isPathLike(grid, row - 1, col),
  bottom: isPathLike(grid, row + 1, col),
  left: isPathLike(grid, row, col - 1),
  right: isPathLike(grid, row, col + 1),
});

/**
 * 繪製所有格子（包含空地和路徑）- 極簡風格
 */
export const drawGrid = (
  ctx: CanvasRenderingContext2D,
  grid: Tile[][],
  tileSize: number,
  offsetX: number,
  offsetY: number,
  showEnemyPath = true,
) => {
  if (tileSize <= 0) return;
  
  // 定義均勻的網格縫隙大小
  const gap = 1.5; 
  // 路徑轉角半徑
  const cornerR = Math.max(4, Math.round(tileSize * 0.25));

  // === 第一遍：繪製所有格子的底色（空地） ===
  // 我們不分開畫空地和道路，而是先把所有的格子當作「空地」畫出來
  // 這樣能保證所有的格子（無論是不是道路）都有著絕對均勻的 `gap`
  grid.forEach((row, ri) => {
    row.forEach((_tile, ci) => {
      const x = offsetX + ci * tileSize;
      const y = offsetY + ri * tileSize;
      
      // 所有格子預設都是空地顏色
      ctx.fillStyle = '#252932';
      
      // 繪製帶有均勻縫隙的方塊
      ctx.beginPath();
      ctx.roundRect(
        x + gap, 
        y + gap, 
        tileSize - gap * 2, 
        tileSize - gap * 2, 
        2 // 空地給個極小的圓角，讓它看起來不那麼死板
      );
      ctx.fill();
    });
  });

  // === 第二遍：覆蓋繪製道路 ===
  // 道路會直接畫在剛剛的空地上，並處理連通與圓角
  if (showEnemyPath) {
  grid.forEach((row, ri) => {
    row.forEach((tile, ci) => {
      if (!isPathLike(grid, ri, ci)) return;
      
      const x = offsetX + ci * tileSize;
      const y = offsetY + ri * tileSize;
      const n = getNeighbors(grid, ri, ci);
      
      ctx.fillStyle = getSurfaceColor(tile.type);
      
      // 1. 先畫出中心主體（保留與空地一樣的 gap）
      const rx = x + gap;
      const ry = y + gap;
      const rw = tileSize - gap * 2;
      const rh = tileSize - gap * 2;
      
      // 判斷四個角是否需要大圓角（如果兩側都沒有連接，就是盡頭或獨立點）
      const tlR = (!n.top && !n.left) ? cornerR : 0;
      const trR = (!n.top && !n.right) ? cornerR : 0;
      const brR = (!n.bottom && !n.right) ? cornerR : 0;
      const blR = (!n.bottom && !n.left) ? cornerR : 0;

      ctx.beginPath();
      ctx.roundRect(rx, ry, rw, rh, [tlR, trR, brR, blR]);
      ctx.fill();
      
      // 描邊消除主體與橋樑之間的細縫
      ctx.strokeStyle = getSurfaceColor(tile.type);
      ctx.lineWidth = 1;
      ctx.stroke();

      // 2. 畫連接橋樑（填補 gap），讓相鄰的道路無縫接合
      // 稍微加大一點點 (0.5) 避免浮點數誤差產生的接縫黑線
      // 向右連接
      if (n.right) {
        ctx.fillRect(x + tileSize - gap - 0.5, ry, gap * 2 + 1, rh);
      }
      // 向下連接
      if (n.bottom) {
        ctx.fillRect(rx, y + tileSize - gap - 0.5, rw, gap * 2 + 1);
      }

      // 3. 處理內轉角的「填角」
      // 當道路呈 L 型轉彎時，我們需要把內側的角補滿，並給予反向圓角
      const drawReverseCorner = (cornerX: number, cornerY: number, dirX: number, dirY: number) => {
        // 直接使用路徑畫出完美無縫的反向圓角幾何圖形
        ctx.fillStyle = getSurfaceColor(tile.type);
        ctx.beginPath();
        // 移動到轉角頂點
        ctx.moveTo(cornerX, cornerY);
        // 沿水平方向畫線
        ctx.lineTo(cornerX + dirX * cornerR, cornerY);
        // 畫一個反向的圓弧 (向內凹)
        // 使用 arc 來畫，並且方向要與一般圓角相反
        const startAngle = dirX > 0 ? (dirY > 0 ? Math.PI : Math.PI * 0.5) : (dirY > 0 ? Math.PI * 1.5 : 0);
        const endAngle = startAngle + Math.PI * 0.5 * (dirX * dirY > 0 ? -1 : 1);
        
        ctx.arc(
          cornerX + dirX * (cornerR + gap), 
          cornerY + dirY * (cornerR + gap), 
          cornerR + gap, 
          startAngle, 
          endAngle,
          dirX * dirY > 0 // 決定畫弧的方向
        );
        
        // 沿垂直方向畫線回到起點
        ctx.lineTo(cornerX, cornerY + dirY * cornerR);
        ctx.closePath();
        ctx.fill();
        
        // 為了消除接縫，我們用同樣的顏色把邊緣描一次
        ctx.strokeStyle = getSurfaceColor(tile.type);
        ctx.lineWidth = 1;
        ctx.stroke();
      };

      // 判斷對角線方向是否有道路（如果是 L 型轉角，內側的對角一定沒有道路）
      const topLeftEmpty = !isPathLike(grid, ri - 1, ci - 1);
      const topRightEmpty = !isPathLike(grid, ri - 1, ci + 1);
      const bottomLeftEmpty = !isPathLike(grid, ri + 1, ci - 1);
      const bottomRightEmpty = !isPathLike(grid, ri + 1, ci + 1);

      // 只有當該方向被兩條道路包圍，且對角線是空地時，才畫反向圓角
      // 上左內角
      if (n.top && n.left && topLeftEmpty) {
        drawReverseCorner(rx, ry, 1, 1);
      }
      // 上右內角
      if (n.top && n.right && topRightEmpty) {
        drawReverseCorner(rx + rw, ry, -1, 1);
      }
      // 下右內角
      if (n.bottom && n.right && bottomRightEmpty) {
        drawReverseCorner(rx + rw, ry + rh, -1, -1);
      }
      // 下左內角
      if (n.bottom && n.left && bottomLeftEmpty) {
        drawReverseCorner(rx, ry + rh, 1, -1);
      }
    });
  });
  }

  // === 第三遍：修補內轉角的背景 ===
  // 剛才在畫轉角時，為了不產生接縫我們用了描邊 (stroke)，
  // 這可能會讓道路顏色稍微溢出到空地上。
  // 我們重新把所有空地畫一次，確保黑邊的粗細完美一致。
  grid.forEach((row, ri) => {
    row.forEach((tile, ci) => {
      if (isPathLike(grid, ri, ci) || tile.type === 'blocked') return;
      
      const x = offsetX + ci * tileSize;
      const y = offsetY + ri * tileSize;
      
      ctx.fillStyle = '#252932';
      ctx.beginPath();
      ctx.roundRect(
        x + gap, 
        y + gap, 
        tileSize - gap * 2, 
        tileSize - gap * 2, 
        2
      );
      ctx.fill();
    });
  });

  // === 第四遍：特殊格子裝飾（起點、終點、叉路） ===
  drawSpecialMarkers(ctx, grid, tileSize, offsetX, offsetY);

  // === 第五遍：障礙格子視覺 ===
  drawBlockedTiles(ctx, grid, tileSize, offsetX, offsetY);
};

const drawBlockedTiles = (
  ctx: CanvasRenderingContext2D,
  grid: Tile[][],
  tileSize: number,
  offsetX: number,
  offsetY: number,
) => {
  const gap = 1.5;
  grid.forEach((row, ri) => {
    row.forEach((tile, ci) => {
      if (tile.type !== 'blocked') return;
      const x = offsetX + ci * tileSize;
      const y = offsetY + ri * tileSize;
      const rx = x + gap;
      const ry = y + gap;
      const rw = tileSize - gap * 2;
      const rh = tileSize - gap * 2;

      ctx.fillStyle = '#1a1218';
      ctx.beginPath();
      ctx.roundRect(rx, ry, rw, rh, 3);
      ctx.fill();

      ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(rx + 2, ry + 2, rw - 4, rh - 4);
      ctx.setLineDash([]);

      ctx.strokeStyle = 'rgba(248, 113, 113, 0.55)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(rx + rw * 0.28, ry + rh * 0.72);
      ctx.lineTo(rx + rw * 0.5, ry + rh * 0.38);
      ctx.lineTo(rx + rw * 0.72, ry + rh * 0.72);
      ctx.stroke();
    });
  });
};

/**
 * 繪製起點、終點、叉路特殊標記
 */
const drawSpecialMarkers = (
  ctx: CanvasRenderingContext2D,
  grid: Tile[][],
  tileSize: number,
  offsetX: number,
  offsetY: number,
) => {
  grid.forEach((row, ri) => {
    row.forEach((tile, ci) => {
      const x = offsetX + ci * tileSize;
      const y = offsetY + ri * tileSize;
      const cx = x + tileSize / 2;
      const cy = y + tileSize / 2;

      if (tile.type === 'start') {
        const r = tileSize * 0.22;
        ctx.save();
        // 柔和的綠色圓形標記（有內部光暈）
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r + 4);
        grad.addColorStop(0, 'rgba(34, 197, 94, 0.55)');
        grad.addColorStop(1, 'rgba(34, 197, 94, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        // 中心箭頭（代表起點、出發）
        const s = r * 0.7;
        ctx.strokeStyle = 'rgba(240, 253, 244, 0.9)';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(cx - s * 0.4, cy + s * 0.4);
        ctx.lineTo(cx, cy - s * 0.5);
        ctx.lineTo(cx + s * 0.4, cy + s * 0.4);
        ctx.stroke();
        ctx.restore();
      }

      if (tile.type === 'end') {
        const r = tileSize * 0.22;
        ctx.save();
        // 柔和的紅色終點圈
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r + 4);
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.55)');
        grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(248, 113, 113, 0.9)';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        // 中心細緻的 X 標記
        const s = r * 0.45;
        ctx.strokeStyle = 'rgba(254, 242, 242, 0.95)';
        ctx.lineWidth = 1.8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx - s, cy - s);
        ctx.lineTo(cx + s, cy + s);
        ctx.moveTo(cx + s, cy - s);
        ctx.lineTo(cx - s, cy + s);
        ctx.stroke();
        ctx.restore();
      }

      if (tile.type === 'fork') {
        const r = tileSize * 0.2;
        ctx.save();
        
        // 幾何科技風分叉圖標
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.lineJoin = 'miter';

        // 取得該格子的鄰居路徑狀態
        const n = getNeighbors(grid, ri, ci);
        
        // 計算旋轉角度
        // 預設是向上分岔 (左、右、下有路徑，或上方無路徑)
        let rotation = 0;
        
        if (n.top && n.bottom && n.left) {
          // 向右分岔
          rotation = Math.PI / 2;
        } else if (n.left && n.right && n.bottom) {
          // 向下分岔
          rotation = Math.PI;
        } else if (n.top && n.bottom && n.right) {
          // 向左分岔
          rotation = -Math.PI / 2;
        } else if (n.top && n.left && n.right) {
           // 向上分岔
           rotation = 0;
        } else if (n.bottom) {
           // 只有下面有路，向上分岔 (預設)
           rotation = 0;
        } else if (n.left) {
           // 只有左邊有路，向右分岔
           rotation = Math.PI / 2;
        } else if (n.top) {
           // 只有上面有路，向下分岔
           rotation = Math.PI;
        } else if (n.right) {
           // 只有右邊有路，向左分岔
           rotation = -Math.PI / 2;
        }

        // 應用旋轉
        ctx.translate(cx, cy);
        ctx.rotate(rotation);
        ctx.translate(-cx, -cy);
        
        // 繪製中心菱形
        ctx.beginPath();
        ctx.moveTo(cx, cy - r * 0.5); // 上
        ctx.lineTo(cx + r * 0.5, cy); // 右
        ctx.lineTo(cx, cy + r * 0.5); // 下
        ctx.lineTo(cx - r * 0.5, cy); // 左
        ctx.closePath();
        ctx.stroke();

        // 繪製向外的科技感放射線
        ctx.beginPath();
        // 左上放射線
        ctx.moveTo(cx - r * 0.5, cy - r * 0.5);
        ctx.lineTo(cx - r * 0.8, cy - r * 0.8);
        // 右上放射線
        ctx.moveTo(cx + r * 0.5, cy - r * 0.5);
        ctx.lineTo(cx + r * 0.8, cy - r * 0.8);
        // 底部放射線
        ctx.moveTo(cx, cy + r * 0.5);
        ctx.lineTo(cx, cy + r * 0.9);
        ctx.stroke();

        // 中心核心點
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    });
  });
};

/**
 * 繪製路徑格子的懸停效果
 */
export const drawTileHover = (
  ctx: CanvasRenderingContext2D,
  grid: Tile[][],
  hoveredTile: { row: number; col: number } | null,
  selectedTowerType: string | null,
  /** 是否負擔得起目前選取的塔（靜態層只在跨越門檻時才需要重繪，不必傳金額） */
  canAffordSelected: boolean,
  tileSize: number,
  offsetX: number,
  offsetY: number,
) => {
  if (!hoveredTile) return;
  const tile = grid[hoveredTile.row]?.[hoveredTile.col];
  if (!tile) return;

  const x = offsetX + hoveredTile.col * tileSize;
  const y = offsetY + hoveredTile.row * tileSize;

  if (tile.type === 'blocked') {
    ctx.fillStyle = 'rgba(239, 68, 68, 0.28)';
    ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
    ctx.strokeStyle = 'rgba(248, 113, 113, 0.85)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(x + 3, y + 3, tileSize - 6, tileSize - 6);
    ctx.setLineDash([]);
    ctx.font = 'bold 9px sans-serif';
    ctx.fillStyle = 'rgba(254, 226, 226, 0.95)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('不可建造', x + tileSize / 2, y + tileSize / 2);
    return;
  }

  if (tile.type !== 'empty' || tile.towerId) return;

  const canPlace = Boolean(selectedTowerType) && canAffordSelected;
  ctx.fillStyle = canPlace ? 'rgba(91, 155, 213, 0.3)' : 'rgba(224, 108, 117, 0.3)';
  ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
};

/**
 * 繪製動態路徑流動效果 (能量粒子或箭頭沿著路徑移動)
 */
export const drawPathFlow = (
  ctx: CanvasRenderingContext2D,
  waypoints: GridPosition[],
  tileSize: number,
  offsetX: number,
  offsetY: number,
  time: number
) => {
  if (!waypoints || waypoints.length < 2) return;

  ctx.save();
  // 使用 source-atop 或 lighter 來讓特效疊加在路徑上
  ctx.globalCompositeOperation = 'lighter';
  
  const pathLength = waypoints.length;
  // 決定流動的粒子數量，根據路徑長度
  const particleCount = Math.floor(pathLength * 1.5);
  const speed = 0.0015; // 移動速度
  
  // 計算總進度 0~1 之間循環
  const progressOffset = (time * speed) % 1;

  for (let i = 0; i < particleCount; i++) {
    // 每個粒子在路徑上的相對進度 (0~1)
    let p = (i / particleCount + progressOffset) % 1;
    
    // 將 0~1 的進度映射到 waypoints 陣列的索引上
    // 注意：waypoints 有 N 個點，所以有 N-1 段線段
    const exactIndex = p * (pathLength - 1);
    const index = Math.floor(exactIndex);
    const nextIndex = Math.min(index + 1, pathLength - 1);
    const segmentProgress = exactIndex - index;
    
    const p1 = waypoints[index];
    const p2 = waypoints[nextIndex];
    
    if (!p1 || !p2) continue;
    
    // 計算當前粒子的精確座標
    const x = offsetX + (p1.col + (p2.col - p1.col) * segmentProgress) * tileSize + tileSize / 2;
    const y = offsetY + (p1.row + (p2.row - p1.row) * segmentProgress) * tileSize + tileSize / 2;
    
    // 繪製發光粒子
    const radius = tileSize * 0.08;
    
    // 粒子的透明度可以根據位置做點變化（例如起點和終點淡出）
    const alpha = Math.sin(p * Math.PI) * 0.6; // 頭尾透明，中間明顯
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(130, 255, 180, ${alpha})`;
    ctx.fill();
    
    // 加上較大的微弱光暈
    ctx.beginPath();
    ctx.arc(x, y, radius * 2.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(130, 255, 180, ${alpha * 0.3})`;
    ctx.fill();
  }
  
  ctx.restore();
};

