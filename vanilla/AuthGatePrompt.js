/**
 * AuthGatePrompt - Vanilla Web Component
 * Usage: <auth-gate-prompt title="Sign in to save" providers='[...]'></auth-gate-prompt>
 * Attributes: title, providers (JSON [{id,label,tone?}]), secondary-label, divider-text, skip-label
 * Properties: providers
 * Events: provider (detail {id}), secondary, skip
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

const TONE_CLASS = {
  white: 'border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50',
  brand: 'bg-[#1877F2] text-white hover:bg-[#166fe0]',
  dark: 'bg-zinc-900 text-white hover:bg-zinc-700',
};

export class AuthGatePromptElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'providers', 'secondary-label', 'divider-text', 'skip-label'];
  }

  constructor() {
    super();
    this._providers = [];
    this._bound = false;
  }

  connectedCallback() {
    if (!this._providers.length) {
      const raw = this.getAttribute('providers');
      if (raw) {
        try { this._providers = JSON.parse(raw); } catch { this._providers = []; }
      }
    }
    this.render();
    if (!this._bound) {
      this._bound = true;
      this.addEventListener('click', (event) => {
        const provider = event.target.closest('[data-auth-provider]');
        if (provider) {
          this.dispatchEvent(new CustomEvent('provider', { detail: { id: provider.getAttribute('data-auth-provider') } }));
          return;
        }
        if (event.target.closest('[data-auth-secondary]')) {
          this.dispatchEvent(new CustomEvent('secondary'));
          return;
        }
        if (event.target.closest('[data-auth-skip]')) {
          this.dispatchEvent(new CustomEvent('skip'));
        }
      });
    }
  }

  attributeChangedCallback(name) {
    if (name === 'providers') this._providers = [];
    this.render();
  }

  get providers() { return this._providers; }
  set providers(v) {
    this._providers = Array.isArray(v) ? v : [];
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
    const title = this.getAttribute('title') || '';
    const dividerText = this.getAttribute('divider-text') || 'or';
    const skipLabel = this.getAttribute('skip-label') || 'Not now';
    const secondaryLabel = this.getAttribute('secondary-label') || '';
    const providers = this._providers.length
      ? this._providers
      : [
          { id: 'google', label: 'Continue with Google', tone: 'white' },
          { id: 'facebook', label: 'Continue with Facebook', tone: 'brand' },
          { id: 'apple', label: 'Continue with Apple', tone: 'dark' },
        ];

    const hostClass = 'mx-auto w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm';
    this._applyHostClass(hostClass);

    const buttons = providers
      .map((provider) => `<button type="button" data-auth-provider="${escapeAttribute(provider.id)}" class="w-full rounded-full px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${TONE_CLASS[provider.tone || 'white']}">${escapeAttribute(provider.label)}</button>`)
      .join('');

    const secondary = secondaryLabel
      ? `<button type="button" data-auth-secondary class="w-full rounded-full border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">${escapeAttribute(secondaryLabel)}</button>`
      : '';

    this.innerHTML = `<div data-auth-gate class="${hostClass}">
  <p data-auth-gate-title class="text-lg font-semibold leading-snug text-zinc-900">${escapeAttribute(title)}</p>
  <div class="mt-5 space-y-2.5">${buttons}</div>
  <div class="my-4 flex items-center gap-3"><span class="h-px flex-1 bg-zinc-200"></span><span class="text-xs text-zinc-400">${escapeAttribute(dividerText)}</span><span class="h-px flex-1 bg-zinc-200"></span></div>
  ${secondary}
  <button type="button" data-auth-skip class="mt-4 text-sm text-zinc-500 underline-offset-2 transition-colors hover:text-zinc-800 hover:underline">${escapeAttribute(skipLabel)}</button>
</div>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('auth-gate-prompt')) {
  customElements.define('auth-gate-prompt', AuthGatePromptElement);
}

export default AuthGatePromptElement;
