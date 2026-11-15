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
  neutral: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
  emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  sky: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
};

/**
 * Tag - Vanilla Web Component
 * Usage: <ui-tag label="v1.18" tone="indigo" removable></ui-tag>
 * Properties: label (string)
 * Attributes: label, tone, size (sm|md), icon, removable, clickable
 * Events: remove, tag-click
 */
export class TagElement extends HTMLElement {
  static get observedAttributes() {
    return ['label', 'tone', 'size', 'icon', 'removable', 'clickable'];
  }

  get tone() {
    const value = this.getAttribute('tone');
    return TONE[value] ? value : 'neutral';
  }

  get size() {
    return this.getAttribute('size') === 'sm' ? 'sm' : 'md';
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
    this._applyHostClass('inline-flex');
    const label = this.getAttribute('label') || '';
    const size = this.size;
    const removable = this.hasAttribute('removable');
    const clickable = this.hasAttribute('clickable');
    const icon = this.getAttribute('icon');
    const sizing = size === 'sm' ? 'px-1.5 py-0.5 text-[9.5px]' : 'px-2 py-0.5 text-[10.5px]';
    const base = `inline-flex max-w-full items-center gap-1 rounded-full font-medium ${TONE[this.tone]} ${sizing}`;
    const inner = `<span class="truncate">${escapeAttribute(label)}</span>`;

    if (clickable) {
      this.innerHTML = `<button type="button" data-tag-root class="${base} cursor-pointer transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
        ${icon ? uiIcon(icon, { size: size === 'sm' ? 10 : 11, className: 'shrink-0 opacity-70' }) : ''}
        ${inner}
        ${removable ? `<span data-tag-remove role="button" aria-label="Remove ${escapeAttribute(label)}" class="-mr-0.5 shrink-0 rounded-full p-0.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10">${uiIcon('x', { size: size === 'sm' ? 9 : 10 })}</span>` : ''}
      </button>`;
    } else {
      this.innerHTML = `<span class="${base}">
        ${icon ? uiIcon(icon, { size: size === 'sm' ? 10 : 11, className: 'shrink-0 opacity-70' }) : ''}
        ${inner}
        ${removable ? `<button type="button" data-tag-remove aria-label="Remove ${escapeAttribute(label)}" class="-mr-0.5 shrink-0 rounded-full p-0.5 transition-colors hover:bg-black/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current dark:hover:bg-white/10">${uiIcon('x', { size: size === 'sm' ? 9 : 10 })}</button>` : ''}
      </span>`;
    }

    const remove = this.querySelector('[data-tag-remove]');
    if (remove) {
      remove.addEventListener('click', (event) => {
        event.stopPropagation();
        this.dispatchEvent(new CustomEvent('remove'));
      });
    }
    if (clickable) {
      this.querySelector('[data-tag-root]').addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('tag-click'));
      });
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ui-tag')) {
  customElements.define('ui-tag', TagElement);
}
export default TagElement;
