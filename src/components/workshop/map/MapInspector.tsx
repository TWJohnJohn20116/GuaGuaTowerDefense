/**
 * 地圖工作台右側詳情
 *
 * 顯示：統計、驗證問題、路徑點清單、預覽塔清單、儲存狀態。
 * 所有操作都回呼給 MapWorkbench —— 這一層不持有草稿，也不 import store。
 */
import { Btn, Chip, Deck, Empty, Field, IconBtn, SegHead, StatCell } from '@/components/hl';
import { CrossIcon } from '@/components/ui/Icons';
import { SelectableRow } from '@/components/ui/SelectableRow';
import { useTranslation } from '@/i18n';
import { TOWER_DATA } from '@/data/gameData';
import { getTowerData } from '@/store/gameStoreUtils';
import type { TowerType } from '@/types/game';
import { segmentList } from '@/workshop/map/editModel';
import type { GridPoint, MapDraft, MapIssue } from '@/workshop/map/editModel';

export type SaveState = 'idle' | 'saved' | 'error' | 'scratch';

export interface MapInspectorProps {
  draft: MapDraft;
  selectedWaypoint: number | null;
  selectedTowerId: string | null;
  selectedTowerType: string;
  onSelectTowerType: (type: string) => void;
  onSelectWaypoint: (index: number | null) => void;
  onRemoveWaypoint: (index: number) => void;
  onRemoveTower: (id: string) => void;
  onClearBlocked: () => void;
  onClearTowers: () => void;
  onSelectTower: (id: string | null) => void;
  /** 叉路地圖：升級／新增／切換／刪除路段、指定起點、設定下一段 */
  onEnableSegments: () => void;
  onAddSegment: () => void;
  onSelectSegment: (id: string) => void;
  onRemoveSegment: (id: string) => void;
  onSetStartSegment: (id: string) => void;
  onSetSegmentNext: (id: string, next: string[]) => void;
  issues: MapIssue[];
  conflicts: GridPoint[];
  cellCount: number;
  canSave: boolean;
  saveState: SaveState;
  onSave: () => void;
}

const TOWER_TYPES = Object.keys(TOWER_DATA) as TowerType[];

