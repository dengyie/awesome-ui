/**
 * SSR smoke tests for the v1.20.0 batch
 * (MetricStrip, RankList, SideNav, PageHeader, TimeframePicker).
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
  const target = join(cacheDir, file.replace(/\.tsx$/, '.n20.mjs'));
  writeFileSync(target, transpile(file));
  return import(pathToFileURL(target).href);
};

const h = React.createElement;

test('React SSR — MetricStrip renders values, deltas and tones', async () => {
  const { MetricStrip } = await load('MetricStrip.tsx');
  const html = renderToStaticMarkup(
    h(MetricStrip, {
      metrics: [
        { label: 'visitors', value: '48.2k', delta: 12.4, icon: 'users' },
        { label: 'bounce', value: '31%', delta: -3.1 },
        { label: 'errors', value: '0', delta: 0, deltaLabel: 'flat' },
        { label: 'uptime', value: '99.9%', deltaLabel: 'SLA' },
      ],
      activeIndex: 1,
      onMetricClick: () => {},
    })
  );
  assert.ok(html.includes('48.2k'), 'value');
  assert.ok(html.includes('12.4'), 'delta');
  assert.ok(html.includes('text-emerald-600'), 'positive tone');
  assert.ok(html.includes('text-rose-600'), 'negative tone');
  assert.ok(html.includes('d="m3 17 6-6 4 4 8-8"'), 'trending-up icon path');
  assert.ok(html.includes('d="m3 7 6 6 4-4 8 8"'), 'trending-down icon path');
  assert.ok(html.includes('d="M5 12h14"'), 'minus icon path');
  assert.ok(html.includes('flat'), 'delta label without delta');
  assert.ok(html.includes('SLA'), 'delta label only variant');
  assert.ok(html.includes('aria-current="true"'), 'active metric marked');
  assert.ok(html.includes('d="M9 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0"'), 'users icon rendered as svg');
});

test('React SSR — RankList ratio bars scale to peak and clamp', async () => {
  const { RankList } = await load('RankList.tsx');
  const html = renderToStaticMarkup(
    h(RankList, {
      items: [
        { label: '/pricing', value: '9,214' },
        { label: '/docs', value: '3,102', ratio: 34 },
        { label: '/blog', value: '812', ratio: 9 },
      ],
      title: 'Top pages',
      valueHeader: 'Views',
      showRatio: true,
      onSelect: () => {},
    })
  );
  assert.ok(html.includes('Top pages'), 'title');
  assert.ok(html.includes('Views'), 'value header');
  assert.ok(html.includes('/pricing'), 'row label');
  assert.ok(html.includes('9,214'), 'row value');
  assert.ok(html.includes('calc((100% - 1rem) * 1)'), 'peak row full bar');
  assert.ok(html.includes('cursor-pointer'), 'selectable rows');
  assert.ok(html.includes('role="button"'), 'row button role');
});

test('React SSR — RankList maxItems, empty state and non-selectable rows', async () => {
  const { RankList } = await load('RankList.tsx');
  const html = renderToStaticMarkup(
    h(RankList, {
      items: [
        { label: 'a', value: 1 },
        { label: 'b', value: 2 },
        { label: 'c', value: 3 },
      ],
      maxItems: 2,
      valueHeader: '',
    })
  );
  assert.ok(html.includes('a'), 'first item kept');
  assert.ok(!html.includes('>c<'), 'third item cut by maxItems');
  assert.ok(!html.includes('role="button"'), 'not selectable without onSelect');
});

test('React SSR — RankList empty text', async () => {
  const { RankList } = await load('RankList.tsx');
  const html = renderToStaticMarkup(h(RankList, { items: [], emptyText: 'Nothing ranked yet' }));
  assert.ok(html.includes('Nothing ranked yet'), 'empty text');
});

test('React SSR — SideNav groups, active state and count badges', async () => {
  const { SideNav } = await load('SideNav.tsx');
  const html = renderToStaticMarkup(
    h(SideNav, {
      heading: 'Workspace',
      activeId: 'overview',
      onNavigate: () => {},
      groups: [
        {
          title: 'Main',
          items: [
            { id: 'overview', label: 'Overview', icon: 'eye' },
            { id: 'alerts', label: 'Alerts', icon: 'bell', count: 3 },
            { id: 'archive', label: 'Archive', count: 0 },
          ],
        },
        { items: [{ id: 'settings', label: 'Settings', icon: 'settings' }] },
      ],
    })
  );
  assert.ok(html.includes('Workspace'), 'heading');
  assert.ok(html.includes('Main'), 'group title');
  assert.ok(html.includes('Overview'), 'entry label');
  assert.ok(html.includes('aria-current="page"'), 'active entry marked');
  assert.ok(html.includes('bg-indigo-50'), 'active tone');
  assert.ok(html.includes('bg-rose-100'), 'count > 0 rose badge');
  assert.ok(html.includes('bg-zinc-100'), 'count 0 neutral badge');
  assert.ok(html.includes('aria-label="Workspace"'), 'nav aria label');
});

test('React SSR — PageHeader renders title, status, actions and tabs', async () => {
  const { PageHeader } = await load('PageHeader.tsx');
  const html = renderToStaticMarkup(
    h(PageHeader, {
      title: 'Acme Analytics',
      description: 'Traffic and conversion for the marketing site.',
      statusText: 'Live',
      actions: [
        { label: 'Share', variant: 'ghost', icon: 'external-link' },
        { label: 'New report', variant: 'primary', icon: 'plus' },
      ],
      tabs: [
        { label: 'Overview', count: undefined },
        { label: 'Funnels', count: 4 },
      ],
      activeTab: 'Overview',
      onAction: () => {},
      onTabChange: () => {},
    })
  );
  assert.ok(html.includes('Acme Analytics'), 'title');
  assert.ok(html.includes('Traffic and conversion'), 'description');
  assert.ok(html.includes('Live'), 'status text');
  assert.ok(html.includes('bg-emerald-500'), 'status dot');
  assert.ok(html.includes('bg-indigo-600'), 'primary action');
  assert.ok(html.includes('border-indigo-600'), 'active tab underline');
  assert.ok(html.includes('>4<'), 'tab count badge');
  assert.ok(html.includes('d="M14 5h5v5M19 5l-8 8"'), 'action icon path');
});

test('React SSR — TimeframePicker presets, range label and disabled', async () => {
  const { TimeframePicker } = await load('TimeframePicker.tsx');
  const html = renderToStaticMarkup(
    h(TimeframePicker, { value: '30d', rangeLabel: 'Oct 15 – Nov 14', onStep: () => {} })
  );
  assert.ok(html.includes('Today'), 'default preset');
  assert.ok(html.includes('12mo'), 'last default preset');
  assert.ok(html.includes('aria-pressed="true"'), 'active preset');
  assert.ok(html.includes('aria-pressed="false"'), 'inactive presets');
  assert.ok(html.includes('Oct 15 – Nov 14'), 'range label');
  assert.ok(html.includes('aria-label="Previous period"'), 'step back');
  assert.ok(html.includes('aria-label="Next period"'), 'step forward');
  assert.ok(html.includes('bg-indigo-600'), 'active preset tone');
});

test('React SSR — TimeframePicker disabled and custom presets', async () => {
  const { TimeframePicker } = await load('TimeframePicker.tsx');
  const html = renderToStaticMarkup(
    h(TimeframePicker, { presets: ['24h', '7d'], value: '7d', disabled: true })
  );
  assert.ok(html.includes('24h'), 'custom preset');
  assert.ok(html.includes('disabled'), 'disabled buttons');
  assert.ok(html.includes('opacity-50'), 'disabled styling');
  assert.ok(!html.includes('12mo'), 'default presets replaced');
});
