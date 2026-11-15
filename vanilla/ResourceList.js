/**
 * ResourceList - Vanilla Web Component
 * Usage: <resource-list title="Recents" max-items="8" selectable></resource-list> with `items` property
 * Attributes: title, empty-text, max-items, selectable
 * Properties: items ({ name, path?, kind?, kindTone?, timeLabel?, icon? }[]), onSelect function
 * Events: select (detail: { item, index })
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

const KIND_TONE = {
  zinc: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
  indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
};

export class ResourceListElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'empty-text', 'max-items'];
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
    const emptyText = this.getAttribute('empty-text') || 'No resources yet';
    const selectable = typeof this.onSelect === 'function' ? true : this.hasAttribute('selectable');
    const maxRaw = this.getAttribute('max-items');
    const maxItems = maxRaw === null ? Infinity : Number(maxRaw) || Infinity;
    const visible = Number.isFinite(maxItems) ? this._items.slice(0, maxItems) : this._items;

    const header = title
      ? `<header class="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
          <h3 class="text-xs font-semibold text-zinc-800 dark:text-zinc-200">${escapeAttribute(title)}</h3>
          <span class="font-mono text-[10px] font-medium text-zinc-400">${this._items.length}</span>
        </header>`
      : '';

    const body =
      visible.length === 0
        ? `<p class="px-4 py-6 text-center text-xs text-zinc-400">${escapeAttribute(emptyText)}</p>`
        : `<ul class="divide-y divide-zinc-50 dark:divide-zinc-800/60">${visible
            .map((item, index) => {
              const tone = KIND_TONE[item.kindTone || 'zinc'] || KIND_TONE.zinc;
              return `<li ${selectable ? 'role="button" tabindex="0"' : ''} data-resource-index="${index}"
                class="flex items-center gap-3 px-4 py-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 ${
                  selectable ? 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/40' : ''
                }">
                <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  ${uiIcon(item.icon || 'layers', { size: 14 })}
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block truncate font-medium text-zinc-800 dark:text-zinc-200">${escapeAttribute(item.name)}</span>
                  ${item.path ? `<span class="block truncate font-mono text-[10px] text-zinc-400">${escapeAttribute(item.path)}</span>` : ''}
                </span>
                ${item.timeLabel ? `<span class="shrink-0 text-[10px] text-zinc-400">${escapeAttribute(item.timeLabel)}</span>` : ''}
                ${item.kind ? `<span class="shrink-0 rounded-full px-2 py-px text-[10px] font-medium ${tone}">${escapeAttribute(item.kind)}</span>` : ''}
              </li>`;
            })
            .join('')}</ul>`;

    this.innerHTML = `<section data-resource-list class="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">${header}${body}</section>`;

    this.querySelectorAll('[data-resource-index]').forEach((row) => {
      const fire = () => {
        const index = Number(row.getAttribute('data-resource-index'));
        const item = this._items[index];
        if (typeof this.onSelect === 'function') this.onSelect(item, index);
        this.dispatchEvent(new CustomEvent('select', { detail: { item, index } }));
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

if (typeof customElements !== 'undefined' && !customElements.get('resource-list')) {
  customElements.define('resource-list', ResourceListElement);
}
export default ResourceListElement;
