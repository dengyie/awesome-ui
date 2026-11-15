/**
 * OrderCard - Vanilla Web Component
 * Usage: <order-card order-number="200013316005821" status="shipped" placed-at="May 12" total="$24.98"></order-card>
 * Attributes: order-number, placed-at, status (placed|preparing|shipped|delivered|on-hold|canceled),
 *             fulfillment (JSON {type, eta?, store?}), items (JSON), total, status-note
 * Events: open, action (detail {action})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const STATUS_TONE = {
  placed: { label: 'Placed', badge: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300' },
  preparing: { label: 'Preparing', badge: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300' },
  shipped: { label: 'On its way', badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' },
  delivered: { label: 'Delivered', badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' },
  'on-hold': { label: 'On hold', badge: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' },
  canceled: { label: 'Canceled', badge: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400' },
};

const FULFILLMENT_LABEL = {
  delivery: 'Arrives',
  pickup: 'Ready for pickup',
  curbside: 'Curbside ready',
};

export class OrderCardElement extends HTMLElement {
  static get observedAttributes() {
    return ['order-number', 'placed-at', 'status', 'fulfillment', 'items', 'total', 'status-note'];
  }

  constructor() {
    super();
    this._items = [];
    this._fulfillment = null;
    this._bound = false;
  }

  connectedCallback() {
    if (!this._items.length) {
      const raw = this.getAttribute('items');
      if (raw) {
        try { this._items = JSON.parse(raw); } catch { this._items = []; }
      }
    }
    if (!this._fulfillment) {
      const raw = this.getAttribute('fulfillment');
      if (raw) {
        try { this._fulfillment = JSON.parse(raw); } catch { this._fulfillment = null; }
      }
    }
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        if (event.target.closest('[data-order-open]')) {
          this.dispatchEvent(new CustomEvent('open'));
          return;
        }
        if (event.target.closest('[data-order-buy-again]')) {
          this.dispatchEvent(new CustomEvent('action', { detail: { action: 'buy-again' } }));
        }
      });
    }
  }

  attributeChangedCallback(name) {
    if (name === 'items') {
      const raw = this.getAttribute('items');
      if (raw) {
        try { this._items = JSON.parse(raw); } catch { this._items = []; }
      }
    }
    if (name === 'fulfillment') {
      const raw = this.getAttribute('fulfillment');
      if (raw) {
        try { this._fulfillment = JSON.parse(raw); } catch { this._fulfillment = null; }
      }
    }
    this.render();
  }

  get items() {
    return this._items;
  }

  set items(value) {
    this._items = Array.isArray(value) ? value : [];
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
    const orderNumber = this.getAttribute('order-number') || '';
    const placedAt = this.getAttribute('placed-at') || '';
    const status = this.getAttribute('status') || 'placed';
    const total = this.getAttribute('total') || '';
    const statusNote = this.getAttribute('status-note') || '';
    const tone = STATUS_TONE[status] || STATUS_TONE.placed;
    const canceled = status === 'canceled';
    const fulfillment = this._fulfillment || {};

    const itemsHtml = this._items.length
      ? `<ul data-order-items class="mt-3 space-y-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">${this._items
          .map((item) => {
            const thumb = item.image
              ? `<img src="${escapeAttribute(item.image)}" alt="" class="h-10 w-10 shrink-0 rounded-lg object-cover" />`
              : '<span class="h-10 w-10 shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-800"></span>';
            return `<li data-order-item="${escapeAttribute(item.id)}" class="flex items-center gap-3">
              ${thumb}
              <span class="min-w-0 flex-1">
                <span class="block truncate text-xs font-medium text-zinc-800 dark:text-zinc-100">${escapeAttribute(item.title)}</span>
                ${item.qty != null ? `<span class="block text-[11px] text-zinc-400">Qty: ${item.qty}</span>` : ''}
              </span>
              ${item.price ? `<span class="shrink-0 text-xs font-semibold text-zinc-700 dark:text-zinc-200">${escapeAttribute(item.price)}</span>` : ''}
            </li>`;
          })
          .join('')}</ul>`
      : '';

    this.innerHTML = `<div data-order-card class="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div class="flex items-center justify-between gap-2 bg-zinc-50 px-4 py-2.5 dark:bg-zinc-800/60">
        <p class="truncate text-xs font-semibold text-zinc-700 dark:text-zinc-200">Order# ${escapeAttribute(orderNumber)}${placedAt ? `<span class="ml-2 font-normal text-zinc-400">· Placed ${escapeAttribute(placedAt)}</span>` : ''}</p>
        <button type="button" data-order-open class="shrink-0 rounded-full border border-zinc-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 focus-visible:outline-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800">View details</button>
      </div>
      <div class="p-4">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            ${canceled
              ? `<p class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Canceled${fulfillment && fulfillment.eta ? ` on ${escapeAttribute(fulfillment.eta)}` : ''}</p>`
              : `<p class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${fulfillment ? FULFILLMENT_LABEL[fulfillment.type] || 'Fulfilled' : 'Fulfilled'}${fulfillment && fulfillment.eta ? ` by ${escapeAttribute(fulfillment.eta)}` : ''}</p>`}
            ${fulfillment && fulfillment.store ? `<p class="mt-0.5 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3 w-3"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>${escapeAttribute(fulfillment.store)}</p>` : ''}
            ${statusNote ? `<p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">${escapeAttribute(statusNote)}</p>` : ''}
          </div>
          <span data-order-status class="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone.badge}">${tone.label}</span>
        </div>
        ${itemsHtml}
        <div class="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <button type="button" data-order-buy-again class="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400">Buy it again</button>
          ${total ? `<p class="text-xs font-semibold text-zinc-900 dark:text-zinc-50">Total ${escapeAttribute(total)}</p>` : ''}
        </div>
      </div>
    </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('order-card')) {
  customElements.define('order-card', OrderCardElement);
}

export default OrderCardElement;
