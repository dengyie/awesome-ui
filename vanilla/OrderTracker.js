/**
 * OrderTracker - Vanilla Web Component
 * Usage: <order-tracker stages='[...]' current="1" eta="Arrives by Sat, May 24"></order-tracker>
 * Attributes: stages (JSON [{id,label,timestamp?}]), current (number index or "canceled"), variant (dots|bar),
 *             eta, tracking-number, tracking-url, canceled-reason
 * Events: track
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" class="h-2.5 w-2.5"><path d="m5 12 4 4L19 6" /></svg>';

export class OrderTrackerElement extends HTMLElement {
  static get observedAttributes() {
    return ['stages', 'current', 'variant', 'eta', 'tracking-number', 'tracking-url', 'canceled-reason'];
  }

  constructor() {
    super();
    this._stages = [];
    this._bound = false;
  }

  connectedCallback() {
    if (!this._stages.length) {
      const raw = this.getAttribute('stages');
      if (raw) {
        try { this._stages = JSON.parse(raw); } catch { this._stages = []; }
      }
    }
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        if (event.target.closest('[data-tracker-track]')) this.dispatchEvent(new CustomEvent('track'));
      });
    }
  }

  attributeChangedCallback() {
    this.render();
  }

  get stages() {
    return this._stages;
  }

  set stages(value) {
    this._stages = Array.isArray(value) ? value : [];
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

  currentIndex() {
    const raw = this.getAttribute('current');
    if (raw === 'canceled') return -1;
    const n = Number(raw);
    return Number.isFinite(n) ? n : -1;
  }

  render() {
    this._applyHostClass('block');
    const variant = this.getAttribute('variant') || 'dots';
    const eta = this.getAttribute('eta') || '';
    const trackingNumber = this.getAttribute('tracking-number') || '';
    const trackingUrl = this.getAttribute('tracking-url') || '';
    const canceledReason = this.getAttribute('canceled-reason') || '';
    const canceled = this.currentIndex() === -1;
    const current = this.currentIndex();
    const progress = canceled ? 0 : Math.round(((current + 1) / Math.max(this._stages.length, 1)) * 100);

    if (variant === 'bar') {
      const stageLabels = this._stages
        .map((stage, index) => {
          const reached = !canceled && index <= current;
          const isCurrent = !canceled && index === current;
          const cls = isCurrent
            ? 'font-bold text-zinc-900 dark:text-zinc-50'
            : reached
              ? 'text-zinc-500 dark:text-zinc-400'
              : 'text-zinc-400 dark:text-zinc-600';
          return `<span data-tracker-stage="${escapeAttribute(stage.id)}" class="text-[10px] font-medium ${cls}">${escapeAttribute(stage.label)}</span>`;
        })
        .join('');
      this.innerHTML = `<div data-order-tracker class="w-full">
        <div class="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div data-tracker-fill="true" class="h-full rounded-full transition-all ${canceled ? 'bg-zinc-400 dark:bg-zinc-600' : 'bg-emerald-600'}" style="width:${progress}%"></div>
        </div>
        <div class="mt-2 flex justify-between">${stageLabels}</div>
        ${canceled && canceledReason ? `<p class="mt-2 text-xs text-zinc-500 dark:text-zinc-400">${escapeAttribute(canceledReason)}</p>` : ''}
      </div>`;
      return;
    }

    const stagesHtml = this._stages
      .map((stage, index) => {
        const reached = !canceled && index <= current;
        const isCurrent = !canceled && index === current;
        const last = index === this._stages.length - 1;
        const dotCls = `${isCurrent ? 'ring-2 ring-zinc-900 ring-offset-2 ring-offset-white dark:ring-zinc-100 dark:ring-offset-zinc-900' : ''} ${reached ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'}`;
        const labelCls = isCurrent
          ? 'text-zinc-900 dark:text-zinc-50'
          : reached
            ? 'text-zinc-500 dark:text-zinc-400'
            : 'text-zinc-400 dark:text-zinc-600';
        const connector = last
          ? ''
          : `<span class="mx-1 mt-2 h-0.5 flex-1 ${reached && index < current ? 'bg-emerald-600' : 'bg-zinc-200 dark:bg-zinc-700'}"></span>`;
        return `<li data-tracker-stage="${escapeAttribute(stage.id)}" class="flex min-w-0 flex-1 items-start">
          <span class="flex flex-col items-center">
            <span class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${dotCls}">${reached ? CHECK_SVG : ''}</span>
            <span class="mt-1 whitespace-nowrap text-[10px] font-medium ${labelCls}">${escapeAttribute(stage.label)}</span>
            ${stage.timestamp ? `<span class="text-[9px] text-zinc-400 dark:text-zinc-600">${escapeAttribute(stage.timestamp)}</span>` : ''}
          </span>
          ${connector}
        </li>`;
      })
      .join('');

    this.innerHTML = `<div data-order-tracker class="w-full">
      ${eta && !canceled ? `<p class="mb-2 text-xs font-semibold text-zinc-800 dark:text-zinc-100">${escapeAttribute(eta)}${trackingNumber ? `<span class="ml-2 font-normal text-zinc-400">· ${escapeAttribute(trackingNumber)}</span>` : ''}</p>` : ''}
      ${canceled ? `<p class="mb-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200">Canceled${canceledReason ? ` — ${escapeAttribute(canceledReason)}` : ''}</p>` : ''}
      <ol class="flex items-start">${stagesHtml}</ol>
      ${trackingUrl ? '<button type="button" data-tracker-track class="mt-2 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400">Track shipment &gt;</button>' : ''}
    </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('order-tracker')) {
  customElements.define('order-tracker', OrderTrackerElement);
}

export default OrderTrackerElement;
