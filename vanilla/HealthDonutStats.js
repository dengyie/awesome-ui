/**
 * HealthDonutStats - Vanilla Web Component
 * Usage: <health-donut-stats></health-donut-stats> with `cards` property
 * Properties: cards ({ title, caption?, slices: { label, value, tone }[], action?: { label } }[])
 * Events: action-click (detail: { index, label })
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const TONE_DOT = {
  indigo: 'bg-indigo-500',
  amber: 'bg-amber-400',
  zinc: 'bg-zinc-300 dark:bg-zinc-700',
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500',
};

const SLICE_COLOR = {
  indigo: 'bg-indigo-500',
  amber: 'bg-amber-400',
  zinc: 'bg-zinc-300',
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500',
};

const sumOf = (slices) => slices.reduce((sum, slice) => sum + Math.max(0, slice.value), 0);

const donutGradient = (slices) => {
  const total = sumOf(slices) || 1;
  let cursor = 0;
  const stops = [];
  slices.forEach((slice) => {
    const start = (cursor / total) * 360;
    cursor += Math.max(0, slice.value);
    const end = (cursor / total) * 360;
    stops.push(`${SLICE_COLOR[slice.tone]} ${start}deg ${end}deg`);
  });
  return `conic-gradient(${stops.join(', ')})`;
};

export class HealthDonutStatsElement extends HTMLElement {
  static get observedAttributes() {
    return [];
  }

  constructor() {
    super();
    this._cards = [];
  }

  get cards() {
    return this._cards;
  }

  set cards(value) {
    this._cards = Array.isArray(value) ? value : [];
    this.render();
  }

  connectedCallback() {
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
    this._applyHostClass('grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3');
    const cards = this._cards;
    if (!cards.length) {
      this.innerHTML = '';
      return;
    }

    this.innerHTML = cards
      .map((card, index) => {
        const total = sumOf(card.slices);
        const primary = card.slices.reduce(
          (best, slice) => (slice.value > best.value ? slice : best),
          card.slices[0] || { label: '', value: 0, tone: 'indigo' },
        );
        const percent = total ? Math.round((primary.value / total) * 100) : 0;
        const legend = card.slices
          .map((slice, sliceIndex) => {
            const share = total ? Math.round((slice.value / total) * 100) : 0;
            return `<li class="flex items-center gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-300">
              <span class="h-2 w-2 shrink-0 rounded-full ${TONE_DOT[slice.tone]}"></span>
              <span class="min-w-0 flex-1 truncate">${escapeAttribute(slice.label)}</span>
              <span class="shrink-0 font-medium tabular-nums">${share}%</span>
            </li>`;
          })
          .join('');
        return `<div data-donut-card="${index}" class="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div class="flex items-center gap-4">
            <div class="relative h-16 w-16 shrink-0">
              <div class="h-16 w-16 rounded-full" style="background:${donutGradient(card.slices)}"></div>
              <div class="absolute inset-[10px] flex items-center justify-center rounded-full bg-white dark:bg-zinc-900">
                <span data-donut-center class="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">${percent}%</span>
              </div>
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-xs font-semibold text-zinc-800 dark:text-zinc-200">${escapeAttribute(card.title)}</p>
              ${card.caption ? `<p class="mt-0.5 text-[10px] text-zinc-400">${escapeAttribute(card.caption)}</p>` : ''}
              <ul class="mt-2 space-y-1">${legend}</ul>
            </div>
          </div>
          ${
            card.action
              ? `<button type="button" data-donut-action data-action-index="${index}" class="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">${escapeAttribute(card.action.label)}</button>`
              : ''
          }
        </div>`;
      })
      .join('');

    this.querySelectorAll('[data-donut-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const index = Number(button.getAttribute('data-action-index'));
        const card = this._cards[index];
        if (typeof this.onActionClick === 'function') this.onActionClick(index, card?.action?.label);
        this.dispatchEvent(new CustomEvent('action-click', { detail: { index, label: card?.action?.label } }));
      });
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('health-donut-stats')) {
  customElements.define('health-donut-stats', HealthDonutStatsElement);
}
export default HealthDonutStatsElement;
