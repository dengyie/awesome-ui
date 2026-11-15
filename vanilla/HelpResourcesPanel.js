/**
 * HelpResourcesPanel - Help panel with resource cards: Reference/Tutorial
 * badges, title + description, optional reading time and footer links
 * (Graphite).
 */
const escapeAttribute = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const parseJsonAttr = (raw, fallback) => {
  if (typeof raw !== 'string' || raw.trim() === '') return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const DEFAULT_RESOURCES = () => [
  { id: 'r1', badge: 'Reference', title: 'Get started', description: 'Learn how to use Graphite for fast, simple code review.' },
  { id: 'r2', badge: 'Reference', title: 'Cheatsheet', description: 'A bookmarkable reference for common commands & workflows.' },
  { id: 'r3', badge: 'Tutorial', title: 'CLI quick start', description: 'Learn to author pull requests and stacks with the Graphite CLI.', minutes: 10 },
];

class HelpResourcesPanelElement extends HTMLElement {
  static get observedAttributes() {
    return ['resources', 'links'];
  }

  constructor() {
    super();
    this._bound = false;
    this._resources = [];
    this._links = [];
  }

  connectedCallback() {
    if (!this._resources.length) {
      this._resources = parseJsonAttr(this.getAttribute('resources'), DEFAULT_RESOURCES());
    }
    if (!this._links.length) {
      this._links = parseJsonAttr(this.getAttribute('links'), ['Send feedback', 'Docs']);
    }
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
    if (name === 'resources' && !this._resources.length) {
      this._resources = parseJsonAttr(this.getAttribute('resources'), []);
    }
    if (name === 'links' && !this._links.length) {
      this._links = parseJsonAttr(this.getAttribute('links'), []);
    }
    if (this._bound === false && this.innerHTML === '') return;
    this._render();
  }

  get resources() {
    return this._resources;
  }
  set resources(value) {
    this._resources = Array.isArray(value) ? value : [];
    this._render();
  }

  get links() {
    return this._links;
  }
  set links(value) {
    this._links = Array.isArray(value) ? value : [];
    this._render();
  }

  _onClick(event) {
    const resourceEl = event.target.closest('[data-help-resource]');
    if (resourceEl) {
      const resource = this._resources.find((r) => String(r.id) === resourceEl.getAttribute('data-help-resource'));
      if (resource) {
        this.dispatchEvent(new CustomEvent('resource-click', { detail: { resource }, bubbles: true }));
      }
      return;
    }
    const linkEl = event.target.closest('[data-help-resources-link]');
    if (linkEl) {
      this.dispatchEvent(new CustomEvent('link-click', { detail: { link: linkEl.textContent.trim() }, bubbles: true }));
    }
  }

  _render() {
    const badgeTone = (badge) =>
      String(badge).toLowerCase() === 'tutorial'
        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
        : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300';
    const resourcesHtml = this._resources
      .map(
        (resource) => `
        <button type="button" data-help-resource="${escapeAttribute(resource.id)}" class="block w-full rounded-lg border border-zinc-200 bg-zinc-50/60 p-3 text-left transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/40 dark:hover:bg-zinc-800">
          <span class="flex items-center justify-between gap-2">
            <span data-help-resource-badge class="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${badgeTone(resource.badge)}">${escapeAttribute(resource.badge)}</span>
            ${typeof resource.minutes === 'number' ? `<span data-help-resource-minutes class="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">${escapeAttribute(resource.minutes)} minutes</span>` : ''}
          </span>
          <span data-help-resource-title class="mt-1.5 block text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(resource.title)}</span>
          <span data-help-resource-desc class="mt-0.5 block text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">${escapeAttribute(resource.description)}</span>
        </button>`
      )
      .join('');
    const linksHtml = this._links
      .map(
        (link) => `
        <button type="button" data-help-resources-link class="block w-full rounded-md px-2 py-1.5 text-left text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50">${escapeAttribute(link)}</button>`
      )
      .join('');

    this.innerHTML = `
      <div data-help-resources-panel class="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div data-help-resources-header class="border-b border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">Help</div>
        <div class="p-4">
          <p data-help-resources-section class="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Tutorials &amp; resources</p>
          <div class="mt-3 space-y-3">${resourcesHtml}</div>
          ${this._links.length ? `<div data-help-resources-links class="mt-4 space-y-1 border-t border-zinc-200 pt-3 dark:border-zinc-800">${linksHtml}</div>` : ''}
        </div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('help-resources-panel')) {
  customElements.define('help-resources-panel', HelpResourcesPanelElement);
}

export default HelpResourcesPanelElement;
