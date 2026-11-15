import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

/**
 * FilterBar - Vanilla Web Component
 * Usage: <filter-bar></filter-bar>
 * Properties: filters (FilterDefinition[]), selected (Record<string, string[]>)
 * Events: change (detail: selected map), clear
 */
export class FilterBarElement extends HTMLElement {
  static get observedAttributes() {
    return [];
  }

  constructor() {
    super();
    this._filters = [];
    this._selected = {};
    this._openId = null;
    this._onPointerDown = (event) => {
      if (!this.contains(event.target)) this._close();
    };
    this._onKeyDown = (event) => {
      if (event.key === 'Escape') this._close();
    };
  }

  get filters() {
    return this._filters;
  }

  set filters(value) {
    this._filters = Array.isArray(value) ? value : [];
    this.render();
  }

  get selected() {
    return this._selected;
  }

  set selected(value) {
    this._selected = value && typeof value === 'object' ? { ...value } : {};
    this.render();
  }

  connectedCallback() {
    document.addEventListener('mousedown', this._onPointerDown);
    document.addEventListener('keydown', this._onKeyDown);
    this.render();
  }

  disconnectedCallback() {
    document.removeEventListener('mousedown', this._onPointerDown);
    document.removeEventListener('keydown', this._onKeyDown);
  }

  _applyHostClass(hostClass) {
    const prev = this._appliedLayout || '';
    let user = this.className || '';
    if (prev && user.startsWith(prev)) user = user.slice(prev.length).trim();
    this._appliedLayout = hostClass;
    const next = `${hostClass}${user ? ` ${user}` : ''}`;
    if (this.className !== next) this.className = next;
  }

  _close() {
    if (this._openId === null) return;
    this._openId = null;
    this.render();
  }

  _commit(next) {
    this._selected = next;
    this.render();
    this.dispatchEvent(new CustomEvent('change', { detail: next }));
  }

  _toggleOption(filterId, value) {
    const values = this._selected[filterId] || [];
    const nextValues = values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];
    const next = { ...this._selected };
    if (nextValues.length > 0) next[filterId] = nextValues;
    else delete next[filterId];
    this._commit(next);
  }

  _clearAll() {
    this._commit({});
    this.dispatchEvent(new CustomEvent('clear'));
  }

  render() {
    this._applyHostClass('flex flex-wrap items-center gap-1.5');

    const activeCount = Object.values(this._selected).reduce((total, values) => total + values.length, 0);

    const chips = this._filters
      .map((filter) => {
        const values = this._selected[filter.id] || [];
        const active = values.length > 0;
        const open = this._openId === filter.id;
        const options = filter.options
          .map((option) => {
            const checked = values.includes(option.value);
            return `<button type="button" data-filter-id="${escapeAttribute(filter.id)}" data-value="${escapeAttribute(option.value)}" aria-pressed="${checked}"
              class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11px] text-zinc-600 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-zinc-300 dark:hover:bg-zinc-800">
              <span class="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                checked ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-zinc-300 dark:border-zinc-600'
              }">${checked ? uiIcon('check', { size: 9, strokeWidth: 3 }) : ''}</span>
              <span class="min-w-0 flex-1 truncate">${escapeAttribute(option.label)}</span>
              ${option.count !== undefined ? `<span class="shrink-0 tabular-nums text-[10px] text-zinc-400">${escapeAttribute(option.count)}</span>` : ''}
            </button>`;
          })
          .join('');
        return `<div class="relative">
          <button type="button" data-filter-toggle="${escapeAttribute(filter.id)}" aria-expanded="${open}" aria-haspopup="true"
            class="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              active
                ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300'
                : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600'
            }">
            <span>${escapeAttribute(filter.label)}</span>
            ${active ? `<span class="rounded-full bg-indigo-600 px-1 text-[9px] tabular-nums text-white">${values.length}</span>` : ''}
            <span class="${open ? 'rotate-180 transition-transform' : 'transition-transform'}">${uiIcon('chevron-down', { size: 11 })}</span>
          </button>
          ${
            open
              ? `<div class="absolute left-0 top-full z-20 mt-1 w-48 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">${options}</div>`
              : ''
          }
        </div>`;
      })
      .join('');

    this.innerHTML = `${chips}${
      activeCount > 0
        ? `<button type="button" data-filter-clear class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium text-zinc-500 transition-colors hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-zinc-400 dark:hover:text-zinc-100">${uiIcon('x', { size: 11 })}Clear all</button>`
        : ''
    }`;

    this.querySelectorAll('[data-filter-toggle]').forEach((node) => {
      node.addEventListener('click', () => {
        const id = node.getAttribute('data-filter-toggle');
        this._openId = this._openId === id ? null : id;
        this.render();
      });
    });
    this.querySelectorAll('[data-filter-id]').forEach((node) => {
      node.addEventListener('click', () =>
        this._toggleOption(node.getAttribute('data-filter-id'), node.getAttribute('data-value'))
      );
    });
    const clear = this.querySelector('[data-filter-clear]');
    if (clear) clear.addEventListener('click', () => this._clearAll());
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('filter-bar')) {
  customElements.define('filter-bar', FilterBarElement);
}
export default FilterBarElement;
