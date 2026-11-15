import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const TONE_META = {
  danger: {
    chip: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400',
    button: 'bg-red-600 hover:bg-red-500 focus-visible:ring-red-500',
    icon: 'alert-triangle',
  },
  warning: {
    chip: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
    button: 'bg-amber-500 hover:bg-amber-400 focus-visible:ring-amber-500',
    icon: 'alert-triangle',
  },
  default: {
    chip: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
    button: 'bg-indigo-600 hover:bg-indigo-500 focus-visible:ring-indigo-500',
    icon: 'info',
  },
};

/**
 * ConfirmDialog - Vanilla Web Component
 * Usage: <confirm-dialog open title="Delete project?" tone="danger"></confirm-dialog>
 * Events: confirm, cancel
 */
export class ConfirmDialogElement extends HTMLElement {
  static get observedAttributes() {
    return ['open', 'title', 'description', 'confirm-text', 'cancel-text', 'tone', 'require-text', 'loading'];
  }

  constructor() {
    super();
    this._typed = '';
    this._onKeyDown = this._onKeyDown.bind(this);
  }

  get isOpen() {
    return this.hasAttribute('open');
  }

  set isOpen(value) {
    if (value) this.setAttribute('open', '');
    else this.removeAttribute('open');
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this._onKeyDown);
  }

  attributeChangedCallback() {
    // Clear the type-to-confirm field whenever the dialog is (re)opened.
    if (this.isOpen) this._typed = '';
    this.render();
  }

  _onKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      // While a destructive action is in flight, Escape must not dismiss it.
      if (!this.hasAttribute('loading')) this.dispatchEvent(new CustomEvent('cancel'));
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

  _closeEvent(name) {
    this.dispatchEvent(new CustomEvent(name));
  }

  render() {
    const title = this.getAttribute('title') || 'Are you sure?';
    const description = this.getAttribute('description') || '';
    const confirmText = this.getAttribute('confirm-text') || 'Confirm';
    const cancelText = this.getAttribute('cancel-text') || 'Cancel';
    const requireText = this.getAttribute('require-text') || '';
    const loading = this.hasAttribute('loading');
    const tone = TONE_META[this.getAttribute('tone')] ? this.getAttribute('tone') : 'default';
    const meta = TONE_META[tone];

    this._applyHostClass('block');

    if (!this.isOpen) {
      this.innerHTML = '';
      document.removeEventListener('keydown', this._onKeyDown);
      return;
    }

    const blocked = requireText ? this._typed !== requireText : false;
    const canConfirm = !blocked && !loading;

    document.removeEventListener('keydown', this._onKeyDown);
    document.addEventListener('keydown', this._onKeyDown);

    this.innerHTML = `
      <div class="confirm-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="${escapeAttribute(title)}">
        <div class="w-full max-w-sm rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 shadow-2xl">
          <div class="flex items-start gap-3">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.chip}">${uiIcon(meta.icon, { size: 18 })}</span>
            <div class="min-w-0 pt-0.5">
              <h2 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">${escapeAttribute(title)}</h2>
              ${description ? `<p class="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">${escapeAttribute(description)}</p>` : ''}
            </div>
          </div>

          ${
            requireText
              ? `<div class="mt-4">
            <label class="mb-1.5 block text-[11px] text-zinc-500 dark:text-zinc-400">Type <span class="font-mono font-semibold text-zinc-700 dark:text-zinc-200">${escapeAttribute(requireText)}</span> to confirm</label>
            <input type="text" class="confirm-typed w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2.5 py-1.5 font-mono text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="${escapeAttribute(requireText)}" value="${escapeAttribute(this._typed)}" />
          </div>`
              : ''
          }

          <div class="mt-5 flex justify-end gap-2">
            <button type="button" class="confirm-cancel rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50" ${loading ? 'disabled' : ''}>${escapeAttribute(cancelText)}</button>
            <button type="button" class="confirm-accept inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 ${meta.button}" ${canConfirm ? '' : 'disabled'}>
              ${loading ? `<span class="animate-spin">${uiIcon('loader', { size: 12 })}</span>` : ''}${escapeAttribute(confirmText)}
            </button>
          </div>
        </div>
      </div>`;

    const typedInput = this.querySelector('.confirm-typed');
    if (typedInput) {
      typedInput.addEventListener('input', (event) => {
        this._typed = event.target.value;
        const accept = this.querySelector('.confirm-accept');
        if (accept) accept.disabled = this._typed !== requireText || loading;
      });
      typedInput.focus();
    }

    this.querySelector('.confirm-cancel').addEventListener('click', () => {
      if (!loading) this._closeEvent('cancel');
    });

    this.querySelector('.confirm-accept').addEventListener('click', () => {
      const blockedNow = requireText ? this._typed !== requireText : false;
      if (blockedNow || loading) return;
      this._closeEvent('confirm');
    });

    this.querySelector('.confirm-overlay').addEventListener('click', (event) => {
      if (event.target === event.currentTarget && !loading) this._closeEvent('cancel');
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('confirm-dialog')) {
  customElements.define('confirm-dialog', ConfirmDialogElement);
}
export default ConfirmDialogElement;
