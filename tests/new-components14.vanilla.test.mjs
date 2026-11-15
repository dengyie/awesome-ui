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
    .replace(new RegExp(`^export default ${className};\\s*$`, 'm'), '')
    .replace(new RegExp(`^export class ${className}`, 'm'), `class ${className}`);

const tabsSource = stripComponent('Tabs.js', 'TabsElement');
const accordionSource = stripComponent('Accordion.js', 'AccordionElement');
const avatarSource = stripComponent('AvatarGroup.js', 'AvatarGroupElement');
const filterSource = stripComponent('FilterBar.js', 'FilterBarElement');

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

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity', label: 'Activity', badge: 3 },
  { id: 'settings', label: 'Settings', disabled: true },
];

test('Tabs — renders tablist with first tab active', () => {
  const { el } = mount(tabsSource, 'TabsElement', 'tabs-bar');
  el.tabs = TABS;

  assert.equal(el.querySelectorAll('[role="tab"]').length, 3);
  assert.equal(el.querySelector('[role="tablist"]').getAttribute('aria-label'), 'Tabs');
  assert.equal(el.querySelector('#tab-overview').getAttribute('aria-selected'), 'true');
  assert.equal(el.querySelector('#tab-activity').getAttribute('aria-selected'), 'false');
  assert.ok(el.querySelector('#tab-settings').disabled);
  assert.ok(el.innerHTML.includes('>3<'));
});

test('Tabs — click emits change and moves selection', () => {
  const { el } = mount(tabsSource, 'TabsElement', 'tabs-bar');
  el.tabs = TABS;
  const changes = collect(el, 'change');

  el.querySelector('#tab-activity').click();

  assert.equal(changes.length, 1);
  assert.equal(changes[0].id, 'activity');
  assert.equal(el.querySelector('#tab-activity').getAttribute('aria-selected'), 'true');
  assert.equal(el.querySelector('#tab-overview').getAttribute('aria-selected'), 'false');
});

test('Tabs — disabled tab does not emit', () => {
  const { el } = mount(tabsSource, 'TabsElement', 'tabs-bar');
  el.tabs = TABS;
  const changes = collect(el, 'change');

  el.querySelector('#tab-settings').click();
  assert.equal(changes.length, 0);
});

test('Tabs — controlled active-id wins over internal state', () => {
  const { el } = mount(tabsSource, 'TabsElement', 'tabs-bar', { 'active-id': 'activity' });
  el.tabs = TABS;
  assert.equal(el.querySelector('#tab-activity').getAttribute('aria-selected'), 'true');

  el.querySelector('#tab-overview').click();
  assert.equal(el.querySelector('#tab-activity').getAttribute('aria-selected'), 'true', 'stays controlled');
});

test('Tabs — arrow key moves focus and selection', () => {
  const { el, window } = mount(tabsSource, 'TabsElement', 'tabs-bar');
  el.tabs = TABS;
  const changes = collect(el, 'change');

  el.querySelector('#tab-overview').dispatchEvent(
    new window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
  );

  assert.equal(changes.length, 1);
  assert.equal(changes[0].id, 'activity');
  assert.equal(window.document.activeElement, el.querySelector('#tab-activity'));
});

test('Tabs — pills variant container', () => {
  const { el } = mount(tabsSource, 'TabsElement', 'tabs-bar', { variant: 'pills' });
  el.tabs = TABS;
  assert.ok(el.querySelector('[role="tablist"]').className.includes('rounded-lg bg-zinc-100'));
});

const ACCORDION = [
  { id: 'a', title: 'What is it?', content: 'A component kit.', defaultOpen: true },
  { id: 'b', title: 'Is it free?', description: 'Licensing', content: 'MIT.' },
];

