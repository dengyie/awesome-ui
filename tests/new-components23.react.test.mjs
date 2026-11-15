/**
 * SSR smoke tests for the v1.23.0 batch
 * (QuoteMasonry, SiteFooter, MarqueeWall, OnboardingStepper, FilterToolbar).
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
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n23.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — QuoteMasonry cards, quote marks and attribution', async () => {
  const { QuoteMasonry } = await load('QuoteMasonry.tsx');
  const html = renderToStaticMarkup(
    h(QuoteMasonry, {
      quotes: [
        { quote: '45% of our code changes are now fully written by AI.', name: 'Jordan Wei', role: 'CTO', company: 'Hexlab' },
        { quote: 'Review time dropped from days to hours.', name: 'Sam Ortiz', role: 'Eng Lead', company: 'Corely', marked: false },
      ],
    })
  );
  assert.ok(html.includes('45% of our code changes'), 'quote text');
  assert.ok(html.includes('\u201C'), 'quote mark');
  assert.ok(html.includes('JORDAN WEI') || html.includes('Jordan Wei'), 'name');
  assert.ok(html.includes('CTO · Hexlab'), 'role · company');
  assert.ok(html.includes('HEXLAB') || html.includes('Hexlab'), 'company badge');
  assert.ok(html.includes('break-inside-avoid'), 'masonry break rule');
  assert.ok(html.includes('columns-1'), 'responsive columns');
  assert.ok((html.match(/data-quote-index=/g) || []).length === 2, 'two cards');
});

test('React SSR — SiteFooter columns, badges and copyright', async () => {
  const { SiteFooter } = await load('SiteFooter.tsx');
  const html = renderToStaticMarkup(
    h(SiteFooter, {
      columns: [
        { heading: 'Product', links: [{ label: 'Overview' }, { label: 'Pricing', href: '/pricing' }] },
        { heading: 'Legal', links: [{ label: 'Terms' }] },
      ],
      badges: [
        { title: 'SOC 2 Type 1', status: 'In progress', statusTone: 'amber', icon: 'clock' },
        { title: 'GDPR', status: 'Certified', statusTone: 'emerald' },
      ],
      tagline: 'Compliance for AI teams',
      copyright: '© 2026 Runner Labs',
    })
  );
  assert.ok(html.includes('Product'), 'column heading');
  assert.ok(html.includes('Pricing'), 'link label');
  assert.ok(html.includes('SOC 2 Type 1'), 'badge title');
  assert.ok(html.includes('In progress'), 'badge status');
  assert.ok(html.includes('text-amber-400'), 'amber status tone');
  assert.ok(html.includes('text-emerald-400'), 'emerald status tone');
  assert.ok(html.includes('Compliance'), 'badges heading');
  assert.ok(html.includes('© 2026 Runner Labs'), 'copyright');
  assert.ok(html.includes('bg-zinc-950'), 'dark footer surface');
});

test('React SSR — MarqueeWall rows, cards and animation style', async () => {
  const { MarqueeWall } = await load('MarqueeWall.tsx');
  const html = renderToStaticMarkup(
    h(MarqueeWall, {
      rows: [
        [
          { name: 'Ana Silva', handle: 'anadev', text: 'Shipping 2x faster since we switched.' },
          { name: 'Lee Grant', handle: 'leegrant', text: 'The dashboards are unreal.' },
        ],
        [{ name: 'NPS Respondent', text: 'Amazing product. No need to talk to sales reps.', anonymous: true }],
      ],
      speedSeconds: 30,
    })
  );
  assert.ok(html.includes('Ana Silva'), 'card name');
  assert.ok(html.includes('@anadev'), 'handle');
  assert.ok(html.includes('Amazing product. No need to talk to sales reps.'), 'anonymous card text');
  assert.ok(html.includes('marquee-scroll'), 'keyframes animation');
  assert.ok(html.includes('30s linear infinite'), 'speed duration');
  assert.ok(html.includes(' reverse'), 'second row reversed');
  assert.ok(html.includes('data-marquee-row="0"'), 'row 0 marker');
  assert.ok(html.includes('data-marquee-row="1"'), 'row 1 marker');
  assert.ok(html.includes('from-violet-950'), 'gradient backdrop');
});

test('React SSR — OnboardingStepper chain, segments and example rows', async () => {
  const { OnboardingStepper } = await load('OnboardingStepper.tsx');
  const html = renderToStaticMarkup(
    h(OnboardingStepper, {
      steps: ['Security', 'Accounts', 'Transactions', 'Subscription', 'Review'],
      current: 2,
      title: 'Transaction types',
      segments: [
        { label: 'Regular', description: 'Everyday purchases and bill payments.', examples: [{ label: 'Credit card payment', value: '$259.14' }] },
        { label: 'Internal', description: 'Transfers between your own accounts.' },
        { label: 'Income', description: 'Salary, refunds and incoming wires.' },
      ],
    })
  );
  assert.ok(html.includes('Security'), 'first step');
  assert.ok(html.includes('Review'), 'last step');
  assert.ok(html.includes('aria-current="step"'), 'current step marked');
  assert.ok(html.includes('&gt;'), 'chain separator');
  assert.ok(html.includes('Transaction types'), 'title');
  assert.ok(html.includes('role="tab"'), 'segment tabs');
  assert.ok(html.includes('aria-selected="true"'), 'selected segment');
  assert.ok(html.includes('Credit card payment'), 'example row');
  assert.ok(html.includes('$259.14'), 'example value');
  assert.ok(html.includes('width:60%'), 'progress 3 of 5');
  assert.ok(html.includes('Continue'), 'continue label');
});

test('React SSR — FilterToolbar chips, search, view toggle and action', async () => {
  const { FilterToolbar } = await load('FilterToolbar.tsx');
  const html = renderToStaticMarkup(
    h(FilterToolbar, {
      chips: [
        { label: 'Type' },
        { label: 'Risk level', value: 'High', valueTone: 'rose', removable: true },
        { label: 'Owner', value: 'Alex' },
      ],
      searchPlaceholder: 'Search files…',
      view: 'grid',
      viewOnChange: () => {},
      actionLabel: 'Create',
    })
  );
  assert.ok(html.includes('Type'), 'plain chip');
  assert.ok(html.includes('Risk level'), 'value chip label');
  assert.ok(html.includes('High'), 'value pill');
  assert.ok(html.includes('bg-rose-100'), 'rose pill tone');
  assert.ok(html.includes('data-chip-remove'), 'removable button');
  assert.ok(html.includes('Search files…'), 'search placeholder');
  assert.ok(html.includes('data-view-mode="grid"'), 'grid mode button');
  assert.ok(html.includes('aria-pressed="true"'), 'pressed state');
  assert.ok(html.includes('Create'), 'action label');
  assert.ok(html.includes('role="toolbar"'), 'toolbar role');
});
