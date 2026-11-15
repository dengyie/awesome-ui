import uiIcon from './UiIcon.js';

const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class AuthFormElement extends HTMLElement {
  static get observedAttributes() {
    return ['mode', 'title', 'subtitle', 'submit-text', 'error', 'loading', 'footer-text', 'providers'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  get providers() {
    if (this._providers) return this._providers;
    try {
      return JSON.parse(this.getAttribute('providers') || '[]');
    } catch {
      return [];
    }
  }

  set providers(value) {
    this._providers = Array.isArray(value) ? value : [];
    this.render();
  }

  get mode() {
    return this.getAttribute('mode') === 'signup' ? 'signup' : 'signin';
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
    const isSignup = this.mode === 'signup';
    const providers = this.providers;
    const title = this.getAttribute('title') || (isSignup ? 'Create your account' : 'Welcome back');
    const subtitle =
      this.getAttribute('subtitle') || (isSignup ? 'Start free, no card required.' : 'Sign in to continue to your workspace.');
    const error = this.getAttribute('error') || '';
    const loading = this.getAttribute('loading') === 'true';
    const submitText = this.getAttribute('submit-text') || (isSignup ? 'Create account' : 'Sign in');
    const footerText = this.getAttribute('footer-text');

    this._applyHostClass('block w-full max-w-sm');

    const providerButtons = providers
      .map((provider) => {
        const fallback = (provider.name || '?').trim().charAt(0).toUpperCase();
        return `
          <button type="button" data-provider="${escapeAttribute(provider.name)}"
            class="auth-provider flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
            ${
              provider.icon
                ? `<img src="${escapeAttribute(provider.icon)}" alt="" class="h-4 w-4 shrink-0" />`
                : `<span class="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">${escapeAttribute(fallback)}</span>`
            }
            <span>Continue with ${escapeAttribute(provider.name)}</span>
          </button>`;
      })
      .join('');

    const providerBlock = providers.length
      ? `<div class="mt-5 space-y-2">${providerButtons}</div>
         <div class="my-5 flex items-center gap-3">
           <span class="h-px flex-1 bg-zinc-100 dark:bg-zinc-800"></span>
           <span class="text-[11px] text-zinc-400 dark:text-zinc-500">or</span>
           <span class="h-px flex-1 bg-zinc-100 dark:bg-zinc-800"></span>
         </div>`
      : '';

    const inputAttrs =
      'w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-colors';

    this.innerHTML = `
      <div class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <div class="text-base font-semibold text-zinc-900 dark:text-zinc-100">${escapeAttribute(title)}</div>
        <div class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">${escapeAttribute(subtitle)}</div>
        ${providerBlock}
        <form class="${providers.length ? 'space-y-3' : 'mt-5 space-y-3'}" novalidate>
          ${
            isSignup
              ? `<label class="block">
                   <span class="mb-1 block text-[11px] font-medium text-zinc-600 dark:text-zinc-300">Name</span>
                   <input type="text" name="name" autocomplete="name" placeholder="Ada Lovelace" class="${inputAttrs}" />
                 </label>`
              : ''
          }
          <label class="block">
            <span class="mb-1 block text-[11px] font-medium text-zinc-600 dark:text-zinc-300">Email</span>
            <input type="email" name="email" autocomplete="email" placeholder="you@company.com" class="${inputAttrs}" />
          </label>
          <label class="block">
            <span class="mb-1 block text-[11px] font-medium text-zinc-600 dark:text-zinc-300">Password</span>
            <input type="password" name="password" autocomplete="${isSignup ? 'new-password' : 'current-password'}"
              placeholder="••••••••" class="${inputAttrs}" />
          </label>
          ${
            error
              ? `<div role="alert" class="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/40 px-3 py-2">
                   <span class="mt-0.5 shrink-0 text-red-500">${uiIcon('alert-triangle', { size: 14 })}</span>
                   <span class="text-[11px] leading-relaxed text-red-600 dark:text-red-400">${escapeAttribute(error)}</span>
                 </div>`
              : ''
          }
          <button type="submit" ${loading ? 'disabled' : ''}
            class="auth-submit flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900">
            ${loading ? `<span class="animate-spin inline-flex">${uiIcon('loader', { size: 14 })}</span>` : ''}
            ${escapeAttribute(submitText)}
          </button>
        </form>
        ${
          footerText
            ? `<button type="button" class="auth-footer mt-4 w-full text-center text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">${escapeAttribute(footerText)}</button>`
            : ''
        }
      </div>`;

    this.querySelectorAll('.auth-provider').forEach((btn) => {
      btn.addEventListener('click', () => {
        const provider = providers.find((p) => p.name === btn.getAttribute('data-provider'));
        this.dispatchEvent(new CustomEvent('provider', { detail: provider }));
      });
    });

    const form = this.querySelector('form');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      // Keep the raw DOM event from bubbling to host listeners: hosts should
      // only ever observe the normalized `submit` CustomEvent below.
      event.stopPropagation();
      if (loading) return;
      const values = new FormData(form);
      const payload = {
        ...(isSignup ? { name: String(values.get('name') || '') } : {}),
        email: String(values.get('email') || ''),
        password: String(values.get('password') || ''),
      };
      this.dispatchEvent(new CustomEvent('submit', { detail: payload }));
    });

    const footerBtn = this.querySelector('.auth-footer');
    if (footerBtn) footerBtn.addEventListener('click', () => this.dispatchEvent(new CustomEvent('footer')));
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('auth-form')) {
  customElements.define('auth-form', AuthFormElement);
}
export default AuthFormElement;