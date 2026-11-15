/**
 * EvalTurnBuilder - Evaluation scenario builder: role-tagged conversation
 * turns (system / user / assistant / tool response) with per-turn mock
 * content and an add-turn footer (Vapi Evals pattern).
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

const ROLE_STYLES = {
  system: { label: 'SYSTEM', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300', icon: '>' },
  user: { label: 'USER', badge: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300', icon: '?' },
  assistant: { label: 'ASSISTANT', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300', icon: 'A' },
  tool: { label: 'TOOL RESPONSE', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300', icon: 'T' },
};

const DEFAULT_TURNS = () => [
  {
    id: 't1',
    role: 'system',
    turn: 0,
    content: '# Appointment Scheduling Agent Prompt\n\nYou are Riley, an appointment scheduling voice assistant for Wellness Partners, a multi-specialty health clinic.',
    mock: false,
  },
  { id: 't2', role: 'user', turn: 1, content: 'Hi, can I reschedule my appointment to another time this week?', mock: true },
  { id: 't3', role: 'assistant', turn: 2, content: 'Sure, I can help with that. What day and time would you like to reschedule your appointment to?', mock: true },
  { id: 't4', role: 'tool', turn: 3, content: 'reschedule_appointment \u2192 { "status": "success", "new_time": "Thursday at 2 PM" }', mock: true },
];

class EvalTurnBuilderElement extends HTMLElement {
  static get observedAttributes() {
    return ['turns'];
  }

  constructor() {
    super();
    this._bound = false;
    this._turns = [];
  }

  connectedCallback() {
    if (!this._turns.length) {
      this._turns = parseJsonAttr(this.getAttribute('turns'), DEFAULT_TURNS());
    }
    if (this._bound === false && this.innerHTML === '') {
      this._bound = true;
    }
    this._render();
    this.addEventListener('click', this._onClick);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onClick);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'turns' && !this._turns.length) {
      this._turns = parseJsonAttr(newValue, []);
    }
    if (this._bound === false && this.innerHTML === '') return;
    this._render();
  }

  get turns() { return this._turns; }
  set turns(value) {
    this._turns = Array.isArray(value) ? value : [];
    this._render();
  }

  _onClick(event) {
    const removeEl = event.target.closest('[data-eval-turn-remove]');
    if (removeEl) {
      const turnEl = removeEl.closest('[data-eval-turn]');
      const turn = this._turns.find((t) => t.id === turnEl?.getAttribute('data-eval-turn'));
      if (turn) {
        this._turns = this._turns.filter((t) => t.id !== turn.id);
        this._render();
        this.dispatchEvent(new CustomEvent('turn-remove', { detail: { turn }, bubbles: true }));
      }
      return;
    }
    const addEl = event.target.closest('[data-eval-add-turn]');
    if (addEl) {
      const role = addEl.getAttribute('data-eval-add-turn');
      this.dispatchEvent(new CustomEvent('add-turn', { detail: { role }, bubbles: true }));
    }
  }

  _render() {
    const turnsHtml = this._turns
      .map((t) => {
        const style = ROLE_STYLES[t.role] || ROLE_STYLES.user;
        return `
        <div data-eval-turn="${escapeAttribute(t.id)}" data-eval-role="${escapeAttribute(t.role)}" class="p-4">
          <div class="mb-2 flex items-center justify-between gap-2">
            <span class="flex items-center gap-2">
              <span data-eval-turn-badge="${escapeAttribute(t.role)}" class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider ${style.badge}"><span aria-hidden="true">${style.icon}</span> ${style.label}</span>
              ${t.mock ? '<span data-eval-turn-mock class="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">Mock</span>' : ''}
            </span>
            <span class="flex items-center gap-2">
              ${t.turn > 0 ? `<span data-eval-turn-number class="text-[10px] text-zinc-400 dark:text-zinc-500">Turn ${t.turn}</span>` : ''}
              <button type="button" data-eval-turn-remove aria-label="Remove ${style.label.toLowerCase()} turn" class="text-zinc-300 transition-colors hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400">✕</button>
            </span>
          </div>
          <pre data-eval-turn-content class="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-xs leading-relaxed text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">${escapeAttribute(t.content)}</pre>
        </div>`;
      })
      .join('');

    const addLabels = { user: 'User', assistant: 'Assistant', tool: 'Tool Response' };
    const addHtml = Object.entries(addLabels)
      .map(
        ([role, label]) => `
        <button type="button" data-eval-add-turn="${role}" class="py-2.5 text-center text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">+ Add ${label}</button>`
      )
      .join('');

    this.innerHTML = `
      <div data-eval-turn-builder class="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div data-eval-turns class="divide-y divide-zinc-100 dark:divide-zinc-800">${turnsHtml}</div>
        <div data-eval-turn-add class="grid grid-cols-3 divide-x divide-zinc-100 border-t border-zinc-100 dark:divide-zinc-800 dark:border-zinc-800">${addHtml}</div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('eval-turn-builder')) {
  customElements.define('eval-turn-builder', EvalTurnBuilderElement);
}

export default EvalTurnBuilderElement;
