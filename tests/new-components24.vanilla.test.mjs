import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const uiIconSource = readFileSync(join(root, 'vanilla/UiIcon.js'), 'utf8')
  .replace(/^export default uiIcon;\s*$/m, '')
  .replace(/^export function uiIcon/m, 'function uiIcon');

const stripComponent = (file, className) =>
  readFileSync(join(root, 'vanilla', file), 'utf8')
    .replace(/^import uiIcon from ['"]\.\/UiIcon\.js['"];\s*$/m, '')
    .replace(/^const escapeAttribute = [\s\S]*?;\r?\n/m, '')
    .replace(new RegExp(`^export default ${className};\\s*$`, 'm'), '')
    .replace(new RegExp(`^export class ${className}`, 'm'), `class ${className}`);

const otpSource = stripComponent('OtpInput.js', 'OtpInputElement');
const typeaheadSource = stripComponent('SearchTypeahead.js', 'SearchTypeaheadElement');
const tourSource = stripComponent('TourTooltip.js', 'TourTooltipElement');
const consentSource = stripComponent('CookieConsent.js', 'CookieConsentElement');
const drawerSource = stripComponent('SettingsSideDrawer.js', 'SettingsSideDrawerElement');

function mount(source, exportName, tag, attrs = {}) {
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
    'FormData',
    `${uiIconSource}\n${source}\nreturn ${exportName};`
  );
  factory(window.customElements, window.HTMLElement, window.CustomEvent, window.document, window.FormData);
  const el = window.document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  window.document.body.appendChild(el);
  return { el, window, dom };
}

const collect = (el, name) => {
  const seen = [];
  el.addEventListener(name, (event) => seen.push(event.detail ?? event));
  return seen;
};

test('OtpInput — cells, error state, events and paste', () => {
  const { el, window } = mount(otpSource, 'OtpInputElement', 'otp-input', {
    heading: 'Check your email for a code',
    subtext: "We've sent a code to samlee@content-mobbin.com",
    status: 'error',
    'error-text': 'Code is invalid',
    'resend-hint': "Can't find your code? Check your spam folder!",
  });
  const changes = collect(el, 'change');
  const completes = collect(el, 'complete');
  el.value = '12';

  assert.equal(el.querySelectorAll('[data-otp-cell]').length, 6, 'six cells');
  assert.ok(el.querySelector('[data-otp-cell="0"]').value === '1', 'first digit');
  assert.ok(el.innerHTML.includes('border-rose-400'), 'error cell tone');
  assert.ok(el.textContent.includes('Code is invalid'), 'error text');
  assert.ok(el.textContent.includes('Check your email for a code'), 'heading');
  assert.ok(el.textContent.includes('Continue'), 'continue label');
  assert.ok(el.textContent.includes('Resend code'), 'resend link');

  // typing into the third cell
  const cell2 = el.querySelectorAll('[data-otp-cell]')[2];
  cell2.value = '9';
  cell2.dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.equal(changes.length, 1, 'change fired');
  assert.equal(changes[0].value, '129', 'value detail');
  assert.equal(el.value, '129', 'property updated');

  // paste a full code
  const cell0 = el.querySelectorAll('[data-otp-cell]')[0];
  cell0.value = '999999';
  const pasteEvent = new window.Event('paste', { bubbles: true, cancelable: true });
  pasteEvent.clipboardData = { getData: () => '456789' };
  cell0.dispatchEvent(pasteEvent);
  assert.equal(el.value, '456789', 'paste committed');
  assert.equal(completes.length, 1, 'complete fired');
  assert.equal(completes[0].value, '456789', 'complete detail');
});

test('OtpInput — continue and resend events', () => {
  const { el } = mount(otpSource, 'OtpInputElement', 'otp-input', { 'resend-hint': 'Check spam' });
  const continues = collect(el, 'continue');
  const resends = collect(el, 'resend');
  el.querySelector('[data-otp-continue]').click();
  el.querySelector('[data-otp-resend]').click();
  assert.equal(continues.length, 1, 'continue fired');
  assert.equal(resends.length, 1, 'resend fired');
});

test('SearchTypeahead — highlight, badges, results and events', () => {
  const { el } = mount(typeaheadSource, 'SearchTypeaheadElement', 'search-typeahead', {
    query: 'web development',
    highlight: 'web development',
    'results-heading': 'Top results',
    'footer-hint': 'Not sure where to begin? Take our quiz →',
  });
  const selects = collect(el, 'select');
  const submits = collect(el, 'submit');
  el.suggestions = [
    { label: 'Web Development Domain', type: 'Course' },
    { label: 'game development', type: 'Article' },
  ];
  el.results = [{ title: 'Web Development for Beginners', badge: 'Doc' }];

  assert.equal(el.querySelectorAll('[data-typeahead-suggestion]').length, 2, 'two suggestions');
  assert.ok(el.innerHTML.includes('<mark'), 'highlight mark');
  assert.ok(el.innerHTML.includes('bg-yellow-200'), 'highlight tone');
  assert.ok(el.innerHTML.includes('Course'), 'type badge');
  assert.ok(el.textContent.includes('Top results'), 'results heading');
  assert.ok(el.innerHTML.includes('Doc'), 'result badge');
  assert.ok(el.textContent.includes('Not sure where to begin'), 'footer hint');
  assert.ok(el.querySelector('[data-typeahead-clear]'), 'clear button');

  el.querySelector('[data-typeahead-suggestion]').click();
  assert.equal(selects.length, 1, 'select fired');
  assert.equal(selects[0].label, 'Web Development Domain', 'select detail');

  const input = el.querySelector('[data-typeahead-input]');
  input.value = 'deck';
  input.dispatchEvent(new el.ownerDocument.defaultView.Event('input', { bubbles: true }));
  assert.equal(submits.length, 1, 'submit fired');
  assert.equal(submits[0].query, 'deck', 'submit detail');
});

test('SearchTypeahead — clear button and re-render on query change', () => {
  const { el } = mount(typeaheadSource, 'SearchTypeaheadElement', 'search-typeahead', { query: 'abc' });
  el.suggestions = [{ label: 'abc deeper' }];
  assert.ok(el.querySelector('[data-typeahead-clear]'), 'clear visible with query');
  el.setAttribute('query', '');
  assert.equal(el.querySelector('[data-typeahead-clear]'), null, 'clear hidden without query');
});

test('TourTooltip — counter, feedback, nav and dark theme', () => {
  const { el } = mount(tourSource, 'TourTooltipElement', 'tour-tooltip', {
    step: '2',
    'total-steps': '4',
    title: 'Navigate to Fixed Rate Contract Creation',
    body: 'Click on the People tab in the main navigation menu',
    feedback: '',
  });
  const prevs = collect(el, 'prev');
  const nexts = collect(el, 'next');
  const dismissals = collect(el, 'dismiss');
  const feedbacks = collect(el, 'feedback');

  assert.ok(el.textContent.includes('Step 2 of 4'), 'step counter');
  assert.ok(el.textContent.includes('Navigate to Fixed Rate Contract Creation'), 'title');
  assert.ok(el.textContent.includes('Was this helpful?'), 'feedback prompt');
  assert.ok(el.querySelector('[data-tour-feedback-up]'), 'thumbs up');
  assert.ok(el.querySelector('[data-tour-prev]'), 'prev button');
  assert.ok(el.textContent.includes('Next'), 'next label');

  el.querySelector('[data-tour-prev]').click();
  el.querySelector('[data-tour-next]').click();
  el.querySelector('[data-tour-dismiss]').click();
  el.querySelector('[data-tour-feedback-up]').click();
  assert.equal(prevs.length, 1, 'prev fired');
  assert.equal(nexts.length, 1, 'next fired');
  assert.equal(dismissals.length, 1, 'dismiss fired');
  assert.equal(feedbacks.length, 1, 'feedback fired');
  assert.equal(feedbacks[0].helpful, true, 'feedback detail');
});

test('TourTooltip — last step shows Finish tour and dark theme', () => {
  const last = mount(tourSource, 'TourTooltipElement', 'tour-tooltip', { step: '2', 'total-steps': '2' });
  assert.ok(last.el.textContent.includes('Finish tour'), 'finish label');
  assert.ok(last.el.innerHTML.includes('bg-white'), 'light surface');
  assert.ok(last.el.textContent.includes('2/2'), 'compact counter');
  const dark = mount(tourSource, 'TourTooltipElement', 'tour-tooltip', { step: '1', 'total-steps': '2', theme: 'dark' });
  assert.ok(dark.el.innerHTML.includes('bg-zinc-900'), 'dark surface');
  assert.ok(dark.el.textContent.includes('Step 1 of 2'), 'counter');
  assert.equal(dark.el.querySelector('[data-tour-prev]'), null, 'no prev on first step');
});

test('CookieConsent — categories, always active, cookie list and confirm events', () => {
  const { el } = mount(consentSource, 'CookieConsentElement', 'cookie-consent');
  const confirms = collect(el, 'confirm');
  el.categories = [
    { id: 'necessary', label: 'Necessary', alwaysActive: true, description: 'Core site functionality.' },
    { id: 'analytics', label: 'Analytics', description: 'Helps us improve.', cookies: ['_ga', '_gid'] },
    { id: 'marketing', label: 'Targeted Advertising' },
  ];

  assert.equal(el.querySelectorAll('[data-consent-category]').length, 3, 'three categories');
  assert.ok(el.textContent.includes('Always Active'), 'always active label');
  assert.ok(el.textContent.includes('_ga, _gid'), 'cookie list');
  assert.ok(el.textContent.includes('Accept All'), 'accept');
  assert.ok(el.textContent.includes('Reject All'), 'reject');
  assert.ok(el.textContent.includes('Privacy Policy'), 'policy link');
  assert.ok(el.innerHTML.includes('<details'), 'collapsible');
  assert.ok(el.querySelector('[data-consent-toggle]'), 'toggle glyph on optional');

  el.querySelector('[data-consent-accept]').click();
  assert.equal(confirms.length, 1, 'accept confirm');
  assert.deepEqual(confirms[0].accepted, ['necessary', 'analytics', 'marketing'], 'accept all ids');

  el.querySelector('[data-consent-reject]').click();
  assert.equal(confirms.length, 2, 'reject confirm');
  assert.deepEqual(confirms[1].accepted, ['necessary'], 'reject keeps essential');

  el.querySelector('[data-consent-save]').click();
  assert.equal(confirms.length, 3, 'save confirm');
  assert.deepEqual(confirms[2].accepted, ['necessary'], 'save keeps essential');
});

test('SettingsSideDrawer — tabs, rows, controls and footer events', () => {
  const { el } = mount(drawerSource, 'SettingsSideDrawerElement', 'settings-side-drawer', {
    open: '',
    title: 'Settings',
    'active-tab': 'general',
    'footer-primary': 'Deploy',
    'footer-secondary': 'Cancel',
  });
  assert.ok(el.querySelector('[data-side-drawer]'), 'overlay rendered with open attr');
  const closes = collect(el, 'close');
  const tabChanges = collect(el, 'tab-change');
  const toggles = collect(el, 'row-toggle');
  const actions = collect(el, 'row-action');
  const primaries = collect(el, 'footer-primary');
  el.tabs = [
    { id: 'general', label: 'Settings' },
    { id: 'requirements', label: 'Study requirements' },
  ];
  el.sections = [
    {
      title: 'Quick actions',
      rows: [
        { label: 'Move', description: 'Move this maze to a different project.', control: 'button', buttonLabel: 'Move', buttonTone: 'indigo' },
        { label: 'Delete', description: 'Permanently deletes this maze.', control: 'button', buttonLabel: 'Delete', buttonTone: 'danger' },
      ],
    },
    { title: 'Password protection', rows: [{ label: 'Require password', control: 'toggle', enabled: true }] },
    { title: 'Integrations', rows: [{ label: 'Sampling rate', control: 'select', value: '100%', options: ['50%', '100%'] }] },
  ];

  assert.equal(el.querySelectorAll('[data-drawer-tab]').length, 2, 'two tabs');
  assert.ok(el.innerHTML.includes('aria-selected="true"'), 'active tab');
  assert.ok(el.textContent.includes('Study requirements'), 'tab label');
  assert.ok(el.textContent.includes('Quick actions'), 'section title');
  assert.ok(el.textContent.includes('Move this maze to a different project.'), 'row description');
  assert.ok(el.innerHTML.includes('border-rose-300'), 'danger button tone');
  assert.ok(el.innerHTML.includes('role="switch"'), 'toggle switch');
  assert.ok(el.innerHTML.includes('aria-checked="true"'), 'toggle on');
  assert.ok(el.textContent.includes('Deploy'), 'footer primary');
  assert.ok(el.textContent.includes('Cancel'), 'footer secondary');
  assert.ok(el.querySelector('[data-drawer-overlay]'), 'overlay layer');
  assert.ok(el.innerHTML.includes('right-0'), 'right-anchored');

  el.querySelector('[data-drawer-close]').click();
  assert.equal(closes.length, 1, 'close fired');
  el.querySelectorAll('[data-drawer-tab]')[1].click();
  assert.equal(tabChanges.length, 1, 'tab-change fired');
  assert.equal(tabChanges[0].id, 'requirements', 'tab detail');
  assert.equal(el.getAttribute('active-tab'), 'requirements', 'attribute synced');
  el.querySelector('[data-row-toggle]').click();
  assert.equal(toggles.length, 1, 'row-toggle fired');
  assert.equal(toggles[0].label, 'Require password', 'toggle label detail');
  assert.equal(toggles[0].enabled, false, 'toggle enabled detail');
  el.querySelectorAll('[data-row-button]')[0].click();
  assert.equal(actions.length, 1, 'row-action fired');
  assert.equal(actions[0].label, 'Move', 'action label detail');
  el.querySelector('[data-drawer-primary]').click();
  assert.equal(primaries.length, 1, 'footer-primary fired');
});

test('SettingsSideDrawer — left side variant', () => {
  const { el } = mount(drawerSource, 'SettingsSideDrawerElement', 'settings-side-drawer', { side: 'left', open: '' });
  el.sections = [{ rows: [{ label: 'Enabled', control: 'toggle', enabled: true }] }];
  assert.ok(el.innerHTML.includes('left-0'), 'left anchored');
  assert.ok(el.innerHTML.includes('rounded-r-2xl'), 'rounded right corners');
});
