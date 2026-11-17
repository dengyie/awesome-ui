/**
 * NoResultsState - Search no-results empty state: illustration slot, the
 * original query in quotes, suggestion chips that re-run the search and a
 * clear-filters ghost action (search zero-results pattern).
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

class NoResultsStateElement extends HTMLElement {
  static get observedAttributes() {
    return ['query', 'suggestions', 'clear-label', 'did-you-mean-label'];
  }

  constructor() {
    super();
    this._query = '';
    this._suggestions = [];
    this._clearLabel = 'Clear all filters';
    this._didYouMeanLabel = 'Did you mean';
    this._onClick = this._onClick.bind(this);
  }

  connectedCallback() {
    const q = this.getAttribute('query');
    if (q !== null) this._query = q;
    this._suggestions = parseJsonAttr(this.getAttribute('suggestions'), []);
    const c = this.getAttribute('clear-label');
    if (c) this._clearLabel = c;
    const d = this.getAttribute('did-you-mean-label');
    if (d) this._didYouMeanLabel = d;
    this._render();
    this.addEventListener('click', this._onClick);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onClick);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'query') this._query = newValue ?? '';
    if (name === 'suggestions') this._suggestions = parseJsonAttr(newValue, []);
    if (name === 'clear-label') this._clearLabel = newValue || 'Clear all filters';
    if (name === 'did-you-mean-label') this._didYouMeanLabel = newValue || 'Did you mean';
    this._render();
  }

  get suggestions() { return this._suggestions; }
  set suggestions(value) { this._suggestions = Array.isArray(value) ? value : []; this._render(); }

  _onClick(event) {
    const chip = event.target.closest('[data-noresults-suggestion]');
    if (chip) {
      this.dispatchEvent(new CustomEvent('suggestion', { detail: { suggestion: chip.getAttribute('data-noresults-suggestion') }, bubbles: true }));
      return;
    }
    if (event.target.closest('[data-noresults-clear]')) {
      this.dispatchEvent(new CustomEvent('clear-filters', { bubbles: true }));
    }
  }

  _render() {
    const suggestions = Array.isArray(this._suggestions) ? this._suggestions : [];
    const slotted = this.querySelector('[data-noresults-illustration-slot]');
    const slotHtml = slotted ? slotted.outerHTML : `<div data-noresults-illustration aria-hidden="true" class="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-3xl dark:bg-zinc-800">🔍</div>`;

    const queryHtml = this._query
      ? ` <span data-noresults-query class="font-mono text-zinc-700 dark:text-zinc-200">“${escapeAttribute(this._query)}”</span>`
      : '';

    const suggestionsHtml = suggestions.length
      ? `<div data-noresults-suggestions class="flex flex-wrap items-center justify-center gap-2">
          <span class="text-xs text-zinc-400 dark:text-zinc-500">${escapeAttribute(this._didYouMeanLabel)}</span>
          ${suggestions.map((s) => `<button type="button" data-noresults-suggestion="${escapeAttribute(s)}" class="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:border-violet-300 hover:text-violet-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-violet-700 dark:hover:text-violet-400">${escapeAttribute(s)}</button>`).join('')}
        </div>`
      : '';

    this.innerHTML = `
      <div data-noresults-state class="flex w-full flex-col items-center justify-center gap-4 rounded-xl border border-zinc-200 bg-white px-6 py-14 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        ${slotHtml}
        <div class="space-y-1.5">
          <p data-noresults-title class="text-base font-semibold text-zinc-900 dark:text-zinc-50">No results for${queryHtml}</p>
          <p data-noresults-description class="mx-auto max-w-md text-sm leading-5 text-zinc-500 dark:text-zinc-400">Try a different keyword or remove some filters to widen your search.</p>
        </div>
        ${suggestionsHtml}
        <button type="button" data-noresults-clear class="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">${escapeAttribute(this._clearLabel)}</button>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('no-results-state')) {
  customElements.define('no-results-state', NoResultsStateElement);
}

export default NoResultsStateElement;
