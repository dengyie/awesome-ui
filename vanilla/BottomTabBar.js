/**
 * BottomTabBar - Mobile-style bottom navigation bar: icon + label tabs,
 * active indicator, optional badge count and safe-area padding
 * (mobile web navigation pattern).
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

const DEFAULT_TABS = () => [
  { id: 'home', label: 'Home', icon: '⌂' },
  { id: 'search', label: 'Search', icon: '⌕', badge: 3 },
  { id: 'create', label: 'Create', icon: '+' },
  { id: 'inbox', label: 'Inbox', icon: '✉', badge: 12 },
  { id: 'profile', label: 'Profile', icon: '◉' },
];

class BottomTabBarElement extends HTMLElement {
  static get observedAttributes() {
    return ['tabs', 'active', 'label'];
  }

  constructor() {
    super();
    this._tabs = DEFAULT_TABS();
    this._active = 'home';
    this._label = 'Primary navigation';
    this._onClick = this._onClick.bind(this);
  }

  connectedCallback() {
    this._tabs = parseJsonAttr(this.getAttribute('tabs'), DEFAULT_TABS());
    const a = this.getAttribute('active');
    if (a) this._active = a;
    const l = this.getAttribute('label');
    if (l) this._label = l;
    this._render();
    this.addEventListener('click', this._onClick);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onClick);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'tabs') this._tabs = parseJsonAttr(newValue, DEFAULT_TABS());
    if (name === 'active') this._active = newValue || 'home';
    if (name === 'label') this._label = newValue || 'Primary navigation';
    this._render();
  }

  get tabs() { return this._tabs; }
  set tabs(value) { this._tabs = Array.isArray(value) ? value : []; this._render(); }

  _onClick(event) {
    const tab = event.target.closest('[data-bottomtab-item]');
    if (!tab) return;
    this._active = tab.getAttribute('data-bottomtab-item') || 'home';
    this.dispatchEvent(new CustomEvent('tab-change', { detail: { id: this._active }, bubbles: true }));
    this._render();
  }

  _render() {
    const tabs = Array.isArray(this._tabs) ? this._tabs : [];
    const itemsHtml = tabs
      .map((tab) => {
        const isActive = tab.id === this._active;
        const itemCls = isActive
          ? 'flex flex-1 flex-col items-center gap-0.5 py-2 text-violet-600 dark:text-violet-400'
          : 'flex flex-1 flex-col items-center gap-0.5 py-2 text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300';
        const badge = tab.badge
          ? `<span data-bottomtab-badge="${escapeAttribute(tab.id)}" class="absolute -right-2 -top-1.5 rounded-full bg-red-500 px-1.5 text-[10px] font-bold leading-4 text-white">${escapeAttribute(String(tab.badge))}</span>`
          : '';
        return `<button type="button" data-bottomtab-item="${escapeAttribute(tab.id)}" aria-current="${isActive ? 'page' : 'false'}" class="relative ${itemCls}">
          <span data-bottomtab-icon="${escapeAttribute(tab.id)}" aria-hidden="true" class="text-lg leading-5">${escapeAttribute(tab.icon || '')}</span>
          <span data-bottomtab-label="${escapeAttribute(tab.id)}" class="text-[10px] font-medium">${escapeAttribute(tab.label || '')}</span>
          ${badge}
          <span data-bottomtab-indicator="${escapeAttribute(tab.id)}" aria-hidden="true" class="${isActive ? 'block' : 'hidden'} absolute -top-px inset-x-4 h-0.5 rounded-full bg-violet-600 dark:bg-violet-400"></span>
        </button>`;
      })
      .join('');

    this.innerHTML = `
      <nav data-bottomtab-bar aria-label="${escapeAttribute(this._label)}" class="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div data-bottomtab-items class="flex items-stretch px-2 pb-[env(safe-area-inset-bottom)]">${itemsHtml}</div>
      </nav>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('bottom-tab-bar')) {
  customElements.define('bottom-tab-bar', BottomTabBarElement);
}

export default BottomTabBarElement;
