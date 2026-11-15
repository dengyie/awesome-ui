/**
 * OrderSummaryPanel - Vanilla Web Component
 * Usage: <order-summary rows='[...]' cta-label="Place your order" cta-amount="$6.53"></order-summary>
 * Attributes: rows (JSON [{id,label,value,kind?,strikeValue?,note?}]), heading, cta-label, cta-amount,
 *             promo-placeholder, applied-promos (JSON), trust-footer
 * Events: cta, apply-promo (detail {code}), remove-promo (detail {code})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const KIND_TONE = {
  discount: 'text-emerald-600 dark:text-emerald-400',
  fee: 'text-emerald-600 dark:text-emerald-400',
  total: 'text-zinc-900 dark:text-zinc-50',
};

export class OrderSummaryPanelElement extends HTMLElement {
  static get observedAttributes() {
    return ['rows', 'heading', 'cta-label', 'cta-amount', 'promo-placeholder', 'applied-promos', 'trust-footer'];
  }

  constructor() {
    super();
    this._rows = [];
    this._bound = false;
  }

  connectedCallback() {
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
        if (event.target.closest('[data-summary-cta]')) {
          this.dispatchEvent(new CustomEvent('cta'));
          return;
        }
        const remove = event.target.closest('[data-promo-remove]');
        if (remove) {
          this.dispatchEvent(new CustomEvent('remove-promo', { detail: { code: remove.getAttribute('data-promo-remove') } }));
          return;
        }
        if (event.target.closest('[data-promo-apply]')) {
          const input = this.querySelector('[data-promo-input]');
          const code = input ? input.value.trim() : '';
          if (!code) return;
          if (input) input.value = '';
          this.dispatchEvent(new CustomEvent('apply-promo', { detail: { code } }));
        }
      });
      this.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && event.target && event.target.hasAttribute && event.target.hasAttribute('data-promo-input')) {
          const code = event.target.value.trim();
          if (!code) return;
          event.target.value = '';
          this.dispatchEvent(new CustomEvent('apply-promo', { detail: { code } }));
        }
      });
    }
  }

  attributeChangedCallback() {
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

  appliedPromosResolved() {
    const raw = this.getAttribute('applied-promos');
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  render() {
    this._applyHostClass('block');
    const heading = this.getAttribute('heading') || 'Order summary';
    const ctaLabel = this.getAttribute('cta-label') || 'Place your order';
    const ctaAmount = this.getAttribute('cta-amount') || '';
    const promoPlaceholder = this.getAttribute('promo-placeholder') || 'Add a promo code';
    const trustFooter = this.getAttribute('trust-footer') || '';
    const promos = this.appliedPromosResolved();
    const rowsHtml = this._rows
      .map((row, index) => {
        const isTotal = row.kind === 'total';
        const labelCls = isTotal ? 'font-semibold text-zinc-900 dark:text-zinc-50' : 'text-zinc-500 dark:text-zinc-400';
        const valueCls = KIND_TONE[row.kind || ''] || 'text-zinc-800 dark:text-zinc-200';
        const strike = row.strikeValue ? `<span class="mr-1.5 font-normal text-zinc-400 line-through">${escapeAttribute(row.strikeValue)}</span>` : '';
        const note = row.note ? `<span class="ml-1 text-[10px] text-zinc-400">(${escapeAttribute(row.note)})</span>` : '';
        const totalBorder = isTotal ? 'border-t border-zinc-200 pt-2 dark:border-zinc-700' : '';
        return `<li data-summary-row="${escapeAttribute(row.id)}" class="flex items-baseline justify-between gap-3 ${totalBorder}">
          <span class="text-xs ${labelCls}">${escapeAttribute(row.label)}${note}</span>
          <span class="shrink-0 text-xs font-medium ${valueCls}">${strike}${escapeAttribute(row.value)}</span>
        </li>`;
      })
      .join('');
    const promosHtml = promos.length
      ? `<ul class="mb-2 space-y-1">${promos
          .map(
            (promo) => `<li data-promo-applied class="flex items-center justify-between rounded-md bg-emerald-50 px-2 py-1 dark:bg-emerald-950/40">
              <span class="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">${escapeAttribute(promo)} applied</span>
              <button type="button" data-promo-remove="${escapeAttribute(promo)}" aria-label="Remove ${escapeAttribute(promo)}" class="text-[11px] text-emerald-600 hover:underline dark:text-emerald-400">Remove</button>
            </li>`,
          )
          .join('')}</ul>`
      : '';

    this.innerHTML = `<div data-order-summary class="w-full rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(heading)}</p>
      <ul class="mt-3 space-y-2">${rowsHtml}</ul>
      <div data-promo-block class="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
        ${promosHtml}
        <div class="flex gap-1.5">
          <input type="text" data-promo-input placeholder="${escapeAttribute(promoPlaceholder)}" class="min-w-0 flex-1 rounded-lg border border-zinc-300 px-2 py-1.5 text-xs text-zinc-800 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          <button type="button" data-promo-apply class="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 focus-visible:outline-none dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800">Apply</button>
        </div>
      </div>
      <button type="button" data-summary-cta class="mt-3 w-full rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white">${escapeAttribute(ctaLabel)}${ctaAmount ? ` · ${escapeAttribute(ctaAmount)}` : ''}</button>
      ${trustFooter ? `<p data-trust-footer class="mt-2 flex items-center justify-center gap-1 text-[10px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3 w-3"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>${escapeAttribute(trustFooter)}</p>` : ''}
    </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('order-summary')) {
  customElements.define('order-summary', OrderSummaryPanelElement);
}

export default OrderSummaryPanelElement;
