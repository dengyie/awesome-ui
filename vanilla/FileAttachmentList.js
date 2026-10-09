import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const formatFileSize = (bytes) => {
  if (bytes === undefined || bytes === null || Number.isNaN(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const iconForType = (type, name) => {
  if (type && type.startsWith('image/')) return 'image';
  const ext = (name || '').split('.').pop().toLowerCase();
  if (['js', 'ts', 'tsx', 'jsx', 'py', 'java', 'go', 'rs', 'vue', 'html', 'css', 'json', 'sh'].includes(ext)) return 'code';
  return 'paperclip';
};

export class FileAttachmentListElement extends HTMLElement {
  constructor() {
    super();
    this._files = [];
  }

  get files() {
    return this._files;
  }

  set files(val) {
    this._files = Array.isArray(val) ? val : [];
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    if (this._files.length === 0) {
      this.innerHTML = '';
      return;
    }

    this.className = 'flex flex-wrap gap-2';
    this.innerHTML = this._files
      .map((f) => {
        const sizeText = formatFileSize(f.size);
        return `
          <div class="flex items-center gap-2 pl-2 pr-1 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-xs text-zinc-700 dark:text-zinc-300">
            ${uiIcon(iconForType(f.type, f.name), { size: 14, className: 'text-zinc-400 shrink-0' })}
            <span class="max-w-40 truncate font-medium">${escapeAttribute(f.name)}</span>
            ${sizeText ? `<span class="text-[10px] font-mono text-zinc-400 shrink-0">${escapeAttribute(sizeText)}</span>` : ''}
            <button
              type="button"
              data-file-id="${escapeAttribute(f.id)}"
              aria-label="Remove ${escapeAttribute(f.name)}"
              class="file-remove p-1 rounded-md text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
            >${uiIcon('x', { size: 12 })}</button>
          </div>`;
      })
      .join('');

    this.querySelectorAll('.file-remove').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-file-id');
        const file = this._files.find((f) => String(f.id) === String(id));
        if (file) this.dispatchEvent(new CustomEvent('remove', { detail: { id: file.id } }));
      });
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('file-attachment-list')) {
  customElements.define('file-attachment-list', FileAttachmentListElement);
}
export default FileAttachmentListElement;
