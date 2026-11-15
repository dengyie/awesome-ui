/**
 * ContentReviewTable - Vanilla Web Component
 * Usage: <content-review-table title="Review content" rows='[...]'></content-review-table>
 * Attributes: title, rows (JSON: [{id,text,tags?,extraTags?,time?,status:'valid'|'error'}]),
 *             drafts-label, schedule-label
 * Events: row-select (detail {row}), save-drafts, schedule
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

export class ContentReviewTableElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'rows', 'drafts-label', 'schedule-label'];
  }

  constructor() {
    super();
    this._bound = false;
    this._rows = [];
  }

  connectedCallback() {
    if (!this._rows.length) this._rows = parseJsonAttr(this.getAttribute('rows'), []);
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const draftsBtn = event.target.closest('[data-review-drafts]');
        const scheduleBtn = event.target.closest('[data-review-schedule]');
        if (draftsBtn) {
          this.dispatchEvent(new CustomEvent('save-drafts'));
          return;
        }
        if (scheduleBtn) {
          this.dispatchEvent(new CustomEvent('schedule'));
          return;
        }
        const rowEl = event.target.closest('[data-review-row]');
        if (!rowEl) return;
        const row = this._rows.find((r) => r.id === rowEl.getAttribute('data-review-row'));
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
    const title = escapeAttribute(this.getAttribute('title') || 'Review content');
    const draftsLabel = escapeAttribute(this.getAttribute('drafts-label') || 'Save as Drafts');
    const scheduleLabel = escapeAttribute(this.getAttribute('schedule-label') || 'Schedule Posts');
    const errors = rows.filter((r) => r.status === 'error').length;
    const valid = rows.length - errors;

    const body = rows.map((row, index) => {
      const tags = (row.tags ?? []).slice(0, 1).map((tag) =>
        `<span data-review-tag class="inline rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-medium text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">${escapeAttribute(tag)}</span>`
      ).join('');
      const extra = typeof row.extraTags === 'number' && row.extraTags > 0
        ? `<span data-review-extra-tags class="text-[10px] text-zinc-400 dark:text-zinc-500">+${row.extraTags}</span>`
        : '';
      return `<tr data-review-row="${escapeAttribute(row.id)}" class="cursor-pointer border-b border-zinc-50 text-xs transition-colors hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/60">
        <td class="py-2.5 pl-4 tabular-nums text-zinc-400 dark:text-zinc-500">${index + 1}</td>
        <td data-review-text class="max-w-48 truncate py-2.5 pr-3 text-zinc-800 dark:text-zinc-100">${escapeAttribute(row.text)}</td>
        <td class="py-2.5 pr-3"><span class="flex items-center gap-1">${tags}${extra}</span></td>
        <td class="py-2.5 pr-3 text-zinc-500 dark:text-zinc-400">${escapeAttribute(row.time ?? 'Add to Queue')}</td>
        <td class="py-2.5 pr-4"><span aria-label="${escapeAttribute(row.status)}">${row.status === 'valid'
          ? '<span data-review-status class="text-emerald-500">✓</span>'
          : '<span data-review-status class="text-red-500">⚠</span>'}</span></td>
      </tr>`;
    }).join('');

    this.innerHTML = `<div data-content-review class="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
  <div class="flex flex-col items-center gap-1 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
    <span class="text-sm font-semibold text-zinc-800 dark:text-zinc-100">${title}</span>
    <span class="flex items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400">
      <span data-review-valid-count class="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">✓ ${valid} valid</span>
      <span data-review-error-count class="flex items-center gap-1 text-red-500 dark:text-red-400">⚠ ${errors} ${errors === 1 ? 'error' : 'errors'}</span>
    </span>
  </div>
  <table data-review-table class="w-full text-left">
    <thead>
      <tr class="border-b border-zinc-100 text-[10px] uppercase tracking-wider text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
        <th class="w-10 py-2 pl-4 font-medium">#</th>
        <th class="py-2 pr-3 font-medium">Text</th>
        <th class="py-2 pr-3 font-medium">Tags</th>
        <th class="py-2 pr-3 font-medium">Posting time</th>
        <th class="py-2 pr-4 font-medium">Status</th>
      </tr>
    </thead>
    <tbody>${body}</tbody>
  </table>
  <div class="flex items-center justify-end gap-2 border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
    <button type="button" data-review-drafts class="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800">${draftsLabel}</button>
    <button type="button" data-review-schedule class="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-500">${scheduleLabel}</button>
  </div>
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('content-review-table')) {
  customElements.define('content-review-table', ContentReviewTableElement);
}

export default ContentReviewTableElement;
