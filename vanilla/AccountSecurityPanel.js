/**
 * AccountSecurityPanel - Account settings security tab: settings tabs,
 * Password row with edit CTA and a "Manage verified sessions" card with
 * per-device rows and remove buttons (Podia account security pattern).
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

const DEFAULT_TABS = () => ['Personal', 'Notifications', 'Security', 'Billing'];

const DEFAULT_SESSIONS = () => [
  { id: 's1', device: 'Chrome on Mac 10.15.7', detail: 'Nov 12 at 4:52 AM EST' },
  { id: 's2', device: 'Firefox on Windows 11', detail: 'Nov 8 at 9:18 AM EST' },
];

class AccountSecurityPanelElement extends HTMLElement {
  static get observedAttributes() {
    return ['tabs', 'password-value', 'sessions-title', 'sessions-description', 'sessions'];
  }

  constructor() {
    super();
    this._bound = false;
    this._tab = 'Security';
  }

  connectedCallback() {
    if (this._bound === false && this.innerHTML === '') {
      this._bound = true;
    }
    this._render();
    this.addEventListener('click', this._onClick);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onClick);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (this._bound === false && this.innerHTML === '') return;
    this._render();
  }

  _onClick(event) {
    const tabBtn = event.target.closest('[data-acctsec-tab]');
    if (tabBtn) {
      this._tab = tabBtn.getAttribute('data-acctsec-tab');
      this.dispatchEvent(new CustomEvent('tab-click', { detail: { tab: this._tab }, bubbles: true }));
      this._render();
      return;
    }
    if (event.target.closest('[data-acctsec-edit-password]')) {
      this.dispatchEvent(new CustomEvent('edit-password', { bubbles: true }));
      return;
    }
    const removeBtn = event.target.closest('[data-acctsec-remove]');
    if (removeBtn) {
      const id = removeBtn.getAttribute('data-acctsec-remove');
      const sessions = parseJsonAttr(this.getAttribute('sessions'), DEFAULT_SESSIONS());
      const session = sessions.find((s) => s.id === id);
      if (session) {
        this.dispatchEvent(new CustomEvent('remove-session', { detail: session, bubbles: true }));
      }
    }
  }

  _render() {
    const tabs = parseJsonAttr(this.getAttribute('tabs'), DEFAULT_TABS());
    const passwordValue = this.getAttribute('password-value') || '••••••••';
    const sessionsTitle = this.getAttribute('sessions-title') || 'Manage verified sessions';
    const sessionsDescription =
      this.getAttribute('sessions-description') ||
      'Each time you login to your account, a verification code is emailed to you to proceed. You may have up to 5 login sessions verified at any given time, each of which expire after 30 days.';
    const sessions = parseJsonAttr(this.getAttribute('sessions'), DEFAULT_SESSIONS());

    const tabBtns = tabs
      .map(
        (t) => `<button type="button" data-acctsec-tab="${escapeAttribute(t)}" class="-mb-px border-b-2 pb-2.5 text-sm font-medium transition-colors ${
          this._tab === t ? 'border-zinc-800 text-zinc-900 dark:border-zinc-100 dark:text-zinc-50' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
        }">${escapeAttribute(t)}</button>`
      )
      .join('');

    const sessionRows = sessions
      .map(
        (s) => `<div data-acctsec-session="${escapeAttribute(s.id)}" class="flex items-center justify-between gap-3 rounded-lg bg-zinc-50 px-4 py-3 dark:bg-zinc-800/60">
            <p class="text-sm text-zinc-700 dark:text-zinc-200">
              <span data-acctsec-session-device class="font-semibold">${escapeAttribute(s.device)}</span>
              <span class="text-zinc-400 dark:text-zinc-500"> • ${escapeAttribute(s.detail)}</span>
            </p>
            <button type="button" data-acctsec-remove="${escapeAttribute(s.id)}" aria-label="Remove ${escapeAttribute(s.device)}" class="text-zinc-400 transition-colors hover:text-rose-500 dark:hover:text-rose-400">✕</button>
          </div>`
      )
      .join('');

    const body =
      this._tab === 'Security'
        ? `<div data-acctsec-panel class="mt-5 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
            <p data-acctsec-panel-title class="text-lg font-bold text-zinc-900 dark:text-zinc-50">Security</p>
            <div data-acctsec-password class="mt-5 flex items-center justify-between gap-4">
              <span class="text-sm font-medium text-zinc-700 dark:text-zinc-200">Password</span>
              <span data-acctsec-password-value class="font-mono text-sm tracking-widest text-zinc-700 dark:text-zinc-200">${escapeAttribute(passwordValue)}</span>
              <button type="button" data-acctsec-edit-password class="rounded-lg border border-zinc-200 px-4 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">Edit</button>
            </div>
            <div data-acctsec-sessions class="mt-6 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
              <p data-acctsec-sessions-title class="font-bold text-zinc-900 dark:text-zinc-50">${escapeAttribute(sessionsTitle)}</p>
              <p data-acctsec-sessions-desc class="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">${escapeAttribute(sessionsDescription)}</p>
              <div data-acctsec-session-list class="mt-4 space-y-2">${sessionRows}</div>
              <div class="mt-4 flex justify-end">
                <button type="button" data-acctsec-done class="rounded-lg border border-zinc-200 px-4 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">Done</button>
              </div>
            </div>
          </div>`
        : `<p data-acctsec-placeholder class="mt-5 rounded-xl border border-dashed border-zinc-200 p-6 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">${escapeAttribute(this._tab)} settings are not part of this demo.</p>`;

    this.innerHTML = `
      <div data-acctsec class="w-full rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <h2 data-acctsec-heading class="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">Account</h2>
        <div data-acctsec-tabs class="mt-4 flex gap-6 border-b border-zinc-200 dark:border-zinc-800">${tabBtns}</div>
        ${body}
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('account-security-panel')) {
  customElements.define('account-security-panel', AccountSecurityPanelElement);
}

export default AccountSecurityPanelElement;
