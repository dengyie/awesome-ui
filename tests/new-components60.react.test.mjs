/**
 * v3.6.0 batch — React SSR smoke tests
 * BillingAddressForm, UsageCreditsDonut, SeatBillingTable.
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
    .outputText;
};

const load = async (file) => {
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n60.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — BillingAddressForm fields, optional tags and submit', async () => {
  const { default: BillingAddressForm } = await load('BillingAddressForm.tsx');
  const html = renderToStaticMarkup(
    h(BillingAddressForm, {
      defaultValue: { address1: '77 Robinson Rd', city: 'Singapore', zip: '068896' },
    })
  );
  assert.ok(html.includes('data-billing-address-form'));
  assert.ok(html.includes('data-billing-country'));
  assert.ok(html.includes('United States'));
  assert.ok(html.includes('Singapore'));
  assert.ok(html.includes('77 Robinson Rd'));
  assert.ok(html.includes('068896'));
  assert.ok(html.includes('optional'));
  assert.ok(html.includes('data-billing-address-submit'));
  assert.ok(html.includes('disabled'));
  assert.ok(html.includes('data-billing-address-hint'));
});

test('React SSR — BillingAddressForm hides optional rows when showOptional=false', async () => {
  const { default: BillingAddressForm } = await load('BillingAddressForm.tsx');
  const html = renderToStaticMarkup(h(BillingAddressForm, { showOptional: false }));
  assert.ok(html.includes('data-billing-address1'));
  assert.ok(!html.includes('data-billing-address2'));
  assert.ok(!html.includes('data-billing-state'));
});

test('React SSR — UsageCreditsDonut arcs, legend and range select', async () => {
  const { default: UsageCreditsDonut } = await load('UsageCreditsDonut.tsx');
  const html = renderToStaticMarkup(
    h(UsageCreditsDonut, {
      slices: [
        { id: 'chat', label: 'Chat completions', value: 2.4 },
        { id: 'embed', label: 'Embeddings', value: 0.8 },
        { id: 'agent', label: 'Agent runs', value: 0.34 },
      ],
    })
  );
  assert.ok(html.includes('data-usage-donut'));
  assert.ok(html.includes('data-usage-donut-chart'));
  assert.ok(html.includes('data-usage-donut-range'));
  assert.ok(html.includes('Last 7 days'));
  assert.ok(html.includes('data-usage-donut-slice="chat"'));
  assert.ok(html.includes('Chat completions'));
  assert.ok(html.includes('3.54 credits'));
  assert.ok((html.match(/<path /g) || []).length >= 3);
});

test('React SSR — UsageCreditsDonut empty state', async () => {
  const { default: UsageCreditsDonut } = await load('UsageCreditsDonut.tsx');
  const html = renderToStaticMarkup(h(UsageCreditsDonut, { slices: [] }));
  assert.ok(html.includes('data-usage-donut-empty'));
  assert.ok(html.includes('No usage recorded'));
});

test('React SSR — SeatBillingTable rows, badges and total', async () => {
  const { default: SeatBillingTable } = await load('SeatBillingTable.tsx');
  const html = renderToStaticMarkup(
    h(SeatBillingTable, {
      rows: [
        { id: 'u1', user: 'Ada Lovelace', email: 'ada@example.com', seat: 'Admin', cost: 30, usage: '1.2 credits', status: 'active' },
        { id: 'u2', user: 'Grace Hopper', email: 'grace@example.com', seat: 'Member', cost: 20, usage: '0.4 credits', status: 'invited' },
        { id: 'u3', user: 'Old Account', seat: 'Member', cost: 20, status: 'suspended' },
      ],
      period: 'Monthly · Nov 2026',
    })
  );
  assert.ok(html.includes('data-seat-table'));
  assert.ok(html.includes('data-seat-row="u1"'));
  assert.ok(html.includes('data-seat-row="u2"'));
  assert.ok(html.includes('data-seat-row="u3"'));
  assert.ok(html.includes('Ada Lovelace'));
  assert.ok(html.includes('Invited'));
  assert.ok(html.includes('$30.00'));
  assert.ok(html.includes('Monthly · Nov 2026'));
  assert.ok(html.includes('2 billed seats'));
  assert.ok(html.includes('$50.00'));
  assert.ok(html.includes('data-seat-search'));
});

test('React SSR — SeatBillingTable no-search variant', async () => {
  const { default: SeatBillingTable } = await load('SeatBillingTable.tsx');
  const html = renderToStaticMarkup(h(SeatBillingTable, { searchable: false, rows: [] }));
  assert.ok(!html.includes('data-seat-search'));
  assert.ok(html.includes('data-seat-empty'));
  assert.ok(html.includes('No seats billed this period'));
});
