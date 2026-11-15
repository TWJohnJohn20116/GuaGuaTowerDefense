/**
 * 叉路地圖（路段）的資料層測試
 *
 * 這一層的關鍵約定：draft.waypoints 永遠是「目前編輯中的那一段」，
 * 切換路段時要把舊的那段存回去、把新的那段載出來——兩份真相就會走版，
 * 所以這裡逐條鎖住切換、刪除、引用清理與序列化往返。
 */
import { describe, expect, it } from 'vitest';
import {
  addSegment,
  createEmptyDraft,
  enableSegments,
  readMapDraft,
  removeSegment,
  segmentList,
  serializeDraft,
  setSegmentNext,
  setStartSegment,
  selectSegment,
  validateDraft,
  type MapDraft,
} from '@/workshop/map/editModel';

const p = (col: number, row: number) => ({ col, row });

function flatDraft(): MapDraft {
  return { ...createEmptyDraft(), waypoints: [p(0, 1), p(1, 1), p(2, 1)] };
}

describe('路段：建立與切換', () => {
  it('單一路徑可升級成叉路，第一段就是原本的路徑', () => {
    const { draft, changed } = enableSegments(flatDraft());
    expect(changed).toBe(true);
    expect(draft.segments).toHaveLength(1);
    expect(draft.segments?.[0].waypoints).toHaveLength(3);
    expect(draft.startSegmentId).toBe(draft.segments?.[0].id);
    expect(draft.activeSegmentId).toBe(draft.segments?.[0].id);
  });

  it('新增路段會切成編輯中新段，且第一段自動成為起點', () => {
    const first = enableSegments(flatDraft()).draft;
    const { draft } = addSegment(first);
    expect(draft.segments).toHaveLength(2);
    expect(draft.waypoints).toHaveLength(0);
    expect(draft.startSegmentId).toBe('seg_1');
    expect(draft.activeSegmentId).toBe('seg_2');
  });

  it('切換路段會把目前這段存回去、把目標那段載出來', () => {
    let draft = enableSegments(flatDraft()).draft;
    draft = addSegment(draft).draft;
    draft = { ...draft, waypoints: [p(5, 5), p(6, 5)] };
    const back = selectSegment(draft, 'seg_1').draft;
    expect(back.waypoints).toHaveLength(3);
    const again = selectSegment(back, 'seg_2').draft;
    expect(again.waypoints).toHaveLength(2);
    expect(segmentList(again).find((segment) => segment.id === 'seg_1')?.waypoints).toHaveLength(3);
  });
});

describe('路段：刪除與引用', () => {
  it('刪除路段會清掉其他段對它的引用，並換掉起點', () => {
    let draft = enableSegments(flatDraft()).draft;
    draft = addSegment(draft).draft;
    draft = setSegmentNext(draft, 'seg_1', ['seg_2']).draft;
    const removed = removeSegment(draft, 'seg_2').draft;
    expect(removed.segments).toHaveLength(1);
    expect(removed.segments?.[0].next).toEqual([]);
    expect(removed.startSegmentId).toBe('seg_1');
    expect(removed.activeSegmentId).toBe('seg_1');
  });

  it('setSegmentNext 會濾掉自己與不存在的 id', () => {
    let draft = enableSegments(flatDraft()).draft;
    draft = addSegment(draft).draft;
    draft = setSegmentNext(draft, 'seg_1', ['seg_2', 'seg_1', 'ghost']).draft;
    expect(draft.segments?.find((segment) => segment.id === 'seg_1')?.next).toEqual(['seg_2']);
  });

  it('setStartSegment 只接受存在的路段', () => {
    const draft = enableSegments(flatDraft()).draft;
    expect(setStartSegment(draft, 'ghost').changed).toBe(false);
    expect(setStartSegment(draft, 'seg_1').changed).toBe(true);
  });
});

describe('路段：序列化與驗證', () => {
  it('序列化會帶上路段與起點，讀回來結構一致', () => {
    let draft = enableSegments(flatDraft()).draft;
    draft = addSegment(draft).draft;
    draft = { ...draft, waypoints: [p(7, 7), p(8, 7)] };
    draft = setSegmentNext(draft, 'seg_1', ['seg_2']).draft;

    const serialized = serializeDraft(draft);
    expect(serialized.segments).toHaveLength(2);
    expect(serialized.startSegmentId).toBe('seg_1');

    const restored = readMapDraft(serialized);
    expect(restored.segments).toHaveLength(2);
    expect(restored.segments?.find((segment) => segment.id === 'seg_1')?.next).toEqual(['seg_2']);
    expect(restored.activeSegmentId).toBe('seg_1');
    expect(restored.waypoints).toHaveLength(3);
  });

  it('缺少起點或下一段指向不存在時會被驗證抓出來', () => {
    const draft = enableSegments(flatDraft()).draft;
    const broken = { ...draft, startSegmentId: 'ghost', segments: draft.segments?.map((segment) => ({ ...segment, next: ['nope'] })) };
    const codes = validateDraft(broken).map((issue) => issue.code);
    expect(codes).toContain('segmentStartMissing');
    expect(codes).toContain('segmentNextMissing');
  });
});
