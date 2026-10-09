import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class ModelSelectorElement extends HTMLElement {
  static get observedAttributes() {
    return ['selected-id', 'placeholder', 'show-search', 'disabled'];
  }

  constructor() {
    super();
    this._models = [];
    this._isOpen = false;
    this._searchQuery = '';
    this._handleDocClick = this._handleDocClick.bind(this);
  }

  get models() {
    return this._models;
  }

  set models(val) {
    this._models = Array.isArray(val) ? val : [];
    this.render();
  }

  get selectedId() {
    return this.getAttribute('selected-id') || '';
  }

  set selectedId(val) {
    this.setAttribute('selected-id', val);
  }

  connectedCallback() {
    document.addEventListener('mousedown', this._handleDocClick);
    this.render();
  }

  disconnectedCallback() {
    document.removeEventListener('mousedown', this._handleDocClick);
  }

  attributeChangedCallback() {
    this.render();
  }

  _handleDocClick(event) {
    if (!this.contains(event.target)) {
      if (this._isOpen) {
        this._isOpen = false;
        this.render();
      }
    }
  }

  _getFilteredModels() {
    if (!this._searchQuery.trim()) return this._models;
    const q = this._searchQuery.toLowerCase();
    return this._models.filter(
      (m) =>
        (m.name && m.name.toLowerCase().includes(q)) ||
        (m.provider && m.provider.toLowerCase().includes(q)) ||
        (m.description && m.description.toLowerCase().includes(q)) ||
        (m.tags && m.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }

  _applyHostClass(layoutClass) {
    const prev = this._appliedLayout || '';
    let user = this.className || '';
    if (prev && user.startsWith(prev)) user = user.slice(prev.length).trim();
    this._appliedLayout = layoutClass;
    const next = `${layoutClass}${user ? ` ${user}` : ''}`;
    if (this.className !== next) this.className = next;
  }

  render() {
    const selectedId = this.selectedId;
    const placeholder = this.getAttribute('placeholder') || 'Select model...';
    const showSearch = this.getAttribute('show-search') !== 'false';
    const disabled = this.hasAttribute('disabled');

    const selectedModel = this._models.find((m) => m.id === selectedId) || null;
    const filtered = this._getFilteredModels();

    this._applyHostClass('relative inline-block text-xs font-sans text-zinc-900 dark:text-zinc-100');

    this.innerHTML = `
      <button
        type="button"
        class="model-sel-btn flex items-center justify-between gap-2.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-all shadow-sm ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }"
        aria-haspopup="listbox"
        aria-expanded="${this._isOpen}"
        ${disabled ? 'disabled' : ''}
      >
        <div class="flex items-center gap-2 min-w-0">
          <div class="p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 shrink-0">
            ${uiIcon('sparkles', { size: 14 })}
          </div>
          <div class="flex flex-col text-left truncate">
            <span class="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
              ${selectedModel ? escapeAttribute(selectedModel.name) : escapeAttribute(placeholder)}
            </span>
            ${selectedModel?.provider ? `
              <span class="text-[10px] text-zinc-400 font-mono">
                ${escapeAttribute(selectedModel.provider)}
                ${selectedModel.contextLength ? ` · ${escapeAttribute(selectedModel.contextLength)}` : ''}
              </span>
            ` : ''}
          </div>
        </div>

        <span class="text-zinc-400 shrink-0 transition-transform duration-200 ${this._isOpen ? 'rotate-180' : ''}">
          ${uiIcon('chevron-down', { size: 14 })}
        </span>
      </button>

      ${this._isOpen ? `
        <div class="absolute left-0 mt-1.5 w-72 max-h-80 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl z-40 flex flex-col">
          ${showSearch ? `
            <div class="p-2 border-b border-zinc-100 dark:border-zinc-800">
              <div class="flex items-center gap-2 px-2 py-1 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/80">
                ${uiIcon('search', { size: 13, className: 'text-zinc-400 shrink-0' })}
                <input
                  type="text"
                  class="model-search-input w-full bg-transparent border-none text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none"
                  placeholder="Search models..."
                  value="${escapeAttribute(this._searchQuery)}"
                />
              </div>
            </div>
          ` : ''}

          <div class="overflow-y-auto p-1.5 space-y-1 max-h-60" role="listbox">
            ${filtered.length === 0 ? `
              <div class="p-3 text-center text-zinc-400 text-xs">No models found</div>
            ` : filtered.map((m) => {
              const isSelected = m.id === selectedId;
              return `
                <button
                  type="button"
                  data-model-id="${escapeAttribute(m.id)}"
                  class="model-option-btn w-full flex items-start justify-between gap-2 p-2 rounded-lg text-left transition-colors ${
                    isSelected
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300'
                  }"
                  role="option"
                  aria-selected="${isSelected}"
                >
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span class="font-semibold text-zinc-900 dark:text-zinc-100 truncate">${escapeAttribute(m.name)}</span>
                      ${m.contextLength ? `<span class="text-[10px] px-1.5 py-0.2 rounded bg-zinc-200/60 dark:bg-zinc-700/60 text-zinc-500 dark:text-zinc-300 font-mono">${escapeAttribute(m.contextLength)}</span>` : ''}
                      ${(m.tags || []).map((t) => `<span class="text-[9px] px-1.5 py-0.2 rounded font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">${escapeAttribute(t)}</span>`).join('')}
                    </div>
                    ${m.description ? `<p class="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">${escapeAttribute(m.description)}</p>` : ''}
                  </div>
                  ${isSelected ? `<span class="text-emerald-500 shrink-0 mt-0.5">${uiIcon('check', { size: 14 })}</span>` : ''}
                </button>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}
    `;

    const toggleBtn = this.querySelector('.model-sel-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this._isOpen = !this._isOpen;
        this.render();
        if (this._isOpen) {
          const input = this.querySelector('.model-search-input');
          if (input) input.focus();
        }
      });
    }

    const searchInput = this.querySelector('.model-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this._searchQuery = e.target.value;
        const listbox = this.querySelector('[role="listbox"]');
        if (listbox) {
          const filtered = this._getFilteredModels();
          if (filtered.length === 0) {
            listbox.innerHTML = '<div class="p-3 text-center text-zinc-400 text-xs">No models found</div>';
          } else {
            listbox.innerHTML = filtered.map((m) => {
              const isSelected = m.id === this.selectedId;
              return `
                <button
                  type="button"
                  data-model-id="${escapeAttribute(m.id)}"
                  class="model-option-btn w-full flex items-start justify-between gap-2 p-2 rounded-lg text-left transition-colors ${
                    isSelected
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300'
                  }"
                  role="option"
                  aria-selected="${isSelected}"
                >
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span class="font-semibold text-zinc-900 dark:text-zinc-100 truncate">${escapeAttribute(m.name)}</span>
                      ${m.contextLength ? `<span class="text-[10px] px-1.5 py-0.2 rounded bg-zinc-200/60 dark:bg-zinc-700/60 text-zinc-500 dark:text-zinc-300 font-mono">${escapeAttribute(m.contextLength)}</span>` : ''}
                      ${(m.tags || []).map((t) => `<span class="text-[9px] px-1.5 py-0.2 rounded font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">${escapeAttribute(t)}</span>`).join('')}
                    </div>
                    ${m.description ? `<p class="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">${escapeAttribute(m.description)}</p>` : ''}
                  </div>
                  ${isSelected ? `<span class="text-emerald-500 shrink-0 mt-0.5">${uiIcon('check', { size: 14 })}</span>` : ''}
                </button>
              `;
            }).join('');
            this._bindOptionClicks();
          }
        }
      });
    }

    this._bindOptionClicks();
  }

  _bindOptionClicks() {
    this.querySelectorAll('.model-option-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-model-id');
        const model = this._models.find((m) => m.id === id);
        if (model) {
          this.selectedId = model.id;
          this._isOpen = false;
          this._searchQuery = '';
          this.dispatchEvent(new CustomEvent('select', { detail: model }));
          this.render();
        }
      });
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('model-selector')) {
  customElements.define('model-selector', ModelSelectorElement);
}
export default ModelSelectorElement;
