import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exp = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / 1024 ** exp;
  return `${value >= 10 || exp === 0 ? Math.round(value) : value.toFixed(1)} ${units[exp]}`;
};

const matchesAccept = (file, accept) => {
  if (!accept) return true;
  return accept
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)
    .some((token) => {
      if (token.startsWith('.')) return file.name.toLowerCase().endsWith(token);
      if (token.endsWith('/*')) return Boolean(file.type && file.type.toLowerCase().startsWith(token.slice(0, -1)));
      return file.type && file.type.toLowerCase() === token;
    });
};

const fileIcon = (file) => {
  if (file.type && file.type.startsWith('image/')) return 'image';
  if (/\.(ts|tsx|js|jsx|py|go|rs|json|css|html)$/i.test(file.name)) return 'code';
  return 'paperclip';
};

/**
 * FileDropzone - Vanilla Web Component
 * Usage: <file-dropzone accept="image/*" max-size-mb="5"></file-dropzone>
 * Events: files (detail: File[]), reject (detail: [{name, reason}]), remove (detail: {file, index})
 */
export class FileDropzoneElement extends HTMLElement {
  static get observedAttributes() {
    return ['accept', 'multiple', 'max-size-mb', 'hint', 'disabled'];
  }

  constructor() {
    super();
    this._files = [];
    this._dragging = false;
    this._error = null;
  }

  get files() {
    return this._files;
  }

  set files(value) {
    this._files = Array.isArray(value) ? value : [];
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

  _handleFiles(list) {
    const incoming = Array.from(list || []);
    if (incoming.length === 0) return;

    const accept = this.getAttribute('accept') || '';
    const maxSizeMb = Number(this.getAttribute('max-size-mb') || 0) || 0;
    const multiple = !this.hasAttribute('multiple') || this.getAttribute('multiple') !== 'false';

    const rejected = [];
    const accepted = incoming.filter((file) => {
      if (!matchesAccept(file, accept)) {
        rejected.push({ name: file.name, reason: 'type' });
        return false;
      }
      if (maxSizeMb && file.size > maxSizeMb * 1024 * 1024) {
        rejected.push({ name: file.name, reason: 'size' });
        return false;
      }
      return true;
    });

    if (rejected.length) {
      this._error =
        rejected[0].reason === 'size'
          ? `${rejected[0].name} is larger than ${maxSizeMb} MB`
          : `${rejected[0].name} is not an accepted file type`;
      this.dispatchEvent(new CustomEvent('reject', { detail: rejected }));
    } else {
      this._error = null;
    }

    if (accepted.length) {
      this.dispatchEvent(
        new CustomEvent('files', { detail: multiple ? accepted : accepted.slice(0, 1) })
      );
    }
    this.render();
  }

  render() {
    const accept = this.getAttribute('accept') || '';
    const multiple = !this.hasAttribute('multiple') || this.getAttribute('multiple') !== 'false';
    const maxSizeMb = Number(this.getAttribute('max-size-mb') || 0) || 0;
    const hint = this.getAttribute('hint') || '';
    const disabled = this.hasAttribute('disabled') && this.getAttribute('disabled') !== 'false';

    this._applyHostClass('block');

    const hintText =
      hint ||
      [accept ? `Accepts ${accept}` : null, maxSizeMb ? `up to ${maxSizeMb} MB` : null].filter(Boolean).join(' · ') ||
      'Any file type';

    const dropClass = this._dragging
      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
      : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600';

    const fileRows = this._files
      .map(
        (file, index) => `
        <li class="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-1.5">
          <span class="shrink-0 text-zinc-400">${uiIcon(fileIcon(file), { size: 14 })}</span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-[11px] font-medium text-zinc-800 dark:text-zinc-200">${escapeAttribute(file.name)}</span>
            <span class="block text-[10px] tabular-nums text-zinc-400">${formatBytes(file.size)}</span>
          </span>
          <button type="button" class="file-remove shrink-0 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            data-index="${index}" aria-label="Remove ${escapeAttribute(file.name)}">${uiIcon('x', { size: 12 })}</button>
        </li>`
      )
      .join('');

    this.innerHTML = `
      <div class="dropzone flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-7 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${dropClass} ${disabled ? 'cursor-not-allowed opacity-60' : ''}"
        role="button" tabindex="${disabled ? -1 : 0}" aria-label="${escapeAttribute(hint || 'Drop files here or browse')}" ${disabled ? 'aria-disabled="true"' : ''}>
        <span class="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">${uiIcon('upload', { size: 16 })}</span>
        <p class="text-xs font-medium text-zinc-700 dark:text-zinc-200">Drag &amp; drop ${multiple ? 'files' : 'a file'} here, or <span class="text-indigo-600 dark:text-indigo-400">browse</span></p>
        <p class="text-[11px] text-zinc-400">${escapeAttribute(hintText)}</p>
        <input type="file" class="dropzone-input hidden" ${accept ? `accept="${escapeAttribute(accept)}"` : ''} ${multiple ? 'multiple' : ''} ${disabled ? 'disabled' : ''} />
      </div>

      ${
        this._error
          ? `<p role="alert" class="mt-2 flex items-center gap-1.5 text-[11px] text-red-600 dark:text-red-400"><span>${uiIcon('alert-triangle', { size: 12 })}</span>${escapeAttribute(this._error)}</p>`
          : ''
      }

      ${fileRows ? `<ul class="file-list mt-3 space-y-1.5">${fileRows}</ul>` : ''}
    `;

    const zone = this.querySelector('.dropzone');
    const input = this.querySelector('.dropzone-input');

    zone.addEventListener('click', () => {
      if (!disabled) input.click();
    });

    zone.addEventListener('keydown', (event) => {
      if ((event.key === 'Enter' || event.key === ' ') && !disabled) {
        event.preventDefault();
        input.click();
      }
    });

    zone.addEventListener('dragover', (event) => {
      event.preventDefault();
      if (!disabled && !this._dragging) {
        this._dragging = true;
        this.render();
      }
    });

    zone.addEventListener('dragleave', () => {
      if (this._dragging) {
        this._dragging = false;
        this.render();
      }
    });

    zone.addEventListener('drop', (event) => {
      event.preventDefault();
      this._dragging = false;
      if (!disabled) this._handleFiles(event.dataTransfer && event.dataTransfer.files);
      else this.render();
    });

    input.addEventListener('change', (event) => {
      this._handleFiles(event.target.files);
      event.target.value = '';
    });

    this.querySelectorAll('.file-remove').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        const index = Number(button.getAttribute('data-index'));
        const file = this._files[index];
        if (!file) return;
        this.dispatchEvent(new CustomEvent('remove', { detail: { file, index } }));
      });
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('file-dropzone')) {
  customElements.define('file-dropzone', FileDropzoneElement);
}
export default FileDropzoneElement;
