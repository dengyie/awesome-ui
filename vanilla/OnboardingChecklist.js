import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class OnboardingChecklistElement extends HTMLElement {
  static get observedAttributes() {
    return ['tasks', 'title'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  get tasks() {
    if (this._tasks) return this._tasks;
    try {
      return JSON.parse(this.getAttribute('tasks') || '[]');
    } catch {
      return [];
    }
  }

  set tasks(value) {
    this._tasks = Array.isArray(value) ? value : [];
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
    const tasks = this.tasks;
    const title = this.getAttribute('title') || 'Get started';
    const total = tasks.length;
    const doneCount = tasks.filter((task) => task.done).length;
    const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100);
    const allDone = total > 0 && doneCount === total;

    this._applyHostClass('block');

    const items = tasks
      .map(
        (task) => `
        <li class="flex items-start gap-3 px-4 py-3">
          <button type="button" data-toggle="${escapeAttribute(task.id)}" aria-pressed="${task.done}"
            aria-label="${task.done ? `Mark ${escapeAttribute(task.title)} as not done` : `Mark ${escapeAttribute(task.title)} as done`}"
            class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              task.done
                ? 'border-emerald-500 bg-emerald-500 text-white'
                : 'border-zinc-300 dark:border-zinc-600 text-transparent hover:border-indigo-500'
            }">${uiIcon('check', { size: 10 })}</button>
          <div class="min-w-0 flex-1">
            <div class="text-xs ${task.done ? 'text-zinc-400 dark:text-zinc-500 line-through' : 'text-zinc-800 dark:text-zinc-200'}">${escapeAttribute(task.title)}</div>
            ${task.description ? `<div class="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">${escapeAttribute(task.description)}</div>` : ''}
          </div>
          ${
            !task.done && task.actionText
              ? `<button type="button" data-action="${escapeAttribute(task.id)}" class="shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">${escapeAttribute(task.actionText)}</button>`
              : ''
          }
        </li>`
      )
      .join('');

    this.innerHTML = `
      <div class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div class="border-b border-zinc-100 dark:border-zinc-800 px-4 py-3">
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-zinc-900 dark:text-zinc-100">${escapeAttribute(title)}</span>
            <span class="ml-auto text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">${doneCount}/${total}</span>
          </div>
          <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div class="h-full rounded-full bg-indigo-600 transition-all duration-300" style="width: ${percent}%"></div>
          </div>
          <div class="mt-2 flex items-center gap-1.5 text-[11px]">
            ${
              allDone
                ? `<span class="text-emerald-500">${uiIcon('check-circle', { size: 12 })}</span><span class="text-emerald-600 dark:text-emerald-400">All set — nothing left to do.</span>`
                : `<span class="text-zinc-500 dark:text-zinc-400">${percent}% complete · ${total - doneCount} left</span>`
            }
          </div>
        </div>
        <ul class="divide-y divide-zinc-100 dark:divide-zinc-800">${items}</ul>
      </div>`;

    this.querySelectorAll('[data-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const task = tasks.find((entry) => entry.id === btn.getAttribute('data-toggle'));
        this.dispatchEvent(new CustomEvent('toggle', { detail: task }));
      });
    });

    this.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const task = tasks.find((entry) => entry.id === btn.getAttribute('data-action'));
        this.dispatchEvent(new CustomEvent('action', { detail: task }));
      });
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('onboarding-checklist')) {
  customElements.define('onboarding-checklist', OnboardingChecklistElement);
}
export default OnboardingChecklistElement;
