/**
 * AiResearchPanel - Apollo "Research with AI" slide-over: stacked research
 * template cards with Try it CTAs and a Run custom AI prompt footer action.
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

class AiResearchPanelElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'templates', 'run-label'];
  }

  constructor() {
    super();
    this._bound = false;
    this._templates = [];
  }

  connectedCallback() {
    if (!this._templates.length) {
      this._templates = parseJsonAttr(this.getAttribute('templates'), []);
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
    if (name === 'templates' && !this._templates.length) {
      this._templates = parseJsonAttr(this.getAttribute('templates'), []);
    }
    if (this._bound === false && this.innerHTML === '') return;
    this._render();
  }

  get title() {
    return this.getAttribute('title') ?? 'Research with AI';
  }
  set title(value) {
    this.setAttribute('title', value);
  }

  get runLabel() {
    return this.getAttribute('run-label') ?? 'Run custom AI prompt';
  }
  set runLabel(value) {
    this.setAttribute('run-label', value);
  }

  get templates() {
    return this._templates;
  }
  set templates(value) {
    this._templates = Array.isArray(value) ? value : [];
    this._render();
  }

  _onClick(event) {
    const run = event.target.closest('[data-research-run]');
    if (run) {
      const card = run.closest('[data-research-card]');
      const template = this._templates.find((t) => String(t.id) === card?.getAttribute('data-research-card'));
      if (template) {
        this.dispatchEvent(new CustomEvent('run', { detail: { template }, bubbles: true }));
      }
      return;
    }
    if (event.target.closest('[data-ai-research-custom]')) {
      this.dispatchEvent(new CustomEvent('run-custom', { bubbles: true }));
      return;
    }
    if (event.target.closest('[data-ai-research-close]')) {
      this.dispatchEvent(new CustomEvent('close', { bubbles: true }));
    }
  }

  _render() {
    const templates = this._templates;
    const cards = templates.length
      ? templates
          .map(
            (t) => `
        <div data-research-card="${escapeAttribute(t.id)}" class="rounded-lg border border-zinc-200 p-3 transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600">
          <p data-research-title class="text-xs font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(t.title)}</p>
          <p data-research-desc class="mt-1 line-clamp-2 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">${escapeAttribute(t.description)}</p>
          <button type="button" data-research-run class="mt-2.5 w-full rounded-md border border-zinc-200 px-2 py-1.5 text-[11px] font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">Try it</button>
        </div>`
          )
          .join('')
      : `<p data-ai-research-empty class="py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">No research templates yet.</p>`;

    this.innerHTML = `
      <aside data-ai-research-panel class="flex w-full max-w-sm flex-col rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <header class="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <h4 data-ai-research-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(this.title)}</h4>
          <button type="button" data-ai-research-close aria-label="Close research panel" class="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300">✕</button>
        </header>
        <div data-ai-research-list class="flex-1 space-y-2.5 overflow-y-auto px-4 py-3">${cards}</div>
        <footer class="border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <button type="button" data-ai-research-custom class="w-full rounded-md bg-zinc-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300">${escapeAttribute(this.runLabel)}</button>
        </footer>
      </aside>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ai-research-panel')) {
  customElements.define('ai-research-panel', AiResearchPanelElement);
}

export default AiResearchPanelElement;
