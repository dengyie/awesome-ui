/**
 * GuardrailReviewQueue - Vanilla Web Component
 * Usage: <guardrail-review-queue title="Moderation queue" items='[...]'></guardrail-review-queue>
 * Attributes: title, items (JSON: [{id,author,content,reasons:string[],rule?,confidence?,verdict?}])
 * Events: approve (detail {item}), reject (detail {item})
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

export class GuardrailReviewQueueElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'items'];
  }

  constructor() {
    super();
    this._bound = false;
    this._items = [];
  }

  connectedCallback() {
    if (!this._items.length) this._items = parseJsonAttr(this.getAttribute('items'), []);
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const approveBtn = event.target.closest('[data-guardrail-approve]');
        const rejectBtn = event.target.closest('[data-guardrail-reject]');
        if (!approveBtn && !rejectBtn) return;
        const card = (approveBtn || rejectBtn).closest('[data-guardrail-card]');
        const item = this._items.find((i) => i.id === card?.getAttribute('data-guardrail-card'));
        if (!item) return;
        this.dispatchEvent(new CustomEvent(approveBtn ? 'approve' : 'reject', { detail: { item } }));
      });
    }
  }

  attributeChangedCallback(name) {
    if (name === 'items' && !this._items.length) {
      this._items = parseJsonAttr(this.getAttribute('items'), []);
    }
    if (this._bound === false && this.innerHTML === '') return;
    this.render();
  }

  get items() { return this._items; }
  set items(v) {
    this._items = Array.isArray(v) ? v.map((i) => ({ ...i })) : [];
    this.render();
  }

  render() {
    const items = this._items;
    const title = escapeAttribute(this.getAttribute('title') || 'Moderation queue');
    const pending = items.filter((i) => (i.verdict ?? 'pending') === 'pending');

    const cards = items.map((item) => {
      const verdict = item.verdict ?? 'pending';
      if (verdict !== 'pending') {
        return `<div data-guardrail-resolved="${escapeAttribute(item.id)}" class="flex items-center gap-2 px-4 py-2.5 text-[11px] text-zinc-400 dark:text-zinc-500">
          <span class="inline rounded px-1.5 py-0.5 font-medium ${verdict === 'approved'
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
            : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300'}">${verdict === 'approved' ? '✓ Approved' : '✕ Rejected'}</span>
          <span data-guardrail-resolved-author>${escapeAttribute(item.author)}</span>
          <span class="min-w-0 flex-1 truncate">${escapeAttribute(item.content)}</span>
        </div>`;
      }
      const reasons = item.reasons.length > 0
        ? `<div data-guardrail-reasons class="mt-2 flex flex-wrap gap-1.5">
            ${item.reasons.map((reason) => `<span data-guardrail-reason class="inline rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">${escapeAttribute(reason)}</span>`).join('')}
          </div>`
        : '';
      return `<div data-guardrail-card="${escapeAttribute(item.id)}" class="p-4">
        <div class="flex items-center gap-2">
          <span data-guardrail-author class="text-xs font-semibold text-zinc-800 dark:text-zinc-100">${escapeAttribute(item.author)}</span>
          ${typeof item.confidence === 'number'
            ? `<span data-guardrail-confidence class="rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${item.confidence >= 0.9
                ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'}">${Math.round(item.confidence * 100)}% confidence</span>`
            : ''}
          ${item.rule
            ? `<span data-guardrail-rule class="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">${escapeAttribute(item.rule)}</span>`
            : ''}
        </div>
        <p data-guardrail-content class="mt-2 rounded-lg bg-zinc-50 px-3 py-2 text-xs leading-relaxed text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-200">${escapeAttribute(item.content)}</p>
        ${reasons}
        <div class="mt-3 flex gap-2">
          <button type="button" data-guardrail-approve class="flex-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-500">Approve</button>
          <button type="button" data-guardrail-reject class="flex-1 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-500">Reject</button>
        </div>
      </div>`;
    }).join('');

    this.innerHTML = `<div data-guardrail-queue class="w-full rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
  <div class="flex items-center gap-2 border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
    <span class="text-xs font-semibold text-zinc-700 dark:text-zinc-200">${title}</span>
    <span data-guardrail-count class="ml-auto rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-red-700 dark:bg-red-950/60 dark:text-red-300">${pending.length} flagged</span>
  </div>
  <div data-guardrail-list class="divide-y divide-zinc-100 dark:divide-zinc-800">
    ${cards}
    ${items.length === 0 ? '<p data-guardrail-empty class="px-4 py-8 text-center text-xs text-zinc-500 dark:text-zinc-400">No flagged content in the queue.</p>' : ''}
  </div>
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('guardrail-review-queue')) {
  customElements.define('guardrail-review-queue', GuardrailReviewQueueElement);
}

export default GuardrailReviewQueueElement;
