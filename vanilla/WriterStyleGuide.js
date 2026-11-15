/**
 * WriterStyleGuide - Writer term/style guide card: company / team / my tabs,
 * guide entry rows with number, title, description and reading time.
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

class WriterStyleGuideElement extends HTMLElement {
  static get observedAttributes() {
    return ['entries', 'active-tab'];
  }

  constructor() {
    super();
    this._bound = false;
    this._entries = [];
    this._activeTab = 'company';
  }

  connectedCallback() {
    if (!this._entries.length) {
      this._entries = parseJsonAttr(this.getAttribute('entries'), [
        { id: 'g1', title: "Don't use passive voice", description: 'It dilutes meaning and bloats sentences.', minutes: 3 },
        { id: 'g2', title: 'Use contracted forms', description: 'Write "can\'t" instead of "cannot" for a friendly tone.', minutes: 2 },
        { id: 'g3', title: 'Upper Kebab case for products', description: 'Product names use Upper Kebab case.', minutes: 4 },
      ]);
    }
    const tabAttr = this.getAttribute('active-tab');
    if (tabAttr) {
      this._activeTab = tabAttr;
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
    if (name === 'entries' && !this._entries.length) {
      this._entries = parseJsonAttr(this.getAttribute('entries'), []);
    }
    if (name === 'active-tab' && newValue) {
      this._activeTab = newValue;
    }
    if (this._bound === false && this.innerHTML === '') return;
    this._render();
  }

  get entries() {
    return this._entries;
  }
  set entries(value) {
    this._entries = Array.isArray(value) ? value : [];
    this._render();
  }

  get activeTab() {
    return this._activeTab;
  }
  set activeTab(value) {
    this._activeTab = value === 'team' || value === 'my' ? value : 'company';
    this.setAttribute('active-tab', this._activeTab);
    this._render();
  }

  _onClick(event) {
    const tabEl = event.target.closest('[data-writer-tab]');
    if (tabEl) {
      this.activeTab = tabEl.getAttribute('data-writer-tab');
      this.dispatchEvent(new CustomEvent('tab-change', { detail: { tab: this._activeTab }, bubbles: true }));
      return;
    }
    const entryEl = event.target.closest('[data-writer-entry]');
    if (entryEl) {
      const entry = this._entries.find((e) => String(e.id) === entryEl.getAttribute('data-writer-entry'));
      if (entry) {
        this.dispatchEvent(new CustomEvent('entry-click', { detail: { entry }, bubbles: true }));
      }
    }
  }

  _render() {
    const tabs = [
      { id: 'company', label: 'Company' },
      { id: 'team', label: 'Team' },
      { id: 'my', label: 'My' },
    ];
    const tabHtml = tabs
      .map(
        (tab) => `
        <button type="button" data-writer-tab="${tab.id}" class="rounded-t-md px-3 py-2 text-xs font-medium transition-colors ${this._activeTab === tab.id ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-b-2 border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}">${tab.label}</button>`
      )
      .join('');
    const entriesHtml = this._entries
      .map(
        (entry, index) => `
        <button type="button" data-writer-entry="${escapeAttribute(entry.id)}" class="flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800">
          <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">${index + 1}</span>
          <span class="min-w-0 flex-1">
            <span data-writer-entry-title class="block text-xs font-medium text-zinc-900 dark:text-zinc-50">${escapeAttribute(entry.title)}</span>
            <span data-writer-entry-desc class="mt-0.5 block text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">${escapeAttribute(entry.description)}</span>
          </span>
          <span data-writer-entry-minutes class="shrink-0 text-[10px] font-medium text-zinc-400 dark:text-zinc-500">${escapeAttribute(entry.minutes)} min</span>
        </button>`
      )
      .join('');

    this.innerHTML = `
      <div data-writer-style-guide class="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div data-writer-tabs class="flex items-center gap-1 border-b border-zinc-200 px-4 pt-3 dark:border-zinc-800">${tabHtml}</div>
        <div class="p-4">
          <div data-writer-entries class="space-y-3">${entriesHtml}</div>
          <button type="button" data-writer-add class="mt-3 w-full rounded-lg border border-dashed border-zinc-300 py-2 text-xs font-medium text-zinc-500 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-indigo-700 dark:hover:text-indigo-400">+ Add guideline</button>
        </div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('writer-style-guide')) {
  customElements.define('writer-style-guide', WriterStyleGuideElement);
}

export default WriterStyleGuideElement;
