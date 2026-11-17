/**
 * v3.1.0 batch — React SSR smoke tests
 * InvoiceHistoryTable, UsagePricingBreakdown, CancelRetentionFlow,
 * WebhookConfigPanel.
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

const load = async (file) => {
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n55.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — InvoiceHistoryTable renders rows and paid total', async () => {
  const { default: InvoiceHistoryTable } = await load('InvoiceHistoryTable.tsx');
  const html = renderToStaticMarkup(
    h(InvoiceHistoryTable, {
      invoices: [
        { id: 'INV-1', period: 'November 2026', amount: '100.00', status: 'paid', date: 'Nov 1, 2026' },
        { id: 'INV-2', period: 'October 2026', amount: '50.00', status: 'pending', date: 'Oct 1, 2026' },
      ],
      currency: 'USD',
    }),
  );
  assert.ok(html.includes('INV-1'));
  assert.ok(html.includes('November 2026'));
  assert.ok(html.includes('Paid'));
  assert.ok(html.includes('Pending'));
  assert.ok(html.includes('USD 100.00'));
  assert.ok(html.includes('Paid total'));
});

test('React SSR — UsagePricingBreakdown renders tiers and estimated total', async () => {
  const { default: UsagePricingBreakdown } = await load('UsagePricingBreakdown.tsx');
  const html = renderToStaticMarkup(
    h(UsagePricingBreakdown, {
      tiers: [
        { range: 'Tier A', usage: 1000, unitPrice: 0.01, unit: 'calls' },
        { range: 'Tier B', usage: 0, unitPrice: 0.005 },
      ],
    }),
  );
  assert.ok(html.includes('Tier A'));
  assert.ok(html.includes('Estimated total'));
  assert.ok(html.includes('10.00'));
});

test('React SSR — CancelRetentionFlow renders reasons and step indicator', async () => {
  const { default: CancelRetentionFlow } = await load('CancelRetentionFlow.tsx');
  const html = renderToStaticMarkup(h(CancelRetentionFlow, {}));
  assert.ok(html.includes('Cancel your plan'));
  assert.ok(html.includes('Too expensive'));
  assert.ok(html.includes('Step 1 / 2'));
  assert.ok(html.includes('Continue'));
});

test('React SSR — WebhookConfigPanel renders endpoints and legend', async () => {
  const { default: WebhookConfigPanel } = await load('WebhookConfigPanel.tsx');
  const html = renderToStaticMarkup(h(WebhookConfigPanel, {}));
  assert.ok(html.includes('Webhooks'));
  assert.ok(html.includes('hooks/deploy'));
  assert.ok(html.includes('build.finished'));
  assert.ok(html.includes('Test'));
  assert.ok(html.includes('Available events'));
});