test('Accordion — default open panel renders', () => {
  const { el } = mount(accordionSource, 'AccordionElement', 'accordion-list');
  el.items = ACCORDION;

  assert.equal(el.querySelector('[data-accordion-id="a"]').getAttribute('aria-expanded'), 'true');
  assert.equal(el.querySelector('[data-accordion-id="b"]').getAttribute('aria-expanded'), 'false');
  assert.ok(el.innerHTML.includes('A component kit.'));
  assert.equal(el.innerHTML.includes('MIT.'), false);
  assert.ok(el.innerHTML.includes('Licensing'));
});

test('Accordion — single-open replaces the previous panel', () => {
  const { el } = mount(accordionSource, 'AccordionElement', 'accordion-list');
  el.items = ACCORDION;
  const toggles = collect(el, 'toggle');

  el.querySelector('[data-accordion-id="b"]').click();

  assert.equal(toggles.length, 1);
  assert.deepEqual(toggles[0], { id: 'b', open: true });
  assert.equal(el.querySelector('[data-accordion-id="a"]').getAttribute('aria-expanded'), 'false');
  assert.equal(el.querySelector('[data-accordion-id="b"]').getAttribute('aria-expanded'), 'true');
  assert.ok(el.innerHTML.includes('MIT.'));
  assert.equal(el.innerHTML.includes('A component kit.'), false);
});

test('Accordion — allow-multiple keeps both open', () => {
  const { el } = mount(accordionSource, 'AccordionElement', 'accordion-list', { 'allow-multiple': '' });
  el.items = ACCORDION;

  el.querySelector('[data-accordion-id="b"]').click();

  assert.equal(el.querySelector('[data-accordion-id="a"]').getAttribute('aria-expanded'), 'true');
  assert.equal(el.querySelector('[data-accordion-id="b"]').getAttribute('aria-expanded'), 'true');
  assert.ok(el.innerHTML.includes('A component kit.'));
  assert.ok(el.innerHTML.includes('MIT.'));
});

test('Accordion — clicking an open trigger closes it', () => {
  const { el } = mount(accordionSource, 'AccordionElement', 'accordion-list');
  el.items = ACCORDION;
  const toggles = collect(el, 'toggle');

  el.querySelector('[data-accordion-id="a"]').click();

  assert.deepEqual(toggles[0], { id: 'a', open: false });
  assert.equal(el.querySelector('[data-accordion-id="a"]').getAttribute('aria-expanded'), 'false');
  assert.equal(el.innerHTML.includes('A component kit.'), false);
});

const MEMBERS = [
  { id: '1', name: 'Ada Lovelace', status: 'online' },
  { id: '2', name: 'Grace Hopper' },
  { id: '3', name: 'Alan Turing' },
  { id: '4', name: 'Margaret Hamilton' },
];

test('AvatarGroup — initials, overflow and status dot', () => {
  const { el } = mount(avatarSource, 'AvatarGroupElement', 'avatar-group', { max: '2' });
  el.members = MEMBERS;

  assert.equal(el.querySelectorAll('.avatar-member').length, 2);
  assert.ok(el.innerHTML.includes('>AL<'));
  assert.ok(el.innerHTML.includes('>GH<'));
  assert.ok(el.innerHTML.includes('+2'));
  assert.ok(el.innerHTML.includes('bg-emerald-500'));
  assert.equal(el.querySelector('.avatar-member').getAttribute('aria-label'), 'Ada Lovelace');
});

test('AvatarGroup — member-click carries the member', () => {
  const { el } = mount(avatarSource, 'AvatarGroupElement', 'avatar-group');
  el.members = MEMBERS;
  const clicks = collect(el, 'member-click');

  el.querySelectorAll('.avatar-member')[1].click();

  assert.equal(clicks.length, 1);
  assert.equal(clicks[0].id, '2');
  assert.equal(clicks[0].name, 'Grace Hopper');
});

