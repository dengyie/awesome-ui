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

const profileSource = stripComponent('ProfileHeader.js', 'ProfileHeaderElement');
const billingSource = stripComponent('BillingPanel.js', 'BillingPanelElement');
const stepSource = stripComponent('StepSlider.js', 'StepSliderElement');
const inboxSource = stripComponent('InboxList.js', 'InboxListElement');
const changelogSource = stripComponent('ChangelogFeed.js', 'ChangelogFeedElement');

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

test('ProfileHeader — identity, stats, tabs and action events', () => {
  const { el } = mount(profileSource, 'ProfileHeaderElement', 'profile-header', {
    name: 'Ada Lovelace',
    handle: 'ada',
    headline: 'Analytical engines',
    'status-text': 'Available for work',
    tabs: 'Overview,Projects,Activity',
    'active-tab': 'Projects',
  });
  el.stats = [
    { label: 'followers', value: '5' },
    { label: 'following', value: '4' },
  ];
  el.actions = [{ label: 'Edit profile', variant: 'primary' }];
  const actions = collect(el, 'action');
  const tabChanges = collect(el, 'tab-change');

  assert.ok(el.textContent.includes('Ada Lovelace'), 'name');
  assert.ok(el.textContent.includes('@ada'), 'handle');
  assert.ok(el.textContent.includes('Analytical engines'), 'headline');
  assert.ok(el.textContent.includes('Available for work'), 'status');
  assert.ok(el.textContent.includes('followers'), 'stats');
  assert.ok(el.innerHTML.includes('bg-emerald-500'), 'ok dot');
  assert.equal(el.querySelectorAll('[aria-current="page"]').length, 1, 'one active tab');

  el.querySelector('[data-action-label]').click();
  assert.equal(actions.length, 1, 'action fired');
  assert.equal(actions[0].label, 'Edit profile', 'action label detail');

  el.querySelector('[data-tab-label="Activity"]').click();
  assert.equal(tabChanges.length, 1, 'tab-change fired');
  assert.equal(tabChanges[0].tab, 'Activity', 'tab detail');
  assert.equal(el.querySelectorAll('[aria-current="page"]')[0].getAttribute('data-tab-label'), 'Activity', 'active tab moved');
});

test('ProfileHeader — initials fallback without avatar', () => {
  const { el } = mount(profileSource, 'ProfileHeaderElement', 'profile-header', { name: 'Grace Hopper' });
  assert.ok(el.textContent.includes('GH'), 'initials computed from name');
  assert.equal(el.querySelector('img'), null, 'no img without avatar-url');
});

test('BillingPanel — features, line items and period toggle', () => {
  const { el } = mount(billingSource, 'BillingPanelElement', 'billing-panel', {
    'plan-name': 'Scale',
    price: '$207',
    'price-suffix': 'Per month',
    'cta-label': 'Confirm and upgrade',
    features: 'No platform fees,Priority support,5 admins',
    'line-items': JSON.stringify([
      { label: 'Subtotal', amount: '$207.00' },
      { label: 'Total', amount: '$238.05', emphasized: true },
    ]),
    note: 'Card charged at period end.',
  });
  const periodChanges = collect(el, 'period-change');
  const ctas = collect(el, 'cta');

  assert.ok(el.textContent.includes('Scale'), 'plan');
  assert.ok(el.textContent.includes('No platform fees'), 'feature');
  assert.ok(el.textContent.includes('$238.05'), 'total');
  assert.ok(el.textContent.includes('Card charged at period end.'), 'note');
  assert.equal(el.querySelectorAll('[data-period]').length, 2, 'two period buttons');

  el.querySelector('[data-period="annual"]').click();
  assert.equal(periodChanges.length, 1, 'period-change fired');
  assert.equal(periodChanges[0].period, 'annual', 'period detail');
  assert.equal(el.querySelector('[data-period="annual"]').getAttribute('aria-pressed'), 'true', 'annual now pressed');

  el.querySelector('[data-billing-cta]').click();
  assert.equal(ctas.length, 1, 'cta fired');
});

test('BillingPanel — invalid line-items JSON falls back to none', () => {
  const { el } = mount(billingSource, 'BillingPanelElement', 'billing-panel', {
    'plan-name': 'P',
    price: '$1',
    'cta-label': 'Go',
    'line-items': '{oops',
  });
  assert.equal(el.querySelector('dl'), null, 'no dl for broken JSON');
});

