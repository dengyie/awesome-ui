/**
 * RankList - Vanilla Web Component
 * Usage: <rank-list title="Top pages" value-header="Visitors" show-ratio max-items="5"></rank-list> with `items` property
 * Attributes: title, value-header, show-ratio, max-items, empty-text
 * Properties: items ({ label, value, ratio?, icon? }[])
 * Events: select (detail: { index, item })
 */
import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class RankListElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'value-header', 'max-items', 'empty-text'];
  }

  constructor() {
    super();
    this._items = [];
  }

  get items() {
    return this._items;
  }

  set items(value) {
    this._items = Array.isArray(value) ? value : [];
    this.render();
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

  render() {
    this._applyHostClass('block');
    const title = this.getAttribute('title') || '';
    const valueHeader = this.getAttribute('value-header') || '';
    const emptyText = this.getAttribute('empty-text') || 'No data yet';
    const showRatio = this.hasAttribute('show-ratio');
    const selectable = typeof this.onSelect === 'function' ? true : this.hasAttribute('selectable');
    const maxRaw = this.getAttribute('max-items');
    const maxItems = maxRaw === null ? Infinity : Number(maxRaw) || Infinity;
    const visible = Number.isFinite(maxItems) ? this._items.slice(0, maxItems) : this._items;
    const peak = Math.max(...visible.map((item) => Number(item.ratio ?? item.value) || 0), 1);

    const header =
      title || valueHeader
        ? `<header class="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
            ${title ? `<h3 class="text-xs font-semibold text-zinc-800 dark:text-zinc-200">${escapeAttribute(title)}</h3>` : '<span></span>'}
            ${valueHeader ? `<span class="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">${escapeAttribute(valueHeader)}</span>` : ''}
          </header>`
        : '';

    let body;
    if (!visible.length) {
      body = `<p class="px-4 py-6 text-center text-xs text-zinc-400">${escapeAttribute(emptyText)}</p>`;
    } else {
      body = `<ul class="divide-y divide-zinc-50 dark:divide-zinc-800/60">${visible
        .map((item, index) => {
          const ratio = Math.max(4, Math.min(100, ((Number(item.ratio ?? item.value) || 0) / peak) * 100));
          return `<li ${selectable ? 'role="button" tabindex="0"' : ''} data-rank-index="${index}"
            class="relative flex items-center gap-2 px-4 py-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 ${selectable ? 'cursor-pointer' : ''}">
            ${
              showRatio
                ? `<span aria-hidden="true" class="absolute inset-y-1 left-2 rounded bg-zinc-100 dark:bg-zinc-800" style="width:calc((100% - 1rem) * ${ratio / 100})"></span>`
                : ''
            }
            <span class="relative z-10 flex min-w-0 flex-1 items-center gap-1.5 truncate font-medium text-zinc-800 dark:text-zinc-200 ${showRatio ? 'px-1.5 py-0.5' : ''}">
              ${item.icon ? uiIcon(item.icon, { size: 13, className: 'shrink-0 text-zinc-400' }) : ''}<span class="truncate">${escapeAttribute(item.label)}</span>
            </span>
            <span class="relative z-10 shrink-0 font-mono text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">${escapeAttribute(item.value)}</span>
          </li>`;
        })
        .join('')}</ul>`;
    }

    this.innerHTML = `<section data-rank-list class="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">${header}${body}</section>`;

    this.querySelectorAll('[data-rank-index]').forEach((row) => {
      const fire = () => {
        const index = Number(row.getAttribute('data-rank-index'));
        const item = this._items[index];
        if (typeof this.onSelect === 'function') this.onSelect(index, item);
        this.dispatchEvent(new CustomEvent('select', { detail: { index, item } }));
      };
      row.addEventListener('click', fire);
      row.addEventListener('keydown', (event) => {
        if ((event.key === 'Enter' || event.key === ' ') && selectable) {
          event.preventDefault();
          fire();
        }
      });
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('rank-list')) {
  customElements.define('rank-list', RankListElement);
}
export default RankListElement;
