import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const SIZE_CLASS = {
  sm: 'h-7 w-7 text-[10px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-11 w-11 text-sm',
};

const DOT_CLASS = {
  online: 'bg-emerald-500',
  away: 'bg-amber-400',
  offline: 'bg-zinc-400',
};

const initials = (name) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

/**
 * AvatarGroup - Vanilla Web Component
 * Usage: <avatar-group max="4" size="md"></avatar-group>
 * Properties: members (AvatarMember[])
 * Events: member-click (detail: member)
 */
export class AvatarGroupElement extends HTMLElement {
  static get observedAttributes() {
    return ['max', 'size'];
  }

  constructor() {
    super();
    this._members = [];
  }

  get members() {
    return this._members;
  }

  set members(value) {
    this._members = Array.isArray(value) ? value : [];
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

  render() {
    this._applyHostClass('flex items-center -space-x-2');

    const size = SIZE_CLASS[this.getAttribute('size')] ? this.getAttribute('size') : 'md';
    const rawMax = this.getAttribute('max');
    const max = rawMax !== null && Number.isFinite(Number(rawMax)) ? Math.max(0, Number(rawMax)) : 4;
    const visible = this._members.slice(0, max);
    const overflow = this._members.length - visible.length;
    const sizeClass = SIZE_CLASS[size];
    const iconSize = size === 'sm' ? 12 : size === 'lg' ? 18 : 14;

    const avatars = visible
      .map((member) => {
        const inner = member.src
          ? `<img src="${escapeAttribute(member.src)}" alt="" class="h-full w-full object-cover" />`
          : member.name && member.name.trim()
            ? `<span aria-hidden="true">${escapeAttribute(initials(member.name))}</span>`
            : uiIcon('user', { size: iconSize });
        const dot = member.status && DOT_CLASS[member.status]
          ? `<span aria-hidden="true" class="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-zinc-900 ${DOT_CLASS[member.status]}"></span>`
          : '';
        return `<button type="button" data-member-id="${escapeAttribute(member.id)}" title="${escapeAttribute(member.name)}" aria-label="${escapeAttribute(member.name)}"
          class="avatar-member relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-100 font-semibold text-zinc-600 ring-2 ring-white transition-transform hover:z-10 hover:scale-105 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-900 ${sizeClass}">
          ${inner}${dot}
        </button>`;
      })
      .join('');

    this.innerHTML = `${avatars}${
      overflow > 0
        ? `<span title="${overflow} more" class="relative inline-flex shrink-0 items-center justify-center rounded-full bg-zinc-100 font-semibold tabular-nums text-zinc-500 ring-2 ring-white dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-900 ${sizeClass}">+${overflow}</span>`
        : ''
    }`;

    this.querySelectorAll('.avatar-member').forEach((node) => {
      node.addEventListener('click', () => {
        const member = this._members.find((entry) => String(entry.id) === node.getAttribute('data-member-id'));
        if (member) this.dispatchEvent(new CustomEvent('member-click', { detail: member }));
      });
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('avatar-group')) {
  customElements.define('avatar-group', AvatarGroupElement);
}
export default AvatarGroupElement;
