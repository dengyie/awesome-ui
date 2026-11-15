/**
 * ShortcutCheatSheet - Vanilla Web Component
 * Usage: <shortcut-cheat-sheet shortcuts='[...]' title="Shortcuts" searchable="true"></shortcut-cheat-sheet>
 * Attributes: shortcuts (JSON [{id,icon?,label,hint?,keys[],section?}]), title, columns (1|2), searchable
 * Properties: shortcuts
 * Events: none (internal search only)
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const escapeHtml = (value) =>
  String(value).replace(/[&<>]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
  }[char]));

export class ShortcutCheatSheetElement extends HTMLElement {
  static get observedAttributes() {
    return ['shortcuts', 'title', 'columns', 'searchable'];
  }

  constructor() {
    super();
    this._shortcuts = [];
    this._query = '';
    this._bound = false;
  }

  connectedCallback() {
    if (!this._shortcuts.length) {
      const raw = this.getAttribute('shortcuts');
      if (raw) {
        try { this._shortcuts = JSON.parse(raw); } catch { this._shortcuts = []; }
      }
    }
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('input', (event) => {
        const target = event.target;
        if (target.hasAttribute && target.hasAttribute('data-shortcut-search')) {
          this._query = target.value;
          this.render();
          const input = this.querySelector('[data-shortcut-search]');
          if (input) {
            input.value = this._query;
            input.focus();
          }
        }
      });
    }
  }

  attributeChangedCallback(name) {
    if (name === 'shortcuts') this._shortcuts = [];
    this.render();
  }

  get shortcuts() { return this._shortcuts; }
  set shortcuts(v) {
    this._shortcuts = Array.isArray(v) ? v : [];
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
    const title = this.getAttribute('title') || 'Shortcuts';
    const columns = this.getAttribute('columns') === '1' ? 1 : 2;
    const searchable = this.getAttribute('searchable') === 'true';
    const needle = this._query.trim().toLowerCase();

    const filtered = needle
      ? this._shortcuts.filter((entry) => `${entry.label} ${entry.hint || ''} ${(entry.keys || []).join(' ')}`.toLowerCase().includes(needle))
      : this._shortcuts;

    const sections = new Map();
    for (const entry of filtered) {
      const key = entry.section || '';
      if (!sections.has(key)) sections.set(key, []);
      sections.get(key).push(entry);
    }

    const hostClass = 'w-full max-w-md rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900';
    this._applyHostClass(hostClass);

    const kbdChip = (key, entryId, i) => `<kbd class="inline-flex min-w-[24px] items-center justify-center rounded-md border border-zinc-300 bg-zinc-50 px-1.5 py-0.5 text-[11px] font-medium text-zinc-600 shadow-[0_1px_0_0_rgba(0,0,0,0.06)]">${escapeHtml(key)}</kbd>`;

    const sectionsHtml = Array.from(sections.entries())
      .map(([section, entries]) => {
        const rows = entries
          .map((entry) => {
            const icon = entry.icon ? `<span class="shrink-0 text-zinc-400 [&>svg]:h-4 [&>svg]:w-4">${entry.icon}</span>` : '';
            const hint = entry.hint ? `<code class="ml-1 rounded bg-indigo-50 px-1 font-mono text-[10px] text-indigo-600">${escapeHtml(entry.hint)}</code>` : '';
            const keys = (entry.keys || []).map((key, i) => kbdChip(key, entry.id, i)).join('');
            return `<li data-shortcut-row="${escapeAttribute(entry.id)}" class="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-zinc-50">${icon}<span class="min-w-0 flex-1 text-xs text-zinc-700">${escapeHtml(entry.label)}${hint}</span><span class="flex shrink-0 items-center gap-1">${keys}</span></li>`;
          })
          .join('');
        const header = section ? `<p class="mt-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">${escapeHtml(section)}</p>` : '';
        return `<div${section ? ` data-shortcut-section="${escapeAttribute(section)}"` : ''} class="${columns === 2 ? 'sm:col-span-1' : ''}">${header}<ul class="mt-1 space-y-0.5">${rows}</ul></div>`;
      })
      .join('');

    const empty = !sections.size
      ? `<p data-shortcut-empty class="py-6 text-center text-xs text-zinc-400">No shortcuts match “${escapeHtml(this._query)}”.</p>`
      : '';

    this.innerHTML = `<div data-shortcut-sheet class="${hostClass}">
  <div class="flex items-center justify-between">
    <p class="text-sm font-semibold text-zinc-900">${escapeHtml(title)}</p>
    ${searchable ? `<input data-shortcut-search type="text" value="${escapeAttribute(this._query)}" placeholder="Search…" class="w-32 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700 focus:border-indigo-500 focus:outline-none"/>` : ''}
  </div>
  <div class="mt-2 grid gap-x-6 ${columns === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}">${sectionsHtml}</div>
  ${empty}
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('shortcut-cheat-sheet')) {
  customElements.define('shortcut-cheat-sheet', ShortcutCheatSheetElement);
}

export default ShortcutCheatSheetElement;
