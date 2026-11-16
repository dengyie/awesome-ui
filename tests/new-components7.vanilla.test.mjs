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

const pricingSource = stripComponent('PricingTable.js', 'PricingTableElement');
const statSource = stripComponent('StatCard.js', 'StatCardElement');
const tableSource = stripComponent('DataTable.js', 'DataTableElement');
const runLogSource = stripComponent('AgentRunLog.js', 'AgentRunLogElement');

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
    `${uiIconSource}\n${source}\nreturn ${exportName};`
  );
  factory(window.customElements, window.HTMLElement, window.CustomEvent, window.document);
  const el = window.document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  window.document.body.appendChild(el);
  return { el, window, dom };
}

test('PricingTable — renders plans, highlights recommended, dispatches select', () => {
  const plans = [
    { name: 'Free', price: '$0', features: ['1 workspace', 'Community support'] },
    { name: 'Pro', price: '$20', period: 'mo', features: ['Unlimited <b>projects</b>'], highlighted: true },
    { name: 'Team', price: '$40', description: 'For growing teams', features: ['SSO'], ctaText: 'Contact us' },
  ];
  const { el } = mount(pricingSource, 'PricingTableElement', 'pricing-table');
  el.plans = plans;

  assert.ok(el.innerHTML.includes('Free'), 'free plan rendered');
  assert.ok(el.innerHTML.includes('ring-2 ring-indigo-600'), 'highlighted plan ring applied');
  assert.ok(el.innerHTML.includes('Most popular'), 'default badge rendered');
  assert.ok(!el.innerHTML.includes('<b>projects</b>'), 'feature text escaped (no XSS)');
  assert.ok(el.innerHTML.includes('Contact us'), 'custom cta text rendered');

  let selected = null;
  el.addEventListener('select', (event) => (selected = event.detail));
  const ctaButtons = el.querySelectorAll('.plan-cta');
  assert.equal(ctaButtons.length, 3, 'one cta per plan');
  ctaButtons[1].click();
  assert.equal(selected.name, 'Pro', 'select event carries the clicked plan');
});

test('StatCard — renders value, delta sign, sparkline; omits sparkline without trend', () => {
  const { el } = mount(statSource, 'StatCardElement', 'stat-card', {
    label: 'Monthly revenue',
    value: '$12.4k',
    delta: '8.2',
    'delta-label': 'vs last month',
    trend: '[3,5,4,7,6,9]',
    icon: 'trending-up',
  });

  assert.ok(el.innerHTML.includes('Monthly revenue'), 'label rendered');
  assert.ok(el.innerHTML.includes('$12.4k'), 'value rendered');
  assert.ok(el.innerHTML.includes('+8.2%'), 'positive delta formatted with plus sign');
  assert.ok(el.innerHTML.includes('vs last month'), 'delta label rendered');
  assert.ok(el.innerHTML.includes('stroke-emerald-500'), 'positive sparkline color');
  assert.ok(el.querySelector('svg polyline'), 'sparkline polyline rendered');

  const { el: negative } = mount(statSource, 'StatCardElement', 'stat-card', {
    label: 'Churn',
    value: '4.1%',
    delta: '-2.3',
  });
  assert.ok(negative.innerHTML.includes('-2.3%'), 'negative delta keeps sign');
  assert.ok(negative.innerHTML.includes('text-red-500'), 'negative delta color');
  assert.ok(!negative.querySelector('svg polyline'), 'no sparkline without trend data');
});

test('DataTable — sorts rows, hovering actions, selection bar and action dispatch', () => {
  const rows = [
    { name: 'Alpha', seats: 12 },
    { name: 'Bravo', seats: 3 },
    { name: 'Charlie', seats: 27 },
  ];
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'seats', label: 'Seats', align: 'right' },
  ];

  const { el } = mount(tableSource, 'DataTableElement', 'data-table', { selectable: 'true' });
  el.columns = columns;
  el.actions = [{ label: 'Remove', icon: 'trash', onClick: (row) => (row.__removed = true) }];
  el.rows = rows;

  assert.equal(el.querySelectorAll('tbody tr').length, 3, 'three body rows rendered');
  assert.ok(el.innerHTML.includes('tabular-nums'), 'right-aligned numeric column uses tabular-nums');

  // sort by name ascending
  let sortEvent = null;
  el.addEventListener('sort', (event) => (sortEvent = event.detail));
  el.querySelector('[data-sort="name"]').click();
  assert.deepEqual(sortEvent, { key: 'name', direction: 'asc' }, 'sort event dispatched');

  // select all shows the floating batch bar
  const selectAll = el.querySelector('[data-select-all]');
  selectAll.checked = true;
  selectAll.dispatchEvent(new el.ownerDocument.defaultView.Event('change'));
  assert.ok(el.innerHTML.includes('3 selected'), 'batch bar reflects selection count');

  // row action dispatch
  let actionEvent = null;
  el.addEventListener('action', (event) => (actionEvent = event.detail));
  el.querySelector('[data-action]').click();
  assert.ok(actionEvent, 'row action event dispatched');
  assert.equal(actionEvent.action.label, 'Remove', 'action payload carries the action');

  // clear selection
  el.querySelector('[data-clear]').click();
  assert.ok(!el.innerHTML.includes('selected'), 'batch bar dismissed after clear');
});

test('AgentRunLog — status icons, duration formatting, expandable terminal detail', () => {
  const steps = [
    { id: 's1', label: 'Parse request', status: 'done', durationMs: 240 },
    { id: 's2', label: 'Run migration', status: 'running', durationMs: 1500, detail: '$ npm run migrate\nOK 12 tables' },
    { id: 's3', label: 'Notify', status: 'pending' },
  ];
  const { el } = mount(runLogSource, 'AgentRunLogElement', 'agent-run-log', { title: 'Deploy run' });
  el.steps = steps;

  assert.ok(el.innerHTML.includes('Deploy run'), 'custom title rendered');
  assert.ok(el.innerHTML.includes('1/3'), 'done counter rendered');
  assert.ok(el.innerHTML.includes('240ms'), 'millisecond duration formatted');
  assert.ok(el.innerHTML.includes('1.5s'), 'second duration formatted');
  assert.ok(el.innerHTML.includes('animate-spin'), 'running step spins');
  assert.ok(el.innerHTML.includes('text-emerald-500'), 'done step colored');
  assert.ok(el.innerHTML.includes('12 tables'), 'running detail expanded by default (autoExpandRunning)');

  let toggleEvent = null;
  el.addEventListener('toggle', (event) => (toggleEvent = event.detail));
  el.querySelector('[data-step="s2"]').click();
  assert.equal(toggleEvent.expanded, false, 'clicking collapses the running step');
  assert.ok(!el.innerHTML.includes('12 tables'), 'collapsed detail removed from DOM');

  el.querySelector('[data-step="s2"]').click();
  assert.ok(el.innerHTML.includes('12 tables'), 're-expanding restores the detail');
});
