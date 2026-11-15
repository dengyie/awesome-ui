/**
 * BillingPanel - Vanilla Web Component
 * Usage:
 *   <billing-panel plan-name="Scale" price="$207" price-suffix="Per month" cta-label="Upgrade now"
 *     period="monthly" note="14-day trial." features="Unlimited models,Priority support"
 *     line-items='[{"label":"Subtotal","amount":"$207.00"},{"label":"Tax (15%)","amount":"$31.05"},{"label":"Total","amount":"$238.05","emphasized":true}]'></billing-panel>
 * Attributes: plan-name, period (monthly|annual), price, price-suffix, features (comma-separated),
 *             line-items (JSON array), cta-label, note
 * Events: period-change (detail: { period }), cta
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class BillingPanelElement extends HTMLElement {
  static get observedAttributes() {
    return ['plan-name', 'period', 'price', 'price-suffix', 'features', 'line-items', 'cta-label', 'note'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
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

  render() {
    this._applyHostClass('block');
    const planName = this.getAttribute('plan-name') || '';
    const period = this.getAttribute('period') === 'annual' ? 'annual' : 'monthly';
    const price = this.getAttribute('price') || '';
    const priceSuffix = this.getAttribute('price-suffix') || '';
    const ctaLabel = this.getAttribute('cta-label') || '';
    const note = this.getAttribute('note') || '';
    const features = (this.getAttribute('features') || '').split(',').map((f) => f.trim()).filter(Boolean);

    let lineItems = [];
    try {
      const raw = this.getAttribute('line-items');
      if (raw) lineItems = JSON.parse(raw);
    } catch {
      lineItems = [];
    }
    if (!Array.isArray(lineItems)) lineItems = [];

    const check =
      '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
    const info =
      '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>';

    const periodToggle = `<div role="group" aria-label="Billing period"
      class="flex shrink-0 rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-700">
      ${['monthly', 'annual']
        .map(
          (p) => `<button type="button" data-period="${p}" aria-pressed="${period === p}"
          class="rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
            period === p
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }">${p === 'monthly' ? 'Monthly' : 'Annual'}</button>`
        )
        .join('')}
    </div>`;

    const featuresHtml = features.length
      ? `<ul class="mt-3 space-y-1.5">${features
          .map(
            (feature) =>
              `<li class="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300"><span class="shrink-0 text-emerald-500">${check}</span>${escapeAttribute(feature)}</li>`
          )
          .join('')}</ul>`
      : '';

    const itemsHtml = lineItems.length
      ? `<dl class="mt-4 space-y-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">${lineItems
          .map(
            (item) => `<div class="flex items-center justify-between gap-4 ${
              item.emphasized
                ? 'border-t border-zinc-100 pt-2 font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-50'
                : 'text-zinc-500 dark:text-zinc-400'
            }">
              <dt class="text-xs">${escapeAttribute(item.label)}</dt>
              <dd class="text-xs font-medium tabular-nums text-zinc-800 dark:text-zinc-200">${escapeAttribute(item.amount)}</dd>
            </div>`
          )
          .join('')}</dl>`
      : '';

    this.innerHTML = `<div class="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="text-[11px] text-zinc-400">Upgrade to</p>
          <h3 class="text-base font-bold text-zinc-900 dark:text-zinc-50">${escapeAttribute(planName)}</h3>
        </div>
        ${periodToggle}
      </div>
      <p class="mt-3 flex items-baseline gap-1.5">
        <span class="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">${escapeAttribute(price)}</span>
        ${priceSuffix ? `<span class="text-xs text-zinc-400">${escapeAttribute(priceSuffix)}</span>` : ''}
      </p>
      ${featuresHtml}
      ${itemsHtml}
      <button type="button" data-billing-cta
        class="mt-4 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900">${escapeAttribute(ctaLabel)}</button>
      ${note ? `<p class="mt-2.5 flex items-start gap-1.5 rounded-lg bg-sky-50 px-3 py-2 text-[11px] leading-relaxed text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"><span class="mt-0.5 shrink-0">${info}</span>${escapeAttribute(note)}</p>` : ''}
    </div>`;

    this.querySelectorAll('[data-period]').forEach((button) => {
      button.addEventListener('click', () => {
        this.setAttribute('period', button.getAttribute('data-period'));
        this.dispatchEvent(new CustomEvent('period-change', { detail: { period: button.getAttribute('data-period') } }));
      });
    });
    const cta = this.querySelector('[data-billing-cta]');
    if (cta) cta.addEventListener('click', () => this.dispatchEvent(new CustomEvent('cta')));
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('billing-panel')) {
  customElements.define('billing-panel', BillingPanelElement);
}
export default BillingPanelElement;
