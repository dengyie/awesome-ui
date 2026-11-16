/**
 * SearchResultsPage - Knowledge-base search results page: top search bar
 * with submit, filter selects, "Related searches" chip grid and result
 * entries with title, breadcrumb meta and summary snippet (Confluence
 * search pattern).
 */
const escapeAttribute = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
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

const DEFAULT_FILTERS = () => [
  { id: 'updated', label: 'Last updated', options: ['Last updated', 'Created', 'Relevance'] },
  { id: 'type', label: 'Type', options: ['Type', 'Page', 'Blog', 'File'] },
  { id: 'contributor', label: 'Contributor', options: ['Contributor', 'Anyone', 'Me'] },
];

const DEFAULT_RELATED = () => ['brainstorming techniques', 'brainstorming ideas', 'brainstorming strategies', 'brainstorming sessions', 'brainstorming methods', 'brainstorming activities'];

const DEFAULT_RESULTS = () => [
  {
    id: 's1',
    title: 'Design',
    space: 'Confluence',
    type: 'Page',
    author: 'Design',
    updated: 'Updated 8 days ago',
    snippet: "…Welcome to your design team space! You're in the space overview. It's what visitors first see, like a landing page for your space · Click ✏️ Edit to customize your overview · A space contains pages. Create…",
  },
  {
    id: 's2',
    title: 'Sam Design Guideline Document',
    space: 'Confluence',
    type: 'Page',
    author: 'Sam Lee',
    updated: 'Updated 21 hours ago',
    snippet: '…Purpose · This document ensures visual consistency, usability, and brand alignment across all NimbusTech products and platforms. · Typography · Primary Font: Inter · Headings: Bold, sentence case · Body Text:…',
  },
  {
    id: 's3',
    title: 'Template - How-to guide',
    space: 'Confluence',
    type: 'Page',
    author: 'Sam Lee',
    updated: 'Updated 23 hours ago',
    snippet: "…Instructions · Highlight important information in a panel like this one. To edit this panel's color or style, select one of the options in the menu. · Related articles…",
  },
  {
    id: 's4',
    title: 'Template - Design Systems',
    space: 'Confluence',
    type: 'Page',
    author: 'Design',
    updated: 'Updated 8 days ago',
    snippet: '…This template is brought to you by InVision, a digital product design platform. · Design · Getting started · Design principles · Principle one · Principle two · Principle three · Visual language · Color…',
  },
  {
    id: 's5',
    title: 'Overview',
    space: 'Confluence',
    type: 'Page',
    author: 'John Smith',
    updated: 'Updated 8 days ago',
    snippet: '…Use this overview to onboard new teammates: mission, current projects, rituals and links to the most-used templates and guidelines…',
  },
];

class SearchResultsPageElement extends HTMLElement {
  static get observedAttributes() {
    return ['query', 'filter-selects', 'related-searches', 'results'];
  }

  constructor() {
    super();
    this._bound = false;
  }

