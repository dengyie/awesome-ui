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
    .replace(/^import uiIcon from ['"].\/UiIcon.js['"];\s*$/m, '')
    .replace(/^const escapeAttribute = [\s\S]*?;\r?\n/m, '')
    .replace(new RegExp(`^export default ${className};\\s*$`, 'm'), '')
    .replace(new RegExp(`^export class ${className}`, 'm'), `class ${className}`);

const authSource = stripComponent('AuthForm.js', 'AuthFormElement');
const settingsSource = stripComponent('SettingsPanel.js', 'SettingsPanelElement');
const onboardingSource = stripComponent('OnboardingChecklist.js', 'OnboardingChecklistElement');
const upgradeSource = stripComponent('UpgradePromptCard.js', 'UpgradePromptCardElement');

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

test('AuthForm — signin renders providers, submits payload, shows error', () => {
  const { el, window } = mount(authSource, 'AuthFormElement', 'auth-form', {
    providers: JSON.stringify([{ name: 'Google' }, { name: 'GitHub', icon: 'https://cdn.test/gh.svg' }]),
    error: 'Invalid credentials',
  });

  assert.ok(el.innerHTML.includes('Welcome back'), 'default signin title');
  assert.ok(el.innerHTML.includes('Continue with Google'), 'provider rendered with name');
  assert.ok(el.innerHTML.includes('G</span>'), 'letter fallback for provider without icon');
  assert.ok(el.innerHTML.includes('https://cdn.test/gh.svg'), 'provider image rendered');
  assert.ok(el.innerHTML.includes('Invalid credentials'), 'error row rendered');
  assert.ok(el.querySelector('[role="alert"]'), 'error uses role=alert');
  assert.ok(!el.querySelector('input[name="name"]'), 'no name field in signin mode');

  let providerEvent = null;
  el.addEventListener('provider', (event) => (providerEvent = event.detail));
  el.querySelectorAll('.auth-provider')[1].click();
  assert.equal(providerEvent.name, 'GitHub', 'provider event carries the provider');

  let payload = null;
  el.addEventListener('submit', (event) => (payload = event.detail));
  el.querySelector('input[name="email"]').value = 'ada@example.com';
  el.querySelector('input[name="password"]').value = 'secret123';
  el.querySelector('form').dispatchEvent(new window.Event('submit', { cancelable: true }));
  assert.deepEqual(payload, { email: 'ada@example.com', password: 'secret123' }, 'submit payload without name in signin');
});

test('AuthForm — signup mode adds name field and submit text', () => {
  const { el, window } = mount(authSource, 'AuthFormElement', 'auth-form', { mode: 'signup' });

  assert.ok(el.innerHTML.includes('Create your account'), 'signup title');
  assert.ok(el.querySelector('input[name="name"]'), 'name field present in signup');
  assert.ok(el.innerHTML.includes('Create account'), 'signup submit text');

  let payload = null;
  el.addEventListener('submit', (event) => (payload = event.detail));
  el.querySelector('input[name="name"]').value = 'Ada';
  el.querySelector('input[name="email"]').value = 'ada@example.com';
  el.querySelector('input[name="password"]').value = 'pw';
  el.querySelector('form').dispatchEvent(new window.Event('submit', { cancelable: true }));
  assert.deepEqual(payload, { name: 'Ada', email: 'ada@example.com', password: 'pw' }, 'signup payload includes name');
});

test('AuthForm — loading disables submit and renders spinner', () => {
  const { el } = mount(authSource, 'AuthFormElement', 'auth-form', { loading: 'true' });
  const submit = el.querySelector('.auth-submit');
  assert.ok(submit.hasAttribute('disabled'), 'submit disabled while loading');
  assert.ok(el.innerHTML.includes('animate-spin'), 'spinner rendered while loading');
});

test('AuthForm — host only observes the normalized submit event, not the raw DOM one', () => {
  const { el, window } = mount(authSource, 'AuthFormElement', 'auth-form');
  const seen = [];
  el.addEventListener('submit', (event) => seen.push(event.detail));

  el.querySelector('input[name="email"]').value = 'ada@example.com';
  el.querySelector('form').dispatchEvent(new window.Event('submit', { cancelable: true, bubbles: true }));

  assert.equal(seen.length, 1, 'exactly one submit event reaches the host');
  assert.equal(seen[0].email, 'ada@example.com', 'the event carries the payload detail');
});

test('SettingsPanel — switches sections, fires item action and save', () => {
  const sections = [
    {
      id: 'account',
      title: 'Account',
      icon: 'user',
      description: 'Profile and identity',
      items: [
        { id: 'email', label: 'Email', value: 'ada@example.com', actionText: 'Change' },
        { id: 'plan', label: 'Plan', description: 'Billing tier', value: 'Pro' },
      ],
    },
    { id: 'security', title: 'Security', icon: 'lock', items: [{ id: 'pw', label: 'Password', actionText: 'Reset' }] },
  ];
  const { el } = mount(settingsSource, 'SettingsPanelElement', 'settings-panel');
  el.sections = sections;

  assert.ok(el.innerHTML.includes('Profile and identity'), 'first section description rendered');
  assert.ok(el.innerHTML.includes('ada@example.com'), 'item value rendered');
  assert.equal(el.querySelectorAll('.settings-nav').length, 2, 'nav has one button per section');
  assert.equal(el.querySelector('.settings-nav').getAttribute('aria-current'), 'page', 'active nav item marked');

  let sectionEvent = null;
  el.addEventListener('section-change', (event) => (sectionEvent = event.detail));
  el.querySelectorAll('.settings-nav')[1].click();
  assert.equal(sectionEvent.id, 'security', 'section-change emitted');
  assert.ok(el.innerHTML.includes('Reset'), 'second section items rendered after switch');
  assert.ok(!el.innerHTML.includes('ada@example.com'), 'first section content replaced');

  let itemEvent = null;
  el.addEventListener('item-action', (event) => (itemEvent = event.detail));
  el.querySelector('[data-item="pw"]').click();
  assert.equal(itemEvent.sectionId, 'security', 'item-action carries section id');
  assert.equal(itemEvent.item.label, 'Password', 'item-action carries item');

  let saveEvent = null;
  el.addEventListener('save', (event) => (saveEvent = event.detail));
  el.querySelector('[data-save]').click();
  assert.equal(saveEvent.id, 'security', 'save emits active section id');
});

test('SettingsPanel — allow-save=false hides the footer save row', () => {
  const { el } = mount(settingsSource, 'SettingsPanelElement', 'settings-panel', { 'allow-save': 'false' });
  el.sections = [{ id: 'a', title: 'A', items: [{ id: 'x', label: 'X' }] }];
  assert.ok(!el.querySelector('[data-save]'), 'no save button when allow-save is false');
});

test('OnboardingChecklist — progress, strikethrough, toggle and action', () => {
  const tasks = [
    { id: 't1', title: 'Create workspace', done: true },
    { id: 't2', title: 'Invite a teammate', description: 'Up to 5 seats', done: false, actionText: 'Invite' },
    { id: 't3', title: 'Connect Slack', done: false },
  ];
  const { el } = mount(onboardingSource, 'OnboardingChecklistElement', 'onboarding-checklist', { title: 'Setup' });
  el.tasks = tasks;

  assert.ok(el.innerHTML.includes('Setup'), 'custom title rendered');
  assert.ok(el.innerHTML.includes('1/3'), 'done counter rendered');
  assert.ok(el.innerHTML.includes('33% complete'), 'percentage computed');
  assert.ok(el.innerHTML.includes('line-through'), 'completed task struck through');
  assert.ok(el.innerHTML.includes('Up to 5 seats'), 'description rendered');
  assert.ok(el.innerHTML.includes('Invite'), 'action text rendered for pending task');
  assert.ok(!el.innerHTML.includes('All set'), 'no celebration state yet');

  let toggleEvent = null;
  el.addEventListener('toggle', (event) => (toggleEvent = event.detail));
  el.querySelector('[data-toggle="t2"]').click();
  assert.equal(toggleEvent.id, 't2', 'toggle event carries the task');

  let actionEvent = null;
  el.addEventListener('action', (event) => (actionEvent = event.detail));
  el.querySelector('[data-action="t2"]').click();
  assert.equal(actionEvent.id, 't2', 'action event carries the task');
});

test('OnboardingChecklist — all done shows celebration state', () => {
  const { el } = mount(onboardingSource, 'OnboardingChecklistElement', 'onboarding-checklist');
  el.tasks = [
    { id: 'a', title: 'One', done: true },
    { id: 'b', title: 'Two', done: true },
  ];
  assert.ok(el.innerHTML.includes('2/2'), 'full progress');
  assert.ok(el.innerHTML.includes('All set'), 'celebration message shown');
  assert.ok(!el.innerHTML.includes('% complete'), 'percentage copy replaced');
});

test('UpgradePromptCard — percentage, tone thresholds, features and upgrade event', () => {
  const { el } = mount(upgradeSource, 'UpgradePromptCardElement', 'upgrade-prompt-card', {
    used: '750',
    limit: '1000',
    'plan-name': 'Starter',
    unit: 'credits',
    features: JSON.stringify(['Unlimited seats', 'Priority support']),
  });

  assert.ok(el.innerHTML.includes('Starter'), 'plan name rendered');
  assert.ok(el.innerHTML.includes('75%'), 'percentage rendered');
  assert.ok(el.innerHTML.includes('750 / 1,000 credits'), 'numeric usage formatted');
  assert.ok(el.innerHTML.includes('bg-amber-500'), '75% uses amber tone');
  assert.ok(el.innerHTML.includes('Unlimited seats'), 'features rendered');

  let upgraded = false;
  el.addEventListener('upgrade', () => (upgraded = true));
  el.querySelector('.upgrade-cta').click();
  assert.ok(upgraded, 'upgrade event dispatched');
});

test('UpgradePromptCard — thresholds clamp and switch tone', () => {
  const { el } = mount(upgradeSource, 'UpgradePromptCardElement', 'upgrade-prompt-card', { used: '1000', limit: '1000' });
  assert.ok(el.innerHTML.includes('bg-red-500'), '100% uses danger tone');
  assert.ok(el.innerHTML.includes('100%'), 'percentage capped at 100');

  const { el: low } = mount(upgradeSource, 'UpgradePromptCardElement', 'upgrade-prompt-card', { used: '10', limit: '1000' });
  assert.ok(low.innerHTML.includes('bg-emerald-500'), 'low usage uses emerald tone');

  const { el: over } = mount(upgradeSource, 'UpgradePromptCardElement', 'upgrade-prompt-card', {
    used: '5000',
    limit: '1000',
  });
  assert.ok(over.innerHTML.includes('100%'), 'overage clamped to 100%');
});

test('UpgradePromptCard — zero limit does not divide by zero', () => {
  const { el } = mount(upgradeSource, 'UpgradePromptCardElement', 'upgrade-prompt-card', { used: '0', limit: '0' });
  assert.ok(el.innerHTML.includes('0%'), 'safe fallback percentage');
  assert.ok(!el.innerHTML.includes('NaN'), 'no NaN rendered');
});
