/**
 * QaTestTable - Vanilla Web Component
 * Usage: <qa-test-table title="QA tests" rows='[...]'></qa-test-table>
 * Attributes: title, rows (JSON: [{id,question,answered?,rating?}])
 *             rating: 'good' | 'acceptable' | 'poor'
 * Events: row-check (detail {row,checked}), row-select (detail {row})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const parseJsonAttr = (raw, fallback) => {
  try {
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed ?? fallback;
  } catch (e) {
    return fallback;
  }
};

const RATING_CHIP = {
  good: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  acceptable: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  poor: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300',
};

const RATING_LABEL = { good: 'Good', acceptable: 'Acceptable', poor: 'Poor' };

export class QaTestTableElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'rows'];
  }

  constructor() {
    super();
    this._bound = false;
    this._rows = [];
    this._checked = {};
  }

  connectedCallback() {
    if (!this._rows.length) this._rows = parseJsonAttr(this.getAttribute('rows'), []);
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const checkEl = event.target.closest('[data-qa-check]');
        if (checkEl) {
          const rowEl = checkEl.closest('[data-qa-row]');
          const row = this._rows.find((r) => r.id === rowEl?.getAttribute('data-qa-row'));
          if (row) {
            const next = !this._checked[row.id];
            this._checked = { ...this._checked, [row.id]: next };
            this.render();
            this.dispatchEvent(new CustomEvent('row-check', { detail: { row, checked: next } }));
          }
          return;
        }
        const rowEl = event.target.closest('[data-qa-row]');
        if (!rowEl) return;
        const row = this._rows.find((r) => r.id === rowEl.getAttribute('data-qa-row'));
        if (row) this.dispatchEvent(new CustomEvent('row-select', { detail: { row } }));
      });
    }
  }

  attributeChangedCallback(name) {
    if (name === 'rows' && !this._rows.length) {
      this._rows = parseJsonAttr(this.getAttribute('rows'), []);
    }
    if (this._bound === false && this.innerHTML === '') return;
    this.render();
  }

  get rows() { return this._rows; }
  set rows(v) {
    this._rows = Array.isArray(v) ? v.map((r) => ({ ...r })) : [];
    this.render();
  }

  render() {
    const rows = this._rows;
    const title = escapeAttribute(this.getAttribute('title') || 'QA tests');
    const answeredCount = rows.filter((r) => r.answered !== false).length;

    const body = rows.map((row) => {
      const rating = row.rating && RATING_LABEL[row.rating]
        ? `<span data-qa-rating="${escapeAttribute(row.rating)}" class="inline rounded-full px-2 py-0.5 text-[10px] font-semibold ${RATING_CHIP[row.rating]}">${RATING_LABEL[row.rating]}</span>`
        : '';
      const status = row.answered !== false
        ? '<span data-qa-status class="text-emerald-500">✓</span>'
        : '<span data-qa-status class="text-zinc-300 dark:text-zinc-600">—</span>';
      return `<tr data-qa-row="${escapeAttribute(row.id)}" class="cursor-pointer border-b border-zinc-50 text-xs transition-colors hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/60">
        <td class="py-2.5 pl-4"><input type="checkbox" data-qa-check aria-label="Select ${escapeAttribute(row.question)}" ${this._checked[row.id] ? 'checked' : ''} class="h-3.5 w-3.5 cursor-pointer accent-emerald-600"></td>
        <td data-qa-question class="max-w-72 truncate py-2.5 pr-3 text-zinc-800 dark:text-zinc-100">${escapeAttribute(row.question)}</td>
        <td class="py-2.5 pr-3 text-center">${status}</td>
        <td class="py-2.5 pr-4">${rating}</td>
      </tr>`;
    }).join('');

    this.innerHTML = `<div data-qa-test-table class="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
  <div class="flex items-center gap-2 border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
    <span class="text-xs font-semibold text-zinc-700 dark:text-zinc-200">${title}</span>
    <span class="ml-auto text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">${rows.length} questions</span>
    <span class="text-[11px] tabular-nums text-emerald-600 dark:text-emerald-400">${answeredCount} answered</span>
  </div>
  <table data-qa-rows class="w-full text-left">
    <thead>
      <tr class="border-b border-zinc-100 text-[10px] uppercase tracking-wider text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
        <th class="w-10 py-2 pl-4 font-medium"></th>
        <th class="py-2 pr-3 font-medium">Question</th>
        <th class="py-2 pr-3 text-center font-medium">Answer status</th>
        <th class="py-2 pr-4 font-medium">Answer rating</th>
      </tr>
    </thead>
    <tbody>${body}</tbody>
  </table>
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('qa-test-table')) {
  customElements.define('qa-test-table', QaTestTableElement);
}

export default QaTestTableElement;
