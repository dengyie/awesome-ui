/**
 * jsdom tests for the v2.6.0 vanilla components
 * (PermissionMatrix, StockPhotoPicker, MapActivityList, SearchResultsPage).
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

const instantiate = (file, className) => {
  const src = stripComponent(file, className);
  const factory = new Function(
    'customElements',
    'HTMLElement',
    'CustomEvent',
    'document',
    'MutationObserver',
    'window',
    `${src}\nreturn ${className};`
  );
  return factory(window.customElements, window.HTMLElement, window.CustomEvent, window.document, window.MutationObserver, window);
};

test('vanilla PermissionMatrix — tabs switch and cell-click detail', () => {
  const El = instantiate('PermissionMatrix.js', 'PermissionMatrixElement');
  const el = new El();
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-permmtx]'), 'root rendered');
  assert.ok(el.querySelector('[data-permmtx-title]').textContent.includes('Roles'), 'default title');
  assert.ok(el.querySelector('[data-permmtx-tab="details"]'), 'details tab');
  assert.ok(el.querySelector('[data-permmtx-group="employee"]'), 'group row');
  assert.ok(el.querySelector('[data-permmtx-row="onboarding"]'), 'permission row');
  assert.ok(el.querySelector('[data-permmtx-role="Editor"]'), 'role column');
  const cell = el.querySelector('[data-permmtx-cell="onboarding:Editor"]');
  assert.ok(cell, 'cell button');
  assert.equal(cell.getAttribute('data-permmtx-state'), 'edit', 'cell state');

  // cell click → event with row + role + state
  let picked = null;
  el.addEventListener('cell-click', (e) => { picked = e.detail; });
  cell.dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(picked && picked.row.id === 'onboarding' && picked.role === 'Editor' && picked.state === 'edit', 'cell-click detail');

  // switch to overview tab
  el.querySelector('[data-permmtx-tab="overview"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(el.querySelector('[data-permmtx-overview]'), 'overview panel shown');
  assert.ok(el.querySelector('[data-permmtx-overview]').textContent.includes('7 permission rules'), 'rule count');
  assert.ok(!el.querySelector('[data-permmtx-table]'), 'table hidden in overview');
});

test('vanilla StockPhotoPicker — search filter, clear, add and close', () => {
  const El = instantiate('StockPhotoPicker.js', 'StockPhotoPickerElement');
  const el = new El();
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-stkpic]'), 'root rendered');
  assert.ok(el.querySelector('[data-stkpic-title]').textContent.includes('Stock photos'), 'default title');
  assert.ok(el.querySelector('[data-stkpic-close]'), 'close button');
  assert.ok(el.querySelector('[data-stkpic-input]'), 'search input');
  assert.ok(el.querySelector('[data-stkpic-powered]').textContent.includes('Powered by Unsplash'), 'powered by');
  assert.ok(el.querySelector('[data-stkpic-item="p1"]'), 'photo item');
  assert.ok(el.querySelector('[data-stkpic-add="p6"]'), 'add button');

  // search filters grid
  const input = el.querySelector('[data-stkpic-input]');
  input.value = 'bench';
  input.dispatchEvent(new window.CustomEvent('input', { bubbles: true }));
  assert.ok(el.querySelector('[data-stkpic-item="p6"]'), 'matching photo kept');
  assert.ok(!el.querySelector('[data-stkpic-item="p1"]'), 'non-matching photo filtered out');

  // clear restores grid
  el.querySelector('[data-stkpic-clear]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(el.querySelector('[data-stkpic-item="p1"]'), 'grid restored after clear');

  // add → event
  let added = null;
  el.addEventListener('add', (e) => { added = e.detail; });
  el.querySelector('[data-stkpic-add="p2"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(added && added.photo.id === 'p2' && added.photo.author === 'Sam Tesla', 'add detail');

  // close → event
  let closed = false;
  el.addEventListener('close', () => { closed = true; });
  el.querySelector('[data-stkpic-close]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(closed, 'close fired');
});

test('vanilla MapActivityList — activity click, pin click and close map', () => {
  const El = instantiate('MapActivityList.js', 'MapActivityListElement');
  const el = new El();
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-mapact]'), 'root rendered');
  assert.ok(el.querySelector('[data-mapact-filter="Filters"]'), 'filter chip');
  assert.ok(el.querySelector('[data-mapact-item="a1"]'), 'activity card');
  assert.ok(el.querySelector('[data-mapact-item-title="a1"]').textContent.includes('Seine River Sightseeing Evening Cruise'), 'card title');
  assert.ok(el.querySelector('[data-mapact-item="a1"]').textContent.includes('$43'), 'price');
  assert.ok(el.querySelector('[data-mapact-pin="a3"]'), 'map pin');
  assert.ok(el.querySelector('[data-mapact-close]'), 'close map button');

  // card click → event + active highlight
  let picked = null;
  el.addEventListener('activity-click', (e) => { picked = e.detail; });
  el.querySelector('[data-mapact-item="a2"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(picked && picked.activity.id === 'a2' && picked.activity.price === '$19', 'activity-click detail');
  assert.ok(el.querySelector('[data-mapact-item="a2"]').className.includes('bg-indigo-50'), 'active highlight');

  // pin click → same event
  let pinPicked = null;
  el.addEventListener('activity-click', (e) => { pinPicked = e.detail; });
  el.querySelector('[data-mapact-pin="a4"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(pinPicked && pinPicked.activity.id === 'a4', 'pin click detail');

  // filter click
  let filtered = null;
  el.addEventListener('filter-click', (e) => { filtered = e.detail; });
  el.querySelector('[data-mapact-filter="Water activities"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(filtered && filtered.filter === 'Water activities', 'filter-click detail');

  // close map
  let closed = false;
  el.addEventListener('close-map', () => { closed = true; });
  el.querySelector('[data-mapact-close]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(closed, 'close-map fired');
});

test('vanilla SearchResultsPage — search submit, related chip and result click', () => {
  const El = instantiate('SearchResultsPage.js', 'SearchResultsPageElement');
  const el = new El();
  window.document.body.appendChild(el);

  assert.ok(el.querySelector('[data-srchres]'), 'root rendered');
  assert.ok(el.querySelector('[data-srchres-input]'), 'search input');
  assert.equal(el.querySelector('[data-srchres-input]').value, 'brainstorming', 'default query');
  assert.ok(el.querySelector('[data-srchres-filter="updated"]'), 'filter select');
  assert.ok(el.querySelector('[data-srchres-related-heading]').textContent.includes('Related searches'), 'related heading');
  assert.ok(el.querySelector('[data-srchres-related-chip="brainstorming techniques"]'), 'related chip');
  assert.ok(el.querySelector('[data-srchres-result="s1"]'), 'result entry');
  assert.ok(el.querySelector('[data-srchres-result-title="s2"]').textContent.includes('Sam Design Guideline Document'), 'result title');
  assert.ok(el.querySelector('[data-srchres-result-space="s2"]').textContent.includes('Confluence'), 'result space');

  // search submit via button
  let searched = null;
  el.addEventListener('search-submit', (e) => { searched = e.detail; });
  const input = el.querySelector('[data-srchres-input]');
  input.value = 'design systems';
  input.dispatchEvent(new window.CustomEvent('input', { bubbles: true }));
  el.querySelector('[data-srchres-submit]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(searched && searched.query === 'design systems', 'search-submit detail');

  // search submit via Enter key
  let searched2 = null;
  el.addEventListener('search-submit', (e) => { searched2 = e.detail; });
  input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  assert.ok(searched2 && searched2.query === 'design systems', 'search-submit via Enter');

  // related chip click
  let related = null;
  el.addEventListener('related-click', (e) => { related = e.detail; });
  el.querySelector('[data-srchres-related-chip="brainstorming ideas"]').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(related && related.term === 'brainstorming ideas', 'related-click detail');

  // result click
  let result = null;
  el.addEventListener('result-click', (e) => { result = e.detail; });
  el.querySelector('[data-srchres-result="s3"] button').dispatchEvent(new window.CustomEvent('click', { bubbles: true }));
  assert.ok(result && result.result.id === 's3' && result.result.title === 'Template - How-to guide', 'result-click detail');

  // filter change
  let changed = null;
  el.addEventListener('filter-change', (e) => { changed = e.detail; });
  const select = el.querySelector('[data-srchres-filter="type"]');
  select.value = 'Blog';
  select.dispatchEvent(new window.CustomEvent('change', { bubbles: true }));
  assert.ok(changed && changed.id === 'type' && changed.value === 'Blog', 'filter-change detail');
});