export function MapInspector({
  draft,
  selectedWaypoint,
  selectedTowerId,
  selectedTowerType,
  onSelectTowerType,
  onSelectWaypoint,
  onRemoveWaypoint,
  onRemoveTower,
  onClearBlocked,
  onClearTowers,
  onSelectTower,
  onEnableSegments,
  onAddSegment,
  onSelectSegment,
  onRemoveSegment,
  onSetStartSegment,
  onSetSegmentNext,
  issues,
  conflicts,
  cellCount,
  canSave,
  saveState,
  onSave,
}: MapInspectorProps) {
  const { t } = useTranslation();
  const s = t.studio.map;
  const issueLabel = (issue: MapIssue): string => {
    switch (issue.code) {
      case 'tooFewWaypoints':
        return s.issue.tooFewWaypoints;
      case 'outOfBounds':
        return s.issue.outOfBounds;
      case 'duplicateWaypoint':
        return s.issue.duplicateWaypoint;
      case 'pathBroken':
        return s.issue.pathBroken;
      case 'blockedOnPath':
        return s.issue.blockedOnPath;
      case 'segmentStartMissing':
        return s.issue.segmentStartMissing;
      case 'segmentNextMissing':
        return s.issue.segmentNextMissing;
      case 'towerOnPath':
        return s.issue.towerOnPath;
      case 'towerOnBlocked':
        return s.issue.towerOnBlocked;
      case 'towerOverlap':
        return s.issue.towerOverlap;
      default:
        return s.issue.unknown;
    }
  };

  const activeTower = draft.towers.find((item) => item.id === selectedTowerId) ?? null;
  const activeTowerData = getTowerData(activeTower?.type ?? selectedTowerType);

  return (
    <div className="flex w-[320px] shrink-0 flex-col gap-3 overflow-y-auto">
      <Deck className="p-3">
        <SegHead label={s.panel.stats} />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <StatCell label={s.panel.cells} value={cellCount} />
          <StatCell label={s.panel.waypoints} value={draft.waypoints.length} />
          <StatCell label={s.panel.blocked} value={draft.blocked.length} tone="caution" />
          <StatCell
            label={s.panel.conflicts}
            value={conflicts.length}
            tone={conflicts.length > 0 ? 'alarm' : 'muted'}
          />
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="arc-micro">{s.panel.gridSize}</span>
          <span className="arc-num text-[12px] text-[var(--cn-ink-2)]">
            {draft.cols} x {draft.rows}
          </span>
        </div>
      </Deck>

      <Deck className="p-3">
        <SegHead
          label={s.panel.segments}
          right={(
            <Btn
              size="sm"
              variant="line"
              onClick={(draft.segments ?? []).length === 0 ? onEnableSegments : onAddSegment}
            >
              {(draft.segments ?? []).length === 0 ? s.panel.enableSegments : s.panel.addSegment}
            </Btn>
          )}
        />
        {(draft.segments ?? []).length === 0 ? (
          <p className="mb-3 font-mono text-[10px] leading-relaxed text-[var(--cn-ink-3)]">
            {s.panel.segmentsHint}
          </p>
        ) : (
          <div className="mb-3 flex flex-col gap-1">
            {segmentList(draft).map((segment) => {
              const editing = segment.id === draft.activeSegmentId;
              const isStart = segment.id === draft.startSegmentId;
              return (
                <div key={segment.id} className="flex flex-col gap-1 border border-[var(--cn-line-soft)] p-1">
                  <div className="flex items-center gap-1">
                    <SelectableRow
                      variant="bare"
                      active={editing}
                      onClick={() => onSelectSegment(segment.id)}
                      className="gap-1.5"
                    >
                      <span className="font-mono text-[10.5px] font-bold">{segment.id}</span>
                      <span className="arc-label">
                        {s.panel.segmentPoints.replace('{count}', String(segment.waypoints.length))}
                      </span>
                      {isStart && (
                        <span className="arc-label text-[var(--cn-signal-text)]">{s.panel.segmentStart}</span>
                      )}
                    </SelectableRow>
                    {!isStart && (
                      <Btn size="sm" variant="ghost" onClick={() => onSetStartSegment(segment.id)}>
                        {s.panel.setStart}
                      </Btn>
                    )}
                    <IconBtn
                      label={s.panel.removeSegment}
                      className="h-6 w-6 shrink-0"
                      onClick={() => onRemoveSegment(segment.id)}
                    >
                      <CrossIcon className="h-3 w-3" />
                    </IconBtn>
                  </div>
                  {editing && (
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="arc-label">{s.panel.nextSegments}</span>
                      {segmentList(draft)
                        .filter((other) => other.id !== segment.id)
                        .map((other) => (
                          <Chip
                            key={other.id}
                            active={segment.next.includes(other.id)}
                            onClick={() =>
                              onSetSegmentNext(
                                segment.id,
                                segment.next.includes(other.id)
                                  ? segment.next.filter((id) => id !== other.id)
                                  : [...segment.next, other.id],
                              )
                            }
                          >
                            {other.id}
                          </Chip>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <SegHead label={s.panel.towerPalette} right={<span className="arc-micro">{s.panel.towerHint}</span>} />
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {TOWER_TYPES.map((type) => {
            const data = getTowerData(type);
            const active = selectedTowerType === type;
            return (
              <SelectableRow
                key={type}
                active={active}
                onClick={() => onSelectTowerType(type)}
                variant="card"
                tone="sun"
                className="items-center gap-1 rounded-[12px] border-[3px] px-1.5 py-2"
              >
                <span
                  className="h-3.5 w-3.5 rounded-full border-2 border-[var(--cn-line)]"
                  style={{ background: data?.color ?? 'var(--cn-ink-3)' }}
                />
                <span className="line-clamp-1 text-[11px] font-extrabold text-[var(--cn-ink-2)]">
                  {data?.name ?? type}
                </span>
              </SelectableRow>
            );
          })}
        </div>
        {activeTowerData && (
          <div className="mt-3 grid grid-cols-3 gap-2 rounded-[12px] border-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card-2)] p-2">
            <StatCell label={s.panel.range} value={activeTowerData.range} unit={s.panel.cellUnit} />
            <StatCell label={s.panel.damage} value={activeTowerData.damage} />
            <StatCell label={s.panel.cost} value={activeTowerData.cost} tone="caution" />
          </div>
        )}
      </Deck>

      <Deck className="p-3">
        <SegHead label={s.panel.waypointList} right={<span className="arc-micro">{s.panel.dblHint}</span>} />
        <div className="mt-2 flex max-h-[220px] flex-col gap-1 overflow-y-auto">
          {draft.waypoints.length <= 2 && <div className="arc-micro px-1 py-2">{s.panel.minWaypoints}</div>}
          {draft.waypoints.map((point, index) => {
            const active = selectedWaypoint === index;
            return (
              <div
                key={point.col + '-' + point.row + '-' + index}
                className={[
                  'flex items-center gap-2 rounded-[10px] border-2 px-2 py-1.5',
                  active
                    ? 'border-[var(--cn-line)] bg-[var(--cn-sun-soft)]'
                    : 'border-[var(--cn-line-soft)] bg-[var(--cn-card-2)]',
                ].join(' ')}
              >
                <SelectableRow
                  variant="bare"
                  onClick={() => onSelectWaypoint(active ? null : index)}
                  className="gap-2"
                >
                  <span className="arc-num text-[11px] text-[var(--cn-ink-3)]">{index + 1}</span>
                  <span className="arc-num text-[12px] text-[var(--cn-ink)]">
                    ({point.col}, {point.row})
                  </span>
                  <span className="arc-label ml-auto">
                    {index === 0 ? s.panel.start : index === draft.waypoints.length - 1 ? s.panel.end : s.panel.mid}
                  </span>
                </SelectableRow>
                <IconBtn
                  label={t.studio.common.delete}
                  className="h-5 w-5 shrink-0 text-[var(--cn-alarm-text)]"
                  onClick={() => onRemoveWaypoint(index)}
                  disabled={draft.waypoints.length <= 2}
                >
                  <CrossIcon className="h-3 w-3" />
                </IconBtn>
              </div>
            );
          })}
        </div>
      </Deck>

      <Deck className="p-3">
        <SegHead
          label={s.panel.towerList}
          right={
            <Btn size="sm" variant="ghost" onClick={onClearTowers} disabled={draft.towers.length === 0}>
              {s.panel.clear}
            </Btn>
          }
        />
        <div className="mt-2 flex max-h-[160px] flex-col gap-1 overflow-y-auto">
          {draft.towers.length === 0 && <div className="arc-micro px-1 py-2">{s.panel.noTower}</div>}
          {draft.towers.map((tower) => {
            const active = tower.id === selectedTowerId;
            const data = getTowerData(tower.type);
            return (
              <div
                key={tower.id}
                className={[
                  'flex items-center gap-2 rounded-[10px] border-2 px-2 py-1.5',
                  active
                    ? 'border-[var(--cn-line)] bg-[var(--cn-grape-soft)]'
                    : 'border-[var(--cn-line-soft)] bg-[var(--cn-card-2)]',
                ].join(' ')}
              >
                <SelectableRow
                  variant="bare"
                  onClick={() => onSelectTower(active ? null : tower.id)}
                  className="gap-2"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-[var(--cn-line)]"
                    style={{ background: data?.color ?? 'var(--cn-ink-3)' }}
                  />
                  <span className="line-clamp-1 text-[12px] font-extrabold text-[var(--cn-ink)]">
                    {data?.name ?? tower.type}
                  </span>
                  <span className="arc-num ml-auto text-[11px] text-[var(--cn-ink-3)]">
                    ({tower.col}, {tower.row})
                  </span>
                </SelectableRow>
                <IconBtn
                  label={t.studio.common.delete}
                  className="h-5 w-5 shrink-0 text-[var(--cn-alarm-text)]"
                  onClick={() => onRemoveTower(tower.id)}
                >
                  <CrossIcon className="h-3 w-3" />
                </IconBtn>
              </div>
            );
          })}
        </div>
      </Deck>

      <Deck className="p-3">
        <SegHead
          label={s.panel.blocked}
          right={
            <Btn size="sm" variant="ghost" onClick={onClearBlocked} disabled={draft.blocked.length === 0}>
              {s.panel.clear}
            </Btn>
          }
        />
        <div className="mt-2 flex flex-col gap-1">
          <Field label={s.panel.blockedCount} hint={s.panel.blockedHint}>
            <span className="arc-num text-[15px]">{draft.blocked.length}</span>
          </Field>
          <Field label={s.panel.conflictCount}>
            <span
              className={[
                'arc-num text-[15px]',
                conflicts.length > 0 ? 'text-[var(--cn-alarm-text)]' : 'text-[var(--cn-ink-3)]',
              ].join(' ')}
            >
              {conflicts.length}
            </span>
          </Field>
        </div>
      </Deck>

      <Deck className="p-3">
        <SegHead label={s.panel.validation} />
        {issues.length === 0 ? (
          <div className="mt-3 rounded-[12px] border-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-mint-soft)] px-3 py-2 text-[12px] font-extrabold text-[var(--cn-vital-text)]">
            {s.panel.valid}
          </div>
        ) : (
          <div className="mt-2 flex max-h-[180px] flex-col gap-1 overflow-y-auto">
            {issues.map((issue, index) => (
              <div
                key={issue.code + '-' + index}
                className="flex items-start gap-2 rounded-[10px] border-2 border-[var(--cn-alert)] bg-[var(--cn-alert-soft)] px-2 py-1.5"
              >
                <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[var(--cn-alert)]" />
                <span className="text-[11.5px] font-bold leading-snug text-[var(--cn-alarm-text)]">
                  {issueLabel(issue)}
                  {issue.at ? ' (' + issue.at.col + ', ' + issue.at.row + ')' : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </Deck>

      <Deck className="p-3">
        <SegHead label={s.panel.save} />
        <div className="mt-2 flex flex-col gap-2">
          {saveState === 'scratch' && (
            <Empty
              title={s.panel.scratchTitle}
              hint={s.panel.scratchHint}
              className="!border-[var(--cn-line-soft)] !bg-[var(--cn-card-2)] !py-6"
            />
          )}
          {saveState === 'saved' && (
            <div className="rounded-[12px] border-[3px] border-[var(--cn-line)] bg-[var(--cn-mint-soft)] px-3 py-2 text-[12px] font-extrabold text-[var(--cn-vital-text)]">
              {s.panel.saved}
            </div>
          )}
          {saveState === 'error' && (
            <div className="rounded-[12px] border-[3px] border-[var(--cn-alert)] bg-[var(--cn-alert-soft)] px-3 py-2 text-[12px] font-extrabold text-[var(--cn-alarm-text)]">
              {s.panel.saveFailed}
            </div>
          )}
          <Btn variant="signal" block onClick={onSave} disabled={!canSave}>
            {s.panel.saveButton}
          </Btn>
        </div>
      </Deck>
    </div>
  );
}
