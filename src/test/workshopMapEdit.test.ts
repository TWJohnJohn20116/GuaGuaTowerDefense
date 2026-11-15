/**
 * 工坊地圖編輯模型的行為測試（editModel 純函式）
 *
 * 只碰「資料 → 資料」這一層：不 import store、不對 editModel 做任何 mock，
 * 每一條都真的呼叫函式，再斷言回傳的 draft / changed / issue。
 * 基準草稿一律用 createEmptyDraft() / createStarterDraft()，不手抄整份 MapDraft。
 */

import { describe, it, expect } from 'vitest';
import {
  addPreviewTower,
  addWaypoint,
  blockedPathConflicts,
  canPlacePreviewTower,
  createEmptyDraft,
  createStarterDraft,
  expandPathCells,
  findPathBreaks,
  moveWaypoint,
  paintBlocked,
  removeWaypoint,
  toTileGrid,
  toggleBlocked,
  validateDraft,
  type GridPoint,
  type MapDraft,
} from '@/workshop/map/editModel';

/** 斷言訊息用的座標標籤：失敗時直接看得出是哪一格 */
const at = (p: GridPoint): string => '(' + p.col + ',' + p.row + ')';

/** 把座標序列攤成字串序列，方便直接比對先後順序 */
const seq = (points: GridPoint[]): string[] => points.map((p) => p.col + ',' + p.row);

const midRowOf = (draft: MapDraft): number => Math.floor(draft.rows / 2);
const midColOf = (draft: MapDraft): number => Math.floor(draft.cols / 2);

describe('草稿骨架（createEmptyDraft / createStarterDraft）', () => {
  it('空草稿是空白容器，骨架草稿的起點貼左緣、終點貼右緣且同一列', () => {
    const empty = createEmptyDraft();
    expect(empty.cols).toBeGreaterThanOrEqual(2);
    expect(empty.rows).toBeGreaterThanOrEqual(2);
    expect(empty.waypoints).toHaveLength(0);
    expect(empty.blocked).toHaveLength(0);
    expect(empty.towers).toHaveLength(0);

    const starter = createStarterDraft();
    expect(starter.cols).toBe(empty.cols);
    expect(starter.rows).toBe(empty.rows);
    expect(starter.waypoints).toHaveLength(3);

    const first = starter.waypoints[0];
    const last = starter.waypoints[starter.waypoints.length - 1];
    expect(first.col, '起點應貼左緣，實際 ' + at(first)).toBe(0);
    expect(last.col, '終點應貼右緣，實際 ' + at(last)).toBe(starter.cols - 1);
    expect(first.row, '骨架是同一列的水平路徑').toBe(last.row);

    for (const p of starter.waypoints) {
      expect(p.col, at(p) + ' 的 col 應在 0..' + (starter.cols - 1)).toBeGreaterThanOrEqual(0);
      expect(p.col, at(p) + ' 的 col 應在 0..' + (starter.cols - 1)).toBeLessThan(starter.cols);
      expect(p.row, at(p) + ' 的 row 應在 0..' + (starter.rows - 1)).toBeGreaterThanOrEqual(0);
      expect(p.row, at(p) + ' 的 row 應在 0..' + (starter.rows - 1)).toBeLessThan(starter.rows);
    }

    const cells = expandPathCells(starter.waypoints);
    expect(cells.length, '骨架草稿展開後應覆蓋整條水平路徑').toBe(starter.cols);
    expect(findPathBreaks(cells), '骨架草稿的路徑不該有任何斷點').toEqual([]);
  });
});

