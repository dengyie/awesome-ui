/**
 * v3.8.0 batch — vanilla behavior tests (jsdom)
 * MetricLineChart, PaywallDialog, TrialExpiryNotice.
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
    .replace(new RegExp(`^export default ${className};\\s*$`, 'm'), '')
    .replace(new RegExp(`^export class ${className}`, 'm'), `class ${className}`);

const metricSource = stripComponent('MetricLineChart.js', 'MetricLineChartElement');
const paywallSource = stripComponent('PaywallDialog.js', 'PaywallDialogElement');
const trialSource = stripComponent('TrialExpiryNotice.js', 'TrialExpiryNoticeElement');

function mount(source, exportName, attrs = {}) {
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
    `${source}\nreturn ${exportName};`,
  );
  const Klass = factory(window.customElements, window.HTMLElement, window.CustomEvent, window.document);
  const el = new Klass();
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  window.document.body.appendChild(el);
  const events = [];
  el.dispatchEvent = ((orig) => (evt) => { events.push(evt); return orig.call(el, evt); })(el.dispatchEvent.bind(el));
  return { el, events, window };
}

const click = (el, node) =>
  node.dispatchEvent(new el.ownerDocument.defaultView.MouseEvent('click', { bubbles: true }));
const hover = (el, node) =>
  node.dispatchEvent(new el.ownerDocument.defaultView.MouseEvent('mouseover', { bubbles: true }));

test('vanilla — MetricLineChart render, range switch event and XSS escape', () => {
  const { el, events } = mount(metricSource, 'MetricLineChartElement', {
    headline: 'Active users',
    value: '48.2k',
    delta: '12.4%',
    'delta-tone': 'up',
    ranges: '24h,7d,30d',
  });
  el.labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  el.series = [{ name: 'This week', color: '#8b5cf6', values: [20, 34, 28, 45, 52] }];

  assert.ok(el.querySelector('[data-metric-line-chart]'));
  assert.ok(el.querySelector('[data-metric-line-title]').textContent.includes('Active users'));
  assert.ok(el.querySelector('[data-metric-line-value]').textContent.includes('48.2k'));
  assert.ok(el.querySelector('[data-metric-line-delta]').textContent.includes('▲ 12.4%'));
  assert.equal(el.querySelectorAll('[data-metric-line-range-option]').length, 3);
  assert.ok(el.querySelector('[data-metric-line-svg]'));
  assert.ok(el.innerHTML.includes('stroke="#8b5cf6"'));

  click(el, el.querySelector('[data-metric-line-range-option="30d"]'));
  const evt = events.find((e) => e.type === 'range-change');
  assert.ok(evt);
  assert.equal(evt.detail.range, '30d');
  assert.ok(el.querySelector('[data-metric-line-range-option="30d"]').getAttribute('aria-selected') === 'true');

  el.setAttribute('headline', 'Active <b>users</b>');
  assert.ok(!el.querySelector('b'), 'no raw element injected');
  assert.ok(el.querySelector('[data-metric-line-title]').innerHTML.includes('&lt;b&gt;users&lt;/b&gt;'));
});

test('vanilla — MetricLineChart hover tooltip and legend', () => {
  const { el } = mount(metricSource, 'MetricLineChartElement');
  el.labels = ['Mon', 'Tue', 'Wed'];
  el.series = [
    { name: 'This week', color: '#8b5cf6', values: [20, 34, 28] },
    { name: 'Last week', color: '#f59e0b', values: [15, 18, 22] },
  ];

  assert.ok(el.querySelector('[data-metric-line-legend]'));
  assert.ok(el.querySelector('[data-metric-line-legend]').textContent.includes('Last week'));
  assert.ok(!el.querySelector('[data-metric-line-tooltip]'));

  hover(el, el.querySelector('[data-metric-line-col="Tue"]'));
  assert.ok(el.querySelector('[data-metric-line-hover-group]'));
  assert.ok(el.querySelector('[data-metric-line-tooltip]'));
  assert.ok(el.querySelector('[data-metric-line-tooltip]').textContent.includes('Tue'));
  assert.ok(el.querySelector('[data-metric-line-tooltip]').textContent.includes('34'));
});

test('vanilla — PaywallDialog closed by default, opens, cadence switch, upgrade and dismiss', () => {
  const { el, events } = mount(paywallSource, 'PaywallDialogElement', { 'default-open': '' });
  el.cadenceNote = { Yearly: '-25%' };
  el.cadencePrices = { pro: { Monthly: '$12', Yearly: '$9' } };
  el.plans = [
    { id: 'starter', name: 'Starter', price: 'Free', period: '', features: ['10 reports'] },
    { id: 'pro', name: 'Pro', price: '$12', period: '/mo', originalPrice: '$16', badge: 'Most popular', featured: true, features: ['Unlimited reports', 'Priority support'] },
  ];
  el.setAttribute('discount-badge', '25% OFF');

  assert.ok(el.querySelector('[data-paywall-dialog]'));
  assert.ok(el.querySelector('[data-paywall-title]').textContent.includes('Upgrade to continue'));
  assert.ok(el.querySelector('[data-paywall-discount]'));
  assert.ok(el.querySelector('[data-paywall-cadence-option="Yearly"]'));
  assert.ok(el.querySelector('[data-paywall-plan="pro"]'));
  assert.ok(el.querySelector('[data-paywall-plan="pro"]').textContent.includes('$12'));
  assert.ok(el.querySelector('[data-paywall-plan="pro"]').textContent.includes('$16'));
  assert.ok(el.querySelector('[data-paywall-cta]').textContent.includes('Monthly'));

  // switch cadence → prices update live
  click(el, el.querySelector('[data-paywall-cadence-option="Yearly"]'));
  const cadEvt = events.find((e) => e.type === 'cadence-change');
  assert.ok(cadEvt);
  assert.equal(cadEvt.detail.cadence, 'Yearly');
  assert.ok(el.querySelector('[data-paywall-plan="pro"]').textContent.includes('$9'));
  assert.ok(el.querySelector('[data-paywall-cta]').textContent.includes('Yearly'));

  // upgrade via featured plan card
  click(el, el.querySelector('[data-paywall-plan="pro"]'));
  const upEvt = events.find((e) => e.type === 'upgrade');
  assert.ok(upEvt);
  assert.equal(upEvt.detail.plan.id, 'pro');

  // dismiss closes overlay
  click(el, el.querySelector('[data-paywall-dismiss]'));
  const disEvt = events.find((e) => e.type === 'dismiss');
  assert.ok(disEvt);
  assert.ok(!el.querySelector('[data-paywall-dialog]'));
});

test('vanilla — PaywallDialog reopens via show() and escapes plan names', () => {
  const { el } = mount(paywallSource, 'PaywallDialogElement');
  assert.ok(!el.querySelector('[data-paywall-dialog]'));
  el.plans = [{ id: 'p1', name: 'Pro <b>x</b>', price: '$5', features: [] }];
  el.show();
  assert.ok(el.querySelector('[data-paywall-dialog]'));
  assert.ok(!el.innerHTML.includes('<b>x</b>'));
  assert.ok(el.innerHTML.includes('&lt;b&gt;x&lt;/b&gt;'));
  el.close();
  assert.ok(!el.querySelector('[data-paywall-dialog]'));
});

test('vanilla — TrialExpiryNotice expiring tone, features and events', () => {
  const { el, events } = mount(trialSource, 'TrialExpiryNoticeElement', {
    'plan-name': 'Pro',
    'days-left': '7',
    'expires-on': 'Nov 28',
  });
  el.losingFeatures = ['Custom reports', 'SSO'];
  el.keepingFeatures = ['Basic dashboards'];

  assert.ok(el.querySelector('[data-trial-expiry-notice]'));
  assert.ok(el.querySelector('[data-trial-expiry-title]').textContent.includes('expires in 7 days'));
  assert.ok(el.querySelector('[data-trial-expiry-sub]').textContent.includes('Deadline: Nov 28'));
  assert.equal(el.querySelector('[data-trial-expiry-days]').textContent.trim(), '7');
  assert.equal(el.querySelectorAll('[data-trial-expiry-losing] li').length, 2);
  assert.equal(el.querySelectorAll('[data-trial-expiry-keeping] li').length, 1);
  assert.ok(el.innerHTML.includes('bg-amber-500'));
  assert.ok(el.querySelector('[data-trial-expiry-losing] li').textContent.includes('Custom reports'));

  click(el, el.querySelector('[data-trial-expiry-upgrade]'));
  assert.ok(events.some((e) => e.type === 'upgrade'));
  click(el, el.querySelector('[data-trial-expiry-extend]'));
  assert.ok(events.some((e) => e.type === 'extend'));
});

test('vanilla — TrialExpiryNotice urgent tone, expired and XSS escape', () => {
  const { el } = mount(trialSource, 'TrialExpiryNoticeElement', { 'days-left': '2' });
  assert.ok(el.querySelector('[data-trial-expiry-title]').textContent.includes('expires in 2 days'));
  assert.ok(el.innerHTML.includes('bg-red-600'));

  el.setAttribute('days-left', '0');
  assert.ok(el.querySelector('[data-trial-expiry-title]').textContent.includes('has expired'));
  assert.equal(el.querySelector('[data-trial-expiry-days]').textContent.trim(), '0');

  el.setAttribute('plan-name', 'Team <img src=x onerror=alert(1)>');
  assert.ok(!el.querySelector('img'));
  assert.ok(el.innerHTML.includes('&lt;img'));
});
