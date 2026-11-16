/**
 * PermissionMatrix - Roles × permissions matrix: heading with description,
 * Overview / Permission details tabs, grouped permission rows and per-role
 * cells with Edit / View only / No access / N/A states (Vanta pattern).
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

const DEFAULT_ROLES = () => ['Editor', 'Auditor', 'View only admin', 'Sales admin'];

const DEFAULT_GROUPS = () => [
  {
    id: 'employee',
    title: 'Employee Experience',
    rows: [
      { id: 'onboarding', label: 'Can complete new hire onboarding tasks', cells: ['edit', 'na', 'edit', 'edit'] },
      { id: 'personal', label: 'Can update personal settings', cells: ['edit', 'edit', 'edit', 'edit'] },
    ],
  },
  {
    id: 'apps',
    title: 'Connected apps',
    rows: [
      { id: 'integrations', label: 'Integrations', cells: ['edit', 'none', 'view', 'none'] },
      { id: 'tokens', label: 'API Tokens', cells: ['none', 'none', 'view', 'none'] },
    ],
  },
  {
    id: 'compliance',
    title: 'Compliance pages',
    rows: [
      { id: 'tests', label: 'Tests & Documents', cells: ['edit', 'view', 'view', 'none'] },
      { id: 'frameworks', label: 'Frameworks & Controls', cells: ['edit', 'view', 'view', 'none'] },
      { id: 'policies', label: 'Policies', cells: ['edit', 'view', 'view', 'none'] },
    ],
  },
];

const STATE_META = {
  edit: { label: 'Edit', icon: '✔', cls: 'text-emerald-600 dark:text-emerald-400' },
  view: { label: 'View only', icon: '👁', cls: 'text-zinc-600 dark:text-zinc-300' },
  none: { label: 'No access', icon: '✖', cls: 'text-rose-600 dark:text-rose-400' },
  na: { label: 'N / A', icon: '', cls: 'text-zinc-400 dark:text-zinc-500' },
};

class PermissionMatrixElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'description', 'roles', 'groups'];
  }

  constructor() {
    super();
    this._bound = false;
    this._tab = 'details';
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
    const tabBtn = event.target.closest('[data-permmtx-tab]');
    if (tabBtn) {
      this._tab = tabBtn.getAttribute('data-permmtx-tab');
      this._render();
      return;
    }
    const cell = event.target.closest('[data-permmtx-cell]');
    if (cell) {
      const roles = parseJsonAttr(this.getAttribute('roles'), DEFAULT_ROLES());
      const groups = parseJsonAttr(this.getAttribute('groups'), DEFAULT_GROUPS());
      const cellKey = cell.getAttribute('data-permmtx-cell') || '';
      const [rowId, role] = cellKey.split(':');
      const state = cell.getAttribute('data-permmtx-state') || 'na';
      let foundRow = null;
      for (const g of groups) {
        const r = g.rows.find((row) => row.id === rowId);
        if (r) {
          foundRow = r;
          break;
        }
      }
      if (foundRow) {
        this.dispatchEvent(
          new CustomEvent('cell-click', { detail: { row: foundRow, role, state, roleIndex: roles.indexOf(role) }, bubbles: true })
        );
      }
    }
  }

  _render() {
    const title = this.getAttribute('title') || 'Roles';
    const description =
      this.getAttribute('description') ||
      'Roles are bundles of permissions related to managing your security and compliance program. They ensure that team members have access to only what they need to complete their work.';
    const roles = parseJsonAttr(this.getAttribute('roles'), DEFAULT_ROLES());
    const groups = parseJsonAttr(this.getAttribute('groups'), DEFAULT_GROUPS());

    const roleHeads = roles
      .map((r) => `<th data-permmtx-role="${escapeAttribute(r)}" class="whitespace-nowrap px-4 py-3 text-center font-semibold">${escapeAttribute(r)}</th>`)
      .join('');

    const bodyRows = groups
      .map((g) => {
        const groupRow = `<tr data-permmtx-group="${escapeAttribute(g.id)}" class="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
            <td colspan="${roles.length + 1}" class="px-4 py-2.5 text-sm font-bold text-zinc-800 dark:text-zinc-100">${escapeAttribute(g.title)}</td>
          </tr>`;
        const rows = g.rows
          .map((row) => {
            const cells = row.cells
              .map((state, i) => {
                const meta = STATE_META[state] ?? STATE_META.na;
                return `<td class="px-4 py-3 text-center">
                    <button type="button" data-permmtx-cell="${escapeAttribute(row.id)}:${escapeAttribute(roles[i] ?? '')}" data-permmtx-state="${escapeAttribute(state)}"
                      class="inline-flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70 ${meta.cls}">
                      ${meta.icon ? `<span aria-hidden="true">${meta.icon}</span>` : ''}<span>${meta.label}</span>
                    </button>
                  </td>`;
              })
              .join('');
            return `<tr data-permmtx-row="${escapeAttribute(row.id)}" class="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60">
                <td class="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-200">${escapeAttribute(row.label)}</td>
                ${cells}
              </tr>`;
          })
          .join('');
        return groupRow + rows;
      })
      .join('');

    const tableHtml =
      this._tab === 'details'
        ? `<div data-permmtx-table class="mt-4 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
                  <th class="px-4 py-3 font-semibold">Actions</th>
                  ${roleHeads}
                </tr>
              </thead>
              <tbody>${bodyRows}</tbody>
            </table>
          </div>`
        : `<div data-permmtx-overview class="mt-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <p class="text-sm font-medium text-zinc-500 dark:text-zinc-400">${roles.length} roles · ${groups.reduce((n, g) => n + g.rows.length, 0)} permission rules configured.</p>
          </div>`;

    const tabBtn = (t, label) =>
      `<button data-permmtx-tab="${t}" type="button" class="-mb-px border-b-2 pb-2 text-sm font-medium transition-colors ${
        this._tab === t ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-300' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
      }">${label}</button>`;

    this.innerHTML = `
      <div data-permmtx class="w-full rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <h2 data-permmtx-title class="text-xl font-bold text-zinc-900 dark:text-zinc-50">${escapeAttribute(title)}</h2>
        <p data-permmtx-description class="mt-1.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">${escapeAttribute(description)}</p>
        <div data-permmtx-tabs class="mt-4 flex gap-6 border-b border-zinc-200 dark:border-zinc-800">
          ${tabBtn('overview', 'Overview')}
          ${tabBtn('details', 'Permission details')}
        </div>
        ${tableHtml}
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('permission-matrix')) {
  customElements.define('permission-matrix', PermissionMatrixElement);
}

export default PermissionMatrixElement;