describe('addWaypoint', () => {
  it('同一格加第二次被拒絕：changed 為 false 且回 duplicateWaypoint', () => {
    const draft = createStarterDraft();
    const existing = draft.waypoints[1];
    const res = addWaypoint(draft, { col: existing.col, row: existing.row });

    expect(res.changed, '重複加 ' + at(existing) + ' 不該改動草稿').toBe(false);
    expect(res.issue?.code, '重複點應回 duplicateWaypoint').toBe('duplicateWaypoint');
    expect(res.issue?.at, 'issue 應帶回被拒的座標').toEqual({ col: existing.col, row: existing.row });
    expect(res.draft.waypoints, '被拒時草稿必須原封不動').toHaveLength(3);
  });

  it('四個方向的出界座標都被拒絕且不改草稿', () => {
    const draft = createStarterDraft();
    const outside: GridPoint[] = [
      { col: -1, row: 0 },
      { col: draft.cols, row: 0 },
      { col: 0, row: -1 },
      { col: 0, row: draft.rows },
    ];

    for (const p of outside) {
      const res = addWaypoint(draft, p);
      expect(res.changed, '出界點 ' + at(p) + ' 不該改動草稿').toBe(false);
      expect(res.issue?.code, '出界點 ' + at(p) + ' 應回 outOfBounds').toBe('outOfBounds');
      expect(res.issue?.at, 'issue 應帶回出界座標 ' + at(p)).toEqual({ col: p.col, row: p.row });
      expect(res.draft.waypoints, '出界被拒後點數不變').toHaveLength(3);
    }
  });

  it('指定 insertIndex 時新點插在該索引之前（序列可逐格比對）', () => {
    const empty = createEmptyDraft();

    const first = addWaypoint(empty, { col: 5, row: 5 });
    expect(first.changed).toBe(true);
    expect(seq(first.draft.waypoints)).toEqual(['5,5']);

    const prepend = addWaypoint(first.draft, { col: 1, row: 1 }, 0);
    expect(prepend.changed, 'index 0 應插在序列最前面').toBe(true);
    expect(prepend.issue).toBeUndefined();
    expect(seq(prepend.draft.waypoints), '插入後序列應為 1,1 → 5,5').toEqual(['1,1', '5,5']);

    const splice = addWaypoint(prepend.draft, { col: 3, row: 3 }, 1);
    expect(splice.changed, 'index 1 應插在 1,1 與 5,5 之間').toBe(true);
    expect(seq(splice.draft.waypoints), '插入後序列應為 1,1 → 3,3 → 5,5').toEqual(['1,1', '3,3', '5,5']);

    const clamped = addWaypoint(splice.draft, { col: 7, row: 7 }, 99);
    expect(clamped.changed, '超出的 index 應被夾到尾端而不是被拒').toBe(true);
    expect(seq(clamped.draft.waypoints), '夾到尾端後 7,7 應在最後').toEqual(['1,1', '3,3', '5,5', '7,7']);
  });
});

describe('removeWaypoint', () => {
  it('3 點刪成 2 點成功，剩 2 點再刪被拒且回 tooFewWaypoints', () => {
    const draft = createStarterDraft();
    const expectedAfterFirst = [draft.waypoints[0], draft.waypoints[2]];

    const first = removeWaypoint(draft, 1);
    expect(first.changed).toBe(true);
    expect(first.issue).toBeUndefined();
    expect(first.draft.waypoints, '刪掉中間點後應剩 2 點').toHaveLength(2);
    expect(seq(first.draft.waypoints), '剩下的應是原本的第 0 與第 2 點').toEqual(seq(expectedAfterFirst));

    const second = removeWaypoint(first.draft, 0);
    expect(second.changed, '只剩 2 點時不該再刪').toBe(false);
    expect(second.issue?.code).toBe('tooFewWaypoints');
    expect(second.issue?.index, 'issue 應帶回被拒的索引 0').toBe(0);
    expect(second.draft.waypoints, '被拒時仍是 2 點').toHaveLength(2);
    expect(seq(second.draft.waypoints)).toEqual(seq(expectedAfterFirst));
  });
});

describe('moveWaypoint', () => {
  it('四種合法移動（含跨多格與斜向）之後，展開路徑仍四鄰相接', () => {
    const base = createStarterDraft();
    const mr = midRowOf(base);
    const mc = midColOf(base);
    const cases: { index: number; to: GridPoint }[] = [
      { index: 1, to: { col: mc, row: mr + 1 } },
      { index: 0, to: { col: 0, row: mr + 3 } },
      { index: 2, to: { col: base.cols - 2, row: mr + 2 } },
      { index: 1, to: { col: mc + 2, row: mr + 2 } },
    ];

    for (const item of cases) {
      const res = moveWaypoint(base, item.index, item.to);
      expect(res.changed, 'index ' + item.index + ' 移到 ' + at(item.to) + ' 應被接受').toBe(true);
      expect(res.issue, 'index ' + item.index + ' 的合法移動不該帶 issue').toBeUndefined();
      expect(seq(res.draft.waypoints)[item.index], 'index ' + item.index + ' 的座標應等於落點').toBe(
        item.to.col + ',' + item.to.row,
      );

      const cells = expandPathCells(res.draft.waypoints);
      expect(cells.length, 'index ' + item.index + ' 移動後路徑不該變空').toBeGreaterThan(base.cols);
      const breaks = findPathBreaks(cells);
      expect(breaks, 'index ' + item.index + ' 移到 ' + at(item.to) + ' 後斷在格索引 ' + breaks.join(',')).toEqual([]);
    }
  });

  it('移到別的點身上回 duplicateWaypoint，出界回 outOfBounds，兩者都保留原圖', () => {
    const draft = createStarterDraft();
    const original = seq(draft.waypoints);

    const onto = moveWaypoint(draft, 0, draft.waypoints[1]);
    expect(onto.changed, '移到既有路徑點身上不該成功').toBe(false);
    expect(onto.issue?.code).toBe('duplicateWaypoint');
    expect(onto.issue?.index, 'issue 應帶回被拖曳的索引 0').toBe(0);
    expect(seq(onto.draft.waypoints), '被拒後序列不變').toEqual(original);

    const oob = moveWaypoint(draft, 0, { col: -1, row: 0 });
    expect(oob.changed, '移到出界座標不該成功').toBe(false);
    expect(oob.issue?.code).toBe('outOfBounds');
    expect(oob.issue?.at).toEqual({ col: -1, row: 0 });
    expect(seq(oob.draft.waypoints), '被拒後序列不變').toEqual(original);

    const same = moveWaypoint(draft, 0, draft.waypoints[0]);
    expect(same.changed, '原地放回不該產生改動').toBe(false);
    expect(same.issue, '原地放回不算錯誤，不該帶 issue').toBeUndefined();
  });
});

