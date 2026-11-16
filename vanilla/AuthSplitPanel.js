/**
 * AuthSplitPanel - Vanilla Web Component
 * Usage: <auth-split-panel media-title="Welcome back" media-subtitle="..." media-side="left"></auth-split-panel>
 * Attributes: media-side (left|right), media-title, media-subtitle, media-background (tinted|cover), footer-links (JSON [{label,href}])
 * Slots: default children rendered in the auth column; media via property (HTML string)
 * Property: media, footerLinks
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

// Only allow safe URL protocols into <a href> (blocks javascript:/data:/vbscript:)
const isSafeHref = (href) => {
  if (typeof href !== 'string') return false;
  const t = href.trim();
  if (t.length === 0) return false;
  if (t.startsWith('//') || t.startsWith('/') || t.startsWith('./') || t.startsWith('../')) return true;
  return /^(https?:\/\/|mailto:)/i.test(t);
};

export class AuthSplitPanelElement extends HTMLElement {
  static get observedAttributes() {
    return ['media-side', 'media-title', 'media-subtitle', 'media-background', 'footer-links'];
  }

  constructor() {
    super();
    this._media = '';
    this._footerLinks = [];
    this._bound = false;
  }

  connectedCallback() {
    // Capture light-DOM children before first render replaces innerHTML.
    if (this._contentHtml === undefined) this._contentHtml = this.innerHTML;
    const raw = this.getAttribute('footer-links');
    if (raw && !this._footerLinks.length) {
      try { this._footerLinks = JSON.parse(raw); } catch { this._footerLinks = []; }
    }
    this.render();
  }

  get media() {
    return this._media;
  }
  set media(v) {
    this._media = v || '';
    this.render();
  }

  get footerLinks() {
    return this._footerLinks;
  }
  set footerLinks(v) {
    this._footerLinks = Array.isArray(v) ? v : [];
    this.render();
  }

  attributeChangedCallback(name) {
    // Fires before connectedCallback when an already-connected element upgrades;
    // rendering then would wipe light-DOM children before _contentHtml is captured.
    if (this._contentHtml === undefined) return;
    if (name === 'footer-links' && this.getAttribute(name)) {
      try { this._footerLinks = JSON.parse(this.getAttribute(name)); } catch { /* keep */ }
    }
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

  _mediaPanel(side) {
    const background = this.getAttribute('media-background') || 'tinted';
    const title = this.getAttribute('media-title') || '';
    const subtitle = this.getAttribute('media-subtitle') || '';
    return `<div data-auth-media="${side}" class="relative hidden md:flex flex-col items-center justify-center overflow-hidden ${background === 'cover' ? 'bg-zinc-900' : 'bg-zinc-100'}">
  ${this._media ? `<div class="mb-4 max-h-64 max-w-full">${this._media}</div>` : ''}
  ${title ? `<p class="px-8 text-center text-2xl font-bold ${background === 'cover' ? 'text-white' : 'text-zinc-900'}">${escapeAttribute(title)}</p>` : ''}
  ${subtitle ? `<p class="mt-2 max-w-xs px-8 text-center text-sm leading-relaxed ${background === 'cover' ? 'text-zinc-300' : 'text-zinc-500'}">${escapeAttribute(subtitle)}</p>` : ''}
</div>`;
  }

  render() {
    const side = this.getAttribute('media-side') || 'left';
    const hostClass = 'grid min-h-[480px] md:grid-cols-2 contents';
    this._applyHostClass(hostClass);

    const links = this._footerLinks
      .map((link) =>
        isSafeHref(link.href)
          ? `<a href="${escapeAttribute(link.href)}" class="hover:underline">${escapeAttribute(link.label)}</a>`
          : `<span class="hover:underline">${escapeAttribute(link.label)}</span>`
      )
      .join('');

    const mediaLeft = side === 'left' ? this._mediaPanel('left') : '';
    const mediaRight = side === 'right' ? this._mediaPanel('right') : '';

    this.innerHTML = `<div data-auth-split class="grid min-h-[480px] md:grid-cols-2">
${mediaLeft}
<div class="flex flex-col justify-center px-6 py-10 sm:px-12">
  <div class="mx-auto w-full max-w-md">${this._contentHtml || ''}
    ${links ? `<div class="mt-8 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-blue-600">${links}</div>` : ''}
  </div>
</div>
${mediaRight}
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('auth-split-panel')) {
  customElements.define('auth-split-panel', AuthSplitPanelElement);
}

export default AuthSplitPanelElement;
