/**
 * ServiceStatusList - Vanilla Web Component
 * Usage: <service-status-list duration-label="Worked for 37s"></service-status-list>
 * Attributes: duration-label, services (JSON attribute), checks (JSON attribute)
 * Properties: services (Array<{name, command, status: running|stopped|failed|starting, url?}>), checks (Array<{label, passed, detail?}>)
 * Events: service-click (detail {service})
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const SERVICE_STATUS = {
  running: {
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="h-3.5 w-3.5 text-emerald-500"><path d="m5 12 4 4L19 6" /></svg>',
    text: 'Running on',
    tone: 'text-emerald-600 dark:text-emerald-400',
  },
  starting: {
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3.5 w-3.5 animate-spin text-sky-500"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>',
    text: 'Starting…',
    tone: 'text-sky-600 dark:text-sky-400',
  },
  stopped: {
    icon: '<span class="block h-2 w-2 rounded-full bg-zinc-400"></span>',
    text: 'Stopped',
    tone: 'text-zinc-500',
  },
  failed: {
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="h-3.5 w-3.5 text-rose-500"><path d="M18 6 6 18M6 6l12 12" /></svg>',
    text: 'Failed',
    tone: 'text-rose-600 dark:text-rose-400',
  },
};

export class ServiceStatusListElement extends HTMLElement {
  static get observedAttributes() {
    return ['duration-label'];
  }

  constructor() {
    super();
    this._services = [];
    this._checks = [];
    this._bound = false;
  }

  get services() {
    return this._services;
  }

  set services(list) {
    this._services = Array.isArray(list) ? list : [];
    this.render();
  }

  get checks() {
    return this._checks;
  }

  set checks(list) {
    this._checks = Array.isArray(list) ? list : [];
    this.render();
  }

  connectedCallback() {
    if (!this._services.length) {
      const raw = this.getAttribute('services');
      if (raw) {
        try { this._services = JSON.parse(raw); } catch { this._services = []; }
      }
    }
    if (!this._checks.length) {
      const raw = this.getAttribute('checks');
      if (raw) {
        try { this._checks = JSON.parse(raw); } catch { this._checks = []; }
      }
    }
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const row = event.target.closest('[data-service-row]');
        if (row) {
          const service = this._services.find((item) => item.name === row.getAttribute('data-service-row'));
          if (service) this.dispatchEvent(new CustomEvent('service-click', { detail: { service } }));
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
    const durationLabel = this.getAttribute('duration-label') || '';
    const services = Array.isArray(this._services) ? this._services : [];
    const checks = Array.isArray(this._checks) ? this._checks : [];

    this.innerHTML = `<div data-service-status class="w-full rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p class="text-sm font-bold text-zinc-900 dark:text-zinc-50">Services</p>
      <ul class="mt-2 space-y-1.5">
        ${services
          .map((service) => {
            const tone = SERVICE_STATUS[service.status] || SERVICE_STATUS.stopped;
            return `<li data-service-row="${escapeAttribute(service.name)}" data-service-status="${escapeAttribute(service.status)}">
              <button type="button" class="flex w-full items-center gap-2 rounded-md px-1 py-1 text-left transition-colors hover:bg-zinc-50 focus-visible:outline-none dark:hover:bg-zinc-800/60">
                <span class="w-28 shrink-0 truncate text-xs font-medium text-zinc-800 dark:text-zinc-100">${escapeAttribute(service.name)}</span>
                <code class="shrink-0 rounded border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">${escapeAttribute(service.command)}</code>
                <span class="flex min-w-0 flex-1 items-center justify-end gap-1.5">
                  ${tone.icon}
                  <span class="truncate text-[11px] font-medium ${tone.tone}">${tone.text}</span>
                  ${service.url ? `<span class="shrink-0 rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-white dark:bg-zinc-100 dark:text-zinc-900">${escapeAttribute(service.url)}</span>` : ''}
                </span>
              </button>
            </li>`;
          })
          .join('')}
      </ul>
      ${
        checks.length
          ? `<div class="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
              <ul class="space-y-1">
                ${checks
                  .map(
                    (check) => `<li data-check-row class="flex items-start gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-300">
                      ${
                        check.passed
                          ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="mt-0.5 h-3 w-3 shrink-0 text-emerald-500"><path d="m5 12 4 4L19 6" /></svg>'
                          : '<span class="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>'
                      }
                      <span class="min-w-0 flex-1">
                        <code class="rounded bg-zinc-100 px-1 font-mono text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">${escapeAttribute(check.label)}</code>
                        ${check.detail ? `<span class="text-zinc-500 dark:text-zinc-400">${escapeAttribute(check.detail)}</span>` : ''}
                      </span>
                    </li>`,
                  )
                  .join('')}
              </ul>
            </div>`
          : ''
      }
      ${durationLabel ? `<p class="mt-3 text-[11px] text-zinc-500 dark:text-zinc-400">${escapeAttribute(durationLabel)}</p>` : ''}
    </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('service-status-list')) {
  customElements.define('service-status-list', ServiceStatusListElement);
}
export default ServiceStatusListElement;
