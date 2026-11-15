/**
 * GanttTimeline - Vanilla Web Component
 * Usage: <gantt-timeline columns="10" today="4"></gantt-timeline> with `tasks` property
 * Attributes: columns, today, column-label, row-label, empty-text
 * Properties: tasks ({ label, start, span, progress?, tone?, depth? }[])
 * Events: task-click (detail: { task, index })
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const TONE_CLASS = {
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-400',
  sky: 'bg-sky-500',
};

export class GanttTimelineElement extends HTMLElement {
  static get observedAttributes() {
    return ['columns', 'today', 'column-label', 'row-label', 'empty-text'];
  }

  constructor() {
    super();
    this._tasks = [];
  }

  get tasks() {
    return this._tasks;
  }

  set tasks(value) {
    this._tasks = Array.isArray(value) ? value : [];
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

  render() {
    this._applyHostClass('block');
    const columns = Number(this.getAttribute('columns')) || 10;
    const todayRaw = this.getAttribute('today');
    const columnLabel = this.getAttribute('column-label') || 'Timeline';
    const rowLabel = this.getAttribute('row-label') || 'Name';
    const emptyText = this.getAttribute('empty-text') || 'No tasks scheduled';
    const cells = Array.from({ length: columns }, (_, index) => index);
    const gridLines = cells
      .map(
        (cell) =>
          `<span aria-hidden="true" class="absolute inset-y-0 border-l border-zinc-50 dark:border-zinc-800/60" style="left:${(cell / columns) * 100}%"></span>`,
      )
      .join('');

    const rows = this._tasks
      .map((task, index) => {
        const start = Math.min(Math.max(task.start, 0), columns);
        const offset = start / columns;
        const width = Math.min(Math.max(task.span, 0), columns - start) / columns;
        const tone = TONE_CLASS[task.tone || 'indigo'] || TONE_CLASS.indigo;
        return `<div role="row" data-task-index="${index}" class="flex items-stretch border-b border-zinc-50 last:border-b-0 dark:border-zinc-800/60 ${
          typeof this.onTaskClick === 'function'
            ? 'cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
            : ''
        }">
          <span role="cell" class="flex w-44 shrink-0 items-center py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200" style="padding-left:${1 + (task.depth || 0) * 1.25}rem">
            <span class="truncate">${escapeAttribute(task.label)}</span>
          </span>
          <div role="cell" class="relative min-w-0 flex-1 border-l border-zinc-100 dark:border-zinc-800">
            ${gridLines}
            ${
              todayRaw !== null
                ? `<span aria-hidden="true" class="absolute inset-y-0 w-px bg-rose-400" style="left:${(Math.min(Math.max(Number(todayRaw) || 0, 0), columns) / columns) * 100}%"></span>`
                : ''
            }
            <div data-task-bar class="absolute top-1/2 flex h-4 -translate-y-1/2 items-center overflow-hidden rounded" style="left:${offset * 100}%;width:calc(${width * 100}% - 4px)">
              <div class="relative h-full ${tone}">
                ${
                  task.progress !== undefined
                    ? `<span class="absolute inset-y-0 left-0 bg-white/30" style="width:${Math.min(Math.max(task.progress, 0), 100)}%"></span>`
                    : ''
                }
              </div>
              <span class="absolute inset-0 flex items-center px-1.5 text-[10px] font-medium text-white">${task.progress !== undefined ? `${task.progress}%` : ''}</span>
            </div>
          </div>
        </div>`;
      })
      .join('');

    this.innerHTML = `<div data-gantt-timeline role="table" aria-label="${escapeAttribute(columnLabel)}" aria-rowcount="${this._tasks.length}" class="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div role="row" class="flex items-center border-b border-zinc-100 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-800/40">
        <span role="columnheader" class="w-44 shrink-0 px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">${escapeAttribute(rowLabel)}</span>
        <div class="relative flex min-w-0 flex-1">
          ${cells
            .map(
              (cell) =>
                `<span role="columnheader" class="min-w-0 flex-1 border-l border-zinc-100 px-1 py-2 text-center text-[10px] font-medium text-zinc-400 dark:border-zinc-800">${cell + 1}</span>`,
            )
            .join('')}
        </div>
      </div>
      ${
        this._tasks.length === 0
          ? `<p class="px-4 py-6 text-center text-xs text-zinc-400">${escapeAttribute(emptyText)}</p>`
          : rows
      }
    </div>`;

    this.querySelectorAll('[data-task-index]').forEach((row) => {
      row.addEventListener('click', () => {
        const index = Number(row.getAttribute('data-task-index'));
        if (typeof this.onTaskClick === 'function') this.onTaskClick(this._tasks[index], index);
        this.dispatchEvent(new CustomEvent('task-click', { detail: { task: this._tasks[index], index } }));
      });
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('gantt-timeline')) {
  customElements.define('gantt-timeline', GanttTimelineElement);
}
export default GanttTimelineElement;
