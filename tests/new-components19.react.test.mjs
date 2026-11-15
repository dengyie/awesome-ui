/**
 * SSR smoke tests for the v1.19.0 batch
 * (ProfileHeader, BillingPanel, StepSlider, InboxList, ChangelogFeed).
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
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n19.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — ProfileHeader renders identity, stats and tabs', async () => {
  const { ProfileHeader } = await load('ProfileHeader.tsx');
  const html = renderToStaticMarkup(
    h(ProfileHeader, {
      name: 'Ada Lovelace',
      handle: 'ada',
      headline: 'Analytical engines',
      stats: [
        { label: 'followers', value: '5' },
        { label: 'following', value: '4' },
      ],
      actions: [{ label: 'Edit profile', variant: 'primary' }],
      statusText: 'Available for work',
      tabs: ['Overview', 'Projects', 'Activity'],
      activeTab: 'Projects',
    })
  );
  assert.ok(html.includes('Ada Lovelace'), 'name');
  assert.ok(html.includes('@ada'), 'handle');
  assert.ok(html.includes('Analytical engines'), 'headline');
  assert.ok(html.includes('Edit profile'), 'action');
  assert.ok(html.includes('bg-indigo-600'), 'primary action tone');
  assert.ok(html.includes('Available for work'), 'status');
  assert.ok(html.includes('bg-emerald-500'), 'ok status dot');
  assert.ok(html.includes('followers'), 'stat label');
  assert.ok(html.includes('aria-current="page"'), 'active tab marked');
  assert.ok(html.includes('from-indigo-500'), 'default cover gradient');
});

test('React SSR — ProfileHeader initials fallback and away tone', async () => {
  const { ProfileHeader } = await load('ProfileHeader.tsx');
  const html = renderToStaticMarkup(
    h(ProfileHeader, { name: 'Grace Hopper', statusText: 'Away', statusTone: 'away' })
  );
  assert.ok(html.includes('GH'), 'initials from name');
  assert.ok(html.includes('bg-zinc-400'), 'away dot');
});

test('React SSR — BillingPanel renders price, features and line items', async () => {
  const { BillingPanel } = await load('BillingPanel.tsx');
  const html = renderToStaticMarkup(
    h(BillingPanel, {
      planName: 'Scale',
      price: '$207',
      priceSuffix: 'Per month',
      features: ['No platform fees', 'Priority support'],
      lineItems: [
        { label: 'Subtotal', amount: '$207.00' },
        { label: 'Tax', amount: '$31.05' },
        { label: 'Total', amount: '$238.05', emphasized: true },
      ],
      ctaLabel: 'Confirm and upgrade',
      note: 'Card charged at period end.',
    })
  );
  assert.ok(html.includes('Scale'), 'plan name');
  assert.ok(html.includes('$207'), 'price');
  assert.ok(html.includes('Per month'), 'suffix');
  assert.ok(html.includes('No platform fees'), 'feature');
  assert.ok(html.includes('Subtotal'), 'line item');
  assert.ok(html.includes('$238.05'), 'total');
  assert.ok(html.includes('Confirm and upgrade'), 'cta');
  assert.ok(html.includes('Card charged at period end.'), 'note');
});

test('React SSR — BillingPanel period toggle aria-pressed', async () => {
  const { BillingPanel } = await load('BillingPanel.tsx');
  const html = renderToStaticMarkup(
    h(BillingPanel, { planName: 'Pro', price: '$69', period: 'annual', onPeriodChange: () => {}, ctaLabel: 'Go' })
  );
  assert.ok(html.includes('aria-pressed="true"'), 'one period active');
  assert.ok(html.includes('aria-pressed="false"'), 'other inactive');
});

test('React SSR — StepSlider marks stops and aria values', async () => {
  const { StepSlider } = await load('StepSlider.tsx');
  const html = renderToStaticMarkup(
    h(StepSlider, { steps: ['+0k', '+1k', '+5k', '+10k'], value: 2, label: 'Workflow credits' })
  );
  assert.ok(html.includes('role="slider"'), 'slider role');
  assert.ok(html.includes('aria-valuenow="2"'), 'value now');
  assert.ok(html.includes('aria-valuetext="+5k"'), 'value text');
  assert.ok(html.includes('Workflow credits'), 'label');
  assert.ok(html.includes('+10k'), 'stop label');
  assert.ok((html.match(/border-indigo-600 bg-indigo-600/g) || []).length === 3, 'reached stops filled');
});

test('React SSR — InboxList rows with unread and tags', async () => {
  const { InboxList } = await load('InboxList.tsx');
  const html = renderToStaticMarkup(
    h(InboxList, {
      messages: [
        { id: 1, sender: 'GoDaddy Auctions', subject: 'Request for Refund', snippet: 'Charged without placing a bid', dateLabel: 'AUG 26', unread: true },
        { id: 2, sender: 'Roger de Guzman', tag: 'pitch', subject: 'Do more research in less time', dateLabel: 'AUG 21' },
      ],
    })
  );
  assert.ok(html.includes('GoDaddy Auctions'), 'sender');
  assert.ok(html.includes('Request for Refund'), 'subject');
  assert.ok(html.includes('Charged without placing a bid'), 'snippet');
  assert.ok(html.includes('AUG 26'), 'date');
  assert.ok(html.includes('aria-label="Unread"'), 'unread dot');
  assert.ok(html.includes('>pitch<'), 'tag pill');
  assert.ok(html.includes('bg-rose-100'), 'default tag tone');
});

test('React SSR — InboxList empty state', async () => {
  const { InboxList } = await load('InboxList.tsx');
  const html = renderToStaticMarkup(h(InboxList, { messages: [], emptyText: 'All caught up' }));
  assert.ok(html.includes('All caught up'), 'empty text');
});

test('React SSR — ChangelogFeed badges and footer link', async () => {
  const { ChangelogFeed } = await load('ChangelogFeed.tsx');
  const html = renderToStaticMarkup(
    h(ChangelogFeed, {
      entries: [
        { id: 1, badge: 'new', badgeTone: 'rose', title: 'Ask AI is getting an upgrade', detail: '3 million words a year.' },
        { id: 2, badge: 'new', badgeTone: 'emerald', title: 'Auto Archive exclusions' },
      ],
      footerLink: 'Superhuman updates',
      onFooterClick: () => {},
    })
  );
  assert.ok(html.includes('Latest updates'), 'title');
  assert.ok(html.includes('Ask AI is getting an upgrade'), 'entry title');
  assert.ok(html.includes('3 million words a year.'), 'detail');
  assert.ok(html.includes('bg-rose-100'), 'rose badge');
  assert.ok(html.includes('bg-emerald-100'), 'emerald badge');
  assert.ok(html.includes('Superhuman updates'), 'footer link');
});
