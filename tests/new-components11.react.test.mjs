/**
 * SSR smoke tests for the v1.12.0 batch (KanbanBoard, SideDrawer,
 * AccountSwitcher, SchedulerSlots). Interactive behavior lives in the vanilla suite.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const cacheDir = join(here, 'node_modules', '.cache-components');
mkdirSync(cacheDir, { recursive: true });

const transpile = (file) => {
  const source = readFileSync(join(root, 'react', file), 'utf8');
  return ts
    .transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        jsx: ts.JsxEmit.React,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
      },
    })
    .outputText.replace(/from ["']\.\/UiIcon["']/g, 'from "./UiIcon.mjs"')
    .replace(/import\s*{\s*([^}]*)\s*}\s*from\s*["']\.\/UiIcon\.mjs["'];/g, (match) =>
      match.replace(/type\s+/g, '')
    );
};

writeFileSync(join(cacheDir, 'UiIcon.mjs'), transpile('UiIcon.tsx'));

const load = async (file) => {
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n11.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — KanbanBoard renders columns, counts and cards', async () => {
  const { KanbanBoard } = await load('KanbanBoard.tsx');
  const html = renderToStaticMarkup(
    h(KanbanBoard, {
      columns: [
        { id: 'todo', title: 'Todo', accent: 'bg-zinc-400', limit: 3 },
        { id: 'doing', title: 'In progress', accent: 'bg-indigo-500' },
        { id: 'done', title: 'Done', accent: 'bg-emerald-500' },
      ],
      cards: [
        { id: 'c1', columnId: 'todo', title: 'Wire up auth', priority: 'high', tags: ['backend'], assignee: 'Ada Lovelace' },
        { id: 'c2', columnId: 'todo', title: 'Polish empty states', description: 'Copy pass', priority: 'low' },
        { id: 'c3', columnId: 'doing', title: 'Streaming markdown' },
      ],
      onAddCard: () => {},
    })
  );

  assert.ok(html.includes('Todo'), 'column 1');
  assert.ok(html.includes('In progress'), 'column 2');
  assert.ok(html.includes('Done'), 'column 3');
  assert.ok(html.includes('2/3'), 'limit shown as n/limit');
  assert.ok(html.includes('Wire up auth'), 'card title');
  assert.ok(html.includes('Polish empty states'), 'second card');
  assert.ok(html.includes('Copy pass'), 'card description');
  assert.ok(html.includes('High'), 'priority chip');
  assert.ok(html.includes('backend'), 'tag chip');
  assert.ok(html.includes('AL'), 'assignee initials');
  assert.ok(html.includes('Drop cards here'), 'empty column placeholder');
  assert.ok(html.includes('Add card to Todo'), 'add button label');
  assert.ok(html.includes('draggable="true"'), 'cards are draggable');
});

test('React SSR — KanbanBoard hides the add button without onAddCard', async () => {
  const { KanbanBoard } = await load('KanbanBoard.tsx');
  const html = renderToStaticMarkup(h(KanbanBoard, { columns: [{ id: 'a', title: 'A' }], cards: [] }));
  assert.equal(html.includes('Add card to A'), false, 'no add affordance');
  assert.ok(html.includes('>0<'), 'zero count');
});

test('React SSR — SideDrawer renders nothing while closed', async () => {
  const { SideDrawer } = await load('SideDrawer.tsx');
  const html = renderToStaticMarkup(h(SideDrawer, { isOpen: false, title: 'Filters' }, h('p', null, 'Body')));
  assert.equal(html, '', 'closed drawer is empty');
});

test('React SSR — SideDrawer renders dialog, body and footer', async () => {
  const { SideDrawer } = await load('SideDrawer.tsx');
  const html = renderToStaticMarkup(
    h(
      SideDrawer,
      {
        isOpen: true,
        title: 'Filters',
        description: 'Narrow the result set',
        side: 'left',
        size: 'lg',
        footer: h('button', { type: 'button' }, 'Apply'),
      },
      h('p', null, 'Body copy')
    )
  );

  assert.ok(html.includes('role="dialog"'), 'dialog role');
  assert.ok(html.includes('aria-modal="true"'), 'modal semantics');
  assert.ok(html.includes('Filters'), 'title');
  assert.ok(html.includes('Narrow the result set'), 'description');
  assert.ok(html.includes('Body copy'), 'children rendered');
  assert.ok(html.includes('Apply'), 'footer rendered');
  assert.ok(html.includes('max-w-xl'), 'lg width');
  assert.ok(html.includes('mr-auto border-r'), 'left side');
  assert.ok(html.includes('Close drawer'), 'close label');
});

test('React SSR — AccountSwitcher shows the current account and stays closed', async () => {
  const { AccountSwitcher } = await load('AccountSwitcher.tsx');
  const html = renderToStaticMarkup(
    h(AccountSwitcher, {
      accounts: [
        { id: 'a1', name: 'Ada Lovelace', email: 'ada@acme.dev', role: 'Owner', plan: 'Pro' },
        { id: 'a2', name: 'Grace Hopper', email: 'grace@navy.mil' },
      ],
      currentId: 'a1',
    })
  );

  assert.ok(html.includes('Ada Lovelace'), 'current name');
  assert.ok(html.includes('ada@acme.dev'), 'current email');
  assert.ok(html.includes('AL'), 'initials avatar');
  assert.ok(html.includes('aria-expanded="false"'), 'collapsed by default');
  assert.equal(html.includes('Switch account'), false, 'menu not rendered while closed');
  assert.equal(html.includes('Grace Hopper'), false, 'other accounts hidden');
});

test('React SSR — AccountSwitcher falls back to the first account', async () => {
  const { AccountSwitcher } = await load('AccountSwitcher.tsx');
  const html = renderToStaticMarkup(
    h(AccountSwitcher, { accounts: [{ id: 'a1', name: 'Ada Lovelace' }], currentId: 'missing' })
  );
  assert.ok(html.includes('Ada Lovelace'), 'first account used');
});

test('React SSR — SchedulerSlots groups by period and marks availability', async () => {
  const { SchedulerSlots } = await load('SchedulerSlots.tsx');
  const html = renderToStaticMarkup(
    h(SchedulerSlots, {
      date: '2026-11-20',
      timezone: 'GMT+8',
      selectedId: 's2',
      slots: [
        { id: 's1', time: '09:00' },
        { id: 's2', time: '11:30' },
        { id: 's3', time: '14:00', available: false, note: 'Lunch block' },
        { id: 's4', time: '18:30' },
      ],
    })
  );

  assert.ok(html.includes('Nov 20'), 'human date');
  assert.ok(html.includes('All times in GMT+8'), 'timezone note');
  assert.ok(html.includes('Morning'), 'morning group');
  assert.ok(html.includes('Afternoon'), 'afternoon group');
  assert.ok(html.includes('Evening'), 'evening group');
  assert.ok(html.includes('9:00 AM'), '12h formatting');
  assert.ok(html.includes('11:30 AM'), 'minutes preserved');
  assert.ok(html.includes('6:30 PM'), 'evening formatting');
  assert.ok(html.includes('3 open'), 'open count excludes blocked slot');
  assert.ok(html.includes('aria-pressed="true"'), 'selected slot flagged');
  assert.ok(html.includes('disabled'), 'blocked slot disabled');
  assert.ok(html.includes('Lunch block'), 'slot note');
});

test('React SSR — SchedulerSlots empty state', async () => {
  const { SchedulerSlots } = await load('SchedulerSlots.tsx');
  const html = renderToStaticMarkup(h(SchedulerSlots, { date: '2026-11-20', slots: [] }));
  assert.ok(html.includes('No slots available for this day.'), 'empty copy');
  assert.ok(html.includes('0 open'), 'zero open');
});
