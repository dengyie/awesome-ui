import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const alignClass = (align) => (align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left');

export class DataTableElement extends HTMLElement {
  static get observedAttributes() {
    return ['columns', 'rows', 'selectable', 'empty-text'];
  }

  constructor() {
    super();
    this._columns = [];
    this._rows = [];
    this._sortKey = null;
    this._sortDir = 'asc';
    this._selected = new Set();
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  get columns() {
    if (this._columns.length) return this._columns;
    try {
      return JSON.parse(this.getAttribute('columns') || '[]');
    } catch {
      return [];
    }
  }

  set columns(value) {
    this._columns = Array.isArray(value) ? value : [];
    this.render();
  }

  get rows() {
    if (this._rows.length) return this._rows;
    try {
      return JSON.parse(this.getAttribute('rows') || '[]');
    } catch {
      return [];
    }
  }

  set rows(value) {
    this._rows = Array.isArray(value) ? value : [];
    this._selected = new Set();
    this.render();
  }

  get actions() {
    return this._actions || [];
  }

  set actions(value) {
    this._actions = Array.isArray(value) ? value : [];
    this.render();
  }

  get selectable() {
    return this.hasAttribute('selectable') && this.getAttribute('selectable') !== 'false';
  }

  _applyHostClass(layoutClass) {
    const prev = this._appliedLayout || '';
    let user = this.className || '';
    if (prev && user.startsWith(prev)) user = user.slice(prev.length).trim();
    this._appliedLayout = layoutClass;
    const next = `${layoutClass}${user ? ` ${user}` : ''}`;
    if (this.className !== next) this.className = next;
  }

  _sortedRows() {
    const rows = this.rows;
    if (!this._sortKey) return rows;
    const dir = this._sortDir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = a[this._sortKey];
      const bv = b[this._sortKey];
      if (av === bv) return 0;
      return (String(av ?? '') > String(bv ?? '') ? 1 : -1) * dir;
    });
  }

  render() {
    const columns = this.columns;
    const rows = this._sortedRows();
    const actions = this.actions;
    const emptyText = this.getAttribute('empty-text') || 'No results';
    const selectable = this.selectable;
    const allSelected = rows.length > 0 && this._selected.size === rows.length;

    this._applyHostClass('relative');

    const headCells = columns
      .map((column) => {
        const icon = this._sortKey === column.key ? (this._sortDir === 'asc' ? 'arrow-up' : 'arrow-down') : 'chevron-down';
        return `<th style="${column.width ? `width:${escapeAttribute(column.width)}` : ''}" class="px-3 py-2 font-medium text-zinc-500 dark:text-zinc-400 ${alignClass(column.align)}">
          <button type="button" data-sort="${escapeAttribute(column.key)}" class="sort-btn inline-flex items-center gap-1 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
            ${escapeAttribute(column.label)}<span class="text-zinc-300 dark:text-zinc-600">${uiIcon(icon, { size: 11 })}</span>
          </button>
        </th>`;
      })
      .join('');

    const bodyRows =
      rows.length === 0
        ? `<tr><td colspan="${columns.length + (selectable ? 1 : 0) + (actions.length ? 1 : 0)}" class="px-3 py-10 text-center text-zinc-400 dark:text-zinc-500">${escapeAttribute(emptyText)}</td></tr>`
        : rows
            .map((row, index) => {
              const cells = columns
                .map(
                  (column) =>
                    `<td class="px-3 py-2 text-zinc-700 dark:text-zinc-200 ${alignClass(column.align)} ${column.align === 'right' ? 'tabular-nums' : ''}">${escapeAttribute(row[column.key] ?? '—')}</td>`
                )
                .join('');
              const checkbox = selectable
                ? `<td class="px-3 py-2"><input type="checkbox" data-row="${index}" ${this._selected.has(index) ? 'checked' : ''} aria-label="Select row ${index + 1}" class="h-3.5 w-3.5 rounded border-zinc-300 dark:border-zinc-600 accent-indigo-600" /></td>`
                : '';
              const actionCell = actions.length
                ? `<td class="px-3 py-2"><div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">${actions
                    .map(
                      (action, ai) =>
                        `<button type="button" data-action="${ai}" data-row="${index}" aria-label="${escapeAttribute(action.label)}" title="${escapeAttribute(action.label)}" class="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-200 transition-colors">${uiIcon(action.icon || 'more-horizontal', { size: 14 })}</button>`
                    )
                    .join('')}</div></td>`
                : '';
              return `<tr class="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">${checkbox}${cells}${actionCell}</tr>`;
            })
            .join('');

    this.innerHTML = `
      <div class="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table class="w-full text-xs">
          <thead class="bg-zinc-50 dark:bg-zinc-900/60"><tr>
            ${selectable ? `<th class="w-10 px-3 py-2"><input type="checkbox" data-select-all ${allSelected ? 'checked' : ''} aria-label="Select all rows" class="h-3.5 w-3.5 rounded border-zinc-300 dark:border-zinc-600 accent-indigo-600" /></th>` : ''}
            ${headCells}
            ${actions.length ? '<th class="w-20 px-3 py-2"></th>' : ''}
          </tr></thead>
          <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">${bodyRows}</tbody>
        </table>
      </div>
      ${
        selectable && this._selected.size > 0
          ? `<div class="fixed bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 shadow-lg">
              <span class="text-xs font-medium text-zinc-700 dark:text-zinc-200">${this._selected.size} selected</span>
              <div class="flex items-center gap-1">${actions
                .map(
                  (action, ai) =>
                    `<button type="button" data-batch="${ai}" class="rounded-full px-2.5 py-1 text-xs text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors">${escapeAttribute(action.label)}</button>`
                )
                .join('')}</div>
              <button type="button" data-clear aria-label="Clear selection" class="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700">${uiIcon('x', { size: 13 })}</button>
            </div>`
          : ''
      }`;

    this.querySelectorAll('.sort-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-sort');
        this._sortDir = this._sortKey === key && this._sortDir === 'asc' ? 'desc' : 'asc';
        this._sortKey = key;
        this.dispatchEvent(new CustomEvent('sort', { detail: { key, direction: this._sortDir } }));
        this.render();
      });
    });

    const allBox = this.querySelector('[data-select-all]');
    if (allBox)
      allBox.addEventListener('change', () => {
        this._selected = allBox.checked ? new Set(rows.map((_, i) => i)) : new Set();
        this.render();
      });

    this.querySelectorAll('input[data-row]').forEach((box) => {
      box.addEventListener('change', () => {
        const index = Number(box.getAttribute('data-row'));
        box.checked ? this._selected.add(index) : this._selected.delete(index);
        this.render();
      });
    });

    this.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const row = rows[Number(btn.getAttribute('data-row'))];
        const action = actions[Number(btn.getAttribute('data-action'))];
        action?.onClick?.(row);
        this.dispatchEvent(new CustomEvent('action', { detail: { action, row } }));
      });
    });

    this.querySelectorAll('[data-batch]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = actions[Number(btn.getAttribute('data-batch'))];
        this._selected.forEach((index) => action?.onClick?.(rows[index]));
        this.dispatchEvent(new CustomEvent('batch', { detail: { action, rows: [...this._selected].map((i) => rows[i]) } }));
        this._selected = new Set();
        this.render();
      });
    });

    const clearBtn = this.querySelector('[data-clear]');
    if (clearBtn)
      clearBtn.addEventListener('click', () => {
        this._selected = new Set();
        this.render();
      });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('data-table')) {
  customElements.define('data-table', DataTableElement);
}
export default DataTableElement;
