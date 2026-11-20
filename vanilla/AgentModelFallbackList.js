/**
 * AgentModelFallbackList - Vanilla Web Component
 * Model fallback chain: ranked rows with health dot, primary badge,
 * condition/latency caption and promote/demote reorder controls.
 *
 * Usage: <agent-model-fallback-list title="Model fallback chain"></agent-model-fallback-list>
 * Properties: entries ([{id,model,provider?,health?,condition?,latency?}]), primaryId
 * Attributes: title, description
 * Events: reorder (detail {ids})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const HEALTH_DOT = {
  healthy: 'bg-emerald-500',
  degraded: 'bg-amber-500',
  down: 'bg-rose-500',
};
const HEALTH_TEXT = {
  healthy: 'Healthy',
  degraded: 'Degraded',
  down: 'Down',
};

export class AgentModelFallbackListElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'description'];
  }

  constructor() {
    super();
    this._entries = [];
    this._ids = [];
    this._primaryId = '';
    this._moveFlash = null;
    this._flashTimer = null;
    this._bound = false;
  }

  get entries() {
    return this._entries;
  }

  set entries(value) {
    this._entries = Array.isArray(value) ? value.map((e) => ({ ...e })) : [];
    this._ids = this._entries.map((e) => e.id);
    this.render();
  }

  get primaryId() {
    return this._primaryId || this._ids[0] || '';
  }

  set primaryId(value) {
    this._primaryId = String(value || '');
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    this.render();
  }

  connectedCallback() {
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const upBtn = event.target.closest('[data-fallback-up]');
        const downBtn = event.target.closest('[data-fallback-down]');
        if (!upBtn && !downBtn) return;
        const row = (upBtn || downBtn).closest('[data-fallback-row]');
        if (!row) return;
        const id = row.getAttribute('data-fallback-row');
        const dir = upBtn ? -1 : 1;
        const idx = this._ids.indexOf(id);
        const next = idx + dir;
        if (idx < 0 || next < 0 || next >= this._ids.length) return;
        const list = [...this._ids];
        list.splice(idx, 1);
        list.splice(next, 0, id);
        this._ids = list;
        this._moveFlash = id;
        this.render();
        if (this._flashTimer) clearTimeout(this._flashTimer);
        this._flashTimer = setTimeout(() => {
          this._moveFlash = null;
          this.render();
        }, 1200);
        this.dispatchEvent(new CustomEvent('reorder', { detail: { ids: [...this._ids] } }));
      });
    }
  }

  _ordered() {
    return this._ids
      .map((id) => this._entries.find((e) => e.id === id))
      .filter((e) => Boolean(e));
  }

  render() {
    const title = this.getAttribute('title') || 'Model fallback chain';
    const description = this.getAttribute('description') ||
      'Requests try the primary model first, then walk down the chain when a fallback condition triggers.';
    const ordered = this._ordered();
    const primary = this.primaryId;
    const rows = ordered.map((entry, i) => {
      const isPrimary = entry.id === primary;
      const health = HEALTH_DOT[entry.health] ? entry.health : 'healthy';
      const caption = [
        entry.provider,
        entry.condition || 'fallback',
        entry.latency,
      ].filter(Boolean).join(' · ');
      return `<div data-fallback-row="${escapeAttribute(entry.id)}"
        class="flex items-center gap-2.5 rounded-lg border px-3 py-2 ${isPrimary
          ? 'border-indigo-200 bg-indigo-50/60 dark:border-indigo-500/30 dark:bg-indigo-500/10'
          : 'border-zinc-200 dark:border-zinc-700'}">
          <span data-fallback-rank class="w-4 text-center font-mono text-[11px] text-zinc-400 dark:text-zinc-500">${i + 1}</span>
          <span class="h-2 w-2 shrink-0 rounded-full ${HEALTH_DOT[health]}" title="${HEALTH_TEXT[health]}"></span>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span data-fallback-model class="truncate text-xs font-semibold text-zinc-800 dark:text-zinc-100">${escapeAttribute(entry.model)}</span>
              ${isPrimary ? '<span data-fallback-primary class="rounded-full bg-indigo-600 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">Primary</span>' : ''}
              ${this._moveFlash === entry.id ? '<span data-fallback-moved class="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">order updated</span>' : ''}
            </div>
            <p class="mt-0.5 truncate text-[11px] text-zinc-500 dark:text-zinc-400">${escapeAttribute(caption)}</p>
          </div>
          <div class="flex shrink-0 flex-col gap-0.5">
            <button type="button" data-fallback-up title="Promote" aria-label="Promote ${escapeAttribute(entry.model)}" ${i === 0 ? 'disabled' : ''}
              class="rounded border border-zinc-200 px-1.5 text-[10px] leading-4 text-zinc-500 disabled:opacity-30 hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">↑</button>
            <button type="button" data-fallback-down title="Demote" aria-label="Demote ${escapeAttribute(entry.model)}" ${i === ordered.length - 1 ? 'disabled' : ''}
              class="rounded border border-zinc-200 px-1.5 text-[10px] leading-4 text-zinc-500 disabled:opacity-30 hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">↓</button>
          </div>
        </div>`;
    }).join('');
    this.innerHTML = `
      <div data-fallback-list class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p data-fallback-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(title)}</p>
        <p data-fallback-description class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">${escapeAttribute(description)}</p>
        <div data-fallback-rows class="mt-3 space-y-2">
          ${rows || '<p data-fallback-empty class="rounded-lg border border-dashed border-zinc-200 px-3 py-4 text-center text-xs text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">No models in the fallback chain</p>'}
        </div>
      </div>`;
  }
}

export default AgentModelFallbackListElement;

if (!customElements.get('agent-model-fallback-list')) {
  customElements.define('agent-model-fallback-list', AgentModelFallbackListElement);
}