describe('障礙格 toggleBlocked / paintBlocked / blockedPathConflicts', () => {
  it('toggleBlocked 先加後刪，第二次呼叫是移除', () => {
    const empty = createEmptyDraft();
    const point: GridPoint = { col: 2, row: 2 };

    const added = toggleBlocked(empty, point);
    expect(added.changed).toBe(true);
    expect(added.draft.blocked, '加一格後長度應為 1').toHaveLength(1);
    expect(seq(added.draft.blocked), '被加進去的就是 ' + at(point)).toEqual(['2,2']);

    const removed = toggleBlocked(added.draft, point);
    expect(removed.changed).toBe(true);
    expect(removed.draft.blocked, '再切一次同一格應被移除').toHaveLength(0);
  });

  it('paintBlocked 批次塗抹對同一格去重，重複塗抹回 changed=false，再用 blocked=false 擦掉', () => {
    const empty = createEmptyDraft();
    const stroke: GridPoint[] = [
      { col: 4, row: 4 },
      { col: 5, row: 4 },
      { col: 4, row: 4 },
    ];

    const painted = paintBlocked(empty, stroke, true);
    expect(painted.changed).toBe(true);
    expect(painted.draft.blocked, '同一格塗兩次只算一格，共 2 格').toHaveLength(2);
    expect(seq(painted.draft.blocked).sort()).toEqual(['4,4', '5,4']);

    const again = paintBlocked(painted.draft, stroke, true);
    expect(again.changed, '已塗過的格再塗不該回報 changed').toBe(false);
    expect(again.draft.blocked, '重複塗抹不該讓長度變化').toHaveLength(2);

    const erased = paintBlocked(again.draft, stroke, false);
    expect(erased.changed, '擦除應被視為改動').toBe(true);
    expect(erased.draft.blocked, '擦完應回到 0 格').toHaveLength(0);

    const outside = paintBlocked(empty, [{ col: -1, row: 0 }], true);
    expect(outside.changed, '全部出界的筆刷不該改動草稿').toBe(false);
    expect(outside.draft.blocked).toHaveLength(0);
  });

  it('障礙塗在路徑格上會被 blockedPathConflicts 列出，非路徑格不會', () => {
    const draft = createStarterDraft();
    const mr = midRowOf(draft);
    const onPath: GridPoint = { col: 3, row: mr };
    const offPath: GridPoint = { col: 3, row: mr + 1 };

    const painted = paintBlocked(draft, [onPath, offPath], true);
    expect(painted.changed).toBe(true);

    const conflicts = blockedPathConflicts(painted.draft);
    expect(conflicts.length, '只有 ' + at(onPath) + ' 落在路徑上，衝突應為 1 格').toBe(1);
    expect(
      conflicts.some((p) => p.col === onPath.col && p.row === onPath.row),
      at(onPath) + ' 應出現在衝突清單',
    ).toBe(true);
    expect(
      conflicts.some((p) => p.col === offPath.col && p.row === offPath.row),
      at(offPath) + ' 不在路徑上，不該出現在衝突清單',
    ).toBe(false);

    expect(validateDraft(painted.draft).some((i) => i.code === 'blockedOnPath'), 'validateDraft 也要抓到 blockedOnPath').toBe(true);
  });
});

