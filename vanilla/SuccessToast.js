/**
 * SuccessToast - Vanilla Web Component
 * Usage: <success-toast message="Link copied" duration="3000"></success-toast>
 * Attributes: message, duration (ms, 0 = sticky), position (top-right|bottom-right)
 * Property: message
 * Events: close
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const CHECK_SVG = '<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true"><path d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm-1.2-5.4 5-5-1.13-1.13L8.8 10.34 7.33 8.87 6.2 10l2.6 2.6Z"/></svg>';
const CLOSE_SVG = '<svg viewBox="0 0 20 20" fill="none" width="12" height="12" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

export class SuccessToastElement extends HTMLElement {
  static get observedAttributes() {
    return ['message', 'duration', 'position'];
  }

  constructor() {
    super();
    this._visible = true;
    this._timer = null;
    this._bound = false;
  }

  connectedCallback() {
    this.render();
    this._armTimer();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        if (event.target.closest('[data-toast-close]')) {
          this._visible = false;
          this._clearTimer();
          this.render();
          this.dispatchEvent(new CustomEvent('close'));
        }
      });
    }
  }

  disconnectedCallback() {
    this._clearTimer();
  }

  attributeChangedCallback(name) {
    if (name === 'message') {
      this._visible = true;
      this._armTimer();
    }
    this.render();
  }

  get message() { return this.getAttribute('message') || ''; }
  set message(v) {
    this.setAttribute('message', v || '');
    this._visible = true;
    this._armTimer();
    this.render();
  }

  show() {
    this._visible = true;
    this._armTimer();
    this.render();
  }

  _armTimer() {
    this._clearTimer();
    const duration = Number(this.getAttribute('duration'));
    if (duration > 0) {
      this._timer = setTimeout(() => {
        this._visible = false;
        this.render();
      }, duration);
    }
  }

  _clearTimer() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
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
    const position = this.getAttribute('position') || 'top-right';
    const hostClass = `fixed right-4 z-50 ${position === 'bottom-right' ? 'bottom-4' : 'top-4'} ${this._visible ? '' : 'hidden'}`;
    this._applyHostClass(hostClass);

    if (!this._visible) {
      this.innerHTML = '';
      return;
    }
    const icon = this._icon || CHECK_SVG;
    this.innerHTML = `<div data-success-toast role="status" class="flex items-center gap-2 rounded-xl bg-emerald-100 px-4 py-2.5 shadow-sm">
  <span class="shrink-0 text-emerald-700">${icon}</span>
  <span class="text-sm text-zinc-900">${escapeAttribute(this.message)}</span>
  <button type="button" data-toast-close title="Dismiss" class="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-emerald-800/70 hover:bg-emerald-200 hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">${CLOSE_SVG}</button>
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('success-toast')) {
  customElements.define('success-toast', SuccessToastElement);
}

export default SuccessToastElement;
