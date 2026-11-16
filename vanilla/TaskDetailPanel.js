/**
 * TaskDetailPanel - Task/milestone detail sidebar: header with type pill and
 * AI summary bar, status pill with two-column field grid, collapsible
 * description, action list and an activity column with comment box
 * (ClickUp task detail pattern).
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

const ACTION_ICONS = {
  fields: '▤', subtask: '⑂', relate: '⤱', checklist: '☑', attach: '📎', link: '🔗',
  clock: '⏱', target: '◎', calendar: '📅', flag: '⚑', tag: '🏷', person: '👤',
};
const iconFor = (name) => ACTION_ICONS[name] || '•';

const DEFAULT_FIELDS = () => [
  { label: 'Assignees', value: 'J', icon: 'person' },
  { label: 'Dates', value: 'Yesterday → 10/31/25', icon: 'calendar' },
  { label: 'Priority', value: 'Normal', icon: 'flag' },
  { label: 'Time estimate', value: '1h', icon: 'clock' },
  { label: 'Sprint points', value: 'Empty', icon: 'target' },
  { label: 'Tags', value: 'dashboard', icon: 'tag', tag: true },
];

const DEFAULT_ACTIONS = () => [
  { id: 'fields', icon: 'fields', label: 'Custom Fields' },
  { id: 'subtask', icon: 'subtask', label: 'Add subtask' },
  { id: 'relate', icon: 'relate', label: 'Relate items or add dependencies' },
  { id: 'checklist', icon: 'checklist', label: 'Create checklist' },
  { id: 'attach', icon: 'attach', label: 'Attach file' },
];

const DEFAULT_ACTIVITY = () => [
  { id: 'a1', actor: 'You', text: 'tracked time · 1m on Oct 22', time: '1 hour ago' },
];

class TaskDetailPanelElement extends HTMLElement {
  static get observedAttributes() {
    return ['type', 'title', 'ai-bar-text', 'ai-bar-actions', 'status-label', 'fields', 'description', 'actions', 'activity-title', 'activity', 'comment-placeholder'];
  }

  constructor() {
    super();
    this._bound = false;
    this._type = 'Milestone';
    this._title = 'Complete Dashboard Feature Screens';
    this._aiBarText = 'Ask Brain to';
    this._aiBarActions = ['create a summary', 'generate subtasks', 'find similar milestones'];
    this._statusLabel = 'IN DEVELOPMENT';
    this._fields = DEFAULT_FIELDS();
    this._description = 'Finalize all design deliverables for the Dashboard feature. This includes ensuring layout compositions, maintaining component consistency, and applying visual polish. This milestone marks the completion of all Dashboard-related UI screens, ready for review and developer handoff.';
    this._actions = DEFAULT_ACTIONS();
    this._activityTitle = 'Activity';
    this._activity = DEFAULT_ACTIVITY();
    this._commentPlaceholder = 'Write a comment...';
  }

  connectedCallback() {
    const read = (attr, key, fallback) => {
      const v = this.getAttribute(attr);
      if (v !== null && v !== '') this[`_${key}`] = v;
      else if (this[`_${key}`] === undefined) this[`_${key}`] = fallback;
    };
    const readJson = (attr, key, fallback) => {
      const v = this.getAttribute(attr);
      if (v) this[`_${key}`] = parseJsonAttr(v, fallback());
    };
    read('type', 'type');
    read('title', 'title');
    read('ai-bar-text', 'aiBarText');
    readJson('ai-bar-actions', 'aiBarActions', () => ['create a summary', 'generate subtasks', 'find similar milestones']);
    read('status-label', 'statusLabel');
    readJson('fields', 'fields', DEFAULT_FIELDS);
    read('description', 'description');
    readJson('actions', 'actions', DEFAULT_ACTIONS);
    read('activity-title', 'activityTitle');
    readJson('activity', 'activity', DEFAULT_ACTIVITY);
    read('comment-placeholder', 'commentPlaceholder');
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
    if (name === 'type') this._type = newValue || 'Milestone';
    if (name === 'title') this._title = newValue || 'Complete Dashboard Feature Screens';
    if (name === 'ai-bar-text') this._aiBarText = newValue || 'Ask Brain to';
    if (name === 'ai-bar-actions') this._aiBarActions = parseJsonAttr(newValue, ['create a summary', 'generate subtasks', 'find similar milestones']);
    if (name === 'status-label') this._statusLabel = newValue || 'IN DEVELOPMENT';
    if (name === 'fields') this._fields = parseJsonAttr(newValue, DEFAULT_FIELDS());
    if (name === 'description') this._description = newValue || '';
    if (name === 'actions') this._actions = parseJsonAttr(newValue, DEFAULT_ACTIONS());
    if (name === 'activity-title') this._activityTitle = newValue || 'Activity';
    if (name === 'activity') this._activity = parseJsonAttr(newValue, DEFAULT_ACTIVITY());
    if (name === 'comment-placeholder') this._commentPlaceholder = newValue || 'Write a comment...';
    this._render();
  }

  _onClick(event) {
    const actionBtn = event.target.closest('[data-task-action]');
    if (actionBtn) {
      const action = this._actions.find((a) => a.id === actionBtn.getAttribute('data-task-action'));
      if (action) {
        this.dispatchEvent(new CustomEvent('action-click', { detail: { action }, bubbles: true }));
        return;
      }
    }
    if (event.target.closest('[data-task-comment-send]')) {
      const input = this.querySelector('[data-task-comment-input]');
      const text = (input ? input.value : '').trim();
      if (text) {
        this.dispatchEvent(new CustomEvent('comment-submit', { detail: { text }, bubbles: true }));
        if (input) input.value = '';
      }
    }
  }

  _onKeydown(event) {
    if (event.key !== 'Enter' || event.shiftKey) return;
    const input = event.target.closest('[data-task-comment-input]');
    if (!input) return;
    const text = input.value.trim();
    if (text) {
      this.dispatchEvent(new CustomEvent('comment-submit', { detail: { text }, bubbles: true }));
      input.value = '';
    }
  }

  _render() {
    const fieldsHtml = this._fields
      .map((f) => {
        const valueHtml = f.tag
          ? `<span data-task-field-value="${escapeAttribute(f.value)}" class="rounded bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-950/70 dark:text-violet-300">${escapeAttribute(f.value)}</span>`
          : `<span data-task-field-value="${escapeAttribute(f.value)}" class="truncate text-sm text-zinc-800 dark:text-zinc-100">${escapeAttribute(f.value)}</span>`;
        return `<div data-task-field="${escapeAttribute(f.label)}" class="flex items-center gap-3">
            <span class="flex w-36 shrink-0 items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400"><span aria-hidden="true">${iconFor(f.icon)}</span> ${escapeAttribute(f.label)}</span>
            ${valueHtml}
          </div>`;
      })
      .join('');

    const aiBarActions = this._aiBarActions
      .map((label, i) => `<button data-task-ai-action="${escapeAttribute(label)}" class="font-medium text-zinc-800 underline-offset-2 hover:underline dark:text-zinc-100">${escapeAttribute(label)}</button>${i < this._aiBarActions.length - 1 ? '<span class="text-zinc-400 dark:text-zinc-500">or</span>' : ''}`)
      .join('');

    const actionsHtml = this._actions
      .map((a) => `<button data-task-action="${escapeAttribute(a.id)}" type="button" class="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800/60">
          <span aria-hidden="true" class="text-zinc-400 dark:text-zinc-500">${iconFor(a.icon)}</span> ${escapeAttribute(a.label)}
        </button>`)
      .join('');

    const activityHtml = this._activity
      .map((item) => `<div data-task-activity-item="${escapeAttribute(item.id)}" class="flex items-start justify-between gap-3 text-sm">
          <div class="min-w-0">
            <p class="text-zinc-800 dark:text-zinc-100"><span class="mr-1 text-zinc-400" aria-hidden="true">•</span>${escapeAttribute(item.actor)} ${escapeAttribute(item.text)}</p>
            <p class="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">⏱ ${escapeAttribute(item.time)}</p>
          </div>
          <span class="shrink-0 text-xs text-zinc-400 dark:text-zinc-500">${escapeAttribute(item.time)}</span>
        </div>`)
      .join('');

    this.innerHTML = `
      <div data-task-panel class="flex w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div data-task-main class="min-w-0 flex-1">
          <div data-task-header class="flex items-center justify-between border-b border-zinc-100 px-6 py-3 dark:border-zinc-800">
            <div class="flex items-center gap-3">
              <button data-task-type class="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">
                <span aria-hidden="true">◆</span> ${escapeAttribute(this._type)} <span aria-hidden="true" class="text-zinc-400">▾</span>
              </button>
            </div>
            <div class="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <span data-task-created class="hidden sm:inline">Created on Oct 21</span>
              <button data-task-ai class="flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800">✦ Ask AI</button>
              <button data-task-share class="flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800">Share</button>
            </div>
          </div>
          <div class="px-6 py-5">
            <h2 data-task-title class="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">${escapeAttribute(this._title)}</h2>
            <div data-task-ai-bar class="mt-4 flex flex-wrap items-center gap-1.5 rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300">
              <span aria-hidden="true">✦</span>
              <span>${escapeAttribute(this._aiBarText)}</span>
              ${aiBarActions}
            </div>
            <div data-task-fields class="mt-6 grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
              <div data-task-field="Status" class="flex items-center gap-3">
                <span class="flex w-36 shrink-0 items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400"><span aria-hidden="true">◎</span> Status</span>
                <button data-task-status class="flex items-center gap-1 rounded-md bg-sky-500 px-2.5 py-1 text-xs font-bold tracking-wide text-white">
                  ${escapeAttribute(this._statusLabel)} <span aria-hidden="true">▸</span>
                </button>
              </div>
              ${fieldsHtml}
            </div>
            <div data-task-description class="mt-6 border-t border-zinc-100 pt-5 dark:border-zinc-800">
              <p class="text-sm leading-6 text-zinc-700 dark:text-zinc-200">${escapeAttribute(this._description)}</p>
              <p class="mt-2 text-sm text-zinc-400 dark:text-zinc-500">Empty. Click or drag text/images inside</p>
            </div>
            <div data-task-actions class="mt-6 space-y-1">
              ${actionsHtml}
            </div>
          </div>
        </div>
        <div data-task-activity class="hidden w-72 shrink-0 flex-col border-l border-zinc-100 md:flex dark:border-zinc-800">
          <div class="flex items-center justify-between px-5 py-3.5">
            <p data-task-activity-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(this._activityTitle)}</p>
            <span class="text-sm text-zinc-400 dark:text-zinc-500">🔔 1 🔍 ≡</span>
          </div>
          <div class="flex-1 space-y-3 px-5">
            <button data-task-activity-more class="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"><span aria-hidden="true">›</span> Show more</button>
            ${activityHtml}
          </div>
          <div data-task-comment class="border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <div class="mb-2 flex gap-4 text-sm">
              <button data-task-comment-tab class="border-b-2 border-zinc-900 pb-1 font-medium text-zinc-900 dark:border-zinc-100 dark:text-zinc-50">Comment</button>
              <button data-task-comment-tab-alt class="pb-1 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">Email</button>
            </div>
            <textarea data-task-comment-input placeholder="${escapeAttribute(this._commentPlaceholder)}" rows="2" class="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600"></textarea>
            <div class="mt-2 flex items-center justify-between">
              <span class="text-sm text-zinc-400 dark:text-zinc-500">＋ ✦ @ 📎 ⋯</span>
              <button data-task-comment-send type="button" class="rounded-lg px-2 py-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200" aria-label="Send comment">➤</button>
            </div>
          </div>
        </div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('task-detail-panel')) {
  customElements.define('task-detail-panel', TaskDetailPanelElement);
}

export default TaskDetailPanelElement;
