/**
 * FilterQueryBuilder - Vanilla Web Component
 * Usage: <filter-query-builder></filter-query-builder> with `fields` and `rows` properties
 * Attributes: add-label, clear-label, max-rows
 * Properties: fields [{name,label,operators?}], rows [{id,conjunction,field,operator,value}]
 * Events: change (detail {rows}), clear
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const OPERATOR_GLYPH = {
  equals: '=',
  'not-equals': '<>',
  greater: '>',
  less: '<',
  contains: '~',
  gte: '>=',
  lte: '<=',
};

const DEFAULT_OPERATORS = ['equals', 'not-equals', 'greater', 'less', 'contains', 'gte', 'lte'];

export class FilterQueryBuilderElement extends HTMLElement {
  static get observedAttributes() {
    return ['add-label', 'clear-label', 'max-rows'];
  }

  constructor() {
    super();
    this._fields = [];
    this._rows = [];
    this._bound = false;
  }

  connectedCallback() {
    if (!this._fields.length) {
      const raw = this.getAttribute('fields');
      if (raw) {
        try { this._fields = JSON.parse(raw); } catch { this._fields = []; }
      }
    }
    if (!this._rows.length) {
      const raw = this.getAttribute('rows');
      if (raw) {
        try { this._rows = JSON.parse(raw); } catch { this._rows = []; }
      }
    }
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const remove = event.target.closest('[data-filter-remove]');
        if (remove) {
          const rowId = remove.closest('[data-filter-row]')?.getAttribute('data-filter-row');
          this._rows = this._rows.filter((row) => row.id !== rowId);
          this.render();
          this.dispatchEvent(new CustomEvent('change', { detail: { rows: this._rows } }));
          return;
        }
        if (event.target.closest('[data-filter-add]')) {
          this.addRow();
          return;
        }
        if (event.target.closest('[data-filter-clear]')) {
          this._rows = [];
          this.render();
          this.dispatchEvent(new CustomEvent('change', { detail: { rows: this._rows } }));
          this.dispatchEvent(new CustomEvent('clear'));
        }
      });
      const applyEdit = (target) => {
        if (!target || !(target.getAttribute && (target.hasAttribute('data-filter-field') || target.hasAttribute('data-filter-operator') || target.hasAttribute('data-filter-value')))) return;
        const rowEl = target.closest('[data-filter-row]');
        if (!rowEl) return;
        const rowId = rowEl.getAttribute('data-filter-row');
        const row = this._rows.find((item) => item.id === rowId);
        if (!row) return;
        if (target.hasAttribute('data-filter-field')) {
          row.field = target.value;
          row.operator = 'equals';
        } else if (target.hasAttribute('data-filter-operator')) {
          row.operator = target.value;
        } else if (target.hasAttribute('data-filter-value')) {
          row.value = target.value;
        } else {
          return;
        }
        this.dispatchEvent(new CustomEvent('change', { detail: { rows: this._rows } }));
      };
      this.addEventListener('input', (event) => applyEdit(event.target));
      this.addEventListener('change', (event) => {
        // skip our own CustomEvent bubbles; only native control changes apply edits
        if (event instanceof CustomEvent) return;
        applyEdit(event.target);
      });
    }
  }

  attributeChangedCallback() {
    this.render();
  }

  get fields() {
    return this._fields;
  }

  set fields(value) {
    this._fields = Array.isArray(value) ? value : [];
    this.render();
  }

  get rows() {
    return this._rows;
  }

  set rows(value) {
    this._rows = Array.isArray(value) ? value : [];
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

  operatorsFor(name) {
    const field = this._fields.find((item) => item.name === name);
    return field && field.operators ? field.operators : DEFAULT_OPERATORS;
  }

  addRow() {
    this._rows = [
      ...this._rows,
      {
        id: `f${Date.now()}`,
        conjunction: this._rows.length === 0 ? 'where' : 'and',
        field: this._fields[0]?.name || '',
        operator: 'equals',
        value: '',
      },
    ];
    this.render();
    this.dispatchEvent(new CustomEvent('change', { detail: { rows: this._rows } }));
  }

  render() {
    this._applyHostClass('block');
    const addLabel = this.getAttribute('add-label') || '+ Add filter';
    const clearLabel = this.getAttribute('clear-label') || 'Clear filters';
    const maxRows = Number(this.getAttribute('max-rows')) || 8;
    const fields = this._fields;
    const rowsHtml = this._rows
      .map((row, index) => {
        const conjunctionClass =
          index === 0
            ? 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
            : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300';
        const fieldOptions = fields
          .map((field) => `<option value="${escapeAttribute(field.name)}"${field.name === row.field ? ' selected' : ''}>${escapeAttribute(field.label)}</option>`)
          .join('');
        const operatorOptions = this.operatorsFor(row.field)
          .map((op) => `<option value="${escapeAttribute(op)}"${op === row.operator ? ' selected' : ''}>${escapeAttribute(OPERATOR_GLYPH[op] || op)}</option>`)
          .join('');
        return `<div data-filter-row="${escapeAttribute(row.id)}" class="flex flex-wrap items-center gap-1.5">
          <span class="rounded px-2 py-1 text-xs font-medium ${conjunctionClass}">${escapeAttribute(row.conjunction)}</span>
          <select data-filter-field class="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">${fieldOptions}</select>
          <select data-filter-operator class="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 font-mono text-xs text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">${operatorOptions}</select>
          <input type="text" data-filter-value value="${escapeAttribute(row.value)}" placeholder="Value" class="min-w-[100px] flex-1 rounded-md border border-transparent bg-zinc-50 px-2 py-1 text-xs text-zinc-800 placeholder:text-zinc-400 focus-visible:border-indigo-400 focus-visible:outline-none dark:bg-zinc-800 dark:text-zinc-100" />
          <button type="button" data-filter-remove aria-label="Remove filter" class="h-5 w-5 shrink-0 rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 focus-visible:outline-none dark:hover:bg-zinc-800">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto h-3 w-3"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>`;
      })
      .join('');
    const emptyHtml = this._rows.length === 0 ? `<p data-filter-empty class="py-1 text-xs text-zinc-400 dark:text-zinc-500">No filters applied.</p>` : '';

    this.innerHTML = `<div data-filter-query-builder class="w-full rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div class="space-y-2">${rowsHtml}${emptyHtml}</div>
      <div class="mt-3 flex items-center justify-between">
        <button type="button" data-filter-add${this._rows.length >= maxRows ? ' disabled' : ''} class="rounded-md px-2 py-1 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-indigo-400 dark:hover:bg-indigo-950/40">${escapeAttribute(addLabel)}</button>
        ${this._rows.length ? `<button type="button" data-filter-clear class="text-xs font-medium text-zinc-500 underline-offset-2 transition-colors hover:text-zinc-700 hover:underline dark:text-zinc-400">${escapeAttribute(clearLabel)}</button>` : ''}
      </div>
    </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('filter-query-builder')) {
  customElements.define('filter-query-builder', FilterQueryBuilderElement);
}

export default FilterQueryBuilderElement;
