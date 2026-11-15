/**
 * AgentBuilderCard - Vanilla Web Component
 * Usage: <agent-builder-card agent-name="Support triage" run-text="Run agent"></agent-builder-card>
 * Property: nodes ([{id, label, type: trigger|tool|llm|output, status?: idle|active|done|error}])
 * Attributes: title, agent-name, run-text, running
 * Events: run, edit
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class AgentBuilderCardElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'agent-name', 'run-text', 'running'];
  }

  constructor() {
    super();
    this._nodes = [];
    this._bound = false;
  }

  connectedCallback() {
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        if (event.target.closest('[data-builder-run]')) {
          if ((this.getAttribute('running') || '') === 'true') return;
          this.dispatchEvent(new CustomEvent('run'));
          return;
        }
        if (event.target.closest('[data-builder-edit]')) {
          this.dispatchEvent(new CustomEvent('edit'));
        }
      });
    }
  }

  get nodes() { return this._nodes; }
  set nodes(v) {
    this._nodes = Array.isArray(v) ? v.map((n) => ({ ...n })) : [];
    this.render();
  }

  attributeChangedCallback() {
    // Fires before connectedCallback when an already-connected element upgrades;
    // rendering then would wipe light-DOM children before nodes are captured.
    if (this._nodes.length === 0 && this.innerHTML === '') return;
    this.render();
  }

  render() {
    const title = escapeAttribute(this.getAttribute('title') || 'Agent workflow');
    const agentName = escapeAttribute(this.getAttribute('agent-name') || 'Untitled agent');
    const runText = escapeAttribute(this.getAttribute('run-text') || 'Run agent');
    const running = this.getAttribute('running') === 'true';
    const NODE_STYLE = {
      trigger: { icon: '⚡', chip: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' },
      tool: { icon: '🔧', chip: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300' },
      llm: { icon: '🧠', chip: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300' },
      output: { icon: '📤', chip: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' },
    };
    const STATUS_DOT = {
      idle: 'bg-zinc-300 dark:bg-zinc-600',
      active: 'bg-indigo-500 animate-pulse',
      done: 'bg-emerald-500',
      error: 'bg-red-500',
    };

    const rows = this._nodes.map((node, i) => {
      const style = NODE_STYLE[node.type] || NODE_STYLE.tool;
      const last = i === this._nodes.length - 1;
      return `
        <div data-builder-node="${escapeAttribute(node.id)}" class="relative flex items-center gap-3 pb-3">
          ${last ? '' : '<span class="absolute left-[13px] top-7 h-[calc(100%-16px)] w-px bg-zinc-200 dark:bg-zinc-700" aria-hidden="true"></span>'}
          <span class="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-xs dark:border-zinc-700 dark:bg-zinc-800" aria-hidden="true">${style.icon}</span>
          <span data-builder-status="${escapeAttribute(node.status || 'idle')}" class="absolute left-[22px] top-[22px] h-2 w-2 rounded-full border border-white dark:border-zinc-900 ${STATUS_DOT[node.status || 'idle']}" aria-hidden="true"></span>
          <span class="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-lg border border-zinc-200 px-2.5 py-2 dark:border-zinc-800 ${node.status === 'active' ? 'bg-indigo-50/60 dark:bg-indigo-950/40' : ''}">
            <span class="truncate text-xs font-medium text-zinc-800 dark:text-zinc-100">${escapeAttribute(node.label)}</span>
            <span class="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${style.chip}">${escapeAttribute(node.type)}</span>
          </span>
        </div>`;
    }).join('');

    this.innerHTML = `<div data-agent-builder class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
  <div class="flex items-center justify-between">
    <div class="min-w-0">
      <p data-builder-agent-name class="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">${agentName}</p>
      <p class="text-[11px] text-zinc-500 dark:text-zinc-400">${title} · ${this._nodes.length} nodes</p>
    </div>
    <button type="button" data-builder-edit class="shrink-0 rounded-md border border-zinc-300 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-200">Edit</button>
  </div>
  <div data-builder-chain class="mt-3 space-y-0">${rows}</div>
  <button type="button" data-builder-run ${running ? 'disabled' : ''} class="mt-1 w-full rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${running ? 'cursor-wait bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' : 'bg-indigo-600 text-white hover:bg-indigo-500'}">${running ? 'Running…' : runText}</button>
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('agent-builder-card')) {
  customElements.define('agent-builder-card', AgentBuilderCardElement);
}

export default AgentBuilderCardElement;
