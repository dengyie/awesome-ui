import React from "react";

export interface MemoryItem {
  id: string;
  text: string;
  source?: string;
}

export interface MemoryPanelProps {
  title?: string;
  note?: string;
  items: MemoryItem[];
  addPlaceholder?: string;
  addText?: string;
  onAdd?: (text: string) => void;
  onEdit?: (id: string, text: string) => void;
  onDelete?: (id: string) => void;
  onClearAll?: () => void;
  className?: string;
}

/**
 * MemoryPanel - ChatGPT-style "Memory" manager: remembered facts with source
 * captions, inline editing, delete per row, add input and a clear-all action.
 */
export default function MemoryPanel({
  title = "Memory",
  note = "Facts the assistant remembers across conversations.",
  items,
  addPlaceholder = "Add a memory…",
  addText = "Add",
  onAdd,
  onEdit,
  onDelete,
  onClearAll,
  className = "",
}: MemoryPanelProps) {
  const [draft, setDraft] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editDraft, setEditDraft] = React.useState("");

  const submitAdd = () => {
    const text = draft.trim();
    if (!text) return;
    onAdd?.(text);
    setDraft("");
  };
  const startEdit = (item: MemoryItem) => {
    setEditingId(item.id);
    setEditDraft(item.text);
  };
  const submitEdit = () => {
    if (!editingId) return;
    const text = editDraft.trim();
    if (text) onEdit?.(editingId, text);
    setEditingId(null);
  };

  return (
    <div data-memory-panel className={`rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
        {items.length > 0 && (
          <button type="button" data-memory-clear onClick={() => onClearAll?.()} className="text-xs font-medium text-red-600 hover:underline dark:text-red-400">
            Clear all
          </button>
        )}
      </div>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{note}</p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.id} data-memory-item={item.id} className="rounded-lg border border-zinc-200 px-3 py-2.5 dark:border-zinc-800">
            {editingId === item.id ? (
              <div className="flex items-center gap-2">
                <input
                  data-memory-edit-input
                  value={editDraft}
                  onChange={(e) => setEditDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitEdit();
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  autoFocus
                  className="min-w-0 flex-1 rounded-md border border-indigo-300 bg-indigo-50/60 px-2 py-1 text-sm text-zinc-800 outline-none dark:border-indigo-700 dark:bg-indigo-950/40 dark:text-zinc-100"
                />
                <button type="button" data-memory-save onClick={submitEdit} className="shrink-0 rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white hover:bg-indigo-500">Save</button>
                <button type="button" data-memory-cancel onClick={() => setEditingId(null)} className="shrink-0 rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300">Cancel</button>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2">
                  <p data-memory-text className="text-sm text-zinc-800 dark:text-zinc-100">{item.text}</p>
                  <span className="flex shrink-0 items-center gap-1">
                    <button type="button" data-memory-edit aria-label="Edit memory" onClick={() => startEdit(item)} className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true"><path d="M12.7 3.3a1.5 1.5 0 0 1 2.12 0l1.88 1.88a1.5 1.5 0 0 1 0 2.12l-8.37 8.37a2 2 0 0 1-1.02.55l-2.9.65a.6.6 0 0 1-.7-.71l.64-2.9a2 2 0 0 1 .55-1.02L12.7 3.3Z"/></svg>
                    </button>
                    <button type="button" data-memory-delete aria-label="Forget memory" onClick={() => onDelete?.(item.id)} className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true"><path d="M8 3.25h4a.75.75 0 0 1 0 1.5h1.75a.75.75 0 0 1 0 1.5H6.25a.75.75 0 0 1 0-1.5H8Zm-2.75 4.5h9.5a.75.75 0 0 1 0 1.5h-.5l-.4 5.6A1.75 1.75 0 0 1 12.1 16.3H7.9a1.75 1.75 0 0 1-1.75-1.62l-.4-5.68h-.5a.75.75 0 0 1 0-1.5Z"/></svg>
                    </button>
                  </span>
                </div>
                {item.source && <p data-memory-source className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">{item.source}</p>}
              </>
            )}
          </li>
        ))}
        {items.length === 0 && (
          <li data-memory-empty className="rounded-lg border border-dashed border-zinc-300 px-3 py-4 text-center text-xs text-zinc-400 dark:border-zinc-700">
            No memories yet.
          </li>
        )}
      </ul>
      <div className="mt-3 flex items-center gap-2">
        <input
          data-memory-add-input
          value={draft}
          placeholder={addPlaceholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submitAdd();
          }}
          className="min-w-0 flex-1 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-sm text-zinc-800 outline-none focus:border-indigo-400 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
        <button type="button" data-memory-add onClick={submitAdd} disabled={!draft.trim()} className="shrink-0 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-900">
          {addText}
        </button>
      </div>
    </div>
  );
}
