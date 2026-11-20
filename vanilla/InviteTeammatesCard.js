import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class InviteTeammatesCardElement extends HTMLElement {
  static get observedAttributes() {
    return ['pending', 'roles', 'title', 'description', 'email-placeholder', 'send-label', 'skip-label', 'default-role'];
  }

  connectedCallback() {
    this._draft = '';
    this._error = '';
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  get pending() {
    if (this._pending) return this._pending;
    try {
      return JSON.parse(this.getAttribute('pending') || '[]');
    } catch {
      return [];
    }
  }

  set pending(value) {
    this._pending = Array.isArray(value) ? value : [];
    this.render();
  }

  get roles() {
    if (this._roles) return this._roles;
    try {
      return JSON.parse(this.getAttribute('roles') || '["Admin","Editor","Viewer"]');
    } catch {
      return ['Admin', 'Editor', 'Viewer'];
    }
  }

  set roles(value) {
    this._roles = Array.isArray(value) ? value : [];
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
    const pending = this.pending;
    const roles = this.roles;
    const title = this.getAttribute('title') || 'Invite your teammates';
    const description = this.getAttribute('description') || 'Collaboration is better together. Add teammates by email to get started.';
    const emailPlaceholder = this.getAttribute('email-placeholder') || 'teammate@company.com';
    const sendLabel = this.getAttribute('send-label') || 'Send invites';
    const skipLabel = this.getAttribute('skip-label') || 'Skip for now';
    const draft = this._draft || '';
    const error = this._error || '';
    if (!this._selectedRole) this._selectedRole = this.getAttribute('default-role') || roles[0] || 'Viewer';
    const selectedRole = this._selectedRole;

    this._applyHostClass('block');

    const rows = pending
      .map(
        (invitee) => `
        <li data-invite-teammates-row="${escapeAttribute(invitee.email)}"
          class="flex items-center gap-2 rounded-md border border-zinc-100 bg-zinc-50 px-2.5 py-1.5 dark:border-zinc-800 dark:bg-zinc-800/60">
          ${uiIcon('mail', { size: 13, className: 'shrink-0 text-zinc-400 dark:text-zinc-500' })}
          <span class="min-w-0 flex-1 truncate text-xs text-zinc-700 dark:text-zinc-200">${escapeAttribute(invitee.email)}</span>
          <span class="shrink-0 rounded-full bg-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">${escapeAttribute(invitee.role)}</span>
          <button type="button" data-invite-teammates-remove data-email="${escapeAttribute(invitee.email)}"
            aria-label="Remove ${escapeAttribute(invitee.email)}"
            class="shrink-0 rounded p-0.5 text-zinc-400 transition-colors hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">${uiIcon('x', { size: 11 })}</button>
        </li>`
      )
      .join('');

    this.innerHTML = `
      <div data-invite-teammates class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div class="border-b border-zinc-100 dark:border-zinc-800 px-5 py-4">
          <h4 data-invite-teammates-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(title)}</h4>
          <p data-invite-teammates-description class="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">${escapeAttribute(description)}</p>
        </div>
        <div class="px-5 py-4">
          <div data-invite-teammates-composer
            class="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-2 py-1.5 focus-within:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-900">
            <input type="email" data-invite-teammates-input value="${escapeAttribute(draft)}" placeholder="${escapeAttribute(emailPlaceholder)}"
              class="min-w-0 flex-1 bg-transparent text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none dark:text-zinc-50 dark:placeholder-zinc-500" />
            <select data-invite-teammates-role aria-label="Invite role"
              class="shrink-0 rounded border border-zinc-200 bg-white px-1.5 py-1 text-[11px] text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 focus:outline-none">
              ${roles.map((role) => `<option value="${escapeAttribute(role)}" ${role === selectedRole ? 'selected' : ''}>${escapeAttribute(role)}</option>`).join('')}
            </select>
            <button type="button" data-invite-teammates-add aria-label="Add teammate"
              class="shrink-0 rounded bg-zinc-900 p-1 text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">${uiIcon('plus', { size: 12 })}</button>
          </div>
          ${error ? `<p data-invite-teammates-error role="alert" class="mt-1.5 text-[11px] text-red-500">${escapeAttribute(error)}</p>` : ''}
          ${pending.length > 0 ? `<ul data-invite-teammates-list class="mt-3 space-y-1.5">${rows}</ul>` : ''}
        </div>
        <div class="flex items-center gap-2 border-t border-zinc-100 dark:border-zinc-800 px-5 py-3">
          <button type="button" data-invite-teammates-send ${pending.length === 0 ? 'disabled' : ''}
            class="rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              pending.length > 0
                ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                : 'cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'
            }">${escapeAttribute(sendLabel)}</button>
          <button type="button" data-invite-teammates-skip
            class="rounded-md px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">${escapeAttribute(skipLabel)}</button>
          <span class="ml-auto text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">${pending.length} pending</span>
        </div>
      </div>`;

    const input = this.querySelector('[data-invite-teammates-input]');
    if (input) {
      input.addEventListener('input', () => {
        this._draft = input.value;
        if (this._error) {
          this._error = '';
          this.render();
        }
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this._submit();
        }
      });
    }

    const roleSelect = this.querySelector('[data-invite-teammates-role]');
    if (roleSelect) {
      roleSelect.addEventListener('change', () => {
        this._selectedRole = roleSelect.value;
      });
    }

    this.querySelector('[data-invite-teammates-add]').addEventListener('click', () => this._submit());

    this.querySelectorAll('[data-invite-teammates-remove]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const invitee = pending.find((p) => p.email === btn.getAttribute('data-email'));
        if (invitee) this.dispatchEvent(new CustomEvent('remove', { detail: invitee }));
      });
    });

    const sendBtn = this.querySelector('[data-invite-teammates-send]');
    if (sendBtn && pending.length > 0) {
      sendBtn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('send', { detail: pending }));
      });
    }

    this.querySelector('[data-invite-teammates-skip]').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('skip'));
    });
  }

  _submit() {
    const email = (this._draft || '').trim();
    if (!email) return;
    if (!EMAIL_RE.test(email)) {
      this._error = 'Enter a valid email address.';
      this.render();
      return;
    }
    if (this.pending.some((p) => p.email.toLowerCase() === email.toLowerCase())) {
      this._error = 'That teammate is already on the list.';
      this.render();
      return;
    }
    this._error = '';
    this._draft = '';
    this.dispatchEvent(new CustomEvent('invite', { detail: { email, role: this._selectedRole } }));
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('invite-teammates-card')) {
  customElements.define('invite-teammates-card', InviteTeammatesCardElement);
}
export default InviteTeammatesCardElement;
