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

const metricSource = stripComponent('MetricStrip.js', 'MetricStripElement');
const rankSource = stripComponent('RankList.js', 'RankListElement');
const sidenavSource = stripComponent('SideNav.js', 'SideNavElement');
const pageheaderSource = stripComponent('PageHeader.js', 'PageHeaderElement');
const timeframeSource = stripComponent('TimeframePicker.js', 'TimeframePickerElement');

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

test('MetricStrip — values, delta tones and metric-click events', () => {
  const { el } = mount(metricSource, 'MetricStripElement', 'metric-strip', { 'active-index': '1' });
  const clicks = collect(el, 'metric-click');
  el.metrics = [
    { label: 'visitors', value: '48.2k', delta: 12.4, icon: 'users' },
    { label: 'bounce', value: '31%', delta: -3.1 },
    { label: 'errors', value: '0', delta: 0 },
    { label: 'uptime', value: '99.9%', deltaLabel: 'SLA' },
  ];

  assert.equal(el.querySelectorAll('[data-metric-index]').length, 4, 'four cells');
  assert.ok(el.textContent.includes('48.2k'), 'value');
  assert.ok(el.innerHTML.includes('text-emerald-600'), 'positive tone');
  assert.ok(el.innerHTML.includes('text-rose-600'), 'negative tone');
  assert.ok(el.innerHTML.includes('d="m3 17 6-6 4 4 8-8"'), 'trending-up icon path');
  assert.ok(el.innerHTML.includes('d="m3 7 6 6 4-4 8 8"'), 'trending-down icon path');
  assert.ok(el.innerHTML.includes('+12.4'), 'plus sign on positive delta');
  assert.ok(el.innerHTML.includes('SLA'), 'deltaLabel-only variant');
  assert.equal(el.querySelectorAll('[aria-current="true"]').length, 1, 'one active cell');
  assert.equal(
    el.querySelectorAll('[aria-current="true"]')[0].getAttribute('data-metric-index'),
    '1',
    'active index honored'
  );

  el.querySelectorAll('[data-metric-index]')[2].dispatchEvent(
    new el.ownerDocument.defaultView.KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
  );
  assert.equal(clicks.length, 1, 'keyboard metric-click fired');
  assert.equal(clicks[0].index, 2, 'index detail');
  assert.equal(clicks[0].metric.label, 'errors', 'metric detail');
});

test('MetricStrip — empty metrics render nothing', () => {
  const { el } = mount(metricSource, 'MetricStripElement', 'metric-strip');
  assert.equal(el.innerHTML, '', 'no markup without metrics');
});

test('RankList — ratio bars, select event and max-items', () => {
  const { el } = mount(rankSource, 'RankListElement', 'rank-list', {
    title: 'Top pages',
    'value-header': 'Views',
    'show-ratio': '',
    'max-items': '2',
    selectable: '',
  });
  const selects = collect(el, 'select');
  el.items = [
    { label: '/pricing', value: '9,214' },
    { label: '/docs', value: '3,102', ratio: 34 },
    { label: '/blog', value: '812', ratio: 9 },
  ];

  assert.equal(el.querySelectorAll('[data-rank-index]').length, 2, 'maxItems caps rows');
  assert.ok(el.textContent.includes('/pricing'), 'row label');
  assert.ok(el.textContent.includes('9,214'), 'row value');
  assert.ok(el.innerHTML.includes('calc((100% - 1rem) * 1)'), 'peak row full bar');
  assert.ok(el.innerHTML.includes('role="button"'), 'selectable rows');

  el.querySelectorAll('[data-rank-index]')[1].click();
  assert.equal(selects.length, 1, 'select fired');
  assert.equal(selects[0].index, 1, 'index detail');
  assert.equal(selects[0].item.label, '/docs', 'item detail');
});

test('RankList — onSelect property fires without selectable attribute', () => {
  const { el } = mount(rankSource, 'RankListElement', 'rank-list');
  const calls = [];
  el.onSelect = (index, item) => calls.push([index, item]);
  el.items = [{ label: 'a', value: 1 }, { label: 'b', value: 2 }];

  el.querySelectorAll('[data-rank-index]')[0].click();
  assert.equal(calls.length, 1, 'onSelect property called');
  assert.equal(calls[0][0], 0, 'index arg');
  assert.equal(calls[0][1].label, 'a', 'item arg');
});

test('RankList — empty state text', () => {
  const { el } = mount(rankSource, 'RankListElement', 'rank-list', { 'empty-text': 'Nothing ranked yet' });
  assert.ok(el.textContent.includes('Nothing ranked yet'), 'empty text');
});

test('SideNav — groups JSON, active-id and navigate events', () => {
  const { el } = mount(sidenavSource, 'SideNavElement', 'side-nav', {
    heading: 'Workspace',
    'active-id': 'overview',
    groups: JSON.stringify([
      {
        title: 'Main',
        items: [
          { id: 'overview', label: 'Overview', icon: 'eye' },
          { id: 'alerts', label: 'Alerts', icon: 'bell', count: 3 },
          { id: 'archive', label: 'Archive', count: 0 },
        ],
      },
      { items: [{ id: 'settings', label: 'Settings' }] },
    ]),
  });
  const navigations = collect(el, 'navigate');

  assert.ok(el.textContent.includes('Workspace'), 'heading');
  assert.ok(el.textContent.includes('Main'), 'group title');
  assert.ok(el.textContent.includes('Settings'), 'second group rendered');
  assert.ok(el.innerHTML.includes('aria-current="page"'), 'active entry');
  assert.ok(el.innerHTML.includes('bg-indigo-50'), 'active tone');
  assert.ok(el.innerHTML.includes('bg-rose-100'), 'count > 0 rose badge');
  assert.ok(el.innerHTML.includes('bg-zinc-100'), 'count 0 neutral badge');

  el.querySelector('[data-nav-id="alerts"]').click();
  assert.equal(navigations.length, 1, 'navigate fired');
  assert.equal(navigations[0].id, 'alerts', 'id detail');
  assert.equal(navigations[0].entry.label, 'Alerts', 'entry detail');
});

