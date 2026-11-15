/**
 * Vanilla jsdom tests for the v1.31.0 batch
 * (PlanComparisonTable, UpgradeCheckoutPanel, TrialBanner, MembershipTierGrid, AddonPicker).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
const { window } = dom;

const stripComponent = (file, className) =>
  readFileSync(join(root, 'vanilla', file), 'utf8')
    .replace(new RegExp(`^export default ${className};\\s*$`, 'm'), '')
    .replace(new RegExp(`^export class ${className}`, 'm'), `class ${className}`);

const loadElement = (file, className) => {
  const src = stripComponent(file, className);
  const factory = new Function(
    'customElements',
    'HTMLElement',
    'CustomEvent',
    'document',
    'MutationObserver',
    `${src}\nreturn ${className};`
  );
  return factory(window.customElements, window.HTMLElement, window.CustomEvent, window.document, window.MutationObserver);
};

const PLANS = [
  { id: 'free', name: 'Free' },
  { id: 'pro', name: 'Pro', highlighted: true },
  { id: 'ent', name: 'Enterprise' },
];

const SECTIONS = [
  {
    id: 'features',
    title: 'Features',
    rows: [
      { id: 'r1', label: 'Issues and cycles', values: [{ value: true }, { value: true }, { value: true }] },
      { id: 'r2', label: 'SSO', values: [{ value: false }, { value: 'G Suite' }, { value: 'G Suite + SAML' }] },
    ],
  },
];

test('PlanComparisonTable — sections, notes and CTA event', () => {
  const El = loadElement('PlanComparisonTable.js', 'PlanComparisonTableElement');
  const el = window.document.createElement('plan-comparison-table');
  window.document.body.appendChild(el);
  el.plans = PLANS;
  el.sections = SECTIONS;
  el.setAttribute('cta-text', 'Choose plan');
  const host = el.querySelector('[data-plan-comparison]');
  assert.ok(host, 'host hook');
  assert.ok(el.querySelector('[data-comparison-section="features"]'), 'section header');
  assert.ok(el.querySelector('[data-comparison-row="r2"]'), 'row');
  const notes = Array.from(el.querySelectorAll('[data-comparison-note]')).map((n) => n.textContent);
  assert.ok(notes.some((t) => t.includes('G Suite + SAML')), 'note text');
  assert.ok(el.querySelectorAll('[data-comparison-check]').length >= 4, 'checks');
  assert.ok(el.querySelector('[data-comparison-empty]'), 'empty cell');

  let selected = null;
  el.addEventListener('select', (e) => { selected = e.detail.planId; });
  el.querySelector('[data-comparison-cta="pro"]').click();
  assert.equal(selected, 'pro', 'select event with planId');
  window.document.body.removeChild(el);
});

test('UpgradeCheckoutPanel — seats stepper, period switch, confirm', () => {
  const El = loadElement('UpgradeCheckoutPanel.js', 'UpgradeCheckoutPanelElement');
  const el = window.document.createElement('upgrade-checkout-panel');
  window.document.body.appendChild(el);
  el.setAttribute('seats', '5');
  el.setAttribute('billing-period', 'annual');
  el.lineItems = [
    { id: 'base', label: '5 users x $6.75 x 12 months', amount: '$465.00 + tax', strikethrough: true },
    { id: 'disc', label: '13% Annual Discount', amount: '$405.00 + tax' },
  ];
  el.setAttribute('total', '$405.00 + tax');
  el.setAttribute('discount', '-$60.00');

  assert.ok(el.querySelector('[data-upgrade-checkout]'), 'host hook');
  assert.ok(el.querySelector('[data-checkout-seat-count]'), 'seat count');
  assert.equal(el.querySelector('[data-checkout-seat-count]').textContent.trim(), '5', 'seat value');
  assert.ok(el.querySelector('[data-checkout-period="annual"]'), 'annual button');
  assert.ok(el.querySelector('[data-checkout-total]'), 'total');
  assert.ok(el.querySelector('[data-checkout-discount]'), 'discount');
  assert.ok(el.textContent.includes('line-through') === false && el.innerHTML.includes('line-through'), 'strikethrough class');

  let periodEvent = null;
  el.addEventListener('billing-period-change', (e) => { periodEvent = e.detail.period; });
  el.querySelector('[data-checkout-period="monthly"]').click();
  assert.equal(periodEvent, 'monthly', 'period event');
  assert.equal(el.getAttribute('billing-period'), 'monthly', 'attribute updated');

  let seatsEvent = null;
  el.addEventListener('seats-change', (e) => { seatsEvent = e.detail.seats; });
  el.setAttribute('billing-period', 'annual'); // reset for determinism
  el.querySelector('[data-checkout-seat-plus]').click();
  assert.equal(seatsEvent, 6, 'seats up event');
  assert.equal(el.querySelector('[data-checkout-seat-count]').textContent.trim(), '6', 'seat incremented');
  el.querySelector('[data-checkout-seat-minus]').click();
  el.querySelector('[data-checkout-seat-minus]').click();
  assert.equal(el.querySelector('[data-checkout-seat-count]').textContent.trim(), '4', 'seat decremented');

  let confirmed = false;
  el.addEventListener('confirm', () => { confirmed = true; });
  el.querySelector('[data-checkout-confirm]').click();
  assert.ok(confirmed, 'confirm event');
  window.document.body.removeChild(el);
});

test('TrialBanner — days pill, cta and dismiss', () => {
  const El = loadElement('TrialBanner.js', 'TrialBannerElement');
  const el = window.document.createElement('trial-banner');
  el.setAttribute('days-left', '11');
  el.setAttribute('plan-name', 'Scale');
  el.setAttribute('cta-text', 'Upgrade to Unlock');
  el.setAttribute('dismissible', '');
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-trial-banner]'), 'host hook');
  assert.ok(el.querySelector('[data-trial-days]').textContent.includes('11 days left'), 'days text');
  assert.ok(el.querySelector('[data-trial-message]').textContent.includes('Scale'), 'default message mentions plan');
  assert.ok(el.querySelector('[data-trial-dismiss]'), 'dismiss button');

  let ctaFired = false;
  let dismissed = false;
  el.addEventListener('cta', () => { ctaFired = true; });
  el.addEventListener('dismiss', () => { dismissed = true; });
  el.querySelector('[data-trial-cta]').click();
  assert.ok(ctaFired, 'cta event');
  el.querySelector('[data-trial-dismiss]').click();
  assert.ok(dismissed, 'dismiss event');
  assert.equal(el.querySelector('[data-trial-banner]'), null, 'banner hidden after dismiss');
  el.show();
  assert.ok(el.querySelector('[data-trial-banner]'), 'show() restores banner');
  window.document.body.removeChild(el);
});

test('MembershipTierGrid — tiers, limited stock and select event', () => {
  const El = loadElement('MembershipTierGrid.js', 'MembershipTierGridElement');
  const el = window.document.createElement('membership-tier-grid');
  window.document.body.appendChild(el);
  el.tiers = [
    { id: 'spark', name: 'Spark', price: '$2.50', limited: 10, perks: ['Ad-free content', 'General support'] },
    { id: 'freedom', name: 'Freedom', price: '$11.50', highlighted: true, badge: 'Best value', ctaText: 'Start 7-day free trial' },
  ];

  assert.ok(el.querySelector('[data-membership-grid]'), 'host hook');
  assert.ok(el.querySelector('[data-membership-title]'), 'title');
  assert.ok(el.querySelector('[data-membership-tier="spark"]'), 'tier hook');
  assert.ok(el.querySelector('[data-membership-price]').textContent.includes('$2.50'), 'price');
  assert.ok(el.querySelector('[data-membership-limited]').textContent.includes('Limited (10 remaining)'), 'limited');
  assert.ok(el.querySelectorAll('[data-membership-perks] li').length === 2, 'perk rows');
  assert.ok(el.textContent.includes('Best value'), 'badge');

  let selected = null;
  el.addEventListener('select', (e) => { selected = e.detail.tier; });
  el.querySelector('[data-membership-cta="freedom"]').click();
  assert.ok(selected && selected.id === 'freedom', 'select event with tier object');
  window.document.body.removeChild(el);
});

test('AddonPicker — toggle rows and change event', () => {
  const El = loadElement('AddonPicker.js', 'AddonPickerElement');
  const el = window.document.createElement('addon-picker');
  window.document.body.appendChild(el);
  el.options = [
    { id: 'doc', label: 'Document signing', price: '+$600 / year' },
    { id: 'sso', label: 'SSO / SAML support', contactInstead: true },
  ];
  el.setAttribute('total-text', '$3600');

  assert.ok(el.querySelector('[data-addon-picker]'), 'host hook');
  assert.ok(el.querySelector('[data-addon-row="doc"]'), 'row hook');
  assert.ok(el.querySelector('[data-addon-price]').textContent.includes('+$600'), 'price');
  assert.ok(el.querySelector('[data-addon-contact]'), 'contact link');
  assert.ok(el.querySelector('[data-addon-total]').textContent.includes('$3600'), 'total');
  assert.equal(el.querySelector('[data-addon-row="doc"]').getAttribute('aria-checked'), 'false', 'unchecked initially');

  let changed = null;
  el.addEventListener('change', (e) => { changed = e.detail.selectedIds; });
  el.querySelector('[data-addon-row="doc"]').click();
  assert.ok(el.querySelector('[data-addon-row="doc"]').getAttribute('aria-checked') === 'true', 'checked after click');
  assert.deepEqual(changed, ['doc'], 'change event payload');
  el.querySelector('[data-addon-row="doc"]').click();
  assert.deepEqual(el.selectedIds, [], 'deselected');
  window.document.body.removeChild(el);
});
