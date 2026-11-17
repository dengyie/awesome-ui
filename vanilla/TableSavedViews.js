/**
 * TableSavedViews - Data-table saved views bar: view tabs (default +
 * user-saved), active-view filter chips, and Save view / Share actions
 * (Attio / Rows table views pattern).
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

const DEFAULT_VIEWS = () => [
  { id: 'all', label: 'All records', filters: [] },
  { id: 'mine', label: 'Assigned to me', filters: ['assignee: me'] },
  { id: 'stale', label: 'Stale 30d+', filters: ['updated < 30d', 'status: open'] },
];

class TableSavedViewsElement extends HTMLElement {
  static get observedAttributes() {
    return ['views', 'active', 'save-label', 'share-label'];
  }

  constructor() {
    super();
    this._views = DEFAULT_VIEWS();
    this._active = 'all';
    this._saveLabel = 'Save view';
    this._shareLabel = 'Share';
    this._onClick = this._onClick.bind(this);
  }

  connectedCallback() {
    this._views = parseJsonAttr(this.getAttribute('views'), DEFAULT_VIEWS());
    const a = this.getAttribute('active');
    if (a) this._active = a;
    const s = this.getAttribute('save-label');
    if (s) this._saveLabel = s;
    const sh = this.getAttribute('share-label');
    if (sh) this._shareLabel = sh;
    this._render();
    this.addEventListener('click', this._onClick);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onClick);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'views') this._views = parseJsonAttr(newValue, DEFAULT_VIEWS());
    if (name === 'active') this._active = newValue || 'all';
    if (name === 'save-label') this._saveLabel = newValue || 'Save view';
    if (name === 'share-label') this._shareLabel = newValue || 'Share';
    this._render();
  }

  get views() { return this._views; }
  set views(value) { this._views = Array.isArray(value) ? value : []; this._render(); }

  _onClick(event) {
    const tab = event.target.closest('[data-savedview-tab]');
    if (tab) {
      this._active = tab.getAttribute('data-savedview-tab') || 'all';
      const view = this._views.find((v) => v.id === this._active);
      this.dispatchEvent(new CustomEvent('view-change', { detail: { view, id: this._active }, bubbles: true }));
      this._render();
      return;
    }
    if (event.target.closest('[data-savedview-save]')) {
      this.dispatchEvent(new CustomEvent('view-save', { detail: { id: this._active }, bubbles: true }));
      return;
    }
    if (event.target.closest('[data-savedview-share]')) {
      this.dispatchEvent(new CustomEvent('view-share', { detail: { id: this._active }, bubbles: true }));
    }
  }

  _render() {
    const views = Array.isArray(this._views) ? this._views : [];
    const active = views.find((v) => v.id === this._active) ?? views[0] ?? { id: 'all', label: 'All records', filters: [] };

    const tabsHtml = views
      .map((view) => {
        const isActive = view.id === active.id;
        const cls = isActive
          ? 'border-b-2 border-violet-600 font-semibold text-violet-700 dark:border-violet-500 dark:text-violet-300'
          : 'border-b-2 border-transparent font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200';
        return `<button type="button" data-savedview-tab="${escapeAttribute(view.id)}" class="whitespace-nowrap px-3 py-2 text-sm transition-colors ${cls}">${escapeAttribute(view.label)}</button>`;
      })
      .join('');

    const chipsHtml = (active.filters || [])
      .map((f) => `<span data-savedview-filter="${escapeAttribute(f)}" class="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">${escapeAttribute(f)}</span>`)
      .join('');

    this.innerHTML = `
      <div data-savedviews-bar class="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div data-savedviews-tabs class="flex items-center gap-1 border-b border-zinc-100 px-3 dark:border-zinc-800">${tabsHtml}</div>
        <div data-savedviews-body class="flex flex-wrap items-center gap-2 px-5 py-3">
          <span data-savedview-filters class="inline-flex flex-wrap items-center gap-2">${chipsHtml || '<span data-savedview-nofilters class="text-xs text-zinc-400 dark:text-zinc-500">No filters</span>'}</span>
          <span class="flex-1"></span>
          <button type="button" data-savedview-share class="rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">${escapeAttribute(this._shareLabel)}</button>
          <button type="button" data-savedview-save class="rounded-md bg-violet-600 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-violet-500">${escapeAttribute(this._saveLabel)}</button>
        </div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('table-saved-views')) {
  customElements.define('table-saved-views', TableSavedViewsElement);
}

export default TableSavedViewsElement;
