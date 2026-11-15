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
    .replace(/^const escapeAttribute = [\s\S]*?;\n/m, '')
    .replace(/^export const usageTone/m, 'const usageTone')
    .replace(new RegExp(`^export default ${className};\\s*$`, 'm'), '')
    .replace(new RegExp(`^export class ${className}`, 'm'), `class ${className}`);

const comboSource = stripComponent('ComboBox.js', 'ComboBoxElement');
const navbarSource = stripComponent('Navbar.js', 'NavbarElement');
const feedSource = stripComponent('ActivityFeed.js', 'ActivityFeedElement');
const meterSource = stripComponent('UsageMeter.js', 'UsageMeterElement');

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
  el.addEventListener(name, (event) => seen.push(event.detail));
  return seen;
};

const MODELS = [
  { value: 'sonnet', label: 'Claude Sonnet', description: 'Balanced coding model' },
  { value: 'gpt', label: 'GPT-5' },
  { value: 'local', label: 'Local Llama', description: 'Runs offline' },
];

test('ComboBox — field renders closed, options appear on focus', () => {
  const { el } = mount(comboSource, 'ComboBoxElement', 'combo-select', { placeholder: 'Pick a model…' });
  el.options = MODELS;

  assert.equal(el.querySelector('[role="combobox"]').getAttribute('aria-expanded'), 'false');
  assert.equal(el.querySelector('[role="listbox"]'), null);

  el.querySelector('[data-combo-input]').focus();
  assert.ok(el.querySelector('[role="listbox"]'), 'listbox open');
  assert.equal(el.querySelectorAll('[role="option"]').length, 3);
  assert.ok(el.textContent.includes('Balanced coding model'), 'description shown');
});

test('ComboBox — typing filters and Enter chooses', () => {
  const { el, window } = mount(comboSource, 'ComboBoxElement', 'combo-select');
  el.options = MODELS;
  const changes = collect(el, 'change');

  const input = el.querySelector('[data-combo-input]');
  input.value = 'llama';
  input.dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.equal(el.querySelectorAll('[role="option"]').length, 1, 'filtered to one');

  input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  assert.equal(changes.length, 1, 'change fired');
  assert.equal(changes[0].value, 'local');
  assert.equal(el.querySelector('[data-combo-input]').value, 'Local Llama', 'query synced');
  assert.equal(el.querySelector('[role="listbox"]'), null, 'closed after choose');
});

test('ComboBox — arrow keys move active option, typing shows clear', () => {
  const { el, window } = mount(comboSource, 'ComboBoxElement', 'combo-select');
  el.options = MODELS;
  const input = el.querySelector('[data-combo-input]');

  input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
  const options = el.querySelectorAll('[role="option"]');
  assert.ok(options[1].className.includes('bg-indigo-50'), 'second option active');

  input.value = 'llama';
  input.dispatchEvent(new window.Event('input', { bubbles: true }));
  const clear = el.querySelector('[data-combo-clear]');
  assert.ok(clear, 'clear button appears with query');

  clear.click();
  assert.equal(el.querySelector('[data-combo-input]').value, '', 'query cleared');
});

test('ComboBox — Escape closes listbox', () => {
  const { el, window } = mount(comboSource, 'ComboBoxElement', 'combo-select');
  el.options = MODELS;
  el.querySelector('[data-combo-input]').focus();
  assert.ok(el.querySelector('[role="listbox"]'));

  window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
  assert.equal(el.querySelector('[role="listbox"]'), null, 'closed via Escape');
});

test('ComboBox — empty result shows empty-text', () => {
  const { el, window } = mount(comboSource, 'ComboBoxElement', 'combo-select', { 'empty-text': 'Nothing here.' });
  el.options = MODELS;
  const input = el.querySelector('[data-combo-input]');
  input.value = 'zzz';
  input.dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.ok(el.textContent.includes('Nothing here.'), 'custom empty text');
});

test('Navbar — brand, links, closed mega menu, CTA event', () => {
  const { el } = mount(navbarSource, 'NavbarElement', 'nav-bar', { brand: 'awesome-ui', 'cta-text': 'Get started' });
  el.links = [{ label: 'Docs', href: '/docs' }];
  el.menus = [
    {
      id: 'product',
      label: 'Product',
      columns: [
        { heading: 'Build', links: [{ label: 'Components', icon: 'layers', badge: 64 }] },
        { links: [{ label: 'Changelog' }] },
      ],
    },
  ];
  const ctaSeen = collect(el, 'cta');

  assert.ok(el.textContent.includes('awesome-ui'));
  assert.equal(el.querySelector('a[href="/docs"]').textContent, 'Docs');
  assert.equal(el.querySelector('[data-nav-menu]').getAttribute('aria-expanded'), 'false');
  assert.equal(el.textContent.includes('Components'), false, 'panel hidden');

  el.querySelector('[data-nav-cta]').click();
  assert.equal(ctaSeen.length, 1, 'cta fired');
});

