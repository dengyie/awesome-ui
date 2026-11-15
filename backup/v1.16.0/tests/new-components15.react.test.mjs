/**
 * SSR smoke tests for the v1.16.0 primitives batch
 * (Tooltip, Breadcrumb, Pagination, AlertBanner).
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
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n15.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — Tooltip renders tooltip bubble and describedby link', async () => {
  const { Tooltip } = await load('Tooltip.tsx');
  const html = renderToStaticMarkup(h(Tooltip, { content: 'Copy to clipboard' }, h('button', null, 'Copy')));

  assert.ok(html.includes('role="tooltip"'), 'tooltip role');
  assert.ok(html.includes('Copy to clipboard'), 'content');
  assert.ok(html.includes('Copy'), 'children preserved');
  assert.ok(html.includes('bottom-full'), 'default top side');
  assert.ok(html.includes('group-hover:opacity-100'), 'hover reveal');
  const describedBy = html.match(/aria-describedby="([^"]+)"/);
  assert.ok(describedBy, 'aria-describedby present');
  assert.ok(html.includes(`id="${describedBy[1]}"`), 'id matches describedby');
});

test('React SSR — Tooltip honours the side prop', async () => {
  const { Tooltip } = await load('Tooltip.tsx');
  const html = renderToStaticMarkup(h(Tooltip, { content: 'Next', side: 'right' }, h('span', null, '→')));
  assert.ok(html.includes('left-full'), 'right side class');
  assert.equal(html.includes('bottom-full'), false, 'no top side class');
});

test('React SSR — Breadcrumb renders trail, links and current page', async () => {
  const { Breadcrumb } = await load('Breadcrumb.tsx');
  const html = renderToStaticMarkup(
    h(Breadcrumb, {
      items: [
        { id: 'home', label: 'Home', href: '/', icon: 'globe' },
        { id: 'docs', label: 'Docs', href: '/docs' },
        { id: 'api', label: 'API Reference' },
      ],
    })
  );

  assert.ok(html.includes('aria-label="Breadcrumb"'), 'nav label');
  assert.ok(html.includes('href="/"'), 'home link');
  assert.ok(html.includes('href="/docs"'), 'docs link');
  assert.ok(html.includes('aria-current="page"'), 'current page');
  assert.ok(html.includes('API Reference'), 'last label');
  const api = html.slice(html.indexOf('API Reference'));
  assert.equal(api.includes('<a'), false, 'last item is not a link');
});

test('React SSR — Breadcrumb collapses the middle when maxItems is set', async () => {
  const { Breadcrumb } = await load('Breadcrumb.tsx');
  const html = renderToStaticMarkup(
    h(Breadcrumb, {
      maxItems: 3,
      items: [
        { label: 'One' },
        { label: 'Two' },
        { label: 'Three' },
        { label: 'Four' },
        { label: 'Five' },
      ],
    })
  );

  assert.ok(html.includes('One'), 'first kept');
  assert.ok(html.includes('Four'), 'second-to-last kept');
  assert.ok(html.includes('Five'), 'last kept');
  assert.equal(html.includes('Two'), false, 'middle dropped');
  assert.ok(html.includes('…'), 'ellipsis');
});

test('React SSR — Pagination renders slots, gaps and current page', async () => {
  const { Pagination } = await load('Pagination.tsx');
  const html = renderToStaticMarkup(h(Pagination, { page: 5, pageCount: 12 }));

  assert.ok(html.includes('aria-label="Pagination"'), 'nav label');
  assert.ok(html.includes('aria-current="page"'), 'current marker');
  assert.ok(html.includes('aria-label="Page 5"'), 'page label');
  assert.ok(html.includes('aria-label="First page"'), 'first edge');
  assert.ok(html.includes('aria-label="Last page"'), 'last edge');
  assert.ok(html.includes('…'), 'ellipsis gaps');
  assert.equal((html.match(/>5</g) || []).length, 1, 'single active 5');
  assert.equal(html.includes('>3<'), false, '3 collapsed away');
});

test('React SSR — Pagination disables bounds and can hide edges', async () => {
  const { Pagination } = await load('Pagination.tsx');
  const html = renderToStaticMarkup(
    h(Pagination, { page: 1, pageCount: 4, showEdges: false, siblingCount: 2 })
  );

  assert.equal(html.includes('First page'), false, 'edges hidden');
  assert.equal(html.includes('Last page'), false, 'edges hidden');
  const prevTag = html.match(/<button[^>]*aria-label="Previous page"[^>]*>/);
  assert.ok(prevTag, 'prev present');
  assert.ok(prevTag[0].includes('disabled'), 'prev disabled on first page');
  assert.ok(html.includes('>4<'), 'last page number rendered');
});

test('React SSR — AlertBanner info tone renders status, action and dismiss', async () => {
  const { AlertBanner } = await load('AlertBanner.tsx');
  const html = renderToStaticMarkup(
    h(AlertBanner, {
      title: 'Heads up',
      description: 'A new model is available.',
      actionText: 'Review',
      dismissible: true,
    })
  );

  assert.ok(html.includes('role="status"'), 'status role');
  assert.ok(html.includes('Heads up'), 'title');
  assert.ok(html.includes('A new model is available.'), 'description');
  assert.ok(html.includes('Review'), 'action');
  assert.ok(html.includes('aria-label="Dismiss"'), 'dismiss');
  assert.ok(html.includes('bg-indigo-50'), 'info tone');
  assert.ok(html.includes('dark:bg-indigo-950/40'), 'dark tone');
});

test('React SSR — AlertBanner danger tone uses alert role and no optional controls', async () => {
  const { AlertBanner } = await load('AlertBanner.tsx');
  const html = renderToStaticMarkup(h(AlertBanner, { tone: 'danger', title: 'Delete failed' }));

  assert.ok(html.includes('role="alert"'), 'alert role');
  assert.ok(html.includes('bg-rose-50'), 'danger tone');
  assert.equal(html.includes('aria-label="Dismiss"'), false, 'not dismissible by default');
  assert.equal(html.includes('<button'), false, 'no action button');
});
