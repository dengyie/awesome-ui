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
 * FooterSection - Vanilla Web Component
 * Usage: <footer-section brand="Acme" tagline="Ship faster" copyright="© 2026 Acme"></footer-section>
 * Properties: columns (FooterColumn[]), socials ({label, icon}[])
 * Events: link-click (detail: link)
 */
export class FooterSectionElement extends HTMLElement {
  static get observedAttributes() {
    return ['brand', 'tagline', 'copyright'];
  }

  constructor() {
    super();
    this._columns = [];
    this._socials = [];
  }

  get columns() {
    return this._columns;
  }

  set columns(value) {
    this._columns = Array.isArray(value) ? value : [];
    this.render();
  }

  get socials() {
    return this._socials;
  }

  set socials(value) {
    this._socials = Array.isArray(value) ? value : [];
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

    const brand = this.getAttribute('brand') || '';
    const tagline = this.getAttribute('tagline') || '';
    const copyright = this.getAttribute('copyright') || `© ${new Date().getFullYear()} ${brand}`.trim();

    const brandHtml =
      brand || tagline
        ? `<div class="md:w-56 md:shrink-0">
            ${
              brand
                ? `<div class="flex items-center gap-2">
                    <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">${uiIcon('layers', { size: 15 })}</span>
                    <span class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">${escapeAttribute(brand)}</span>
                  </div>`
                : ''
            }
            ${tagline ? `<p class="mt-3 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">${escapeAttribute(tagline)}</p>` : ''}
          </div>`
        : '';

    const columnsHtml = this._columns.length
      ? `<div class="grid flex-1 grid-cols-2 gap-6 sm:grid-cols-3">
          ${this._columns
            .map(
              (column) => `<div>
                <h3 class="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">${escapeAttribute(column.title)}</h3>
                <ul class="mt-3 space-y-2">
                  ${(column.links || [])
                    .map(
                      (link) =>
                        `<li><button type="button" class="footer-link rounded text-xs text-zinc-600 transition-colors hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-zinc-300 dark:hover:text-indigo-400" data-label="${escapeAttribute(link.label)}">${escapeAttribute(link.label)}</button></li>`
                    )
                    .join('')}
                </ul>
              </div>`
            )
            .join('')}
        </div>`
      : '';

    const socialsHtml = this._socials.length
      ? `<ul class="flex items-center gap-1">
          ${this._socials
            .map(
              (social) =>
                `<li><button type="button" aria-label="${escapeAttribute(social.label)}" title="${escapeAttribute(social.label)}"
                  class="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">${uiIcon(social.icon || 'globe', { size: 14 })}</button></li>`
            )
            .join('')}
        </ul>`
      : '';

    this.innerHTML = `<footer class="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div class="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 md:flex-row md:gap-12">
        ${brandHtml}
        ${columnsHtml}
      </div>
      <div class="border-t border-zinc-100 dark:border-zinc-900">
        <div class="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 py-4 sm:flex-row">
          <p class="text-[11px] text-zinc-400 dark:text-zinc-500">${escapeAttribute(copyright)}</p>
          ${socialsHtml}
        </div>
      </div>
    </footer>`;

    this.querySelectorAll('.footer-link').forEach((button) => {
      button.addEventListener('click', () => {
        const label = button.getAttribute('data-label');
        const link = this._columns
          .flatMap((column) => column.links || [])
          .find((entry) => entry.label === label);
        this.dispatchEvent(new CustomEvent('link-click', { detail: link || { label } }));
      });
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('footer-section')) {
  customElements.define('footer-section', FooterSectionElement);
}
export default FooterSectionElement;
