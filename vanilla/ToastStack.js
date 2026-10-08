import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const TYPE_META = {
  success: { icon: 'check-circle', color: 'text-emerald-500' },
  error: { icon: 'circle-x', color: 'text-rose-500' },
  warning: { icon: 'alert-triangle', color: 'text-amber-500' },
  info: { icon: 'sparkles', color: 'text-sky-500' },
};

export class ToastStackElement extends HTMLElement {
  static get observedAttributes() {
    return ['duration'];
  }

  constructor() {
    super();
    this._toasts = [];
    this._timers = new Map();
    this._seq = 0;
    this._appliedLayout = '';
  }

  get toasts() {
    return this._toasts;
  }

  set toasts(val) {
    this._toasts = Array.isArray(val) ? val : [];
    this._syncTimers();
    this.render();
  }

  get duration() {
    const parsed = parseInt(this.getAttribute('duration') || '4000', 10);
    return Number.isNaN(parsed) ? 4000 : parsed;
  }

  push(message, type = 'info') {
    const id = ++this._seq;
    this._toasts = [...this._toasts, { id, message, type }];
    this._syncTimers();
    this.render();
    return id;
  }

  dismiss(id) {
    const timer = this._timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this._timers.delete(id);
    }
    this._toasts = this._toasts.filter((t) => t.id !== id);
    this.dispatchEvent(new CustomEvent('dismiss', { detail: { id } }));
    this.render();
  }

  attributeChangedCallback() {
    this._syncTimers();
    this.render();
  }

  disconnectedCallback() {
    for (const timer of this._timers.values()) clearTimeout(timer);
    this._timers.clear();
  }

  _syncTimers() {
    const duration = this.duration;
    if (duration <= 0) {
      for (const timer of this._timers.values()) clearTimeout(timer);
      this._timers.clear();
      return;
    }
    const alive = new Set(this._toasts.map((t) => t.id));
    for (const [id, timer] of this._timers) {
      if (!alive.has(id)) {
        clearTimeout(timer);
        this._timers.delete(id);
      }
    }
    for (const t of this._toasts) {
      if (!this._timers.has(t.id)) {
        this._timers.set(t.id, setTimeout(() => this.dismiss(t.id), duration));
      }
    }
  }

  render() {
    if (this._toasts.length === 0) {
      this.innerHTML = '';
      return;
    }

    const layoutClass = 'fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]';
    const prev = this._appliedLayout || '';
    let user = this.className || '';
    if (prev && user.startsWith(prev)) user = user.slice(prev.length).trim();
    this._appliedLayout = layoutClass;
    const next = `${layoutClass}${user ? ` ${user}` : ''}`;
    if (this.className !== next) this.className = next;
    this.setAttribute('aria-live', 'polite');

    this.innerHTML = this._toasts
      .map((t) => {
        const meta = TYPE_META[t.type] || TYPE_META.info;
        return `
          <div class="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg text-sm text-zinc-800 dark:text-zinc-200" role="alert">
            ${uiIcon(meta.icon, { size: 16, className: `${meta.color} shrink-0` })}
            <span class="flex-1 min-w-0">${escapeAttribute(t.message)}</span>
            <button type="button" data-toast-id="${escapeAttribute(t.id)}" class="toast-dismiss text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors shrink-0" aria-label="Dismiss">
              ${uiIcon('x', { size: 14 })}
            </button>
          </div>
        `;
      })
      .join('');

    this.querySelectorAll('.toast-dismiss').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-toast-id');
        const toast = this._toasts.find((t) => String(t.id) === String(id));
        if (toast) this.dismiss(toast.id);
      });
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('toast-stack')) {
  customElements.define('toast-stack', ToastStackElement);
}
export default ToastStackElement;
