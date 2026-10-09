import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const STATUS_ICON = {
  pending: { icon: 'square', cls: 'text-zinc-300 dark:text-zinc-600' },
  active: { icon: 'loader', cls: 'text-indigo-500 animate-spin' },
  done: { icon: 'check-circle', cls: 'text-emerald-500' },
};

export class AgentTaskChecklistElement extends HTMLElement {
  static get observedAttributes() {
    return ['title'];
  }

  constructor() {
    super();
    this._items = [];
  }

  get items() {
    return this._items;
  }

  set items(val) {
    this._items = Array.isArray(val) ? val : [];
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  _applyHostClass(layoutClass) {
    const prev = this._appliedLayout || '';
    let user = this.className || '';
    if (prev && user.startsWith(prev)) user = user.slice(prev.length).trim();
    this._appliedLayout = layoutClass;
    const next = `${layoutClass}${user ? ` ${user}` : ''}`;
    if (this.className !== next) this.className = next;
  }

  render() {
    const title = this.getAttribute('title') || 'Tasks';
    const doneCount = this._items.filter((i) => i.status === 'done').length;

    const itemsHtml = this._items
      .map((item) => {
        const meta = STATUS_ICON[item.status] || STATUS_ICON.pending;
        const isDone = item.status === 'done';
        return `
          <li>
            <div
              role="button"
              tabindex="0"
              data-task-id="${escapeAttribute(item.id)}"
              class="task-item flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/60 ${
                isDone ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-700 dark:text-zinc-300'
              }"
            >
              ${uiIcon(meta.icon, { size: 15, className: `shrink-0 ${meta.cls}` })}
              <span class="flex-1 min-w-0 truncate ${isDone ? 'line-through' : ''}">${escapeAttribute(item.label)}</span>
            </div>
          </li>`;
      })
      .join('');

    this._applyHostClass('block rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden');
    this.innerHTML = `
      <div class="flex items-center gap-2 px-3.5 py-2.5 border-b border-zinc-100 dark:border-zinc-800 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
        ${uiIcon('layers', { size: 14, className: 'text-zinc-400' })}
        ${escapeAttribute(title)}
        <span class="ml-auto text-[11px] font-mono font-normal text-zinc-400">${doneCount}/${this._items.length}</span>
      </div>
      <ul class="p-1.5 space-y-0.5">${itemsHtml}</ul>`;

    this.querySelectorAll('.task-item').forEach((row) => {
      const id = row.getAttribute('data-task-id');
      const item = this._items.find((t) => String(t.id) === String(id));
      if (!item) return;
      const toggle = () => this.dispatchEvent(new CustomEvent('toggle', { detail: { id: item.id } }));
      row.addEventListener('click', toggle);
      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('agent-task-checklist')) {
  customElements.define('agent-task-checklist', AgentTaskChecklistElement);
}
export default AgentTaskChecklistElement;
