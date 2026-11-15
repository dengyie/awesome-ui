/**
 * SSR smoke tests for the v1.18.0 batch
 * (ToggleSwitch, Stepper, SearchInput, Tag, Modal).
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
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n17.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — ToggleSwitch renders switch with aria state and label', async () => {
  const { ToggleSwitch } = await load('ToggleSwitch.tsx');
  const html = renderToStaticMarkup(
    h(ToggleSwitch, { label: 'Email alerts', description: 'Weekly digest', checked: true })
  );
  assert.ok(html.includes('role="switch"'), 'switch role');
  assert.ok(html.includes('aria-checked="true"'), 'on state');
  assert.ok(html.includes('Email alerts'), 'label');
  assert.ok(html.includes('Weekly digest'), 'description');
  assert.ok(html.includes('bg-indigo-600'), 'on track color');
});

test('React SSR — ToggleSwitch off state and sm size', async () => {
  const { ToggleSwitch } = await load('ToggleSwitch.tsx');
  const html = renderToStaticMarkup(h(ToggleSwitch, { label: 'SMS', size: 'sm' }));
  assert.ok(html.includes('aria-checked="false"'), 'off state');
  assert.ok(html.includes('bg-zinc-300'), 'off track color');
  assert.ok(html.includes('h-4 w-8'), 'sm track size');

  const disabled = renderToStaticMarkup(h(ToggleSwitch, { label: 'X', disabled: true }));
  assert.ok(disabled.includes('disabled'), 'disabled flag passes through');
});

test('React SSR — Stepper marks complete/current/upcoming', async () => {
  const { Stepper } = await load('Stepper.tsx');
  const html = renderToStaticMarkup(
    h(Stepper, {
      current: 2,
      steps: [
        { id: 'a', label: 'Account', description: 'Basics' },
        { id: 'b', label: 'Workspace' },
        { id: 'c', label: 'Deploy' },
      ],
    })
  );
  assert.ok(html.includes('bg-indigo-600'), 'complete circle');
  assert.ok(html.includes('aria-current="step"'), 'current marker');
  assert.ok(html.includes('Deploy'), 'upcoming label');
  assert.ok(html.includes('Basics'), 'description');
});

test('React SSR — Stepper error status and clickability', async () => {
  const { Stepper } = await load('Stepper.tsx');
  const html = renderToStaticMarkup(
    h(Stepper, {
      steps: [
        { id: 'a', label: 'Build', status: 'error' },
        { id: 'b', label: 'Ship', status: 'complete' },
      ],
    })
  );
  assert.ok(html.includes('bg-rose-500'), 'error tone');
  assert.ok((html.match(/<button/g) || []).length >= 2, 'steps clickable when onStepClick given');
});

test('React SSR — SearchInput controlled with clear affordance', async () => {
  const { SearchInput } = await load('SearchInput.tsx');
  const html = renderToStaticMarkup(
    h(SearchInput, { value: 'logs', placeholder: 'Search logs…', onSearch: () => {} })
  );
  assert.ok(html.includes('role="searchbox"'), 'searchbox role');
  assert.ok(html.includes('Search logs…'), 'placeholder');
  assert.ok(html.includes('>logs<') || html.includes('value="logs"'), 'controlled value');
  assert.ok(html.includes('aria-label="Clear search"'), 'clear affordance');
});

test('React SSR — SearchInput shortcut and loading spinner', async () => {
  const { SearchInput } = await load('SearchInput.tsx');
  const idle = renderToStaticMarkup(h(SearchInput, { defaultValue: '', shortcut: '⌘K' }));
  assert.ok(idle.includes('<kbd'), 'shortcut kbd');
  const loading = renderToStaticMarkup(h(SearchInput, { defaultValue: 'x', loading: true }));
  assert.ok(loading.includes('animate-spin'), 'spinner');
  assert.equal(loading.includes('<kbd'), false, 'no kbd while loading');
});

test('React SSR — Tag tones, sizes and removable', async () => {
  const { Tag } = await load('Tag.tsx');
  const html = renderToStaticMarkup(
    h('span', null,
      h(Tag, { label: 'beta', tone: 'indigo', removable: true }),
      h(Tag, { label: 'stable', tone: 'emerald', size: 'sm' })
    )
  );
  assert.ok(html.includes('beta'), 'label');
  assert.ok(html.includes('bg-indigo-50'), 'indigo tone');
  assert.ok(html.includes('bg-emerald-50'), 'emerald tone');
  assert.ok(html.includes('text-[9.5px]'), 'sm sizing');
  assert.ok(html.includes('aria-label="Remove beta"'), 'remove affordance');
});

test('React SSR — Tag clickable renders button', async () => {
  const { Tag } = await load('Tag.tsx');
  const html = renderToStaticMarkup(h(Tag, { label: 'Filter', tone: 'amber', onClick: () => {} }));
  assert.ok(html.includes('<button'), 'clickable tag is a button');
});

test('React SSR — Modal closed renders nothing, open renders dialog', async () => {
  const { Modal } = await load('Modal.tsx');
  const closed = renderToStaticMarkup(h(Modal, { open: false, title: 'Hidden' }));
  assert.equal(closed, '', 'closed renders nothing');

  const html = renderToStaticMarkup(
    h(Modal, { open: true, title: 'Delete project?', description: 'This cannot be undone.' },
      h('p', null, 'Body copy'),
      h('button', { slot: 'footer' }, 'Confirm')
    )
  );
  assert.ok(html.includes('role="dialog"'), 'dialog role');
  assert.ok(html.includes('aria-modal="true"'), 'modal flag');
  assert.ok(html.includes('Delete project?'), 'title');
  assert.ok(html.includes('This cannot be undone.'), 'description');
  assert.ok(html.includes('Body copy'), 'children body');
  assert.ok(html.includes('Confirm'), 'footer slot');
  assert.ok(html.includes('aria-label="Close"'), 'close button');
  assert.ok(html.includes('backdrop-blur'), 'backdrop treatment');
});
