/**
 * PersonaPresetGrid - Vanilla Web Component
 * Usage: <persona-preset-grid title="Persona presets"></persona-preset-grid>
 * Property: presets ([{id, name, description?, emoji?, temperature?, selected?}])
 * Attributes: title
 * Events: select (detail {preset})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class PersonaPresetGridElement extends HTMLElement {
  static get observedAttributes() {
    return ['title'];
  }

  constructor() {
    super();
    this._presets = [];
    this._bound = false;
    this._gradients = [
      'from-indigo-500 to-purple-500',
      'from-sky-500 to-cyan-400',
      'from-amber-400 to-orange-500',
      'from-emerald-400 to-teal-500',
      'from-rose-400 to-pink-500',
      'from-violet-500 to-fuchsia-500',
    ];
  }

  connectedCallback() {
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const card = event.target.closest('[data-persona-card]');
        if (card) {
          const preset = this._presets.find((p) => p.id === card.getAttribute('data-persona-card'));
          if (preset) {
            // update selection locally so re-render moves the ring
            this._presets = this._presets.map((p) => ({ ...p, selected: p.id === preset.id }));
            this.dispatchEvent(new CustomEvent('select', { detail: { preset } }));
            this.render();
          }
        }
      });
    }
  }

  get presets() { return this._presets; }
  set presets(v) {
    this._presets = Array.isArray(v) ? v.map((p) => ({ ...p })) : [];
    this.render();
  }

  attributeChangedCallback() {
    // Fires before connectedCallback when an already-connected element upgrades;
    // rendering then would wipe light-DOM children before presets are captured.
    if (this._presets.length === 0 && this.innerHTML === '') return;
    this.render();
  }

  render() {
    const title = escapeAttribute(this.getAttribute('title') || 'Persona presets');

    const cards = this._presets.map((preset, i) => {
      const selected = !!preset.selected;
      return `
        <button type="button" data-persona-card="${escapeAttribute(preset.id)}" class="group relative rounded-lg border p-3 text-left transition-all ${selected ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-900' : 'border-zinc-200 hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:hover:border-zinc-700'}">
          ${selected ? '<span data-persona-check class="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-white"><svg viewBox="0 0 20 20" fill="none" class="h-2.5 w-2.5" aria-hidden="true"><path d="m4.5 10.5 3.5 3.5 7.5-8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg></span>' : ''}
          <span data-persona-emoji aria-hidden="true" class="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-lg text-white ${this._gradients[i % this._gradients.length]}">${escapeAttribute(preset.emoji || '🤖')}</span>
          <p data-persona-name class="mt-2 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(preset.name)}</p>
          ${preset.description ? `<p data-persona-desc class="mt-0.5 line-clamp-2 text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">${escapeAttribute(preset.description)}</p>` : ''}
          ${typeof preset.temperature === 'number' ? `<span data-persona-temp class="mt-1.5 inline-block rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">temp ${preset.temperature}</span>` : ''}
        </button>`;
    }).join('');

    this.innerHTML = `<div data-persona-grid class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
  <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${title}</p>
  <div class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">${cards}</div>
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('persona-preset-grid')) {
  customElements.define('persona-preset-grid', PersonaPresetGridElement);
}

export default PersonaPresetGridElement;
