/**
 * ProfileEditForm - Vanilla Web Component
 * Profile editing form: country select + city input, bio textarea with
 * character counter, show-email switch, social link rows, saved status.
 *
 * Usage: <profile-edit-form handle="@alexsmith"></profile-edit-form>
 * Attributes: title, handle, bio-limit, show-email-label, save-label, cancel-label,
 *             default-country, default-city, bio, default-show-email
 * Properties: countries, socials
 * Events: profile-save (detail {handle, country, city, bio, showEmail, socials}),
 *         profile-cancel
 */
const escapeAttribute = (value) =>
  String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

export class ProfileEditFormElement extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'handle', 'bio-limit', 'show-email-label', 'save-label', 'cancel-label', 'default-country', 'default-city', 'bio', 'default-show-email'];
  }

  constructor() {
    super();
    this._countries = ['United States', 'Singapore', 'United Kingdom', 'Germany', 'Japan'];
    this._socials = [];
    this._socialValues = {};
    this._saved = false;
    this._bound = false;
  }

  get countries() {
    return this._countries;
  }

  set countries(value) {
    this._countries = Array.isArray(value) && value.length ? value.map(String) : ['United States'];
    this.render();
  }

  get socials() {
    return this._socials;
  }

  set socials(value) {
    this._socials = Array.isArray(value) ? value : [];
    this._socialValues = Object.fromEntries(this._socials.map((s) => [s.id, s.value ?? '']));
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
        if (event.target.closest('[data-profile-edit-save]')) {
          this._save();
          return;
        }
        if (event.target.closest('[data-profile-edit-cancel]')) {
          this.dispatchEvent(new CustomEvent('profile-cancel'));
          return;
        }
        const toggle = event.target.closest('[data-profile-edit-email-toggle]');
        if (toggle) {
          const next = toggle.getAttribute('aria-checked') !== 'true';
          toggle.setAttribute('aria-checked', String(next));
          const knob = toggle.querySelector('span');
          if (knob) knob.className = next
            ? 'absolute left-3.5 top-0.5 h-3 w-3 rounded-full bg-white transition-all'
            : 'absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-white transition-all';
          toggle.className = `relative h-4 w-7 rounded-full transition-colors ${next ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700'}`;
          this._saved = false;
        }
      });
      this.addEventListener('input', (event) => {
        if (event.target.closest('[data-profile-edit-bio]')) {
          const bio = this.querySelector('[data-profile-edit-bio]');
          const count = this.querySelector('[data-profile-edit-bio-count]');
          if (bio && count) {
            const limit = Number.parseInt(this.getAttribute('bio-limit') || '750', 10) || 750;
            count.textContent = `${bio.value.length}/${limit}`;
          }
          this._saved = false;
        }
        const socialInput = event.target.closest('[data-profile-edit-social-input]');
        if (socialInput) {
          this._socialValues[socialInput.getAttribute('data-profile-edit-social-input')] = socialInput.value;
          this._saved = false;
        }
        if (event.target.closest('[data-profile-edit-city]')) this._saved = false;
      });
      this.addEventListener('change', (event) => {
        if (event.target.closest('[data-profile-edit-country]')) this._saved = false;
      });
    }
  }

  _save() {
    this._saved = true;
    const country = this.querySelector('[data-profile-edit-country]');
    const city = this.querySelector('[data-profile-edit-city]');
    const bio = this.querySelector('[data-profile-edit-bio]');
    const toggle = this.querySelector('[data-profile-edit-email-toggle]');
    this.render();
    this.dispatchEvent(
      new CustomEvent('profile-save', {
        detail: {
          handle: this.getAttribute('handle') || '@alexsmith',
          country: country ? country.value : this._countries[0],
          city: city ? city.value : '',
          bio: bio ? bio.value : '',
          showEmail: toggle ? toggle.getAttribute('aria-checked') === 'true' : false,
          socials: { ...this._socialValues },
        },
      }),
    );
  }

  render() {
    const title = this.getAttribute('title') || 'Personal info';
    const handle = this.getAttribute('handle') || '@alexsmith';
    const limit = Number.parseInt(this.getAttribute('bio-limit') || '750', 10) || 750;
    const bio = this.getAttribute('bio') || '';
    const showEmailLabel = this.getAttribute('show-email-label') || 'Display your account email';
    const showEmail = (this.getAttribute('default-show-email') || 'false') === 'true';
    const saveLabel = this.getAttribute('save-label') || 'Save changes';
    const cancelLabel = this.getAttribute('cancel-label') || 'Cancel';
    const country = this.getAttribute('default-country') || this._countries[0] || '';
    const city = this.getAttribute('default-city') || '';

    const countryOptions = this._countries
      .map((c) => `<option value="${escapeAttribute(c)}" ${c === country ? 'selected' : ''}>${escapeAttribute(c)}</option>`)
      .join('');

    const socialRows = this._socials
      .map(
        (s) => `
        <label class="mt-2 block first:mt-0" data-profile-edit-social="${escapeAttribute(s.id)}">
          <span class="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">${escapeAttribute(s.label)}</span>
          <input data-profile-edit-social-input="${escapeAttribute(s.id)}" type="text" value="${escapeAttribute(this._socialValues[s.id] ?? '')}" placeholder="${escapeAttribute(s.placeholder || `Your ${s.label}`)}" class="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder-zinc-500" />
        </label>`,
      )
      .join('');

    const socialsBlock = this._socials.length
      ? `<div data-profile-edit-socials class="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">${socialRows}</div>`
      : '';

    const savedLine = this._saved
      ? `<p data-profile-edit-saved role="status" class="mt-3 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Profile saved.</p>`
      : '';

    this.innerHTML = `
      <div data-profile-edit-form class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div class="flex items-center justify-between">
          <p data-profile-edit-title class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">${escapeAttribute(title)}</p>
          <span data-profile-edit-handle class="flex items-center gap-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">${escapeAttribute(handle)}<span aria-hidden="true" class="text-[10px]">✏️</span></span>
        </div>

        <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label class="block">
            <span class="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Country</span>
            <select data-profile-edit-country class="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">${countryOptions}</select>
          </label>
          <label class="block">
            <span class="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">City</span>
            <input data-profile-edit-city type="text" value="${escapeAttribute(city)}" placeholder="e.g. San Francisco" class="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder-zinc-500" />
          </label>
        </div>

        <label class="mt-2 block">
          <span class="flex items-center justify-between text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
            Bio
            <span data-profile-edit-bio-count class="tabular-nums text-zinc-400 dark:text-zinc-500">${bio.length}/${limit}</span>
          </span>
          <textarea data-profile-edit-bio rows="3" maxlength="${limit}" placeholder="Write a short bio about yourself…" class="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder-zinc-500">${escapeAttribute(bio)}</textarea>
        </label>

        <div class="mt-2 flex items-center gap-2">
          <button type="button" data-profile-edit-email-toggle role="switch" aria-checked="${showEmail}" class="relative h-4 w-7 rounded-full transition-colors ${showEmail ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700'}">
            <span class="${showEmail ? 'absolute left-3.5' : 'absolute left-0.5'} top-0.5 h-3 w-3 rounded-full bg-white transition-all"></span>
          </button>
          <span class="text-[11px] text-zinc-600 dark:text-zinc-300">${escapeAttribute(showEmailLabel)}</span>
        </div>

        ${socialsBlock}

        ${savedLine}

        <div class="mt-3 flex items-center justify-end gap-2">
          <button type="button" data-profile-edit-cancel class="rounded-md border border-zinc-200 px-3 py-1.5 text-[11px] font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">${escapeAttribute(cancelLabel)}</button>
          <button type="button" data-profile-edit-save class="rounded-md bg-zinc-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300">${escapeAttribute(saveLabel)}</button>
        </div>
      </div>`;
  }
}

export default ProfileEditFormElement;

if (!customElements.get('profile-edit-form')) {
  customElements.define('profile-edit-form', ProfileEditFormElement);
}
