import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const statusIcon = (status) =>
  status === 'running' ? 'loader' : status === 'done' ? 'check-circle' : status === 'error' ? 'circle-x' : 'clock';

const statusClass = (status) =>
  status === 'running'
    ? 'animate-spin text-indigo-500'
    : status === 'done'
      ? 'text-emerald-500'
      : status === 'error'
        ? 'text-red-500'
        : 'text-zinc-400 dark:text-zinc-500';

const formatDuration = (ms) => (typeof ms !== 'number' ? '' : ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`);

export class AgentRunLogElement extends HTMLElement {
  static get observedAttributes() {
    return ['steps', 'title', 'auto-expand-running'];
  }

  constructor() {
    super();
    this._steps = [];
    this._expanded = new Set();
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  get steps() {
    if (this._steps.length) return this._steps;
    try {
      return JSON.parse(this.getAttribute('steps') || '[]');
    } catch {
      return [];
    }
  }

  set steps(value) {
    this._steps = Array.isArray(value) ? value : [];
    const auto = this.getAttribute('auto-expand-running') !== 'false';
    this._expanded = new Set(
      auto ? this._steps.filter((s) => s.status === 'running' && s.detail).map((s) => s.id) : []
    );
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
    const steps = this.steps;
    const title = this.getAttribute('title') || 'Execution log';
    const doneCount = steps.filter((s) => s.status === 'done').length;

    this._applyHostClass('rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900');

    const items = steps
      .map((step, index) => {
        const isLast = index === steps.length - 1;
        const isOpen = this._expanded.has(step.id);
        return `
          <li class="relative pl-6">
            ${isLast ? '' : '<span aria-hidden="true" class="absolute left-[6px] top-5 bottom-0 w-px bg-zinc-200 dark:bg-zinc-700"></span>'}
            <span class="absolute left-0 top-1 ${statusClass(step.status)}">${uiIcon(statusIcon(step.status), { size: 14 })}</span>
            <div class="pb-3">
              <button type="button" data-step="${escapeAttribute(step.id)}" ${step.detail ? `aria-expanded="${isOpen}"` : ''} class="flex w-full items-center gap-2 text-left ${step.detail ? 'cursor-pointer' : 'cursor-default'}">
                <span class="text-xs ${step.status === 'pending' ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-700 dark:text-zinc-200'}">${escapeAttribute(step.label)}</span>
                ${step.durationMs !== undefined ? `<span class="text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">${formatDuration(step.durationMs)}</span>` : ''}
                ${step.detail ? `<span class="ml-auto text-zinc-400 dark:text-zinc-500">${uiIcon(isOpen ? 'chevron-up' : 'chevron-down', { size: 12 })}</span>` : ''}
              </button>
              ${step.detail && isOpen ? `<pre class="mt-2 max-h-48 overflow-auto rounded-lg bg-zinc-950 px-3 py-2 font-mono text-[11px] leading-relaxed text-zinc-300">${escapeAttribute(step.detail)}</pre>` : ''}
            </div>
          </li>`;
      })
      .join('');

    this.innerHTML = `
      <div class="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 px-4 py-2.5">
        <span class="text-zinc-400 dark:text-zinc-500">${uiIcon('terminal', { size: 14 })}</span>
        <span class="text-xs font-medium text-zinc-700 dark:text-zinc-200">${escapeAttribute(title)}</span>
        <span class="ml-auto text-[11px] text-zinc-400 dark:text-zinc-500">${doneCount}/${steps.length}</span>
      </div>
      <ol class="px-4 py-3">${items}</ol>`;

    this.querySelectorAll('[data-step]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-step');
        const step = steps.find((s) => s.id === id);
        if (!step?.detail) return;
        this._expanded.has(id) ? this._expanded.delete(id) : this._expanded.add(id);
        this.dispatchEvent(new CustomEvent('toggle', { detail: { id, expanded: this._expanded.has(id) } }));
        this.render();
      });
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('agent-run-log')) {
  customElements.define('agent-run-log', AgentRunLogElement);
}
export default AgentRunLogElement;
