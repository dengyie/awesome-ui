/**
 * BrandPromptTable - Vanilla Web Component
 * Usage: <brand-prompt-table title="Prompts" quota-used="49" quota-total="50"></brand-prompt-table>
 * Property: rows ([{id, prompt, topic?, visibility, sentiment, position, mentions?}])
 * Attributes: title, quota-used, quota-total
 * Events: add-prompt, row-click (detail {row})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class BrandPromptTableElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'quota-used', 'quota-total'];
  }

  constructor() {
    super();
    this._rows = [];
    this._bound = false;
  }

  connectedCallback() {
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        if (event.target.closest('[data-brand-add]')) {
          this.dispatchEvent(new CustomEvent('add-prompt'));
          return;
        }
        const rowEl = event.target.closest('[data-brand-row]');
        if (rowEl) {
          const row = this._rows.find((r) => r.id === rowEl.getAttribute('data-brand-row'));
          if (row) this.dispatchEvent(new CustomEvent('row-click', { detail: { row } }));
        }
      });
    }
  }

  get rows() { return this._rows; }
  set rows(v) {
    this._rows = Array.isArray(v) ? v.map((r) => ({ ...r })) : [];
    this.render();
  }

  attributeChangedCallback() {
    if (this._rows.length === 0 && this.innerHTML === '') return;
    this.render();
  }

  render() {
    const title = escapeAttribute(this.getAttribute('title') || 'Prompts');
    const quotaUsed = this.getAttribute('quota-used');
    const quotaTotal = this.getAttribute('quota-total');
    const hasQuota = quotaUsed !== null && quotaTotal !== null;
    const sentimentClass = (s) =>
      s >= 70 ? 'text-emerald-600 dark:text-emerald-400' : s >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400';

    const body = this._rows.length === 0
      ? '<p data-brand-empty class="px-4 py-8 text-center text-xs text-zinc-500 dark:text-zinc-400">No prompts tracked yet — add your first brand prompt.</p>'
      : `<table class="w-full text-left text-xs">
  <thead>
    <tr class="border-b border-zinc-200 text-[11px] uppercase tracking-wide text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
      <th class="px-4 py-2 font-semibold">Prompt</th>
      <th class="px-3 py-2 font-semibold">Visibility</th>
      <th class="px-3 py-2 font-semibold">Sentiment</th>
      <th class="px-3 py-2 font-semibold">Position</th>
    </tr>
  </thead>
  <tbody>
    ${this._rows.map((row) => `
    <tr data-brand-row="${escapeAttribute(row.id)}" class="cursor-pointer border-b border-zinc-100 transition-colors last:border-0 hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/40">
      <td class="max-w-xs truncate px-4 py-2.5 font-medium text-zinc-800 dark:text-zinc-100">${escapeAttribute(row.prompt)}</td>
      <td data-brand-visibility class="px-3 py-2.5 text-zinc-600 dark:text-zinc-300">${row.visibility}%</td>
      <td data-brand-sentiment class="px-3 py-2.5 font-semibold ${sentimentClass(row.sentiment)}">${row.sentiment}</td>
      <td data-brand-position class="px-3 py-2.5 text-zinc-600 dark:text-zinc-300">#${row.position}</td>
    </tr>`).join('')}
  </tbody>
</table>`;

    this.innerHTML = `<div data-brand-prompt-table class="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
  <div class="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
    <div class="flex items-center gap-3">
      <h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${title}</h3>
      ${hasQuota ? `<span data-brand-quota class="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">${escapeAttribute(quotaUsed)} / ${escapeAttribute(quotaTotal)} prompts</span>` : ''}
    </div>
    <button type="button" data-brand-add class="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500">+ Add Prompt</button>
  </div>
  ${body}
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('brand-prompt-table')) {
  customElements.define('brand-prompt-table', BrandPromptTableElement);
}

export default BrandPromptTableElement;
