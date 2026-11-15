/**
 * FederatedSearchResultsPanel - Vanilla Web Component
 * Usage: <federated-search results='[...]' source-filters='[...]' selected-sources='[...]'></federated-search>
 * Attributes: results (JSON [{id,title,icon?,subtitle?,snippet,source?}]), source-filters (JSON), selected-sources (JSON), query, search-placeholder, show-keyboard-legend, ask-ai-label
 * Properties: results, query
 * Events: query-change (detail {query}), source-change (detail {ids}), result-select (detail {result})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const escapeRegExp = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const LEGEND = '↑↓ Navigate · ⏎ Select · ESC Close · ⇧⏎ Open in new tab';

export class FederatedSearchResultsPanelElement extends HTMLElement {
  static get observedAttributes() {
    return ['results', 'source-filters', 'selected-sources', 'query', 'search-placeholder', 'show-keyboard-legend', 'ask-ai-label'];
  }

  constructor() {
    super();
    this._results = [];
    this._query = '';
    this._scopes = null;
    this._bound = false;
  }

  connectedCallback() {
    if (!this._results.length) {
      const raw = this.getAttribute('results');
      if (raw) {
        try { this._results = JSON.parse(raw); } catch { this._results = []; }
      }
    }
    if (!this._query) {
      this._query = this.getAttribute('query') || '';
    }
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const chip = event.target.closest('[data-source-chip]');
        if (chip) {
          const id = chip.getAttribute('data-source-chip');
          if (!this._scopes) this._scopes = new Set(this.selectedSourcesResolved());
          if (this._scopes.has(id)) this._scopes.delete(id);
          else this._scopes.add(id);
          this.render();
          this.dispatchEvent(new CustomEvent('source-change', { detail: { ids: [...this._scopes] } }));
          return;
        }
        const result = event.target.closest('[data-federated-result]');
        if (result) {
          const id = result.getAttribute('data-federated-result');
          const found = this._results.find((item) => item.id === id);
          if (found) this.dispatchEvent(new CustomEvent('result-select', { detail: { result: found } }));
        }
      });
      this.addEventListener('input', (event) => {
        const target = event.target;
        if (target && target.tagName === 'INPUT' && target.hasAttribute('data-federated-input')) {
          this._query = target.value;
          this.dispatchEvent(new CustomEvent('query-change', { detail: { query: this._query } }));
          this.render();
        }
      });
    }
  }

  attributeChangedCallback(name) {
    if (name === 'query') this._query = this.getAttribute('query') || '';
    if (name === 'selected-sources') this._scopes = null;
    this.render();
  }

  get results() {
    return this._results;
  }

  set results(value) {
    this._results = Array.isArray(value) ? value : [];
    this.render();
  }

  get query() {
    return this._query;
  }

  set query(value) {
    this._query = String(value ?? '');
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

  selectedSourcesResolved() {
    const raw = this.getAttribute('selected-sources');
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  sourceFiltersResolved() {
    const raw = this.getAttribute('source-filters');
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  scopes() {
    if (!this._scopes) this._scopes = new Set(this.selectedSourcesResolved());
    return this._scopes;
  }

  highlight(snippet) {
    if (!this._query.trim()) return escapeAttribute(snippet);
    const parts = String(snippet).split(new RegExp(`(${escapeRegExp(this._query)})`, 'gi'));
    return parts
      .map((part) =>
        part.toLowerCase() === this._query.toLowerCase()
          ? `<mark class="rounded-sm bg-yellow-200 px-0.5 font-medium text-zinc-900 dark:bg-yellow-400/70">${escapeAttribute(part)}</mark>`
          : escapeAttribute(part),
      )
      .join('');
  }

  filteredResults() {
    const scopes = this.scopes();
    return scopes.size ? this._results.filter((result) => !result.source || scopes.has(result.source)) : this._results;
  }

  render() {
    this._applyHostClass('block');
    const searchPlaceholder = this.getAttribute('search-placeholder') || 'Search everything…';
    const showLegend = this.getAttribute('show-keyboard-legend') !== 'false';
    const askAiLabel = this.getAttribute('ask-ai-label') !== null ? this.getAttribute('ask-ai-label') : 'Press Tab to Ask AI';
    const filters = this.sourceFiltersResolved();
    const scopes = this.scopes();
    const chipsHtml = filters.length
      ? `<div class="mt-2 flex flex-wrap items-center gap-1.5">${filters
          .map((filter) => {
            const active = scopes.has(filter.id);
            const chipClass = active
              ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
              : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800';
            return `<button type="button" data-source-chip="${escapeAttribute(filter.id)}" aria-pressed="${active}" class="rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${chipClass}">${escapeAttribute(filter.label)}</button>`;
          })
          .join('')}</div>`
      : '';
    const filtered = this.filteredResults();
    const listHtml = filtered.length
      ? filtered
          .map((result) => {
            const icon = result.icon ? `<span aria-hidden="true">${escapeAttribute(result.icon)}</span>` : '';
            const sourceBadge = result.source ? `<span class="shrink-0 rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">${escapeAttribute(result.source)}</span>` : '';
            const subtitle = result.subtitle ? `<span class="mt-0.5 block text-[11px] text-zinc-400 dark:text-zinc-500">${escapeAttribute(result.subtitle)}</span>` : '';
            return `<li>
              <button type="button" data-federated-result="${escapeAttribute(result.id)}" class="w-full rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-zinc-800/60">
                <span class="flex items-center gap-2">
                  ${icon}
                  <span class="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(result.title)}</span>
                  ${sourceBadge}
                </span>
                ${subtitle}
                <span class="mt-1 block text-xs leading-5 text-zinc-600 dark:text-zinc-300">${this.highlight(result.snippet)}</span>
              </button>
            </li>`;
          })
          .join('')
      : `<li data-federated-empty class="px-3 py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">No results match your filters.</li>`;
    const legendHtml = showLegend
      ? `<div class="flex items-center justify-between border-t border-zinc-100 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-800/60">
          <p data-federated-legend class="text-[11px] text-zinc-500 dark:text-zinc-400">${LEGEND}</p>
          ${askAiLabel ? `<span class="rounded-full bg-zinc-900 px-2.5 py-1 text-[11px] font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">${escapeAttribute(askAiLabel)}</span>` : ''}
        </div>`
      : '';

    this.innerHTML = `<div data-federated-search class="w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
      <div class="border-b border-zinc-100 p-3 dark:border-zinc-800">
        <div class="relative">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          <input type="text" data-federated-input value="${escapeAttribute(this._query)}" placeholder="${escapeAttribute(searchPlaceholder)}" class="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </div>
        ${chipsHtml}
      </div>
      <ul class="max-h-80 overflow-y-auto p-2">${listHtml}</ul>
      ${legendHtml}
    </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('federated-search')) {
  customElements.define('federated-search', FederatedSearchResultsPanelElement);
}

export default FederatedSearchResultsPanelElement;
