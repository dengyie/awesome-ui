/**
 * MapPropertyCard - Map property bubble: price pins over a map placeholder
 * and a floating preview card with image dots, like/close buttons, title +
 * rating, subtitle and price range with dates
 * (Airbnb map property pattern).
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

const DEFAULT_PINS = () => [
  { id: 'p1', price: '$148', x: 22, y: 30 },
  { id: 'p2', price: '$111', x: 68, y: 48 },
  { id: 'p3', price: '$136', x: 40, y: 70 },
  { id: 'p4', price: '$137', x: 58, y: 82 },
  { id: 'p5', price: '$112', x: 82, y: 25 },
];

const DEFAULT_CARD = () => ({
  id: 'p2',
  images: [],
  title: 'Home in Kecamatan Denpasar',
  rating: '4.93',
  reviews: 27,
  subtitle: 'Private Joglo in heart of Sanur',
  price: '$111 for 2 nights',
  dates: 'Jun 20 – 22',
});

class MapPropertyCardElement extends HTMLElement {
  static get observedAttributes() {
    return ['pins', 'active-pin-id', 'card', 'like-label', 'close-label'];
  }

  constructor() {
    super();
    this._bound = false;
    this._pins = DEFAULT_PINS();
    this._activePinId = 'p2';
    this._card = DEFAULT_CARD();
    this._likeLabel = '♡';
    this._closeLabel = '✕';
  }

  connectedCallback() {
    this._pins = parseJsonAttr(this.getAttribute('pins'), DEFAULT_PINS());
    const ap = this.getAttribute('active-pin-id');
    if (ap) this._activePinId = ap;
    const cardRaw = this.getAttribute('card');
    if (cardRaw === 'null' || cardRaw === '') this._card = null;
    else if (cardRaw) this._card = parseJsonAttr(cardRaw, DEFAULT_CARD());
    const ll = this.getAttribute('like-label');
    if (ll) this._likeLabel = ll;
    const cl = this.getAttribute('close-label');
    if (cl) this._closeLabel = cl;
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
    if (this._bound === false && this.innerHTML === '') return;
    if (name === 'pins') this._pins = parseJsonAttr(newValue, DEFAULT_PINS());
    if (name === 'active-pin-id') this._activePinId = newValue || 'p2';
    if (name === 'card') this._card = (newValue === 'null' || newValue === '') ? null : parseJsonAttr(newValue, DEFAULT_CARD());
    if (name === 'like-label') this._likeLabel = newValue || '♡';
    if (name === 'close-label') this._closeLabel = newValue || '✕';
    this._render();
  }

  _onClick(event) {
    const pin = event.target.closest('[data-mappin-pin]');
    if (pin) {
      const found = this._pins.find((p) => p.id === pin.getAttribute('data-mappin-pin'));
      if (found) {
        this._activePinId = found.id;
        this._render();
        this.dispatchEvent(new CustomEvent('pin-click', { detail: { pin: found }, bubbles: true }));
        return;
      }
    }
    if (event.target.closest('[data-mappin-close]')) {
      this._card = null;
      this._render();
      this.dispatchEvent(new CustomEvent('card-close', { bubbles: true }));
      return;
    }
    if (event.target.closest('[data-mappin-like]')) {
      this.dispatchEvent(new CustomEvent('card-like', { bubbles: true }));
    }
  }

  _render() {
    const pinsHtml = this._pins
      .map((pin) => {
        const active = pin.id === this._activePinId;
        const cls = active
          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
          : 'bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50';
        return `<button data-mappin-pin="${escapeAttribute(pin.id)}" data-mappin-price="${escapeAttribute(pin.price)}" type="button" style="left:${Number(pin.x)}%;top:${Number(pin.y)}%" class="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 text-sm font-semibold shadow-md transition-transform hover:scale-105 ${cls}">${escapeAttribute(pin.price)}</button>`;
      })
      .join('');

    const card = this._card;
    const cardHtml = card
      ? `<div data-mappin-preview class="absolute bottom-8 left-1/2 z-20 w-72 -translate-x-1/2 overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-zinc-900">
          <div data-mappin-image class="relative h-36 bg-gradient-to-br from-amber-200 via-orange-200 to-rose-200 dark:from-amber-900 dark:via-orange-900 dark:to-rose-900">
            <div class="absolute right-3 top-3 flex gap-2">
              <button data-mappin-like type="button" aria-label="Save" class="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-sm text-zinc-800 shadow transition-colors hover:bg-white dark:bg-zinc-800/90 dark:text-zinc-100">${escapeAttribute(this._likeLabel)}</button>
              <button data-mappin-close type="button" aria-label="Close preview" class="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-sm text-zinc-800 shadow transition-colors hover:bg-white dark:bg-zinc-800/90 dark:text-zinc-100">${escapeAttribute(this._closeLabel)}</button>
            </div>
            <div data-mappin-dots class="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
              <span class="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true"></span>
              <span class="h-1.5 w-1.5 rounded-full bg-white/50" aria-hidden="true"></span>
              <span class="h-1.5 w-1.5 rounded-full bg-white/50" aria-hidden="true"></span>
              <span class="h-1.5 w-1.5 rounded-full bg-white/50" aria-hidden="true"></span>
            </div>
            <button data-mappin-next aria-label="Next image" class="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xs text-zinc-800 shadow transition-colors hover:bg-white dark:bg-zinc-800/90 dark:text-zinc-100">›</button>
          </div>
          <div class="space-y-0.5 px-4 py-3">
            <div class="flex items-center justify-between gap-2">
              <p data-mappin-title class="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(card.title)}</p>
              <p data-mappin-rating class="shrink-0 text-xs text-zinc-700 dark:text-zinc-200">★ ${escapeAttribute(card.rating)} (${escapeAttribute(card.reviews)})</p>
            </div>
            <p data-mappin-subtitle class="truncate text-sm text-zinc-500 dark:text-zinc-400">${escapeAttribute(card.subtitle)}</p>
            <p data-mappin-price class="text-sm text-zinc-900 dark:text-zinc-50">${escapeAttribute(card.price)}${card.dates ? `<span class="text-zinc-500 dark:text-zinc-400"> · ${escapeAttribute(card.dates)}</span>` : ''}</p>
          </div>
        </div>`
      : '';

    this.innerHTML = `
      <div data-mappin-card class="relative min-h-[420px] w-full overflow-hidden rounded-xl border border-zinc-200 bg-sky-50 shadow-sm dark:border-zinc-800 dark:bg-sky-950/30">
        <div class="absolute inset-0" aria-hidden="true"></div>
        ${pinsHtml}
        ${cardHtml}
        <div data-mappin-zoom class="absolute right-4 top-4 z-20 flex flex-col overflow-hidden rounded-xl bg-white shadow-md dark:bg-zinc-900">
          <button class="border-b border-zinc-100 px-3 py-2 text-zinc-600 dark:border-zinc-800 dark:text-zinc-300" aria-label="Zoom in">＋</button>
          <button class="px-3 py-2 text-zinc-600 dark:text-zinc-300" aria-label="Zoom out">－</button>
        </div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('map-property-card')) {
  customElements.define('map-property-card', MapPropertyCardElement);
}

export default MapPropertyCardElement;