test('Navbar — menu toggles open and shows columns with badge', () => {
  const { el } = mount(navbarSource, 'NavbarElement', 'nav-bar', { brand: 'B' });
  el.menus = [
    {
      id: 'product',
      label: 'Product',
      columns: [{ heading: 'Build', links: [{ label: 'Components', badge: 64 }, { label: 'Templates' }] }],
    },
  ];

  el.querySelector('[data-nav-menu]').click();
  assert.equal(el.querySelector('[data-nav-menu]').getAttribute('aria-expanded'), 'true');
  assert.ok(el.textContent.includes('Components'), 'panel visible');
  assert.ok(el.textContent.includes('Build'), 'column heading');
  assert.ok(el.textContent.includes('64'), 'badge');

  el.querySelector('[data-nav-menu]').click();
  assert.equal(el.querySelector('[data-nav-menu]').getAttribute('aria-expanded'), 'false');
  assert.equal(el.textContent.includes('Components'), false, 'panel hidden again');
});

test('ActivityFeed — renders entries with tone chips and detail', () => {
  const { el } = mount(feedSource, 'ActivityFeedElement', 'activity-feed', { title: 'Recent activity' });
  el.entries = [
    { id: '1', kind: 'merge', actor: 'Ada', action: 'merged', target: '#42', time: '2m' },
    { id: '2', kind: 'alert', actor: 'Bot', action: 'flagged', time: '1h', detail: 'CPU above 90%' },
  ];

  assert.ok(el.textContent.includes('Recent activity'), 'title');
  assert.equal(el.querySelectorAll('li').length, 2, 'two rows');
  assert.ok(el.textContent.includes('#42'), 'target chip');
  assert.ok(el.textContent.includes('CPU above 90%'), 'detail');
  assert.ok(el.innerHTML.includes('bg-emerald-100'), 'merge tone');
  assert.ok(el.innerHTML.includes('bg-rose-100'), 'alert tone');
  assert.equal(el.querySelectorAll('time').length, 2, 'timestamps');
});

test('ActivityFeed — unknown kind falls back to event style', () => {
  const { el } = mount(feedSource, 'ActivityFeedElement', 'activity-feed');
  el.entries = [{ id: '1', kind: 'mystery', actor: 'X', action: 'did', time: 'now' }];
  assert.ok(el.innerHTML.includes('bg-indigo-100'), 'event fallback tone');
});

test('UsageMeter — ratio, tone and remaining legend', () => {
  const { el } = mount(meterSource, 'UsageMeterElement', 'usage-meter', {
    label: 'Context window',
    used: '115200',
    limit: '128000',
    unit: 'tokens',
  });

  assert.ok(el.textContent.includes('Context window'));
  assert.ok(el.textContent.includes('90%'), 'percent');
  assert.ok(el.querySelector('[style*="width:90%"]') || el.querySelector('[style*="width: 90%"]'), 'bar width');
  assert.ok(el.innerHTML.includes('bg-rose-500'), 'danger bar');
  assert.ok(el.textContent.includes('115,200 / 128,000'), 'usage line');
  assert.ok(el.textContent.includes('12,800 left'), 'remaining');
});

test('UsageMeter — tone thresholds and limit reached', () => {
  const { el } = mount(meterSource, 'UsageMeterElement', 'usage-meter', { label: 'A', used: '3', limit: '10' });
  assert.ok(el.innerHTML.includes('bg-indigo-500'), 'ok tone');
  assert.ok(el.textContent.includes('7 left'));

  el.setAttribute('used', '10');
  assert.ok(el.innerHTML.includes('bg-rose-500'), 'danger when full');
  assert.ok(el.textContent.includes('Limit reached'), 'legend swap');

  const warn = mount(meterSource, 'UsageMeterElement', 'usage-meter', { label: 'B', used: '75', limit: '100' });
  assert.ok(warn.el.innerHTML.includes('bg-amber-500'), 'warning tone at 75%');
});

test('UsageMeter — show-legend=false hides remaining', () => {
  const { el } = mount(meterSource, 'UsageMeterElement', 'usage-meter', {
    label: 'Seats',
    used: '3',
    limit: '10',
    'show-legend': 'false',
  });
  assert.equal(el.textContent.includes('left'), false, 'legend hidden');
  assert.ok(el.textContent.includes('30%'), 'percent still shown');
});
