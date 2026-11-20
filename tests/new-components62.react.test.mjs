/**
 * v3.8.0 batch — React SSR smoke tests
 * MetricLineChart, PaywallDialog, TrialExpiryNotice.
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
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n62.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — MetricLineChart headline, delta and range pills', async () => {
  const { default: MetricLineChart } = await load('MetricLineChart.tsx');
  const html = renderToStaticMarkup(
    h(MetricLineChart, {
      headline: 'Active users',
      value: '48.2k',
      delta: '12.4%',
      deltaTone: 'up',
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      series: [{ name: 'This week', color: '#8b5cf6', values: [20, 34, 28, 45, 52] }],
    })
  );
  assert.ok(html.includes('data-metric-line-chart'));
  assert.ok(html.includes('data-metric-line-title'));
  assert.ok(html.includes('Active users'));
  assert.ok(html.includes('data-metric-line-value'));
  assert.ok(html.includes('48.2k'));
  assert.ok(html.includes('data-metric-line-delta'));
  assert.ok(html.includes('▲ 12.4%'));
  assert.ok(html.includes('data-metric-line-range-option="7d"'));
  assert.ok(html.includes('aria-selected="true"'));
  assert.ok(html.includes('data-metric-line-svg'));
  assert.ok(html.includes('stroke="#8b5cf6"'));
});

test('React SSR — MetricLineChart down delta tone and custom ranges', async () => {
  const { default: MetricLineChart } = await load('MetricLineChart.tsx');
  const html = renderToStaticMarkup(
    h(MetricLineChart, {
      headline: 'Error rate',
      value: '0.8%',
      delta: '0.3%',
      deltaTone: 'down',
      ranges: ['1h', '24h', '7d'],
      defaultRange: '24h',
    })
  );
  assert.ok(html.includes('▼ 0.3%'));
  assert.ok(html.includes('data-metric-line-range-option="1h"'));
  assert.ok(html.includes('data-metric-line-range-option="24h"'));
  const selected = html.match(/aria-selected="true"[^>]*data-metric-line-range-option="24h"/);
  assert.ok(selected, '24h pill should be aria-selected');
});

test('React SSR — PaywallDialog closed by default', async () => {
  const { default: PaywallDialog } = await load('PaywallDialog.tsx');
  const html = renderToStaticMarkup(h(PaywallDialog, {}));
  assert.ok(!html.includes('data-paywall-overlay'), 'closed dialog should not render overlay');
  assert.ok(!html.includes('data-paywall-panel'), 'closed dialog renders nothing');
});

test('React SSR — PaywallDialog open with cadence, plans and discount', async () => {
  const { default: PaywallDialog } = await load('PaywallDialog.tsx');
  const html = renderToStaticMarkup(
    h(PaywallDialog, {
      defaultOpen: true,
      title: 'Upgrade to continue',
      discountBadge: '25% OFF',
      cadenceNote: { Yearly: '-25%' },
      cadencePrices: { pro: { Monthly: '$12', Yearly: '$9' } },
      plans: [
        { id: 'starter', name: 'Starter', price: 'Free', period: '', features: ['10 reports'] },
        { id: 'pro', name: 'Pro', price: '$12', period: '/mo', originalPrice: '$16', badge: 'Most popular', featured: true, features: ['Unlimited reports', 'Priority support'] },
      ],
    })
  );
  assert.ok(html.includes('data-paywall-overlay'));
  assert.ok(html.includes('data-paywall-title'));
  assert.ok(html.includes('Upgrade to continue'));
  assert.ok(html.includes('data-paywall-discount'));
  assert.ok(html.includes('25% OFF'));
  assert.ok(html.includes('data-paywall-cadence-option="Yearly"'));
  assert.ok(html.includes('-25%'));
  assert.ok(html.includes('data-paywall-plan="pro"'));
  assert.ok(html.includes('$12'));
  assert.ok(html.includes('$16'));
  assert.ok(html.includes('Most popular'));
  assert.ok(html.includes('Unlimited reports'));
  assert.ok(html.includes('data-paywall-cta'));
  assert.ok(html.includes('data-paywall-dismiss'));
  assert.ok(html.includes('Maybe later'));
});

test('React SSR — TrialExpiryNotice expiring tone', async () => {
  const { default: TrialExpiryNotice } = await load('TrialExpiryNotice.tsx');
  const html = renderToStaticMarkup(
    h(TrialExpiryNotice, {
      planName: 'Pro',
      daysLeft: 7,
      expiresOn: 'Nov 28',
      losingFeatures: ['Custom reports', 'SSO'],
      keepingFeatures: ['Basic dashboards'],
    })
  );
  assert.ok(html.includes('data-trial-expiry-notice'));
  assert.ok(html.includes('expires in 7 days'));
  assert.ok(html.includes('data-trial-expiry-days'));
  assert.ok(html.includes('>7<'));
  assert.ok(html.includes('Deadline: Nov 28'));
  assert.ok(html.includes('data-trial-expiry-losing'));
  assert.ok(html.includes('Custom reports'));
  assert.ok(html.includes('data-trial-expiry-keeping'));
  assert.ok(html.includes('Basic dashboards'));
  assert.ok(html.includes('data-trial-expiry-upgrade'));
  assert.ok(html.includes('Upgrade now'));
  assert.ok(html.includes('data-trial-expiry-extend'));
  assert.ok(html.includes('bg-amber-500'));
});

test('React SSR — TrialExpiryNotice urgent tone at 2 days and expired', async () => {
  const { default: TrialExpiryNotice } = await load('TrialExpiryNotice.tsx');
  const urgent = renderToStaticMarkup(h(TrialExpiryNotice, { daysLeft: 2 }));
  assert.ok(urgent.includes('expires in 2 days'));
  assert.ok(urgent.includes('bg-red-600'));
  const expired = renderToStaticMarkup(h(TrialExpiryNotice, { daysLeft: 0 }));
  assert.ok(expired.includes('has expired'));
  assert.ok(expired.includes('>0<'));
});
