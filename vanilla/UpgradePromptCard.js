import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const formatNumber = (value) => (typeof value === 'number' ? value.toLocaleString('en-US') : String(value));

export class UpgradePromptCardElement extends HTMLElement {
  static get observedAttributes() {
    return ['used', 'limit', 'plan-name', 'unit', 'title', 'features', 'cta-text'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  get features() {
    if (this._features) return this._features;
    try {
      return JSON.parse(this.getAttribute('features') || '[]');
    } catch {
      return [];
    }
  }

  set features(value) {
    this._features = Array.isArray(value) ? value : [];
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
    const used = Number(this.getAttribute('used') || 0);
    const limit = Number(this.getAttribute('limit') || 0);
    const planName = this.getAttribute('plan-name') || 'Free';
    const unit = this.getAttribute('unit') || 'requests';
    const title = this.getAttribute('title') || 'Upgrade to keep going';
    const ctaText = this.getAttribute('cta-text') || 'See plans';
    const features = this.features;

    const safeLimit = limit > 0 ? limit : 1;
    const percent = Math.min(100, Math.max(0, Math.round((used / safeLimit) * 100)));
    const tone =
      percent >= 90
        ? { bar: 'bg-red-500', text: 'text-red-600 dark:text-red-400', chip: 'bg-red-50 dark:bg-red-950/40' }
        : percent >= 70
          ? { bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', chip: 'bg-amber-50 dark:bg-amber-950/40' }
          : { bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', chip: 'bg-emerald-50 dark:bg-emerald-950/40' };

    this._applyHostClass('block');

    const featureItems = features
      .map(
        (feature) => `
        <li class="flex items-start gap-2 text-[11px] text-zinc-600 dark:text-zinc-300">
          <span class="mt-0.5 shrink-0 text-emerald-500">${uiIcon('check', { size: 12 })}</span>
          <span>${escapeAttribute(feature)}</span>
        </li>`
      )
      .join('');

    this.innerHTML = `
      <div class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
        <div class="flex items-start gap-3">
          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone.chip} ${tone.text}">${uiIcon('zap', { size: 16 })}</span>
          <div class="min-w-0">
            <div class="text-xs font-semibold text-zinc-900 dark:text-zinc-100">${escapeAttribute(title)}</div>
            <div class="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">You're on the ${escapeAttribute(planName)} plan — ${percent}% of your ${escapeAttribute(unit)} used.</div>
          </div>
        </div>

        <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div class="h-full rounded-full ${tone.bar} transition-all duration-300" style="width: ${percent}%"></div>
        </div>

        <div class="mt-1.5 flex items-center text-[11px] text-zinc-500 dark:text-zinc-400">
          <span class="tabular-nums">${formatNumber(used)} / ${formatNumber(limit)} ${escapeAttribute(unit)}</span>
          <span class="ml-auto tabular-nums ${tone.text}">${percent}%</span>
        </div>

        ${featureItems ? `<ul class="mt-3 space-y-1.5">${featureItems}</ul>` : ''}

        <button type="button"
          class="upgrade-cta mt-3 w-full rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900">
          ${escapeAttribute(ctaText)}
        </button>
      </div>`;

    this.querySelector('.upgrade-cta').addEventListener('click', () => this.dispatchEvent(new CustomEvent('upgrade')));
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('upgrade-prompt-card')) {
  customElements.define('upgrade-prompt-card', UpgradePromptCardElement);
}
export default UpgradePromptCardElement;
