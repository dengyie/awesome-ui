/**
 * PaywallDialog - Vanilla Web Component
 * Intercepting paywall modal: glyph tile, title/description, Monthly/Yearly
 * cadence toggle with note chips, plan cards (featured dark card, strikethrough
 * original price, feature checklist), discount corner badge and upgrade CTA.
 *
 * Usage: <paywall-dialog title="Upgrade to continue" discount-badge="25% OFF" default-open></paywall-dialog>
 * Attributes: title, description, glyph, cadences (comma separated), cadence,
 * cta-label, discount-badge, default-open
 * Properties: plans [{id,name,price,period,originalPrice,badge,features,featured}],
 *             cadenceNote {cadence: note}, cadencePrices {planId: {cadence: price}}
 * Events: cadence-change (detail {cadence}), upgrade (detail {plan}), dismiss
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class PaywallDialogElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'description', 'glyph', 'cadences', 'cadence', 'cta-label', 'discount-badge', 'default-open'];
  }

  constructor() {
    super();
    this._plans = [];
    this._cadenceNote = {};
    this._cadencePrices = {};
    this._open = false;
    this._bound = false;
  }

  get plans() {
    return this._plans;
  }

  set plans(value) {
    this._plans = Array.isArray(value) ? value : [];
    this.render();
  }

  get cadenceNote() {
    return this._cadenceNote;
  }

  set cadenceNote(value) {
    this._cadenceNote = value && typeof value === 'object' ? value : {};
    this.render();
  }

  get cadencePrices() {
    return this._cadencePrices;
  }

  set cadencePrices(value) {
    this._cadencePrices = value && typeof value === 'object' ? value : {};
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'default-open') this._open = newValue !== null;
    this.render();
  }

  connectedCallback() {
    if (this.hasAttribute('default-open')) this._open = true;
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const dismiss = event.target.closest('[data-paywall-dismiss]');
        if (dismiss) {
          this._open = false;
          this.render();
          this.dispatchEvent(new CustomEvent('dismiss'));
          return;
        }
        const backdrop = event.target.closest('[data-paywall-backdrop]');
        if (backdrop) {
          this._open = false;
          this.render();
          this.dispatchEvent(new CustomEvent('dismiss'));
          return;
        }
        const cad = event.target.closest('[data-paywall-cadence-option]');
        if (cad) {
          this.setAttribute('cadence', cad.getAttribute('data-paywall-cadence-option'));
          this.dispatchEvent(new CustomEvent('cadence-change', { detail: { cadence: this.getAttribute('cadence') } }));
          return;
        }
        const planBtn = event.target.closest('[data-paywall-plan]');
        if (planBtn) {
          const plan = this._plans.find((p) => p.id === planBtn.getAttribute('data-paywall-plan'));
          if (plan) this.dispatchEvent(new CustomEvent('upgrade', { detail: { plan } }));
        }
      });
    }
  }

  show() {
    this._open = true;
    this.render();
  }

  close() {
    this._open = false;
    this.render();
  }

  render() {
    if (!this._open) {
      this.innerHTML = '';
      return;
    }

    const title = this.getAttribute('title') || 'Upgrade to continue';
    const description =
      this.getAttribute('description') ||
      "You've reached the limit of the free plan. Upgrade to unlock this feature.";
    const glyph = this.getAttribute('glyph') || '🔒';
    const cadences = (this.getAttribute('cadences') || 'Monthly,Yearly')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const allCadences = cadences.length ? cadences : ['Monthly'];
    const cadence = allCadences.includes(this.getAttribute('cadence'))
      ? this.getAttribute('cadence')
      : allCadences[0];
    const ctaLabel = this.getAttribute('cta-label') || 'Upgrade now';
    const discountBadge = this.getAttribute('discount-badge');

    const priceFor = (plan) => {
      const byPlan = this._cadencePrices[plan.id];
      return (byPlan && byPlan[cadence]) || plan.price;
    };

    const cadencePills = allCadences
      .map((c) => {
        const active = c === cadence;
        const cls = active
          ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50'
          : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400';
        const note = this._cadenceNote[c]
          ? `<span class="ml-1 rounded-full bg-emerald-100 px-1.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">${escapeAttribute(this._cadenceNote[c])}</span>`
          : '';
        return `<button type="button" role="tab" aria-selected="${active}" data-paywall-cadence-option="${escapeAttribute(c)}" class="rounded-md px-3 py-1 text-xs font-medium transition-colors ${cls}">${escapeAttribute(c)}${note}</button>`;
      })
      .join('');

    const planCards = this._plans
      .map((plan) => {
        const featured = Boolean(plan.featured);
        const cardCls = featured
          ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
          : 'border-zinc-200 bg-white text-zinc-900 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:border-zinc-500';
        const badge = plan.badge
          ? `<span class="absolute -top-2 left-3 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              featured ? 'bg-violet-600 text-white' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
            }">${escapeAttribute(plan.badge)}</span>`
          : '';
        const original = plan.originalPrice
          ? `<p class="text-[11px] line-through text-zinc-400 dark:text-zinc-500">${escapeAttribute(plan.originalPrice)}</p>`
          : '';
        const features = (plan.features || [])
          .map(
            (f) =>
              `<li class="flex items-start gap-1 text-[11px] leading-snug ${
                featured ? 'text-zinc-200 dark:text-zinc-700' : 'text-zinc-500 dark:text-zinc-400'
              }"><span aria-hidden="true" class="${featured ? 'text-emerald-400' : 'text-emerald-500'}">✓</span>${escapeAttribute(f)}</li>`,
          )
          .join('');
        return `<button type="button" data-paywall-plan="${escapeAttribute(plan.id)}" class="relative rounded-xl border p-3 text-left transition-colors ${cardCls}">
          ${badge}
          <p class="text-xs font-semibold">${escapeAttribute(plan.name)}</p>
          <p class="mt-1"><span class="font-mono text-lg font-bold">${escapeAttribute(priceFor(plan))}</span>
          <span class="ml-0.5 text-[11px] ${featured ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-400'}">${escapeAttribute(plan.period || '')}</span></p>
          ${original}
          <ul class="mt-2 space-y-1">${features}</ul>
        </button>`;
      })
      .join('');

    const cols = Math.min(this._plans.length, 3) || 1;

    this.innerHTML = `
      <div data-paywall-dialog role="dialog" aria-modal="true" aria-label="${escapeAttribute(title)}" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div data-paywall-backdrop data-paywall-overlay class="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"></div>
        <div data-paywall-panel class="relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
          ${discountBadge ? `<span data-paywall-discount class="absolute right-4 top-4 z-10 rotate-3 rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-bold text-amber-950 shadow">${escapeAttribute(discountBadge)}</span>` : ''}
          <div class="flex flex-col items-center px-6 pb-6 pt-8 text-center">
            <div data-paywall-glyph class="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-2xl dark:bg-violet-950/60" aria-hidden="true">${escapeAttribute(glyph)}</div>
            <h2 data-paywall-title class="mt-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(title)}</h2>
            <p data-paywall-description class="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">${escapeAttribute(description)}</p>
            ${allCadences.length > 1 ? `<div data-paywall-cadence role="tablist" aria-label="Billing cadence" class="mt-4 flex items-center rounded-lg border border-zinc-200 bg-zinc-100 p-0.5 dark:border-zinc-700 dark:bg-zinc-800">${cadencePills}</div>` : ''}
            <div data-paywall-plans class="mt-4 grid w-full gap-2" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${planCards}</div>
            <button type="button" data-paywall-cta class="mt-4 w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700">${escapeAttribute(ctaLabel)} · ${escapeAttribute(cadence)}</button>
            <button type="button" data-paywall-dismiss class="mt-2 text-xs text-zinc-400 underline-offset-2 hover:text-zinc-600 hover:underline dark:text-zinc-500 dark:hover:text-zinc-300">Maybe later</button>
          </div>
        </div>
      </div>`;
  }
}

export default PaywallDialogElement;

if (!customElements.get('paywall-dialog')) {
  customElements.define('paywall-dialog', PaywallDialogElement);
}
