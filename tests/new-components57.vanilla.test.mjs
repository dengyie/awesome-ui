/**
 * v3.2.0 batch — vanilla behavior tests (jsdom)
 * TableSavedViews, BottomTabBar, BentoFeatureGrid, LogoCloud, StatsBand.
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

const viewsSource = stripComponent('TableSavedViews.js', 'TableSavedViewsElement');
const tabbarSource = stripComponent('BottomTabBar.js', 'BottomTabBarElement');
const bentoSource = stripComponent('BentoFeatureGrid.js', 'BentoFeatureGridElement');
const logosSource = stripComponent('LogoCloud.js', 'LogoCloudElement');
const statsSource = stripComponent('StatsBand.js', 'StatsBandElement');

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
  return { el, window };
}

test('TableSavedViews — tab switch, filter chips and save/share events', () => {
  const { el } = mount(viewsSource, 'TableSavedViewsElement');
  assert.equal(el.querySelectorAll('[data-savedview-tab]').length, 3);
  // Default active view is the first one ("All records", no filters)
  assert.ok(el.querySelector('[data-savedview-nofilters]'), 'first view has no filters');

  const events = [];
  el.addEventListener('view-change', (e) => events.push(['change', e.detail.id]));
  el.addEventListener('view-save', (e) => events.push(['save', e.detail.id]));
  el.addEventListener('view-share', (e) => events.push(['share', e.detail.id]));

  el.querySelector('[data-savedview-tab="stale"]').click();
  assert.ok(events.some((ev) => ev[0] === 'change' && ev[1] === 'stale'));
  assert.ok(el.querySelector('[data-savedview-filter="updated < 30d"]'));
  el.querySelector('[data-savedview-save]').click();
  el.querySelector('[data-savedview-share]').click();
  assert.ok(events.some((ev) => ev[0] === 'save' && ev[1] === 'stale'));
  assert.ok(events.some((ev) => ev[0] === 'share' && ev[1] === 'stale'));
});

test('BottomTabBar — active indicator, badge and tab-change event', () => {
  const { el } = mount(tabbarSource, 'BottomTabBarElement');
  assert.equal(el.querySelectorAll('[data-bottomtab-item]').length, 5);
  assert.ok(el.querySelector('[data-bottomtab-badge="inbox"]'));
  assert.ok(el.querySelector('[data-bottomtab-indicator="home"]').className.includes('block'));

  const events = [];
  el.addEventListener('tab-change', (e) => events.push(e.detail.id));
  el.querySelector('[data-bottomtab-item="profile"]').click();
  assert.deepEqual(events, ['profile']);
  assert.ok(el.querySelector('[data-bottomtab-indicator="profile"]').className.includes('block'));
  assert.ok(el.querySelector('[data-bottomtab-indicator="home"]').className.includes('hidden'));
});

test('BentoFeatureGrid — span classes and tile-click event', () => {
  const { el } = mount(bentoSource, 'BentoFeatureGridElement');
  assert.equal(el.querySelectorAll('[data-bento-tile]').length, 4);
  const wide = el.querySelector('[data-bento-tile="t1"]');
  assert.ok(wide.className.includes('sm:col-span-2'));

  const events = [];
  el.addEventListener('tile-click', (e) => events.push(e.detail.tile.id));
  el.querySelector('[data-bento-tile="t2"]').click();
  assert.deepEqual(events, ['t2']);
});

test('LogoCloud — kicker and item count', () => {
  const { el } = mount(logosSource, 'LogoCloudElement');
  assert.ok(el.querySelector('[data-logocloud-kicker]').textContent.includes('Trusted by'));
  assert.equal(el.querySelectorAll('[data-logocloud-item]').length, 6);
  assert.ok(el.querySelector('[data-logocloud-name="Acme Corp"]'));
});

test('StatsBand — cells, value echo and responsive columns', () => {
  const { el } = mount(statsSource, 'StatsBandElement');
  assert.equal(el.querySelectorAll('[data-stats-cell]').length, 4);
  assert.ok(el.querySelector('[data-stats-grid]').className.includes('sm:grid-cols-4'));
  assert.ok(el.querySelector('[data-stats-value="235+"]'));
  assert.ok(el.querySelector('[data-stats-note="0"]'));
});
