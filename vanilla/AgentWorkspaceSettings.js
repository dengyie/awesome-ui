/**
 * AgentWorkspaceSettings - Vanilla Web Component
 * Agent workspace settings page body: optional section tabs, titled groups
 * with description and description-led toggle rows.
 *
 * Usage: <agent-workspace-settings title="Settings"></agent-workspace-settings>
 * Property: sections ([{id, title, description?, toggles: [{id, label, description?, enabled}]}])
 *           tabs ([{id, label}])
 * Attributes: title, subtitle
 * Events: toggle (detail {toggle, enabled})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class AgentWorkspaceSettingsElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'subtitle'];
  }

  constructor() {
    super();
    this._sections = [];
    this._tabs = [];
    this._enabled = {};
    this._bound = false;
  }

  connectedCallback() {
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-agent-setting-toggle]');
        if (!btn) return;
        const row = btn.closest('[data-agent-setting-row]');
        const id = row?.getAttribute('data-agent-setting-row');
        const toggle = this._sections.flatMap((s) => s.toggles).find((t) => t.id === id);
        if (!toggle) return;
        const next = !this._enabled[toggle.id];
        this._enabled[toggle.id] = next;
        this.dispatchEvent(new CustomEvent('toggle', { detail: { toggle, enabled: next } }));
        this.render();
      });
    }
  }

  get sections() { return this._sections; }
  set sections(v) {
    this._sections = Array.isArray(v) ? v.map((s) => ({ ...s, toggles: (s.toggles || []).map((t) => ({ ...t })) })) : [];
    this._syncEnabled();
    this.render();
  }

  get tabs() { return this._tabs; }
  set tabs(v) {
    this._tabs = Array.isArray(v) ? v.map((t) => ({ ...t })) : [];
    this.render();
  }

  _syncEnabled() {
    const seen = {};
    for (const s of this._sections) {
      for (const t of s.toggles) {
        seen[t.id] = true;
        if (!(t.id in this._enabled)) this._enabled[t.id] = !!t.enabled;
      }
    }
    for (const id of Object.keys(this._enabled)) {
      if (!seen[id]) delete this._enabled[id];
    }
  }

  attributeChangedCallback() {
    // Fires before connectedCallback when an already-connected element upgrades;
    // rendering then would wipe light-DOM children before sections are captured.
    if (this._sections.length === 0 && this.innerHTML === '') return;
    this.render();
  }

  render() {
    const title = escapeAttribute(this.getAttribute('title') || 'Settings');
    const subtitle = escapeAttribute(this.getAttribute('subtitle') || 'Manage and update your agent workspace.');

    const tabs = this._tabs.map((tab, i) => `
      <button type="button" data-agent-settings-tab="${escapeAttribute(tab.id)}" aria-selected="${i === 0}" class="rounded-full border border-zinc-200 px-3.5 py-1.5 text-xs font-semibold text-zinc-600 transition-colors aria-selected:border-transparent aria-selected:bg-zinc-900 aria-selected:text-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:aria-selected:bg-zinc-50 dark:aria-selected:text-zinc-900">${escapeAttribute(tab.label)}</button>`
    ).join('');

    const sections = this._sections.map((section) => {
      const onCount = section.toggles.filter((t) => this._enabled[t.id]).length;
      const rows = section.toggles.map((toggle) => {
        const on = !!this._enabled[toggle.id];
        const desc = toggle.description
          ? `<p class="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">${escapeAttribute(toggle.description)}</p>`
          : '';
        return `
          <div data-agent-setting-row="${escapeAttribute(toggle.id)}" class="flex items-center justify-between gap-4">
            <div class="min-w-0">
              <p class="text-xs font-medium text-zinc-900 dark:text-zinc-50">${escapeAttribute(toggle.label)}</p>
              ${desc}
            </div>
            <button type="button" data-agent-setting-toggle role="switch" aria-checked="${on}" aria-label="${escapeAttribute(toggle.label)}" class="relative h-5 w-9 shrink-0 rounded-full transition-colors ${on ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600'}">
              <span class="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${on ? 'left-4' : 'left-0.5'}"></span>
            </button>
          </div>`;
      }).join('');
      const desc = section.description
        ? `<p class="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">${escapeAttribute(section.description)}</p>`
        : '';
      return `
        <section data-agent-settings-section="${escapeAttribute(section.id)}">
          <div class="flex items-baseline justify-between">
            <p class="text-sm font-bold text-zinc-900 dark:text-zinc-50">${escapeAttribute(section.title)}</p>
            <span class="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">${onCount}/${section.toggles.length} on</span>
          </div>
          ${desc}
          <div class="mt-3 space-y-3">${rows}</div>
        </section>`;
    }).join('');

    this.innerHTML = `<div data-agent-settings class="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
  <p data-agent-settings-title class="text-lg font-bold text-zinc-900 dark:text-zinc-50">${title}</p>
  <p data-agent-settings-subtitle class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">${subtitle}</p>
  ${this._tabs.length > 0 ? `<div data-agent-settings-tabs class="mt-4 flex flex-wrap gap-2">${tabs}</div>` : ''}
  <div data-agent-settings-sections class="mt-5 space-y-6">${sections}</div>
</div>`;
  }
}

if (!customElements.get('agent-workspace-settings')) {
  customElements.define('agent-workspace-settings', AgentWorkspaceSettingsElement);
}
