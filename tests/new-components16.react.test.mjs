/**
 * SSR smoke tests for the v1.17.0 batch
 * (ComboBox, Navbar, ActivityFeed, UsageMeter).
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
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n16.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — ComboBox renders field and closed listbox', async () => {
  const { ComboBox } = await load('ComboBox.tsx');
  const html = renderToStaticMarkup(
    h(ComboBox, {
      options: [
        { value: 'sonnet', label: 'Claude Sonnet', description: 'Balanced coding model' },
        { value: 'gpt', label: 'GPT-5' },
      ],
      placeholder: 'Pick a model…',
    })
  );

  assert.ok(html.includes('role="combobox"'), 'combobox role');
  assert.ok(html.includes('aria-expanded="false"'), 'closed by default');
  assert.ok(html.includes('aria-controls'), 'listbox link');
  assert.ok(html.includes('Pick a model…'), 'placeholder');
  assert.equal(html.includes('GPT-5'), false, 'options hidden until opened');
  assert.ok(html.includes('viewBox') || html.includes('<svg'), 'search icon present');
});

test('React SSR — Navbar renders brand, links, menus and CTA', async () => {
  const { Navbar } = await load('Navbar.tsx');
  const html = renderToStaticMarkup(
    h(Navbar, {
      brand: 'awesome-ui',
      links: [{ label: 'Docs', href: '/docs' }],
      menus: [
        {
          id: 'product',
          label: 'Product',
          columns: [
            { heading: 'Build', links: [{ label: 'Components', icon: 'layers', badge: 64 }, { label: 'Templates' }] },
            { links: [{ label: 'Changelog', href: '/changelog' }] },
          ],
        },
      ],
      ctaText: 'Get started',
    })
  );

  assert.ok(html.includes('awesome-ui'), 'brand');
  assert.ok(html.includes('href="/docs"'), 'plain link');
  assert.ok(html.includes('aria-expanded="false"'), 'menu closed');
  assert.ok(html.includes('Get started'), 'CTA');
  assert.equal(html.includes('>Components<'), false, 'mega panel hidden while closed');
});

test('React SSR — ActivityFeed renders timeline entries', async () => {
  const { ActivityFeed } = await load('ActivityFeed.tsx');
  const html = renderToStaticMarkup(
    h(ActivityFeed, {
      title: 'Recent activity',
      entries: [
        { id: '1', kind: 'merge', actor: 'Ada', action: 'merged', target: '#42', time: '2m' },
        { id: '2', kind: 'alert', actor: 'Bot', action: 'flagged', time: '1h', detail: 'CPU above 90%' },
      ],
    })
  );

  assert.ok(html.includes('Recent activity'), 'title');
  assert.ok(html.includes('Ada'), 'actor');
  assert.ok(html.includes('#42'), 'target chip');
  assert.ok(html.includes('2m'), 'timestamp');
  assert.ok(html.includes('CPU above 90%'), 'detail line');
  assert.ok(html.includes('bg-emerald-100'), 'merge tone');
  assert.ok(html.includes('bg-rose-100'), 'alert tone');
  assert.equal((html.match(/<li /g) || []).length, 2, 'two entries');
});

test('React SSR — UsageMeter computes ratio and tone', async () => {
  const { UsageMeter } = await load('UsageMeter.tsx');
  const html = renderToStaticMarkup(
    h(UsageMeter, { label: 'Context window', used: 115200, limit: 128000, unit: 'tokens' })
  );

  assert.ok(html.includes('Context window'), 'label');
  assert.ok(html.includes('90%'), 'percent');
  assert.ok(html.includes('bg-rose-500'), 'danger tone bar');
  assert.ok(html.includes('115,200 / 128,000'), 'usage line');
  assert.ok(html.includes('12,800 left'), 'remaining');
});

test('React SSR — UsageMeter ok tone and legend off', async () => {
  const { UsageMeter } = await load('UsageMeter.tsx');
  const html = renderToStaticMarkup(
    h(UsageMeter, { label: 'Seats', used: 3, limit: 10, showLegend: false })
  );
  assert.ok(html.includes('bg-indigo-500'), 'ok tone bar');
  assert.ok(html.includes('30%'), 'percent');
  assert.equal(html.includes('left'), false, 'legend hidden');
});

test('React SSR — usageTone thresholds', async () => {
  const { usageTone } = await load('UsageMeter.tsx');
  assert.equal(usageTone(5, 10), 'ok');
  assert.equal(usageTone(75, 100), 'warning');
  assert.equal(usageTone(95, 100), 'danger');
  assert.equal(usageTone(0, 0), 'danger');
});
