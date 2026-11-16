/**
 * PromptTunerResult - Prompt tuner output: an "optimized prompt" dark code
 * panel with copy action, a completion selector and the completion text
 * viewer (Cohere Prompt Tuner pattern).
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

const DEFAULT_COMPLETIONS = () => [
  {
    id: 'c1',
    label: 'Completion #1',
    text: "I have reviewed the comments left by John's colleagues and can report that his performance has been very well received by his team. Overall, John is regarded as a great team player, who is both knowledgeable and a strong communicator, particularly when it comes to offering advice and guidance to more junior members of the team.",
  },
  {
    id: 'c2',
    label: 'Completion #2',
    text: "John's colleagues describe him as a knowledgeable, communicative engineer who consistently supports newer team members. The main improvement area flagged across reviews is proactive outreach — teammates note that projects move faster when John initiates status updates himself.",
  },
];

class PromptTunerResultElement extends HTMLElement {
  static get observedAttributes() {
    return ['completions', 'active-completion', 'optimized-prompt'];
  }

  constructor() {
    super();
    this._bound = false;
    this._completions = [];
    this._activeId = 'c1';
    this._prompt = 'Your optimized prompt will appear here.';
  }

  connectedCallback() {
    if (!this._completions.length) this._completions = parseJsonAttr(this.getAttribute('completions'), DEFAULT_COMPLETIONS());
    const ac = this.getAttribute('active-completion');
    if (ac) this._activeId = ac;
    const op = this.getAttribute('optimized-prompt');
    if (op) this._prompt = op;
    if (this._bound === false && this.innerHTML === '') {
      this._bound = true;
    }
    this._render();
    this.addEventListener('click', this._onClick);
    this.addEventListener('change', this._onChange);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onClick);
    this.removeEventListener('change', this._onChange);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (this._bound === false && this.innerHTML === '') return;
    if (name === 'completions' && !this._completions.length) this._completions = parseJsonAttr(newValue, []);
    if (name === 'active-completion') this._activeId = newValue || 'c1';
    if (name === 'optimized-prompt') this._prompt = newValue ?? '';
    this._render();
  }

  get completions() { return this._completions; }
  set completions(value) { this._completions = Array.isArray(value) ? value : []; this._render(); }

  get activeCompletion() { return this._activeId; }
  set activeCompletion(value) { this._activeId = String(value); this._render(); }

  _onClick(event) {
    if (event.target.closest('[data-tuner-copy]')) {
      this.dispatchEvent(new CustomEvent('copy-prompt', { bubbles: true }));
    }
  }

  _onChange(event) {
    const select = event.target.closest('[data-tuner-completion-select]');
    if (!select) return;
    this._activeId = select.value;
    this._render();
    const completion = this._completions.find((c) => c.id === this._activeId);
    if (completion) {
      this.dispatchEvent(new CustomEvent('completion-change', { detail: { completion }, bubbles: true }));
    }
  }

  _render() {
    const optionsHtml = this._completions
      .map(
        (completion) => `<option value="${escapeAttribute(completion.id)}" ${completion.id === this._activeId ? 'selected' : ''}>${escapeAttribute(completion.label)}</option>`
      )
      .join('');
    const active = this._completions.find((c) => c.id === this._activeId) ?? this._completions[0];

    this.innerHTML = `
      <div data-prompt-tuner class="w-full space-y-3">
        <div data-tuner-prompt-panel class="overflow-hidden rounded-xl bg-zinc-900 shadow-sm dark:bg-zinc-950 dark:ring-1 dark:ring-zinc-800">
          <div class="flex items-center justify-between gap-2 px-4 pb-2 pt-3">
            <p data-tuner-prompt-label class="font-mono text-[11px] font-semibold tracking-wider text-zinc-400">OPTIMIZED PROMPT</p>
            <button type="button" data-tuner-copy class="inline-flex items-center gap-1 rounded-md border border-zinc-700 px-2 py-1 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-zinc-800"><span aria-hidden="true">⧉</span> Copy</button>
          </div>
          <pre data-tuner-prompt-text class="max-h-48 overflow-y-auto px-4 pb-4 font-mono text-xs leading-relaxed text-zinc-100">${escapeAttribute(this._prompt)}</pre>
        </div>
        <div data-tuner-completions class="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div data-tuner-completions-header class="flex items-center justify-between gap-2 border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
            <p data-tuner-completions-label class="font-mono text-[11px] font-semibold tracking-wider text-zinc-500 dark:text-zinc-400">COMPLETIONS</p>
            <select data-tuner-completion-select class="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">${optionsHtml}</select>
          </div>
          <p data-tuner-completion-text class="whitespace-pre-wrap px-4 py-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">${escapeAttribute(active?.text ?? '')}</p>
        </div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('prompt-tuner-result')) {
  customElements.define('prompt-tuner-result', PromptTunerResultElement);
}

export default PromptTunerResultElement;
