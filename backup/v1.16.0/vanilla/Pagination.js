import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const BASE =
  'inline-flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40';
const EDGE_CLASS =
  'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100';

export const paginationSlots = (page, pageCount, siblingCount = 1) => {
  if (pageCount <= 0) return [];
  const seen = new Set([1, pageCount, page]);
  for (let offset = 1; offset <= siblingCount; offset += 1) {
    seen.add(page - offset);
    seen.add(page + offset);
  }
  const sorted = Array.from(seen)
    .filter((entry) => entry >= 1 && entry <= pageCount)
    .sort((a, b) => a - b);
  const slots = [];
  let previous = 0;
  for (const entry of sorted) {
    if (previous > 0 && entry - previous > 1) slots.push('gap');
    slots.push(entry);
    previous = entry;
  }
  return slots;
};

/**
 * Pagination - Vanilla Web Component
 * Usage: <pagination-bar page="3" page-count="12"></pagination-bar>
 * Properties: page, pageCount
 * Attributes: page, page-count, sibling-count, show-edges, aria-label
 * Events: change (detail: { page })
 */
export class PaginationElement extends HTMLElement {
  static get observedAttributes() {
    return ['page', 'page-count', 'sibling-count', 'show-edges', 'aria-label'];
  }

  constructor() {
    super();
    this._page = null;
    this._pageCount = null;
  }

  get page() {
    const value = Number(this._page ?? this.getAttribute('page'));
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
  }

  set page(value) {
    this._page = value;
    this.render();
  }

  get pageCount() {
    const value = Number(this._pageCount ?? this.getAttribute('page-count'));
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
  }

  set pageCount(value) {
    this._pageCount = value;
    this.render();
  }

  get siblingCount() {
    const raw = this.getAttribute('sibling-count');
    if (raw === null) return 1;
    const value = Number(raw);
    return Number.isFinite(value) && value >= 0 ? Math.floor(value) : 1;
  }

  get showEdges() {
    const raw = this.getAttribute('show-edges');
    return raw !== 'false';
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

  _go(next) {
    if (next < 1 || next > this.pageCount || next === this.page) return;
    this._page = next;
    this.setAttribute('page', String(next));
    this.render();
    this.dispatchEvent(new CustomEvent('change', { detail: { page: next } }));
  }

  _edgeButton(target, label, icon, disabled) {
    return `<button type="button" data-page="${target}" aria-label="${label}" ${disabled ? 'disabled' : ''} class="${BASE} ${EDGE_CLASS}">${uiIcon(icon, { size: 13 })}</button>`;
  }

  render() {
    this._applyHostClass('flex items-center gap-1');
    const page = this.page;
    const pageCount = this.pageCount;
    const slots = paginationSlots(page, pageCount, this.siblingCount);
    const ariaLabel = this.getAttribute('aria-label') || 'Pagination';

    const numbers = slots
      .map((slot, index) => {
        if (slot === 'gap') {
          return `<span aria-hidden="true" class="px-1 text-[11px] text-zinc-400">…</span>`;
        }
        const active = slot === page;
        return `<button type="button" data-page="${slot}" aria-label="Page ${slot}" ${active ? 'aria-current="page"' : ''}
          class="${BASE} tabular-nums ${active ? 'bg-indigo-600 text-white' : EDGE_CLASS}">${slot}</button>`;
      })
      .join('');

    const edges = this.showEdges
      ? this._edgeButton(1, 'First page', 'chevron-left', page <= 1)
      : '';
    const tail = this.showEdges
      ? this._edgeButton(pageCount, 'Last page', 'chevron-right', page >= pageCount)
      : '';

    this.innerHTML = `<nav aria-label="${escapeAttribute(ariaLabel)}" class="flex items-center gap-1">${edges}${this._edgeButton(page - 1, 'Previous page', 'chevron-left', page <= 1)}${numbers}${this._edgeButton(page + 1, 'Next page', 'chevron-right', page >= pageCount)}${tail}</nav>`;

    this.querySelectorAll('[data-page]').forEach((node) => {
      node.addEventListener('click', () => this._go(Number(node.getAttribute('data-page'))));
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('pagination-bar')) {
  customElements.define('pagination-bar', PaginationElement);
}
export default PaginationElement;
