/**
 * SessionDeviceTable - Login sessions / devices list: header with helper
 * text and a "log out all" action, six-column sessions table (OS /
 * application / location / IP / last active / status) with Current and
 * Logged-out badges, pager and rows-per-page control
 * (Airwallex Login Sessions pattern).
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

const DEFAULT_SESSIONS = () => [
  { id: 's1', os: 'Mac OS X', application: 'Chrome 141', location: 'Singapore, Singapore', ip: '116.14.152.165', lastActive: '4 minutes ago', status: 'current' },
  { id: 's2', os: 'Mac OS X', application: 'Chrome 141', location: 'Singapore, Singapore', ip: '103.224.164.31', lastActive: '6 days ago', status: 'logged-out' },
  { id: 's3', os: 'Windows 11', application: 'Edge 140', location: 'Tokyo, Japan', ip: '203.0.113.42', lastActive: '2 days ago', status: 'active' },
  { id: 's4', os: 'iOS 18', application: 'Airwallex iOS', location: 'Singapore, Singapore', ip: '116.14.152.198', lastActive: '10 days ago', status: 'logged-out' },
];

const STATUS_STYLES = {
  current: { label: 'Current', cls: 'bg-violet-100 text-violet-700 dark:bg-violet-950/70 dark:text-violet-300' },
  active: { label: 'Active', cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' },
  'logged-out': { label: 'Logged out', cls: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400' },
};

const OS_ICONS = [['mac', '🖥'], ['windows', '🪟'], ['linux', '🐧'], ['mobile', '📱']];
const iconFor = (os) => {
  const hit = OS_ICONS.find(([k]) => os.toLowerCase().includes(k));
  return hit ? hit[1] : '🖥';
};

class SessionDeviceTableElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'description', 'learn-more-label', 'logout-all-label', 'page-label', 'page', 'rows-per-page-label', 'rows-per-page', 'sessions'];
  }

  constructor() {
    super();
    this._bound = false;
    this._title = 'Login sessions';
    this._description = 'View your login sessions from the past 28 days. If you notice any suspicious logins, log out of those sessions and change your password immediately.';
    this._learnMoreLabel = 'Learn more';
    this._logoutAllLabel = 'Log out of all other sessions';
    this._pageLabel = 'Page';
    this._page = 1;
    this._rowsPerPageLabel = 'Rows per page:';
    this._rowsPerPage = 10;
    this._sessions = DEFAULT_SESSIONS();
  }

  connectedCallback() {
    const t = this.getAttribute('title');
    if (t) this._title = t;
    const d = this.getAttribute('description');
    if (d) this._description = d;
    const lm = this.getAttribute('learn-more-label');
    if (lm) this._learnMoreLabel = lm;
    const la = this.getAttribute('logout-all-label');
    if (la) this._logoutAllLabel = la;
    const pl = this.getAttribute('page-label');
    if (pl) this._pageLabel = pl;
    this._page = parseInt(this.getAttribute('page'), 10) || 1;
    const rl = this.getAttribute('rows-per-page-label');
    if (rl) this._rowsPerPageLabel = rl;
    this._rowsPerPage = parseInt(this.getAttribute('rows-per-page'), 10) || 10;
    this._sessions = parseJsonAttr(this.getAttribute('sessions'), DEFAULT_SESSIONS());
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
    if (name === 'title') this._title = newValue || 'Login sessions';
    if (name === 'description') this._description = newValue || '';
    if (name === 'learn-more-label') this._learnMoreLabel = newValue || 'Learn more';
    if (name === 'logout-all-label') this._logoutAllLabel = newValue || 'Log out of all other sessions';
    if (name === 'page-label') this._pageLabel = newValue || 'Page';
    if (name === 'page') this._page = parseInt(newValue, 10) || 1;
    if (name === 'rows-per-page-label') this._rowsPerPageLabel = newValue || 'Rows per page:';
    if (name === 'rows-per-page') this._rowsPerPage = parseInt(newValue, 10) || 10;
    if (name === 'sessions') this._sessions = parseJsonAttr(newValue, DEFAULT_SESSIONS());
    this._render();
  }

  get sessions() { return this._sessions; }
  set sessions(value) { this._sessions = Array.isArray(value) ? value : []; this._render(); }

  _onClick(event) {
    if (event.target.closest('[data-session-logout-all]')) {
      this.dispatchEvent(new CustomEvent('logout-all', { bubbles: true }));
      return;
    }
    const row = event.target.closest('[data-session-row]');
    if (row) {
      const session = this._sessions.find((s) => s.id === row.getAttribute('data-session-row'));
      if (session) this.dispatchEvent(new CustomEvent('session-click', { detail: { session }, bubbles: true }));
    }
  }

  _onChange(event) {
    const select = event.target.closest('[data-session-rows-select]');
    if (select) {
      this._rowsPerPage = parseInt(select.value, 10) || 10;
      this.dispatchEvent(new CustomEvent('rows-per-page-change', { detail: { rowsPerPage: this._rowsPerPage }, bubbles: true }));
    }
  }

  _render() {
    const rowsHtml = this._sessions
      .map((s) => {
        const style = STATUS_STYLES[s.status] ?? STATUS_STYLES['logged-out'];
        return `<tr data-session-row="${escapeAttribute(s.id)}" tabindex="0" class="cursor-pointer border-b border-zinc-50 transition-colors last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/60">
          <td data-session-row-os="${escapeAttribute(s.os)}" class="whitespace-nowrap px-5 py-3 font-medium text-zinc-800 dark:text-zinc-100"><span class="mr-1.5 inline-flex" aria-hidden="true">${iconFor(s.os)}</span>${escapeAttribute(s.os)}</td>
          <td data-session-row-app="${escapeAttribute(s.application)}" class="px-2 py-3 text-zinc-600 dark:text-zinc-300">${escapeAttribute(s.application)}</td>
          <td data-session-row-location="${escapeAttribute(s.location)}" class="px-2 py-3 text-zinc-600 dark:text-zinc-300">${escapeAttribute(s.location)}</td>
          <td data-session-row-ip="${escapeAttribute(s.ip)}" class="px-2 py-3 font-mono text-zinc-500 dark:text-zinc-400">${escapeAttribute(s.ip)}</td>
          <td data-session-row-active="${escapeAttribute(s.lastActive)}" class="whitespace-nowrap px-2 py-3 text-zinc-500 dark:text-zinc-400">${escapeAttribute(s.lastActive)}</td>
          <td data-session-row-status="${escapeAttribute(s.status)}" class="px-5 py-3"><span class="inline-block rounded px-2 py-0.5 text-[11px] font-semibold ${style.cls}">${style.label}</span></td>
        </tr>`;
      })
      .join('');

    const rowsOptions = [10, 25, 50]
      .map((n) => `<option value="${n}" ${n === this._rowsPerPage ? 'selected' : ''}>${n}</option>`)
      .join('');

    this.innerHTML = `
      <div data-session-table class="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div data-session-header class="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <div class="max-w-2xl">
            <p data-session-title class="text-base font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(this._title)}</p>
            <p data-session-description class="mt-1 text-sm leading-5 text-zinc-500 dark:text-zinc-400">${escapeAttribute(this._description)} <a data-session-learn-more href="#" class="font-medium text-violet-600 hover:underline dark:text-violet-400">${escapeAttribute(this._learnMoreLabel)}</a></p>
          </div>
          <button data-session-logout-all type="button" class="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-violet-600 transition-colors hover:bg-violet-50 dark:border-zinc-700 dark:text-violet-400 dark:hover:bg-violet-950/40">${escapeAttribute(this._logoutAllLabel)}</button>
        </div>
        <table data-session-table-body class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-zinc-100 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <th class="px-5 py-2.5 font-semibold">Operating system</th>
              <th class="px-2 py-2.5 font-semibold">Application</th>
              <th class="px-2 py-2.5 font-semibold">Location</th>
              <th class="px-2 py-2.5 font-semibold">IP address</th>
              <th class="px-2 py-2.5 font-semibold">Last active</th>
              <th class="px-5 py-2.5 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <div data-session-footer class="flex items-center justify-between border-t border-zinc-100 px-5 py-3 dark:border-zinc-800">
          <div data-session-pager class="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
            <button type="button" data-session-pager-prev aria-label="Previous page" class="rounded-md border border-zinc-200 px-2 py-1 text-zinc-400 transition-colors hover:text-zinc-600 dark:border-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300">‹</button>
            <span data-session-page="${this._page}">${escapeAttribute(this._pageLabel)} ${this._page}</span>
            <button type="button" data-session-pager-next aria-label="Next page" class="rounded-md border border-zinc-200 px-2 py-1 text-zinc-400 transition-colors hover:text-zinc-600 dark:border-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300">›</button>
          </div>
          <label data-session-rows-per-page class="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            ${escapeAttribute(this._rowsPerPageLabel)}
            <select data-session-rows-select class="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700 outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">${rowsOptions}</select>
          </label>
        </div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('session-device-table')) {
  customElements.define('session-device-table', SessionDeviceTableElement);
}

export default SessionDeviceTableElement;