test('SideNav — invalid groups JSON falls back to empty', () => {
  const { el } = mount(sidenavSource, 'SideNavElement', 'side-nav', { heading: 'X', groups: '{oops' });
  assert.ok(el.textContent.includes('X'), 'heading still rendered');
  assert.equal(el.querySelectorAll('[data-nav-id]').length, 0, 'no entries from broken JSON');
});

test('PageHeader — actions JSON, tabs and events', () => {
  const { el } = mount(pageheaderSource, 'PageHeaderElement', 'page-header', {
    title: 'Acme Analytics',
    description: 'Traffic and conversion.',
    'status-text': 'Live',
    'active-tab': 'Overview',
    actions: JSON.stringify([
      { label: 'Share', variant: 'ghost' },
      { label: 'New report', variant: 'primary' },
    ]),
    tabs: JSON.stringify([{ label: 'Overview' }, { label: 'Funnels', count: 4 }]),
  });
  const actions = collect(el, 'action');
  const tabChanges = collect(el, 'tab-change');

  assert.ok(el.textContent.includes('Acme Analytics'), 'title');
  assert.ok(el.textContent.includes('Traffic and conversion.'), 'description');
  assert.ok(el.textContent.includes('Live'), 'status pill');
  assert.ok(el.innerHTML.includes('bg-emerald-500'), 'status dot');
  assert.ok(el.innerHTML.includes('bg-indigo-600'), 'primary action tone');
  assert.ok(el.innerHTML.includes('border-indigo-600'), 'active tab underline');
  assert.ok(el.textContent.includes('4'), 'tab count');

  el.querySelector('[data-action-label="New report"]').click();
  assert.equal(actions.length, 1, 'action fired');
  assert.equal(actions[0].label, 'New report', 'action label detail');
  assert.equal(actions[0].variant, 'primary', 'action variant detail');

  el.querySelector('[data-tab-label="Funnels"]').click();
  assert.equal(tabChanges.length, 1, 'tab-change fired');
  assert.equal(tabChanges[0].label, 'Funnels', 'tab detail');
  assert.equal(tabChanges[0].count, 4, 'tab count detail');
  assert.equal(el.getAttribute('active-tab'), 'Funnels', 'active-tab attribute synced');
});

test('PageHeader — invalid actions JSON falls back to none', () => {
  const { el } = mount(pageheaderSource, 'PageHeaderElement', 'page-header', {
    title: 'T',
    actions: '{oops',
  });
  assert.equal(el.querySelectorAll('[data-action-label]').length, 0, 'no action buttons from broken JSON');
  assert.ok(el.textContent.includes('T'), 'title still rendered');
});

test('TimeframePicker — presets, value, change and step events', () => {
  const { el } = mount(timeframeSource, 'TimeframePickerElement', 'timeframe-picker', {
    value: '30d',
    'range-label': 'Oct 15 – Nov 14',
  });
  const changes = collect(el, 'change');
  const steps = collect(el, 'step');

  assert.ok(el.textContent.includes('Today'), 'default preset');
  assert.ok(el.textContent.includes('12mo'), 'last default preset');
  assert.ok(el.textContent.includes('Oct 15 – Nov 14'), 'range label');
  assert.ok(el.innerHTML.includes('aria-pressed="true"'), 'one active preset');
  assert.ok(el.innerHTML.includes('aria-pressed="false"'), 'inactive presets');
  assert.ok(el.innerHTML.includes('aria-label="Previous period"'), 'step back label');
  assert.ok(el.innerHTML.includes('aria-label="Next period"'), 'step forward label');
  assert.equal(el.querySelectorAll('[aria-pressed="true"]')[0].getAttribute('data-preset'), '30d', 'value honored');

  el.querySelector('[data-preset="7d"]').click();
  assert.equal(changes.length, 1, 'change fired');
  assert.equal(changes[0].value, '7d', 'change detail');
  assert.equal(el.value, '7d', 'value property synced');

  el.querySelector('[data-step="-1"]').click();
  assert.equal(steps.length, 1, 'step fired');
  assert.equal(steps[0].direction, -1, 'direction detail');
  assert.equal(steps[0].value, '7d', 'current value in step detail');
});

test('TimeframePicker — custom presets and disabled state', () => {
  const { el } = mount(timeframeSource, 'TimeframePickerElement', 'timeframe-picker', {
    presets: '24h,7d',
    value: '7d',
    disabled: '',
  });
  const changes = collect(el, 'change');

  assert.ok(el.textContent.includes('24h'), 'custom preset');
  assert.ok(!el.textContent.includes('12mo'), 'default presets replaced');
  assert.ok(el.innerHTML.includes('disabled'), 'buttons disabled');
  assert.ok(el.innerHTML.includes('opacity-50'), 'disabled styling');
  assert.equal(el.value, '7d', 'value getter falls back to first preset when unset');

  el.querySelector('[data-preset="24h"]').click();
  assert.equal(changes.length, 0, 'no change while disabled');
});
