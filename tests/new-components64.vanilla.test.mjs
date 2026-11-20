/**
 * v3.10.0 batch — vanilla behavior tests (jsdom)
 * ProfileEditForm, AvatarCropDialog, FollowSuggestionsCard.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const stripComponent = (file, className) =>
  readFileSync(join(root, 'vanilla', file), 'utf8')
    .replace(/^import uiIcon from ['"].\/UiIcon.js['"];\s*$/m, '')
    .replace(/^const escapeAttribute = [\s\S]*?;\r?\n/m, '')
    .replace(new RegExp(`^export default ${className};\\s*$`, 'm'), '')
    .replace(new RegExp(`^export class ${className}`, 'm'), `class ${className}`);

const profileSource = stripComponent('ProfileEditForm.js', 'ProfileEditFormElement');
const cropSource = stripComponent('AvatarCropDialog.js', 'AvatarCropDialogElement');
const followSource = stripComponent('FollowSuggestionsCard.js', 'FollowSuggestionsCardElement');

function mount(source, className, tag, attrs = {}) {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'https://localhost/',
    pretendToBeVisual: true,
  });
  const { window } = dom;
  const factory = new Function(
    'customElements',
    'HTMLElement',
    'CustomEvent',
    'document',
    `const escapeAttribute = (value) =>
      String(value).replace(/[&<>'"]/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      }[char]));
    ${source}\nreturn ${className};`,
  );
  const Klass = factory(window.customElements, window.HTMLElement, window.CustomEvent, window.document);
  if (!window.customElements.get(tag)) {
    window.customElements.define(tag, Klass);
  }
  const el = new Klass();
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  window.document.body.appendChild(el);
  const events = [];
  el.dispatchEvent = ((orig) => (evt) => { events.push(evt); return orig.call(el, evt); })(el.dispatchEvent.bind(el));
  return { el, events, window };
}

const click = (el, node) =>
  node.dispatchEvent(new el.ownerDocument.defaultView.MouseEvent('click', { bubbles: true }));

const input = (el, node) =>
  node.dispatchEvent(new el.ownerDocument.defaultView.Event('input', { bubbles: true }));

// ---------- ProfileEditForm ----------

test('vanilla — ProfileEditForm fields, socials and defaults', () => {
  const { el } = mount(profileSource, 'ProfileEditFormElement', 'profile-edit-form', {
    handle: '@alexsmith',
    'default-city': 'Menlo Park',
  });
  el.socials = [
    { id: 'instagram', label: 'Instagram', placeholder: '@Username' },
    { id: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com' },
  ];
  assert.ok(el.querySelector('[data-profile-edit-form]'));
  assert.equal(el.querySelector('[data-profile-edit-title]').textContent, 'Personal info');
  assert.equal(el.querySelector('[data-profile-edit-handle]').textContent.includes('@alexsmith'), true);
  assert.equal(el.querySelector('[data-profile-edit-city]').value, 'Menlo Park');
  assert.equal(el.querySelector('[data-profile-edit-bio-count]').textContent, '0/750');
  assert.ok(el.querySelector('[data-profile-edit-email-toggle]'));
  assert.ok(el.querySelector('[data-profile-edit-social-input="linkedin"]'));
  assert.ok(el.querySelector('[data-profile-edit-save]'));
});

test('vanilla — ProfileEditForm bio counter updates on input', () => {
  const { el } = mount(profileSource, 'ProfileEditFormElement', 'profile-edit-form');
  const bio = el.querySelector('[data-profile-edit-bio]');
  bio.value = 'Hello world';
  input(el, bio);
  assert.equal(el.querySelector('[data-profile-edit-bio-count]').textContent, '11/750');
});

test('vanilla — ProfileEditForm toggle flips aria-checked', () => {
  const { el } = mount(profileSource, 'ProfileEditFormElement', 'profile-edit-form');
  const toggle = el.querySelector('[data-profile-edit-email-toggle]');
  assert.equal(toggle.getAttribute('aria-checked'), 'false');
  click(el, toggle);
  assert.equal(toggle.getAttribute('aria-checked'), 'true');
  click(el, toggle);
  assert.equal(toggle.getAttribute('aria-checked'), 'false');
});

test('vanilla — ProfileEditForm save emits profile-save and shows saved', () => {
  const { el, events } = mount(profileSource, 'ProfileEditFormElement', 'profile-edit-form', {
    handle: '@base44',
  });
  el.socials = [{ id: 'x', label: 'X (Twitter)', value: '@alex' }];
  el.render();
  const bio = el.querySelector('[data-profile-edit-bio]');
  bio.value = 'Builder.';
  input(el, bio);
  click(el, el.querySelector('[data-profile-edit-save]'));
  const saveEvt = events.find((e) => e.type === 'profile-save');
  assert.ok(saveEvt, 'profile-save fired');
  assert.equal(saveEvt.detail.handle, '@base44');
  assert.equal(saveEvt.detail.bio, 'Builder.');
  assert.equal(saveEvt.detail.socials.x, '@alex');
  assert.equal(saveEvt.detail.showEmail, false);
  assert.ok(el.querySelector('[data-profile-edit-saved]'));
});

test('vanilla — ProfileEditForm cancel emits profile-cancel', () => {
  const { el, events } = mount(profileSource, 'ProfileEditFormElement', 'profile-edit-form');
  click(el, el.querySelector('[data-profile-edit-cancel]'));
  assert.ok(events.find((e) => e.type === 'profile-cancel'));
});

test('vanilla — ProfileEditForm escapes html in handle', () => {
  const { el } = mount(profileSource, 'ProfileEditFormElement', 'profile-edit-form', {
    handle: '<b>bad</b>',
  });
  assert.equal(el.querySelector('b'), null);
  assert.ok(el.querySelector('[data-profile-edit-handle]').innerHTML.includes('&lt;b&gt;'));
});

// ---------- AvatarCropDialog ----------

test('vanilla — AvatarCropDialog closed renders trigger only', () => {
  const { el } = mount(cropSource, 'AvatarCropDialogElement', 'avatar-crop-dialog', { title: 'Edit avatar' });
  assert.ok(el.querySelector('[data-avatar-crop-dialog]'));
  assert.ok(el.querySelector('[data-avatar-crop-open]'));
  assert.equal(el.querySelector('[data-avatar-crop-panel]'), null);
});

test('vanilla — AvatarCropDialog defaultOpen renders preview and zoom', () => {
  const { el } = mount(cropSource, 'AvatarCropDialogElement', 'avatar-crop-dialog', {
    'default-open': '',
    title: 'Alex Smith',
    initials: 'AS',
    'default-zoom': '60',
  });
  assert.ok(el.querySelector('[data-avatar-crop-panel]'));
  assert.ok(el.querySelector('[data-avatar-crop-preview]'));
  assert.ok(el.textContent.includes('For best results'));
  assert.equal(el.querySelector('[data-avatar-crop-zoom]').value, '60');
  assert.ok(el.querySelector('[data-avatar-crop-zoom-out]'));
  assert.ok(el.querySelector('[data-avatar-crop-zoom-in]'));
  const inner = el.querySelector('[data-avatar-crop-inner]');
  assert.ok(inner.textContent.includes('AS'));
});

test('vanilla — AvatarCropDialog zoom slider updates preview scale', () => {
  const { el } = mount(cropSource, 'AvatarCropDialogElement', 'avatar-crop-dialog', { 'default-open': '' });
  const slider = el.querySelector('[data-avatar-crop-zoom]');
  slider.value = '100';
  input(el, slider);
  assert.ok(el.querySelector('[data-avatar-crop-inner]').getAttribute('style').includes('scale(1.40)'));
});

test('vanilla — AvatarCropDialog steppers clamp at max', () => {
  const { el } = mount(cropSource, 'AvatarCropDialogElement', 'avatar-crop-dialog', {
    'default-open': '',
    'default-zoom': '95',
  });
  click(el, el.querySelector('[data-avatar-crop-zoom-in]'));
  assert.equal(el.querySelector('[data-avatar-crop-zoom]').value, '100');
  click(el, el.querySelector('[data-avatar-crop-zoom-in]'));
  assert.equal(el.querySelector('[data-avatar-crop-zoom]').value, '100');
  click(el, el.querySelector('[data-avatar-crop-zoom-out]'));
  assert.equal(el.querySelector('[data-avatar-crop-zoom]').value, '90');
});

test('vanilla — AvatarCropDialog confirm emits and swaps to saved state', () => {
  const { el, events } = mount(cropSource, 'AvatarCropDialogElement', 'avatar-crop-dialog', { 'default-open': '' });
  click(el, el.querySelector('[data-avatar-crop-confirm]'));
  const confirmEvt = events.find((e) => e.type === 'avatar-crop-confirm');
  assert.ok(confirmEvt);
  assert.equal(confirmEvt.detail.zoom, 50);
  assert.ok(el.querySelector('[data-avatar-crop-saved]'));
  assert.ok(el.textContent.includes('Avatar updated'));
  click(el, el.querySelector('[data-avatar-crop-done]'));
  assert.equal(el.querySelector('[data-avatar-crop-panel]'), null);
});

test('vanilla — AvatarCropDialog cancel emits and closes', () => {
  const { el, events } = mount(cropSource, 'AvatarCropDialogElement', 'avatar-crop-dialog', { 'default-open': '' });
  click(el, el.querySelector('[data-avatar-crop-cancel]'));
  assert.ok(events.find((e) => e.type === 'avatar-crop-cancel'));
  assert.equal(el.querySelector('[data-avatar-crop-panel]'), null);
});

test('vanilla — AvatarCropDialog escapes title', () => {
  const { el } = mount(cropSource, 'AvatarCropDialogElement', 'avatar-crop-dialog', {
    'default-open': '',
    title: '<i>x</i>',
  });
  assert.equal(el.querySelector('i'), null);
  assert.ok(el.querySelector('[data-avatar-crop-title]').innerHTML.includes('&lt;i&gt;'));
});

// ---------- FollowSuggestionsCard ----------

const PEOPLE = [
  { id: 'jimmy', name: 'Jimmy Darts' },
  { id: 'sb', name: 'SB Mowing', handle: '@sbmowing' },
  { id: 'pattie', name: 'Pattie Gon', initials: 'PG' },
];

test('vanilla — FollowSuggestionsCard renders suggestion cards', () => {
  const { el } = mount(followSource, 'FollowSuggestionsCardElement', 'follow-suggestions-card');
  el.suggestions = PEOPLE;
  assert.ok(el.querySelector('[data-follow-suggestions]'));
  assert.ok(el.querySelector('[data-follow-suggestions-card="jimmy"]'));
  assert.ok(el.querySelector('[data-follow-suggestions-card="sb"]'));
  assert.ok(el.textContent.includes('@sbmowing'));
  assert.ok(el.querySelector('[data-follow-suggestions-follow="jimmy"]'));
  assert.ok(el.querySelector('[data-follow-suggestions-dismiss="pattie"]'));
  assert.ok(el.textContent.includes('PG'));
});

test('vanilla — FollowSuggestionsCard follow toggles to Following', () => {
  const { el } = mount(followSource, 'FollowSuggestionsCardElement', 'follow-suggestions-card');
  el.suggestions = PEOPLE;
  const followBtn = el.querySelector('[data-follow-suggestions-follow="jimmy"]');
  assert.equal(followBtn.textContent, 'Follow');
  click(el, followBtn);
  const after = el.querySelector('[data-follow-suggestions-follow="jimmy"]');
  assert.equal(after.textContent, 'Following');
  assert.equal(after.getAttribute('aria-pressed'), 'true');
});

test('vanilla — FollowSuggestionsCard follow/dismiss emit events', () => {
  const { el, events } = mount(followSource, 'FollowSuggestionsCardElement', 'follow-suggestions-card');
  el.suggestions = PEOPLE;
  click(el, el.querySelector('[data-follow-suggestions-follow="sb"]'));
  click(el, el.querySelector('[data-follow-suggestions-dismiss="pattie"]'));
  const types = events.map((e) => e.type);
  assert.deepEqual(types, ['follow-suggest-follow', 'follow-suggest-dismiss']);
  assert.equal(events[0].detail.id, 'sb');
  assert.equal(events[1].detail.id, 'pattie');
  assert.equal(el.querySelector('[data-follow-suggestions-card="pattie"]'), null);
});

test('vanilla — FollowSuggestionsCard empty state when all dismissed', () => {
  const { el } = mount(followSource, 'FollowSuggestionsCardElement', 'follow-suggestions-card');
  el.suggestions = [{ id: 'a', name: 'A Person' }];
  click(el, el.querySelector('[data-follow-suggestions-dismiss="a"]'));
  assert.ok(el.querySelector('[data-follow-suggestions-empty]'));
  assert.ok(el.textContent.includes('No more suggestions'));
});

test('vanilla — FollowSuggestionsCard collapse toggle hides grid', () => {
  const { el } = mount(followSource, 'FollowSuggestionsCardElement', 'follow-suggestions-card');
  el.suggestions = PEOPLE;
  click(el, el.querySelector('[data-follow-suggestions-toggle]'));
  assert.equal(el.querySelector('[data-follow-suggestions-grid]'), null);
  assert.equal(el.querySelector('[data-follow-suggestions-toggle]').getAttribute('aria-expanded'), 'false');
  click(el, el.querySelector('[data-follow-suggestions-toggle]'));
  assert.ok(el.querySelector('[data-follow-suggestions-grid]'));
});

test('vanilla — FollowSuggestionsCard escapes html in names', () => {
  const { el } = mount(followSource, 'FollowSuggestionsCardElement', 'follow-suggestions-card');
  el.suggestions = [{ id: 'x', name: '<em>Bad</em>' }];
  assert.equal(el.querySelector('em'), null);
  assert.ok(el.querySelector('[data-follow-suggestions-card="x"]').innerHTML.includes('&lt;em&gt;'));
});
