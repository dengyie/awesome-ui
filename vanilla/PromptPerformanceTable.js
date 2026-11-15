/**
 * PromptPerformanceTable - Peec AI prompt tracking table: rows of tracked
 * prompts with Visibility %, Sentiment score, Position # and Mentions
 * columns, plus an Export CTA in the header.
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

class PromptPerformanceTableElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'export-label', 'rows'];
  }

  constructor() {
    super();
    this._bound = false;
    this._rows = [];
  }

  connectedCallback() {
    if (!this._rows.length) {
      this._rows = parseJsonAttr(this.getAttribute('rows'), []);
    }
    if (this._bound === false && this.innerHTML === '') {
      this._bound = true;
    }
    this._render();
    this.addEventListener('click', this._onClick);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onClick);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'rows' && !this._rows.length) {
      this._rows = parseJsonAttr(this.getAttribute('rows'), []);
    }
    if (this._bound === false && this.innerHTML === '') return;
    this._render();
  }

  get title() {
    return this.getAttribute('title') ?? 'Prompt performance';
  }
  set title(value) {
    this.setAttribute('title', value);
  }

  get exportLabel() {
    return this.getAttribute('export-label') ?? 'Export';
  }
  set exportLabel(value) {
    this.setAttribute('export-label', value);
  }

  get rows() {
    return this._rows;
  }
  set rows(value) {
    this._rows = Array.isArray(value) ? value : [];
    this._render();
  }

  _onClick(event) {
    if (event.target.closest('[data-prompt-performance-export]')) {
      this.dispatchEvent(new CustomEvent('export', { bubbles: true }));
      return;
    }
    const rowEl = event.target.closest('[data-prompt-row]');
    if (!rowEl) return;
    const row = this._rows.find((r) => String(r.id) === rowEl.getAttribute('data-prompt-row'));
    if (row) {
      this.dispatchEvent(new CustomEvent('row-click', { detail: { row }, bubbles: true }));
    }
  }

  _render() {
    const rows = this._rows;
    const trendMark = (r) => {
      if (r.trend === 'up') return '<span aria-hidden="true" class="text-emerald-500">▲</span>';
      if (r.trend === 'down') return '<span aria-hidden="true" class="text-red-500">▼</span>';
      return '<span aria-hidden="true" class="text-zinc-400">—</span>';
    };
    const body = rows.length
      ? `<table data-prompt-performance-list class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-zinc-100 text-[10px] uppercase tracking-wide text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
              <th class="px-4 py-2 font-medium">Prompt</th>
              <th class="px-3 py-2 font-medium">Visibility</th>
              <th class="px-3 py-2 font-medium">Sentiment</th>
              <th class="px-3 py-2 font-medium">Position</th>
              <th class="px-4 py-2 text-right font-medium">Mentions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">${rows
            .map(
              (r) => `
            <tr data-prompt-row="${escapeAttribute(r.id)}" class="cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60">
              <td data-prompt-row-prompt class="max-w-[220px] truncate px-4 py-2.5 font-medium text-zinc-900 dark:text-zinc-50">${escapeAttribute(r.prompt)}</td>
              <td data-prompt-row-visibility class="px-3 py-2.5 text-zinc-600 dark:text-zinc-300">${escapeAttribute(r.visibility)}</td>
              <td data-prompt-row-sentiment class="px-3 py-2.5 text-zinc-600 dark:text-zinc-300">${escapeAttribute(r.sentiment)} ${trendMark(r)}</td>
              <td data-prompt-row-position class="px-3 py-2.5 text-zinc-600 dark:text-zinc-300">${escapeAttribute(r.position)}</td>
              <td data-prompt-row-mentions class="px-4 py-2.5 text-right text-zinc-600 dark:text-zinc-300">${escapeAttribute(r.mentions)}</td>
            </tr>`
            )
            .join('')}</tbody>
        </table>`
      : `<p data-prompt-performance-empty class="px-4 py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">No tracked prompts yet.</p>`;

    this.innerHTML = `
      <div data-prompt-performance-table class="w-full overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div class="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <h4 data-prompt-performance-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(this.title)}</h4>
          <button type="button" data-prompt-performance-export class="rounded border border-zinc-200 px-2 py-1 text-[11px] font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">${escapeAttribute(this.exportLabel)}</button>
        </div>
        ${body}
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('prompt-performance-table')) {
  customElements.define('prompt-performance-table', PromptPerformanceTableElement);
}

export default PromptPerformanceTableElement;
