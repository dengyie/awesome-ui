/**
 * ApiReferenceViewer - API reference section: method-badge endpoint header,
 * query parameter definitions with type/meta/description rows, collapsible
 * responses list, and a right code panel with language select, sample
 * request and highlighted JSON response
 * (GitBook API Reference pattern).
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

const DEFAULT_PARAMS = () => [
  { name: 'limit', type: 'integer', meta: 'max: 100', required: false, description: 'Max items to return (100 default)' },
  { name: 'status', type: 'string', meta: 'enum', required: false, description: 'Filter by pet status: available, pending, sold' },
];

const DEFAULT_RESPONSES = () => [
  {
    status: '200',
    tone: 'success',
    label: 'A paged array of pets',
    schema: 'Response object[]',
    body: '[\n  {\n    "id": 1,\n    "name": "Fluffy",\n    "tag": "dog",\n    "status": "available"\n  }\n]',
  },
  {
    status: '404',
    tone: 'error',
    label: 'Pets not found',
    schema: 'Error object',
    body: '{\n  "error": "not_found",\n  "message": "No pets matched the query."\n}',
  },
];

const DEFAULT_LANGUAGES = () => [
  { id: 'cli', label: 'CLI', sample: 'curl -L https://petstore.example.com/v1/pets' },
  { id: 'js', label: 'JS', sample: 'fetch("https://petstore.example.com/v1/pets")' },
];

const METHOD_STYLES = {
  GET: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300',
  POST: 'bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300',
  PUT: 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300',
  PATCH: 'bg-violet-100 text-violet-700 dark:bg-violet-950/70 dark:text-violet-300',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300',
};

const TONE_STYLES = {
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300',
  error: 'bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300',
};

const methodCls = (method) => METHOD_STYLES[String(method || 'GET').toUpperCase()] ?? METHOD_STYLES.GET;
const toneCls = (tone) => TONE_STYLES[tone ?? 'success'] ?? TONE_STYLES.success;

class ApiReferenceViewerElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'method', 'endpoint', 'params-title', 'params', 'responses-title', 'responses', 'languages', 'active-language-id', 'response-title'];
  }

  constructor() {
    super();
    this._bound = false;
    this._openStatuses = ['200'];
    this._activeLanguageId = 'cli';
  }

  connectedCallback() {
    this._openStatuses = parseJsonAttr(this.getAttribute('open-statuses'), ['200']);
    this._activeLanguageId = this.getAttribute('active-language-id') || 'cli';
    if (this._bound === false && this.innerHTML === '') {
      this._bound = true;
    }
    this._render();
    this.addEventListener('click', this._onClick);
    this.addEventListener('change', this._onChange);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onClick);
    this.removeEventListener('change', this._onChange);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (this._bound === false && this.innerHTML === '') return;
    if (name === 'open-statuses') this._openStatuses = parseJsonAttr(newValue, ['200']);
    if (name === 'active-language-id') this._activeLanguageId = newValue || 'cli';
    this._render();
  }

  _onClick(event) {
    const toggle = event.target.closest('[data-api-response-toggle]');
    if (toggle) {
      const holder = toggle.closest('[data-api-response]');
      const status = holder ? holder.getAttribute('data-api-response') : '';
      this._openStatuses = this._openStatuses.includes(status)
        ? this._openStatuses.filter((s) => s !== status)
        : [...this._openStatuses, status];
      this._render();
      return;
    }
    const param = event.target.closest('[data-api-param]');
    if (param) {
      const found = this._params().find((p) => p.name === param.getAttribute('data-api-param'));
      this.dispatchEvent(new CustomEvent('param-click', { detail: { param: found ?? { name: param.getAttribute('data-api-param') } }, bubbles: true }));
    }
  }

  _onChange(event) {
    const select = event.target.closest('[data-api-language-select]');
    if (select) {
      this._activeLanguageId = select.value;
      const lang = this._languages().find((l) => l.id === select.value);
      this._render();
      if (lang) this.dispatchEvent(new CustomEvent('language-change', { detail: { language: lang }, bubbles: true }));
    }
  }

  _params() {
    return parseJsonAttr(this.getAttribute('params'), DEFAULT_PARAMS());
  }

  _responses() {
    return parseJsonAttr(this.getAttribute('responses'), DEFAULT_RESPONSES());
  }

  _languages() {
    return parseJsonAttr(this.getAttribute('languages'), DEFAULT_LANGUAGES());
  }

  _render() {
    const title = this.getAttribute('title') || 'List all pets';
    const method = this.getAttribute('method') || 'GET';
    const endpoint = this.getAttribute('endpoint') || 'https://petstore.example.com/v1/pets';
    const paramsTitle = this.getAttribute('params-title') || 'Query parameters';
    const responsesTitle = this.getAttribute('responses-title') || 'Responses';
    const responseTitle = this.getAttribute('response-title') || 'A paged array of pets';
    const params = this._params();
    const responses = this._responses();
    const languages = this._languages();
    const mCls = methodCls(method);

    const paramsHtml = params
      .map((param) => `<button data-api-param="${escapeAttribute(param.name)}" type="button" class="block w-full text-left">
            <p class="font-mono text-sm text-zinc-800 dark:text-zinc-100">${escapeAttribute(param.name)} <span class="text-zinc-500 dark:text-zinc-400">${escapeAttribute(param.type)}${param.meta ? ' · ' + escapeAttribute(param.meta) : ''}</span>${param.required ? '' : ' <span class="text-red-500">optional</span>'}</p>
            <p class="mt-1 text-sm text-zinc-600 dark:text-zinc-300">${escapeAttribute(param.description)}</p>
          </button>`)
      .join('');

    const responsesHtml = responses
      .map((response) => {
        const open = this._openStatuses.includes(response.status);
        const tCls = toneCls(response.tone);
        return `<div data-api-response="${escapeAttribute(response.status)}" class="rounded-lg border border-zinc-200 dark:border-zinc-800">
            <button data-api-response-toggle type="button" class="flex w-full items-center gap-3 px-4 py-3 text-left">
              <span aria-hidden="true" class="text-xs text-zinc-400">${open ? '▾' : '▸'}</span>
              <span class="rounded px-2 py-0.5 font-mono text-xs font-bold ${tCls}">${escapeAttribute(response.status)}</span>
              <span class="text-sm text-zinc-700 dark:text-zinc-200">${escapeAttribute(response.label)}</span>
            </button>
            ${open ? `<div data-api-response-schema class="flex items-center justify-between border-t border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
              <code class="font-mono text-xs text-zinc-600 dark:text-zinc-300">${escapeAttribute(response.schema)}</code>
              <span class="text-xs font-medium text-zinc-500 dark:text-zinc-400">Show properties ＋</span>
            </div>` : ''}
          </div>`;
      })
      .join('');

    const lang = languages.find((l) => l.id === this._activeLanguageId) ?? languages[0] ?? { sample: '' };
    const activeResponse = responses.find((r) => r.status === (this._openStatuses[0] ?? '')) ?? responses[0] ?? { status: '200' };
    const langOptions = languages
      .map((l) => `<option value="${escapeAttribute(l.id)}"${l.id === this._activeLanguageId ? ' selected' : ''}>${escapeAttribute(l.label)}</option>`)
      .join('');

    this.innerHTML = `
      <div data-api-viewer class="grid w-full gap-4 lg:grid-cols-2">
        <div data-api-definition class="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 data-api-title class="text-lg font-bold text-zinc-900 dark:text-zinc-50">${escapeAttribute(title)}</h2>
          <div class="mt-3 flex items-center gap-3">
            <span data-api-method class="rounded px-2 py-1 font-mono text-xs font-bold ${mCls}">${escapeAttribute(method.toUpperCase())}</span>
            <code data-api-endpoint class="truncate font-mono text-sm text-zinc-700 dark:text-zinc-200">${escapeAttribute(endpoint)}</code>
          </div>
          <p data-api-params-title class="mt-6 border-b border-zinc-100 pb-2 text-sm font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">${escapeAttribute(paramsTitle)}</p>
          <div data-api-params class="mt-4 space-y-4">${paramsHtml}</div>
          <p data-api-responses-title class="mt-6 border-b border-zinc-100 pb-2 text-sm font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">${escapeAttribute(responsesTitle)}</p>
          <div data-api-responses class="mt-4 space-y-2">${responsesHtml}</div>
        </div>
        <div data-api-code-panel class="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div class="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
            <div class="flex items-center gap-2">
              <span class="rounded px-2 py-1 font-mono text-xs font-bold ${mCls}">${escapeAttribute(method.toUpperCase())}</span>
              <code data-api-code-path class="font-mono text-sm text-zinc-700 dark:text-zinc-200">/pets</code>
            </div>
            <select data-api-language-select class="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700 outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">${langOptions}</select>
          </div>
          <pre data-api-sample class="overflow-x-auto border-b border-zinc-100 bg-zinc-50 px-4 py-3 font-mono text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-200">${escapeAttribute(lang.sample ?? '')}</pre>
          <button data-api-test type="button" class="border-b border-zinc-100 px-4 py-2 text-right text-xs font-semibold text-zinc-400 transition-colors hover:text-zinc-600 dark:border-zinc-800 dark:hover:text-zinc-200">Test it ▸</button>
          <div class="flex items-center gap-3 px-4 py-2.5">
            <span class="rounded px-2 py-0.5 font-mono text-xs font-bold ${toneCls(activeResponse.tone)}">${escapeAttribute(activeResponse.status ?? '200')}</span>
            <span class="text-sm text-zinc-700 dark:text-zinc-200">${escapeAttribute(responseTitle)}</span>
          </div>
          <pre data-api-json class="flex-1 overflow-auto px-4 pb-4 font-mono text-xs leading-5 text-sky-700 dark:text-sky-300">${escapeAttribute(activeResponse.body ?? '')}</pre>
        </div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('api-reference-viewer')) {
  customElements.define('api-reference-viewer', ApiReferenceViewerElement);
}

export default ApiReferenceViewerElement;