test('StepSlider — stops, change events and aria values', () => {
  const { el } = mount(stepSource, 'StepSliderElement', 'step-slider', {
    steps: '+0k,+1k,+5k,+10k',
    value: '1',
    'highlight-from': '2',
    label: 'Workflow credits',
  });
  const changes = collect(el, 'change');
  const track = el.querySelector('[role="slider"]');

  assert.equal(track.getAttribute('aria-valuenow'), '1', 'value now');
  assert.equal(track.getAttribute('aria-valuetext'), '+1k', 'value text');
  assert.ok(/width:33\.3\d*%/.test(el.innerHTML), 'fill width');

  el.querySelector('[data-step-index="3"]').click();
  assert.equal(changes.length, 1, 'change fired');
  assert.equal(changes[0].index, 3, 'index detail');
  assert.equal(changes[0].step, '+10k', 'step detail');
  assert.equal(el.value, 3, 'value property synced');
});

test('StepSlider — keyboard navigation', () => {
  const { el, window } = mount(stepSource, 'StepSliderElement', 'step-slider', {
    steps: 'A,B,C',
    value: '1',
  });
  const changes = collect(el, 'change');
  el.querySelector('[role="slider"]').dispatchEvent(
    new window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
  );
  assert.equal(changes.length, 1, 'ArrowRight moved');
  assert.equal(el.value, 2, 'value advanced');

  el.querySelector('[role="slider"]').dispatchEvent(
    new window.KeyboardEvent('keydown', { key: 'Home', bubbles: true })
  );
  assert.equal(el.value, 0, 'Home jumped to first');
  assert.equal(changes.length, 2, 'second change fired');
});

test('InboxList — rows, unread dots, tags and select event', () => {
  const { el } = mount(inboxSource, 'InboxListElement', 'inbox-list');
  const selects = collect(el, 'select');
  el.messages = [
    { id: 1, sender: 'GoDaddy Auctions', subject: 'Request for Refund', snippet: 'Charged without placing a bid', dateLabel: 'AUG 26', unread: true },
    { id: 2, sender: 'Roger de Guzman', tag: 'pitch', subject: 'Do more research', dateLabel: 'AUG 21' },
  ];

  assert.equal(el.querySelectorAll('[data-inbox-index]').length, 2, 'two rows');
  assert.ok(el.textContent.includes('GoDaddy Auctions'), 'sender');
  assert.ok(el.textContent.includes('pitch'), 'tag');
  assert.ok(el.innerHTML.includes('aria-label="Unread"'), 'unread dot');
  assert.ok(el.innerHTML.includes('bg-rose-100'), 'default tag tone');

  el.querySelectorAll('[data-inbox-index]')[1].click();
  assert.equal(selects.length, 1, 'select fired');
  assert.equal(selects[0].message.id, 2, 'message detail');
});

test('InboxList — active-id highlights row', () => {
  const { el } = mount(inboxSource, 'InboxListElement', 'inbox-list', { 'active-id': '2' });
  el.messages = [
    { id: 1, sender: 'A', subject: 'S1', dateLabel: 'JAN 1' },
    { id: 2, sender: 'B', subject: 'S2', dateLabel: 'JAN 2' },
  ];
  assert.ok(el.innerHTML.includes('bg-indigo-50/70'), 'active row highlighted');
});

test('InboxList — empty state text', () => {
  const { el } = mount(inboxSource, 'InboxListElement', 'inbox-list', { 'empty-text': 'All caught up' });
  assert.ok(el.textContent.includes('All caught up'), 'empty text');
});

test('ChangelogFeed — badges, select and footer-click events', () => {
  const { el } = mount(changelogSource, 'ChangelogFeedElement', 'changelog-feed', {
    title: 'Latest updates',
    'footer-link': 'Superhuman updates',
    selectable: '',
  });
  const selects = collect(el, 'select');
  const footerClicks = collect(el, 'footer-click');
  el.entries = [
    { id: 1, badge: 'new', badgeTone: 'rose', title: 'Ask AI upgrade', detail: '3M words a year.' },
    { id: 2, badge: 'new', badgeTone: 'emerald', title: 'Auto Archive' },
  ];

  assert.ok(el.textContent.includes('Ask AI upgrade'), 'entry title');
  assert.ok(el.textContent.includes('3M words a year.'), 'detail');
  assert.ok(el.innerHTML.includes('bg-rose-100'), 'rose badge');
  assert.ok(el.innerHTML.includes('bg-emerald-100'), 'emerald badge');
  assert.ok(el.textContent.includes('Superhuman updates'), 'footer link');

  el.querySelectorAll('[data-entry-index]')[0].click();
  assert.equal(selects.length, 1, 'select fired');
  assert.equal(selects[0].entry.id, 1, 'entry detail');

  el.querySelector('[data-footer-link]').click();
  assert.equal(footerClicks.length, 1, 'footer-click fired');
});

test('ChangelogFeed — empty state and default title', () => {
  const { el } = mount(changelogSource, 'ChangelogFeedElement', 'changelog-feed');
  assert.ok(el.textContent.includes('Latest updates'), 'default title');
  assert.ok(el.textContent.includes('No updates yet'), 'default empty text');
});
