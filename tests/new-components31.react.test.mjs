/**
 * SSR smoke tests for the v1.31.0 batch
 * (PlanComparisonTable, UpgradeCheckoutPanel, TrialBanner, MembershipTierGrid, AddonPicker).
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
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n31.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — PlanComparisonTable sections, notes and highlight column', async () => {
  const { default: PlanComparisonTable } = await load('PlanComparisonTable.tsx');
  const html = renderToStaticMarkup(
    h(PlanComparisonTable, {
      plans: [
        { id: 'free', name: 'Free' },
        { id: 'pro', name: 'Pro', highlighted: true },
        { id: 'ent', name: 'Enterprise' },
      ],
      sections: [
        {
          id: 'features',
          title: 'Features',
          rows: [
            { id: 'r1', label: 'Issues and cycles', values: [{ value: true }, { value: true }, { value: true }] },
            { id: 'r2', label: 'SSO', values: [{ value: false }, { value: 'G Suite' }, { value: 'G Suite + SAML' }] },
          ],
        },
        {
          id: 'support',
          title: 'Support',
          rows: [
            { id: 'r3', label: 'Priority support', values: [{ value: false }, { value: true }, { value: true }] },
          ],
        },
      ],
      ctaText: 'Choose plan',
    })
  );
  assert.ok(html.includes('data-plan-comparison'), 'host hook');
  assert.ok(html.includes('data-comparison-section="features"'), 'section header');
  assert.ok(html.includes('data-comparison-row="r2"'), 'row hook');
  assert.ok(html.includes('data-comparison-note'), 'note cell rendered');
  assert.ok(html.includes('G Suite + SAML'), 'note text');
  assert.ok(html.includes('data-comparison-cta="pro"'), 'cta hook');
  assert.ok(html.includes('Choose plan'), 'cta text');
  assert.ok(html.includes('data-comparison-check'), 'check cell');
  assert.ok(html.includes('data-comparison-empty'), 'empty cell');
  const proIdx = html.indexOf('data-comparison-plan="pro"');
  const freeIdx = html.indexOf('data-comparison-plan="free"');
  assert.ok(proIdx >= 0 && freeIdx >= 0, 'plan headers');
});

test('React SSR — UpgradeCheckoutPanel seats, periods and summary rows', async () => {
  const { default: UpgradeCheckoutPanel } = await load('UpgradeCheckoutPanel.tsx');
  const html = renderToStaticMarkup(
    h(UpgradeCheckoutPanel, {
      title: 'Upgrade to the Teams plan',
      billingPeriod: 'annual',
      seats: 5,
      lineItems: [
        { id: 'base', label: '5 seats × $6.75', amount: '$405.00' },
        { id: 'list', label: 'List price', amount: '$465.00', strikethrough: true },
      ],
      discount: '13% Annual Discount',
      total: '$405.00 + tax',
      terms: 'You can cancel at any time.',
      confirmText: 'Confirm upgrade',
    })
  );
  assert.ok(html.includes('data-upgrade-checkout'), 'host hook');
  assert.ok(html.includes('data-checkout-title'), 'title hook');
  assert.ok(html.includes('data-checkout-period="annual"'), 'annual period');
  assert.ok(html.includes('data-checkout-period="monthly"'), 'monthly period');
  assert.ok(html.includes('data-checkout-seat-count'), 'seat count');
  assert.ok(html.includes('>5<'), 'seat value 5');
  assert.ok(html.includes('data-checkout-seats'), 'seats block');
  assert.ok(html.includes('data-checkout-total'), 'total hook');
  assert.ok(html.includes('$405.00 + tax'), 'total text');
  assert.ok(html.includes('line-through'), 'strikethrough item');
  assert.ok(html.includes('13% Annual Discount'), 'discount');
  assert.ok(html.includes('data-checkout-confirm'), 'confirm button');
});

test('React SSR — TrialBanner days pill, urgency and dismiss', async () => {
  const { default: TrialBanner } = await load('TrialBanner.tsx');
  const html = renderToStaticMarkup(
    h(TrialBanner, {
      daysLeft: 11,
      planName: 'Scale',
      message: 'What you see is just a glimpse.',
      ctaText: 'Upgrade to Unlock',
      dismissible: false,
    })
  );
  assert.ok(html.includes('data-trial-banner'), 'host hook');
  assert.ok(html.includes('data-trial-days'), 'days pill');
  assert.ok(html.includes('11 days left'), 'days text');
  assert.ok(html.includes('data-trial-message'), 'message hook');
  assert.ok(html.includes('data-trial-cta'), 'cta hook');
  assert.ok(html.includes('Upgrade to Unlock'), 'cta text');
  assert.ok(!html.includes('data-trial-dismiss'), 'no dismiss when not dismissible');

  const urgent = renderToStaticMarkup(h(TrialBanner, { daysLeft: 2, dismissible: true }));
  assert.ok(urgent.includes('2 days left'), 'urgent days');
  assert.ok(urgent.includes('animate-pulse'), 'urgent pulse');
  assert.ok(urgent.includes('data-trial-dismiss'), 'dismiss button');
});

test('React SSR — MembershipTierGrid tiers, limited stock and perks', async () => {
  const { default: MembershipTierGrid } = await load('MembershipTierGrid.tsx');
  const html = renderToStaticMarkup(
    h(MembershipTierGrid, {
      title: 'Get more from Alex',
      tiers: [
        {
          id: 'spark',
          name: 'Spark',
          price: '$2.50',
          limited: 10,
          perks: ['Ad-free content', 'General support'],
        },
        {
          id: 'freedom',
          name: 'Freedom',
          price: '$11.50',
          highlighted: true,
          badge: 'Best value',
          ctaText: 'Start 7-day free trial',
          perks: ['Behind-the-scenes content'],
        },
      ],
    })
  );
  assert.ok(html.includes('data-membership-grid'), 'host hook');
  assert.ok(html.includes('data-membership-title'), 'title hook');
  assert.ok(html.includes('Get more from Alex'), 'title text');
  assert.ok(html.includes('data-membership-tier="spark"'), 'tier hook');
  assert.ok(html.includes('data-membership-price'), 'price hook');
  assert.ok(html.includes('$2.50'), 'price text');
  assert.ok(html.includes('Limited (10 remaining)'), 'limited stock');
  assert.ok(html.includes('data-membership-perks'), 'perks list');
  assert.ok(html.includes('Ad-free content'), 'perk text');
  assert.ok(html.includes('data-membership-cta'), 'cta hook');
  assert.ok(html.includes('Best value'), 'badge');
});

test('React SSR — AddonPicker rows, checked state and total', async () => {
  const { default: AddonPicker } = await load('AddonPicker.tsx');
  const html = renderToStaticMarkup(
    h(AddonPicker, {
      title: 'Add-ons',
      options: [
        { id: 'doc', label: 'Document signing', price: '+$600 / year' },
        { id: 'sso', label: 'SSO / SAML support', contactInstead: true },
        { id: 'locked', label: 'Legacy export', disabled: true },
      ],
      selectedIds: ['doc'],
      totalText: '$3600',
    })
  );
  assert.ok(html.includes('data-addon-picker'), 'host hook');
  assert.ok(html.includes('data-addon-row="doc"'), 'row hook');
  assert.ok(html.includes('data-addon-check'), 'check hook');
  assert.ok(html.includes('Document signing'), 'label');
  assert.ok(html.includes('+$600 / year'), 'price');
  assert.ok(/Let(&#x27;|')s talk/.test(html), 'contact link');
  assert.ok(html.includes('data-addon-total'), 'total hook');
  assert.ok(html.includes('$3600'), 'total text');
  assert.ok(html.includes('aria-checked="true"'), 'checked state');
  assert.ok(html.includes('aria-checked="false"'), 'unchecked state');
});
