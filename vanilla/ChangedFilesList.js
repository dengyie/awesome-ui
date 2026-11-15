/**
 * ChangedFilesList - Vanilla Web Component
 * Usage: <changed-files-list title="3 Files Changed"></changed-files-list>
 * Attributes: title, grouped (true|false), show-diffstat (true|false), default-expanded (true|false), files (JSON attribute)
 * Properties: files (Array<{path, additions, deletions, status?}>)
 * Events: file-click (detail {file}), toggle (detail {open})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const STATUS_TAG = {
  new: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  generated: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300',
  deleted: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  modified: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
};

const nameOf = (path) => String(path || '').split('/').pop() || path;
const extOf = (path) => nameOf(path).split('.').pop() || '';
const parentOf = (path) => {
  const parts = String(path || '').split('/');
  return parts.length > 1 ? parts.slice(0, -1).join('/') : '';
};

export class ChangedFilesListElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'grouped', 'show-diffstat', 'default-expanded'];
  }

  constructor() {
    super();
    this._files = [];
    this._open = true;
    this._bound = false;
  }

  get files() {
    return this._files;
  }

  set files(list) {
    this._files = Array.isArray(list) ? list : [];
    this.render();
  }

  connectedCallback() {
    if (!this._files.length) {
      const raw = this.getAttribute('files');
      if (raw) {
        try { this._files = JSON.parse(raw); } catch { this._files = []; }
      }
    }
    this._open = this.getAttribute('default-expanded') !== 'false';
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        if (event.target.closest('[data-changed-files-toggle]')) {
          this._open = !this._open;
          this.dispatchEvent(new CustomEvent('toggle', { detail: { open: this._open } }));
          this.render();
          return;
        }
        const row = event.target.closest('[data-changed-file]');
        if (row) {
          const file = this._files.find((item) => item.path === row.getAttribute('data-changed-file'));
          if (file) this.dispatchEvent(new CustomEvent('file-click', { detail: { file } }));
        }
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
    this._applyHostClass('block');
    const title = this.getAttribute('title') || 'Files changed';
    const grouped = this.getAttribute('grouped') === 'true';
    const showDiffstat = this.getAttribute('show-diffstat') !== 'false';
    const files = Array.isArray(this._files) ? this._files : [];
    const totals = files.reduce(
      (acc, file) => ({ additions: acc.additions + (file.additions || 0), deletions: acc.deletions + (file.deletions || 0) }),
      { additions: 0, deletions: 0 },
    );

    let groups;
    if (grouped) {
      const map = new Map();
      files.forEach((file) => {
        const folder = parentOf(file.path) || '/';
        if (!map.has(folder)) map.set(folder, []);
        map.get(folder).push(file);
      });
      groups = [...map.entries()].map(([folder, list]) => ({ folder, files: list }));
    } else {
      groups = [{ folder: '', files }];
    }

    const rowHtml = (file) => `<button type="button" data-changed-file="${escapeAttribute(file.path)}" class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-zinc-50 focus-visible:outline-none dark:hover:bg-zinc-800/60">
        <span class="shrink-0 rounded border border-zinc-200 px-1 font-mono text-[10px] font-bold text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">${escapeAttribute(extOf(file.path))}</span>
        <span class="min-w-0 flex-1 truncate font-mono text-xs text-zinc-800 dark:text-zinc-100">${escapeAttribute(grouped ? nameOf(file.path) : file.path)}</span>
        ${file.status && STATUS_TAG[file.status] ? `<span class="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${STATUS_TAG[file.status]}">${escapeAttribute(file.status)}</span>` : ''}
        ${showDiffstat ? `<span class="shrink-0 font-mono text-[11px]"><span class="text-emerald-600 dark:text-emerald-400">+${file.additions || 0}</span> <span class="text-rose-600 dark:text-rose-400">−${file.deletions || 0}</span></span>` : ''}
      </button>`;

    this.innerHTML = `<div data-changed-files class="w-full rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <button type="button" data-changed-files-toggle class="flex w-full items-center gap-2 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform ${this._open ? 'rotate-90' : ''}"><path d="m9 18 6-6-6-6" /></svg>
        <span class="min-w-0 flex-1 text-sm font-bold text-zinc-900 dark:text-zinc-50">${escapeAttribute(title)}</span>
        ${showDiffstat ? `<span class="shrink-0 font-mono text-xs"><span class="text-emerald-600 dark:text-emerald-400">+${totals.additions}</span> <span class="text-rose-600 dark:text-rose-400">−${totals.deletions}</span></span>` : ''}
      </button>
      ${
        this._open
          ? `<div class="px-2 pb-2">
              ${groups
                .map(
                  (group) => `<div ${group.folder ? `data-files-group="${escapeAttribute(group.folder)}"` : ''}>
                    ${grouped && group.folder ? `<p class="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">${escapeAttribute(group.folder)}/</p>` : ''}
                    ${group.files.map(rowHtml).join('')}
                  </div>`,
                )
                .join('')}
            </div>`
          : ''
      }
    </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('changed-files-list')) {
  customElements.define('changed-files-list', ChangedFilesListElement);
}
export default ChangedFilesListElement;