  connectedCallback() {
    if (this._bound === false && this.innerHTML === '') {
      this._bound = true;
    }
    this._render();
    this.addEventListener('click', this._onClick);
    this.addEventListener('input', this._onInput);
    this.addEventListener('keydown', this._onKeydown);
    this.addEventListener('change', this._onChange);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onClick);
    this.removeEventListener('input', this._onInput);
    this.removeEventListener('keydown', this._onKeydown);
    this.removeEventListener('change', this._onChange);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (this._bound === false && this.innerHTML === '') return;
    this._render();
  }

  _onInput(event) {
    if (!event.target.closest('[data-srchres-input]')) return;
    // no re-render on typing (would lose focus); value read at submit
  }

  _onKeydown(event) {
    if (event.key !== 'Enter') return;
    const input = event.target.closest('[data-srchres-input]');
    if (!input) return;
    this.dispatchEvent(new CustomEvent('search-submit', { detail: { query: input.value }, bubbles: true }));
  }

  _onChange(event) {
    const select = event.target.closest('[data-srchres-filter]');
    if (!select) return;
    this.dispatchEvent(
      new CustomEvent('filter-change', { detail: { id: select.getAttribute('data-srchres-filter'), value: select.value }, bubbles: true })
    );
  }

  _onClick(event) {
    if (event.target.closest('[data-srchres-submit]')) {
      const input = this.querySelector('[data-srchres-input]');
      this.dispatchEvent(new CustomEvent('search-submit', { detail: { query: input ? input.value : '' }, bubbles: true }));
      return;
    }
    const chip = event.target.closest('[data-srchres-related-chip]');
    if (chip) {
      this.dispatchEvent(new CustomEvent('related-click', { detail: { term: chip.getAttribute('data-srchres-related-chip') }, bubbles: true }));
      return;
    }
    const resultBtn = event.target.closest('[data-srchres-result] button');
    if (resultBtn) {
      const article = resultBtn.closest('[data-srchres-result]');
      const results = parseJsonAttr(this.getAttribute('results'), DEFAULT_RESULTS());
      const found = results.find((r) => r.id === article.getAttribute('data-srchres-result'));
      if (found) this.dispatchEvent(new CustomEvent('result-click', { detail: { result: found }, bubbles: true }));
    }
  }

  _render() {
    const query = this.getAttribute('query') || 'brainstorming';
    const filterSelects = parseJsonAttr(this.getAttribute('filter-selects'), DEFAULT_FILTERS());
    const related = parseJsonAttr(this.getAttribute('related-searches'), DEFAULT_RELATED());
    const results = parseJsonAttr(this.getAttribute('results'), DEFAULT_RESULTS());

    const filtersHtml = filterSelects
      .map(
        (f) => `<select data-srchres-filter="${escapeAttribute(f.id)}" class="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            ${(f.options ?? [f.label]).map((o) => `<option value="${escapeAttribute(o)}">${escapeHtml(o)}</option>`).join('')}
          </select>`
      )
      .join('');

    const relatedHtml = related
      .map(
        (rs) => `<button data-srchres-related-chip="${escapeAttribute(rs)}" type="button" class="flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700">
            <span aria-hidden="true" class="text-zinc-400">⌕</span>
            <span class="truncate">${escapeHtml(rs)}</span>
          </button>`
      )
      .join('');

    const resultsHtml = results
      .map(
        (r) => `<article data-srchres-result="${escapeAttribute(r.id)}" class="group">
            <button type="button" class="block w-full text-left">
              <h3 data-srchres-result-title="${escapeAttribute(r.id)}" class="text-base font-semibold text-blue-600 group-hover:underline dark:text-blue-400">${escapeHtml(r.title)}</h3>
            </button>
            <p class="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <span data-srchres-result-space="${escapeAttribute(r.id)}" class="font-medium">${escapeHtml(r.space)}</span>
              <span aria-hidden="true">•</span>
              <span>${escapeHtml(r.type)}</span>
              <span aria-hidden="true">•</span>
              <span>${escapeHtml(r.author)}</span>
              <span aria-hidden="true">•</span>
              <span>${escapeHtml(r.updated)}</span>
            </p>
            <p class="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">${escapeHtml(r.snippet)}</p>
          </article>`
      )
      .join('');

    this.innerHTML = `
      <div data-srchres class="w-full rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div data-srchres-topbar class="flex items-center gap-3 border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
          <div class="flex flex-1 items-center gap-2 rounded-lg border border-zinc-300 px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/40 dark:border-zinc-600">
            <span aria-hidden="true" class="text-zinc-400">⌕</span>
            <input data-srchres-input type="text" value="${escapeAttribute(query)}" class="w-full bg-transparent text-sm text-zinc-800 outline-none dark:text-zinc-100" aria-label="Search" />
          </div>
          <button data-srchres-submit type="button" class="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700">Search</button>
        </div>
        <div data-srchres-filters class="flex flex-wrap items-center gap-2 border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
          ${filtersHtml}
          <span class="ml-auto text-xs text-zinc-400 dark:text-zinc-500">${results.length} results</span>
        </div>
        <div class="px-5 py-4">
          <p data-srchres-related-heading class="text-sm font-bold text-zinc-900 dark:text-zinc-50">Related searches</p>
          <div data-srchres-related class="mt-3 grid gap-2 sm:grid-cols-2">${relatedHtml}</div>
          <div data-srchres-results class="mt-6 space-y-6">${resultsHtml}</div>
        </div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('search-results-page')) {
  customElements.define('search-results-page', SearchResultsPageElement);
}

export default SearchResultsPageElement;
