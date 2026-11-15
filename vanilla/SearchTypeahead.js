/**
 * SearchTypeahead - Vanilla Web Component
 * Usage: <search-typeahead query="web dev" placeholder="Search…" highlight="web dev" results-heading="Top results" footer-hint="Not sure where to begin? Take our quiz →"></search-typeahead>
 * Properties: suggestions ({ label, type?, meta? }[]), results ({ title, badge? }[])
 * Attributes: query, placeholder, highlight, results-heading, footer-hint
 * Events: select (detail {label}), submit (detail {query})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export class SearchTypeaheadElement extends HTMLElement {
  static get observedAttributes() {
    return ['query', 'placeholder', 'highlight', 'results-heading', 'footer-hint'];
  }

  constructor() {
    super();
    this._suggestions = [];
    this._results = [];
  }

  get suggestions() {
    return this._suggestions;
  }

  set suggestions(value) {
    this._suggestions = Array.isArray(value) ? value : [];
    this.render();
  }

  get results() {
    return this._results;
  }

  set results(value) {
    this._results = Array.isArray(value) ? value : [];
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
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

  _markMatches(label) {
    const highlight = (this.getAttribute('highlight') || '').trim();
    if (!highlight) return escapeAttribute(label);
    return label
      .split(new RegExp(`(${escapeRegExp(highlight)})`, 'ig'))
      .map((part) =>
        part.toLowerCase() === highlight.toLowerCase()
          ? `<mark class="rounded-sm bg-yellow-200 px-0.5 text-zinc-900 dark:bg-yellow-400/70">${escapeAttribute(part)}</mark>`
          : escapeAttribute(part),
      )
      .join('');
  }

  render() {
    this._applyHostClass('block');
    const query = this.getAttribute('query') || '';
    const placeholder = this.getAttribute('placeholder') || 'Search…';
    const resultsHeading = this.getAttribute('results-heading') || 'Top results';
    const footerHint = this.getAttribute('footer-hint') || '';

    const searchIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0 text-zinc-400"><circle cx="11" cy="11" r="7"/><path d="m21 21-4-4"/></svg>';
    const clearIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4"><path d="M18 6 6 18M6 6l12 12"/></svg>';

    const suggestionHtml = this._suggestions.length
      ? `<ul class="mt-3 space-y-1" data-typeahead-suggestions>
          ${this._suggestions
            .map(
              (suggestion, index) => `<li>
                <button type="button" data-typeahead-suggestion="${index}" class="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-zinc-200 dark:hover:bg-zinc-800">
                  ${searchIcon.replace('class="shrink-0', 'class="h-3.5 w-3.5 shrink-0')}
                  <span class="min-w-0 truncate">${this._markMatches(suggestion.label)}</span>
                  ${suggestion.type ? `<span class="ml-auto shrink-0 rounded-md border border-zinc-300 px-1.5 py-0.5 font-mono text-[10px] font-medium text-zinc-500 dark:border-zinc-600 dark:text-zinc-400">${escapeAttribute(suggestion.type)}</span>` : ''}
                </button>
              </li>`,
            )
            .join('')}
        </ul>`
      : '';

    const resultsHtml = this._results.length
      ? `<div class="mt-5" data-typeahead-results>
          <p class="text-sm font-bold text-zinc-900 dark:text-zinc-50">${escapeAttribute(resultsHeading)}</p>
          <ul class="mt-2 divide-y divide-zinc-100 dark:divide-zinc-800">
            ${this._results
              .map(
                (result, index) => `<li class="flex items-center gap-3 py-2.5">
                  <button type="button" data-typeahead-result="${index}" class="min-w-0 flex-1 truncate text-left text-sm font-medium text-zinc-800 transition-colors hover:text-indigo-600 focus-visible:outline-none dark:text-zinc-100 dark:hover:text-indigo-400">${this._markMatches(result.title)}</button>
                  ${result.badge ? `<span class="shrink-0 rounded-md border border-zinc-300 px-1.5 py-0.5 font-mono text-[10px] font-medium text-zinc-500 dark:border-zinc-600 dark:text-zinc-400">${escapeAttribute(result.badge)}</span>` : ''}
                </li>`,
              )
              .join('')}
          </ul>
        </div>`
      : '';

    this.innerHTML = `<div data-search-typeahead class="w-full">
      <div class="flex items-center gap-3 border-b border-zinc-200 pb-3 dark:border-zinc-700">
        ${searchIcon.replace('class="shrink-0', 'class="h-5 w-5 shrink-0')}
        <input type="text" value="${escapeAttribute(query)}" placeholder="${escapeAttribute(placeholder)}" data-typeahead-input
          class="w-full bg-transparent text-2xl font-semibold text-zinc-900 placeholder:text-zinc-300 focus-visible:outline-none dark:text-zinc-50 dark:placeholder:text-zinc-600" />
        ${query ? `<button type="button" data-typeahead-clear aria-label="Clear search" class="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800">${clearIcon}</button>` : ''}
      </div>
      ${suggestionHtml}
      ${resultsHtml}
      ${footerHint ? `<div class="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"><span>${escapeAttribute(footerHint)}</span><a href="#" class="font-medium text-indigo-600 hover:underline dark:text-indigo-400" data-typeahead-help>Help Center</a></div>` : ''}
    </div>`;

    const input = this.querySelector('[data-typeahead-input]');
    if (input) {
      input.addEventListener('input', () => {
        this.dispatchEvent(new CustomEvent('submit', { detail: { query: input.value } }));
      });
    }
    const clear = this.querySelector('[data-typeahead-clear]');
    if (clear) {
      clear.addEventListener('click', () => this.dispatchEvent(new CustomEvent('submit', { detail: { query: '' } })));
    }
    this.querySelectorAll('[data-typeahead-suggestion]').forEach((button) => {
      button.addEventListener('click', () => {
        const suggestion = this._suggestions[Number(button.getAttribute('data-typeahead-suggestion'))];
        this.dispatchEvent(new CustomEvent('select', { detail: { label: suggestion.label } }));
      });
    });
    this.querySelectorAll('[data-typeahead-result]').forEach((button) => {
      button.addEventListener('click', () => {
        const result = this._results[Number(button.getAttribute('data-typeahead-result'))];
        this.dispatchEvent(new CustomEvent('select', { detail: { label: result.title } }));
      });
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('search-typeahead')) {
  customElements.define('search-typeahead', SearchTypeaheadElement);
}
export default SearchTypeaheadElement;
