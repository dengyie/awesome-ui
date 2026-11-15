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

const kanbanSource = stripComponent('KanbanBoard.js', 'KanbanBoardElement');
const drawerSource = stripComponent('SideDrawer.js', 'SideDrawerElement');
const accountsSource = stripComponent('AccountSwitcher.js', 'AccountSwitcherElement');
const schedulerSource = stripComponent('SchedulerSlots.js', 'SchedulerSlotsElement');

function mount(source, exportName, tag, attrs = {}, buildChildren) {
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
  if (buildChildren) buildChildren(el, window);
  window.document.body.appendChild(el);
  return { el, window, dom };
}

const collect = (el, name) => {
  const seen = [];
  el.addEventListener(name, (event) => seen.push(event.detail));
  return seen;
};

const press = (window, key) =>
  window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

const COLUMNS = [
  { id: 'todo', title: 'Todo', accent: 'bg-zinc-400', limit: 3 },
  { id: 'doing', title: 'In progress', accent: 'bg-indigo-500' },
  { id: 'done', title: 'Done', accent: 'bg-emerald-500' },
];

const CARDS = [
  { id: 'c1', columnId: 'todo', title: 'Wire up auth', priority: 'high', tags: ['backend'], assignee: 'Ada Lovelace' },
  { id: 'c2', columnId: 'todo', title: 'Polish empty states', description: 'Copy pass', priority: 'low' },
  { id: 'c3', columnId: 'doing', title: 'Streaming markdown' },
];

test('KanbanBoard — renders columns, counts, cards and empty columns', () => {
  const { el } = mount(kanbanSource, 'KanbanBoardElement', 'kanban-board');
  el.columns = COLUMNS;
  el.cards = CARDS;

  assert.equal(el.querySelectorAll('.kanban-column').length, 3, 'three columns');
  assert.equal(el.querySelectorAll('.kanban-card').length, 3, 'three cards');
  assert.ok(el.innerHTML.includes('2/3'), 'limit count');
  assert.ok(el.innerHTML.includes('Wire up auth'), 'card title');
  assert.ok(el.innerHTML.includes('Copy pass'), 'description');
  assert.ok(el.innerHTML.includes('High'), 'priority chip');
  assert.ok(el.innerHTML.includes('backend'), 'tag');
  assert.ok(el.innerHTML.includes('AL'), 'assignee initials');
  assert.ok(el.innerHTML.includes('Drop cards here'), 'empty column placeholder');
  assert.equal(el.querySelectorAll('.column-add').length, 3, 'add button per column');
});

test('KanbanBoard — keyboard arrows move a card between columns', () => {
  const { el, window } = mount(kanbanSource, 'KanbanBoardElement', 'kanban-board');
  el.columns = COLUMNS;
  el.cards = CARDS;
  const moves = collect(el, 'move-card');

  const card = el.querySelector('.kanban-card[data-card="c1"]');
  card.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));

  assert.equal(moves.length, 1, 'move-card fired');
  assert.deepEqual(moves[0], { cardId: 'c1', from: 'todo', to: 'doing' }, 'from/to reported');
});

test('KanbanBoard — arrow at the last column is a no-op', () => {
  const { el, window } = mount(kanbanSource, 'KanbanBoardElement', 'kanban-board');
  el.columns = COLUMNS;
  el.cards = [...CARDS, { id: 'c4', columnId: 'done', title: 'Shipped' }];
  const moves = collect(el, 'move-card');

  const card = el.querySelector('.kanban-card[data-card="c4"]');
  card.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));

  assert.equal(moves.length, 0, 'no move past the last column');
});

test('KanbanBoard — drop moves the dragged card into the target column', () => {
  const { el, window } = mount(kanbanSource, 'KanbanBoardElement', 'kanban-board');
  el.columns = COLUMNS;
  el.cards = CARDS;
  const moves = collect(el, 'move-card');

  const target = el.querySelector('.kanban-column[data-column="done"]');
  const event = new window.Event('drop', { bubbles: true, cancelable: true });
  event.dataTransfer = { getData: () => 'c2' };
  target.dispatchEvent(event);

  assert.equal(moves.length, 1, 'move-card fired');
  assert.deepEqual(moves[0], { cardId: 'c2', from: 'todo', to: 'done' }, 'dropped into done');
});

