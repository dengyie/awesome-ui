/**
 * JumpBackIn - "Jump back in" resume card row: thumbnail image (or gradient
 * placeholder), kind badge, title and subtitle per card (Mindtrip).
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

const KIND_TONES = {
  trip: 'bg-sky-600/90 text-sky-50',
  chat: 'bg-zinc-900/85 text-zinc-50',
};

class JumpBackInElement extends HTMLElement {
  static get observedAttributes() {
    return ['cards'];
  }

  constructor() {
    super();
    this._bound = false;
    this._cards = [];
  }

  connectedCallback() {
    if (!this._cards.length) {
      this._cards = parseJsonAttr(this.getAttribute('cards'), [
        { id: 'c1', kind: 'Trip', title: 'Trip to Japan, September 2026', subtitle: 'Tokyo · Starting 14 Sept' },
        { id: 'c2', kind: 'Chat', title: 'Mount Fuji Trip Planning', subtitle: 'Last touched 2 days ago' },
        { id: 'c3', kind: 'Trip', title: 'Kyoto Autumn Walk', subtitle: 'Kyoto · Draft itinerary' },
      ]);
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
    if (name === 'cards' && !this._cards.length) {
      this._cards = parseJsonAttr(this.getAttribute('cards'), []);
    }
    if (this._bound === false && this.innerHTML === '') return;
    this._render();
  }

  get cards() {
    return this._cards;
  }
  set cards(value) {
    this._cards = Array.isArray(value) ? value : [];
    this._render();
  }

  _onClick(event) {
    const cardEl = event.target.closest('[data-jump-back-in-card]');
    if (cardEl) {
      const card = this._cards.find((c) => String(c.id) === cardEl.getAttribute('data-jump-back-in-card'));
      if (card) {
        this.dispatchEvent(new CustomEvent('card-click', { detail: { card }, bubbles: true }));
      }
    }
  }

  _render() {
    const cardsHtml = this._cards
      .map(
        (card) => `
        <button type="button" data-jump-back-in-card="${escapeAttribute(card.id)}" class="group relative overflow-hidden rounded-xl text-left shadow-sm transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
          ${
            card.image
              ? `<img src="${escapeAttribute(card.image)}" alt="" data-jump-back-in-image class="h-32 w-full object-cover" />`
              : '<div data-jump-back-in-placeholder class="h-32 w-full bg-gradient-to-br from-sky-400 via-indigo-400 to-slate-600"></div>'
          }
          <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8">
            <span data-jump-back-in-kind class="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${KIND_TONES[String(card.kind).toLowerCase()] || 'bg-zinc-900/85 text-zinc-50'}">${escapeAttribute(card.kind)}</span>
            <span data-jump-back-in-card-title class="mt-1 block truncate text-xs font-semibold text-white">${escapeAttribute(card.title)}</span>
            <span data-jump-back-in-card-subtitle class="block truncate text-[11px] text-zinc-200">${escapeAttribute(card.subtitle)}</span>
          </div>
        </button>`
      )
      .join('');

    this.innerHTML = `
      <div data-jump-back-in class="w-full">
        <div class="mb-3 flex items-center justify-between">
          <h3 data-jump-back-in-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Jump back in</h3>
          <button type="button" data-jump-back-in-see-all class="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">See all</button>
        </div>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">${cardsHtml}</div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('jump-back-in')) {
  customElements.define('jump-back-in', JumpBackInElement);
}

export default JumpBackInElement;
