/**
 * ColumnVisibilityMenu - Vanilla Web Component
 * Usage: <column-visibility-menu columns='[...]' visible-ids='[...]'></column-visibility-menu>
 * Attributes: columns (JSON), visible-ids (JSON), show-reorder-handles, apply-mode (instant|apply-button), reset-label, apply-label
 * Properties: columns, visibleIds
 * Events: toggle (detail {id, visible}), reorder (detail {from, to}), reset, apply (detail {visibleIds})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const GRIP_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" class="h-3 w-3"><circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" /><circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" /></svg>';
const LOCK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3.5 w-3.5 shrink-0 text-zinc-400"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>';
const EYE_OPEN_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3.5 w-3.5"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>';
const EYE_OFF_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3.5 w-3.5"><path d="M2 12s3.5-7 10-7c2 0 3.7.6 5.1 1.5M22 12s-3.5 7-10 7c-2 0-3.7-.6-5.1-1.5" /><path d="m4 4 16 16" /></svg>';
const UP_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-2.5 w-2.5"><path d="m18 15-6-6-6 6" /></svg>';
const DOWN_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-2.5 w-2.5"><path d="m6 9 6 6 6-6" /></svg>';

export class ColumnVisibilityMenuElement extends HTMLElement {
  static get observedAttributes() {
    return ['columns', 'visible-ids', 'show-reorder-handles', 'apply-mode', 'reset-label', 'apply-label'];
  }

  constructor() {
    super();
    this._columns = [];
    this._visibleIds = [];
    this._draft = null;
    this._bound = false;
  }

  connectedCallback() {
    if (!this._columns.length) {
      const raw = this.getAttribute('columns');
      if (raw) {
        try { this._columns = JSON.parse(raw); } catch { this._columns = []; }
      }
    }
    if (!this._visibleIds.length) {
      const raw = this.getAttribute('visible-ids');
      if (raw) {
        try { this._visibleIds = JSON.parse(raw); } catch { this._visibleIds = []; }
      }
    }
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const toggle = event.target.closest('[data-column-toggle]');
        if (toggle) {
          const rowEl = toggle.closest('[data-column-row]');
          const column = this._columns.find((item) => item.id === rowEl?.getAttribute('data-column-row'));
          if (column && !column.locked) this.toggleColumn(column);
          return;
        }
        const up = event.target.closest('[data-column-up]');
        if (up) {
          const rowEl = up.closest('[data-column-row]');
          const index = this._columns.findIndex((item) => item.id === rowEl?.getAttribute('data-column-row'));
          if (index > 0) {
            this.dispatchEvent(new CustomEvent('reorder', { detail: { from: index, to: index - 1 } }));
          }
          return;
        }
        const down = event.target.closest('[data-column-down]');
        if (down) {
          const rowEl = down.closest('[data-column-row]');
          const index = this._columns.findIndex((item) => item.id === rowEl?.getAttribute('data-column-row'));
          if (index >= 0 && index < this._columns.length - 1) {
            this.dispatchEvent(new CustomEvent('reorder', { detail: { from: index, to: index + 1 } }));
          }
          return;
        }
        if (event.target.closest('[data-column-reset]')) {
          this.dispatchEvent(new CustomEvent('reset'));
          return;
        }
        if (event.target.closest('[data-column-apply]')) {
          const ids = this.applyMode() === 'apply-button' ? [...(this._draft || this.defaultVisible())] : [...this.visibleIdsResolved()];
          this.dispatchEvent(new CustomEvent('apply', { detail: { visibleIds: ids } }));
        }
      });
    }
  }

  attributeChangedCallback() {
    this.render();
  }

  get columns() {
    return this._columns;
  }

  set columns(value) {
    this._columns = Array.isArray(value) ? value : [];
    this._draft = null;
    this.render();
  }

  get visibleIds() {
    return this._visibleIds;
  }

  set visibleIds(value) {
    this._visibleIds = Array.isArray(value) ? value : [];
    this._draft = null;
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

  applyMode() {
    return this.getAttribute('apply-mode') || 'instant';
  }

  defaultVisible() {
    return this._columns.filter((column) => !column.hidden).map((column) => column.id);
  }

  visibleIdsResolved() {
    return this._visibleIds.length ? this._visibleIds : this.defaultVisible();
  }

  isVisible(column) {
    if (column.locked) return true;
    if (this.applyMode() === 'apply-button') {
      if (!this._draft) this._draft = new Set(this.visibleIdsResolved());
      return this._draft.has(column.id);
    }
    return this.visibleIdsResolved().includes(column.id);
  }

  toggleColumn(column) {
    const nextVisible = !this.isVisible(column);
    if (this.applyMode() === 'apply-button') {
      if (!this._draft) this._draft = new Set(this.visibleIdsResolved());
      if (nextVisible) this._draft.add(column.id);
      else this._draft.delete(column.id);
    } else {
      const current = this.visibleIdsResolved();
      this._visibleIds = nextVisible
        ? [...current, column.id]
        : current.filter((id) => id !== column.id);
    }
    this.render();
    this.dispatchEvent(new CustomEvent('toggle', { detail: { id: column.id, visible: nextVisible } }));
  }

  render() {
    this._applyHostClass('block');
    const showHandles = this.getAttribute('show-reorder-handles') !== 'false';
    const applyMode = this.applyMode();
    const resetLabel = this.getAttribute('reset-label') || 'Reset to default';
    const applyLabel = this.getAttribute('apply-label') || 'Apply';
    const visibleCount = this._columns.filter((column) => this.isVisible(column)).length;
    const rowsHtml = this._columns
      .map((column) => {
        const visible = this.isVisible(column);
        const rowClass = column.locked ? 'opacity-60' : '';
        const toggleClass = visible
          ? 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
          : 'text-zinc-300 hover:bg-zinc-50 dark:text-zinc-600';
        const handleColumn = showHandles && !column.locked
          ? `<span class="flex shrink-0 flex-col text-zinc-300 dark:text-zinc-600" aria-hidden="true">${GRIP_SVG}</span>`
          : '<span class="w-3 shrink-0"></span>';
        const lockIcon = column.locked ? LOCK_SVG : '';
        const toggleButton = `<button type="button" data-column-toggle aria-label="${escapeAttribute(`${visible ? 'Hide' : 'Show'} ${column.label}`)}"${column.locked ? ' disabled' : ''} class="shrink-0 rounded p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${toggleClass}">${visible ? EYE_OPEN_SVG : EYE_OFF_SVG}</button>`;
        const reorderColumn = showHandles && !column.locked
          ? `<span class="flex shrink-0 flex-col">
              <button type="button" data-column-up aria-label="Move ${escapeAttribute(column.label)} up" class="rounded p-0.5 text-zinc-300 hover:bg-zinc-100 hover:text-zinc-500 focus-visible:outline-none dark:hover:bg-zinc-800">${UP_SVG}</button>
              <button type="button" data-column-down aria-label="Move ${escapeAttribute(column.label)} down" class="rounded p-0.5 text-zinc-300 hover:bg-zinc-100 hover:text-zinc-500 focus-visible:outline-none dark:hover:bg-zinc-800">${DOWN_SVG}</button>
            </span>`
          : '<span class="w-2.5 shrink-0"></span>';
        return `<li data-column-row="${escapeAttribute(column.id)}" data-column-visible="${visible ? 'true' : 'false'}">
          <div class="flex items-center gap-2 px-3 py-1.5 ${rowClass}">
            ${handleColumn}
            ${lockIcon}
            <span class="min-w-0 flex-1 truncate text-xs font-medium text-zinc-700 dark:text-zinc-200">${escapeAttribute(column.label)}</span>
            ${toggleButton}
            ${reorderColumn}
          </div>
        </li>`;
      })
      .join('');
    const footer =
      applyMode === 'apply-button'
        ? `<div class="border-t border-zinc-100 p-2 dark:border-zinc-800">
            <button type="button" data-column-apply class="w-full rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white">${escapeAttribute(applyLabel)}</button>
          </div>`
        : '';

    this.innerHTML = `<div data-column-visibility-menu class="w-64 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      <div class="flex items-center justify-between border-b border-zinc-100 px-3 py-2.5 dark:border-zinc-800">
        <p data-column-count class="text-sm text-zinc-500 dark:text-zinc-400">Showing <span class="font-semibold text-zinc-800 dark:text-zinc-100">${visibleCount}</span> of ${this._columns.length}</p>
        <button type="button" data-column-reset class="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">${escapeAttribute(resetLabel)}</button>
      </div>
      <ul class="max-h-72 overflow-y-auto py-1">${rowsHtml}</ul>
      ${footer}
    </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('column-visibility-menu')) {
  customElements.define('column-visibility-menu', ColumnVisibilityMenuElement);
}

export default ColumnVisibilityMenuElement;