describe('canPlacePreviewTower', () => {
  it('路徑格 / 障礙格 / 已有塔三種都回 ok=false 且 code 各自正確，空地 ok=true', () => {
    const draft = createStarterDraft();
    const mr = midRowOf(draft);
    const mc = midColOf(draft);

    const onPath: GridPoint = { col: mc, row: mr };
    const pathCheck = canPlacePreviewTower(draft, onPath);
    expect(pathCheck.ok, at(onPath) + ' 是路徑格，不該可放').toBe(false);
    expect(pathCheck.issue?.code).toBe('towerOnPath');

    const blockedCell: GridPoint = { col: 1, row: mr + 1 };
    const withBlocked = paintBlocked(draft, [blockedCell], true).draft;
    const blockedCheck = canPlacePreviewTower(withBlocked, blockedCell);
    expect(blockedCheck.ok, at(blockedCell) + ' 是障礙格，不該可放').toBe(false);
    expect(blockedCheck.issue?.code).toBe('towerOnBlocked');

    const freeCell: GridPoint = { col: 2, row: mr + 2 };
    const freeCheck = canPlacePreviewTower(withBlocked, freeCell);
    expect(freeCheck.ok, at(freeCell) + ' 是空地，應該可放').toBe(true);
    expect(freeCheck.issue).toBeUndefined();

    const placed = addPreviewTower(withBlocked, freeCell, 'basic', 'pt-overlap');
    expect(placed.changed, '空格放塔應成功').toBe(true);
    expect(placed.issue).toBeUndefined();
    const overlap = canPlacePreviewTower(placed.draft, freeCell);
    expect(overlap.ok, at(freeCell) + ' 已有塔，不該可放').toBe(false);
    expect(overlap.issue?.code).toBe('towerOverlap');

    const oobCheck = canPlacePreviewTower(draft, { col: draft.cols, row: 0 });
    expect(oobCheck.ok, '出界格不該可放').toBe(false);
    expect(oobCheck.issue?.code).toBe('outOfBounds');
  });
});

describe('validateDraft', () => {
  it('路徑點不足 2 個時回 tooFewWaypoints，骨架草稿回空陣列', () => {
    const empty = createEmptyDraft();
    const emptyIssues = validateDraft(empty);
    expect(emptyIssues).toHaveLength(1);
    expect(emptyIssues[0].code).toBe('tooFewWaypoints');

    const single = addWaypoint(empty, { col: 1, row: 1 }).draft;
    const singleIssues = validateDraft(single);
    expect(singleIssues.some((i) => i.code === 'tooFewWaypoints'), '只有 1 個路徑點仍算太少').toBe(true);
    expect(singleIssues.some((i) => i.code === 'pathBroken'), '單點沒有斷點問題').toBe(false);

    const starter = createStarterDraft();
    expect(validateDraft(starter), '骨架草稿應完全合法：' + JSON.stringify(validateDraft(starter))).toEqual([]);
  });
});

describe('toTileGrid', () => {
  it('尺寸、起終點、路徑、障礙、塔 id 全部對位', () => {
    const draft = createStarterDraft();
    const mr = midRowOf(draft);
    const mc = midColOf(draft);
    const blockedCell: GridPoint = { col: 1, row: mr + 1 };
    const towerCell: GridPoint = { col: 2, row: mr + 2 };

    const withBlocked = paintBlocked(draft, [blockedCell], true).draft;
    const placed = addPreviewTower(withBlocked, towerCell, 'sniper', 'pt-sniper-1');
    expect(placed.changed, '塔應放在 ' + at(towerCell)).toBe(true);
    const built = placed.draft;

    const grid = toTileGrid(built);
    expect(grid.length, 'grid 列數應為 ' + built.rows).toBe(built.rows);
    grid.forEach((row, r) => {
      expect(row.length, '第 ' + r + ' 列長度應為 ' + built.cols).toBe(built.cols);
    });

    expect(grid[mr][0].type, '起點 (0,' + mr + ') 應為 start').toBe('start');
    expect(grid[mr][built.cols - 1].type, '終點 (' + (built.cols - 1) + ',' + mr + ') 應為 end').toBe('end');
    expect(grid[mr][mc].type, '中間轉角 (' + mc + ',' + mr + ') 應為 path').toBe('path');
    expect(grid[mr][1].type, '路徑中段 (1,' + mr + ') 應為 path').toBe('path');
    expect(grid[mr + 1][1].type, '障礙格 ' + at(blockedCell) + ' 應為 blocked').toBe('blocked');

    expect(grid[mr + 2][2].towerId, '塔格應記下塔 id').toBe('pt-sniper-1');
    expect(grid[mr + 2][2].type, '塔格本身不是路徑也不是障礙').toBe('empty');
    expect(grid[0][0].type, '左上角既非路徑也非障礙，應為 empty').toBe('empty');
    expect(grid[0][0].towerId).toBeNull();

    for (let r = 0; r < built.rows; r++) {
      for (let c = 0; c < built.cols; c++) {
        expect(grid[r][c].row, '(' + c + ',' + r + ') 的 row 欄位').toBe(r);
        expect(grid[r][c].col, '(' + c + ',' + r + ') 的 col 欄位').toBe(c);
      }
    }
  });
});
