/**
 * GroupedTaskList - Grouped task list with a split detail pane: left list
 * with collapsible sections (To Do / In Progress / Done), task rows with
 * completion circle, due date, subtask count and assignee avatar, "Add
 * task…" inline rows; right detail pane with completion badge, title,
 * assignee row, due date row, project chip, fields grid (estimated/actual
 * time, duration, summary, priority, tags) and a comment composer
 * (Asana list view pattern).
 */
const escapeAttribute = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const parseJsonAttr = (raw, fallback) => {
  if (typeof raw !== 'string' || raw.trim() === '') return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const DEFAULT_SECTIONS = () => [
  {
    id: 'todo',
    label: 'To Do',
    tasks: [
      { id: 't1', title: 'Prepare Demo Materials', due: '', done: false, subtasks: 1, assignee: 'JM' },
      { id: 't2', title: 'Align Schedule with Other Divisions', due: 'Jan 2, 2026', done: false, assignee: 'JM' },
      { id: 't3', title: 'Schedule a meeting to define Demo Scope & Key Features', due: 'Tuesday', done: false, assignee: 'AK' },
    ],
  },
  {
    id: 'inprogress',
    label: 'In Progress',
    tasks: [
      { id: 't4', title: 'Define Product Demo Goal', due: 'Tomorrow 3:30pm', done: false, likes: 1, comments: 2, subtasks: 1, assignee: 'AK' },
      { id: 't5', title: 'Scheduling a quick call with Product Owner', due: 'Friday', done: false, assignee: 'AK' },
    ],
  },
  {
    id: 'done',
    label: 'Done',
    tasks: [
      { id: 't6', title: 'Scheduling a KickOff Meeting', due: 'Dec 19', done: false, assignee: 'JM' },
      { id: 't7', title: 'Create a Template for Demo Script', due: 'Dec 22', done: true, assignee: 'AK' },
    ],
  },
];

const FIELD_TONE_STYLES = {
  rose: 'rounded px-1.5 py-0.5 font-medium bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300',
  emerald: 'rounded px-1.5 py-0.5 font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300',
};

class GroupedTaskListElement extends HTMLElement {
  static get observedAttributes() {
    return ['sections', 'detail', 'add-task-label', 'comment-placeholder'];
  }

  constructor() {
    super();
    this._bound = false;
    this._openSections = ['todo', 'inprogress', 'done'];
  }

  connectedCallback() {
    if (this._bound === false && this.innerHTML === '') {
      this._bound = true;
    }
    this._render();
    this.addEventListener('click', this._onClick);
    this.addEventListener('keydown', this._onKeydown);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onClick);
    this.removeEventListener('keydown', this._onKeydown);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (this._bound === false && this.innerHTML === '') return;
    this._render();
  }

  _onClick(event) {
    const toggle = event.target.closest('[data-tasklist-section-toggle]');
    if (toggle) {
      const sectionId = toggle.getAttribute('data-tasklist-section-toggle');
      const isOpen = this._openSections.includes(sectionId);
      this._openSections = isOpen ? this._openSections.filter((s) => s !== sectionId) : [...this._openSections, sectionId];
      this._render();
      this.dispatchEvent(new CustomEvent('section-toggle', { detail: { sectionId, open: !isOpen }, bubbles: true }));
      return;
    }
    const task = event.target.closest('[data-tasklist-task]');
    if (task) {
      const found = this._sections().flatMap((s) => s.tasks).find((t) => t.id === task.getAttribute('data-tasklist-task'));
      if (found) this.dispatchEvent(new CustomEvent('task-click', { detail: { task: found }, bubbles: true }));
    }
  }

  _onKeydown(event) {
    const input = event.target.closest('[data-tasklist-comment-input]');
    if (input && event.key === 'Enter' && input.value.trim()) {
      this.dispatchEvent(new CustomEvent('comment-submit', { detail: { text: input.value.trim() }, bubbles: true }));
      input.value = '';
    }
  }

  _sections() {
    return parseJsonAttr(this.getAttribute('sections'), DEFAULT_SECTIONS());
  }

  _detail() {
    return parseJsonAttr(this.getAttribute('detail'), {
      completedLabel: 'Completed',
      title: 'Define Product Demo Goal',
      assignee: 'Alex Smith',
      due: 'Tomorrow 3:30pm',
      project: 'Product Demo – A',
      projectStatus: 'In Progress',
      fields: [
        { label: 'Estimated time', value: '3h 45m' },
        { label: 'Actual time', value: '1h 36m' },
        { label: 'Duration', value: '-1d 2h' },
        { label: 'Task summary', value: 'Documented Product Demo A goal including target audience, value message, success criteria & feature scope. Review requested by 8AM.' },
        { label: 'Priority', value: 'High', tone: 'rose' },
        { label: 'Percent allocation', value: '–' },
      ],
      tags: ['documentation'],
      description: 'Document the goal of Product Demo A, including target audience, primary value message, success criteria, and feature scope.',
    });
  }

  _render() {
    const addTaskLabel = this.getAttribute('add-task-label') || 'Add task…';
    const commentPlaceholder = this.getAttribute('comment-placeholder') || 'Add a comment';
    const sections = this._sections();
    const detail = this._detail();
    const initials = String(detail.assignee ?? '').split(' ').map((p) => p[0]).join('');

    const sectionsHtml = sections
      .map((section) => {
        const open = this._openSections.includes(section.id);
        const tasksHtml = open
          ? `<ul data-tasklist-items>${section.tasks
              .map((task) => {
                const circleCls = task.done
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : 'border-zinc-300 text-transparent dark:border-zinc-600';
                const titleCls = task.done ? 'text-zinc-400 line-through dark:text-zinc-500' : 'text-zinc-800 dark:text-zinc-100';
                return `<li><button data-tasklist-task="${escapeAttribute(task.id)}" type="button" class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    <span aria-hidden="true" class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px] ${circleCls}">✓</span>
                    <span class="flex-1 truncate ${titleCls}">${escapeAttribute(task.title)}</span>
                    ${task.likes ? `<span class="text-[11px] text-zinc-400">👍 ${Number(task.likes)}</span>` : ''}
                    ${task.comments ? `<span class="text-[11px] text-zinc-400">💬 ${Number(task.comments)}</span>` : ''}
                    ${task.subtasks ? `<span class="text-[11px] text-zinc-400">⑂ ${Number(task.subtasks)}</span>` : ''}
                    <span class="w-24 shrink-0 truncate text-right text-[11px] text-zinc-500 dark:text-zinc-400">${escapeAttribute(task.due)}</span>
                    <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-amber-950">${escapeAttribute(task.assignee)}</span>
                  </button></li>`;
              })
              .join('')}<li data-tasklist-add-inline class="px-4 py-2 text-sm text-zinc-400 dark:text-zinc-500">${escapeAttribute(addTaskLabel)}</li></ul>`
          : '';
        return `<div data-tasklist-section="${escapeAttribute(section.id)}">
            <button data-tasklist-section-toggle="${escapeAttribute(section.id)}" type="button" class="flex w-full items-center gap-2 px-4 py-2.5 text-left">
              <span aria-hidden="true" class="text-xs text-zinc-400">${open ? '▾' : '▸'}</span>
              <span class="text-sm font-bold text-zinc-800 dark:text-zinc-100">${escapeAttribute(section.label)}</span>
            </button>
            ${tasksHtml}
          </div>`;
      })
      .join('');

    const fieldsHtml = (detail.fields ?? [])
      .map((field, i) => {
        const toneCls = FIELD_TONE_STYLES[field.tone] ?? 'text-zinc-800 dark:text-zinc-100';
        return `<div class="grid grid-cols-3 gap-2 px-3 py-2.5 text-xs ${i > 0 ? 'border-t border-zinc-100 dark:border-zinc-800' : ''}">
            <span class="text-zinc-500 dark:text-zinc-400">${escapeAttribute(field.label)}</span>
            <span class="col-span-2 ${toneCls}">${escapeAttribute(field.value)}</span>
          </div>`;
      })
      .join('');

    const tagsHtml = (detail.tags ?? []).length
      ? `<div class="grid grid-cols-3 gap-2 border-t border-zinc-100 px-3 py-2.5 text-xs dark:border-zinc-800">
          <span class="text-zinc-500 dark:text-zinc-400">Tags</span>
          <span class="col-span-2 flex flex-wrap gap-1.5">${(detail.tags ?? [])
            .map((tag) => `<span class="rounded bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">${escapeAttribute(tag)} ✕</span>`)
            .join('')}</span>
        </div>`
      : '';

    this.innerHTML = `
      <div data-tasklist class="grid w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm lg:grid-cols-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div data-tasklist-list class="border-r border-zinc-100 lg:col-span-3 dark:border-zinc-800">
          <div data-tasklist-toolbar class="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <button data-tasklist-add type="button" class="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">＋ Add task</button>
          </div>
          <div data-tasklist-name-header class="border-b border-zinc-100 px-4 py-2 text-xs font-medium text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">Name</div>
          ${sectionsHtml}
        </div>
        <div data-tasklist-detail class="space-y-4 p-5 lg:col-span-2">
          ${detail.completedLabel ? `<span data-tasklist-completed class="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">✓ ${escapeAttribute(detail.completedLabel)}</span>` : ''}
          <h2 data-tasklist-title class="text-xl font-bold text-zinc-900 dark:text-zinc-50">${escapeAttribute(detail.title)}</h2>
          <div data-tasklist-meta class="space-y-2.5 text-sm">
            <div class="flex items-center gap-3">
              <span class="w-20 text-xs text-zinc-500 dark:text-zinc-400">Assignee</span>
              <span class="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-amber-950">${escapeAttribute(initials)}</span>
              <span class="text-zinc-800 dark:text-zinc-100">${escapeAttribute(detail.assignee)}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="w-20 text-xs text-zinc-500 dark:text-zinc-400">Due date</span>
              <span class="text-zinc-800 dark:text-zinc-100">🗓 ${escapeAttribute(detail.due)}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="w-20 text-xs text-zinc-500 dark:text-zinc-400">Projects</span>
              <span data-tasklist-project-chip class="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800">
                <span class="h-2 w-2 rounded-full bg-sky-500"></span>
                <span class="font-medium text-zinc-800 dark:text-zinc-100">${escapeAttribute(detail.project)}</span>
                ${detail.projectStatus ? `<span class="text-zinc-400 dark:text-zinc-500">${escapeAttribute(detail.projectStatus)}</span>` : ''}
              </span>
            </div>
          </div>
          <div data-tasklist-fields class="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">${fieldsHtml}${tagsHtml}</div>
          ${detail.description ? `<p data-tasklist-description class="text-xs leading-5 text-zinc-600 dark:text-zinc-300">${escapeAttribute(detail.description)}</p>` : ''}
          <div data-tasklist-comment class="flex items-center gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <span aria-hidden="true" class="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-xs dark:bg-zinc-700">👤</span>
            <input data-tasklist-comment-input type="text" placeholder="${escapeAttribute(commentPlaceholder)}" class="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-100">
          </div>
        </div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('grouped-task-list')) {
  customElements.define('grouped-task-list', GroupedTaskListElement);
}

export default GroupedTaskListElement;
