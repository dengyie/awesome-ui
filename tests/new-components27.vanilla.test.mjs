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
    .replace(/^import uiIcon from ['"]\.\/UiIcon\.js['"];\s*$/m, '')
    .replace(new RegExp(`^export default ${className};\\s*$`, 'm'), '')
    .replace(new RegExp(`^export class ${className}`, 'm'), `class ${className}`);

const querySource = stripComponent('FilterQueryBuilder.js', 'FilterQueryBuilderElement');
const columnsSource = stripComponent('ColumnVisibilityMenu.js', 'ColumnVisibilityMenuElement');
const tabsSource = stripComponent('StatusCountTabs.js', 'StatusCountTabsElement');
const pickerSource = stripComponent('EntityMultiSelectPicker.js', 'EntityMultiSelectPickerElement');
const federatedSource = stripComponent('FederatedSearchResultsPanel.js', 'FederatedSearchResultsPanelElement');

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
    `${source}\nreturn ${exportName};`
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

test('FilterQueryBuilder — rows render, add/remove/clear/edit events', () => {
  const { el, window } = mount(querySource, 'FilterQueryBuilderElement', 'filter-query-builder');
  const changes = collect(el, 'change');
  const clears = collect(el, 'clear');
  el.fields = [
    { name: 'status', label: 'Status', operators: ['equals', 'not-equals'] },
    { name: 'amount', label: 'Amount', operators: ['greater', 'less', 'equals'] },
  ];
  el.rows = [
    { id: 'f1', conjunction: 'where', field: 'status', operator: 'equals', value: 'paid' },
    { id: 'f2', conjunction: 'and', field: 'amount', operator: 'greater', value: '100' },
  ];

  assert.ok(el.querySelector('[data-filter-row="f1"]'), 'first row');
  assert.ok(el.querySelector('[data-filter-row="f2"]'), 'second row');
  assert.ok(el.textContent.includes('where'), 'first conjunction');
  assert.ok(el.textContent.includes('+ Add filter'), 'add button');
  assert.ok(el.querySelector('[data-filter-clear]'), 'clear link');
  assert.ok(el.querySelector('[data-filter-value]'), 'value input');

  // editing a value fires change
  const valueInput = el.querySelectorAll('[data-filter-value]')[0];
  valueInput.value = 'refunded';
  valueInput.dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.equal(changes.length, 1, 'change fired on value edit');
  assert.equal(changes[0].rows[0].value, 'refunded', 'edited value propagated');

  // removing a row
  el.querySelector('[data-filter-row="f1"] [data-filter-remove]').click();
  assert.equal(changes.length, 2, 'change fired on remove');
  assert.equal(el.querySelectorAll('[data-filter-row]').length, 1, 'one row remains');

  // clear
  el.querySelector('[data-filter-clear]').click();
  assert.equal(changes.length, 3, 'change fired on clear');
  assert.equal(clears.length, 1, 'clear fired');
  assert.ok(el.querySelector('[data-filter-empty]'), 'empty message after clear');
});

test('ColumnVisibilityMenu — count, lock, toggle, reset and apply modes', () => {
  const { el } = mount(columnsSource, 'ColumnVisibilityMenuElement', 'column-visibility-menu');
  const toggles = collect(el, 'toggle');
  const resets = collect(el, 'reset');
  const applies = collect(el, 'apply');
  el.columns = [
    { id: 'name', label: 'Name', locked: true },
    { id: 'email', label: 'Email' },
    { id: 'role', label: 'Role', hidden: true },
  ];

  assert.ok(el.textContent.includes('Showing'), 'count text');
  assert.ok(el.textContent.includes('of 3'), 'total');
  assert.ok(el.querySelector('[data-column-row="name"][data-column-visible="true"]'), 'locked row visible');
  assert.ok(el.querySelector('[data-column-row="role"][data-column-visible="false"]'), 'hidden row not visible');
  assert.ok(el.querySelector('[data-column-up]') && el.querySelector('[data-column-down]'), 'reorder buttons');
  assert.ok(el.querySelector('[data-column-reset]'), 'reset link');

  const lockToggle = el.querySelector('[data-column-row="name"] [data-column-toggle]');
  assert.ok(lockToggle.disabled, 'locked toggle disabled');

  el.querySelector('[data-column-row="email"] [data-column-toggle]').click();
  assert.equal(toggles.length, 1, 'toggle fired');
  assert.equal(toggles[0].id, 'email', 'toggle id');
  assert.equal(toggles[0].visible, false, 'email became hidden');

  el.querySelector('[data-column-reset]').click();
  assert.equal(resets.length, 1, 'reset fired');

  // apply-button mode
  el.setAttribute('apply-mode', 'apply-button');
  el.visibleIds = ['email'];
  assert.ok(el.querySelector('[data-column-apply]'), 'apply button present');
  el.querySelector('[data-column-row="email"] [data-column-toggle]').click();
  assert.equal(toggles.length, 2, 'second toggle fired');
  el.querySelector('[data-column-apply]').click();
  assert.equal(applies.length, 1, 'apply fired');
  // draft started from visibleIds ['email'], then toggling email removed it → empty draft
  assert.deepEqual([...applies[0].visibleIds].sort(), [], 'drafted ids applied');
});

test('StatusCountTabs — segmented strip renders and change fires', () => {
  const { el } = mount(tabsSource, 'StatusCountTabsElement', 'status-count-tabs');
  const changes = collect(el, 'change');
  el.tabs = [
    { id: 'all', label: 'All', count: 42 },
    { id: 'open', label: 'Open', count: 7 },
    { id: 'closed', label: 'Closed', count: 35 },
  ];
  el.value = 'open';

  assert.ok(el.querySelector('[data-status-tab="all"]'), 'all tab');
  assert.ok(el.querySelector('[data-status-tab="open"]'), 'open tab');
  assert.ok(el.textContent.includes('(42)'), 'all count');
  assert.ok(el.textContent.includes('(7)'), 'open count');
  assert.ok(el.querySelector('[data-status-tab="open"]').getAttribute('aria-selected') === 'true', 'open selected');
  assert.ok(el.innerHTML.includes('rounded-t-lg'), 'docked radius');
  assert.ok(el.innerHTML.includes('inset'), 'inset shadow');

  el.querySelector('[data-status-tab="closed"]').click();
  assert.equal(changes.length, 1, 'change fired');
  assert.equal(changes[0].id, 'closed', 'change id');
  assert.ok(el.querySelector('[data-status-tab="closed"]').getAttribute('aria-selected') === 'true', 'closed now selected');
  assert.ok(el.querySelector('[data-status-tab="open"]').getAttribute('aria-selected') === 'false', 'open deselected');

  const sm = mount(tabsSource, 'StatusCountTabsElement', 'status-count-tabs', { size: 'sm', 'full-width': 'true' });
  sm.el.tabs = [{ id: 'a', label: 'A' }];
  sm.el.value = 'a';
  assert.ok(sm.el.innerHTML.includes('px-3 py-1.5'), 'small padding');
  assert.ok(sm.el.innerHTML.includes('w-full'), 'full width');
});

test('EntityMultiSelectPicker — search filter, toggle pick, confirm and dismiss', () => {
  const { el, window } = mount(pickerSource, 'EntityMultiSelectPickerElement', 'entity-picker');
  const selections = collect(el, 'select');
  const searches = collect(el, 'search');
  const dismisses = collect(el, 'dismiss');
  el.options = [
    { id: 'u1', label: 'Ada Lovelace' },
    { id: 'u2', label: 'Grace Hopper' },
    { id: 'u3', label: 'System', system: true },
    { id: 'u4', label: 'Linus T', avatar: 'https://example.com/a.png' },
  ];
  el.selected = ['u1'];

  assert.ok(el.querySelector('[data-picker-option="u1"]'), 'option row');
  assert.ok(el.querySelector('[data-picker-search]'), 'search input');
  assert.ok(el.innerHTML.includes('bg-indigo-600'), 'checked checkbox tone');
  assert.ok(el.innerHTML.includes('AL'), 'initials');
  assert.ok(el.innerHTML.includes('bg-sky-500'), 'system dot');
  assert.ok(el.innerHTML.includes('https://example.com/a.png'), 'avatar img');
  assert.ok(el.innerHTML.includes('Insert results'), 'confirm label');

  // toggle second option
  el.querySelector('[data-picker-option="u2"]').click();
  assert.ok(el.querySelector('[data-picker-option="u2"]').getAttribute('aria-pressed') === 'true', 'u2 picked');

  // search narrows
  const searchInput = el.querySelector('[data-picker-search]');
  searchInput.value = 'grace';
  searchInput.dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.equal(searches.length, 1, 'search fired');
  assert.equal(el.querySelectorAll('[data-picker-option]').length, 1, 'filtered to one');
  assert.equal(searches[0].query, 'grace', 'search detail');

  // clear search, confirm
  searchInput.value = '';
  searchInput.dispatchEvent(new window.Event('input', { bubbles: true }));
  el.querySelector('[data-picker-confirm]').click();
  assert.equal(selections.length, 1, 'select fired');
  assert.deepEqual([...selections[0].ids].sort(), ['u1', 'u2'], 'picked ids');

  el.querySelector('[data-picker-cancel]').click();
  assert.equal(dismisses.length, 1, 'dismiss fired');
});

test('FederatedSearchResultsPanel — chips filter, snippets highlight, select event', () => {
  const { el, window } = mount(federatedSource, 'FederatedSearchResultsPanelElement', 'federated-search');
  const queries = collect(el, 'query-change');
  const sourceChanges = collect(el, 'source-change');
  const selects = collect(el, 'result-select');
  el.results = [
    { id: 'r1', title: 'Deploy runbook', snippet: 'How to deploy safely', source: 'docs' },
    { id: 'r2', title: 'Deploy failures', snippet: 'Common deploy errors', source: 'issues' },
  ];
  el.setAttribute('source-filters', JSON.stringify([
    { id: 'docs', label: 'Docs' },
    { id: 'issues', label: 'Issues' },
  ]));
  el.setAttribute('selected-sources', JSON.stringify(['docs']));
  el.render();

  assert.ok(el.querySelector('[data-federated-input]'), 'search input');
  assert.ok(el.querySelector('[data-source-chip="docs"]'), 'docs chip');
  assert.ok(el.querySelector('[data-source-chip="docs"]').getAttribute('aria-pressed') === 'true', 'docs chip active');
  assert.ok(el.querySelector('[data-federated-result="r1"]'), 'result visible');
  assert.ok(!el.querySelector('[data-federated-result="r2"]'), 'issues result filtered out');
  assert.ok(el.querySelector('[data-federated-legend]'), 'legend present');
  assert.ok(el.textContent.includes('Press Tab to Ask AI'), 'ask ai pill');

  // toggle issues chip on
  el.querySelector('[data-source-chip="issues"]').click();
  assert.equal(sourceChanges.length, 1, 'source-change fired');
  assert.deepEqual([...sourceChanges[0].ids].sort(), ['docs', 'issues'], 'both sources active');
  assert.ok(el.querySelector('[data-federated-result="r2"]'), 'issues result now visible');

  // query input highlights
  const input = el.querySelector('[data-federated-input]');
  input.value = 'deploy';
  input.dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.equal(queries.length, 1, 'query-change fired');
  assert.ok(el.innerHTML.includes('<mark'), 'highlight rendered');
  assert.ok(el.innerHTML.includes('bg-yellow-200'), 'highlight tone');

  // select a result
  el.querySelector('[data-federated-result="r1"]').click();
  assert.equal(selects.length, 1, 'result-select fired');
  assert.equal(selects[0].result.id, 'r1', 'result detail');
});
