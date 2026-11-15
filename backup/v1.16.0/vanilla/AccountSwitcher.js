import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const initials = (name) =>
  String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

/**
 * AccountSwitcher - Vanilla Web Component
 * Usage: <account-switcher current-id="a1"></account-switcher>
 * Properties: accounts (Account[])
 * Events: switch (detail: account), add-account, sign-out, open-change (detail: boolean)
 */
export class AccountSwitcherElement extends HTMLElement {
  static get observedAttributes() {
    return ['current-id'];
  }

  constructor() {
    super();
    this._accounts = [];
    this._open = false;
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
  }

  get accounts() {
    return this._accounts;
  }

  set accounts(value) {
    this._accounts = Array.isArray(value) ? value : [];
    this.render();
  }

  get open() {
    return this._open;
  }

  set open(value) {
    this._setOpen(Boolean(value));
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    this._detachGlobal();
  }

  attributeChangedCallback() {
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

  _current() {
    const currentId = this.getAttribute('current-id');
    return this._accounts.find((account) => String(account.id) === String(currentId)) || this._accounts[0];
  }

  _setOpen(next) {
    if (this._open === next) return;
    this._open = next;
    if (next) {
      document.addEventListener('mousedown', this._onPointerDown);
      document.addEventListener('keydown', this._onKeyDown);
    } else {
      this._detachGlobal();
    }
    this.render();
    this.dispatchEvent(new CustomEvent('open-change', { detail: next }));
  }

  _detachGlobal() {
    document.removeEventListener('mousedown', this._onPointerDown);
    document.removeEventListener('keydown', this._onKeyDown);
  }

  _onPointerDown(event) {
    if (!this.contains(event.target)) this._setOpen(false);
  }

  _onKeyDown(event) {
    if (event.key === 'Escape') this._setOpen(false);
  }

  _avatar(account, sizeClass) {
    const inner = account.avatar
      ? `<img src="${escapeAttribute(account.avatar)}" alt="" class="h-full w-full object-cover" />`
      : escapeAttribute(initials(account.name));
    return `<span class="flex ${sizeClass} shrink-0 items-center justify-center overflow-hidden rounded-full ${sizeClass.includes('h-6') ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400' : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-200'} text-[10px] font-semibold">${inner}</span>`;
  }

  render() {
    this._applyHostClass('inline-block');

    const current = this._current();
    if (!current) {
      this.innerHTML = '';
      return;
    }

    const rows = this._accounts
      .map((account) => {
        const active = String(account.id) === String(current.id);
        const meta = [account.role, account.plan].filter(Boolean).join(' · ') || account.email || '';
        return `<li>
          <button type="button" role="menuitemradio" aria-checked="${active}" data-account="${escapeAttribute(account.id)}"
            class="account-row flex w-full items-center gap-2 px-2.5 py-1.5 text-left transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 dark:hover:bg-zinc-800/60">
            ${this._avatar(account, 'h-6 w-6')}
            <span class="min-w-0 flex-1">
              <span class="block truncate text-[11px] font-medium text-zinc-800 dark:text-zinc-100">${escapeAttribute(account.name)}</span>
              <span class="block truncate text-[10px] text-zinc-400">${escapeAttribute(meta)}</span>
            </span>
            ${active ? `<span class="shrink-0 text-indigo-600 dark:text-indigo-400">${uiIcon('check', { size: 12 })}</span>` : ''}
          </button>
        </li>`;
      })
      .join('');

    this.innerHTML = `
      <div class="relative inline-block text-left">
        <button type="button" class="account-trigger flex w-full items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-left transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          aria-haspopup="menu" aria-expanded="${this._open}">
          ${this._avatar(current, 'h-6 w-6')}
          <span class="min-w-0 flex-1">
            <span class="block truncate text-[11px] font-medium text-zinc-800 dark:text-zinc-100">${escapeAttribute(current.name)}</span>
            ${current.email ? `<span class="block truncate text-[10px] text-zinc-400">${escapeAttribute(current.email)}</span>` : ''}
          </span>
          <span class="shrink-0 text-zinc-400">${uiIcon('chevron-down', { size: 12 })}</span>
        </button>

        ${
          this._open
            ? `<div role="menu" aria-label="Switch account" class="account-menu absolute left-0 z-30 mt-1 w-64 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                <ul class="max-h-64 overflow-y-auto py-1">${rows}</ul>
                <div class="border-t border-zinc-100 py-1 dark:border-zinc-800">
                  <button type="button" role="menuitem" class="account-add flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[11px] text-zinc-600 transition-colors hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/60">
                    <span class="text-zinc-400">${uiIcon('plus', { size: 12 })}</span>Add account
                  </button>
                  <button type="button" role="menuitem" class="account-signout flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[11px] text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30">
                    <span>${uiIcon('arrow-right', { size: 12 })}</span>Sign out
                  </button>
                </div>
              </div>`
            : ''
        }
      </div>`;

    this.querySelector('.account-trigger').addEventListener('click', () => this._setOpen(!this._open));

    this.querySelectorAll('.account-row').forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.getAttribute('data-account');
        const account = this._accounts.find((entry) => String(entry.id) === String(id));
        if (!account) return;
        this.dispatchEvent(new CustomEvent('switch', { detail: account }));
        this._setOpen(false);
      });
    });

    const add = this.querySelector('.account-add');
    if (add) {
      add.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('add-account'));
        this._setOpen(false);
      });
    }

    const signOut = this.querySelector('.account-signout');
    if (signOut) {
      signOut.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('sign-out'));
        this._setOpen(false);
      });
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('account-switcher')) {
  customElements.define('account-switcher', AccountSwitcherElement);
}
export default AccountSwitcherElement;
