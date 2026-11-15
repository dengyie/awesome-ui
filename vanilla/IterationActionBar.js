/**
 * IterationActionBar - Generation iteration action bar: Show More / Brainstorm
 * / Reply pills, an overflow slot and prev/next page arrows (Luma).
 */
const ACTIONS = [
  { id: 'show-more', label: '↻ Show More' },
  { id: 'brainstorm', label: '✦ Brainstorm' },
  { id: 'reply', label: '❝ Reply' },
  { id: 'more', label: '···', ariaLabel: 'More actions', iconOnly: true },
];

class IterationActionBarElement extends HTMLElement {
  static get observedAttributes() {
    return ['page', 'total-pages'];
  }

  constructor() {
    super();
    this._bound = false;
    this._page = 1;
    this._totalPages = 4;
  }

  connectedCallback() {
    this._page = Number(this.getAttribute('page')) || 1;
    this._totalPages = Number(this.getAttribute('total-pages')) || 4;
    if (this._bound === false && this.innerHTML === '') {
      this._bound = true;
    }
    this._render();
    this.addEventListener('click', this._onClick);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onClick);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (this._bound === false && this.innerHTML === '') return;
    if (name === 'page') this._page = Number(newValue) || 1;
    if (name === 'total-pages') this._totalPages = Number(newValue) || 4;
    this._render();
  }

  get page() {
    return this._page;
  }
  set page(value) {
    this._page = Number(value) || 1;
    this._render();
  }

  get totalPages() {
    return this._totalPages;
  }
  set totalPages(value) {
    this._totalPages = Number(value) || 4;
    this._render();
  }

  _onClick(event) {
    const actionEl = event.target.closest('[data-iteration-action]');
    if (actionEl) {
      const action = actionEl.getAttribute('data-iteration-action');
      this.dispatchEvent(new CustomEvent('action', { detail: { action }, bubbles: true }));
      return;
    }
    const prevEl = event.target.closest('[data-iteration-prev]');
    if (prevEl) {
      if (this._page > 1) {
        this._page -= 1;
        this._render();
        this.dispatchEvent(new CustomEvent('page-change', { detail: { page: this._page }, bubbles: true }));
      }
      return;
    }
    const nextEl = event.target.closest('[data-iteration-next]');
    if (nextEl) {
      if (this._page < this._totalPages) {
        this._page += 1;
        this._render();
        this.dispatchEvent(new CustomEvent('page-change', { detail: { page: this._page }, bubbles: true }));
      }
    }
  }

  _render() {
    const pill = 'rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500';
    const pillOutlined = `${pill} border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800`;
    const pillIcon = `${pill} border border-zinc-200 bg-white px-2 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800`;
    const arrow = `${pill} border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800`;

    const actionsHtml = ACTIONS.map((action) => {
      const cls = action.iconOnly ? pillIcon : pillOutlined;
      const aria = action.ariaLabel ? ` aria-label="${action.ariaLabel}"` : '';
      return `<button type="button" data-iteration-action="${action.id}"${aria} class="${cls}">${action.label}</button>`;
    }).join('');

    this.innerHTML = `
      <div data-iteration-action-bar class="flex flex-wrap items-center gap-2">
        ${actionsHtml}
        <span data-iteration-pager class="ml-1 inline-flex items-center gap-1">
          <button type="button" data-iteration-prev aria-label="Previous page" class="${arrow}"${this._page <= 1 ? ' disabled' : ''}>‹</button>
          <button type="button" data-iteration-next aria-label="Next page" class="${arrow}"${this._page >= this._totalPages ? ' disabled' : ''}>›</button>
          <span data-iteration-page-label class="ml-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">${this._page}/${this._totalPages}</span>
        </span>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('iteration-action-bar')) {
  customElements.define('iteration-action-bar', IterationActionBarElement);
}

export default IterationActionBarElement;
