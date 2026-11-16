/**
 * SiteFooter - Vanilla Web Component
 * Usage: <site-footer copyright="…" tagline="…"></site-footer> with `columns` and optional `badges` properties
 * Attributes: copyright, tagline
 * Properties: columns ({ heading, links: { label, href? }[] }[]), badges ({ title, status, statusTone?, icon? }[])
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

// Only allow safe URL protocols into <a href> (blocks javascript:/data:/vbscript:)
const isSafeHref = (href) => {
  if (typeof href !== 'string') return false;
  const t = href.trim();
  if (t.length === 0) return false;
  if (t.startsWith('//') || t.startsWith('/') || t.startsWith('./') || t.startsWith('../')) return true;
  return /^(https?:\/\/|mailto:)/i.test(t);
};

const STATUS_TONE = {
  emerald: 'text-emerald-400',
  amber: 'text-amber-400',
  zinc: 'text-zinc-400',
};

export class SiteFooterElement extends HTMLElement {
  static get observedAttributes() {
    return ['copyright', 'tagline'];
  }

  constructor() {
    super();
    this._columns = [];
    this._badges = [];
  }

  get columns() {
    return this._columns;
  }

  set columns(value) {
    this._columns = Array.isArray(value) ? value : [];
    this.render();
  }

  get badges() {
    return this._badges;
  }

  set badges(value) {
    this._badges = Array.isArray(value) ? value : [];
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
    const copyright = this.getAttribute('copyright') || '';
    const tagline = this.getAttribute('tagline') || '';

    const columnHtml = this._columns
      .map((column, index) => {
        const links = column.links
          .map(
            (link, linkIndex) =>
              `<li><a href="${escapeAttribute(isSafeHref(link.href) ? link.href : '#')}" class="text-xs text-zinc-400 transition-colors hover:text-zinc-100">${escapeAttribute(link.label)}</a></li>`,
          )
          .join('');
        return `<nav data-footer-column="${index}" aria-label="${escapeAttribute(column.heading)}">
          <p class="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">${escapeAttribute(column.heading)}</p>
          <ul class="mt-3 space-y-2">${links}</ul>
        </nav>`;
      })
      .join('');

    const badgesHtml = this._badges.length
      ? `<div data-footer-badges>
          <p class="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Compliance</p>
          <ul class="mt-3 space-y-3">
            ${this._badges
              .map(
                (badge) => `<li class="flex items-center gap-2.5">
                  <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">${uiIcon(badge.icon || 'check-circle', { size: 14, className: 'text-zinc-300' })}</span>
                  <span class="min-w-0">
                    <span class="block truncate text-xs font-medium text-zinc-200">${escapeAttribute(badge.title)}</span>
                    <span class="block truncate text-[10px] ${STATUS_TONE[badge.statusTone || 'zinc']}">${escapeAttribute(badge.status)}</span>
                  </span>
                </li>`,
              )
              .join('')}
          </ul>
        </div>`
      : '';

    this.innerHTML = `<footer data-site-footer class="rounded-xl border border-zinc-200 bg-zinc-950 p-6 text-zinc-400 dark:border-zinc-800">
      <div class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">${columnHtml}${badgesHtml}</div>
      <div class="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-4">
        ${tagline ? `<p class="text-xs text-zinc-500">${escapeAttribute(tagline)}</p>` : '<span></span>'}
        ${copyright ? `<p class="text-[11px] text-zinc-600">${escapeAttribute(copyright)}</p>` : ''}
      </div>
    </footer>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('site-footer')) {
  customElements.define('site-footer', SiteFooterElement);
}
export default SiteFooterElement;
