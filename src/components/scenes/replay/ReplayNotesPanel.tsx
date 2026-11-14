// 註記面板 — HARDLINE：編號列 + mono 時間戳，1px 線分隔
import { useState } from 'react';
import type { ReplayNote } from '@/store/replayStore';
import { useTranslation } from '@/i18n';
import { IconBtn, Input, Num, SegHead } from '@/components/hl';
import { TrashIcon, EditIcon, PlusIcon } from '@/components/ui/Icons';
import { ReplayConfirmDialog } from './ReplayConfirmDialog';

interface ReplayNotesPanelProps {
  notes: ReplayNote[];
  playhead: number;
  onAdd: (time: number, text: string) => void;
  onDelete: (noteId: string) => void;
  onUpdate: (noteId: string, text: string) => void;
  onJump: (time: number) => void;
  formatTime: (s: number) => string;
}

export function ReplayNotesPanel({
  notes,
  playhead,
  onAdd,
  onDelete,
  onUpdate,
  onJump,
  formatTime,
}: ReplayNotesPanelProps) {
  const { t } = useTranslation();
  const r = t.replay;
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!draft.trim()) return;
    onAdd(playhead, draft.trim());
    setDraft('');
  };

  const handleStartEdit = (n: ReplayNote) => {
    setEditingId(n.id);
    setEditingText(n.text);
  };

  const handleSaveEdit = () => {
    if (editingId && editingText.trim()) {
      onUpdate(editingId, editingText.trim());
    }
    setEditingId(null);
    setEditingText('');
  };

  return (
    <div className="flex flex-col gap-2.5">
      <SegHead
        label={r.notes}
        right={<Num value={formatTime(playhead)} tone="muted" size="sm" />}
      />

      <div className="flex items-center gap-1.5">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
          placeholder={r.enterNote}
          className="h-8 flex-1 text-[11.5px]"
        />
        <IconBtn
          label={r.addNote}
          onClick={handleAdd}
          disabled={!draft.trim()}
          className="w-8"
        >
          <PlusIcon className="h-3.5 w-3.5" />
        </IconBtn>
      </div>

      <div className="max-h-52 overflow-y-auto border-[3px] border-[var(--cn-line-soft)]">
        {notes.length === 0 && (
          <div className="px-3 py-3 text-center arc-label">{r.noNotes}</div>
        )}
        {notes.map((n) => (
          <div
            key={n.id}
            className="group flex items-start gap-2 border-b border-[var(--cn-line-soft)] px-2 py-1.5 last:border-b-0 hover:bg-[var(--arc-deck-2)]"
          >
            <button
              type="button"
              onClick={() => onJump(n.time)}
              className="arc-num min-w-[46px] shrink-0 border-[3px] border-[var(--cn-line-soft)] px-1.5 py-1 text-center text-[10px] leading-none text-[var(--arc-caution)] transition-colors hover:border-[var(--arc-caution)]"
            >
              {formatTime(n.time)}
            </button>
            {editingId === n.id ? (
              <Input
                autoFocus
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onBlur={handleSaveEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit();
                  else if (e.key === 'Escape') setEditingId(null);
                }}
                className="h-6 min-w-0 flex-1 text-[11px]"
              />
            ) : (
              <p className="min-w-0 flex-1 break-words pt-1 text-[11px] leading-snug text-[var(--arc-ink-2)]">{n.text}</p>
            )}
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <IconBtn
                label={r.rename}
                onClick={() => handleStartEdit(n)}
                className="p-1 text-[var(--arc-ink-4)] hover:text-[var(--arc-ink)]"
              >
                <EditIcon className="h-3 w-3" />
              </IconBtn>
              <IconBtn
                label={r.deleteNote}
                onClick={() => setPendingDeleteId(n.id)}
                className="p-1 text-[var(--arc-ink-4)] hover:text-[var(--arc-alert)]"
              >
                <TrashIcon className="h-3 w-3" />
              </IconBtn>
            </div>
          </div>
        ))}
      </div>

      <ReplayConfirmDialog
        open={pendingDeleteId !== null}
        kind="deleteNote"
        onClose={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (pendingDeleteId) onDelete(pendingDeleteId);
          setPendingDeleteId(null);
        }}
      />
    </div>
  );
}
