/**
 * BlogPostArticle - Blog article page: top bar with logo and search, left
 * "On this page" nav highlight, article body with headings, paragraphs,
 * inline code, and a dark code block with Copy button (Hashnode article
 * pattern).
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

const DEFAULT_BLOCKS = () => [
  { type: 'paragraph', text: 'Front-end development is the process of designing and building the part of a website or web application that users interact with directly. It involves creating the structure, layout, and interactive features of a webpage, ensuring a seamless user experience.' },
  { type: 'heading', text: 'Key Technologies in Front-End Development', id: 'key-technologies', level: 2 },
  { type: 'paragraph', text: 'Front-end development primarily relies on three core technologies: HTML, CSS and JavaScript.' },
  { type: 'list', items: ['HTML provides the basic structure of a webpage.', 'CSS controls the presentation and layout.', 'JavaScript adds interactivity and dynamic behavior.'] },
  { type: 'heading', text: '1. HTML (HyperText Markup Language)', id: 'html', level: 3 },
  { type: 'paragraph', text: 'HTML provides the basic structure of a webpage. It defines elements such as headings, paragraphs, images, links, and forms.' },
  {
    type: 'code',
    language: 'html',
    code: '<!DOCTYPE html>\n<html>\n  <head>\n    <title>My First Web Page</title>\n  </head>\n  <body>\n    <h1>Welcome to Front-End Development</h1>\n    <p>This is an example of HTML structure.</p>\n  </body>\n</html>',
  },
];

const DEFAULT_TOC = () => [
  { id: 'key-technologies', text: 'Key Technologies in Front-End Development', level: 2 },
  { id: 'html', text: '1. HTML (HyperText Markup Language)', level: 3 },
];

class BlogPostArticleElement extends HTMLElement {
  static get observedAttributes() {
    return ['site-name', 'title', 'subtitle', 'meta', 'blocks', 'toc', 'active-heading-id', 'code-label', 'copied-label'];
  }

  constructor() {
    super();
    this._bound = false;
    this._activeId = '';
    this._copied = false;
    this._copiedTimer = null;
  }

  connectedCallback() {
    if (this._bound === false && this.innerHTML === '') {
      this._bound = true;
    }
    if (!this._activeId) {
      const toc = parseJsonAttr(this.getAttribute('toc'), DEFAULT_TOC());
      this._activeId = this.getAttribute('active-heading-id') || toc[0]?.id || '';
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
    const tocitem = event.target.closest('[data-blogpost-tocitem]');
    if (tocitem) {
      this._activeId = tocitem.getAttribute('data-blogpost-tocitem');
      const found = parseJsonAttr(this.getAttribute('toc'), DEFAULT_TOC()).find((t) => t.id === this._activeId);
      if (found) this.dispatchEvent(new CustomEvent('heading-click', { detail: { heading: found }, bubbles: true }));
      this._render();
      return;
    }
    if (event.target.closest('[data-blogpost-code-copy]')) {
      this._copied = true;
      this._render();
      this.dispatchEvent(new CustomEvent('copy-code', { bubbles: true }));
      this._copiedTimer = setTimeout(() => {
        this._copied = false;
        this._render();
      }, 1500);
    }
  }

  _blockHtml(block) {
    if (block.type === 'paragraph') {
      return `<p class="text-[15px] leading-7 text-zinc-700 dark:text-zinc-300">${escapeAttribute(block.text)}</p>`;
    }
    if (block.type === 'heading') {
      const isH3 = block.level === 3;
      return `<${isH3 ? 'h3' : 'h2'} id="${escapeAttribute(block.id)}" data-blogpost-heading="${escapeAttribute(block.id)}" class="font-bold tracking-tight text-zinc-900 dark:text-zinc-50 ${isH3 ? 'mt-8 text-lg' : 'mt-10 text-xl'}">${escapeAttribute(block.text)}</${isH3 ? 'h3' : 'h2'}>`;
    }
    if (block.type === 'list') {
      return `<ul class="list-disc space-y-1.5 pl-6 text-[15px] leading-7 text-zinc-700 dark:text-zinc-300">${(block.items ?? [])
        .map((item) => `<li>${escapeAttribute(item)}</li>`)
        .join('')}</ul>`;
    }
    return `<div data-blogpost-code class="overflow-hidden rounded-xl bg-zinc-950 dark:bg-black">
        <div class="flex items-center justify-between px-4 pt-3">
          <span class="text-[10px] uppercase tracking-wide text-zinc-500">${escapeAttribute(block.language)}</span>
          <button data-blogpost-code-copy type="button" class="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"><span aria-hidden="true">⧉</span> ${this._copied ? escapeAttribute(this.getAttribute('copied-label') || 'Copied!') : escapeAttribute(this.getAttribute('code-label') || 'Copy')}</button>
        </div>
        <pre class="overflow-x-auto px-4 pb-4 pt-1 text-xs leading-5 text-zinc-200"><code>${escapeAttribute(block.code)}</code></pre>
      </div>`;
  }

  _render() {
    const siteName = this.getAttribute('site-name') || 'SLMobbin';
    const title = this.getAttribute('title') || "Introduction to Front-End Development: A Beginner's Guide";
    const subtitle = this.getAttribute('subtitle') ?? 'What is Front-End Development?';
    const meta = this.getAttribute('meta') ?? '8 min read · Nov 14, 2026';
    const blocks = parseJsonAttr(this.getAttribute('blocks'), DEFAULT_BLOCKS());
    const toc = parseJsonAttr(this.getAttribute('toc'), DEFAULT_TOC());

    const tocHtml = toc
      .map((h) => {
        const active = h.id === this._activeId;
        return `<button data-blogpost-tocitem="${escapeAttribute(h.id)}" data-blogpost-toc-active="${active ? 'true' : 'false'}" type="button" class="block w-full rounded-lg px-3 py-1.5 text-left text-xs leading-5 transition-colors ${h.level === 3 ? 'pl-6' : ''} ${active ? 'bg-sky-50 font-semibold text-sky-700 dark:bg-sky-950/50 dark:text-sky-300' : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'}">${escapeAttribute(h.text)}</button>`;
      })
      .join('');

    const contentHtml = blocks.map((b) => this._blockHtml(b)).join('');

    this.innerHTML = `
      <div data-blogpost class="w-full border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <header data-blogpost-topbar class="flex items-center justify-between gap-4 border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
          <p data-blogpost-site class="text-sm font-black tracking-tight text-zinc-900 dark:text-zinc-50">${escapeAttribute(siteName)}</p>
          <div class="hidden min-w-0 flex-1 justify-center sm:flex">
            <div class="flex w-full max-w-md items-center gap-2 rounded-full border border-zinc-200 px-4 py-1.5 text-xs text-zinc-400 dark:border-zinc-800">
              <span aria-hidden="true">⌕</span>
              <span class="flex-1">Search</span>
              <kbd class="rounded border border-zinc-200 px-1.5 py-0.5 text-[10px] dark:border-zinc-700">⌘ K</kbd>
            </div>
          </div>
          <button type="button" aria-label="Toggle theme" class="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">☾</button>
        </header>
        <div class="grid lg:grid-cols-[200px_minmax(0,1fr)]">
          <nav data-blogpost-toc class="hidden border-r border-zinc-200 p-5 lg:block dark:border-zinc-800">
            <div class="space-y-1">${tocHtml}</div>
            <p class="mt-6 flex items-center gap-2 text-xs text-zinc-400"><span aria-hidden="true">⇥</span> Collapse <kbd class="ml-auto rounded border border-zinc-200 px-1.5 py-0.5 text-[10px] dark:border-zinc-700">⌘ \\</kbd></p>
          </nav>
          <article data-blogpost-article class="min-w-0 px-6 py-8 sm:px-10">
            <h1 data-blogpost-title class="text-3xl font-black leading-tight tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">${escapeAttribute(title)}</h1>
            ${subtitle ? `<p class="mt-3 text-base text-zinc-600 dark:text-zinc-300">${escapeAttribute(subtitle)}</p>` : ''}
            ${meta ? `<p data-blogpost-meta class="mt-2 text-xs text-zinc-400 dark:text-zinc-500">${escapeAttribute(meta)}</p>` : ''}
            <div data-blogpost-content class="mt-6 space-y-4">${contentHtml}</div>
          </article>
        </div>
      </div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('blog-post-article')) {
  customElements.define('blog-post-article', BlogPostArticleElement);
}

export default BlogPostArticleElement;