test('KanbanBoard — card click and add-card events', () => {
  const { el } = mount(kanbanSource, 'KanbanBoardElement', 'kanban-board');
  el.columns = COLUMNS;
  el.cards = CARDS;
  const clicks = collect(el, 'card-click');
  const adds = collect(el, 'add-card');

  el.querySelector('.kanban-card[data-card="c3"]').click();
  assert.equal(clicks.length, 1, 'card-click fired');
  assert.equal(clicks[0].id, 'c3', 'clicked card');

  el.querySelector('.column-add[data-column="doing"]').click();
  assert.deepEqual(adds, ['doing'], 'add-card carries the column id');
});

test('SideDrawer — closed renders nothing', () => {
  const { el } = mount(drawerSource, 'SideDrawerElement', 'side-drawer', { title: 'Filters' });
  assert.equal(el.innerHTML.trim(), '', 'no markup while closed');
});

test('SideDrawer — open moves light-DOM children into the body and footer', () => {
  const { el } = mount(
    drawerSource,
    'SideDrawerElement',
    'side-drawer',
    { open: '', title: 'Filters', description: 'Narrow it down', side: 'left', size: 'lg' },
    (host, window) => {
      const body = window.document.createElement('p');
      body.textContent = 'Body copy';
      const footer = window.document.createElement('button');
      footer.setAttribute('slot', 'footer');
      footer.textContent = 'Apply';
      host.appendChild(body);
      host.appendChild(footer);
    }
  );

  assert.ok(el.querySelector('[role="dialog"]'), 'dialog rendered');
  assert.ok(el.querySelector('.drawer-body-content').textContent.includes('Body copy'), 'body child moved');
  assert.ok(el.querySelector('.drawer-footer').textContent.includes('Apply'), 'footer child moved');
  assert.ok(el.innerHTML.includes('Narrow it down'), 'description');
  assert.ok(el.innerHTML.includes('max-w-xl'), 'lg size');
  assert.ok(el.innerHTML.includes('mr-auto border-r'), 'left side');
});

test('SideDrawer — close button, backdrop and Escape all emit close', () => {
  const { el, window } = mount(drawerSource, 'SideDrawerElement', 'side-drawer', { open: '', title: 'Filters' });
  const closes = collect(el, 'close');

  el.querySelector('.drawer-close').click();
  assert.equal(closes.length, 1, 'close button');

  el.querySelector('.drawer-backdrop').click();
  assert.equal(closes.length, 2, 'backdrop');

  press(window, 'Escape');
  assert.equal(closes.length, 3, 'escape');
});

test('SideDrawer — Escape is ignored while closed', () => {
  const { el, window } = mount(drawerSource, 'SideDrawerElement', 'side-drawer', { title: 'Filters' });
  const closes = collect(el, 'close');

  press(window, 'Escape');
  assert.equal(closes.length, 0, 'no close event when closed');
});

test('AccountSwitcher — trigger shows the current account, menu starts closed', () => {
  const { el } = mount(accountsSource, 'AccountSwitcherElement', 'account-switcher', { 'current-id': 'a1' });
  el.accounts = [
    { id: 'a1', name: 'Ada Lovelace', email: 'ada@acme.dev', role: 'Owner', plan: 'Pro' },
    { id: 'a2', name: 'Grace Hopper', email: 'grace@navy.mil' },
  ];

  assert.ok(el.querySelector('.account-trigger').textContent.includes('Ada Lovelace'), 'current name');
  assert.ok(el.querySelector('.account-trigger').textContent.includes('ada@acme.dev'), 'current email');
  assert.equal(el.querySelector('.account-menu'), null, 'menu closed');
  assert.equal(el.querySelector('.account-trigger').getAttribute('aria-expanded'), 'false', 'collapsed');
});

test('AccountSwitcher — opening lists accounts and switching emits + closes', () => {
  const { el } = mount(accountsSource, 'AccountSwitcherElement', 'account-switcher', { 'current-id': 'a1' });
  el.accounts = [
    { id: 'a1', name: 'Ada Lovelace', email: 'ada@acme.dev', role: 'Owner', plan: 'Pro' },
    { id: 'a2', name: 'Grace Hopper', email: 'grace@navy.mil' },
  ];
  const switches = collect(el, 'switch');
  const openChanges = collect(el, 'open-change');

  el.querySelector('.account-trigger').click();
  assert.ok(el.querySelector('.account-menu'), 'menu opened');
  assert.equal(el.querySelectorAll('.account-row').length, 2, 'both accounts listed');
  assert.ok(el.innerHTML.includes('Owner · Pro'), 'role and plan meta');
  assert.equal(el.querySelector('.account-row[data-account="a1"]').getAttribute('aria-checked'), 'true', 'active marked');

  el.querySelector('.account-row[data-account="a2"]').click();
  assert.equal(switches.length, 1, 'switch fired');
  assert.equal(switches[0].id, 'a2', 'switched account');
  assert.equal(el.querySelector('.account-menu'), null, 'menu closed after switch');
  assert.deepEqual(openChanges, [true, false], 'open-change toggled');
});

