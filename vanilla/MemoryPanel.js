/**
 * MemoryPanel - Vanilla Web Component
 * Usage: <memory-panel title="Memory" note="..." add-placeholder="..." add-text="Add"></memory-panel>
 * Property: items ([{id, text, source?}])
 * Events: add (detail {text}), edit (detail {id, text}), delete (detail {id}), clear
 * Inline editing state is internal (_editingId) and survives re-renders.
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class MemoryPanelElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'note', 'add-placeholder', 'add-text'];
  }

  constructor() {
    super();
    this._items = [];
    this._editingId = null;
    this._editDraft = '';
    this._bound = false;
  }

  connectedCallback() {
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const itemEl = event.target.closest('[data-memory-item]');
        const itemId = itemEl ? itemEl.getAttribute('data-memory-item') : null;
        if (event.target.closest('[data-memory-edit]') && itemId) {
          const item = this._items.find((x) => x.id === itemId);
          if (item) {
            this._editingId = item.id;
            this._editDraft = item.text;
            this.render();
          }
          return;
        }
        if (event.target.closest('[data-memory-save]') && this._editingId) {
          // read the live input value — programmatic .value changes don't fire `input`
          const editInput = this.querySelector('[data-memory-edit-input]');
          const text = ((editInput ? editInput.value : '') || this._editDraft).trim();
          const id = this._editingId;
          this._editingId = null;
          this.render();
          if (text) this.dispatchEvent(new CustomEvent('edit', { detail: { id, text } }));
          return;
        }
        if (event.target.closest('[data-memory-cancel]')) {
          this._editingId = null;
          this.render();
          return;
        }
        if (event.target.closest('[data-memory-delete]') && itemId) {
          this.dispatchEvent(new CustomEvent('delete', { detail: { id: itemId } }));
          return;
        }
        if (event.target.closest('[data-memory-clear]')) {
          this.dispatchEvent(new CustomEvent('clear'));
          return;
        }
        if (event.target.closest('[data-memory-add]')) {
          const input = this.querySelector('[data-memory-add-input]');
          const text = (input ? input.value : '').trim();
          if (text) {
            this.dispatchEvent(new CustomEvent('add', { detail: { text } }));
            if (input) input.value = '';
          }
        }
      });
      this.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && event.target.matches('[data-memory-add-input]')) {
          const text = event.target.value.trim();
          if (text) {
            this.dispatchEvent(new CustomEvent('add', { detail: { text } }));
            event.target.value = '';
          }
        }
        if (event.key === 'Enter' && event.target.matches('[data-memory-edit-input]')) {
          this._editDraft = event.target.value;
          const id = this._editingId;
          const text = this._editDraft.trim();
          this._editingId = null;
          this.render();
          if (id && text) this.dispatchEvent(new CustomEvent('edit', { detail: { id, text } }));
        }
        if (event.key === 'Escape' && event.target.matches('[data-memory-edit-input]')) {
          this._editingId = null;
          this.render();
        }
      });
      this.addEventListener('input', (event) => {
        if (event.target.matches('[data-memory-edit-input]')) {
          this._editDraft = event.target.value;
        }
      });
    }
  }

  get items() { return this._items; }
  set items(v) {
    this._items = Array.isArray(v) ? v : [];
    this.render();
  }

  attributeChangedCallback() {
    // Fires before connectedCallback when an already-connected element upgrades;
    // rendering then would wipe light-DOM children before items are captured.
    if (this._items.length === 0 && this.innerHTML === '') return;
    this.render();
  }

  render() {
    const title = escapeAttribute(this.getAttribute('title') || 'Memory');
    const note = escapeAttribute(this.getAttribute('note') || 'Facts the assistant remembers across conversations.');
    const addPlaceholder = escapeAttribute(this.getAttribute('add-placeholder') || 'Add a memory…');
    const addText = escapeAttribute(this.getAttribute('add-text') || 'Add');

    const rows = this._items.map((item) => {
      if (this._editingId === item.id) {
        return `
          <li data-memory-item="${escapeAttribute(item.id)}" class="rounded-lg border border-zinc-200 px-3 py-2.5 dark:border-zinc-800">
            <div class="flex items-center gap-2">
              <input data-memory-edit-input value="${escapeAttribute(this._editDraft)}" class="min-w-0 flex-1 rounded-md border border-indigo-300 bg-indigo-50/60 px-2 py-1 text-sm text-zinc-800 outline-none dark:border-indigo-700 dark:bg-indigo-950/40 dark:text-zinc-100" />
              <button type="button" data-memory-save class="shrink-0 rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white hover:bg-indigo-500">Save</button>
              <button type="button" data-memory-cancel class="shrink-0 rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300">Cancel</button>
            </div>
          </li>`;
      }
      return `
        <li data-memory-item="${escapeAttribute(item.id)}" class="rounded-lg border border-zinc-200 px-3 py-2.5 dark:border-zinc-800">
          <div class="flex items-start justify-between gap-2">
            <p data-memory-text class="text-sm text-zinc-800 dark:text-zinc-100">${escapeAttribute(item.text)}</p>
            <span class="flex shrink-0 items-center gap-1">
              <button type="button" data-memory-edit aria-label="Edit memory" class="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"><svg viewBox="0 0 20 20" fill="currentColor" class="h-3.5 w-3.5" aria-hidden="true"><path d="M12.7 3.3a1.5 1.5 0 0 1 2.12 0l1.88 1.88a1.5 1.5 0 0 1 0 2.12l-8.37 8.37a2 2 0 0 1-1.02.55l-2.9.65a.6.6 0 0 1-.7-.71l.64-2.9a2 2 0 0 1 .55-1.02L12.7 3.3Z"/></svg></button>
              <button type="button" data-memory-delete aria-label="Forget memory" class="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"><svg viewBox="0 0 20 20" fill="currentColor" class="h-3.5 w-3.5" aria-hidden="true"><path d="M8 3.25h4a.75.75 0 0 1 0 1.5h1.75a.75.75 0 0 1 0 1.5H6.25a.75.75 0 0 1 0-1.5H8Zm-2.75 4.5h9.5a.75.75 0 0 1 0 1.5h-.5l-.4 5.6A1.75 1.75 0 0 1 12.1 16.3H7.9a1.75 1.75 0 0 1-1.75-1.62l-.4-5.68h-.5a.75.75 0 0 1 0-1.5Z"/></svg></button>
            </span>
          </div>
          ${item.source ? `<p data-memory-source class="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">${escapeAttribute(item.source)}</p>` : ''}
        </li>`;
    }).join('');

    this.innerHTML = `<div data-memory-panel class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
  <div class="flex items-center justify-between">
    <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${title}</p>
    ${this._items.length > 0 ? `<button type="button" data-memory-clear class="text-xs font-medium text-red-600 hover:underline dark:text-red-400">Clear all</button>` : ''}
  </div>
  <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">${note}</p>
  <ul class="mt-3 space-y-2">${rows}
    ${this._items.length === 0 ? `<li data-memory-empty class="rounded-lg border border-dashed border-zinc-300 px-3 py-4 text-center text-xs text-zinc-400 dark:border-zinc-700">No memories yet.</li>` : ''}
  </ul>
  <div class="mt-3 flex items-center gap-2">
    <input data-memory-add-input placeholder="${addPlaceholder}" class="min-w-0 flex-1 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-sm text-zinc-800 outline-none focus:border-indigo-400 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
    <button type="button" data-memory-add class="shrink-0 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900">${addText}</button>
  </div>
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('memory-panel')) {
  customElements.define('memory-panel', MemoryPanelElement);
}

export default MemoryPanelElement;
