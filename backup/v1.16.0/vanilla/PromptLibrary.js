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
 * PromptLibrary - Vanilla Web Component
 * Usage: <prompt-library searchable></prompt-library>
 * Properties: prompts (PromptItem[]), categories (string[])
 * Events: use (detail: prompt), toggle-favorite (detail: prompt)
 */
export class PromptLibraryElement extends HTMLElement {
  static get observedAttributes() {
    return ['searchable'];
  }

  constructor() {
    super();
    this._prompts = [];
    this._categories = [];
    this._query = '';
    this._category = 'all';
  }

  get prompts() {
    return this._prompts;
  }

  set prompts(value) {
    this._prompts = Array.isArray(value) ? value : [];
    this.render();
  }

  get categories() {
    return this._categories;
  }

  set categories(value) {
    this._categories = Array.isArray(value) ? value : [];
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

  _categoryOptions() {
    const seen = new Set(this._categories);
    for (const prompt of this._prompts) if (prompt.category) seen.add(prompt.category);
    return ['all', ...Array.from(seen)];
  }

  _visible() {
    const needle = this._query.trim().toLowerCase();
    return this._prompts.filter((prompt) => {
      const inCategory = this._category === 'all' || prompt.category === this._category;
      if (!inCategory) return false;
      if (!needle) return true;
      return [prompt.title, prompt.description, prompt.prompt, ...(prompt.tags || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(needle);
    });
  }

  _chips() {
    return this._categoryOptions()
      .map((category) => {
        const active = this._category === category;
        return `<button type="button" class="prompt-chip rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
          active
            ? 'bg-indigo-600 text-white'
            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
        }" data-category="${escapeAttribute(category)}" aria-pressed="${active}">${category === 'all' ? 'All' : escapeAttribute(category)}</button>`;
      })
      .join('');
  }

  _list() {
    const visible = this._visible();
    if (visible.length === 0) {
      return `<p class="px-3 py-8 text-center text-[11px] text-zinc-400">No prompts match your filters.</p>`;
    }
    const items = visible
      .map((prompt) => {
        const tags = (prompt.tags || [])
          .slice(0, 3)
          .map((tag) => `<span class="rounded bg-zinc-100 px-1 py-0.5 text-[9px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">${escapeAttribute(tag)}</span>`)
          .join('');
        return `<li class="prompt-card group flex flex-col rounded-lg border border-zinc-200 p-3 transition-colors hover:border-indigo-300 dark:border-zinc-700 dark:hover:border-indigo-700" data-prompt="${escapeAttribute(prompt.id)}">
          <div class="flex items-start gap-1.5">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                <span class="truncate text-[11px] font-semibold text-zinc-800 dark:text-zinc-100">${escapeAttribute(prompt.title)}</span>
                ${prompt.category ? `<span class="shrink-0 rounded bg-indigo-50 px-1 py-0.5 text-[9px] font-medium text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">${escapeAttribute(prompt.category)}</span>` : ''}
              </div>
              ${prompt.description ? `<p class="mt-0.5 line-clamp-2 text-[10px] leading-relaxed text-zinc-500 dark:text-zinc-400">${escapeAttribute(prompt.description)}</p>` : ''}
            </div>
            <button type="button" class="prompt-fav shrink-0 rounded p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              prompt.favorite ? 'text-amber-500' : 'text-zinc-300 hover:text-amber-500 dark:text-zinc-600 dark:hover:text-amber-400'
            }" aria-label="${prompt.favorite ? 'Unfavorite' : 'Favorite'} ${escapeAttribute(prompt.title)}" aria-pressed="${!!prompt.favorite}" data-prompt-id="${escapeAttribute(prompt.id)}">${uiIcon('star', { size: 13 })}</button>
          </div>

          <p class="mt-2 line-clamp-2 rounded bg-zinc-50 px-2 py-1.5 font-mono text-[10px] leading-relaxed text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">${escapeAttribute(prompt.prompt)}</p>

          <div class="mt-2 flex items-center justify-between">
            <div class="flex flex-wrap gap-1">${tags}</div>
            <button type="button" class="prompt-use inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2 py-1 text-[10px] font-medium text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" data-prompt-id="${escapeAttribute(prompt.id)}">
              Use${uiIcon('arrow-right', { size: 10 })}
            </button>
          </div>
        </li>`;
      })
      .join('');
    return `<ul class="grid gap-2 p-3 sm:grid-cols-2">${items}</ul>`;
  }

  _updateCount() {
    const count = this.querySelector('.prompt-count');
    if (count) count.textContent = String(this._visible().length);
  }

  _renderRegion() {
    const chips = this.querySelector('.prompt-chips');
    const list = this.querySelector('.prompt-body');
    if (chips) chips.innerHTML = this._chips();
    if (list) list.innerHTML = this._list();
    this._updateCount();
    this._bindItems();
  }

  _bindItems() {
    this.querySelectorAll('.prompt-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        this._category = chip.getAttribute('data-category');
        this._renderRegion();
      });
    });
    this.querySelectorAll('.prompt-use').forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.getAttribute('data-prompt-id');
        const prompt = this._prompts.find((entry) => String(entry.id) === String(id));
        if (prompt) this.dispatchEvent(new CustomEvent('use', { detail: prompt }));
      });
    });
    this.querySelectorAll('.prompt-fav').forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.getAttribute('data-prompt-id');
        const prompt = this._prompts.find((entry) => String(entry.id) === String(id));
        if (prompt) this.dispatchEvent(new CustomEvent('toggle-favorite', { detail: prompt }));
      });
    });
  }

  render() {
    this._applyHostClass('block');

    const searchable = this.hasAttribute('searchable');
    const search = searchable
      ? `<div class="relative sm:ml-auto sm:w-56">
          <span class="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400">${uiIcon('search', { size: 12 })}</span>
          <input type="search" class="prompt-search w-full rounded-lg border border-zinc-200 bg-white py-1 pl-6 pr-2 text-[11px] text-zinc-700 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            placeholder="Search prompts…" aria-label="Search prompts" value="${escapeAttribute(this._query)}" />
        </div>`
      : '';

    this.innerHTML = `<div class="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div class="flex flex-col gap-2 border-b border-zinc-100 p-3 dark:border-zinc-800 sm:flex-row sm:items-center">
        <div class="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-100">
          <span class="text-indigo-600 dark:text-indigo-400">${uiIcon('sparkles', { size: 14 })}</span>
          <h3 class="text-xs font-semibold">Prompt library</h3>
          <span class="prompt-count rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">${this._visible().length}</span>
        </div>
        ${search}
      </div>
      <div class="prompt-chips flex flex-wrap gap-1 border-b border-zinc-100 px-3 py-2 dark:border-zinc-800">${this._chips()}</div>
      <div class="prompt-body">${this._list()}</div>
    </div>`;

    const input = this.querySelector('.prompt-search');
    if (input) {
      input.addEventListener('input', () => {
        this._query = input.value;
        this._renderRegion();
      });
    }

    this._bindItems();
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('prompt-library')) {
  customElements.define('prompt-library', PromptLibraryElement);
}
export default PromptLibraryElement;
