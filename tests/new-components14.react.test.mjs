/**
 * SSR smoke tests for the v1.15.0 primitives batch
 * (Tabs, Accordion, AvatarGroup, FilterBar).
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
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n14.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity', label: 'Activity', badge: 3 },
  { id: 'settings', label: 'Settings', disabled: true },
];

test('React SSR — Tabs renders tablist with active state', async () => {
  const { Tabs } = await load('Tabs.tsx');
  const html = renderToStaticMarkup(h(Tabs, { tabs: TABS }));

  assert.ok(html.includes('role="tablist"'), 'tablist');
  assert.ok(html.includes('aria-label="Tabs"'), 'default label');
  assert.equal((html.match(/role="tab"/g) || []).length, 3, 'three tabs');
  assert.ok(html.includes('aria-selected="true"'), 'one selected');
  assert.ok(html.includes('tabindex="0"'), 'roving tabindex');
  assert.ok(html.includes('tabindex="-1"'), 'inactive tabindex');
  assert.ok(html.includes('disabled'), 'disabled tab');
  assert.ok(html.includes('>3<'), 'badge');
});

test('React SSR — Tabs honours controlled activeId and pills variant', async () => {
  const { Tabs } = await load('Tabs.tsx');
  const html = renderToStaticMarkup(
    h(Tabs, { tabs: TABS, activeId: 'activity', variant: 'pills', ariaLabel: 'Views' })
  );
  assert.ok(html.includes('aria-label="Views"'), 'custom label');
  assert.ok(html.includes('rounded-lg bg-zinc-100 p-1'), 'pills container');
  const activity = html.slice(html.indexOf('id="tab-activity"'));
  assert.ok(activity.slice(0, 200).includes('aria-selected="true"'), 'activity selected');
});

test('React SSR — Accordion renders triggers and default-open panel', async () => {
  const { Accordion } = await load('Accordion.tsx');
  const html = renderToStaticMarkup(
    h(Accordion, {
      items: [
        { id: 'a', title: 'What is it?', content: 'A component kit.', defaultOpen: true },
        { id: 'b', title: 'Is it free?', description: 'Licensing', content: 'MIT.' },
      ],
    })
  );

  assert.ok(html.includes('aria-expanded="true"'), 'open trigger');
  assert.ok(html.includes('aria-expanded="false"'), 'closed trigger');
  assert.ok(html.includes('A component kit.'), 'open panel content');
  assert.equal(html.includes('MIT.'), false, 'closed panel hidden');
  assert.ok(html.includes('role="region"'), 'region role');
  assert.ok(html.includes('Licensing'), 'description');
  assert.ok(html.includes('rotate-180'), 'chevron rotated');
});

test('React SSR — Accordion allowMultiple opens several panels', async () => {
  const { Accordion } = await load('Accordion.tsx');
  const html = renderToStaticMarkup(
    h(Accordion, {
      allowMultiple: true,
      defaultOpenIds: ['a', 'b'],
      items: [
        { id: 'a', title: 'A', content: 'Alpha' },
        { id: 'b', title: 'B', content: 'Beta' },
      ],
    })
  );
  assert.ok(html.includes('Alpha'), 'first open');
  assert.ok(html.includes('Beta'), 'second open');
  assert.equal((html.match(/aria-expanded="true"/g) || []).length, 2, 'two open');
});

test('React SSR — AvatarGroup renders initials, overflow and status', async () => {
  const { AvatarGroup } = await load('AvatarGroup.tsx');
  const html = renderToStaticMarkup(
    h(AvatarGroup, {
      max: 2,
      members: [
        { id: '1', name: 'Ada Lovelace', status: 'online' },
        { id: '2', name: 'Grace Hopper' },
        { id: '3', name: 'Alan Turing' },
        { id: '4', name: 'Margaret Hamilton' },
      ],
    })
  );

  assert.ok(html.includes('>AL<'), 'initials Ada Lovelace');
  assert.ok(html.includes('>GH<'), 'initials Grace Hopper');
  assert.equal(html.includes('>AT<'), false, 'third hidden by max');
  assert.ok(html.includes('+2'), 'overflow chip');
  assert.ok(html.includes('bg-emerald-500'), 'online dot');
  assert.ok(html.includes('aria-label="Ada Lovelace"'), 'accessible name');
});

test('React SSR — AvatarGroup uses image and user fallback', async () => {
  const { AvatarGroup } = await load('AvatarGroup.tsx');
  const html = renderToStaticMarkup(
    h(AvatarGroup, {
      size: 'lg',
      members: [
        { id: '1', name: 'Photo', src: 'https://example.com/a.png' },
        { id: '2', name: '   ' },
      ],
    })
  );
  assert.ok(html.includes('src="https://example.com/a.png"'), 'image avatar');
  assert.ok(html.includes('h-11 w-11'), 'large size');
  assert.ok(html.includes('<svg'), 'user icon fallback');
});

test('React SSR — FilterBar renders chips and clear action', async () => {
  const { FilterBar } = await load('FilterBar.tsx');
  const html = renderToStaticMarkup(
    h(FilterBar, {
      filters: [
        { id: 'status', label: 'Status', options: [{ value: 'open', label: 'Open', count: 4 }] },
        { id: 'owner', label: 'Owner', options: [{ value: 'me', label: 'Me' }] },
      ],
      selected: { status: ['open'] },
    })
  );

  assert.ok(html.includes('Status'), 'first chip');
  assert.ok(html.includes('Owner'), 'second chip');
  assert.ok(html.includes('aria-expanded="false"'), 'dropdowns closed');
  assert.ok(html.includes('Clear all'), 'clear action');
  assert.ok(html.includes('bg-indigo-50'), 'active chip tone');
  assert.equal(html.includes('>Open<'), false, 'options hidden until opened');
});

test('React SSR — FilterBar without selection has no clear action', async () => {
  const { FilterBar } = await load('FilterBar.tsx');
  const html = renderToStaticMarkup(
    h(FilterBar, { filters: [{ id: 'status', label: 'Status', options: [] }] })
  );
  assert.equal(html.includes('Clear all'), false, 'no clear');
  assert.ok(html.includes('Status'), 'chip still renders');
});
