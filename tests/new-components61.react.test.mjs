/**
 * v3.7.0 batch — React SSR smoke tests
 * CreditBalanceCard, SpendTrendChart, TopUpBalanceDialog.
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
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n61.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — CreditBalanceCard balance, plan badge and actions', async () => {
  const { default: CreditBalanceCard } = await load('CreditBalanceCard.tsx');
  const html = renderToStaticMarkup(h(CreditBalanceCard, { balance: 6.68, currency: '$' }));
  assert.ok(html.includes('data-credit-balance-card'));
  assert.ok(html.includes('data-credit-balance-value'));
  assert.ok(html.includes('$6.68'));
  assert.ok(html.includes('credits'));
  assert.ok(html.includes('Current plan'));
  assert.ok(html.includes('bg-emerald-500'));
  assert.ok(html.includes('data-credit-balance-buy'));
  assert.ok(html.includes('Buy More Credits'));
  assert.ok(html.includes('data-credit-balance-coupon'));
  assert.ok(html.includes('Apply Coupon'));
  assert.ok(!html.includes('data-credit-balance-warning'));
});

test('React SSR — CreditBalanceCard low-balance warning state', async () => {
  const { default: CreditBalanceCard } = await load('CreditBalanceCard.tsx');
  const html = renderToStaticMarkup(h(CreditBalanceCard, { balance: 2.1, warnBelow: 5 }));
  assert.ok(html.includes('data-credit-balance-warning'));
  assert.ok(html.includes('running low'));
  assert.ok(html.includes('bg-amber-500'));
});

test('React SSR — SpendTrendChart bars, total and granularity switch', async () => {
  const { default: SpendTrendChart } = await load('SpendTrendChart.tsx');
  const html = renderToStaticMarkup(
    h(SpendTrendChart, {
      unit: '$',
      points: {
        Daily: [
          { label: '2026-03-01', value: 4.2 },
          { label: '2026-03-02', value: 7.5 },
          { label: '2026-03-03', value: 0 },
        ],
        Weekly: [{ label: '2026-W09', value: 11.7 }],
      },
    })
  );
  assert.ok(html.includes('data-spend-trend-chart'));
  assert.ok(html.includes('data-spend-trend-total'));
  assert.ok(html.includes('$11.70'));
  assert.ok(html.includes('Daily'));
  assert.ok(html.includes('Weekly'));
  assert.ok(html.includes('data-spend-trend-granularity-option="Daily"'));
  assert.ok(html.includes('data-spend-trend-granularity-option="Weekly"'));
  assert.ok(html.includes('data-spend-trend-bar="2026-03-01"'));
  assert.ok(html.includes('aria-selected="true"'));
});

test('React SSR — SpendTrendChart empty state', async () => {
  const { default: SpendTrendChart } = await load('SpendTrendChart.tsx');
  const html = renderToStaticMarkup(h(SpendTrendChart, { points: {} }));
  assert.ok(html.includes('No spend recorded'));
});

test('React SSR — TopUpBalanceDialog trigger closed by default', async () => {
  const { default: TopUpBalanceDialog } = await load('TopUpBalanceDialog.tsx');
  const html = renderToStaticMarkup(h(TopUpBalanceDialog, { balance: 6.68 }));
  assert.ok(html.includes('data-topup-balance-dialog'));
  assert.ok(html.includes('data-topup-open'));
  assert.ok(html.includes('Top up balance'));
  assert.ok(!html.includes('data-topup-overlay'));
});

test('React SSR — TopUpBalanceDialog fields when open', async () => {
  const { default: TopUpBalanceDialog } = await load('TopUpBalanceDialog.tsx');
  const html = renderToStaticMarkup(
    h(TopUpBalanceDialog, {
      defaultOpen: true,
      balance: 6.68,
      billToOptions: ['Acme Inc.', 'Acme Ltd'],
    })
  );
  assert.ok(html.includes('data-topup-overlay'));
  assert.ok(html.includes('data-topup-billto'));
  assert.ok(html.includes('Acme Ltd'));
  assert.ok(html.includes('data-topup-currency'));
  assert.ok(html.includes('USD'));
  assert.ok(html.includes('data-topup-amount'));
  assert.ok(html.includes('data-topup-quick-amount="100"'));
  assert.ok(html.includes('data-topup-summary-value'));
  assert.ok(html.includes('$6.68'));
  assert.ok(html.includes('data-topup-confirm'));
  assert.ok(html.includes('Confirm top-up'));
});
