/**
 * ImageGenMetaBar - fal generation result footer bar: model badge pill
 * overlaying the image bottom-left plus a mono metadata row with the job id,
 * wall-clock duration and per-image cost.
 */
const escapeAttribute = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

class ImageGenMetaBarElement extends HTMLElement {
  static get observedAttributes() {
    return ['model', 'job-id', 'duration', 'cost'];
  }

  constructor() {
    super();
    this._bound = false;
  }

  connectedCallback() {
    if (this._bound === false && this.innerHTML === '') {
      this._bound = true;
    }
    this._render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (this._bound === false && this.innerHTML === '') return;
    this._render();
  }

  get model() {
    return this.getAttribute('model') ?? 'openai/gpt-image-2';
  }
  set model(value) {
    this.setAttribute('model', value);
  }

  get jobId() {
    return this.getAttribute('job-id') ?? '# 019f1ba4';
  }
  set jobId(value) {
    this.setAttribute('job-id', value);
  }

  get duration() {
    return this.getAttribute('duration') ?? '169.0s';
  }
  set duration(value) {
    this.setAttribute('duration', value);
  }

  get cost() {
    return this.getAttribute('cost') ?? '$ 0.211';
  }
  set cost(value) {
    this.setAttribute('cost', value);
  }

  _render() {
    this.innerHTML = `
      <div data-image-gen-meta class="relative w-full border-t border-zinc-200 bg-white px-2.5 py-1.5 dark:border-zinc-800 dark:bg-zinc-900">
        <span data-image-gen-model class="absolute left-2 bottom-11 inline-flex items-center rounded bg-zinc-900/70 px-1.5 py-0.5 text-[10px] font-medium text-zinc-100 backdrop-blur dark:bg-zinc-950/70">${escapeAttribute(this.model)}</span>
        <div class="flex items-center gap-2 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
          <span data-image-gen-job>${escapeAttribute(this.jobId)}</span>
          <span data-image-gen-clock aria-hidden="true" class="text-zinc-300 dark:text-zinc-600">◷</span>
          <span data-image-gen-duration>${escapeAttribute(this.duration)}</span>
          <span class="ml-auto"></span>
          <span data-image-gen-cost class="font-medium text-zinc-600 dark:text-zinc-300">${escapeAttribute(this.cost)}</span>
        </div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('image-gen-meta-bar')) {
  customElements.define('image-gen-meta-bar', ImageGenMetaBarElement);
}

export default ImageGenMetaBarElement;
