import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

// Only allow safe URL protocols into <a href> (blocks javascript:/data:/vbscript:)
const isSafeHref = (href) => {
  if (typeof href !== 'string') return false;
  const t = href.trim();
  if (t.length === 0) return false;
  if (t.startsWith('//') || t.startsWith('/') || t.startsWith('./') || t.startsWith('../')) return true;
  return /^(https?:\/\/|mailto:)/i.test(t);
};

const BASE = 'inline-flex items-center gap-1 rounded px-1 py-0.5 transition-colors';
const LINK_CLASS =
  'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100';

/**
 * Breadcrumb - Vanilla Web Component
 * Usage: <breadcrumb-trail max-items="4"></breadcrumb-trail>
 * Properties: items ({ id?, label, href?, icon? }[])
 * Attributes: max-items, aria-label
 * Events: navigate (detail: { item, index })
 */
export class BreadcrumbElement extends HTMLElement {
  static get observedAttributes() {
    return ['max-items', 'aria-label'];
  }

  constructor() {
    super();
    this._items = null;
  }

  get items() {
    if (this._items !== null) return this._items;
    const raw = this.getAttribute('items');
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  set items(value) {
    this._items = Array.isArray(value) ? value : [];
    this.render();
  }

  get maxItems() {
    const raw = this.getAttribute('max-items');
    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
  }

  connectedCallback() {
    this.render();
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

  _trail() {
    const items = this.items;
    const maxItems = this.maxItems;
    if (maxItems <= 0 || items.length <= maxItems) return items;
    const tail = Math.max(1, maxItems - 1);
    return [items[0], null, ...items.slice(items.length - tail)];
  }

  _content(item) {
    return `${item.icon ? uiIcon(item.icon, { size: 12 }) : ''}<span>${escapeAttribute(item.label)}</span>`;
  }

  render() {
    this._applyHostClass('block');
    const trail = this._trail();
    const ariaLabel = this.getAttribute('aria-label') || 'Breadcrumb';

    const rows = trail
      .map((item, index) => {
        const last = index === trail.length - 1;
        const separator =
          index > 0
            ? `<span aria-hidden="true" class="text-zinc-300 dark:text-zinc-600">${uiIcon('chevron-right', { size: 11 })}</span>`
            : '';

        let body;
        if (!item) {
          body = '<span aria-hidden="true" class="px-1 text-zinc-400">…</span>';
        } else if (last) {
          body = `<span aria-current="page" class="${BASE} font-medium text-zinc-800 dark:text-zinc-100">${this._content(item)}</span>`;
        } else if (item.href && isSafeHref(item.href)) {
          body = `<a href="${escapeAttribute(item.href)}" data-breadcrumb-index="${index}" class="${BASE} ${LINK_CLASS}">${this._content(item)}</a>`;
        } else {
          body = `<button type="button" data-breadcrumb-index="${index}" class="${BASE} ${LINK_CLASS}">${this._content(item)}</button>`;
        }

        return `<li class="flex items-center gap-1.5">${separator}${body}</li>`;
      })
      .join('');

    this.innerHTML = `<nav aria-label="${escapeAttribute(ariaLabel)}"><ol class="flex flex-wrap items-center gap-1.5 text-[11px]">${rows}</ol></nav>`;

    this.querySelectorAll('[data-breadcrumb-index]').forEach((node) => {
      node.addEventListener('click', (event) => {
        event.preventDefault();
        const index = Number(node.getAttribute('data-breadcrumb-index'));
        this.dispatchEvent(new CustomEvent('navigate', { detail: { item: trail[index], index } }));
      });
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('breadcrumb-trail')) {
  customElements.define('breadcrumb-trail', BreadcrumbElement);
}
export default BreadcrumbElement;
