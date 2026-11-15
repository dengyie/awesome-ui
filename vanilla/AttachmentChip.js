/**
 * AttachmentChip - Vanilla Web Component
 * Usage: <attachment-chip name="report.pdf" kind="pdf" size="2.4 MB" meta="Uploaded just now"></attachment-chip>
 * Attributes: name, kind (pdf|doc|csv|image), size, meta, removable (true|false)
 * Events: remove
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const KIND_TONE = {
  pdf: { badge: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300', glyph: 'PDF' },
  doc: { badge: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300', glyph: 'DOC' },
  csv: { badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300', glyph: 'CSV' },
  image: { badge: 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300', glyph: 'IMG' },
};

export class AttachmentChipElement extends HTMLElement {
  static get observedAttributes() {
    return ['name', 'kind', 'size', 'meta', 'removable'];
  }

  constructor() {
    super();
    this._bound = false;
  }

  get removable() {
    return this.getAttribute('removable') !== 'false';
  }

  set removable(flag) {
    this.setAttribute('removable', flag ? 'true' : 'false');
  }

  connectedCallback() {
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        if (event.target.closest('[data-attachment-remove]')) this.dispatchEvent(new CustomEvent('remove', { detail: { name: this.getAttribute('name') || '' } }));
      });
    }
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
    const name = this.getAttribute('name') || '';
    const kind = this.getAttribute('kind') || 'doc';
    const size = this.getAttribute('size') || '';
    const meta = this.getAttribute('meta') || '';
    const removable = this.getAttribute('removable') !== 'false';
    const tone = KIND_TONE[kind] || KIND_TONE.doc;
    const sub = [size, meta].filter(Boolean).join(' · ');

    this.innerHTML = `<span data-attachment-chip class="inline-flex max-w-xs items-center gap-2 rounded-lg border border-zinc-200 bg-white py-1.5 pl-2.5 pr-7 dark:border-zinc-700 dark:bg-zinc-900" title="${escapeAttribute(name)}">
      <span class="flex h-6 shrink-0 items-center justify-center rounded px-1.5 font-mono text-[10px] font-bold ${tone.badge}">${tone.glyph}</span>
      <span class="min-w-0">
        <span class="block max-w-[160px] truncate text-xs font-medium text-zinc-800 dark:text-zinc-100">${escapeAttribute(name)}</span>
        ${sub ? `<span class="block text-[10px] text-zinc-500 dark:text-zinc-400">${escapeAttribute(sub)}</span>` : ''}
      </span>
      ${
        removable
          ? `<button type="button" data-attachment-remove aria-label="Remove ${escapeAttribute(name)}" class="relative -ml-5 h-4 w-4 shrink-0 rounded-full bg-zinc-900 text-white transition-colors hover:bg-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-zinc-50 dark:text-zinc-900">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="mx-auto h-2.5 w-2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>`
          : ''
      }
    </span>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('attachment-chip')) {
  customElements.define('attachment-chip', AttachmentChipElement);
}
export default AttachmentChipElement;
