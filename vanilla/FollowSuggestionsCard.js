/**
 * FollowSuggestionsCard - Vanilla Web Component
 * "Discover more people" suggestions card: collapsible header, person cards
 * with avatar/initials + Follow/Following toggle + dismiss ×, empty state.
 *
 * Usage: <follow-suggestions-card title="Discover more people"></follow-suggestions-card>
 * Attributes: title, follow-label, following-label, empty-text
 * Properties: suggestions [{id, name, handle?, avatarUrl?, initials?}]
 * Events: follow-suggest-follow (detail person), follow-suggest-dismiss (detail person)
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class FollowSuggestionsCardElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'follow-label', 'following-label', 'empty-text'];
  }

  constructor() {
    super();
    this._suggestions = [];
    this._followed = {};
    this._dismissed = {};
    this._collapsed = false;
    this._bound = false;
  }

  get suggestions() {
    return this._suggestions;
  }

  set suggestions(value) {
    this._suggestions = Array.isArray(value) ? value : [];
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    this.render();
  }

  connectedCallback() {
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        if (event.target.closest('[data-follow-suggestions-toggle]')) {
          this._collapsed = !this._collapsed;
          this.render();
          return;
        }
        const dismiss = event.target.closest('[data-follow-suggestions-dismiss]');
        if (dismiss) {
          const id = dismiss.getAttribute('data-follow-suggestions-dismiss');
          const person = this._suggestions.find((s) => s.id === id);
          this._dismissed[id] = true;
          this.render();
          if (person) this.dispatchEvent(new CustomEvent('follow-suggest-dismiss', { detail: person }));
          return;
        }
        const follow = event.target.closest('[data-follow-suggestions-follow]');
        if (follow) {
          const id = follow.getAttribute('data-follow-suggestions-follow');
          const person = this._suggestions.find((s) => s.id === id);
          this._followed[id] = !this._followed[id];
          this.render();
          if (person && this._followed[id]) {
            this.dispatchEvent(new CustomEvent('follow-suggest-follow', { detail: person }));
          }
        }
      });
    }
  }

  _initialsOf(person) {
    if (person.initials) return person.initials;
    return person.name
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  render() {
    const title = this.getAttribute('title') || 'Discover more people';
    const followLabel = this.getAttribute('follow-label') || 'Follow';
    const followingLabel = this.getAttribute('following-label') || 'Following';
    const emptyText = this.getAttribute('empty-text') || 'No more suggestions right now — check back later.';

    const visible = this._suggestions.filter((s) => !this._dismissed[s.id]);

    const cards = visible
      .map((person) => {
        const isFollowed = !!this._followed[person.id];
        const avatar = person.avatarUrl
          ? `<img src="${escapeAttribute(person.avatarUrl)}" alt="" class="h-10 w-10 rounded-full bg-zinc-100 object-cover dark:bg-zinc-800" />`
          : `<span class="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">${escapeAttribute(this._initialsOf(person))}</span>`;
        const handleLine = person.handle
          ? `<p class="text-[11px] text-zinc-400 dark:text-zinc-500">${escapeAttribute(person.handle)}</p>`
          : '';
        const followCls = isFollowed
          ? 'border border-zinc-200 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'
          : 'bg-emerald-600 text-white hover:bg-emerald-500';
        return `
        <div data-follow-suggestions-card="${escapeAttribute(person.id)}" class="relative flex flex-col items-center rounded-lg border border-zinc-200 px-3 py-4 text-center dark:border-zinc-700">
          <button type="button" data-follow-suggestions-dismiss="${escapeAttribute(person.id)}" aria-label="Dismiss ${escapeAttribute(person.name)}" class="absolute right-1.5 top-1.5 rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300">✕</button>
          ${avatar}
          <p class="mt-2 text-xs font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(person.name)}</p>
          ${handleLine}
          <button type="button" data-follow-suggestions-follow="${escapeAttribute(person.id)}" aria-pressed="${isFollowed}" class="mt-2.5 w-full rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${followCls}">${isFollowed ? escapeAttribute(followingLabel) : escapeAttribute(followLabel)}</button>
        </div>`;
      })
      .join('');

    const grid = visible.length
      ? `<div data-follow-suggestions-grid class="grid grid-cols-2 gap-2 px-4 pb-4 sm:grid-cols-3">${cards}</div>`
      : `<p data-follow-suggestions-empty class="px-4 pb-4 text-[11px] text-zinc-400 dark:text-zinc-500">${escapeAttribute(emptyText)}</p>`;

    this.innerHTML = `
      <div data-follow-suggestions class="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <button type="button" data-follow-suggestions-toggle aria-expanded="${!this._collapsed}" class="flex w-full items-center justify-between px-4 py-3">
          <span data-follow-suggestions-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(title)}</span>
          <span aria-hidden="true" class="text-xs text-zinc-400 transition-transform ${this._collapsed ? '' : 'rotate-180'}">▾</span>
        </button>
        ${this._collapsed ? '' : grid}
      </div>`;
  }
}

export default FollowSuggestionsCardElement;

if (!customElements.get('follow-suggestions-card')) {
  customElements.define('follow-suggestions-card', FollowSuggestionsCardElement);
}
