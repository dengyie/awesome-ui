/**
 * QuoteMasonry - Vanilla Web Component
 * Usage: <quote-masonry></quote-masonry> with `quotes` property
 * Attributes: columns (2|3|4)
 * Properties: quotes ({ quote, name, role?, company?, marked? }[])
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const COLUMN_CLASS = { 2: 'sm:columns-2', 3: 'sm:columns-2 lg:columns-3', 4: 'sm:columns-2 lg:columns-4' };

export class QuoteMasonryElement extends HTMLElement {
  static get observedAttributes() {
    return ['columns'];
  }

  constructor() {
    super();
    this._quotes = [];
  }

  get quotes() {
    return this._quotes;
  }

  set quotes(value) {
    this._quotes = Array.isArray(value) ? value : [];
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
    const columns = Number(this.getAttribute('columns')) || 3;
    this._applyHostClass(`columns-1 gap-4 ${COLUMN_CLASS[columns] || COLUMN_CLASS[3]} [column-fill:balance]`);
    const quotes = this._quotes;
    if (!quotes.length) {
      this.innerHTML = '';
      return;
    }

    this.innerHTML = quotes
      .map((card, index) => {
        const marked = card.marked !== false;
        return `<figure data-quote-index="${index}" class="mb-4 break-inside-avoid rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          ${marked ? '<span aria-hidden="true" class="block text-3xl font-black leading-none text-zinc-200 dark:text-zinc-700">&ldquo;</span>' : ''}
          <blockquote class="text-sm leading-relaxed text-zinc-700 dark:text-zinc-200${marked ? ' -mt-2' : ''}">${escapeAttribute(card.quote)}</blockquote>
          <figcaption class="mt-4 flex items-end justify-between gap-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
            <span class="min-w-0">
              <span class="block truncate text-xs font-semibold uppercase tracking-wide text-zinc-900 dark:text-zinc-50">${escapeAttribute(card.name)}</span>
              ${
                card.role || card.company
                  ? `<span class="mt-0.5 block truncate text-[11px] text-zinc-400">${escapeAttribute([card.role, card.company].filter(Boolean).join(' · '))}</span>`
                  : ''
              }
            </span>
            ${
              card.company
                ? `<span class="shrink-0 rounded-md bg-zinc-100 px-2 py-1 font-mono text-[10px] font-bold uppercase text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">${escapeAttribute(card.company)}</span>`
                : ''
            }
          </figcaption>
        </figure>`;
      })
      .join('');
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('quote-masonry')) {
  customElements.define('quote-masonry', QuoteMasonryElement);
}
export default QuoteMasonryElement;
