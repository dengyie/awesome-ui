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
    .replace(/^export const paginationSlots/m, 'const paginationSlots')
    .replace(new RegExp(`^export class ${className}`, 'm'), `class ${className}`);

const tooltipSource = stripComponent('Tooltip.js', 'TooltipElement');
const breadcrumbSource = stripComponent('Breadcrumb.js', 'BreadcrumbElement');
const paginationSource = stripComponent('Pagination.js', 'PaginationElement');
const alertSource = stripComponent('AlertBanner.js', 'AlertBannerElement');

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

test('Tooltip — renders bubble from attr with children preserved', () => {
  const { el, window } = mount(tooltipSource, 'TooltipElement', 'tooltip-hint', { content: 'Tip text' });
  const child = window.document.createElement('button');
  child.textContent = 'Hover me';
  el.appendChild(child);

  const tip = el.querySelector('[role="tooltip"]');
  assert.ok(tip, 'tooltip element');
  assert.ok(tip.textContent.includes('Tip text'), 'content rendered');
  assert.ok(el.querySelector('button'), 'child kept');
  assert.ok(el.getAttribute('aria-describedby'), 'describedby set');
  assert.ok(el.querySelector('[id]'), 'tip has id');
  assert.ok(el.className.includes('group'), 'group host class');
});

test('Tooltip — light DOM children survive re-render', () => {
  const { el, window } = mount(tooltipSource, 'TooltipElement', 'tooltip-hint', { content: 'One' });
  const child = window.document.createElement('button');
  child.textContent = 'Save';
  el.appendChild(child);

  el.content = 'Two';

  assert.equal(el.querySelector('[role="tooltip"]').textContent.trim(), 'Two', 'content updated');
  assert.ok(el.querySelector('button'), 'child still present after render');
  assert.equal(el.querySelector('button').textContent, 'Save');
});

test('Tooltip — side attribute maps to positioning class', () => {
  const { el } = mount(tooltipSource, 'TooltipElement', 'tooltip-hint', { content: 'Right', side: 'right' });
  assert.ok(el.querySelector('[role="tooltip"]').className.includes('left-full'), 'right → left-full');
  const { el: left } = mount(tooltipSource, 'TooltipElement', 'tooltip-hint', { content: 'Bottom', side: 'bottom' });
  assert.ok(left.querySelector('[role="tooltip"]').className.includes('top-full'), 'bottom → top-full');
});

test('Breadcrumb — renders links, separators and current page', () => {
  const { el } = mount(breadcrumbSource, 'BreadcrumbElement', 'breadcrumb-trail');
  el.items = [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'docs', label: 'Docs', href: '/docs' },
    { id: 'api', label: 'API Reference' },
  ];

  assert.equal(el.querySelector('nav').getAttribute('aria-label'), 'Breadcrumb');
  assert.equal(el.querySelectorAll('a').length, 2, 'two links');
  assert.equal(el.querySelector('a[href="/"]').textContent.includes('Home'), true);
  const current = el.querySelector('[aria-current="page"]');
  assert.ok(current, 'current span');
  assert.ok(current.textContent.includes('API Reference'), 'last label');
  assert.equal(current.tagName, 'SPAN', 'last is not a link');
  assert.equal(el.querySelectorAll('li').length, 3, 'three items');
});

test('Breadcrumb — click on link emits navigate with item and index', () => {
  const { el } = mount(breadcrumbSource, 'BreadcrumbElement', 'breadcrumb-trail');
  el.items = [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'docs', label: 'Docs' },
  ];
  const seen = collect(el, 'navigate');

  el.querySelector('a').click();

  assert.equal(seen.length, 1, 'navigate fired');
  assert.equal(seen[0].item.id, 'home');
  assert.equal(seen[0].index, 0);
});

test('Breadcrumb — max-items collapses the middle to an ellipsis', () => {
  const { el } = mount(breadcrumbSource, 'BreadcrumbElement', 'breadcrumb-trail', { 'max-items': '3' });
  el.items = [
    { label: 'One' },
    { label: 'Two' },
    { label: 'Three' },
    { label: 'Four' },
    { label: 'Five' },
  ];

  assert.ok(el.textContent.includes('One'));
  assert.ok(el.textContent.includes('Four'));
  assert.ok(el.textContent.includes('Five'));
  assert.equal(el.textContent.includes('Two'), false, 'middle dropped');
  assert.ok(el.textContent.includes('…'), 'ellipsis');
});

test('Breadcrumb — items property JSON attribute fallback', () => {
  const { el } = mount(breadcrumbSource, 'BreadcrumbElement', 'breadcrumb-trail', {
    items: JSON.stringify([{ label: 'One' }, { label: 'Two' }]),
  });
  assert.equal(el.querySelectorAll('li').length, 2);
  assert.ok(el.textContent.includes('Two'));
});

