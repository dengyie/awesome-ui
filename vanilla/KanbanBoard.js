import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const PRIORITY_META = {
  low: { label: 'Low', cls: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400' },
  medium: { label: 'Medium', cls: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' },
  high: { label: 'High', cls: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400' },
};

const initials = (name) =>
  String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

/**
 * KanbanBoard - Vanilla Web Component
 * Usage: <kanban-board></kanban-board>
 * Properties: columns (KanbanColumn[]), cards (KanbanCard[])
 * Events: move-card (detail: {cardId, from, to}), card-click (detail: card), add-card (detail: columnId)
 */
export class KanbanBoardElement extends HTMLElement {
  static get observedAttributes() {
    return ['empty-text'];
  }

  constructor() {
    super();
    this._columns = [];
    this._cards = [];
    this._draggingId = null;
    this._overColumn = null;
  }

  get columns() {
    return this._columns;
  }

  set columns(value) {
    this._columns = Array.isArray(value) ? value : [];
    this.render();
  }

  get cards() {
    return this._cards;
  }

  set cards(value) {
    this._cards = Array.isArray(value) ? value : [];
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  _applyHostClass(hostClass) {
    const prev = this._appliedLayout || '';
    let user = this.className || '';
    if (prev && user.startsWith(prev)) user = user.slice(prev.length).trim();
    this._appliedLayout = hostClass;
    const next = `${hostClass}${user ? ` ${user}` : ''}`;
    if (this.className !== next) this.className = next;
  }

  _move(cardId, toColumnId) {
    const card = this._cards.find((entry) => String(entry.id) === String(cardId));
    if (!card || card.columnId === toColumnId) return;
    this.dispatchEvent(
      new CustomEvent('move-card', { detail: { cardId: card.id, from: card.columnId, to: toColumnId } })
    );
  }

  _renderCard(card) {
    const priority = card.priority ? PRIORITY_META[card.priority] : null;
    const tags = (card.tags || [])
      .slice(0, 2)
      .map(
        (tag) =>
          `<span class="rounded bg-indigo-50 px-1 py-0.5 text-[9px] font-medium text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">${escapeAttribute(tag)}</span>`
      )
      .join('');
    const assignee = card.assignee
      ? `<span title="${escapeAttribute(card.assignee)}" class="ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[8px] font-semibold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-200">${escapeAttribute(initials(card.assignee))}</span>`
      : '';

    return `<div role="button" tabindex="0" draggable="true" data-card="${escapeAttribute(card.id)}"
      class="kanban-card cursor-grab rounded-lg border border-zinc-200 bg-white p-2.5 text-left shadow-sm transition-all hover:border-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:cursor-grabbing dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600 ${
        String(this._draggingId) === String(card.id) ? 'opacity-40' : ''
      }">
      <div class="flex items-start gap-1.5">
        <p class="min-w-0 flex-1 text-[11px] font-medium leading-snug text-zinc-800 dark:text-zinc-100">${escapeAttribute(card.title)}</p>
        ${priority ? `<span class="shrink-0 rounded px-1 py-0.5 text-[9px] font-medium ${priority.cls}">${priority.label}</span>` : ''}
      </div>
      ${
        card.description
          ? `<p class="mt-1 line-clamp-2 text-[10px] leading-snug text-zinc-500 dark:text-zinc-400">${escapeAttribute(card.description)}</p>`
          : ''
      }
      ${tags || assignee ? `<div class="mt-1.5 flex items-center gap-1">${tags}${assignee}</div>` : ''}
    </div>`;
  }

  render() {
    this._applyHostClass('block');
    const emptyText = this.getAttribute('empty-text') || 'Drop cards here';

    const columns = this._columns
      .map((column) => {
        const cards = this._cards.filter((card) => card.columnId === column.id);
        const count = column.limit ? `${cards.length}/${column.limit}` : String(cards.length);
        const isOver = String(this._overColumn) === String(column.id);
        return `<section data-column="${escapeAttribute(column.id)}" aria-label="${escapeAttribute(column.title)}"
          class="kanban-column flex w-64 shrink-0 flex-col rounded-xl border p-2 transition-colors dark:bg-zinc-900/40 ${
            isOver
              ? 'border-indigo-400 bg-indigo-50/60 dark:border-indigo-500 dark:bg-indigo-950/20'
              : 'border-zinc-200 bg-zinc-50/60 dark:border-zinc-800'
          }">
          <header class="mb-2 flex items-center gap-1.5 px-1">
            <span class="h-2 w-2 shrink-0 rounded-full ${escapeAttribute(column.accent || 'bg-zinc-400')}" aria-hidden="true"></span>
            <h3 class="truncate text-[11px] font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">${escapeAttribute(column.title)}</h3>
            <span class="column-count ml-auto shrink-0 rounded-full bg-zinc-200/70 px-1.5 text-[10px] font-medium tabular-nums text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">${count}</span>
            <button type="button" class="column-add shrink-0 rounded-md p-0.5 text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              data-column="${escapeAttribute(column.id)}" aria-label="Add card to ${escapeAttribute(column.title)}">${uiIcon('plus', { size: 12 })}</button>
          </header>
          <div class="flex min-h-[3rem] flex-1 flex-col gap-2">
            ${
              cards.length === 0
                ? `<p class="rounded-lg border border-dashed border-zinc-200 px-2 py-4 text-center text-[10px] text-zinc-400 dark:border-zinc-700">${escapeAttribute(emptyText)}</p>`
                : cards.map((card) => this._renderCard(card)).join('')
            }
          </div>
        </section>`;
      })
      .join('');

    this.innerHTML = `<div class="flex gap-3 overflow-x-auto pb-2">${columns}</div>`;

    this.querySelectorAll('.kanban-column').forEach((section) => {
      const columnId = section.getAttribute('data-column');
      section.addEventListener('dragover', (event) => {
        event.preventDefault();
        if (this._overColumn !== columnId) {
          this._overColumn = columnId;
          this.render();
        }
      });
      section.addEventListener('dragleave', (event) => {
        if (event.target === section && this._overColumn === columnId) {
          this._overColumn = null;
          this.render();
        }
      });
      section.addEventListener('drop', (event) => {
        event.preventDefault();
        const cardId = (event.dataTransfer && event.dataTransfer.getData('text/plain')) || this._draggingId;
        this._overColumn = null;
        this._draggingId = null;
        if (cardId) this._move(cardId, columnId);
        else this.render();
      });
    });

    this.querySelectorAll('.kanban-card').forEach((node) => {
      const cardId = node.getAttribute('data-card');
      const card = this._cards.find((entry) => String(entry.id) === String(cardId));
      if (!card) return;

      node.addEventListener('dragstart', (event) => {
        if (event.dataTransfer) {
          event.dataTransfer.setData('text/plain', String(card.id));
          event.dataTransfer.effectAllowed = 'move';
        }
        this._draggingId = card.id;
      });
      node.addEventListener('dragend', () => {
        this._draggingId = null;
        this._overColumn = null;
        this.render();
      });
      node.addEventListener('click', () => this.dispatchEvent(new CustomEvent('card-click', { detail: card })));
      node.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.dispatchEvent(new CustomEvent('card-click', { detail: card }));
          return;
        }
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        const index = this._columns.findIndex((column) => column.id === card.columnId);
        const next = this._columns[index + (event.key === 'ArrowRight' ? 1 : -1)];
        if (!next) return;
        event.preventDefault();
        this._move(card.id, next.id);
      });
    });

    this.querySelectorAll('.column-add').forEach((button) => {
      button.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('add-card', { detail: button.getAttribute('data-column') }));
      });
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('kanban-board')) {
  customElements.define('kanban-board', KanbanBoardElement);
}
export default KanbanBoardElement;
