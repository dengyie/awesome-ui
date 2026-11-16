/**
 * HelpCenterHome - Help center landing: hero title, big search bar with
 * submit button and "browse by topic" rows with expandable article links
 * (GetYourGuide help center pattern).
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

const DEFAULT_TOPICS = () => [
  { id: 'plan', label: 'Plan, search and book' },
  { id: 'activity', label: 'Activity information' },
  { id: 'voucher', label: 'Booking confirmation, voucher and tickets' },
  { id: 'pickup', label: 'Meeting point and pickup' },
  { id: 'day', label: 'On the day of the activity' },
  { id: 'management', label: 'Booking management', articles: ['Change the date or time', 'Cancel your booking', 'Refund policy'] },
  { id: 'cancellation', label: 'Cancellation' },
  { id: 'payment', label: 'Payment and refunds' },
];

class HelpCenterHomeElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'search-placeholder', 'topics'];
  }

  constructor() {
    super();
    this._bound = false;
    this._openId = 'management';
  }

  connectedCallback() {
    if (this._bound === false && this.innerHTML === '') {
      this._bound = true;
    }
    this._render();
    this.addEventListener('click', this._onClick);
    this.addEventListener('submit', this._onSubmit, true);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onClick);
    this.removeEventListener('submit', this._onSubmit, true);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (this._bound === false && this.innerHTML === '') return;
    this._render();
  }

  _onSubmit(event) {
    event.preventDefault();
    const input = this.querySelector('[data-helpct-input]');
    const query = input ? input.value : '';
    this.dispatchEvent(new CustomEvent('search-submit', { detail: { query }, bubbles: true }));
  }

  _onClick(event) {
    const articleBtn = event.target.closest('[data-helpct-article]');
    if (articleBtn) {
      const topics = parseJsonAttr(this.getAttribute('topics'), DEFAULT_TOPICS());
      const topic = topics.find((t) => t.id === this._openId) || null;
      this.dispatchEvent(new CustomEvent('article-click', { detail: { topic, article: articleBtn.getAttribute('data-helpct-article') }, bubbles: true }));
      return;
    }
    const topicBtn = event.target.closest('[data-helpct-topic-btn]');
    if (topicBtn) {
      const id = topicBtn.getAttribute('data-helpct-topic-btn');
      const topics = parseJsonAttr(this.getAttribute('topics'), DEFAULT_TOPICS());
      const topic = topics.find((t) => t.id === id) || null;
      if (topic && Array.isArray(topic.articles) && topic.articles.length > 0) {
        this._openId = this._openId === id ? null : id;
        this._render();
      }
      this.dispatchEvent(new CustomEvent('topic-click', { detail: { topic }, bubbles: true }));
    }
  }

  _render() {
    const title = this.getAttribute('title') || 'Welcome to the Help Center';
    const placeholder = this.getAttribute('search-placeholder') || 'Cancellation, meeting point, etc.';
    const topics = parseJsonAttr(this.getAttribute('topics'), DEFAULT_TOPICS());

    const topicRows = topics
      .map((t) => {
        const expandable = Array.isArray(t.articles) && t.articles.length > 0;
        const open = this._openId === t.id;
        const chevron = expandable && open ? '▾' : '›';
        const articles =
          expandable && open
            ? `<div data-helpct-articles="${escapeAttribute(t.id)}" class="pb-4">${t.articles
                .map(
                  (a) => `<button type="button" data-helpct-article="${escapeAttribute(a)}" class="block py-1.5 text-left text-sm text-indigo-600 transition-colors hover:underline dark:text-indigo-300">${escapeAttribute(a)}</button>`
                )
                .join('')}</div>`
            : '';
        return `<div data-helpct-topic="${escapeAttribute(t.id)}" class="border-b border-zinc-200 last:border-0 dark:border-zinc-800">
            <button type="button" data-helpct-topic-btn="${escapeAttribute(t.id)}" class="flex w-full items-center justify-between py-4 text-left text-sm font-semibold text-zinc-700 transition-colors hover:text-indigo-600 dark:text-zinc-200 dark:hover:text-indigo-300">
              <span>${escapeAttribute(t.label)}</span>
              <span aria-hidden="true" class="text-xs text-zinc-400">${chevron}</span>
            </button>
            ${articles}
          </div>`;
      })
      .join('');

    // Re-render strategy: the shell (title/form/topics container) is rendered
    // once; topic expansion only swaps the topics container's innerHTML so the
    // search input keeps its value and focus across re-renders.
    if (this.querySelector('[data-helpct-form]')) {
      this.querySelector('[data-helpct-topics]').innerHTML = topicRows;
      return;
    }

    this.innerHTML = `
      <div data-helpct class="w-full rounded-2xl border border-zinc-200 bg-white px-5 py-8 dark:border-zinc-800 dark:bg-zinc-900 sm:px-8">
        <div class="mx-auto max-w-2xl text-center">
          <h2 data-helpct-title class="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">${escapeAttribute(title)}</h2>
          <p data-helpct-label class="mt-6 text-left text-sm font-bold text-zinc-800 dark:text-zinc-100">Search for a topic</p>
          <form data-helpct-form class="mt-2 flex overflow-hidden rounded-lg border border-zinc-300 focus-within:border-indigo-500 dark:border-zinc-700">
            <input type="search" data-helpct-input placeholder="${escapeAttribute(placeholder)}" class="min-w-0 flex-1 px-4 py-2.5 text-sm text-zinc-700 outline-none placeholder:text-zinc-400 dark:bg-zinc-900 dark:text-zinc-200" />
            <button type="submit" data-helpct-submit aria-label="Search" class="bg-indigo-600 px-5 text-white transition-colors hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400">🔍</button>
          </form>
          <p data-helpct-browse class="mt-8 text-left text-sm font-bold text-zinc-800 dark:text-zinc-100">Or browse by topic</p>
          <div data-helpct-topics class="mt-2 text-left">${topicRows}</div>
        </div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('help-center-home')) {
  customElements.define('help-center-home', HelpCenterHomeElement);
}

export default HelpCenterHomeElement;