test('Pagination — renders numbers with current page and gaps', () => {
  const { el } = mount(paginationSource, 'PaginationElement', 'pagination-bar', { page: '5', 'page-count': '12' });
  const buttons = el.querySelectorAll('button[aria-label^="Page "]');
  const labels = Array.from(buttons).map((node) => node.textContent.trim());
  assert.deepEqual(labels, ['1', '4', '5', '6', '12'], 'slot numbers');
  assert.equal(el.querySelector('button[aria-current="page"]').textContent.trim(), '5', 'current');
  assert.equal(el.querySelectorAll('nav span').length, 2, 'two gaps');
});

test('Pagination — click on a page number emits change', () => {
  const { el } = mount(paginationSource, 'PaginationElement', 'pagination-bar', { page: '3', 'page-count': '8' });
  const seen = collect(el, 'change');

  el.querySelector('button[data-page="4"]').click();

  assert.equal(seen.length, 1);
  assert.equal(seen[0].page, 4);
  assert.equal(el.getAttribute('page'), '4', 'attribute syncs');
  assert.equal(el.querySelector('[aria-current="page"]').textContent.trim(), '4', 'selection moved');
});

test('Pagination — prev disabled at first page, enabled otherwise', () => {
  const { el } = mount(paginationSource, 'PaginationElement', 'pagination-bar', { page: '1', 'page-count': '5' });
  const prev = (node) => [...el.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === 'Previous page');
  assert.ok(prev().disabled, 'disabled at page 1');

  prev().removeAttribute('disabled');
  prev().click();
  assert.equal(el.getAttribute('page'), '1', 'no change when at bounds');

  el.page = 2;
  assert.ok(prev().disabled === false, 'enabled at page 2');
});

test('Pagination — show-edges=false hides first/last jump buttons', () => {
  const { el } = mount(paginationSource, 'PaginationElement', 'pagination-bar', {
    page: '3',
    'page-count': '10',
    'show-edges': 'false',
  });
  assert.equal(el.querySelector('[aria-label="First page"]'), null);
  assert.equal(el.querySelector('[aria-label="Last page"]'), null);
  assert.ok(el.querySelector('[aria-label="Previous page"]'), 'prev kept');
});

test('Pagination — page property setter re-renders', () => {
  const { el } = mount(paginationSource, 'PaginationElement', 'pagination-bar', { page: '1', 'page-count': '6' });
  el.page = 6;
  assert.ok(el.querySelector('[aria-current="page"]').textContent.trim(), '6');
});

test('AlertBanner — info tone renders status with title and description', () => {
  const { el } = mount(alertSource, 'AlertBannerElement', 'alert-banner', {
    title: 'Heads up',
    description: 'A new model is available.',
  });
  const banner = el.querySelector('[role="status"]');
  assert.ok(banner, 'status role');
  assert.ok(banner.className.includes('bg-indigo-50'), 'info tone');
  assert.ok(banner.textContent.includes('Heads up'));
  assert.ok(banner.textContent.includes('A new model is available.'));
  assert.equal(el.querySelector('button'), null, 'no buttons by default');
});

test('AlertBanner — danger tone uses alert role and deep red classes', () => {
  const { el } = mount(alertSource, 'AlertBannerElement', 'alert-banner', { tone: 'danger', title: 'Delete failed' });
  const banner = el.querySelector('[role="alert"]');
  assert.ok(banner, 'alert role');
  assert.ok(banner.className.includes('bg-rose-50'), 'danger tone');
  assert.ok(el.textContent.includes('Delete failed'));
});

test('AlertBanner — action-text renders a button that emits action', () => {
  const { el } = mount(alertSource, 'AlertBannerElement', 'alert-banner', {
    title: 'Update',
    'action-text': 'Review now',
  });
  const seen = collect(el, 'action');

  const action = el.querySelector('[data-alert-action]');
  assert.ok(action, 'action button');
  assert.ok(action.textContent.includes('Review now'));

  action.click();
  assert.equal(seen.length, 1, 'action fired');
});

test('AlertBanner — dismissible renders dismiss that emits dismiss and hides banner', () => {
  const { el } = mount(alertSource, 'AlertBannerElement', 'alert-banner', {
    title: 'Dismiss me',
    dismissible: '',
  });
  const seen = collect(el, 'dismiss');

  const dismiss = el.querySelector('[data-alert-dismiss]');
  assert.ok(dismiss, 'dismiss button');
  assert.equal(dismiss.getAttribute('aria-label'), 'Dismiss');

  dismiss.click();
  assert.equal(seen.length, 1, 'dismiss fired');
});

test('AlertBanner — property setters re-render title and description', () => {
  const { el } = mount(alertSource, 'AlertBannerElement', 'alert-banner');
  el.title = 'New title';
  el.description = 'New body';
  const banner = el.querySelector('[role="status"]');
  assert.ok(banner.textContent.includes('New title'));
  assert.ok(banner.textContent.includes('New body'));
});
