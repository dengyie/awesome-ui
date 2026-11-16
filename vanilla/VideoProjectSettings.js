/**
 * VideoProjectSettings - Video project settings side panel: Chapters side
 * panel with bookmark icon and empty state + "Add a chapter" action, main
 * form with Title input, Description textarea, Thumbnail selector and a
 * storage usage badge
 * (Vimeo video project settings pattern).
 */
const escapeAttribute = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const parseJsonAttr = (raw, fallback) => {
  if (typeof raw !== 'string' || raw.trim() === '') return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

class VideoProjectSettingsElement extends HTMLElement {
  static get observedAttributes() {
    return ['panel-title', 'panel-empty-text', 'chapters', 'add-chapter-label', 'title-label', 'title-value', 'description-label', 'description-value', 'thumbnail-label', 'thumbnails', 'selected-thumbnail-id', 'storage-used', 'storage-total'];
  }

  constructor() {
    super();
    this._bound = false;
    this._selectedId = 't1';
  }

  connectedCallback() {
    this._selectedId = this.getAttribute('selected-thumbnail-id') || 't1';
    if (this._bound === false && this.innerHTML === '') {
      this._bound = true;
    }
    this._render();
    this.addEventListener('click', this._onClick);
    this.addEventListener('input', this._onInput);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onClick);
    this.removeEventListener('input', this._onInput);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (this._bound === false && this.innerHTML === '') return;
    if (name === 'selected-thumbnail-id') this._selectedId = newValue || 't1';
    this._render();
  }

  _onClick(event) {
    if (event.target.closest('[data-video-add-chapter]')) {
      this.dispatchEvent(new CustomEvent('add-chapter', { bubbles: true }));
      return;
    }
    const thumb = event.target.closest('[data-video-thumbnail]');
    if (thumb) {
      const id = thumb.getAttribute('data-video-thumbnail');
      this._selectedId = id;
      this._render();
      const found = this._thumbnails().find((t) => t.id === id);
      if (found) this.dispatchEvent(new CustomEvent('thumbnail-select', { detail: { thumbnail: found }, bubbles: true }));
    }
  }

  _onInput(event) {
    const title = event.target.closest('[data-video-title-input]');
    if (title) {
      this.dispatchEvent(new CustomEvent('title-change', { detail: { value: title.value }, bubbles: true }));
      return;
    }
    const description = event.target.closest('[data-video-description-input]');
    if (description) {
      this.dispatchEvent(new CustomEvent('description-change', { detail: { value: description.value }, bubbles: true }));
    }
  }

  _chapters() {
    return parseJsonAttr(this.getAttribute('chapters'), []);
  }

  _thumbnails() {
    return parseJsonAttr(this.getAttribute('thumbnails'), [
      { id: 't1', gradient: 'bg-gradient-to-br from-violet-400 via-fuchsia-400 to-rose-400 dark:from-violet-700 dark:via-fuchsia-700 dark:to-rose-700' },
      { id: 't2', gradient: 'bg-gradient-to-br from-sky-400 via-cyan-400 to-emerald-400 dark:from-sky-700 dark:via-cyan-700 dark:to-emerald-700' },
    ]);
  }

  _render() {
    const panelTitle = this.getAttribute('panel-title') || 'Chapters';
    const panelEmptyText = this.getAttribute('panel-empty-text') || 'Add chapters so your viewers can find specific parts of your video';
    const addChapterLabel = this.getAttribute('add-chapter-label') || 'Add a chapter';
    const titleLabel = this.getAttribute('title-label') || 'Title';
    const titleValue = this.getAttribute('title-value') || 'Video project';
    const descriptionLabel = this.getAttribute('description-label') || 'Description';
    const descriptionValue = this.getAttribute('description-value') || '';
    const thumbnailLabel = this.getAttribute('thumbnail-label') || 'Thumbnail';
    const storageUsed = this.getAttribute('storage-used') || '31MB';
    const storageTotal = this.getAttribute('storage-total') || '7TB';
    const chapters = this._chapters();
    const thumbnails = this._thumbnails();

    const chaptersHtml = chapters.length === 0
      ? `<p data-video-chapters-empty class="text-xs leading-5 text-zinc-500 dark:text-zinc-400">${escapeAttribute(panelEmptyText)}</p>`
      : `<ul data-video-chapter-list class="space-y-2">${chapters
          .map((chapter) => `<li data-video-chapter="${escapeAttribute(chapter.id)}" class="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs shadow-sm dark:bg-zinc-900">
              <span class="font-medium text-zinc-800 dark:text-zinc-100">${escapeAttribute(chapter.label)}</span>
              <span class="font-mono text-zinc-400 dark:text-zinc-500">${escapeAttribute(chapter.timestamp)}</span>
            </li>`)
          .join('')}</ul>`;

    const thumbsHtml = thumbnails
      .map((thumb) => {
        const selected = thumb.id === this._selectedId;
        const ringCls = selected ? 'ring-2 ring-zinc-900 ring-offset-2 dark:ring-white dark:ring-offset-zinc-900' : 'opacity-80 hover:opacity-100';
        const gradient = thumb.gradient || 'bg-zinc-300 dark:bg-zinc-700';
        return `<button data-video-thumbnail="${escapeAttribute(thumb.id)}" type="button" aria-label="Thumbnail ${escapeAttribute(thumb.id)}" class="h-16 w-24 overflow-hidden rounded-lg transition-all ${gradient} ${ringCls}"></button>`;
      })
      .join('');

    this.innerHTML = `
      <div data-video-settings class="flex w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <aside data-video-chapters class="flex w-64 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/60">
          <div class="flex items-center justify-between px-4 py-3">
            <div class="flex items-center gap-2">
              <button data-video-back type="button" aria-label="Back" class="text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-200">←</button>
              <span class="text-sm font-bold text-zinc-900 dark:text-zinc-50">${escapeAttribute(panelTitle)}</span>
            </div>
            <button data-video-close type="button" aria-label="Close panel" class="text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-200">✕</button>
          </div>
          <div class="mx-4 flex items-center justify-center rounded-lg bg-zinc-200/70 py-3 text-lg dark:bg-zinc-800/70" aria-hidden="true">🔖</div>
          <div data-video-chapters-body class="flex-1 px-4 py-3">${chaptersHtml}</div>
          <button data-video-add-chapter type="button" class="mx-4 mb-4 rounded-lg border border-dashed border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-600 dark:text-zinc-300 dark:hover:border-zinc-400 dark:hover:text-zinc-100">＋ ${escapeAttribute(addChapterLabel)}</button>
        </aside>
        <div data-video-form class="flex-1 space-y-5 p-6">
          <div data-video-field-title>
            <label data-video-title-label for="video-title-input" class="mb-1.5 block text-xs font-semibold text-zinc-500 dark:text-zinc-400">${escapeAttribute(titleLabel)}</label>
            <input id="video-title-input" data-video-title-input type="text" value="${escapeAttribute(titleValue)}" class="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-50">
          </div>
          <div data-video-field-description>
            <label data-video-description-label for="video-description-input" class="mb-1.5 block text-xs font-semibold text-zinc-500 dark:text-zinc-400">${escapeAttribute(descriptionLabel)}</label>
            <textarea id="video-description-input" data-video-description-input rows="3" class="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-50">${escapeAttribute(descriptionValue)}</textarea>
          </div>
          <div data-video-field-thumbnail>
            <span data-video-thumbnail-label class="mb-1.5 block text-xs font-semibold text-zinc-500 dark:text-zinc-400">${escapeAttribute(thumbnailLabel)}</span>
            <div data-video-thumbnails class="flex items-center gap-3">
              <button data-video-thumbnail-add type="button" aria-label="Upload thumbnail" class="flex h-16 w-24 items-center justify-center rounded-lg border border-dashed border-zinc-300 text-lg text-zinc-400 transition-colors hover:border-zinc-400 hover:text-zinc-600 dark:border-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300">＋</button>
              ${thumbsHtml}
            </div>
          </div>
          <div data-video-storage class="flex items-center">
            <span data-video-storage-badge class="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">💾 ${escapeAttribute(storageUsed)} / ${escapeAttribute(storageTotal)}</span>
          </div>
        </div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('video-project-settings')) {
  customElements.define('video-project-settings', VideoProjectSettingsElement);
}

export default VideoProjectSettingsElement;
