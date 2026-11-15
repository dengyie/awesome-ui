import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const TONE = {
  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
};

/**
 * ChangelogFeed - Vanilla Web Component
 * Usage: <changelog-feed title="Latest updates" footer-link="See all updates"></changelog-feed>
 * Attributes: title, footer-link, empty-text
 * Properties: entries ({ id, badge?, badgeTone?, title, detail? }[])
 * Events: select (detail: { entry }), footer-click
 */
export class ChangelogFeedElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'footer-link', 'empty-text'];
  }

  constructor() {
    super();
    this._entries = [];
  }

  get entries() {
    return this._entries;
  }

  set entries(value) {
    this._entries = Array.isArray(value) ? value : [];
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
    const title = this.getAttribute('title') || 'Latest updates';
    const footerLink = this.getAttribute('footer-link') || '';
    const emptyText = this.getAttribute('empty-text') || 'No updates yet';

    const items = this._entries.length
      ? `<ol class="flex-1 space-y-3 divide-y divide-zinc-50 overflow-y-auto px-4 py-3 dark:divide-zinc-800/60">${this._entries
          .map(
            (entry, index) => `<li>
            <div ${this.hasAttribute('selectable') ? 'role="button" tabindex="0"' : ''} data-entry-index="${index}" class="text-left">
              <h4 class="text-xs font-semibold leading-snug text-zinc-800 dark:text-zinc-200">
                ${entry.badge ? `<span class="mr-1.5 inline-block rounded-full px-1.5 py-px align-middle font-medium text-[9.5px] ${TONE[entry.badgeTone] || TONE.rose}">${escapeAttribute(entry.badge)}</span>` : ''}${escapeAttribute(entry.title)}
              </h4>
              ${entry.detail ? `<p class="mt-1 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">${escapeAttribute(entry.detail)}</p>` : ''}
            </div>
          </li>`
          )
          .join('')}</ol>`
      : `<p class="px-4 py-6 text-center text-xs text-zinc-400">${escapeAttribute(emptyText)}</p>`;

    this.innerHTML = `<aside class="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <header class="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(title)}</h3>
        ${uiIcon('sparkles', { size: 14, className: 'text-amber-500' })}
      </header>
      ${items}
      ${
        footerLink
          ? `<footer class="border-t border-zinc-100 text-center dark:border-zinc-800">
        <button type="button" data-footer-link
          class="w-full px-4 py-2.5 text-[11px] font-medium text-indigo-600 transition-colors hover:bg-indigo-50 hover:underline dark:text-indigo-400 dark:hover:bg-indigo-950/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500">${escapeAttribute(footerLink)}</button>
      </footer>`
          : ''
      }
    </aside>`;

    if (this.hasAttribute('selectable')) {
      this.querySelectorAll('[data-entry-index]').forEach((row) => {
        row.addEventListener('click', () => {
          const entry = this._entries[Number(row.getAttribute('data-entry-index'))];
          this.dispatchEvent(new CustomEvent('select', { detail: { entry } }));
        });
      });
    }
    const footer = this.querySelector('[data-footer-link]');
    if (footer) footer.addEventListener('click', () => this.dispatchEvent(new CustomEvent('footer-click')));
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('changelog-feed')) {
  customElements.define('changelog-feed', ChangelogFeedElement);
}
export default ChangelogFeedElement;
