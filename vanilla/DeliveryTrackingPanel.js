/**
 * DeliveryTrackingPanel - Delivery tracking: map placeholder with floating
 * controls, right info column with ETA header, four-step progress stepper,
 * courier card with contact buttons, collapsible order details, gift share
 * block and copy-link / text-me actions
 * (DoorDash delivery tracking pattern).
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

const STEP_ICONS = { store: '🏪', rider: '🛵', car: '🚗', home: '🏠', check: '✓' };
const stepIcon = (name) => STEP_ICONS[name] || '•';

const DEFAULT_STEPS = () => [
  { id: 'store', icon: 'store', label: 'Store', state: 'done' },
  { id: 'pickup', icon: 'rider', label: 'Pickup', state: 'done' },
  { id: 'enroute', icon: 'car', label: 'En route', state: 'active' },
  { id: 'delivered', icon: 'home', label: 'Delivered', state: 'pending' },
];

const DEFAULT_ITEMS = () => [
  { id: 'i1', name: 'Shack Stack', quantity: '2×', price: '$32.78' },
  { id: 'i2', name: 'Cheese Fries', quantity: '1×', price: '$7.49' },
];

class DeliveryTrackingPanelElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'eta-prefix', 'eta', 'status-text', 'steps', 'courier-name', 'courier-role', 'order-name', 'order-summary', 'items', 'gift-recipient', 'gift-message', 'share-title', 'share-description', 'copy-link-label', 'text-link-label'];
  }

  constructor() {
    super();
    this._bound = false;
    this._detailsOpen = true;
    this._title = 'Heading to Sam Lee';
    this._etaPrefix = 'Arrives between';
    this._eta = '8:35 - 8:41 AM';
    this._statusText = 'Your Dasher is heading to Sam Lee with your order.';
    this._steps = DEFAULT_STEPS();
    this._courierName = 'JOSHUA L';
    this._courierRole = 'Your Dasher';
    this._orderName = 'Shake Shack';
    this._orderSummary = '3 Items';
    this._items = DEFAULT_ITEMS();
    this._giftRecipient = 'Sam Lee';
    this._giftMessage = 'Hey, sending over some dinner, hope you enjoy!';
    this._shareTitle = 'Share your digital card with Sam Lee';
    this._shareDescription = "Send a link to your recipient so they can view your digital card and track their gift. They don't need an account.";
    this._copyLinkLabel = 'Copy link';
    this._textLinkLabel = 'Text me the link';
  }

  connectedCallback() {
    const read = (attr, key) => {
      const v = this.getAttribute(attr);
      if (v !== null && v !== '') this[`_${key}`] = v;
    };
    const readJson = (attr, key, fallback) => {
      const v = this.getAttribute(attr);
      if (v) this[`_${key}`] = parseJsonAttr(v, fallback());
    };
    read('title', 'title');
    read('eta-prefix', 'etaPrefix');
    read('eta', 'eta');
    read('status-text', 'statusText');
    readJson('steps', 'steps', DEFAULT_STEPS);
    read('courier-name', 'courierName');
    read('courier-role', 'courierRole');
    read('order-name', 'orderName');
    read('order-summary', 'orderSummary');
    readJson('items', 'items', DEFAULT_ITEMS);
    read('gift-recipient', 'giftRecipient');
    read('gift-message', 'giftMessage');
    read('share-title', 'shareTitle');
    read('share-description', 'shareDescription');
    read('copy-link-label', 'copyLinkLabel');
    read('text-link-label', 'textLinkLabel');
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
    if (name === 'title') this._title = newValue || 'Heading to Sam Lee';
    if (name === 'eta-prefix') this._etaPrefix = newValue || 'Arrives between';
    if (name === 'eta') this._eta = newValue || '8:35 - 8:41 AM';
    if (name === 'status-text') this._statusText = newValue || '';
    if (name === 'steps') this._steps = parseJsonAttr(newValue, DEFAULT_STEPS());
    if (name === 'courier-name') this._courierName = newValue || 'JOSHUA L';
    if (name === 'courier-role') this._courierRole = newValue || 'Your Dasher';
    if (name === 'order-name') this._orderName = newValue || 'Shake Shack';
    if (name === 'order-summary') this._orderSummary = newValue || '3 Items';
    if (name === 'items') this._items = parseJsonAttr(newValue, DEFAULT_ITEMS());
    if (name === 'gift-recipient') this._giftRecipient = newValue || 'Sam Lee';
    if (name === 'gift-message') this._giftMessage = newValue || '';
    if (name === 'share-title') this._shareTitle = newValue || '';
    if (name === 'share-description') this._shareDescription = newValue || '';
    if (name === 'copy-link-label') this._copyLinkLabel = newValue || 'Copy link';
    if (name === 'text-link-label') this._textLinkLabel = newValue || 'Text me the link';
    this._render();
  }

  _onClick(event) {
    const dispatchIf = (attr, eventName) => {
      if (event.target.closest(`[${attr}]`)) {
        this.dispatchEvent(new CustomEvent(eventName, { bubbles: true }));
        return true;
      }
      return false;
    };
    if (dispatchIf('data-delivery-call', 'courier-call')) return;
    if (dispatchIf('data-delivery-message', 'courier-message')) return;
    if (dispatchIf('data-delivery-copy-link', 'copy-link')) return;
    if (dispatchIf('data-delivery-text-link', 'text-link')) return;
    if (event.target.closest('[data-delivery-details-toggle]')) {
      this._detailsOpen = !this._detailsOpen;
      this._render();
    }
  }

  _render() {
    const stepperHtml = this._steps
      .map((step, i) => {
        const connector = i === 0 ? '' : `<div class="${step.state === 'pending' ? 'h-0.5 flex-1 bg-zinc-200 dark:bg-zinc-700' : 'h-0.5 flex-1 bg-zinc-900 dark:bg-zinc-100'}" aria-hidden="true"></div>`;
        const bubble = step.state === 'pending'
          ? 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'
          : 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900';
        return `${connector}<div data-delivery-step="${escapeAttribute(step.id)}" data-delivery-step-state="${escapeAttribute(step.state)}" title="${escapeAttribute(step.label)}" class="${bubble}">${stepIcon(step.icon)}</div>`;
      })
      .join('');

    const itemsHtml = this._items
      .map((item) => `<div data-delivery-item="${escapeAttribute(item.id)}" class="flex items-center justify-between text-sm">
          <span class="text-zinc-800 dark:text-zinc-100">${escapeAttribute(item.quantity)} ${escapeAttribute(item.name)}</span>
          <span class="font-medium text-zinc-900 dark:text-zinc-50">${escapeAttribute(item.price)}</span>
        </div>`)
      .join('');

    this.innerHTML = `
      <div data-delivery-panel class="flex w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div data-delivery-map class="relative hidden min-h-[420px] flex-1 bg-zinc-100 lg:block dark:bg-zinc-800">
          <div class="absolute inset-0" aria-hidden="true"></div>
          <div data-delivery-pin class="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-500 text-lg text-white shadow-lg" aria-hidden="true">🚗</div>
          <div data-delivery-pin-destination class="absolute left-[60%] top-[45%] flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-base text-white shadow-lg" aria-hidden="true">🏠</div>
          <button data-delivery-back class="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-700 shadow-md transition-colors hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-200" aria-label="Back">←</button>
          <button data-delivery-help class="absolute right-4 top-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-800 shadow-md transition-colors hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-100">Help</button>
          <div data-delivery-zoom class="absolute bottom-6 right-4 flex flex-col overflow-hidden rounded-xl bg-white shadow-md dark:bg-zinc-900">
            <button class="border-b border-zinc-100 px-3 py-2 text-zinc-600 dark:border-zinc-800 dark:text-zinc-300" aria-label="Zoom in">＋</button>
            <button class="px-3 py-2 text-zinc-600 dark:text-zinc-300" aria-label="Zoom out">－</button>
          </div>
        </div>
        <div data-delivery-info class="flex w-full flex-col border-l border-zinc-100 lg:w-96 lg:shrink-0 dark:border-zinc-800">
          <div data-delivery-header class="flex items-start justify-between gap-3 px-6 pt-5">
            <div>
              <h2 data-delivery-title class="text-xl font-bold text-zinc-900 dark:text-zinc-50">${escapeAttribute(this._title)}</h2>
              <p data-delivery-eta class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">${escapeAttribute(this._etaPrefix)} <span class="font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(this._eta)}</span></p>
            </div>
            <span data-delivery-avatar class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xl dark:bg-emerald-950/60" aria-hidden="true">🍔</span>
          </div>
          <div data-delivery-stepper class="flex items-center px-6 pt-5">${stepperHtml}</div>
          <p data-delivery-status class="px-6 pt-3 text-sm text-zinc-700 dark:text-zinc-200">${escapeAttribute(this._statusText)}</p>
          <div data-delivery-courier class="mt-4 flex items-center justify-between border-y border-zinc-100 px-6 py-4 dark:border-zinc-800">
            <div class="flex items-center gap-3">
              <span aria-hidden="true" class="text-zinc-400 dark:text-zinc-500">👤</span>
              <div>
                <p data-delivery-courier-role class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(this._courierRole)}</p>
                <p data-delivery-courier-name class="text-sm text-zinc-500 dark:text-zinc-400">${escapeAttribute(this._courierName)}</p>
              </div>
            </div>
            <div class="flex gap-2">
              <button data-delivery-call type="button" class="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700" aria-label="Call courier">📞</button>
              <button data-delivery-message type="button" class="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700" aria-label="Message courier">💬</button>
            </div>
          </div>
          <div class="px-6 py-4">
            <button data-delivery-details-toggle type="button" class="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-100 py-2.5 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700">
              Order Details <span aria-hidden="true">${this._detailsOpen ? '▴' : '▾'}</span>
            </button>
            ${this._detailsOpen ? `<div data-delivery-items class="mt-4 space-y-3">
              <div class="flex items-center gap-3">
                <span data-delivery-order-avatar class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-lg dark:bg-emerald-950/60" aria-hidden="true">🍔</span>
                <div>
                  <p data-delivery-order-name class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(this._orderName)}</p>
                  <p data-delivery-order-summary class="text-sm text-zinc-500 dark:text-zinc-400">${escapeAttribute(this._orderSummary)}</p>
                </div>
              </div>
              ${itemsHtml}
              <div data-delivery-gift class="border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <p data-delivery-gift-recipient class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(this._giftRecipient)}</p>
                <p data-delivery-gift-message class="mt-1 text-sm text-zinc-600 dark:text-zinc-300">${escapeAttribute(this._giftMessage)}</p>
              </div>
              <div data-delivery-share class="border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(this._shareTitle)}</p>
                <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">${escapeAttribute(this._shareDescription)}</p>
                <div class="mt-3 flex justify-end gap-2">
                  <button data-delivery-copy-link type="button" class="rounded-full bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700">${escapeAttribute(this._copyLinkLabel)}</button>
                  <button data-delivery-text-link type="button" class="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700">${escapeAttribute(this._textLinkLabel)}</button>
                </div>
              </div>
            </div>` : ''}
          </div>
        </div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('delivery-tracking-panel')) {
  customElements.define('delivery-tracking-panel', DeliveryTrackingPanelElement);
}

export default DeliveryTrackingPanelElement;
