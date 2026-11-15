/**
 * FilterToolbar - Vanilla Web Component
 * Usage: <filter-toolbar search-placeholder="Search files…" view="list" action-label="Create"></filter-toolbar> with `chips` property
 * Attributes: search-placeholder, search-value, view (list|grid|none), action-label
 * Properties: chips ({ label, value?, valueTone?, removable? }[])
 * Events: chip-remove (detail {index, chip}), search (detail {value}), view-change (detail {view}), action
 */
import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const VALUE_TONE = {
  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
};

export class FilterToolbarElement extends HTMLElement {
  static get observedAttributes() {
    return ['search-placeholder', 'search-value', 'view', 'action-label'];
  }

  constructor() {
    super();
    this._chips = [];
  }

  get chips() {
    return this._chips;
  }

  set chips(value) {
    this._chips = Array.isArray(value) ? value : [];
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

  render() {
    this._applyHostClass('block');
    const chips = this._chips;
    const searchPlaceholder = this.getAttribute('search-placeholder') || 'Search…';
    const searchValue = this.getAttribute('search-value') || '';
    const viewRaw = this.getAttribute('view');
    const view = viewRaw === 'none' ? '' : viewRaw || 'list';
    const actionLabel = this.getAttribute('action-label') || '';

    const chipHtml = chips
      .map((chip, index) => {
        const valuePill = chip.value
          ? `<span class="rounded-full px-2 py-0.5 text-[10px] font-semibold ${VALUE_TONE[chip.valueTone || 'indigo']}">${escapeAttribute(chip.value)}</span>`
          : uiIcon('chevron-down', { size: 12, className: 'text-zinc-400' });
        const removeBtn =
          chip.removable && chip.value
            ? `<button type="button" data-chip-remove="${index}" aria-label="Remove ${escapeAttribute(chip.label)} filter" class="ml-0.5 rounded-full p-0.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-zinc-800">${uiIcon('x', { size: 11 })}</button>`
            : '';
        return `<span data-filter-chip="${index}" class="flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
          ${escapeAttribute(chip.label)}${valuePill}${removeBtn}
        </span>`;
      })
      .join('');

    const viewToggle = view
      ? `<span data-view-toggle role="group" aria-label="View mode" class="flex overflow-hidden rounded-lg border border-zinc-300 dark:border-zinc-700">
          ${['list', 'grid']
            .map(
              (mode) => `<button type="button" data-view-mode="${mode}" aria-pressed="${view === mode}"
                class="flex h-7 w-8 items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 ${
                  view === mode
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-zinc-400 hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800'
                }">${uiIcon(mode === 'list' ? 'more-horizontal' : 'square', { size: 13 })}</button>`,
            )
            .join('')}
        </span>`
      : '';

    const actionBtn = actionLabel
      ? `<button type="button" data-toolbar-action class="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white">
          ${uiIcon('plus', { size: 12 })}${escapeAttribute(actionLabel)}
        </button>`
      : '';

    this.innerHTML = `<div data-filter-toolbar role="toolbar" aria-label="List filters" class="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      ${chipHtml}
      <span class="relative ml-auto min-w-[140px] flex-1 sm:max-w-xs">
        ${uiIcon('search', { size: 13, className: 'pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400' })}
        <input type="search" data-toolbar-search value="${escapeAttribute(searchValue)}" placeholder="${escapeAttribute(searchPlaceholder)}"
          class="w-full rounded-lg border border-zinc-300 bg-white py-1.5 pl-8 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50" />
      </span>
      ${viewToggle}
      ${actionBtn}
    </div>`;

    this.querySelectorAll('[data-chip-remove]').forEach((button) => {
      button.addEventListener('click', () => {
        const index = Number(button.getAttribute('data-chip-remove'));
        const chip = this._chips[index];
        if (typeof this.onChipRemove === 'function') this.onChipRemove(index, chip);
        this.dispatchEvent(new CustomEvent('chip-remove', { detail: { index, chip } }));
      });
    });
    const search = this.querySelector('[data-toolbar-search]');
    if (search) {
      search.addEventListener('input', () => {
        if (typeof this.onSearch === 'function') this.onSearch(search.value);
        this.dispatchEvent(new CustomEvent('search', { detail: { value: search.value } }));
      });
    }
    this.querySelectorAll('[data-view-mode]').forEach((button) => {
      button.addEventListener('click', () => {
        const mode = button.getAttribute('data-view-mode');
        if (typeof this.onViewChange === 'function') this.onViewChange(mode);
        this.dispatchEvent(new CustomEvent('view-change', { detail: { view: mode } }));
      });
    });
    const action = this.querySelector('[data-toolbar-action]');
    if (action) {
      action.addEventListener('click', () => {
        if (typeof this.onAction === 'function') this.onAction();
        this.dispatchEvent(new CustomEvent('action'));
      });
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('filter-toolbar')) {
  customElements.define('filter-toolbar', FilterToolbarElement);
}
export default FilterToolbarElement;