test('AccountSwitcher — add, sign out and Escape', () => {
  const { el, window } = mount(accountsSource, 'AccountSwitcherElement', 'account-switcher', { 'current-id': 'a1' });
  el.accounts = [{ id: 'a1', name: 'Ada Lovelace' }];
  const adds = collect(el, 'add-account');
  const outs = collect(el, 'sign-out');

  el.querySelector('.account-trigger').click();
  el.querySelector('.account-add').click();
  assert.equal(adds.length, 1, 'add-account fired');
  assert.equal(el.querySelector('.account-menu'), null, 'closed after add');

  el.querySelector('.account-trigger').click();
  el.querySelector('.account-signout').click();
  assert.equal(outs.length, 1, 'sign-out fired');

  el.querySelector('.account-trigger').click();
  press(window, 'Escape');
  assert.equal(el.querySelector('.account-menu'), null, 'escape closes');
});

test('AccountSwitcher — outside mousedown closes the menu', () => {
  const { el, window } = mount(accountsSource, 'AccountSwitcherElement', 'account-switcher', { 'current-id': 'a1' });
  el.accounts = [{ id: 'a1', name: 'Ada Lovelace' }];

  el.querySelector('.account-trigger').click();
  assert.ok(el.querySelector('.account-menu'), 'opened');

  window.document.body.dispatchEvent(new window.MouseEvent('mousedown', { bubbles: true }));
  assert.equal(el.querySelector('.account-menu'), null, 'closed by outside click');
});

test('SchedulerSlots — groups slots by period with an open count', () => {
  const { el } = mount(schedulerSource, 'SchedulerSlotsElement', 'scheduler-slots', {
    date: '2026-11-20',
    timezone: 'GMT+8',
  });
  el.slots = [
    { id: 's1', time: '09:00' },
    { id: 's2', time: '11:30' },
    { id: 's3', time: '14:00', available: false, note: 'Lunch block' },
    { id: 's4', time: '18:30' },
  ];

  assert.ok(el.innerHTML.includes('Nov 20'), 'human date');
  assert.ok(el.innerHTML.includes('All times in GMT+8'), 'timezone');
  assert.ok(el.innerHTML.includes('Morning'), 'morning group');
  assert.ok(el.innerHTML.includes('Afternoon'), 'afternoon group');
  assert.ok(el.innerHTML.includes('Evening'), 'evening group');
  assert.ok(el.innerHTML.includes('9:00 AM'), '12h format');
  assert.ok(el.innerHTML.includes('6:30 PM'), 'evening format');
  assert.ok(el.innerHTML.includes('3 open'), 'open count');
  assert.ok(el.innerHTML.includes('Lunch block'), 'note');
  assert.equal(el.querySelectorAll('.slot').length, 4, 'all slots rendered');
});

test('SchedulerSlots — selecting a slot emits it, blocked slots are inert', () => {
  const { el } = mount(schedulerSource, 'SchedulerSlotsElement', 'scheduler-slots', {
    date: '2026-11-20',
    'selected-id': 's2',
  });
  el.slots = [
    { id: 's1', time: '09:00' },
    { id: 's2', time: '11:30' },
    { id: 's3', time: '14:00', available: false },
  ];
  const selected = collect(el, 'select');

  assert.equal(el.querySelector('.slot[data-slot="s2"]').getAttribute('aria-pressed'), 'true', 'selected marked');
  assert.equal(el.querySelector('.slot[data-slot="s3"]').disabled, true, 'blocked disabled');

  el.querySelector('.slot[data-slot="s1"]').click();
  assert.equal(selected.length, 1, 'select fired');
  assert.equal(selected[0].id, 's1', 'selected slot');

  el.querySelector('.slot[data-slot="s3"]').click();
  assert.equal(selected.length, 1, 'blocked slot emits nothing');
});

test('SchedulerSlots — empty state uses the custom text', () => {
  const { el } = mount(schedulerSource, 'SchedulerSlotsElement', 'scheduler-slots', {
    date: '2026-11-20',
    'empty-text': 'Fully booked',
  });
  el.slots = [];

  assert.ok(el.innerHTML.includes('Fully booked'), 'custom empty copy');
  assert.ok(el.innerHTML.includes('0 open'), 'zero open');
});
