import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class WorkspaceSetupPanelElement extends HTMLElement {
  static get observedAttributes() {
    return ['sections', 'up-next', 'title'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  get sections() {
    if (this._sections) return this._sections;
    try {
      return JSON.parse(this.getAttribute('sections') || '[]');
    } catch {
      return [];
    }
  }

  set sections(value) {
    this._sections = Array.isArray(value) ? value : [];
    this.render();
  }

  get upNext() {
    if (this._upNext) return this._upNext;
    try {
      return JSON.parse(this.getAttribute('up-next') || '[]');
    } catch {
      return [];
    }
  }

  set upNext(value) {
    this._upNext = Array.isArray(value) ? value : [];
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
    const sections = this.sections;
    const upNext = this.upNext;
    const title = this.getAttribute('title') || 'Workspace setup';

    const total = sections.reduce((sum, s) => sum + s.tasks.length, 0);
    const done = sections.reduce((sum, s) => sum + s.tasks.filter((t) => t.done).length, 0);
    const allDone = total > 0 && done === total;

    this._applyHostClass('block');

    const sectionBlocks = sections
      .map((section) => {
        const sectionDone = section.tasks.filter((t) => t.done).length;
        const tasks = section.tasks
          .map(
            (task) => `
          <li data-workspace-setup-task="${escapeAttribute(task.id)}">
            <button type="button" data-task-id="${escapeAttribute(task.id)}" data-section-id="${escapeAttribute(section.id)}"
              class="flex w-full items-center gap-2 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
              <span class="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${
                task.done
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : 'border-zinc-300 dark:border-zinc-600'
              }">${task.done ? uiIcon('check', { size: 8 }) : ''}</span>
              <span class="min-w-0 flex-1 truncate text-xs ${task.done ? 'text-zinc-400 dark:text-zinc-500 line-through' : 'text-zinc-700 dark:text-zinc-200'}">${escapeAttribute(task.label)}</span>
              ${task.done ? '' : uiIcon('arrow-right', { size: 12, className: 'shrink-0 text-zinc-300 dark:text-zinc-600' })}
            </button>
          </li>`
          )
          .join('');
        return `
        <div data-workspace-setup-section="${escapeAttribute(section.id)}" class="px-5 py-4">
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-zinc-900 dark:text-zinc-100">${escapeAttribute(section.title)}</span>
            <span data-workspace-setup-section-count="${escapeAttribute(section.id)}" class="rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums ${
              sectionDone === section.tasks.length
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
            }">${sectionDone}/${section.tasks.length}</span>
          </div>
          <ul class="mt-2 space-y-1.5">${tasks}</ul>
        </div>`;
      })
      .join('');

    const upNextBlock =
      upNext.length > 0
        ? `
        <div class="border-t border-zinc-100 dark:border-zinc-800 px-5 py-4">
          <div class="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Up next</div>
          <div data-workspace-setup-up-next class="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
            ${upNext
              .map(
                (card) => `
              <button type="button" data-workspace-setup-next-card="${escapeAttribute(card.id)}"
                class="rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2.5 text-left transition-colors hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                <div class="text-xs font-medium text-zinc-800 dark:text-zinc-200">${escapeAttribute(card.title)}</div>
                ${card.description ? `<div class="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">${escapeAttribute(card.description)}</div>` : ''}
              </button>`
              )
              .join('')}
          </div>
        </div>`
        : '';

    this.innerHTML = `
      <div data-workspace-setup class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div class="border-b border-zinc-100 dark:border-zinc-800 px-5 py-4">
          <h4 data-workspace-setup-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(title)}</h4>
          <p data-workspace-setup-count class="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">${allDone ? 'All steps complete — your workspace is ready.' : `${done} of ${total} steps complete`}</p>
        </div>
        <div class="divide-y divide-zinc-100 dark:divide-zinc-800">${sectionBlocks}</div>
        ${upNextBlock}
      </div>`;

    this.querySelectorAll('[data-task-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const section = sections.find((s) => s.id === btn.getAttribute('data-section-id'));
        const task = section && section.tasks.find((t) => t.id === btn.getAttribute('data-task-id'));
        if (section && task) this.dispatchEvent(new CustomEvent('task-click', { detail: { section, task } }));
      });
    });

    this.querySelectorAll('[data-workspace-setup-next-card]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const card = upNext.find((c) => c.id === btn.getAttribute('data-workspace-setup-next-card'));
        if (card) this.dispatchEvent(new CustomEvent('up-next', { detail: card }));
      });
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('workspace-setup-panel')) {
  customElements.define('workspace-setup-panel', WorkspaceSetupPanelElement);
}
export default WorkspaceSetupPanelElement;
