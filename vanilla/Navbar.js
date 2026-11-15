import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

/**
 * Navbar - Vanilla Web Component
 * Usage: <nav-bar brand="awesome-ui" cta-text="Get started"></nav-bar>
 * Properties: links ({ id?, label, href?, icon?, badge? }[]), menus ({ id, label, columns: [{ heading?, links }] }[])
 * Attributes: brand, cta-text
 * Events: cta
 */
export class NavbarElement extends HTMLElement {
  static get observedAttributes() {
    return ['brand', 'cta-text'];
  }

  constructor() {
    super();
    this._links = [];
    this._menus = [];
    this._openMenu = null;
    this._boundDocMouseDown = (event) => {
      if (!this.contains(event.target)) this._openMenu = null;
    };
    this._boundDocKeyDown = (event) => {
      if (event.key === 'Escape') {
        this._openMenu = null;
        this.render();
      }
    };
  }

  get links() {
    return this._links;
  }

  set links(value) {
    this._links = Array.isArray(value) ? value : [];
    this.render();
  }

  get menus() {
    return this._menus;
  }

  set menus(value) {
    this._menus = Array.isArray(value) ? value : [];
    this.render();
  }

  get brand() {
    return this.getAttribute('brand') || '';
  }

  get ctaText() {
    return this.getAttribute('cta-text') || '';
  }

  connectedCallback() {
    document.addEventListener('mousedown', this._boundDocMouseDown);
    document.addEventListener('keydown', this._boundDocKeyDown);
    this.render();
  }

  disconnectedCallback() {
    document.removeEventListener('mousedown', this._boundDocMouseDown);
    document.removeEventListener('keydown', this._boundDocKeyDown);
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

  _menuButton(menu) {
    const open = this._openMenu === menu.id;
    return `<button type="button" data-nav-menu="${escapeAttribute(menu.id)}" aria-expanded="${open}" aria-haspopup="true"
      class="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        open
          ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
          : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
      }">
      ${escapeAttribute(menu.label)}
      <span class="shrink-0 text-zinc-400 ${open ? 'rotate-180' : ''} transition-transform duration-200 inline-flex">${uiIcon('chevron-down', { size: 12 })}</span>
    </button>`;
  }

  _menuPanel(menu) {
    if (this._openMenu !== menu.id) return '';
    const columns = menu.columns
      .map(
        (column, columnIndex) => `<div class="min-w-36 space-y-1">
          ${column.heading ? `<p class="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">${escapeAttribute(column.heading)}</p>` : ''}
          ${column.links
            .map(
              (link) => `<a href="${escapeAttribute(link.href ?? '#')}" class="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
                ${link.icon ? `<span class="shrink-0 text-zinc-400">${uiIcon(link.icon, { size: 13 })}</span>` : ''}
                <span class="flex-1">${escapeAttribute(link.label)}</span>
                ${
                  link.badge != null
                    ? `<span class="rounded-full bg-indigo-50 px-1.5 py-0.5 text-[9.5px] font-semibold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">${escapeAttribute(link.badge)}</span>`
                    : ''
                }
              </a>`
            )
            .join('')}
        </div>`
      )
      .join('');
    return `<div class="absolute left-0 top-full z-30 mt-2 flex gap-6 rounded-xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">${columns}</div>`;
  }

  render() {
    this._applyHostClass('relative block');
    const menus = this._menus
      .map((menu) => `<div class="relative">${this._menuButton(menu)}${this._menuPanel(menu)}</div>`)
      .join('');
    const links = this._links
      .map(
        (link) => `<a href="${escapeAttribute(link.href ?? '#')}" class="rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">${escapeAttribute(link.label)}</a>`
      )
      .join('');
    const cta = this.ctaText
      ? `<button type="button" data-nav-cta class="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">${escapeAttribute(this.ctaText)}</button>`
      : '';

    this.innerHTML = `<nav class="flex items-center gap-6 border-b border-zinc-200 bg-white px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900">
      <span class="text-sm font-black text-zinc-900 dark:text-zinc-50">${escapeAttribute(this.brand)}</span>
      <div class="flex items-center gap-1">${menus}${links}</div>
      <div class="ml-auto flex items-center gap-2">${cta}</div>
    </nav>`;

    this.querySelectorAll('[data-nav-menu]').forEach((node) => {
      node.addEventListener('click', () => {
        const id = node.getAttribute('data-nav-menu');
        this._openMenu = this._openMenu === id ? null : id;
        this.render();
      });
    });
    const ctaButton = this.querySelector('[data-nav-cta]');
    if (ctaButton) {
      ctaButton.addEventListener('click', () => this.dispatchEvent(new CustomEvent('cta')));
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('nav-bar')) {
  customElements.define('nav-bar', NavbarElement);
}
export default NavbarElement;
