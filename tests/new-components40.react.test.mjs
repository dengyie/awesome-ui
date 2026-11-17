/**
 * SSR smoke tests for the v1.40.0 batch
 * (AiRewriteMenu, PromptPerformanceTable, ShareAccessDialog).
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

const load = async (file) => {
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n40.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — AiRewriteMenu trigger, actions and badges', async () => {
  const { default: AiRewriteMenu } = await load('AiRewriteMenu.tsx');
  const html = renderToStaticMarkup(
    h(AiRewriteMenu, {
      open: true,
      actions: [
        { id: 'a1', label: 'Expand' },
        { id: 'a2', label: 'Rephrase' },
        { id: 'a3', label: 'My tone of voice', badge: 'Get feature' },
        { id: 'a4', label: 'Fix grammar & spelling' },
        { id: 'a5', label: 'Translate to...' },
      ],
    })
  );
  assert.ok(html.includes('data-rewrite-menu-root'), 'root hook');
  assert.ok(html.includes('data-rewrite-trigger'), 'trigger hook');
  assert.ok(html.includes('aria-expanded="true"'), 'expanded state');
  assert.ok(html.includes('Rewrite'), 'trigger label');
  assert.ok(html.includes('data-rewrite-menu'), 'menu hook');
  assert.ok(html.includes('data-rewrite-item="a1"'), 'item hook');
  assert.ok(html.includes('Expand'), 'expand label');
  assert.ok(html.includes('Rephrase'), 'rephrase label');
  assert.ok(html.includes('data-rewrite-item-badge'), 'badge hook');
  assert.ok(html.includes('Get feature'), 'badge text');
  assert.ok(html.includes('Fix grammar &amp; spelling'), 'grammar label escaped');
  assert.ok(html.includes('Translate to...'), 'translate label');

  const closed = renderToStaticMarkup(h(AiRewriteMenu, { open: false, actions: [{ id: 'a1', label: 'Expand' }] }));
  assert.ok(closed.includes('data-rewrite-trigger'), 'trigger still rendered');
  assert.ok(!closed.includes('data-rewrite-item'), 'menu items hidden when closed');

  const empty = renderToStaticMarkup(h(AiRewriteMenu, { open: true }));
  assert.ok(!empty.includes('data-rewrite-item'), 'no menu items without actions');
});

test('React SSR — PromptPerformanceTable columns and export CTA', async () => {
  const { default: PromptPerformanceTable } = await load('PromptPerformanceTable.tsx');
  const html = renderToStaticMarkup(
    h(PromptPerformanceTable, {
      rows: [
        { id: 'p1', prompt: 'best ai note taking app', visibility: '68%', sentiment: '8.2', position: '#1', mentions: '42', trend: 'up' },
        { id: 'p2', prompt: 'how to summarize lectures', visibility: '31%', sentiment: '7.4', position: '#4', mentions: '17', trend: 'down' },
      ],
    })
  );
  assert.ok(html.includes('data-prompt-performance-table'), 'host hook');
  assert.ok(html.includes('data-prompt-performance-title'), 'title hook');
  assert.ok(html.includes('Prompt performance'), 'default title');
  assert.ok(html.includes('data-prompt-performance-export'), 'export CTA');
  assert.ok(html.includes('Export'), 'export label');
  assert.ok(html.includes('data-prompt-performance-list'), 'list hook');
  assert.ok(html.includes('data-prompt-row="p1"'), 'row hook');
  assert.ok(html.includes('best ai note taking app'), 'prompt text');
  assert.ok(html.includes('data-prompt-row-visibility'), 'visibility col');
  assert.ok(html.includes('68%'), 'visibility value');
  assert.ok(html.includes('data-prompt-row-sentiment'), 'sentiment col');
  assert.ok(html.includes('8.2'), 'sentiment value');
  assert.ok(html.includes('data-prompt-row-position'), 'position col');
  assert.ok(html.includes('#1'), 'position value');
  assert.ok(html.includes('data-prompt-row-mentions'), 'mentions col');
  assert.ok(html.includes('42'), 'mentions value');
  assert.ok(html.includes('▲'), 'up trend');

  const empty = renderToStaticMarkup(h(PromptPerformanceTable, {}));
  assert.ok(empty.includes('data-prompt-performance-empty'), 'empty state');
});

test('React SSR — ShareAccessDialog people list and copy link', async () => {
  const { default: ShareAccessDialog } = await load('ShareAccessDialog.tsx');
  const html = renderToStaticMarkup(
    h(ShareAccessDialog, {
      open: true,
      title: 'Share Conversation',
      url: 'https://superhuman.com/share/xyz',
      people: [
        { id: 'u1', name: 'Alex Smith', email: 'alex@team.com', role: 'Publisher' },
        { id: 'u2', name: 'Brook Taylor', email: 'brook@team.com' },
      ],
    })
  );
  assert.ok(html.includes('data-share-access-backdrop'), 'backdrop hook');
  assert.ok(html.includes('data-share-access-dialog'), 'dialog hook');
  assert.ok(html.includes('data-share-access-title'), 'title hook');
  assert.ok(html.includes('Share Conversation'), 'title text');
  assert.ok(html.includes('data-share-access-description'), 'description hook');
  assert.ok(html.includes('data-share-access-close'), 'close button');
  assert.ok(html.includes('data-share-access-input'), 'invite input');
  assert.ok(html.includes('data-share-access-people'), 'people hook');
  assert.ok(html.includes('data-access-person="u1"'), 'person hook');
  assert.ok(html.includes('Alex Smith'), 'person name');
  assert.ok(html.includes('alex@team.com'), 'person email');
  assert.ok(html.includes('data-access-person-role'), 'role hook');
  assert.ok(html.includes('Publisher'), 'role text');
  assert.ok(html.includes('AS'), 'initials');
  assert.ok(html.includes('data-access-person-remove'), 'remove action');
  assert.ok(html.includes('data-share-access-url-text'), 'url hook');
  assert.ok(html.includes('https://superhuman.com/share/xyz'), 'url text');
  assert.ok(html.includes('data-share-access-copy'), 'copy CTA');
  assert.ok(html.includes('COPY LINK'), 'copy label');

  const empty = renderToStaticMarkup(h(ShareAccessDialog, { open: true, people: [] }));
  assert.ok(empty.includes('data-share-access-empty'), 'empty state');

  const closed = renderToStaticMarkup(h(ShareAccessDialog, { open: false }));
  assert.ok(!closed.includes('data-share-access-dialog'), 'not rendered when closed');
  const defaults = renderToStaticMarkup(h(ShareAccessDialog, {}));
  assert.ok(!defaults.includes('data-share-access-dialog'), 'closed by default');
});
