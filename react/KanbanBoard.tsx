import React, { useState } from "react";
import { UiIcon } from "./UiIcon";

export interface KanbanColumn {
  id: string;
  title: string;
  /** Tailwind background class for the column accent dot, e.g. "bg-indigo-500". */
  accent?: string;
  /** Soft cap shown as "n/limit" in the header. */
  limit?: number;
}

export interface KanbanCard {
  id: string;
  columnId: string;
  title: string;
  description?: string;
  tags?: string[];
  assignee?: string;
  priority?: "low" | "medium" | "high";
}

export interface KanbanBoardProps {
  columns?: KanbanColumn[];
  cards?: KanbanCard[];
  onMoveCard?: (cardId: string, toColumnId: string) => void;
  onCardClick?: (card: KanbanCard) => void;
  onAddCard?: (columnId: string) => void;
  className?: string;
}

const PRIORITY_META: Record<NonNullable<KanbanCard["priority"]>, { label: string; cls: string }> = {
  low: { label: "Low", cls: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400" },
  medium: { label: "Medium", cls: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" },
  high: { label: "High", cls: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400" },
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  columns = [],
  cards = [],
  onMoveCard,
  onCardClick,
  onAddCard,
  className = "",
}) => {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<string | null>(null);

  const move = (cardId: string, toColumnId: string) => {
    const card = cards.find((entry) => entry.id === cardId);
    if (!card || card.columnId === toColumnId) return;
    onMoveCard?.(cardId, toColumnId);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, card: KanbanCard) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const index = columns.findIndex((column) => column.id === card.columnId);
    const next = columns[index + (event.key === "ArrowRight" ? 1 : -1)];
    if (!next) return;
    event.preventDefault();
    move(card.id, next.id);
  };

  return (
    <div className={`flex gap-3 overflow-x-auto pb-2 ${className}`}>
      {columns.map((column) => {
        const columnCards = cards.filter((card) => card.columnId === column.id);
        const isOver = overColumn === column.id;
        return (
          <section
            key={column.id}
            aria-label={column.title}
            onDragOver={(event) => {
              event.preventDefault();
              if (overColumn !== column.id) setOverColumn(column.id);
            }}
            onDragLeave={() => setOverColumn((current) => (current === column.id ? null : current))}
            onDrop={(event) => {
              event.preventDefault();
              const cardId = event.dataTransfer.getData("text/plain") || draggingId;
              if (cardId) move(cardId, column.id);
              setDraggingId(null);
              setOverColumn(null);
            }}
            className={`flex w-64 shrink-0 flex-col rounded-xl border bg-zinc-50/60 p-2 transition-colors dark:bg-zinc-900/40 ${
              isOver
                ? "border-indigo-400 bg-indigo-50/60 dark:border-indigo-500 dark:bg-indigo-950/20"
                : "border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <header className="mb-2 flex items-center gap-1.5 px-1">
              <span className={`h-2 w-2 shrink-0 rounded-full ${column.accent || "bg-zinc-400"}`} aria-hidden="true" />
              <h3 className="truncate text-[11px] font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
                {column.title}
              </h3>
              <span className="ml-auto shrink-0 rounded-full bg-zinc-200/70 px-1.5 text-[10px] font-medium tabular-nums text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                {column.limit ? `${columnCards.length}/${column.limit}` : columnCards.length}
              </span>
              {onAddCard && (
                <button
                  type="button"
                  onClick={() => onAddCard(column.id)}
                  aria-label={`Add card to ${column.title}`}
                  className="shrink-0 rounded-md p-0.5 text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                >
                  <UiIcon name="plus" size={12} />
                </button>
              )}
            </header>

            <div className="flex min-h-[3rem] flex-1 flex-col gap-2">
              {columnCards.length === 0 && (
                <p className="rounded-lg border border-dashed border-zinc-200 px-2 py-4 text-center text-[10px] text-zinc-400 dark:border-zinc-700">
                  Drop cards here
                </p>
              )}
              {columnCards.map((card) => {
                const priority = card.priority ? PRIORITY_META[card.priority] : null;
                return (
                  <div
                    key={card.id}
                    role="button"
                    tabIndex={0}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData("text/plain", card.id);
                      event.dataTransfer.effectAllowed = "move";
                      setDraggingId(card.id);
                    }}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setOverColumn(null);
                    }}
                    onClick={() => onCardClick?.(card)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onCardClick?.(card);
                        return;
                      }
                      handleKeyDown(event, card);
                    }}
                    className={`cursor-grab rounded-lg border border-zinc-200 bg-white p-2.5 text-left shadow-sm transition-all hover:border-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:cursor-grabbing dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600 ${
                      draggingId === card.id ? "opacity-40" : ""
                    }`}
                  >
                    <div className="flex items-start gap-1.5">
                      <p className="min-w-0 flex-1 text-[11px] font-medium leading-snug text-zinc-800 dark:text-zinc-100">
                        {card.title}
                      </p>
                      {priority && (
                        <span className={`shrink-0 rounded px-1 py-0.5 text-[9px] font-medium ${priority.cls}`}>
                          {priority.label}
                        </span>
                      )}
                    </div>
                    {card.description && (
                      <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-zinc-500 dark:text-zinc-400">
                        {card.description}
                      </p>
                    )}
                    {(card.tags?.length || card.assignee) && (
                      <div className="mt-1.5 flex items-center gap-1">
                        {card.tags?.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-indigo-50 px-1 py-0.5 text-[9px] font-medium text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                          >
                            {tag}
                          </span>
                        ))}
                        {card.assignee && (
                          <span
                            title={card.assignee}
                            className="ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[8px] font-semibold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-200"
                          >
                            {initials(card.assignee)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