test('AvatarGroup — image source and size attribute', () => {
  const { el } = mount(avatarSource, 'AvatarGroupElement', 'avatar-group', { size: 'lg' });
  el.members = [{ id: '1', name: 'Photo', src: 'https://example.com/a.png' }];

  assert.ok(el.innerHTML.includes('src="https://example.com/a.png"'));
  assert.ok(el.querySelector('.avatar-member').className.includes('h-11 w-11'));
});

const FILTERS = [
  { id: 'status', label: 'Status', options: [{ value: 'open', label: 'Open', count: 4 }, { value: 'done', label: 'Done' }] },
  { id: 'owner', label: 'Owner', options: [{ value: 'me', label: 'Me' }] },
];

test('FilterBar — chips render with dropdowns closed', () => {
  const { el } = mount(filterSource, 'FilterBarElement', 'filter-bar');
  el.filters = FILTERS;

  assert.equal(el.querySelectorAll('[data-filter-toggle]').length, 2);
  assert.equal(el.querySelector('[data-filter-toggle="status"]').getAttribute('aria-expanded'), 'false');
  assert.equal(el.querySelectorAll('[data-filter-id]').length, 0, 'no options rendered');
  assert.equal(el.querySelector('[data-filter-clear]'), null);
});

test('FilterBar — opening a chip reveals options', () => {
  const { el } = mount(filterSource, 'FilterBarElement', 'filter-bar');
  el.filters = FILTERS;

  el.querySelector('[data-filter-toggle="status"]').click();

  assert.equal(el.querySelector('[data-filter-toggle="status"]').getAttribute('aria-expanded'), 'true');
  assert.equal(el.querySelectorAll('[data-filter-id]').length, 2);
  assert.ok(el.innerHTML.includes('Open'));
});

test('FilterBar — selecting an option emits change and shows count', () => {
  const { el } = mount(filterSource, 'FilterBarElement', 'filter-bar');
  el.filters = FILTERS;
  const changes = collect(el, 'change');

  el.querySelector('[data-filter-toggle="status"]').click();
  el.querySelector('[data-filter-id="status"][data-value="open"]').click();

  assert.equal(changes.length, 1);
  assert.deepEqual(changes[0], { status: ['open'] });
  assert.equal(el.querySelector('[data-filter-toggle="status"]').getAttribute('aria-expanded'), 'true', 'stays open for multi-select');
  assert.ok(el.querySelector('[data-filter-toggle="status"]').innerHTML.includes('>1<'));
  assert.ok(el.querySelector('[data-filter-clear]'));
});

test('FilterBar — toggling the same option removes it', () => {
  const { el } = mount(filterSource, 'FilterBarElement', 'filter-bar');
  el.filters = FILTERS;
  el.selected = { status: ['open'] };
  const changes = collect(el, 'change');

  el.querySelector('[data-filter-toggle="status"]').click();
  el.querySelector('[data-filter-id="status"][data-value="open"]').click();

  assert.deepEqual(changes[0], {});
  assert.equal(el.querySelector('[data-filter-clear]'), null);
});

test('FilterBar — clear all emits clear and resets', () => {
  const { el } = mount(filterSource, 'FilterBarElement', 'filter-bar');
  el.filters = FILTERS;
  el.selected = { status: ['open'], owner: ['me'] };
  const changes = collect(el, 'change');
  const clears = collect(el, 'clear');

  el.querySelector('[data-filter-clear]').click();

  assert.deepEqual(changes[0], {});
  assert.equal(clears.length, 1);
  assert.equal(el.querySelector('[data-filter-clear]'), null);
});

test('FilterBar — Escape closes the dropdown', () => {
  const { el, window } = mount(filterSource, 'FilterBarElement', 'filter-bar');
  el.filters = FILTERS;

  el.querySelector('[data-filter-toggle="status"]').click();
  assert.equal(el.querySelectorAll('[data-filter-id]').length, 2);

  window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
  assert.equal(el.querySelectorAll('[data-filter-id]').length, 0);
});
