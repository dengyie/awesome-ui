/**
 * DocsPageLayout - Documentation page shell: left nav with top links and
 * grouped sections, center article with title, Copy page button, callout,
 * cards grid and code examples, right "On this page" table of contents
 * with active highlight (Mintlify docs pattern).
 */
const escapeAttribute = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

// Only allow safe URL protocols into <a href> (blocks javascript:/data:/vbscript:)
const isSafeHref = (href) => {
  if (typeof href !== 'string') return false;
  const t = href.trim();
  if (t.length === 0) return false;
  if (t.startsWith('//') || t.startsWith('/') || t.startsWith('./') || t.startsWith('../')) return true;
  return /^(https?:\/\/|mailto:)/i.test(t);
};

const parseJsonAttr = (raw, fallback) => {
  if (typeof raw !== 'string' || raw.trim() === '') return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const DEFAULT_TOPLINKS = () => [
  { id: 'documentation', label: 'Documentation', icon: '📘' },
  { id: 'blog', label: 'Blog', icon: '📰' },
];

const DEFAULT_NAVGROUPS = () => [
  {
    label: 'Getting Started',
    items: [
      { id: 'introduction', label: 'Introduction' },
      { id: 'quickstart', label: 'Quickstart', badge: 'Start here' },
      { id: 'development', label: 'Development' },
    ],
  },
  {
    label: 'Essentials',
    items: [
      { id: 'routing', label: 'Routing' },
      { id: 'metadata', label: 'Metadata' },
      { id: 'images', label: 'Images' },
    ],
  },
];

const DEFAULT_BLOCKS = () => [
  { type: 'callout', tone: 'info', title: 'New to Mintlify?', text: 'Start here to learn how to build, preview and deploy your documentation.' },
  { type: 'paragraph', text: 'This guide walks you through setting up a local development environment, writing your first page and deploying to production.' },
  { type: 'heading', text: 'Create a new project', anchor: 'create-a-new-project' },
  { type: 'code', example: { filename: 'Terminal', language: 'bash', code: 'npx mintlify init && npx mintlify dev' } },
  { type: 'heading', text: 'Cards', anchor: 'cards' },
  {
    type: 'cards',
    cards: [
      { title: 'Quickstart', description: 'Get your docs running in minutes.', icon: '🚀', href: '/quickstart' },
      { title: 'Theming', description: 'Customize colors, fonts and layout.', icon: '🎨', href: '/theming' },
    ],
  },
];

const DEFAULT_TOC = () => [
  { id: 'create-a-new-project', label: 'Create a new project' },
  { id: 'cards', label: 'Cards' },
];

const CALLOUT_STYLES = {
  info: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-200',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200',
  warning: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200',
};

const CALLOUT_ICONS = { info: 'ℹ️', success: '✅', warning: '⚠️' };

class DocsPageLayoutElement extends HTMLElement {
  static get observedAttributes() {
    return ['top-links', 'nav-groups', 'title', 'copy-label', 'blocks', 'toc', 'active-toc-id'];
  }

  constructor() {
    super();
    this._bound = false;
    this._copied = false;
    this._copiedTimer = null;
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
    if (this._copiedTimer) clearTimeout(this._copiedTimer);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (this._bound === false && this.innerHTML === '') return;
    this._render();
  }

  _onClick(event) {
    const toplink = event.target.closest('[data-docspage-toplink]');
    if (toplink) {
      const links = parseJsonAttr(this.getAttribute('top-links'), DEFAULT_TOPLINKS());
      const found = links.find((l) => l.id === toplink.getAttribute('data-docspage-toplink'));
      if (found) this.dispatchEvent(new CustomEvent('nav-click', { detail: { item: found }, bubbles: true }));
      return;
    }
    const navitem = event.target.closest('[data-docspage-navitem]');
    if (navitem) {
      const groups = parseJsonAttr(this.getAttribute('nav-groups'), DEFAULT_NAVGROUPS());
      const found = groups.flatMap((g) => g.items).find((i) => i.id === navitem.getAttribute('data-docspage-navitem'));
      if (found) this.dispatchEvent(new CustomEvent('nav-click', { detail: { item: found }, bubbles: true }));
      return;
    }
    if (event.target.closest('[data-docspage-copy]')) {
      this._copied = true;
      this._render();
      this.dispatchEvent(new CustomEvent('copy-page', { bubbles: true }));
      this._copiedTimer = setTimeout(() => {
        this._copied = false;
        this._render();
      }, 1500);
      return;
    }
    const tocitem = event.target.closest('[data-docspage-tocitem]');
    if (tocitem) {
      const id = tocitem.getAttribute('data-docspage-tocitem');
      this.setAttribute('active-toc-id', id);
      const found = this._toc().find((t) => t.id === id);
      if (found) this.dispatchEvent(new CustomEvent('toc-click', { detail: { item: found }, bubbles: true }));
    }
  }

  _toc() {
    return parseJsonAttr(this.getAttribute('toc'), DEFAULT_TOC());
  }

  _blockHtml(block) {
    if (block.type === 'paragraph') {
      return `<p class="text-sm leading-6 text-zinc-600 dark:text-zinc-300">${escapeAttribute(block.text)}</p>`;
    }
    if (block.type === 'callout') {
      const tone = block.tone ?? 'info';
      return `<div data-docspage-callout class="rounded-xl border p-4 ${CALLOUT_STYLES[tone] ?? CALLOUT_STYLES.info}">
          <p class="flex items-center gap-2 text-sm font-semibold"><span aria-hidden="true">${CALLOUT_ICONS[tone] ?? CALLOUT_ICONS.info}</span>${escapeAttribute(block.title ?? '')}</p>
          <p class="mt-1 text-sm leading-6 opacity-90">${escapeAttribute(block.text)}</p>
        </div>`;
    }
    if (block.type === 'heading') {
      return `<h2 id="${escapeAttribute(block.anchor)}" data-docspage-heading="${escapeAttribute(block.anchor)}" class="text-xl font-bold text-zinc-900 dark:text-zinc-50">${escapeAttribute(block.text)}</h2>`;
    }
    if (block.type === 'cards') {
      return `<div data-docspage-cards class="grid gap-3 sm:grid-cols-2">${(block.cards ?? [])
        .map(
          (card) => {
            const href = isSafeHref(card.href) ? escapeAttribute(card.href) : '';
            return `<a data-docspage-card="${escapeAttribute(card.title)}" ${href ? `href="${href}"` : 'role="link" aria-disabled="true"'} class="rounded-xl border border-zinc-200 p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50">
              <p class="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-50">${card.icon ? `<span aria-hidden="true">${escapeAttribute(card.icon)}</span>` : ''}${escapeAttribute(card.title)}</p>
              <p class="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">${escapeAttribute(card.description)}</p>
            </a>`;
          }
        )
        .join('')}</div>`;
    }
    return `<div data-docspage-code class="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-950 dark:border-zinc-800">
        <div class="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
          <span class="text-xs font-medium text-zinc-400">${escapeAttribute(block.example.filename)}</span>
          <span class="text-[10px] uppercase tracking-wide text-zinc-500">${escapeAttribute(block.example.language)}</span>
        </div>
        <pre class="overflow-x-auto px-4 py-3 text-xs leading-5 text-zinc-200"><code>${escapeAttribute(block.example.code)}</code></pre>
      </div>`;
  }

  _render() {
    const title = this.getAttribute('title') || 'Quickstart';
    const copyLabel = this.getAttribute('copy-label') || 'Copy page';
    const topLinks = parseJsonAttr(this.getAttribute('top-links'), DEFAULT_TOPLINKS());
    const navGroups = parseJsonAttr(this.getAttribute('nav-groups'), DEFAULT_NAVGROUPS());
    const blocks = parseJsonAttr(this.getAttribute('blocks'), DEFAULT_BLOCKS());
    const toc = this._toc();
    const activeId = this.getAttribute('active-toc-id') || toc[0]?.id || '';

    const toplinksHtml = topLinks
      .map(
        (link) => `<button data-docspage-toplink="${escapeAttribute(link.id)}" type="button" class="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800">${link.icon ? `<span aria-hidden="true">${escapeAttribute(link.icon)}</span>` : ''}${escapeAttribute(link.label)}</button>`
      )
      .join('');

    const groupsHtml = navGroups
      .map(
        (group) => `<div data-docspage-group="${escapeAttribute(group.label)}" class="mt-5">
          <p class="px-3 text-[11px] font-bold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">${escapeAttribute(group.label)}</p>
          <div class="mt-1.5 space-y-0.5">${(group.items ?? [])
            .map(
              (item) => `<button data-docspage-navitem="${escapeAttribute(item.id)}" type="button" class="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-left text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
                  <span class="truncate">${escapeAttribute(item.label)}</span>
                  ${item.badge ? `<span class="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">${escapeAttribute(item.badge)}</span>` : ''}
                </button>`
            )
            .join('')}</div>
        </div>`
      )
      .join('');

    const contentHtml = blocks.map((b) => this._blockHtml(b)).join('');

    const tocHtml = toc
      .map((item) => {
        const active = item.id === activeId;
        const cls = active
          ? 'border-zinc-900 font-semibold text-zinc-900 dark:border-zinc-100 dark:text-zinc-100'
          : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200';
        return `<button data-docspage-tocitem="${escapeAttribute(item.id)}" data-docspage-toc-active="${active ? 'true' : 'false'}" type="button" class="-ml-px block w-full border-l-2 px-3 py-1 text-left text-xs transition-colors ${cls}">${escapeAttribute(item.label)}</button>`;
      })
      .join('');

    this.innerHTML = `
      <div data-docspage class="grid w-full gap-8 lg:grid-cols-[220px_minmax(0,1fr)_200px]">
        <nav data-docspage-nav class="hidden lg:block">
          <div class="space-y-1">${toplinksHtml}</div>
          ${groupsHtml}
        </nav>
        <article data-docspage-article class="min-w-0">
          <div class="flex items-center justify-between gap-4">
            <h1 data-docspage-title class="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">${escapeAttribute(title)}</h1>
            <button data-docspage-copy type="button" class="shrink-0 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">${this._copied ? '✓ Copied' : `⧉ ${escapeAttribute(copyLabel)}`}</button>
          </div>
          <div data-docspage-content class="mt-6 space-y-4">${contentHtml}</div>
        </article>
        <aside data-docspage-toc class="hidden lg:block">
          <p class="text-[11px] font-bold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">On this page</p>
          <div class="mt-3 space-y-1 border-l border-zinc-200 dark:border-zinc-800">${tocHtml}</div>
        </aside>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('docs-page-layout')) {
  customElements.define('docs-page-layout', DocsPageLayoutElement);
}

export default DocsPageLayoutElement;
