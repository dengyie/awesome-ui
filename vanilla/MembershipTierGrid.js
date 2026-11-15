/**
 * MembershipTierGrid - Vanilla Web Component
 * Usage: <membership-tier-grid tiers='[{"id":"spark","name":"Spark","price":"$2.50","perks":["Ad-free"]}]'></membership-tier-grid>
 * Attributes: title, subtitle, tiers (JSON [{id,name,price,period?,image?,description?,perks?,badge?,limited?,highlighted?,ctaText?}])
 * Property: tiers
 * Events: select (detail.tier)
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class MembershipTierGridElement extends HTMLElement {
  static get observedAttributes() {
    return ['tiers', 'title', 'subtitle'];
  }

  constructor() {
    super();
    this._tiers = [];
    this._bound = false;
  }

  connectedCallback() {
    if (!this._tiers.length) {
      const raw = this.getAttribute('tiers');
      if (raw) { try { this._tiers = JSON.parse(raw); } catch { this._tiers = []; } }
    }
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const cta = event.target.closest('[data-membership-cta]');
        if (cta) {
          const tierId = cta.getAttribute('data-membership-cta');
          const tier = this._tiers.find((t) => String(t.id) === tierId);
          this.dispatchEvent(new CustomEvent('select', { detail: { tier: tier || tierId } }));
        }
      });
    }
  }

  get tiers() { return this._tiers; }
  set tiers(v) {
    this._tiers = Array.isArray(v) ? v : [];
    this.render();
  }

  attributeChangedCallback(name) {
    if (name === 'tiers' && this.getAttribute(name)) {
      try { this._tiers = JSON.parse(this.getAttribute(name)); } catch { /* keep */ }
    }
    if (this._tiers.length) this.render();
  }

  render() {
    const title = escapeAttribute(this.getAttribute('title') || 'Get more from this creator');
    const subtitle = escapeAttribute(this.getAttribute('subtitle') || 'Upgrade to access exclusive benefits.');
    const count = this._tiers.length;
    const gridClass = count >= 3 ? 'md:grid-cols-3' : count === 2 ? 'md:grid-cols-2' : '';

    const cards = this._tiers.map((tier) => `
      <div data-membership-tier="${escapeAttribute(String(tier.id))}" class="overflow-hidden rounded-xl border bg-white ${tier.highlighted ? 'border-zinc-900' : 'border-zinc-200'}">
        ${tier.image ? `<img src="${escapeAttribute(tier.image)}" alt="${escapeAttribute(tier.name)}" class="h-36 w-full object-cover" />` : ''}
        <div class="p-5">
          <div class="flex items-center justify-between">
            <span class="text-base font-semibold text-zinc-900">${escapeAttribute(tier.name)}</span>
            ${tier.badge ? `<span class="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">${escapeAttribute(tier.badge)}</span>` : ''}
          </div>
          <div class="mt-1 flex items-baseline gap-1">
            <span data-membership-price class="text-xl font-bold text-zinc-900">${escapeAttribute(tier.price)}</span>
            <span class="text-xs text-zinc-500">/ ${escapeAttribute(tier.period || 'month')}</span>
          </div>
          ${tier.limited !== undefined ? `<p data-membership-limited class="mt-2 text-xs font-semibold text-zinc-700">Limited (${escapeAttribute(String(tier.limited))} remaining)</p>` : ''}
          <button type="button" data-membership-cta="${escapeAttribute(String(tier.id))}" class="mt-3 w-full rounded-md px-3 py-2 text-sm font-semibold transition-colors ${tier.highlighted ? 'bg-zinc-900 text-white hover:bg-zinc-700' : 'border border-zinc-300 text-zinc-800 hover:border-zinc-500'}">${escapeAttribute(tier.ctaText || 'Start 7-day free trial')}</button>
          ${tier.description ? `<p class="mt-3 text-xs leading-relaxed text-zinc-600">${escapeAttribute(tier.description)}</p>` : ''}
          ${tier.perks && tier.perks.length ? `<ul data-membership-perks class="mt-3 space-y-1.5">
            ${tier.perks.map((perk) => `<li class="flex items-start gap-2 text-xs text-zinc-700"><span class="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>${escapeAttribute(perk)}</li>`).join('')}
          </ul>` : ''}
        </div>
      </div>`).join('');

    this.innerHTML = `<div data-membership-grid>
  <div class="text-center">
    <h3 data-membership-title class="text-xl font-bold text-zinc-900">${title}</h3>
    <p class="mt-1 text-sm text-zinc-500">${subtitle}</p>
  </div>
  <div class="mt-6 grid gap-5 ${gridClass}">${cards}
  </div>
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('membership-tier-grid')) {
  customElements.define('membership-tier-grid', MembershipTierGridElement);
}

export default MembershipTierGridElement;
