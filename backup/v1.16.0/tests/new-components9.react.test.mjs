/**
 * SSR smoke tests for the v1.10.x dialog batch (ConfirmDialog, ShortcutsOverlay).
 * Transpiles each TSX into the shared cache dir and static-renders it.
 * Interactive behavior lives in the vanilla jsdom suite.
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
    .outputText.replace(/from ["']\.\/UiIcon["']/g, 'from "./UiIcon.mjs"');
};

writeFileSync(join(cacheDir, 'UiIcon.mjs'), transpile('UiIcon.tsx'));

const load = async (file) => {
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n9.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — ConfirmDialog renders nothing while closed', async () => {
  const { ConfirmDialog } = await load('ConfirmDialog.tsx');
  const html = renderToStaticMarkup(h(ConfirmDialog, { isOpen: false, title: 'Delete project?' }));
  assert.equal(html, '', 'closed dialog renders no markup');
});

test('React SSR — ConfirmDialog renders tone icon, copy and buttons', async () => {
  const { ConfirmDialog } = await load('ConfirmDialog.tsx');
  const html = renderToStaticMarkup(
    h(ConfirmDialog, {
      isOpen: true,
      title: 'Delete project?',
      description: 'This cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Keep it',
      tone: 'danger',
    })
  );

  assert.ok(html.includes('role="dialog"'), 'dialog role');
  assert.ok(html.includes('aria-modal="true"'), 'modal semantics');
  assert.ok(html.includes('Delete project?'), 'title');
  assert.ok(html.includes('This cannot be undone.'), 'description');
  assert.ok(html.includes('>Delete<'), 'confirm label');
  assert.ok(html.includes('>Keep it<'), 'cancel label');
  assert.ok(html.includes('bg-red-600'), 'danger tone button');
});

test('React SSR — ConfirmDialog requireText gates the confirm button', async () => {
  const { ConfirmDialog } = await load('ConfirmDialog.tsx');
  const html = renderToStaticMarkup(
    h(ConfirmDialog, { isOpen: true, title: 'Drop table', requireText: 'users', confirmText: 'Drop' })
  );

  assert.ok(html.includes('Type'), 'type-to-confirm prompt');
  assert.ok(html.includes('>users</span>'), 'required token shown');
  assert.ok(html.includes('placeholder="users"'), 'input placeholder mirrors token');
  assert.ok(/disabled=""[^>]*>[\s\S]*Drop/.test(html) || html.includes('disabled'), 'confirm disabled until typed');
});

test('React SSR — ConfirmDialog loading disables both actions and spins', async () => {
  const { ConfirmDialog } = await load('ConfirmDialog.tsx');
  const html = renderToStaticMarkup(h(ConfirmDialog, { isOpen: true, title: 'Saving', loading: true }));
  assert.ok(html.includes('animate-spin'), 'spinner while loading');
  assert.equal((html.match(/disabled=""/g) || []).length, 2, 'cancel and confirm both disabled');
});

test('React SSR — ShortcutsOverlay buckets a flat list into groups', async () => {
  const { ShortcutsOverlay } = await load('ShortcutsOverlay.tsx');
  const html = renderToStaticMarkup(
    h(ShortcutsOverlay, {
      isOpen: true,
      shortcuts: [
        { keys: ['⌘', 'K'], label: 'Open command palette', group: 'Navigation' },
        { keys: ['⌘', 'B'], label: 'Toggle sidebar', group: 'Navigation' },
        { keys: ['⌘', 'Enter'], label: 'Send message', group: 'Composer' },
      ],
    })
  );

  assert.ok(html.includes('Navigation'), 'first bucket label');
  assert.ok(html.includes('Composer'), 'second bucket label');
  assert.ok(html.includes('>3<'), 'total shortcut count');
  assert.ok(html.includes('<kbd'), 'keycaps rendered');
  assert.ok(html.includes('Open command palette'), 'item label');
});

test('React SSR — ShortcutsOverlay renders nested groups with search input', async () => {
  const { ShortcutsOverlay } = await load('ShortcutsOverlay.tsx');
  const html = renderToStaticMarkup(
    h(ShortcutsOverlay, {
      isOpen: true,
      title: 'Cheat sheet',
      placeholder: 'Filter...',
      groups: [{ id: 'chat', label: 'Chat', items: [{ keys: ['↑'], label: 'Previous message' }] }],
    })
  );

  assert.ok(html.includes('Cheat sheet'), 'custom title');
  assert.ok(html.includes('placeholder="Filter..."'), 'custom placeholder');
  assert.ok(html.includes('Chat'), 'group label');
  assert.ok(html.includes('Previous message'), 'group item');
  assert.ok(!html.includes('General'), 'no synthetic group when groups are supplied');
});
